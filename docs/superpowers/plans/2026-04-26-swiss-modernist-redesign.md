# Swiss Modernist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KCP サイトのUI/レイアウトをスイス・モダニスト × ダーク統一 × モノクロームに刷新する（コンテンツ・機能・テスト変更なし）

**Architecture:** 共有UIコンポーネント（Button / SectionHeading / TagBadge）を先に変更し、その後各セクションコンポーネントを上から順に更新する。SectionHeading は旧 `title` prop と新 `sectionNumber`/`sectionLabel` prop を両方受け付ける移行期実装とし、セクション移行後に旧 prop を残しても問題ない（型エラーは出ない）。

**Tech Stack:** Astro SSG, Tailwind CSS, TypeScript（ユニットテスト対象なし — Astro コンポーネントは手動確認、i18n データ変更は型チェックで保証）

---

## ファイル変更マップ

| ファイル | 変更種別 |
|---|---|
| `src/styles/global.css` | Modify — スクロールバー色のニュートラル化 |
| `src/components/ui/Button.astro` | Modify — rounded-none + 白ベースカラー |
| `src/components/ui/SectionHeading.astro` | Modify — 新 API 追加（旧 title 互換維持） |
| `src/components/blog/TagBadge.astro` | Modify — rounded-full 除去 |
| `src/components/layout/Header.astro` | Modify — backdrop-blur 除去 |
| `src/components/layout/Footer.astro` | Modify — ボーダー色統一 |
| `src/components/sections/Hero.astro` | Modify — フルワイドビッグタイポレイアウト |
| `src/i18n/ja.ts` | Modify — Hero 見出し英語化 |
| `src/components/sections/Service.astro` | Modify — 3列横ルール行テーブル |
| `src/components/sections/MVV.astro` | Modify — 引用スタイル + Values リスト |
| `src/components/sections/Strength.astro` | Modify — 3列横ルール行テーブル |
| `src/components/blog/PostCard.astro` | Modify — variant="row" 追加 |
| `src/components/sections/BlogPreview.astro` | Modify — row variant 使用 + カスタムヘッダー |
| `src/components/sections/Company.astro` | Modify — rounded 除去、スタイル統一 |
| `src/components/sections/Contact.astro` | Modify — フルワイド CTA レイアウト |

---

## Task 1: ブランチ作成 + global.css スクロールバー修正

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: ブランチ作成**

```bash
git checkout -b feat/swiss-modernist-redesign
```

- [ ] **Step 2: global.css のスクロールバー色をニュートラルに変更**

`src/styles/global.css` の `::-webkit-scrollbar-thumb` を以下に変更:

```css
/* 変更前 */
::-webkit-scrollbar-thumb {
  background: #2a2a3e;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #1a3a5c;
}

/* 変更後 */
::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #444;
}
```

- [ ] **Step 3: ビルド確認**

```bash
npm run build
```

Expected: ビルドエラーなし

- [ ] **Step 4: コミット**

```bash
git add src/styles/global.css
git commit -m "style: neutralize scrollbar colors"
```

---

## Task 2: 共有 UI コンポーネント — Button / SectionHeading / TagBadge

**Files:**
- Modify: `src/components/ui/Button.astro`
- Modify: `src/components/ui/SectionHeading.astro`
- Modify: `src/components/blog/TagBadge.astro`

### Button

- [ ] **Step 1: Button.astro を以下に全書き換え**

```astro
---
export interface Props {
  variant?: 'primary' | 'outline' | 'ghost';
  href?: string;
  type?: 'button' | 'submit';
  class?: string;
  disabled?: boolean;
  target?: string;
}

const {
  variant = 'primary',
  href,
  type = 'button',
  class: className = '',
  disabled = false,
  target,
} = Astro.props;

const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

const variants = {
  primary: 'bg-white text-black hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50',
  outline: 'border border-[#333] text-white hover:border-white disabled:opacity-50',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50',
};

const classes = `${base} ${variants[variant]} ${className}`;
---

{href ? (
  <a href={href} class={classes} target={target}>
    <slot />
  </a>
) : (
  <button type={type} class={classes} disabled={disabled}>
    <slot />
  </button>
)}
```

### SectionHeading

- [ ] **Step 2: SectionHeading.astro を以下に全書き換え**

新旧両方の prop を受け付ける。`sectionNumber` + `sectionLabel` が優先、なければ旧 `title` にフォールバック。

```astro
---
export interface Props {
  sectionNumber?: string;
  sectionLabel?: string;
  title?: string;
}

const { sectionNumber, sectionLabel, title } = Astro.props;
const label = sectionLabel || title || '';
---

<div class="flex items-baseline border-b border-[#2a2a3e] pb-3 mb-10">
  <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase">
    {sectionNumber ? `${sectionNumber} — ` : ''}{label}
  </p>
</div>
```

### TagBadge

- [ ] **Step 3: TagBadge.astro の `rounded-full` を除去**

`rounded-full` を含む行を変更:

```astro
---
export interface Props {
  tag: string;
  active?: boolean;
  size?: 'sm' | 'md';
  href?: string;
}

const { tag, active = false, size = 'sm', href } = Astro.props;

const base = 'inline-flex items-center font-medium transition-colors duration-200';
const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};
const states = active
  ? 'bg-accent text-white'
  : 'border border-accent/40 text-accent bg-transparent hover:bg-accent/10';

const classes = `${base} ${sizes[size]} ${states}`;
---

{href ? (
  <a href={href} class={classes}>{tag}</a>
) : (
  <span class={classes}>{tag}</span>
)}
```

- [ ] **Step 4: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 5: コミット**

```bash
git add src/components/ui/Button.astro src/components/ui/SectionHeading.astro src/components/blog/TagBadge.astro
git commit -m "style: Swiss UI foundation — Button, SectionHeading, TagBadge"
```

---

## Task 3: Header / Footer クリーンアップ

**Files:**
- Modify: `src/components/layout/Header.astro`
- Modify: `src/components/layout/Footer.astro`

### Header

- [ ] **Step 1: Header.astro の `<header>` タグを変更**

```astro
<!-- 変更前 -->
<header
  class="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md"
  style="background-color: rgba(10,10,10,0.85);"
>

<!-- 変更後 -->
<header
  class="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a3e]"
  style="background-color: rgba(10,10,10,0.95);"
>
```

### Footer

- [ ] **Step 2: Footer.astro のボーダーを変更**

```astro
<!-- 変更前 -->
<footer class="border-t border-border/50 py-8">

<!-- 変更後 -->
<footer class="border-t border-[#2a2a3e] py-8">
```

- [ ] **Step 3: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/components/layout/Header.astro src/components/layout/Footer.astro
git commit -m "style: remove backdrop-blur, unify border colors"
```

---

## Task 4: Hero セクション + ja.ts 英語化

**Files:**
- Modify: `src/components/sections/Hero.astro`
- Modify: `src/i18n/ja.ts`

### ja.ts — Hero コピーを英語に

- [ ] **Step 1: ja.ts の `hero` ブロックを変更**

```ts
// 変更前
hero: {
  eyebrow: '株式会社KCP',
  headlinePre: '人と組織が',
  headlineAccent: '本当にやるべきこと',
  headlinePost: 'に集中できる環境をつくる。',
  subtext:
    'SNS運用代行・CS代行・受託開発ディレクション・AI導入支援を通じて、共に変化を起こすパートナーとして伴奏いたします。',
  primaryCta: 'お問い合わせ',
  secondaryCta: 'サービスを見る',
},

// 変更後
hero: {
  eyebrow: 'Corporation',
  headlinePre: 'We Make',
  headlineAccent: 'Business',
  headlinePost: 'Simple.',
  subtext:
    'SNS運用代行・CS代行・受託開発ディレクション・AI導入支援を通じて、共に変化を起こすパートナーとして伴奏いたします。',
  primaryCta: 'お問い合わせ',
  secondaryCta: 'サービスを見る',
},
```

### Hero.astro — フルワイドビッグタイポレイアウト

- [ ] **Step 2: Hero.astro を以下に全書き換え**

```astro
---
import Button from '@/components/ui/Button.astro';

export interface Props {
  eyebrow: string;
  headlinePre: string;
  headlineAccent: string;
  headlinePost: string;
  subtext: string;
  primaryCta: string;
  secondaryCta: string;
  contactHref?: string;
  serviceHref?: string;
}

const {
  eyebrow,
  headlinePre,
  headlineAccent,
  headlinePost,
  subtext,
  primaryCta,
  secondaryCta,
  contactHref = '#contact',
  serviceHref = '#service',
} = Astro.props;
---

<section
  id="hero"
  class="min-h-screen flex items-end"
  style="background-color: #0a0a0a;"
>
  <div class="section-wrapper w-full pb-0 pt-24">
    <!-- トップ行: セクションラベル + 年 -->
    <div class="flex items-baseline justify-between mb-8">
      <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase">
        01 — {eyebrow}
      </p>
      <p class="text-xs font-mono text-text-muted">2026 —</p>
    </div>

    <!-- ビッグ見出し -->
    <h1 class="text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight text-white">
      <span class="block">{headlinePre}</span>
      <span class="block">{headlineAccent}</span>
      {headlinePost && <span class="block">{headlinePost}</span>}
    </h1>

    <!-- ボールドルール + 下部ストリップ -->
    <div class="border-t-2 border-white mt-8 pt-6 pb-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
      <p class="text-text-secondary text-sm sm:text-base leading-relaxed max-w-lg">
        {subtext}
      </p>
      <div class="flex flex-col sm:flex-row gap-3 shrink-0">
        <Button href={contactHref} variant="primary">{primaryCta}</Button>
        <Button href={serviceHref} variant="outline">{secondaryCta}</Button>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: 開発サーバーで Hero を目視確認**

```bash
npm run dev
```

`http://localhost:4321` を開き、Hero が以下の状態であることを確認:
- 全画面ダーク背景、グラデーション・グリッドオーバーレイなし
- "01 — Corporation" ラベルが左上
- "We Make / Business / Simple." が超大フォントで3行
- ルール下にサブテキスト左・ボタン右

- [ ] **Step 4: ビルド確認**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 5: コミット**

```bash
git add src/components/sections/Hero.astro src/i18n/ja.ts
git commit -m "feat: Swiss hero layout + English headline"
```

---

## Task 5: Service セクション

**Files:**
- Modify: `src/components/sections/Service.astro`

- [ ] **Step 1: Service.astro を以下に全書き換え**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import type { ServiceItem } from '@/i18n/types';

export interface Props {
  heading: string;
  subtitle: string;
  items: ServiceItem[];
}

const { heading, items } = Astro.props;
---

<section id="service" class="py-section" style="background-color: #0e0e0e;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading sectionNumber="02" sectionLabel={heading} />
    </FadeIn>

    <div class="flex flex-col">
      {items.map((service, i) => (
        <FadeIn delay={i * 80}>
          <div class="py-5 border-b border-[#1e1e2e]">
            <div class="flex gap-5 items-start">
              <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0 pt-px">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div class="flex-1 min-w-0">
                <div class="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8 sm:items-baseline">
                  <p class="font-bold text-text-primary text-sm mb-1 sm:mb-0">
                    {service.title}
                  </p>
                  <p class="text-text-secondary text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: 開発サーバーで目視確認**

`http://localhost:4321/#service` で以下を確認:
- "02 — Service" ラベル + ボーダー区切り
- 4行テーブル（番号・タイトル・説明）
- emoji アイコンなし、カードなし

- [ ] **Step 3: ビルド確認 + コミット**

```bash
npm run build
git add src/components/sections/Service.astro
git commit -m "feat: Service section — table row layout"
```

---

## Task 6: MVV セクション

**Files:**
- Modify: `src/components/sections/MVV.astro`

- [ ] **Step 1: MVV.astro を以下に全書き換え**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import type { ValueItem } from '@/i18n/types';

export interface Props {
  missionLabel: string;
  mission: string;
  visionLabel: string;
  vision: string;
  valuesLabel: string;
  values: ValueItem[];
}

const { missionLabel, mission, visionLabel, vision, valuesLabel, values } = Astro.props;
---

<section id="about" class="py-section" style="background-color: #0a0a0a;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading sectionNumber="03" sectionLabel="Mission / Vision / Values" />
    </FadeIn>

    <!-- Mission: 左ボーダー付き大引用 -->
    <FadeIn delay={100}>
      <div class="border-l-2 border-accent pl-6 mb-8">
        <p class="text-xs font-mono font-medium text-accent tracking-[0.12em] uppercase mb-3">
          {missionLabel}
        </p>
        <p class="text-2xl sm:text-3xl font-black text-white leading-snug">
          {mission}
        </p>
      </div>
    </FadeIn>

    <!-- Vision: インラインラベル + テキスト -->
    <FadeIn delay={200}>
      <div class="grid grid-cols-[4rem_1fr] gap-6 items-baseline py-5 border-t border-[#2a2a3e] mb-10">
        <p class="text-xs font-mono font-medium text-accent tracking-[0.12em] uppercase">
          {visionLabel}
        </p>
        <p class="text-text-secondary text-sm leading-relaxed">{vision}</p>
      </div>
    </FadeIn>

    <!-- Values: 番号+タイトルリスト -->
    <FadeIn delay={100}>
      <p class="text-xs font-mono font-medium text-accent tracking-[0.12em] uppercase mb-4">
        {valuesLabel}
      </p>
    </FadeIn>
    <div class="flex flex-col">
      {values.map((value, i) => (
        <FadeIn delay={i * 60 + 200}>
          <div class="flex gap-5 items-baseline py-4 border-b border-[#1e1e2e]">
            <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p class="font-bold text-text-primary text-sm">{value.title}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: 目視確認 + ビルド + コミット**

`http://localhost:4321/#about` で確認:
- Mission が左青ボーダー付き大テキスト
- Vision がインライン2列
- Values が番号+タイトルのリスト（説明文なし）

```bash
npm run build
git add src/components/sections/MVV.astro
git commit -m "feat: MVV section — quote + values list layout"
```

---

## Task 7: Strength セクション

**Files:**
- Modify: `src/components/sections/Strength.astro`

- [ ] **Step 1: Strength.astro を以下に全書き換え**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import type { StrengthItem } from '@/i18n/types';

export interface Props {
  heading: string;
  subtitle: string;
  items: StrengthItem[];
}

const { heading, items } = Astro.props;
---

<section id="strength" class="py-section" style="background-color: #0e0e0e;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading sectionNumber="04" sectionLabel={heading} />
    </FadeIn>

    <div class="flex flex-col">
      {items.map((item, i) => (
        <FadeIn delay={i * 80}>
          <div class="py-5 border-b border-[#1e1e2e]">
            <div class="flex gap-5 items-start">
              <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0 pt-px">
                {item.number}
              </span>
              <div class="flex-1 min-w-0">
                <div class="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8 sm:items-baseline">
                  <p class="font-bold text-text-primary text-sm mb-1 sm:mb-0">
                    {item.title}
                  </p>
                  <p class="text-text-secondary text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: 目視確認 + ビルド + コミット**

`http://localhost:4321/#strength` で確認: Service と同じテーブル言語で3行

```bash
npm run build
git add src/components/sections/Strength.astro
git commit -m "feat: Strength section — table row layout"
```

---

## Task 8: PostCard row variant + BlogPreview

**Files:**
- Modify: `src/components/blog/PostCard.astro`
- Modify: `src/components/sections/BlogPreview.astro`

### PostCard — row variant 追加

- [ ] **Step 1: PostCard.astro を以下に全書き換え**

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';
import { formatDate } from '@/utils/date';
import { getReadingTimeMin } from '@/utils/blog';

export interface Props {
  post: CollectionEntry<'blog'> | CollectionEntry<'blog_en'>;
  compact?: boolean;
  locale?: 'ja' | 'en';
  variant?: 'card' | 'row';
}

const { post, compact = false, locale = 'ja', variant = 'card' } = Astro.props;
const { title, description, pubDate, tags } = post.data;
const readMin = getReadingTimeMin(post.body);

const blogBase = locale === 'en' ? '/en/blog' : '/blog';
const tagBase = locale === 'en' ? '/en/blog/tags' : '/blog/tags';
const readingTimeLabel = locale === 'en' ? `${readMin} min read` : `約${readMin}分`;
const dateStr = formatDate(pubDate, locale);
---

{variant === 'row' ? (
  <article class="relative grid grid-cols-[5rem_1fr_auto] gap-x-6 items-baseline py-4 border-b border-[#1e1e2e]">
    <time class="font-mono text-xs text-text-muted" datetime={pubDate.toISOString()}>
      {dateStr}
    </time>
    <div class="min-w-0">
      <h2 class="font-bold text-text-primary text-sm leading-snug mb-1">
        <a href={`${blogBase}/${post.slug}/`} class="stretched-link hover:text-accent transition-colors">
          {title}
        </a>
      </h2>
      <p class="text-text-secondary text-xs leading-relaxed line-clamp-1">{description}</p>
    </div>
    <div class="flex flex-wrap gap-1 justify-end">
      {tags.slice(0, 1).map(tag => (
        <TagBadge tag={tag} href={`${tagBase}/${tag}/`} />
      ))}
    </div>
  </article>
) : (
  <article class={`relative group flex flex-col gap-4 p-6 border border-[#2a2a3e] bg-base-100 hover:border-accent/40 transition-all duration-300`}>
    <div class="flex flex-wrap gap-2">
      {tags.slice(0, 3).map(tag => (
        <TagBadge tag={tag} href={`${tagBase}/${tag}/`} />
      ))}
    </div>
    <h2 class={`font-bold text-text-primary group-hover:text-accent transition-colors ${compact ? 'text-base' : 'text-xl'}`}>
      <a href={`${blogBase}/${post.slug}/`} class="stretched-link">
        {title}
      </a>
    </h2>
    {!compact && (
      <p class="text-text-secondary text-sm leading-relaxed line-clamp-3">{description}</p>
    )}
    <div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
      <time datetime={pubDate.toISOString()}>{dateStr}</time>
      <span>·</span>
      <span>{readingTimeLabel}</span>
    </div>
  </article>
)}
```

### BlogPreview — row variant 使用 + カスタムヘッダー

- [ ] **Step 2: BlogPreview.astro を以下に全書き換え**

BlogPreview は右側に「すべて見る →」リンクが必要なためカスタムヘッダーを使う（SectionHeading は使わない）。

```astro
---
import PostCard from '@/components/blog/PostCard.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import type { CollectionEntry } from 'astro:content';

export interface Props {
  posts: (CollectionEntry<'blog'> | CollectionEntry<'blog_en'>)[];
  heading: string;
  subtitle: string;
  viewAllLabel: string;
  blogHref: string;
  locale?: 'ja' | 'en';
}

const { posts, heading, viewAllLabel, blogHref, locale = 'ja' } = Astro.props;
---

{posts.length > 0 && (
  <section id="blog" class="py-section" style="background-color: #0a0a0a;">
    <div class="section-wrapper">
      <FadeIn>
        <div class="flex items-baseline justify-between border-b border-[#2a2a3e] pb-3 mb-10">
          <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase">
            05 — {heading}
          </p>
          <a
            href={blogHref}
            class="text-xs font-mono text-accent tracking-[0.1em] uppercase hover:text-accent-light transition-colors"
          >
            {viewAllLabel} →
          </a>
        </div>
      </FadeIn>

      <div class="flex flex-col">
        {posts.map((post, i) => (
          <FadeIn delay={i * 80}>
            <PostCard post={post} locale={locale} variant="row" />
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 3: 目視確認 + ビルド + コミット**

`http://localhost:4321/#blog` で確認:
- "05 — Blog" ラベル左、"記事一覧を見る →" 右
- 記事が日付・タイトル・タグの横行で表示

ブログ一覧ページ `http://localhost:4321/blog/` も確認 — こちらは card variant のまま

```bash
npm run build
git add src/components/blog/PostCard.astro src/components/sections/BlogPreview.astro
git commit -m "feat: PostCard row variant + BlogPreview editorial list"
```

---

## Task 9: Company + Contact セクション

**Files:**
- Modify: `src/components/sections/Company.astro`
- Modify: `src/components/sections/Contact.astro`

### Company

- [ ] **Step 1: Company.astro を以下に全書き換え**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import type { CompanyInfoRow } from '@/i18n/types';

export interface Props {
  heading: string;
  subtitle: string;
  info: CompanyInfoRow[];
}

const { heading, info } = Astro.props;
---

<section id="company" class="py-section" style="background-color: #0e0e0e;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading sectionNumber="06" sectionLabel={heading} />
    </FadeIn>

    <FadeIn delay={100}>
      <div class="border border-[#2a2a3e] overflow-hidden">
        <table class="w-full">
          <tbody>
            {info.map((row, i) => (
              <tr class={i % 2 === 0 ? 'bg-[#0e0e0e]' : 'bg-[#141414]'}>
                <th class="px-6 py-4 text-left text-xs font-medium text-text-secondary w-40 shrink-0 border-r border-[#2a2a3e] uppercase tracking-wider">
                  {row.label}
                </th>
                <td class="px-6 py-4 text-sm text-text-primary">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeIn>
  </div>
</section>
```

### Contact

- [ ] **Step 2: Contact.astro を以下に全書き換え**

```astro
---
import Button from '@/components/ui/Button.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

export interface Props {
  label: string;
  heading: string;
  subtext: string;
  btnLabel: string;
}

const { label, heading, subtext, btnLabel } = Astro.props;

const GOOGLE_FORM_URL = 'https://forms.google.com/';
const subtextLines = subtext.split('\n');
---

<section id="contact" class="py-section" style="background-color: #0a0a0a;">
  <div class="section-wrapper">
    <FadeIn>
      <div class="flex items-baseline border-b border-[#2a2a3e] pb-3 mb-8">
        <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase">
          07 — {label}
        </p>
      </div>

      <h2 class="text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white mb-8">
        {heading}
      </h2>

      <div class="border-t-2 border-white pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <p class="text-text-secondary text-sm leading-relaxed max-w-md">
          {subtextLines.map((line, i) => (
            <>
              {line}
              {i < subtextLines.length - 1 && <br />}
            </>
          ))}
        </p>
        <Button href={GOOGLE_FORM_URL} variant="primary" target="_blank">
          {btnLabel}
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Button>
      </div>
    </FadeIn>
  </div>
</section>
```

- [ ] **Step 3: 全ページ目視確認**

```bash
npm run dev
```

以下を順番に確認:
- `http://localhost:4321/` — トップページ全セクション上から下までスクロール
- `http://localhost:4321/blog/` — ブログ一覧（card variant が壊れていないか）
- `http://localhost:4321/en/` — 英語版トップページ

確認ポイント:
- グロー・グラデーション・rounded-xl が残っていないか
- 全セクションに番号ラベルがついているか
- モバイルサイズ（375px）でレイアウトが崩れていないか

- [ ] **Step 4: ビルド確認 + コミット**

```bash
npm run build
git add src/components/sections/Company.astro src/components/sections/Contact.astro
git commit -m "feat: Company + Contact sections — Swiss layout"
```

---

## Task 10: テスト実行 + 最終確認

- [ ] **Step 1: ユニットテスト実行（ユーティリティ関数が壊れていないか確認）**

```bash
npm run test
```

Expected: All tests pass（今回の変更でユーティリティ関数は未変更なので全パスするはず）

- [ ] **Step 2: 本番ビルド確認**

```bash
npm run build && npm run preview
```

`http://localhost:4321` でプレビューを確認。

- [ ] **Step 3: 最終コミット（必要な場合）**

未コミットの変更があれば:

```bash
git status
git add <未コミットのファイル>
git commit -m "style: final cleanup"
```
