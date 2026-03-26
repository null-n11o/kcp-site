# SEO / AIO / LLMO 技術対策 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Astro SSG + Cloudflare Pages で構築された KCP コーポレートサイトに SEO / AIO / LLMO の技術的対策を網羅実装する。

**Architecture:** 純粋関数（JSON-LD スキーマビルダー、llms テキスト生成）を `src/utils/` に TDD で実装し、Astro コンポーネント・レイアウトから利用する。静的ファイル（robots.txt / llms.txt）は直接更新。llms-full.txt は Astro 静的エンドポイントで自動生成。

**Tech Stack:** Astro 4.x（astro:assets / Content Collections）, TypeScript strict, Tailwind CSS, Vitest（utils のみ）, schema.org JSON-LD

**Spec:** `docs/superpowers/specs/2026-03-26-seo-aio-llmo-design.md`

---

## File Map

| ファイル | 種別 | 役割 |
|---------|------|------|
| `public/robots.txt` | 更新 | AI クローラー明示 Allow |
| `public/llms.txt` | 新規 | LLM 向けサイト概要（静的） |
| `src/utils/schema.ts` | 新規 | JSON-LD スキーマビルダー（純粋関数・テスト対象） |
| `src/utils/schema.test.ts` | 新規 | schema.ts のユニットテスト |
| `src/utils/llms.ts` | 新規 | llms-full.txt コンテンツ生成（純粋関数・テスト対象） |
| `src/utils/llms.test.ts` | 新規 | llms.ts のユニットテスト |
| `src/components/seo/JsonLd.astro` | 新規 | JSON-LD `<script>` ラッパー |
| `src/pages/llms-full.txt.ts` | 新規 | llms-full.txt 静的エンドポイント |
| `src/content/config.ts` | 更新 | authors コレクション追加・blog に faq フィールド追加 |
| `src/content/authors/nakanokentaro.md` | 新規 | 著者データ |
| `src/layouts/BaseLayout.astro` | 更新 | OGP 拡張・JSON-LD 注入（Organization / WebSite / Article / BreadcrumbList） |
| `src/layouts/PageLayout.astro` | 更新 | 新 Props のパススルー |
| `src/layouts/BlogLayout.astro` | 更新 | article OGP・breadcrumbs・FAQ JSON-LD を PageLayout へ展開して渡す |
| `src/pages/blog/index.astro` | 更新 | breadcrumbs prop 追加 |
| `src/pages/blog/tags/index.astro` | 更新 | breadcrumbs prop 追加 |
| `src/pages/blog/tags/[tag].astro` | 更新 | breadcrumbs prop 追加 |
| `src/pages/author/[slug].astro` | 新規 | 著者プロフィールページ |
| `src/components/sections/MVV.astro` | 更新 | id="mvv" → id="about" |
| `src/components/layout/Header.astro` | 更新 | #mvv → #about |
| `CLAUDE.md` | 更新 | 画像最適化規約追記 |

---

## Task 1: robots.txt 更新 + llms.txt 新規作成

**Files:**
- Modify: `public/robots.txt`
- Create: `public/llms.txt`

- [x] **Step 1: robots.txt を AI クローラー明示 Allow に更新**

`public/robots.txt` の内容を以下に置き換える:

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

- [x] **Step 2: llms.txt を新規作成**

`public/llms.txt` を作成:

```
# 株式会社KCP

> AI時代のBPO企業。AIエージェントを活用した業務代行（BPO）・SNS運用代行・Web開発・AI活用研修・メディア運営を提供する。

## 会社情報
- 会社名: 株式会社KCP
- 代表者: 中野 健太朗
- 設立: 2026年4月（予定）
- 所在地: 東京都世田谷区

## サービス
- SNS運用代行（AI自動化活用）
- Web・アプリ受託開発
- AI活用研修（企業向け）
- メディア運営（AI・業務効率化ブログ）

## サイト構成
- [トップページ](https://kcp.co.jp/): 会社概要・サービス紹介・MVV
- [ブログ](https://kcp.co.jp/blog/): AI活用・業務効率化に関する記事
- [著者プロフィール](https://kcp.co.jp/author/nakanokentaro/): 中野 健太朗のプロフィール
- [RSS](https://kcp.co.jp/rss.xml): 記事フィード
- [サイトマップ](https://kcp.co.jp/sitemap-index.xml)

## Optional
- [全記事テキスト](https://kcp.co.jp/llms-full.txt)
```

- [x] **Step 3: コミット**

```bash
git add public/robots.txt public/llms.txt
git commit -m "feat: add AI crawler permissions and llms.txt"
```

---

## Task 2: schema.ts ユーティリティ（TDD）

**Files:**
- Create: `src/utils/schema.ts`
- Create: `src/utils/schema.test.ts`

- [x] **Step 1: テストを先に書く**

`src/utils/schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildArticleSchema,
  buildPersonSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getAuthorSlug,
} from './schema';

describe('buildOrganizationSchema', () => {
  it('returns Organization schema with correct fields', () => {
    const schema = buildOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('株式会社KCP');
    expect(schema.url).toBe('https://kcp.co.jp');
  });
});

describe('buildWebSiteSchema', () => {
  it('returns WebSite schema', () => {
    const schema = buildWebSiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe('https://kcp.co.jp');
  });
});

describe('buildArticleSchema', () => {
  it('returns Article schema with all required fields', () => {
    const schema = buildArticleSchema({
      title: 'テスト記事',
      description: 'テスト説明',
      datePublished: new Date('2026-03-23T00:00:00Z'),
      authorName: '中野 健太朗',
      authorUrl: 'https://kcp.co.jp/author/nakanokentaro/',
      pageUrl: 'https://kcp.co.jp/blog/test-post/',
    });
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('テスト記事');
    expect(schema.datePublished).toBe('2026-03-23T00:00:00.000Z');
    expect((schema.author as Record<string, string>).name).toBe('中野 健太朗');
    expect((schema.author as Record<string, string>).url).toBe('https://kcp.co.jp/author/nakanokentaro/');
    expect((schema.publisher as Record<string, string>).name).toBe('株式会社KCP');
  });
});

describe('buildPersonSchema', () => {
  it('returns Person schema with required fields', () => {
    const schema = buildPersonSchema({
      name: '中野 健太朗',
      url: 'https://kcp.co.jp/author/nakanokentaro/',
    });
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('中野 健太朗');
    expect(schema.url).toBe('https://kcp.co.jp/author/nakanokentaro/');
  });

  it('includes optional fields when provided', () => {
    const schema = buildPersonSchema({
      name: '中野 健太朗',
      url: 'https://kcp.co.jp/author/nakanokentaro/',
      jobTitle: '代表取締役',
      description: 'KCP 代表',
      sameAs: ['https://x.com/test'],
    });
    expect(schema.jobTitle).toBe('代表取締役');
    expect(schema.description).toBe('KCP 代表');
    expect(schema.sameAs).toEqual(['https://x.com/test']);
  });

  it('omits optional fields when not provided', () => {
    const schema = buildPersonSchema({ name: 'Test', url: 'https://example.com' });
    expect('jobTitle' in schema).toBe(false);
    expect('description' in schema).toBe(false);
    expect('sameAs' in schema).toBe(false);
  });
});

describe('buildBreadcrumbSchema', () => {
  it('returns BreadcrumbList schema with correct items', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'ホーム', url: 'https://kcp.co.jp/' },
      { name: 'ブログ', url: 'https://kcp.co.jp/blog/' },
      { name: 'テスト記事', url: 'https://kcp.co.jp/blog/test/' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[0].name).toBe('ホーム');
    expect(items[2].position).toBe(3);
    expect(items[2].name).toBe('テスト記事');
  });
});

describe('buildFaqPageSchema', () => {
  it('returns FAQPage schema with Question/Answer entities', () => {
    const schema = buildFaqPageSchema([
      { question: 'Q1は何ですか？', answer: 'A1です。' },
      { question: 'Q2は何ですか？', answer: 'A2です。' },
    ]);
    expect(schema['@type']).toBe('FAQPage');
    const entities = schema.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]['@type']).toBe('Question');
    expect(entities[0].name).toBe('Q1は何ですか？');
    const answer = entities[0].acceptedAnswer as Record<string, unknown>;
    expect(answer['@type']).toBe('Answer');
    expect(answer.text).toBe('A1です。');
  });
});

describe('getAuthorSlug', () => {
  it('maps 中野健太朗 to nakanokentaro', () => {
    expect(getAuthorSlug('中野健太朗')).toBe('nakanokentaro');
  });

  it('maps 中野 健太朗 (with space) to nakanokentaro', () => {
    expect(getAuthorSlug('中野 健太朗')).toBe('nakanokentaro');
  });

  it('returns lowercase fallback for unknown names', () => {
    expect(getAuthorSlug('山田 太郎')).toBe('山田太郎');
  });
});
```

- [x] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/utils/schema.test.ts
```

期待: FAIL（`./schema` が存在しないため）

- [x] **Step 3: schema.ts を実装**

`src/utils/schema.ts`:

```typescript
const SITE_URL = 'https://kcp.co.jp';
const ORG_NAME = '株式会社KCP';

export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [] as string[],
  };
}

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  datePublished: Date;
  authorName: string;
  authorUrl: string;
  pageUrl: string;
}

export function buildArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished.toISOString(),
    url: input.pageUrl,
    author: {
      '@type': 'Person',
      name: input.authorName,
      url: input.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    },
  };
}

export interface PersonSchemaInput {
  name: string;
  url: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
}

export function buildPersonSchema(input: PersonSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: input.url,
  };
  if (input.jobTitle) schema.jobTitle = input.jobTitle;
  if (input.description) schema.description = input.description;
  if (input.sameAs && input.sameAs.length > 0) schema.sameAs = input.sameAs;
  return schema;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPageSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

const AUTHOR_SLUG_MAP: Record<string, string> = {
  '中野健太朗': 'nakanokentaro',
  '中野 健太朗': 'nakanokentaro',
};

export function getAuthorSlug(authorName: string): string {
  return AUTHOR_SLUG_MAP[authorName] ?? authorName.replace(/\s+/g, '');
}
```

- [x] **Step 4: テストが通ることを確認**

```bash
npx vitest run src/utils/schema.test.ts
```

期待: PASS（全テスト）

- [x] **Step 5: コミット**

```bash
git add src/utils/schema.ts src/utils/schema.test.ts
git commit -m "feat: add JSON-LD schema builder utilities"
```

---

## Task 3: llms.ts ユーティリティ（TDD）

**Files:**
- Create: `src/utils/llms.ts`
- Create: `src/utils/llms.test.ts`

- [x] **Step 1: テストを先に書く**

`src/utils/llms.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateLlmsFullContent } from './llms';

const makeMockPost = (slug: string, title: string, description: string, tags: string[], pubDate: Date) => ({
  slug,
  data: { title, description, pubDate, tags },
});

describe('generateLlmsFullContent', () => {
  it('generates header lines', () => {
    const content = generateLlmsFullContent([]);
    expect(content).toContain('# 株式会社KCP');
    expect(content).toContain('LLM向け');
  });

  it('includes post title and URL', () => {
    const posts = [makeMockPost('my-post', 'テスト記事タイトル', 'テスト説明', ['AI'], new Date('2026-01-15'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('## テスト記事タイトル');
    expect(content).toContain('https://kcp.co.jp/blog/my-post/');
  });

  it('includes post description', () => {
    const posts = [makeMockPost('post-a', 'タイトル', 'これは説明文です', ['AI'], new Date('2026-01-15'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('これは説明文です');
  });

  it('includes publication date in ISO format', () => {
    const posts = [makeMockPost('post-a', 'タイトル', '説明', [], new Date('2026-03-23'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('2026-03-23');
  });

  it('includes tags when present', () => {
    const posts = [makeMockPost('post-a', 'タイトル', '説明', ['AI', '業務効率化'], new Date('2026-01-15'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('AI, 業務効率化');
  });

  it('separates multiple posts with ---', () => {
    const posts = [
      makeMockPost('post-a', 'A', '説明A', [], new Date('2026-01-01')),
      makeMockPost('post-b', 'B', '説明B', [], new Date('2026-01-02')),
    ];
    const content = generateLlmsFullContent(posts as any);
    const separators = (content.match(/^---$/gm) ?? []).length;
    expect(separators).toBe(2);
  });
});
```

- [x] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/utils/llms.test.ts
```

期待: FAIL（`./llms` が存在しないため）

- [x] **Step 3: llms.ts を実装**

`src/utils/llms.ts`:

```typescript
const SITE_URL = 'https://kcp.co.jp';

interface LlmsPost {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
  };
}

export function generateLlmsFullContent(posts: LlmsPost[]): string {
  const lines: string[] = [
    '# 株式会社KCP - 全記事テキスト',
    '',
    '> このファイルはLLM向けに自動生成されています。最新情報は https://kcp.co.jp/blog/ を参照してください。',
    '',
  ];

  for (const post of posts) {
    const dateStr = post.data.pubDate.toISOString().split('T')[0];
    lines.push(`## ${post.data.title}`);
    lines.push(`URL: ${SITE_URL}/blog/${post.slug}/`);
    lines.push(`公開日: ${dateStr}`);
    if (post.data.tags.length > 0) {
      lines.push(`タグ: ${post.data.tags.join(', ')}`);
    }
    lines.push('');
    lines.push(post.data.description);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
```

- [x] **Step 4: テストが通ることを確認**

```bash
npx vitest run src/utils/llms.test.ts
```

期待: PASS（全テスト）

- [x] **Step 5: 全テストが通ることを確認**

```bash
npm run test
```

期待: PASS（全テスト）

- [x] **Step 6: コミット**

```bash
git add src/utils/llms.ts src/utils/llms.test.ts
git commit -m "feat: add llms-full.txt content generator utility"
```

---

## Task 4: content/config.ts 更新

**Files:**
- Modify: `src/content/config.ts`

- [x] **Step 1: authors コレクション追加・blog に faq フィールド追加**

`src/content/config.ts` を以下に置き換える:

**注意:** `image()` は Astro Content Collections が `schema` 関数のパラメータとして渡すヘルパー。トップレベルで import する必要はない（Astro 4.x の仕様）。

```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(100),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('中野健太朗'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    ogImage: z.string().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});

const authorsCollection = defineCollection({
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

export const collections = {
  blog: blogCollection,
  authors: authorsCollection,
};
```

- [x] **Step 2: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし（まだ authors コンテンツが存在しないため警告が出る可能性があるが、エラーではない）

- [x] **Step 3: コミット**

```bash
git add src/content/config.ts
git commit -m "feat: add authors collection and faq field to blog schema"
```

---

## Task 5: JsonLd.astro + llms-full.txt エンドポイント

**Files:**
- Create: `src/components/seo/JsonLd.astro`
- Create: `src/pages/llms-full.txt.ts`

- [x] **Step 1: JsonLd.astro を作成**

`src/components/seo/JsonLd.astro`:

```astro
---
export interface Props {
  schema: Record<string, unknown>;
}

const { schema } = Astro.props;
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [x] **Step 2: llms-full.txt.ts を作成**

`src/pages/llms-full.txt.ts`:

```typescript
import { getCollection } from 'astro:content';
import { getSortedPosts } from '@/utils/blog';
import { generateLlmsFullContent } from '@/utils/llms';

export async function GET(): Promise<Response> {
  const allPosts = await getCollection('blog');
  const posts = getSortedPosts(allPosts);
  const content = generateLlmsFullContent(posts);

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
```

- [x] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし

- [x] **Step 4: dist/llms-full.txt が生成されていることを確認**

```bash
ls dist/llms-full.txt
```

- [x] **Step 5: コミット**

```bash
git add src/components/seo/JsonLd.astro src/pages/llms-full.txt.ts
git commit -m "feat: add JsonLd component and llms-full.txt endpoint"
```

---

## Task 6: BaseLayout + PageLayout の拡張

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/PageLayout.astro`

- [x] **Step 1: BaseLayout.astro を更新**

`src/layouts/BaseLayout.astro` を以下に置き換える:

```astro
---
import JsonLd from '@/components/seo/JsonLd.astro';
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
} from '@/utils/schema';
import type { BreadcrumbItem } from '@/utils/schema';

export interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: Date;
  author?: string;
  authorUrl?: string;
  tags?: string[];
  breadcrumbs?: BreadcrumbItem[];
}

const {
  title,
  description = 'AI時代に必要な業務を引き受け、お客様が本業に集中できる環境を提供する。株式会社KCPのコーポレートサイト。',
  ogImage = '/og-default.svg',
  noIndex = false,
  type = 'website',
  publishedTime,
  author,
  authorUrl,
  tags = [],
  breadcrumbs,
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const isHomepage = Astro.url.pathname === '/';

const orgSchema = buildOrganizationSchema();
const siteSchema = isHomepage ? buildWebSiteSchema() : null;
const articleSchema =
  type === 'article' && publishedTime && author && authorUrl
    ? buildArticleSchema({
        title,
        description,
        datePublished: publishedTime,
        authorName: author,
        authorUrl,
        pageUrl: canonicalURL.toString(),
      })
    : null;
const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
  ? buildBreadcrumbSchema(breadcrumbs)
  : null;
---

<!doctype html>
<html lang="ja" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href={canonicalURL} />
    <title>{title} | 株式会社KCP</title>
    <meta name="description" content={description} />
    {noIndex && <meta name="robots" content="noindex" />}
    {author && <meta name="author" content={author} />}
    {authorUrl && <link rel="author" href={authorUrl} />}

    <!-- OGP -->
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={`${title} | 株式会社KCP`} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />
    <meta property="og:locale" content="ja_JP" />
    {type === 'article' && publishedTime && (
      <meta property="article:published_time" content={publishedTime.toISOString()} />
    )}
    {type === 'article' && authorUrl && (
      <meta property="article:author" content={authorUrl} />
    )}
    {type === 'article' && tags.map(tag => (
      <meta property="article:tag" content={tag} />
    ))}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${title} | 株式会社KCP`} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL(ogImage, Astro.site)} />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <!-- JSON-LD -->
    <JsonLd schema={orgSchema} />
    {siteSchema && <JsonLd schema={siteSchema} />}
    {articleSchema && <JsonLd schema={articleSchema} />}
    {breadcrumbSchema && <JsonLd schema={breadcrumbSchema} />}
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [x] **Step 2: PageLayout.astro を更新**

`src/layouts/PageLayout.astro` を以下に置き換える:

```astro
---
import BaseLayout from './BaseLayout.astro';
import Header from '@/components/layout/Header.astro';
import Footer from '@/components/layout/Footer.astro';
import '@/styles/global.css';
import type { BreadcrumbItem } from '@/utils/schema';

export interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: Date;
  author?: string;
  authorUrl?: string;
  tags?: string[];
  breadcrumbs?: BreadcrumbItem[];
}

const props = Astro.props;
---

<BaseLayout {...props}>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</BaseLayout>
```

- [x] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし

- [x] **Step 4: コミット**

```bash
git add src/layouts/BaseLayout.astro src/layouts/PageLayout.astro
git commit -m "feat: extend BaseLayout/PageLayout with article OGP and JSON-LD support"
```

---

## Task 7: BlogLayout 更新（Article OGP + FAQ JSON-LD）+ [slug].astro に FAQ UI 追加

**Files:**
- Modify: `src/layouts/BlogLayout.astro`
- Modify: `src/pages/blog/[slug].astro`

- [x] **Step 1: BlogLayout.astro を更新**

`src/layouts/BlogLayout.astro` を以下に置き換える:

```astro
---
import PageLayout from './PageLayout.astro';
import JsonLd from '@/components/seo/JsonLd.astro';
import { buildFaqPageSchema, getAuthorSlug } from '@/utils/schema';
import type { CollectionEntry } from 'astro:content';
import '@/styles/prose.css';

export interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, description, ogImage, pubDate, author, tags, faq } = post.data;
const ogImageUrl = ogImage ?? '/og-default.svg';

const site = Astro.site!.toString().replace(/\/$/, '');
const authorSlug = getAuthorSlug(author);
const authorUrl = `${site}/author/${authorSlug}/`;

const breadcrumbs = [
  { name: 'ホーム', url: `${site}/` },
  { name: 'ブログ', url: `${site}/blog/` },
  { name: title, url: `${site}/blog/${post.slug}/` },
];

const faqSchema = faq && faq.length > 0 ? buildFaqPageSchema(faq) : null;
---

<PageLayout
  title={title}
  description={description}
  ogImage={ogImageUrl}
  type="article"
  publishedTime={pubDate}
  author={author}
  authorUrl={authorUrl}
  tags={tags}
  breadcrumbs={breadcrumbs}
>
  {faqSchema && <JsonLd schema={faqSchema} />}
  <slot />
</PageLayout>
```

**注意:** `{faqSchema && <JsonLd schema={faqSchema} />}` は `<body>` 内に出力されるが、`<script type="application/ld+json">` は body 内でも有効（Google は body 内の JSON-LD も認識する）。

- [x] **Step 2: [slug].astro に FAQ UI セクションを追加**

`src/pages/blog/[slug].astro` の `<article>` 内、`<div class="mt-12 pt-8 ...">` の直前に以下を追加:

```astro
{post.data.faq && post.data.faq.length > 0 && (
  <div class="mt-12 pt-8 border-t border-border">
    <h2 class="text-xl font-bold text-text-primary mb-6">よくある質問</h2>
    <div class="space-y-4">
      {post.data.faq.map(item => (
        <details class="group border border-border rounded-xl bg-base-100 overflow-hidden">
          <summary class="flex items-center justify-between px-6 py-4 cursor-pointer text-text-primary font-medium hover:text-accent transition-colors list-none">
            <span>{item.question}</span>
            <span class="text-accent text-lg group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div class="px-6 pb-4 text-text-secondary leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  </div>
)}
```

- [x] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし

- [x] **Step 4: コミット**

```bash
git add src/layouts/BlogLayout.astro src/pages/blog/[slug].astro
git commit -m "feat: add article OGP meta, FAQ JSON-LD, and FAQ UI to blog posts"
```

---

## Task 8: ブログ・タグページに BreadcrumbList 追加

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/tags/index.astro`
- Modify: `src/pages/blog/tags/[tag].astro`

- [x] **Step 1: blog/index.astro に breadcrumbs を追加**

`src/pages/blog/index.astro` の `<PageLayout` タグを更新:

```astro
<PageLayout
  title="ブログ"
  description="AI活用・業務効率化・デジタルトランスフォーメーションに関する記事を発信しています。"
  breadcrumbs={[
    { name: 'ホーム', url: 'https://kcp.co.jp/' },
    { name: 'ブログ', url: 'https://kcp.co.jp/blog/' },
  ]}
>
```

- [x] **Step 2: blog/tags/index.astro に breadcrumbs を追加**

`src/pages/blog/tags/index.astro` の `<PageLayout` タグを更新:

```astro
<PageLayout
  title="タグ一覧"
  breadcrumbs={[
    { name: 'ホーム', url: 'https://kcp.co.jp/' },
    { name: 'ブログ', url: 'https://kcp.co.jp/blog/' },
    { name: 'タグ一覧', url: 'https://kcp.co.jp/blog/tags/' },
  ]}
>
```

- [x] **Step 3: blog/tags/[tag].astro に breadcrumbs を追加**

`src/pages/blog/tags/[tag].astro` の `<PageLayout` タグを更新:

```astro
<PageLayout
  title={`${tag} の記事`}
  description={`${tag} タグが付いた記事一覧`}
  breadcrumbs={[
    { name: 'ホーム', url: 'https://kcp.co.jp/' },
    { name: 'ブログ', url: 'https://kcp.co.jp/blog/' },
    { name: 'タグ一覧', url: 'https://kcp.co.jp/blog/tags/' },
    { name: tag, url: `https://kcp.co.jp/blog/tags/${tag}/` },
  ]}
>
```

- [x] **Step 4: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし

- [x] **Step 5: コミット**

```bash
git add src/pages/blog/index.astro src/pages/blog/tags/index.astro src/pages/blog/tags/[tag].astro
git commit -m "feat: add BreadcrumbList JSON-LD to blog and tag pages"
```

---

## Task 9: 著者コンテンツ + /author/[slug].astro

**Files:**
- Create: `src/content/authors/nakanokentaro.md`
- Create: `src/pages/author/[slug].astro`

- [x] **Step 1: 著者データファイルを作成**

`src/content/authors/nakanokentaro.md`:

```markdown
---
name: "中野 健太朗"
role: "代表取締役"
bio: "AIエージェントを活用したBPO企業・株式会社KCP代表。AI活用・業務効率化・Web開発を専門とし、企業の本業集中を支援する。"
twitter: ""
github: ""
---
```

（avatar は後で実際の写真が用意できたら `./nakanokentaro.jpg` を同ディレクトリに配置して frontmatter に追加）

- [x] **Step 2: author/[slug].astro を作成**

`src/pages/author/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import { Image } from 'astro:assets';
import PageLayout from '@/layouts/PageLayout.astro';
import PostCard from '@/components/blog/PostCard.astro';
import JsonLd from '@/components/seo/JsonLd.astro';
import { buildPersonSchema, buildBreadcrumbSchema, getAuthorSlug } from '@/utils/schema';
import { getSortedPosts } from '@/utils/blog';

export async function getStaticPaths() {
  const authors = await getCollection('authors');
  return authors.map(author => ({
    params: { slug: author.slug },
    props: { author },
  }));
}

const { author } = Astro.props;
const { name, role, bio, avatar, twitter, github } = author.data;

const allPosts = await getCollection('blog');
const authorSlugNormalized = getAuthorSlug(name);
const posts = getSortedPosts(allPosts).filter(post =>
  getAuthorSlug(post.data.author as string) === authorSlugNormalized
);

const site = Astro.site!.toString().replace(/\/$/, '');
const authorUrl = `${site}/author/${author.slug}/`;

const personSchema = buildPersonSchema({
  name,
  url: authorUrl,
  jobTitle: role,
  description: bio,
  sameAs: [twitter, github].filter(Boolean) as string[],
});

const breadcrumbs = [
  { name: 'ホーム', url: `${site}/` },
  { name: name, url: authorUrl },
];
const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
---

<PageLayout
  title={name}
  description={bio}
>
  <JsonLd schema={personSchema} />
  <JsonLd schema={breadcrumbSchema} />

  <div class="section-wrapper pt-24 pb-16">
    <!-- Profile -->
    <div class="flex flex-col sm:flex-row items-start gap-8 mb-16">
      <!-- Avatar -->
      <div class="shrink-0">
        {avatar ? (
          <Image
            src={avatar}
            alt={`${name}のプロフィール写真`}
            width={120}
            height={120}
            loading="eager"
            fetchpriority="high"
            class="rounded-full object-cover w-24 h-24 sm:w-32 sm:h-32"
          />
        ) : (
          <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-accent-muted flex items-center justify-center text-3xl font-bold text-accent">
            {name.charAt(0)}
          </div>
        )}
      </div>

      <!-- Info -->
      <div class="flex-1">
        <p class="text-xs font-medium text-accent tracking-widest uppercase mb-2">{role}</p>
        <h1 class="text-3xl font-bold text-text-primary mb-4">{name}</h1>
        <p class="text-text-secondary leading-relaxed mb-6">{bio}</p>

        <!-- SNS Links -->
        <div class="flex gap-4">
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              class="text-text-muted hover:text-accent transition-colors text-sm"
            >
              X (Twitter)
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              class="text-text-muted hover:text-accent transition-colors text-sm"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>

    <!-- Posts -->
    {posts.length > 0 && (
      <>
        <h2 class="text-2xl font-bold text-text-primary mb-8">執筆記事</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <PostCard post={post} />)}
        </div>
      </>
    )}
  </div>
</PageLayout>
```

- [x] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし。`dist/author/nakanokentaro/index.html` が生成される。

- [x] **Step 4: コミット**

```bash
git add src/content/authors/nakanokentaro.md src/pages/author/[slug].astro
git commit -m "feat: add author profile page at /author/[slug]/"
```

---

## Task 10: MVV → #about リネーム

**Files:**
- Modify: `src/components/sections/MVV.astro`
- Modify: `src/components/layout/Header.astro`

- [x] **Step 1: MVV.astro のセクション id を変更**

`src/components/sections/MVV.astro` の `<section id="mvv"` を `<section id="about"` に変更:

```astro
<section id="about" class="py-section" style="background-color: #0a0a0a;">
```

- [x] **Step 2: Header.astro のナビリンクを変更**

`src/components/layout/Header.astro` の `navLinks` 配列を更新:

```typescript
const navLinks = [
  { href: '/#service', label: 'Service' },
  { href: '/#about', label: 'About' },
  { href: '/#strength', label: 'Strength' },
  { href: '/blog/', label: 'Blog' },
  { href: '/#company', label: 'Company' },
  { href: '/#contact', label: 'Contact' },
];
```

- [x] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし

- [x] **Step 4: コミット**

```bash
git add src/components/sections/MVV.astro src/components/layout/Header.astro
git commit -m "feat: rename MVV section anchor to #about for E-E-A-T"
```

---

## Task 11: CLAUDE.md 更新（画像規約）

**Files:**
- Modify: `CLAUDE.md`

- [x] **Step 1: 画像最適化規約を Key Patterns セクションに追記**

`CLAUDE.md` の `## Key Patterns` セクションに以下を追加:

```markdown
**画像最適化:** Astroコンポーネント内では `<img>` タグを直接使わず、必ず `<Image>` (`astro:assets`) を使用する。`alt` 属性は必須（空文字不可）。ファーストビュー画像には `loading="eager" fetchpriority="high"` を指定。Markdownブログ記事内のローカル画像（`./image.png` 形式の相対パス）は Astro が自動的に WebP 変換・srcset 生成する（追加設定不要）。
```

- [x] **Step 2: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: add image optimization conventions to CLAUDE.md"
```

---

## 最終確認

- [x] **全テストが通ることを確認**

```bash
npm run test
```

期待: PASS（全テスト）

- [x] **本番ビルドが通ることを確認**

```bash
npm run build
```

期待: エラーなし

- [x] **生成物の確認**

```bash
ls dist/llms-full.txt dist/llms.txt dist/robots.txt dist/author/nakanokentaro/index.html
```

全ファイルが存在することを確認。
