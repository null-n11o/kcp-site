# Rich UI Refresh — Kinetic Swiss

**Date:** 2026-07-02
**Scope:** 全ページの UI リッチ化（LP 日英・ブログ・サービスページ・プレス・404）＋ハードコード色のトークン化リファクタリング。コンテンツ・機能・URL 構造は変更なし。i18n は既存文言を変更せず、Footer 用の新規キー（§3.3）のみ追加。

---

## 1. デザイン方針

### コンセプト
**Kinetic Swiss** — 2026-04 の「Swiss Modernist Dark」の骨格（グリッド・水平ルール・モノスペース番号・ダーク単色背景）を維持したまま、モーションとタイポグラフィのスケール感でデザイン事務所レベルのリッチさを加える。

### 決定事項（ユーザー確認済み）
| 項目 | 決定 |
|---|---|
| ベースカラー | 現サイトの青系（`#0a0a0a` ダーク + アクセント `#4a9eff`）を維持 |
| 方向性 | モーションを少し入れつつ、現在のスイス・モダニズムを磨く |
| 適用範囲 | 全ページ |
| 技術方針 | 表示スピード最優先。外部 JS ライブラリは追加しない（CSS + Intersection Observer + インライン JS）。※AFK のため推奨案で確定 |

### 守るもの（前回刷新の原則を継承）
- 背景は単色のみ（radial-gradient・グリッドオーバーレイ・グロー禁止）
- `rounded-none`（シャープボーダー）
- カードの `hover:-translate-y` 禁止（ホバーは色・ボーダー・矢印スライドまで）
- アクセントブルーはラベル・番号・細線・ホバー限定

---

## 2. モーションシステム（依存ゼロ）

### 2.1 `Reveal.astro`（`FadeIn.astro` を置換・拡張）

`variant` prop で表現を切り替える単一コンポーネント。IO（Intersection Observer）スクリプトは 1 つに集約。

| variant | 表現 | 主な用途 |
|---|---|---|
| `fade-up`（default） | 透明 + 24px 下から。現行 FadeIn と同等だがイージング・時間を刷新 | 汎用 |
| `lines` | 行単位のクリップリベール（`clip-path: inset(0 0 100% 0)` → `inset(0)`、行ごとに 90ms ディレイ） | Hero・Contact の大見出し |
| `stagger` | 直下の子要素を 60–80ms 間隔で順次 fade-up | Service / Strength / Values の行リスト、ブログカードグリッド |
| `line` | 水平ルールが `scaleX(0)` → `scaleX(1)`（transform-origin: left） | セクション見出し下・Hero/Contact の太ルール |

- **イージング:** `cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint 系）、duration 0.8s に統一
- **`prefers-reduced-motion: reduce`:** すべてのアニメーションを無効化し即時表示（現行は未対応 → 新規対応）
- 既存の `FadeIn` 使用箇所はすべて `Reveal` に移行し、`FadeIn.astro` は削除

### 2.2 Hero ロード演出（IO 不使用、ページロード時 CSS アニメーション）

1. 見出し 3 行が上から順にクリップリベール（各 +120ms）
2. 太ルール（`border-t-2`）が左から `scaleX` で伸長
3. サブテキストと CTA が fade-up

### 2.3 マーキー（純 CSS）

Hero 下端にキーワードストリップ（例: `AI Consulting — SNS Marketing — IT Support — Japan Entry —`）を無限ループ。`@keyframes marquee` + コンテンツ 2 連結。モノスペース・uppercase・`text-text-muted`、区切りにアクセントブルーの `—`。`prefers-reduced-motion` では静止。i18n: ja/en とも英語表記（装飾テキスト扱い、`aria-hidden="true"`）。

### 2.4 Header スクロール挙動

- 下スクロールで隠れ、上スクロールで現れる（`transform: translateY(-100%)` + transition。インライン JS 約 15 行）
- ヘッダー上端に 2px のスクロール進捗バー（アクセントブルー、`scaleX` を scroll イベントで更新、`requestAnimationFrame` スロットル）
- ナビリンクのホバー: 下線が左からスライドイン（`::after` の `scaleX`）
- backdrop-blur は引き続き不使用

---

## 3. タイポグラフィ / レイアウトの磨き込み

### 3.1 SectionHeading の強化

現行（小さな mono ラベル 1 行のみ）に**大型セクションタイトル**と**ゴースト数字**を追加:

```
┌─────────────────────────────────────┐
│ 02 — SERVICE            ← mono ラベル（現行踏襲）
│ ─────────────────────── ← 罫線（line リベール）
│                    ⌈02⌉ ← ゴースト数字（=セクション番号）: text-[7rem]+
│ 事業内容              │    font-black text-white/[0.04]
│ ↑ text-4xl〜6xl        │    右上に絶対配置
│   font-black           │
└─────────────────────────────────────┘
```

- Props: `sectionNumber` / `sectionLabel`（mono ラベル）/ `title`（大型タイトル、省略可）
- i18n の既存 heading 文言を `title` に流用（新規文言なし）

### 3.2 セクション余白

`spacing.section` を `5rem` → レスポンシブ化（モバイル `5rem` / `sm:` 以上 `7.5rem`）。`py-section` 利用箇所は変更不要（Tailwind トークン側で吸収）。

### 3.3 Footer の再設計

現行（中央寄せ 3 行）→ デザイン事務所型:

```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━ border-t-2 white│
│ [Logo + 社名大型表記]    NAV   PRESS │
│                                     │
│ © 2026 KCP        [Back to top ↑]  │
└─────────────────────────────────────┘
```

- 左: ロゴ + `font-black` の大型社名
- 右: ナビリンク列（Service / About / Blog / Company / Contact / Press）
- 下段: コピーライト + ページトップへ戻るリンク
- 文言は既存 i18n の nav を再利用（新規キー不要。「Back to top」は ja「トップへ戻る」/ en「Back to top」を `footer` に追加）

---

## 4. マイクロインタラクション

| 対象 | 演出 |
|---|---|
| Service / Strength 行 | ホバーで背景 `#141414`、番号が `text-accent/40` → `text-accent`、右端に `→` がスライドイン（`opacity` + `translateX`）。`href` がある行は行全体をリンク化（stretched-link） |
| Button | `→` / 外部リンクアイコンがホバーで `translateX(4px)`。primary は白のまま（色変更なし） |
| PostCard（card） | ホバーで `border-accent/40`（現行）+ タイトル下線スライド + 日付横の `→` スライドイン |
| PostCard（row） | ホバーで背景 `#141414` + 日付が accent に |
| Company テーブル | 行ホバーで背景ハイライト |
| テキスト選択 | `::selection { background: accent; color: #0a0a0a }` |
| フォーカス | `focus-visible` リングを accent に統一（現行 white） |

---

## 5. リファクタリング（デザイン変更と同時に実施）

### 5.1 色のトークン化
tailwind.config.mjs にトークンが定義済みなのに、コンポーネント側はハードコード多数（`border-[#2a2a3e]`、`bg-[#141414]`、`style="background-color: #0a0a0a"` 等）。すべて Tailwind トークン（`border-border` / `bg-base-100` / `bg-base` 等）へ置換し、インライン `style` 属性を全廃する。

- 背景サブ `#0e0e0e` は新トークン `base-50: '#0e0e0e'` として追加

### 5.2 コンポーネント統一
- Contact がインラインで再実装しているセクション見出しを `SectionHeading` に統一
- `FadeIn` → `Reveal` に置換（全 import 更新）、`FadeIn.astro` 削除
- セクション共通の「wrapper + SectionHeading」パターンは現状維持（過剰な抽象化はしない）

### 5.3 対象外
- `src/utils/` / `src/plugins/` のロジック、i18n 構造、コンテンツスキーマは触らない

---

## 6. ページ別適用

| ページ | 適用内容 |
|---|---|
| LP（ja / en） | 上記すべて（Hero ロード演出・マーキー・SectionHeading 強化・行ホバー・Footer） |
| ブログ一覧 / タグ | BlogHero に大型タイポ + lines リベール、PostCard ホバー強化、グリッドに stagger |
| ブログ記事 | 記事ヘッダー（タイトル・メタ）に lines リベール。prose 本文は現状維持 |
| サービスページ ×3 / japan-entry | セクション見出し・Reveal・ホバーを共通コンポーネント経由で自動適用 + ページ固有のハードコード色をトークン化 |
| プレス一覧 / 記事 | 同上（共通コンポーネントの変更が波及） |
| 404 | 大型タイポ化（`404` をゴースト数字スタイルで） |

---

## 7. パフォーマンス / アクセシビリティ予算

- **追加 JS:** インラインスクリプト合計 +2KB 以下（Header スクロール挙動 + Reveal の IO）。外部ライブラリ 0
- **CLS:** リベール系は `opacity` / `transform` / `clip-path` のみ使用（レイアウトシフトなし）
- **Lighthouse:** Performance / Accessibility / SEO 現状スコアを維持（実装後に `npm run build` + preview で確認）
- **`prefers-reduced-motion`:** 全モーション無効化に対応
- マーキーは `aria-hidden="true"`（装飾）

---

## 8. テスト方針

- `src/utils/` に変更なし → 既存 Vitest テストが引き続きグリーンであることを確認
- Astro コンポーネントは方針どおりテスト対象外。`npm run build` の成功 + `npm run preview` での手動確認（LP ja/en・ブログ一覧・記事・サービスページ・404）
- 確認観点: ①モーションの動作 ②reduced-motion 時の即時表示 ③モバイルメニュー ④ヘッダーのスクロール挙動 ⑤全ページで色の視覚的リグレッションがないこと
