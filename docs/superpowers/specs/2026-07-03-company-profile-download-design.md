# 会社案内資料ダウンロードページ 設計書

日付: 2026-07-03
ステータス: レビュー待ち

## 目的

会社案内資料（PDF）を、以下の2経路で入手した人だけがダウンロードできるようにする。

- **経路A（メール登録）**: サイト上のCTA → Google Form でメールアドレス登録 → 自動返信メールでダウンロードページURLを受け取る
- **経路B（LINE登録）**: LINE登録者に運用者が直接URLを送付する

厳密なアクセス制御は不要。「サイトの通常導線からは到達できない」ことが要件。バックエンドなし・SSGのみという Phase 1 の制約を維持する。

## 全体アーキテクチャ

```
入口A: お問い合わせセクションの「会社案内ダウンロード」ボタン
         → Google Form（メールアドレス入力）
         → Apps Script の onFormSubmit トリガーが自動返信メールでURL送付

入口B: LINE登録者へ手動でURL送付

         ↓ 合流

隠しページ https://kcp-8.com/download/company-profile-{token}/
         → PDF ダウンロードボタン → /documents/{tokenized-filename}.pdf
```

## コンポーネント設計

### 1. 隠しページ `src/pages/download/company-profile-{token}.astro`

- `{token}` は実装時に `openssl rand -hex 4` 等で一度だけ生成した8文字の英数字（例: `a7k2x9f3`）。ソースにハードコードする。
- ページ内容: 会社ロゴ + 挨拶文 + PDFダウンロードボタン + お問い合わせセクションへの誘導リンク。既存の `Layout` と `ui` コンポーネント（`Button` 等）を流用し、サイトのトーンに合わせる。
- `<meta name="robots" content="noindex, nofollow">` を出力する（Layout に noindex オプションがなければ props で追加する）。
- サイト内のどのページからもリンクしない。

### 2. PDF 配置 `public/documents/`

- ユーザー提供の既存PDFを `public/documents/kcp-company-profile-{token}.pdf` に配置（ファイル名にもトークンを含め直接推測を防ぐ）。
- ダウンロードボタンは `<a href download>` でこのファイルを指す。

### 3. 検索エンジン・導線遮断

- `astro.config.mjs` の `sitemap()` に `filter` を追加し、`/download/` 配下をサイトマップから除外する。
- `public/_headers`（Cloudflare Pages のヘッダー設定ファイル、新規作成）で以下を付与:
  ```
  /download/*
    X-Robots-Tag: noindex, nofollow
  /documents/*
    X-Robots-Tag: noindex, nofollow
  ```
- `robots.txt` には **記載しない**（Disallow に書くとURLが露出するため）。
- `public/llms.txt` にも記載しない。

### 4. お問い合わせセクションのCTA追加

- `src/components/sections/Contact.astro` に **任意の** 第二ボタン用 props（`downloadBtnLabel?`, `downloadFormUrl?`）を追加。両方渡されたときだけ secondary variant のボタンを既存ボタンの隣に表示する。
- 日本語トップ（`src/pages/index.astro`）のみ設定。`/en/` は props を渡さないため変化なし（YAGNI）。
- 文言は `src/i18n/ja.ts` の `contact` に追加し、`types.ts` はオプショナルフィールドとして拡張する。

### 5. Google Form + Apps Script（サイト外・運用設定）

- 新規 Google Form: メールアドレス（必須）、会社名・氏名（任意）。
- フォームに紐づく Apps Script で `onFormSubmit` トリガーを設定し、入力アドレス宛に隠しページURLを記載した自動返信メールを送る。
- 登録内容は紐づくスプレッドシートに自動蓄積される（将来のメルマガ用リスト）。
- スクリプト本文と設置手順は `docs/operations/download-form-setup.md` として本リポジトリに残す（リポジトリ内で完結するのはドキュメントのみ。スクリプト自体は Google 側で動く）。

## エラー・エッジケース

- 自動返信が届かない（迷惑メール等）→ 設置手順ドキュメントに件名・送信元の注意書きを記載。フォーム送信完了画面にも「メールが届かない場合はお問い合わせください」と案内文を設定する。
- URLが第三者に転送される → 許容する（要件どおり厳密性は不要）。
- 将来PDFを差し替える場合 → 同名で上書きすればURL維持。トークンごと変えたい場合はページのスラッグとファイル名を変更する。

## テスト

- 純粋ロジックが `src/utils/` に出た場合のみ Vitest（TDD）。本件はサイトマップ filter が `astro.config.mjs` 内のインライン関数で済む見込みのため、ユニットテスト対象は原則なし。
- 手動確認項目:
  - `npm run build` 後、`dist/sitemap-*.xml` に `/download/` が含まれないこと
  - 隠しページのHTMLに `noindex` メタが出力されること
  - PDFがダウンロードできること
  - トップページのCTAボタンが Google Form を開くこと
  - `/en/` のお問い合わせセクションに変化がないこと

## スコープ外

- メールアドレスの厳密な検証・ワンタイムURL・アクセスログ
- 英語版のダウンロード導線
- メルマガ配信基盤
