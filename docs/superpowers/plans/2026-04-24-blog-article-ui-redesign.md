# Blog Article Page UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブログ記事ページのUIを参考サイト（nyosegawa.com）のスタイルに合わせてリデザインする — シアン見出し・アウトラインタグ・インライン目次（番号付き）・ヒーロー要素の順序変更。

**Architecture:** コンポーネント・CSSのみの変更。新規ユーティリティ関数なし。TagBadge → prose.css → BlogHero → TableOfContents の順に変更し、最後にスラグページへ反映する。

**Tech Stack:** Astro, Tailwind CSS, prose.css カスタムプロパティ

---

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/components/blog/TagBadge.astro` | 半塗り → アウトライン（枠線のみ）スタイル |
| `src/styles/prose.css` | 見出し色 `#f0f0f0` → アクセントシアン `#4a9eff` |
| `src/components/blog/BlogHero.astro` | 順序変更：タグ先頭 → タイトル先頭。`by` プレフィックス追加 |
| `src/components/blog/TableOfContents.astro` | サイドバー sticky → インライン。H2=番号付き、H3=○インデント |
| `src/pages/blog/[slug].astro` | 2カラムグリッド → シングルカラム。ToC をインライン化 |
| `src/pages/en/blog/[slug].astro` | 同上（EN版。ヒーローはインライン実装のため直接編集） |

---

## Task 1: TagBadge アウトラインスタイル

**Files:**
- Modify: `src/components/blog/TagBadge.astro`

非アクティブ状態の背景塗りを除去し、枠線のみのアウトラインスタイルに変更する。

- [ ] **Step 1: TagBadge.astro を編集**

`src/components/blog/TagBadge.astro` の `states` 変数を以下に変更：

```astro
---
export interface Props {
  tag: string;
  active?: boolean;
  size?: 'sm' | 'md';
  href?: string;
}

const { tag, active = false, size = 'sm', href } = Astro.props;

const base = 'inline-flex items-center rounded-full font-medium transition-colors duration-200';
const sizes = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};
const states = active
  ? 'bg-accent text-white'
  : 'border border-accent/60 text-accent bg-transparent hover:bg-accent/10';

const classes = `${base} ${sizes[size]} ${states}`;
---

{href ? (
  <a href={href} class={classes}>{tag}</a>
) : (
  <span class={classes}>{tag}</span>
)}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/blog/TagBadge.astro
git commit -m "style: change TagBadge to outline style"
```

---

## ~~Task 2: プローズ見出し色をシアンに変更~~ (SKIPPED: ブランドカラー維持のため省略)

**Files:**
- Modify: `src/styles/prose.css`

`--tw-prose-headings` を白（`#f0f0f0`）からアクセントシアン（`#4a9eff`）に変更する。

- [ ] **Step 1: prose.css を編集**

`src/styles/prose.css` の `--tw-prose-headings` 行を変更：

```css
.prose {
  --tw-prose-body: #f0f0f0;
  --tw-prose-headings: #4a9eff;
  --tw-prose-lead: #a0a0b0;
  --tw-prose-links: #4a9eff;
  --tw-prose-bold: #f0f0f0;
  --tw-prose-counters: #4a9eff;
  --tw-prose-bullets: #4a9eff;
  --tw-prose-hr: #2a2a3e;
  --tw-prose-quotes: #a0a0b0;
  --tw-prose-quote-borders: #0066cc;
  --tw-prose-captions: #606070;
  --tw-prose-code: #7ab8ff;
  --tw-prose-pre-code: #f0f0f0;
  --tw-prose-pre-bg: #141414;
  --tw-prose-th-borders: #2a2a3e;
  --tw-prose-td-borders: #1e1e2e;
  line-height: 1.8;
}

.prose code::before,
.prose code::after {
  content: '';
}

.prose pre {
  border: 1px solid #2a2a3e;
  border-radius: 0.5rem;
}

.prose a {
  text-decoration-color: #1a3a5c;
  transition: text-decoration-color 0.2s;
  text-decoration: unset;
}
.prose a:hover {
  text-decoration-color: #4a9eff;
}

.prose h2,
.prose h3,
.prose h4 {
  scroll-margin-top: 5rem;
}

/* rehypeAutolinkHeadings (behavior:'wrap') wraps heading text in <a>.
   Without this, the link color (#4a9eff) overrides the heading color. */
.prose :is(h2, h3, h4) > a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/styles/prose.css
git commit -m "style: change prose heading color to accent cyan"
```

---

## Task 3: BlogHero 要素順序の変更

**Files:**
- Modify: `src/components/blog/BlogHero.astro`

現在の順序「タグ → タイトル → メタ」を「タイトル → メタ → タグ」に変更。`by` プレフィックスを追加。

- [ ] **Step 1: BlogHero.astro を全文置き換え**

`src/components/blog/BlogHero.astro` を以下に置き換え：

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';
import { formatDateJa } from '@/utils/date';
import { getReadingTimeMin } from '@/utils/blog';

export interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, pubDate, updatedDate, tags, author } = post.data;
const readMin = getReadingTimeMin(post.body);
---

<div class="mb-10">
  <h1 class="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">{title}</h1>
  <div class="flex flex-wrap items-center gap-3 text-sm text-text-muted mb-4">
    <span>by {author}</span>
    <span>•</span>
    <time datetime={pubDate.toISOString()}>{formatDateJa(pubDate)}</time>
    {updatedDate && (
      <>
        <span>•</span>
        <span>更新: <time datetime={updatedDate.toISOString()}>{formatDateJa(updatedDate)}</time></span>
      </>
    )}
    <span>•</span>
    <span>{readMin} min read</span>
  </div>
  <div class="flex flex-wrap gap-2 pb-6 border-b border-border">
    {tags.map(tag => <TagBadge tag={tag} href={`/blog/tags/${tag}/`} size="md" />)}
  </div>
</div>
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/blog/BlogHero.astro
git commit -m "style: reorder BlogHero to title-first, add by prefix"
```

---

## Task 4: TableOfContents インラインスタイル + 番号付きリスト

**Files:**
- Modify: `src/components/blog/TableOfContents.astro`

サイドバー sticky スタイルを廃止し、記事内インライン表示に変更。H2 は番号付き（1. 2.）、H3 は ○ インデントで表示する。

- [ ] **Step 1: TableOfContents.astro を全文置き換え**

`src/components/blog/TableOfContents.astro` を以下に置き換え：

```astro
---
export interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;
const toc = headings.filter(h => h.depth === 2 || h.depth === 3);

let h2Count = 0;
const items = toc.map(h => {
  if (h.depth === 2) {
    h2Count++;
    return { ...h, number: h2Count, isH3: false };
  }
  return { ...h, number: null, isH3: true };
});
---

{items.length > 0 && (
  <nav class="mb-10 p-6 rounded-xl border border-border bg-base-100" aria-label="目次">
    <h2 class="text-xl font-bold text-text-primary mb-4">目次</h2>
    <ul class="flex flex-col gap-1 list-none">
      {items.map(item => (
        <li class={`flex items-baseline gap-2 ${item.isH3 ? 'pl-5' : ''}`}>
          {item.isH3 ? (
            <span class="text-text-muted text-sm shrink-0">○</span>
          ) : (
            <span class="text-accent font-medium text-sm shrink-0 min-w-[1.25rem]">{item.number}.</span>
          )}
          <a
            href={`#${item.slug}`}
            class="toc-link py-0.5 text-text-secondary hover:text-accent transition-colors"
            data-toc-heading={item.slug}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  </nav>
)}

<script>
  const links = document.querySelectorAll('.toc-link');
  const headingEls = document.querySelectorAll('article h2[id], article h3[id]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => link.classList.remove('text-accent', 'font-medium'));
          const active = document.querySelector(`.toc-link[data-toc-heading="${entry.target.id}"]`);
          active?.classList.add('text-accent', 'font-medium');
        }
      });
    },
    { rootMargin: '-80px 0px -60% 0px' }
  );

  headingEls.forEach(el => observer.observe(el));
</script>
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/blog/TableOfContents.astro
git commit -m "style: convert TableOfContents to inline numbered list"
```

---

## Task 5: blog/[slug].astro シングルカラム化 + ToC インライン化（JA）

**Files:**
- Modify: `src/pages/blog/[slug].astro`

2カラムグリッドをシングルカラムに変更し、ToC を記事内（BlogHero と Content の間）に移動する。サイドバー `<aside>` を削除する。

- [ ] **Step 1: [slug].astro のレイアウト部分を置き換え**

`src/pages/blog/[slug].astro` の `<PageLayout>` 内部（line 51〜88）を以下に置き換え：

```astro
  {faqSchema && <JsonLd schema={faqSchema} />}
  <JsonLd schema={breadcrumbSchema} />
  <div class="section-wrapper pt-24 pb-16">
    <article class="max-w-3xl mx-auto">
      <BlogHero post={post} />
      <TableOfContents headings={headings} />
      <div class="prose prose-lg max-w-none">
        <Content />
      </div>
      {faq && faq.length > 0 && (
        <div class="mt-12 pt-8 border-t border-border">
          <h2 class="text-xl font-bold text-text-primary mb-6">よくある質問</h2>
          <div class="space-y-4">
            {faq.map(item => (
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
      <div class="mt-12 pt-8 border-t border-border">
        <Button href="/blog/" variant="ghost">← ブログ一覧へ戻る</Button>
      </div>
    </article>
  </div>
```

ファイル全体は以下になる：

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import BlogHero from '@/components/blog/BlogHero.astro';
import TableOfContents from '@/components/blog/TableOfContents.astro';
import Button from '@/components/ui/Button.astro';
import JsonLd from '@/components/seo/JsonLd.astro';
import { buildFaqPageSchema, buildBreadcrumbSchema, getAuthorSlug } from '@/utils/schema';
import '@/styles/prose.css';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await post.render();
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
const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
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
  <JsonLd schema={breadcrumbSchema} />
  <div class="section-wrapper pt-24 pb-16">
    <article class="max-w-3xl mx-auto">
      <BlogHero post={post} />
      <TableOfContents headings={headings} />
      <div class="prose prose-lg max-w-none">
        <Content />
      </div>
      {faq && faq.length > 0 && (
        <div class="mt-12 pt-8 border-t border-border">
          <h2 class="text-xl font-bold text-text-primary mb-6">よくある質問</h2>
          <div class="space-y-4">
            {faq.map(item => (
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
      <div class="mt-12 pt-8 border-t border-border">
        <Button href="/blog/" variant="ghost">← ブログ一覧へ戻る</Button>
      </div>
    </article>
  </div>
</PageLayout>
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/pages/blog/[slug].astro
git commit -m "style: single-column layout with inline ToC for JA blog"
```

---

## Task 6: en/blog/[slug].astro ヒーロー順序変更 + ToC インライン化（EN）

**Files:**
- Modify: `src/pages/en/blog/[slug].astro`

EN ページはヒーローがインライン実装のため直接編集する。タグ先頭 → タイトル先頭に変更し、ToC をインライン化する。

- [ ] **Step 1: en/blog/[slug].astro を全文置き換え**

`src/pages/en/blog/[slug].astro` を以下に置き換え：

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import TableOfContents from '@/components/blog/TableOfContents.astro';
import TagBadge from '@/components/blog/TagBadge.astro';
import Button from '@/components/ui/Button.astro';
import JsonLd from '@/components/seo/JsonLd.astro';
import { buildFaqPageSchema, buildBreadcrumbSchema } from '@/utils/schema';
import { formatDate } from '@/utils/date';
import { getReadingTimeMin } from '@/utils/blog';
import { useTranslations } from '@/i18n/index';
import '@/styles/prose.css';

export async function getStaticPaths() {
  const posts = await getCollection('blog_en', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await post.render();
const { title, description, ogImage, pubDate, updatedDate, author, tags, faq } = post.data;
const ogImageUrl = ogImage ?? '/og-default.svg';
const readMin = getReadingTimeMin(post.body);

const t = useTranslations('en');

const site = Astro.site!.toString().replace(/\/$/, '');
const breadcrumbs = [
  { name: t.breadcrumb.home, url: `${site}/en/` },
  { name: t.breadcrumb.blog, url: `${site}/en/blog/` },
  { name: title, url: `${site}/en/blog/${post.slug}/` },
];

const faqSchema = faq && faq.length > 0 ? buildFaqPageSchema(faq) : null;
const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
---

<PageLayout
  title={title}
  description={description}
  ogImage={ogImageUrl}
  type="article"
  publishedTime={pubDate}
  author={author}
  tags={tags}
  breadcrumbs={breadcrumbs}
  alternates={[
    { hreflang: 'en', url: `${site}/en/blog/${post.slug}/` },
  ]}
>
  {faqSchema && <JsonLd schema={faqSchema} />}
  <JsonLd schema={breadcrumbSchema} />

  <div class="section-wrapper pt-24 pb-16">
    <article class="max-w-3xl mx-auto">
      <!-- Hero -->
      <div class="mb-10">
        <h1 class="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">{title}</h1>
        <div class="flex flex-wrap items-center gap-3 text-sm text-text-muted mb-4">
          <span>by {author}</span>
          <span>•</span>
          <time datetime={pubDate.toISOString()}>{formatDate(pubDate, 'en')}</time>
          {updatedDate && (
            <>
              <span>•</span>
              <span>Updated: <time datetime={updatedDate.toISOString()}>{formatDate(updatedDate, 'en')}</time></span>
            </>
          )}
          <span>•</span>
          <span>{readMin} min read</span>
        </div>
        <div class="flex flex-wrap gap-2 pb-6 border-b border-border">
          {tags.map(tag => <TagBadge tag={tag} href={`/en/blog/tags/${tag}/`} size="md" />)}
        </div>
      </div>

      <TableOfContents headings={headings} />

      <div class="prose prose-lg max-w-none">
        <Content />
      </div>

      {faq && faq.length > 0 && (
        <div class="mt-12 pt-8 border-t border-border">
          <h2 class="text-xl font-bold text-text-primary mb-6">FAQ</h2>
          <div class="space-y-4">
            {faq.map(item => (
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

      <div class="mt-12 pt-8 border-t border-border">
        <Button href="/en/blog/" variant="ghost">{t.common.backToBlog}</Button>
      </div>
    </article>
  </div>
</PageLayout>
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/pages/en/blog/[slug].astro
git commit -m "style: single-column layout with inline ToC for EN blog"
```

---

## Task 7: 最終確認

- [ ] **Step 1: 開発サーバーを起動して目視確認**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/blog/<任意のスラグ>/` を開き、以下を確認：

- タイトルが最上部に表示される
- メタデータに `by 著者 • 日付 • N min read` 形式で表示される
- タグがアウトライン（枠線のみ）スタイルで表示される
- 記事本文の見出し（H2/H3）がシアン（`#4a9eff`）で表示される
- 目次が記事内コンテンツ前にインラインで表示される
- 目次の H2 項目が番号付き（1. 2. …）で表示される
- 目次の H3 項目が ○ インデントで表示される
- EN ページ（`http://localhost:4321/en/blog/<slug>/`）も同様のレイアウトになっている

- [ ] **Step 2: 本番ビルド最終確認**

```bash
npm run build && npm run preview
```

Expected: エラーなし、プレビューで全ページ正常表示

- [ ] **Step 3: 最終コミット（変更がある場合）**

```bash
git add -p
git commit -m "style: blog article UI redesign complete"
```
