# Press Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/press` セクションを新設し、プレスリリース（公告・サービスリリース・資本提携など）を掲載できるようにする。

**Architecture:** blog コレクションと完全分離した `press` コレクションを Astro Content Collections で定義し、専用ページ・コンポーネント・レイアウトを実装する。blog の TagFilter・ToC は使わないシンプル構成。Footer に `/press/` リンクを追加する。

**Tech Stack:** Astro SSG, Astro Content Collections, TypeScript, Tailwind CSS, Vitest

---

## File Map

| 操作 | ファイル | 役割 |
|------|---------|------|
| Modify | `src/content/config.ts` | `pressCollection` を追加 |
| Create | `src/utils/press.ts` | `getSortedPressReleases()` ユーティリティ |
| Create | `src/utils/press.test.ts` | press ユーティリティのテスト |
| Create | `src/content/press/kcp-launch.md` | サンプルコンテンツ（会社設立公告） |
| Create | `src/content/press/ai-service-release.md` | サンプルコンテンツ（サービスリリース） |
| Create | `src/components/press/PressCard.astro` | 一覧カードコンポーネント |
| Create | `src/layouts/PressLayout.astro` | 詳細ページレイアウト |
| Create | `src/pages/press/index.astro` | 一覧ページ |
| Create | `src/pages/press/[slug].astro` | 詳細ページ |
| Modify | `src/components/layout/Footer.astro` | `/press/` リンクを追加 |

---

### Task 1: pressCollection をコンテンツ設定に追加

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: `pressCollection` を定義して `collections` に追加**

`src/content/config.ts` を以下のように変更する（既存コードの末尾に追記）:

```typescript
const pressCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(100),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    category: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  blog_en: blogEnCollection,
  authors: authorsCollection,
  press: pressCollection,
};
```

- [ ] **Step 2: ビルドが通ることを確認**

```bash
npm run build
```

エラーがなければ OK。

- [ ] **Step 3: コミット**

```bash
git add src/content/config.ts
git commit -m "feat: add press content collection schema"
```

---

### Task 2: press ユーティリティを TDD で実装

**Files:**
- Create: `src/utils/press.ts`
- Create: `src/utils/press.test.ts`

- [ ] **Step 1: テストファイルを作成（まだ実装なし）**

`src/utils/press.test.ts` を作成:

```typescript
import { describe, it, expect } from 'vitest';
import { getSortedPressReleases } from './press';

const makePress = (slug: string, pubDate: string, draft = false) => ({
  id: slug,
  slug,
  body: '',
  collection: 'press' as const,
  data: {
    title: `Press ${slug}`,
    description: 'desc',
    pubDate: new Date(pubDate),
    category: 'お知らせ',
    draft,
  },
  render: async () => ({ Content: () => null, headings: [], remarkPluginFrontmatter: {} }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const releases = [
  makePress('old', '2026-01-01'),
  makePress('new', '2026-04-01'),
  makePress('draft', '2026-05-01', true),
] as any;

describe('getSortedPressReleases', () => {
  it('filters out drafts and sorts by pubDate descending', () => {
    const result = getSortedPressReleases(releases);
    expect(result.map((r: any) => r.slug)).toEqual(['new', 'old']);
  });

  it('returns empty array when all are drafts', () => {
    const allDraft = [makePress('d', '2026-01-01', true)] as any;
    expect(getSortedPressReleases(allDraft)).toEqual([]);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/utils/press.test.ts
```

期待: `FAIL` — `Cannot find module './press'`

- [ ] **Step 3: 実装を作成**

`src/utils/press.ts` を作成:

```typescript
import type { CollectionEntry } from 'astro:content';

type PressRelease = CollectionEntry<'press'>;

export function getSortedPressReleases(releases: PressRelease[]): PressRelease[] {
  return releases
    .filter(r => !r.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run src/utils/press.test.ts
```

期待: `PASS` 2 tests

- [ ] **Step 5: コミット**

```bash
git add src/utils/press.ts src/utils/press.test.ts
git commit -m "feat: add getSortedPressReleases utility"
```

---

### Task 3: サンプルコンテンツを作成

**Files:**
- Create: `src/content/press/kcp-launch.md`
- Create: `src/content/press/ai-service-release.md`

- [ ] **Step 1: 会社設立公告を作成**

`src/content/press/kcp-launch.md` を作成:

```markdown
---
title: "株式会社KCP 設立のお知らせ"
description: "2026年4月1日、株式会社KCPを設立しました。AI活用による業務効率化支援を事業の中核として展開してまいります。"
pubDate: 2026-04-01
category: "公告"
draft: false
---

## 設立のご挨拶

この度、株式会社KCPを設立いたしました。

AI技術の急速な発展を背景に、企業が本業に集中できる環境を整えるため、AIを活用した業務効率化支援を中核事業として展開してまいります。

## 会社概要

- **社名:** 株式会社KCP
- **設立:** 2026年4月1日
- **代表者:** 中野 健太朗
- **事業内容:** AI活用業務効率化支援、SNS運用代行、Web・アプリ開発

今後ともよろしくお願いいたします。
```

- [ ] **Step 2: サービスリリースのお知らせを作成**

`src/content/press/ai-service-release.md` を作成:

```markdown
---
title: "AI活用業務効率化パッケージ「KCP Boost」提供開始のお知らせ"
description: "中小企業向けAI活用業務効率化パッケージ「KCP Boost」の提供を2026年5月1日より開始します。"
pubDate: 2026-05-01
category: "サービスリリース"
draft: false
---

## サービス概要

株式会社KCPは、中小企業向けAI活用業務効率化パッケージ「KCP Boost」の提供を開始します。

## 提供内容

- **AI業務分析:** 現状業務のボトルネックをAIで可視化
- **自動化設計:** 反復作業の自動化フロー設計
- **導入支援:** ツール選定から運用定着まで一貫サポート

## 価格

月額 100,000円（税別）〜

詳細はお問い合わせください。
```

- [ ] **Step 3: コミット**

```bash
git add src/content/press/
git commit -m "feat: add press sample content"
```

---

### Task 4: PressCard コンポーネントを作成

**Files:**
- Create: `src/components/press/PressCard.astro`

- [ ] **Step 1: PressCard を作成**

`src/components/press/PressCard.astro` を作成:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '@/utils/date';

export interface Props {
  release: CollectionEntry<'press'>;
}

const { release } = Astro.props;
const { title, description, pubDate, category } = release.data;
---

<article class="group flex flex-col gap-4 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
  <!-- Category badge -->
  <div>
    <span class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
      {category}
    </span>
  </div>

  <!-- Title -->
  <h2 class="font-bold text-xl text-text-primary group-hover:text-accent transition-colors">
    <a href={`/press/${release.slug}/`} class="stretched-link">
      {title}
    </a>
  </h2>

  <!-- Description -->
  <p class="text-text-secondary text-sm leading-relaxed line-clamp-3">{description}</p>

  <!-- Date -->
  <div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
    <time datetime={pubDate.toISOString()}>{formatDate(pubDate, 'ja')}</time>
  </div>
</article>
```

- [ ] **Step 2: 開発サーバーでエラーがないことを確認（後のタスクで実際にページ確認する）**

このコンポーネント単体はページから参照されるまでビルドされないので、Task 6 完了後に確認する。

- [ ] **Step 3: コミット**

```bash
git add src/components/press/PressCard.astro
git commit -m "feat: add PressCard component"
```

---

### Task 5: PressLayout を作成

**Files:**
- Create: `src/layouts/PressLayout.astro`

- [ ] **Step 1: PressLayout を作成**

`src/layouts/PressLayout.astro` を作成:

```astro
---
import PageLayout from './PageLayout.astro';
import type { CollectionEntry } from 'astro:content';
import '@/styles/prose.css';

export interface Props {
  release: CollectionEntry<'press'>;
}

const { release } = Astro.props;
const { title, description, pubDate, category } = release.data;

const site = Astro.site!.toString().replace(/\/$/, '');

const breadcrumbs = [
  { name: 'ホーム', url: `${site}/` },
  { name: 'プレスリリース', url: `${site}/press/` },
  { name: title, url: `${site}/press/${release.slug}/` },
];
---

<PageLayout
  title={title}
  description={description}
  type="article"
  publishedTime={pubDate}
  breadcrumbs={breadcrumbs}
>
  <slot />
</PageLayout>
```

- [ ] **Step 2: コミット**

```bash
git add src/layouts/PressLayout.astro
git commit -m "feat: add PressLayout"
```

---

### Task 6: press ページを作成

**Files:**
- Create: `src/pages/press/index.astro`
- Create: `src/pages/press/[slug].astro`

- [ ] **Step 1: 一覧ページを作成**

`src/pages/press/index.astro` を作成:

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import PressCard from '@/components/press/PressCard.astro';
import { getSortedPressReleases } from '@/utils/press';

const allReleases = await getCollection('press');
const releases = getSortedPressReleases(allReleases);
---

<PageLayout
  title="プレスリリース"
  description="株式会社KCPの公告・サービスリリース・資本提携などのお知らせです。"
  breadcrumbs={[
    { name: 'ホーム', url: 'https://kcp.co.jp/' },
    { name: 'プレスリリース', url: 'https://kcp.co.jp/press/' },
  ]}
>
  <div class="section-wrapper pt-24 pb-16">
    <h1 class="text-4xl font-bold text-text-primary mb-4">Press Releases</h1>
    <p class="text-text-secondary mb-10">公告・サービスリリース・資本提携などのお知らせです。</p>

    {releases.length === 0 ? (
      <p class="text-text-muted text-center py-16">お知らせはありません。</p>
    ) : (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {releases.map(release => (
          <PressCard release={release} />
        ))}
      </div>
    )}
  </div>
</PageLayout>
```

- [ ] **Step 2: 詳細ページを作成**

`src/pages/press/[slug].astro` を作成:

```astro
---
import { getCollection } from 'astro:content';
import PressLayout from '@/layouts/PressLayout.astro';
import Button from '@/components/ui/Button.astro';
import { formatDateJa } from '@/utils/date';

export async function getStaticPaths() {
  const releases = await getCollection('press', ({ data }) => !data.draft);
  return releases.map(release => ({
    params: { slug: release.slug },
    props: { release },
  }));
}

const { release } = Astro.props;
const { Content } = await release.render();
const { title, pubDate, category } = release.data;
---

<PressLayout release={release}>
  <div class="section-wrapper pt-24 pb-16">
    <article class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-10">
        <div class="mb-4">
          <span class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
            {category}
          </span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-6">{title}</h1>
        <div class="flex items-center gap-4 text-sm text-text-muted pb-6 border-b border-border">
          <time datetime={pubDate.toISOString()}>{formatDateJa(pubDate)}</time>
        </div>
      </div>

      <!-- Content -->
      <div class="prose prose-lg max-w-none">
        <Content />
      </div>

      <!-- Back link -->
      <div class="mt-12 pt-8 border-t border-border">
        <Button href="/press/" variant="ghost">← プレスリリース一覧へ戻る</Button>
      </div>
    </article>
  </div>
</PressLayout>
```

- [ ] **Step 3: 開発サーバーで動作確認**

```bash
npm run dev
```

ブラウザで以下を確認:
- `http://localhost:4321/press/` — 2件のカードが表示される
- `http://localhost:4321/press/kcp-launch/` — 会社設立公告の詳細が表示される
- `http://localhost:4321/press/ai-service-release/` — サービスリリースの詳細が表示される

- [ ] **Step 4: ビルドが通ることを確認**

```bash
npm run build
```

エラーがなければ OK。

- [ ] **Step 5: コミット**

```bash
git add src/pages/press/
git commit -m "feat: add press listing and detail pages"
```

---

### Task 7: Footer に /press/ リンクを追加

**Files:**
- Modify: `src/components/layout/Footer.astro`

- [ ] **Step 1: Footer にリンクを追加**

`src/components/layout/Footer.astro` の現在の内容:

```astro
---
import type { Translations } from '@/i18n/types';

export interface Props {
  locale: 'ja' | 'en';
  t: Translations;
}

const { t } = Astro.props;
const year = new Date().getFullYear();
---

<footer class="border-t border-border/50 py-8">
  <div class="section-wrapper text-center text-sm text-text-muted">
    © {year} {t.footer.companyName}. {t.footer.rights}
  </div>
</footer>
```

以下に変更する:

```astro
---
import type { Translations } from '@/i18n/types';

export interface Props {
  locale: 'ja' | 'en';
  t: Translations;
}

const { t } = Astro.props;
const year = new Date().getFullYear();
---

<footer class="border-t border-border/50 py-8">
  <div class="section-wrapper flex flex-col items-center gap-4 text-sm text-text-muted">
    <nav class="flex gap-6" aria-label="フッターナビゲーション">
      <a href="/press/" class="hover:text-text-primary transition-colors">プレスリリース</a>
    </nav>
    <p>© {year} {t.footer.companyName}. {t.footer.rights}</p>
  </div>
</footer>
```

- [ ] **Step 2: 開発サーバーで表示確認**

```bash
npm run dev
```

`http://localhost:4321/` を開き、フッターに「プレスリリース」リンクが表示されることを確認。クリックして `/press/` に遷移することを確認。

- [ ] **Step 3: コミット**

```bash
git add src/components/layout/Footer.astro
git commit -m "feat: add press link to footer"
```

---

### Task 8: 全テスト通過を確認

- [ ] **Step 1: 全テストを実行**

```bash
npm run test
```

期待: 全テスト PASS（press.test.ts の 2 件を含む）

- [ ] **Step 2: 本番ビルドの最終確認**

```bash
npm run build
```

エラーがなければ実装完了。
