# 会社案内資料ダウンロードページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通常導線から到達できない会社案内PDFダウンロードページを作り、メール登録（Google Form自動返信）またはLINE経由の直接URL送付でのみアクセス可能にする。

**Architecture:** 推測不能なトークン付きURL `/download/company-profile-8acbfc84/` の隠しページ（noindex・サイトマップ除外・サイト内リンクなし）に PDF を置く。メール登録ゲートは Google Form + Apps Script 自動返信でサイト外に実装し、SSG 制約を維持する。

**Tech Stack:** Astro（既存 PageLayout / Button / i18n を流用）、Cloudflare Pages `_headers`、Google Forms + Apps Script

## Global Constraints

- スペック: `docs/superpowers/specs/2026-07-03-company-profile-download-design.md`
- URLトークンは `8acbfc84` で確定（ページスラッグ・PDFファイル名の両方に使用）
- 隠しページURL: `https://kcp-8.com/download/company-profile-8acbfc84/`
- PDF配信URL: `https://kcp-8.com/documents/kcp-company-profile-8acbfc84.pdf`
- `robots.txt` と `public/llms.txt` には隠しページを**記載しない**（Disallow 記載はURL露出になるため）
- `.astro` コンポーネントはユニットテスト対象外（CLAUDE.md）。検証は `npm run build` + dist 検査で行う
- `/en/` 配下には一切変更を加えない（Contact.astro の新 props はオプショナルにする）
- コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: 隠しページと PDF 配置

**Files:**
- Create: `src/pages/download/company-profile-8acbfc84.astro`
- Create: `public/documents/kcp-company-profile-8acbfc84.pdf`（ユーザー提供PDFのコピー）

**Interfaces:**
- Consumes: `PageLayout`（`noIndex: boolean` prop あり）、`Button`（`variant`, `href`, `target`）
- Produces: URL `/download/company-profile-8acbfc84/` と `/documents/kcp-company-profile-8acbfc84.pdf`（Task 2 の除外設定、Task 3 のドキュメント、Task 4 の自動返信メール本文が参照）

- [x] **Step 1: ユーザーからPDFの現在のパスを確認して配置**

ユーザーに会社案内PDFのローカルパスを確認し、以下を実行:

```bash
mkdir -p public/documents
cp "<ユーザー提供のPDFパス>" public/documents/kcp-company-profile-8acbfc84.pdf
ls -la public/documents/
```

ファイルサイズが 25MiB（Cloudflare Pages の1ファイル上限）未満であることを確認する。超える場合は作業を止めてユーザーに報告する。

- [x] **Step 2: 隠しページを作成**

`src/pages/download/company-profile-8acbfc84.astro`:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import Button from '@/components/ui/Button.astro';

const pdfUrl = '/documents/kcp-company-profile-8acbfc84.pdf';
---

<PageLayout title="会社案内資料ダウンロード" description="株式会社KCPの会社案内資料をダウンロードいただけます。" noIndex={true}>
  <section class="py-section sm:py-section-lg bg-base min-h-[70vh]">
    <div class="section-wrapper">
      <h1 class="text-4xl sm:text-6xl font-black leading-none tracking-tight text-white mb-8">
        会社案内資料
      </h1>
      <div class="h-0.5 bg-white mb-6"></div>
      <p class="text-text-secondary text-sm leading-relaxed max-w-md mb-10">
        この度は株式会社KCPの会社案内資料をご請求いただき、誠にありがとうございます。<br />
        以下のボタンよりダウンロードいただけます。
      </p>
      <Button href={pdfUrl} variant="primary" target="_blank">
        資料をダウンロード（PDF）
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
        </svg>
      </Button>
      <p class="text-text-secondary text-sm leading-relaxed max-w-md mt-10">
        ご不明な点やご相談は<a href="/#contact" class="underline text-white hover:text-gray-300">お問い合わせ</a>よりお気軽にご連絡ください。
      </p>
    </div>
  </section>
</PageLayout>
```

- [x] **Step 3: ビルドして出力を検証**

```bash
npm run build
grep -o '<meta name="robots" content="noindex"' dist/download/company-profile-8acbfc84/index.html
ls dist/documents/kcp-company-profile-8acbfc84.pdf
```

Expected: grep が1件ヒット、PDFが dist に存在。

- [x] **Step 4: 開発サーバーで手動確認**

```bash
npm run preview
```

`http://localhost:4321/download/company-profile-8acbfc84/` を開き、ページ表示とPDFダウンロードボタンの動作を確認する。

- [x] **Step 5: Commit**

```bash
git add src/pages/download/ public/documents/
git commit -m "feat: 会社案内資料の隠しダウンロードページを追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 検索エンジン・導線遮断（サイトマップ除外 + X-Robots-Tag）

**Files:**
- Modify: `astro.config.mjs`（`sitemap()` に filter 追加、25行目付近）
- Create: `public/_headers`

**Interfaces:**
- Consumes: Task 1 のURL `/download/company-profile-8acbfc84/`
- Produces: なし（設定のみ）

- [x] **Step 1: サイトマップから /download/ 配下を除外**

`astro.config.mjs` の `sitemap(),` を以下に変更:

```js
    sitemap({
      filter: (page) => !page.includes('/download/'),
    }),
```

- [x] **Step 2: Cloudflare Pages 用 `_headers` を作成**

`public/_headers`（新規、インデントは半角スペース2つ）:

```
/download/*
  X-Robots-Tag: noindex, nofollow
/documents/*
  X-Robots-Tag: noindex, nofollow
```

- [x] **Step 3: ビルドして検証**

```bash
npm run build
grep -c "download" dist/sitemap-0.xml || echo "OK: sitemap に download なし"
cat dist/_headers
```

Expected: sitemap に `/download/` が含まれない（grep が0件）、`dist/_headers` に上記2ブロックが出力される。

- [x] **Step 4: robots.txt と llms.txt に記載がないことを確認**

```bash
grep -i download public/robots.txt public/llms.txt || echo "OK: 記載なし"
```

Expected: 「OK: 記載なし」（誤って追記されていないことの確認。追記は**しない**）。

- [x] **Step 5: Commit**

```bash
git add astro.config.mjs public/_headers
git commit -m "feat: 隠しページをサイトマップから除外しX-Robots-Tagを付与

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Google Form + Apps Script 設置手順ドキュメント

**Files:**
- Create: `docs/operations/download-form-setup.md`

**Interfaces:**
- Consumes: Task 1 のURL `https://kcp-8.com/download/company-profile-8acbfc84/`
- Produces: 運用者が作成する Google Form の公開URL（Task 4 が CTA リンク先として使用）

- [x] **Step 1: 設置手順ドキュメントを作成**

`docs/operations/download-form-setup.md`:

````markdown
# 会社案内資料請求フォーム 設置手順

会社案内ダウンロードページのURLを自動返信メールで送るための Google Form + Apps Script の設置手順。

## 1. Google Form の作成

1. https://docs.google.com/forms/ で新規フォームを作成。タイトル「会社案内資料のご請求 | 株式会社KCP」
2. 設定タブ → 回答 → 「メールアドレスを収集する」を **「確認済み」または「回答者からの入力」** に設定（必須）
3. 質問を追加（いずれも任意回答で可）:
   - 「会社名」（記述式）
   - 「お名前」（記述式）
4. 設定タブ → プレゼンテーション → 確認メッセージに以下を設定:

   > ご請求ありがとうございます。ご入力いただいたメールアドレス宛に、資料ダウンロードのご案内をお送りしました。数分経っても届かない場合は迷惑メールフォルダをご確認のうえ、お問い合わせフォームよりご連絡ください。

## 2. Apps Script の設置

1. フォーム編集画面右上の「︙」→「スクリプト エディタ」を開く
2. 以下のスクリプトを貼り付けて保存:

```js
const DOWNLOAD_URL = 'https://kcp-8.com/download/company-profile-8acbfc84/';

function onFormSubmit(e) {
  const email = e.response.getRespondentEmail();
  if (!email) return;

  const subject = '【株式会社KCP】会社案内資料のご案内';
  const body = [
    'この度は株式会社KCPの会社案内資料をご請求いただき、誠にありがとうございます。',
    '',
    '以下のURLよりダウンロードいただけます。',
    DOWNLOAD_URL,
    '',
    'ご不明な点がございましたら、お気軽にお問い合わせください。',
    'https://kcp-8.com/#contact',
    '',
    '――――――――――――――――',
    '株式会社KCP',
    'https://kcp-8.com',
  ].join('\n');

  MailApp.sendEmail(email, subject, body, { name: '株式会社KCP' });
}
```

3. エディタ左メニュー「トリガー」→「トリガーを追加」:
   - 実行する関数: `onFormSubmit`
   - イベントのソース: 「フォームから」
   - イベントの種類: 「フォーム送信時」
4. 保存時に Google アカウントの承認を求められるので許可する

## 3. 動作確認

1. フォームのプレビューから自分のメールアドレスでテスト送信
2. 自動返信メールが届き、記載URLからPDFがダウンロードできることを確認
3. 迷惑メールフォルダに入る場合があるため、件名・本文を大きく変えないこと

## 4. サイトへの反映

フォームの「送信」→ リンクアイコンから公開URLを取得し、`src/pages/index.astro` の
`downloadFormUrl` に設定する（実装済みの場合は差し替え）。

## 運用メモ

- 登録されたメールアドレスはフォームに紐づくスプレッドシートに自動蓄積される（メルマガ等に利用可）
- PDF を差し替える場合は `public/documents/kcp-company-profile-8acbfc84.pdf` を同名で上書きすれば URL は変わらない
- LINE 登録者には `DOWNLOAD_URL` をそのまま送付すればよい
````

- [x] **Step 2: Commit**

```bash
git add docs/operations/download-form-setup.md
git commit -m "docs: 資料請求フォームの設置手順書を追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [x] **Step 3: ユーザーに Google Form の作成を依頼し、公開URLを受け取る**

ユーザーに上記ドキュメントの手順1〜3を実施してもらい、フォームの**公開URL**（`https://docs.google.com/forms/d/e/.../viewform` 形式）を受け取る。URLが得られるまで Task 4 に進まない。

---

### Task 4: お問い合わせセクションに「会社案内ダウンロード」CTA を追加

**Files:**
- Modify: `src/i18n/types.ts`（`contact` ブロック、90行目付近）
- Modify: `src/i18n/ja.ts`（`contact` ブロック、143行目付近）
- Modify: `src/components/sections/Contact.astro`
- Modify: `src/pages/index.astro`（`<Contact` 呼び出し、68行目付近）

**Interfaces:**
- Consumes: Task 3 で受け取った Google Form 公開URL
- Produces: `Contact.astro` の新オプショナル props `downloadBtnLabel?: string` / `downloadFormUrl?: string`、`t.contact.downloadBtnLabel`（オプショナル）

- [x] **Step 1: i18n 型定義に任意フィールドを追加**

`src/i18n/types.ts` の `contact` ブロックに追加:

```ts
  contact: {
    label: string;
    heading: string;
    subtext: string;
    btnLabel: string;
    downloadBtnLabel?: string;
  };
```

- [x] **Step 2: 日本語辞書に文言を追加**

`src/i18n/ja.ts` の `contact` ブロックに追加:

```ts
  contact: {
    label: 'Contact',
    heading: 'お問い合わせ',
    subtext:
      'まずはお気軽にご相談ください。\nご要望をお聞きした上で、最適なプランをご提案します。',
    btnLabel: 'お問い合わせフォーム',
    downloadBtnLabel: '会社案内ダウンロード',
  },
```

`src/i18n/en.ts` は変更しない（オプショナルなので型エラーにならない）。

- [x] **Step 3: Contact.astro に第二ボタンを追加**

`src/components/sections/Contact.astro` の Props と描画部を変更。

Props インターフェース:

```astro
export interface Props {
  label: string;
  heading: string;
  subtext: string;
  btnLabel: string;
  formUrl: string;
  downloadBtnLabel?: string;
  downloadFormUrl?: string;
}

const { label, heading, subtext, btnLabel, formUrl, downloadBtnLabel, downloadFormUrl } = Astro.props;
```

既存の `<Button href={formUrl} ...>...</Button>`（40〜45行目）を以下に置き換え（ボタン2つを縦横レスポンシブに並べる）:

```astro
        <div class="flex flex-col sm:flex-row gap-3">
          {downloadBtnLabel && downloadFormUrl && (
            <Button href={downloadFormUrl} variant="outline" target="_blank">
              {downloadBtnLabel}
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </Button>
          )}
          <Button href={formUrl} variant="primary" target="_blank">
            {btnLabel}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </div>
```

- [x] **Step 4: index.astro に props を渡す**

`src/pages/index.astro` の `<Contact` 呼び出しに2行追加（`<Google Form公開URL>` は Task 3 で受け取った実URLに置き換える）:

```astro
  <Contact
    label={t.contact.label}
    heading={t.contact.heading}
    subtext={t.contact.subtext}
    btnLabel={t.contact.btnLabel}
    formUrl="https://docs.google.com/forms/d/e/1FAIpQLSd2ycZEAgr4DpONjfTUOgKXUJ7cZTN5rNKaXy5WdyitG4Wqqg/viewform?usp=dialog"
    downloadBtnLabel={t.contact.downloadBtnLabel}
    downloadFormUrl="<Google Form公開URL>"
  />
```

- [x] **Step 5: ビルドと既存テストで検証**

```bash
npm run build
npm run test
grep -c "会社案内ダウンロード" dist/index.html
grep -c "会社案内ダウンロード" dist/en/index.html || echo "OK: /en/ に変化なし"
```

Expected: ビルド成功、テスト全パス、`dist/index.html` に1件以上、`dist/en/index.html` は0件。

- [x] **Step 6: プレビューで手動確認**

```bash
npm run preview
```

`http://localhost:4321/#contact` でボタン2つの表示（モバイル幅で縦積み）と、ダウンロードボタンが Google Form を新規タブで開くことを確認する。

- [x] **Step 7: Commit**

```bash
git add src/i18n/types.ts src/i18n/ja.ts src/components/sections/Contact.astro src/pages/index.astro
git commit -m "feat: お問い合わせセクションに会社案内ダウンロードCTAを追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
