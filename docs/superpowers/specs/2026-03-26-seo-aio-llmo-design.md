# SEO / AIO / LLMO 技術対策 設計書

| 項目 | 内容 |
|------|------|
| バージョン | 1.0.0 |
| 作成日 | 2026-03-26 |
| ステータス | 確定 |

---

## 1. 目的・背景

KCPコーポレートサイト（Astro SSG + Cloudflare Pages）に対して、以下の3軸で技術的SEO対策を網羅的に実装する。

- **SEO**: 検索エンジン最適化（構造化データ、メタタグ強化、サイトマップ）
- **AIO（AI Overview最適化）**: GoogleのAI Overviewへの露出強化（FAQスキーマ、E-E-A-T強化）
- **LLMO（LLM最適化）**: LLMがサイト情報を正確に取得・引用できる環境整備（llms.txt、AIクローラー許可）

既存実装（canonical、基本OGP、robots.txt、sitemap、RSS）はスコープ外。

---

## 2. 実装スコープ

### 2.1 AIクローラー対応（robots.txt更新）

**方針:** 全AIクローラーを明示的にAllow。

対象クローラー: `GPTBot`、`ClaudeBot`、`Google-Extended`、`PerplexityBot`、`Applebot-Extended`、`CCBot`

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: *
Allow: /

Sitemap: https://kcp.co.jp/sitemap-index.xml
```

### 2.2 llms.txt / llms-full.txt

**llms.txt** (`public/llms.txt`) — 静的ファイル。llmstxt.org仕様準拠。LLMがサイト構造を理解するための構造化テキスト。

```
# 株式会社KCP

> AI時代のBPO企業。AIエージェントを活用した業務代行サービスを提供する。

## サービス
- SNS運用代行、Web・アプリ開発、AI活用研修、メディア運営

## サイト構成
- [トップページ](https://kcp.co.jp/): 会社概要・サービス紹介
- [ブログ](https://kcp.co.jp/blog/): AI活用・業務効率化に関する記事
- [著者プロフィール](https://kcp.co.jp/author/nakanokentaro/): 中野 健太朗のプロフィール
- [RSS](https://kcp.co.jp/rss.xml): 記事フィード

## Optional
- [全記事テキスト](https://kcp.co.jp/llms-full.txt)
```

**llms-full.txt** (`src/pages/llms-full.txt.ts`) — Astro**静的エンドポイント**（`output: 'static'` に対応した `GET()` 関数）。ビルド時に全ブログ記事（draft除外）のタイトル・URL・descriptionを連結して静的ファイルとして生成。記事追加時に自動更新される。

```typescript
export async function GET() {
  // getCollection('blog') で記事一覧を取得し text/plain で返す
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
```

**メンテナンス注意:** `llms.txt`（静的ファイル）に著者ページURLを手書きしているため、著者を追加した際は `llms.txt` も合わせて更新すること。

### 2.3 JSON-LD 構造化データ

**`src/components/seo/JsonLd.astro`** — スキーマオブジェクトを受け取り`<script type="application/ld+json">`として出力する薄いラッパーコンポーネント。

| ページ | スキーマ |
|--------|---------|
| 全ページ（BaseLayout） | `Organization` |
| トップページのみ | `WebSite`（SearchAction付き） |
| ブログ記事 | `Article` + `BreadcrumbList` + `Person`（author） |
| ブログ記事（faq frontmatter有り） | 上記 + `FAQPage` |
| `/author/[slug]/` | `Person`（詳細版）+ `BreadcrumbList` |
| ブログ一覧・タグページ | `BreadcrumbList` |

**Organization スキーマ例:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "株式会社KCP",
  "url": "https://kcp.co.jp",
  "logo": "https://kcp.co.jp/favicon.svg",
  "sameAs": []
}
```

**Article スキーマ例:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "記事タイトル",
  "description": "記事の説明",
  "datePublished": "2026-03-23T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "中野 健太朗",
    "url": "https://kcp.co.jp/author/nakanokentaro/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "株式会社KCP",
    "url": "https://kcp.co.jp"
  }
}
```

### 2.4 BlogLayout OGP強化

`BaseLayout.astro` の Props を拡張し、記事ページ専用のOGPメタを追加する。

**追加Props:**
```typescript
type?: 'website' | 'article';
publishedTime?: Date;
author?: string;
authorUrl?: string;
tags?: string[];
```

**追加されるメタタグ（記事ページのみ）:**
```html
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2026-03-23T00:00:00Z" />
<meta property="article:author" content="https://kcp.co.jp/author/nakanokentaro/" />
<meta property="article:tag" content="AI" />
<meta name="author" content="中野 健太朗" />
<link rel="author" href="https://kcp.co.jp/author/nakanokentaro/" />
```

**レイアウト委譲チェーン:** `BlogLayout` → `PageLayout` → `BaseLayout` の順に委譲している。OGP Props の展開は `BlogLayout.astro` で行い、`PageLayout` を経由して `BaseLayout` に渡す。`BlogLayout` が直接 `BaseLayout` を呼ぶ構造にはしない（Header/Footerが消えるため）。

### 2.5 著者ページ（/author/[slug]/）

**authors Content Collection** を新設。

ファイル: `src/content/authors/nakanokentaro.md`

```yaml
---
name: "中野 健太朗"
role: "代表取締役"
bio: "AIエージェントを活用したBPO企業・株式会社KCP代表。AI活用・業務効率化・Web開発を専門とする。"
avatar: "./nakanokentaro.jpg"   # 省略可（未設定時はプレースホルダー表示）
twitter: ""
github: ""
---
```

`src/content/config.ts` に authorsコレクションのZodスキーマを追加:

```typescript
import { defineCollection, z, reference, image } from 'astro:content';

const authors = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    avatar: image().optional(),
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
  }),
});
```

`image()` はAstroの画像最適化対象（`<Image>` コンポーネントで使用可）。avatarが未設定の場合はプレースホルダーSVGを表示する。

**著者ページのcanonical:** `<link rel="canonical">` はBaseLayoutが `Astro.url.pathname` から自動生成するため、著者ページに特別な対応は不要。

**`src/pages/author/[slug].astro`** のページ構成:
- 著者写真（`<Image>` コンポーネント、`loading="eager"`）
- 名前・役職・bio
- SNSリンク
- その著者が書いた記事一覧（`getCollection('blog')` でfilter）
- Person JSON-LD + BreadcrumbList JSON-LD

### 2.6 MVV セクションのアンカー変更

E-E-A-T観点から `/about/` の代替として `#about` アンカーをトップページに設置する。`/about/` という独立ページを作らずとも、`https://kcp.co.jp/#about` というURLを検索エンジンに示すことで「会社概要コンテンツの所在」をセマンティックに伝えられる。

変更箇所:
1. `src/components/sections/MVV.astro` — セクションの `id` を `mvv` → `about` に変更
2. `src/components/layout/Header.astro` — ナビリンクを `href="#mvv"` → `href="#about"` に変更（表示テキストも「MVV」→「About」に変更）

### 2.7 FAQ frontmatter + FAQPage スキーマ

**`src/content/config.ts`** のblogスキーマに任意フィールドを追加:
```typescript
faq: z.array(z.object({
  question: z.string(),
  answer: z.string(),
})).optional(),
```

**記事frontmatterの使い方（例）:**
```yaml
faq:
  - question: "AIエージェントとは何ですか？"
    answer: "AIエージェントとは、AIが自律的にタスクを実行するシステムです。"
  - question: "導入コストはどれくらいですか？"
    answer: "ご要望に応じてご提案します。まずはお問い合わせください。"
```

**`src/pages/blog/[slug].astro`** での処理:
- `post.data.faq` が存在する場合のみFAQセクションをレンダリング
- FAQPage JSON-LDをページに追加
- FAQの表示スタイル: `<details>/<summary>` による折りたたみUI

**FAQPage JSON-LD 完全例:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "AIエージェントとは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AIエージェントとは、AIが自律的にタスクを実行するシステムです。"
      }
    },
    {
      "@type": "Question",
      "name": "導入コストはどれくらいですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ご要望に応じてご提案します。まずはお問い合わせください。"
      }
    }
  ]
}
```

### 2.8 画像最適化規約

**Markdownブログ記事内のローカル画像**: Astro 3.3以降（4.x含む）のContent Collectionsでは、`src/content/blog/` 配下に画像を置き `![alt](./image.png)` と相対パスで参照するだけで自動的にWebP変換・srcset生成が行われる。`experimental` フラグや追加設定は不要。外部URL（`https://...`）画像は最適化対象外。

**Astroコンポーネント内の画像規約**（CLAUDE.mdに追記）:
- `<img>` タグを直接使わず、必ず `<Image>` (`astro:assets`) を使用
- `alt` 属性は必須（空文字不可）
- ファーストビュー画像: `loading="eager" fetchpriority="high"`
- その他の画像: デフォルト（`loading="lazy"`）

---

## 3. ファイル変更一覧

| # | ファイル | 変更種別 |
|---|---------|---------|
| 1 | `public/robots.txt` | 更新 |
| 2 | `public/llms.txt` | 新規 |
| 3 | `src/pages/llms-full.txt.ts` | 新規 |
| 4 | `src/components/seo/JsonLd.astro` | 新規 |
| 5 | `src/layouts/BaseLayout.astro` | 更新 |
| 6 | `src/layouts/BlogLayout.astro` | 更新 |
| 7 | `src/content/config.ts` | 更新 |
| 8 | `src/content/authors/nakanokentaro.md` | 新規 |
| 9 | `src/pages/author/[slug].astro` | 新規 |
| 10 | `src/components/sections/MVV.astro` | 更新（id: mvv → about） |
| 11 | `src/components/layout/Header.astro` | 更新（#mvv → #about） |
| 12 | `CLAUDE.md` | 更新（画像規約追記） |

---

## 4. 非スコープ（意図的に除外）

| 項目 | 理由 |
|------|------|
| hreflang | Phase 3（多言語対応）まで不要 |
| OGP画像の自動生成（Satori） | Phase 2に記載済み |
| 構造化データのテスト自動化 | 静的サイトのため手動確認で十分 |
| GA4 | Cloudflare Analyticsで代替（Phase 1方針） |
| 検索機能（Pagefind） | Phase 5スコープ |
