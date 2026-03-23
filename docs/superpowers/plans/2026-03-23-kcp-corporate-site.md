# KCP Corporate Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 株式会社KCP's corporate website (landing page + blog) using Astro SSG + Tailwind CSS, deployable to Cloudflare Pages.

**Architecture:** Single Astro project with static output. Corporate landing page is a single scrollable page with 7 sections. Blog uses Astro Content Collections (Markdown). No backend — contact via Google Form external link.

**Tech Stack:** Astro 4.x, TypeScript (strict), Tailwind CSS 3.x, @tailwindcss/typography, @astrojs/sitemap, @astrojs/rss, Vitest (unit tests for utilities), sharp (image optimization)

---

## File Map

### Config / Root
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`

### Styles
- Create: `src/styles/global.css` — Tailwind directives, dark scrollbar, `.section-wrapper`, `[data-fade-in]` animation
- Create: `src/styles/prose.css` — Dark theme `.prose` overrides for blog markdown

### Layouts
- Create: `src/layouts/BaseLayout.astro` — `<html lang="ja" class="dark">`, Google Fonts, global meta
- Create: `src/layouts/PageLayout.astro` — BaseLayout + Header + Footer
- Create: `src/layouts/BlogLayout.astro` — PageLayout + article OGP meta + JSON-LD

### UI Primitives
- Create: `src/components/ui/Button.astro` — variant prop: primary/outline/ghost
- Create: `src/components/ui/SectionHeading.astro` — title + subtitle + accent underline
- Create: `src/components/ui/FadeIn.astro` — `data-fade-in` scroll animation wrapper

### Layout Components
- Create: `src/components/layout/Header.astro` — sticky nav, blur backdrop, anchor links, mobile menu (inlined)
- Create: `src/components/layout/Footer.astro` — copyright line

### Scripts
(Note: scroll animation is inlined in `FadeIn.astro`; mobile menu and ToC highlight are inlined in `Header.astro` and `TableOfContents.astro` respectively as `<script>` blocks)

### Utilities (tested with Vitest)
- Create: `src/utils/date.ts` — `formatDateJa()` → "2026年3月23日"
- Create: `src/utils/blog.ts` — `getSortedPosts()`, `getAllTags()`, `getPostsByTag()`
- Create: `src/utils/date.test.ts`
- Create: `src/utils/blog.test.ts`

### Section Components
- Create: `src/components/sections/Hero.astro`
- Create: `src/components/sections/Service.astro`
- Create: `src/components/sections/MVV.astro`
- Create: `src/components/sections/Strength.astro`
- Create: `src/components/sections/BlogPreview.astro`
- Create: `src/components/sections/Company.astro`
- Create: `src/components/sections/Contact.astro`

### Blog Components
- Create: `src/components/blog/PostCard.astro`
- Create: `src/components/blog/TagBadge.astro`
- Create: `src/components/blog/TagFilter.astro`
- Create: `src/components/blog/TableOfContents.astro`
- Create: `src/components/blog/BlogHero.astro`

### Content
- Create: `src/content/config.ts` — Zod schema for blog collection
- Create: `src/content/blog/welcome-to-kcp.md`
- Create: `src/content/blog/ai-jidai-no-gyomu-daiko.md`

### Pages
- Create: `src/pages/index.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/blog/tags/index.astro`
- Create: `src/pages/blog/tags/[tag].astro`
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/404.astro`

### Public
- Create: `public/favicon.svg`
- Create: `public/robots.txt`
- Create: `public/og-default.svg` (placeholder; rename/replace with `.png` before launch)

---

## Task 1: Project Scaffolding (package.json + configs)

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [x] **Step 1: Create package.json**

```json
{
  "name": "kcp-site",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "astro": "^4.0.0",
    "sharp": "^0.33.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [x] **Step 2: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kcp.co.jp',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  build: {
    format: 'directory',
  },
});
```

- [x] **Step 3: Create tailwind.config.mjs**

```js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0a0a0a',
          100: '#141414',
          200: '#1a1a2e',
          300: '#16213e',
        },
        accent: {
          DEFAULT: '#4a9eff',
          dark: '#0066cc',
          muted: '#1a3a5c',
          light: '#7ab8ff',
        },
        'text-primary': '#f0f0f0',
        'text-secondary': '#a0a0b0',
        'text-muted': '#606070',
        border: {
          DEFAULT: '#2a2a3e',
          subtle: '#1e1e2e',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        content: '1200px',
        prose: '780px',
      },
      spacing: {
        section: '5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

- [x] **Step 4: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "*.config.*"]
}
```

- [x] **Step 5: Create .gitignore**

```
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.DS_Store
*.log
```

- [x] **Step 6: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [x] **Step 7: Verify Astro CLI works**

```bash
npx astro --version
```

Expected: prints Astro version number (4.x)

---

## Task 2: Test Setup (Vitest)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__mocks__/astro-content.ts`

- [x] **Step 1: Create src/__mocks__/astro-content.ts**

`astro:content` is a virtual module that only exists inside Astro's build pipeline. Vitest runs in plain Node and cannot resolve it. We need a stub so utility tests can import `blog.ts` without errors.

```ts
// src/__mocks__/astro-content.ts
export type CollectionEntry<T extends string> = {
  id: string;
  slug: string;
  body: string;
  collection: T;
  data: Record<string, unknown>;
  render: () => Promise<{ Content: () => null; headings: unknown[]; remarkPluginFrontmatter: Record<string, unknown> }>;
};

export function getCollection(_name: string) {
  return Promise.resolve([]);
}

export function defineCollection(config: unknown) {
  return config;
}

export const z = {
  object: (schema: unknown) => schema,
  string: () => ({ max: () => ({}) }),
  array: () => ({ default: () => ({}) }),
  boolean: () => ({ default: () => ({}) }),
  coerce: { date: () => ({ optional: () => ({}) }) },
};
```

- [x] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub astro:content virtual module — it only exists in Astro's build pipeline
      'astro:content': path.resolve(__dirname, './src/__mocks__/astro-content.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [x] **Step 3: Run empty test suite to verify setup**

```bash
npm test
```

Expected: "No test files found, exiting with code 0" or similar — no errors.

---

## Task 3: Date Utility (TDD)

**Files:**
- Create: `src/utils/date.ts`
- Create: `src/utils/date.test.ts`

- [x] **Step 1: Write failing tests**

Create `src/utils/date.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatDateJa } from './date';

describe('formatDateJa', () => {
  it('formats a date as Japanese string', () => {
    const date = new Date('2026-03-23');
    expect(formatDateJa(date)).toBe('2026年3月23日');
  });

  it('formats single-digit month and day correctly', () => {
    const date = new Date('2026-01-05');
    expect(formatDateJa(date)).toBe('2026年1月5日');
  });

  it('formats December 31 correctly', () => {
    const date = new Date('2026-12-31');
    expect(formatDateJa(date)).toBe('2026年12月31日');
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './date'"

- [x] **Step 3: Implement date.ts**

Create `src/utils/date.ts`:

```ts
export function formatDateJa(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}年${month}月${day}日`;
}
```

- [x] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: 3 tests PASS

- [x] **Step 5: Commit**

```bash
git init && git add -A && git commit -m "feat: project scaffolding + date utility with tests"
```

---

## Task 4: Blog Utilities (TDD)

**Files:**
- Create: `src/utils/blog.ts`
- Create: `src/utils/blog.test.ts`

- [x] **Step 1: Write failing tests**

Create `src/utils/blog.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getAllTags, getPostsByTag } from './blog';

// Mock post type matching CollectionEntry<'blog'>
const makeMockPost = (slug: string, tags: string[], draft = false) => ({
  id: slug,
  slug,
  body: '',
  collection: 'blog' as const,
  data: {
    title: `Post ${slug}`,
    description: 'desc',
    pubDate: new Date('2026-01-01'),
    tags,
    draft,
    author: 'テスト',
    featured: false,
  },
  render: async () => ({ Content: () => null, headings: [], remarkPluginFrontmatter: {} }),
});

const posts = [
  makeMockPost('post-a', ['AI', '業務効率化']),
  makeMockPost('post-b', ['AI', 'Claude']),
  makeMockPost('post-c', ['ビジネス']),
  makeMockPost('post-d-draft', ['AI'], true),
];

describe('getAllTags', () => {
  it('returns unique tags sorted alphabetically', () => {
    const tags = getAllTags(posts.filter(p => !p.data.draft));
    expect(tags).toEqual(['AI', 'Claude', 'ビジネス', '業務効率化']);
  });
});

describe('getPostsByTag', () => {
  it('filters posts by tag', () => {
    const aiPosts = getPostsByTag(posts, 'AI');
    // includes draft
    expect(aiPosts.map(p => p.slug)).toEqual(['post-a', 'post-b', 'post-d-draft']);
  });

  it('returns empty array for unknown tag', () => {
    expect(getPostsByTag(posts, 'nonexistent')).toEqual([]);
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './blog'"

- [x] **Step 3: Implement blog.ts**

Create `src/utils/blog.ts`:

```ts
import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

export function getSortedPosts(posts: BlogPost[]): BlogPost[] {
  return posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach(post => post.data.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ja'));
}

export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter(post => post.data.tags.includes(tag));
}

export function getReadingTimeMin(body: string): number {
  const wordsPerMinute = 500; // Japanese characters per minute
  const charCount = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(charCount / wordsPerMinute));
}
```

- [x] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: 6 tests PASS (3 date tests + 3 blog tests)

- [x] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: blog utility functions with tests"
```

---

## Task 5: Global Styles

**Files:**
- Create: `src/styles/global.css`
- Create: `src/styles/prose.css`

- [ ] **Step 1: Create global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
    background-color: #0a0a0a;
    color: #f0f0f0;
    font-family: 'Noto Sans JP', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'palt';
  }

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #141414;
  }
  ::-webkit-scrollbar-thumb {
    background: #2a2a3e;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #1a3a5c;
  }
}

@layer components {
  .section-wrapper {
    @apply px-4 sm:px-6 lg:px-8 py-section mx-auto;
    max-width: 1200px;
  }
}

@layer utilities {
  [data-fade-in] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease-out, transform 0.7s ease-out;
  }
  [data-fade-in].is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Create prose.css**

```css
.prose {
  --tw-prose-body: #f0f0f0;
  --tw-prose-headings: #f0f0f0;
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
}
.prose a:hover {
  text-decoration-color: #4a9eff;
}

.prose h2,
.prose h3,
.prose h4 {
  scroll-margin-top: 5rem;
}
```

---

## Task 6: BaseLayout + PageLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/PageLayout.astro`

- [ ] **Step 1: Create BaseLayout.astro**

```astro
---
export interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const {
  title,
  description = 'AI時代に必要な業務を引き受け、お客様が本業に集中できる環境を提供する。株式会社KCPのコーポレートサイト。',
  ogImage = '/og-default.svg',
  noIndex = false,
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
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

    <!-- OGP -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={`${title} | 株式会社KCP`} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />
    <meta property="og:locale" content="ja_JP" />

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
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create PageLayout.astro**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Header from '@/components/layout/Header.astro';
import Footer from '@/components/layout/Footer.astro';
import '@/styles/global.css';

export interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
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

---

## Task 7: Header + Footer + Mobile Menu

**Files:**
- Create: `src/components/layout/Header.astro` (includes inlined mobile menu markup and `<script>` block)
- Create: `src/components/layout/Footer.astro`

- [ ] **Step 1: Create Header.astro**

```astro
---
const navLinks = [
  { href: '/#service', label: 'Service' },
  { href: '/#mvv', label: 'MVV' },
  { href: '/#strength', label: 'Strength' },
  { href: '/blog/', label: 'Blog' },
  { href: '/#company', label: 'Company' },
  { href: '/#contact', label: 'Contact' },
];
---

<header
  class="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md"
  style="background-color: rgba(10,10,10,0.85);"
>
  <div class="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <a href="/" class="text-xl font-bold tracking-widest text-accent hover:text-accent-light transition-colors">
        KCP
      </a>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-8" aria-label="メインナビゲーション">
        {navLinks.map(link => (
          <a
            href={link.href}
            class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <!-- Mobile menu button -->
      <button
        id="mobile-menu-button"
        class="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="メニューを開く"
        aria-expanded="false"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</header>

<!-- Mobile menu overlay -->
<div
  id="mobile-menu"
  class="fixed inset-0 z-40 hidden flex-col items-center justify-center gap-8 bg-base"
  role="dialog"
  aria-modal="true"
  aria-label="モバイルナビゲーション"
>
  <button
    id="mobile-menu-close"
    class="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors"
    aria-label="メニューを閉じる"
  >
    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
  <nav class="flex flex-col items-center gap-8">
    {navLinks.map(link => (
      <a
        href={link.href}
        class="mobile-menu-link text-2xl font-medium text-text-primary hover:text-accent transition-colors"
      >
        {link.label}
      </a>
    ))}
  </nav>
</div>

<script>
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const links = document.querySelectorAll('.mobile-menu-link');

  function openMenu() {
    menu?.classList.remove('hidden');
    menu?.classList.add('flex');
    btn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu?.classList.add('hidden');
    menu?.classList.remove('flex');
    btn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  links.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
</script>
```

- [ ] **Step 2: Create Footer.astro**

```astro
---
const year = new Date().getFullYear();
---

<footer class="border-t border-border/50 py-8">
  <div class="section-wrapper text-center text-sm text-text-muted">
    © {year} 株式会社KCP. All Rights Reserved.
  </div>
</footer>
```

- [ ] **Step 3: Create minimal src/pages/index.astro to test layout**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
---

<PageLayout title="ホーム">
  <div class="section-wrapper pt-24">
    <h1 class="text-4xl font-bold">Under Construction</h1>
  </div>
</PageLayout>
```

- [ ] **Step 4: Create placeholder favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="10" fill="#1a1a2e"/>
  <text x="50" y="72" font-family="sans-serif" font-size="52" font-weight="bold" fill="#4a9eff" text-anchor="middle">K</text>
</svg>
```

Save as `public/favicon.svg`.

- [ ] **Step 5: Run dev server and visually verify header + footer**

```bash
npm run dev
```

Expected: Site opens at http://localhost:4321. Header visible with KCP logo and nav links. Footer with copyright. No console errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: base layouts, header, footer"
```

---

## Task 8: UI Primitives

**Files:**
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/SectionHeading.astro`
- Create: `src/components/ui/FadeIn.astro`

- [ ] **Step 1: Create Button.astro**

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

const base = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-light active:bg-accent-dark disabled:opacity-50',
  outline: 'border border-accent text-accent hover:bg-accent/10 disabled:opacity-50',
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

- [ ] **Step 2: Create SectionHeading.astro**

```astro
---
export interface Props {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const { title, subtitle, align = 'left' } = Astro.props;
const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
---

<div class={`flex flex-col gap-3 mb-12 ${alignClass}`}>
  <h2 class="text-3xl sm:text-4xl font-bold text-text-primary">
    {title}
  </h2>
  <div class="h-1 w-12 rounded bg-accent"></div>
  {subtitle && (
    <p class="mt-2 text-text-secondary text-base leading-relaxed max-w-2xl">
      {subtitle}
    </p>
  )}
</div>
```

- [ ] **Step 3: Create FadeIn.astro**

```astro
---
export interface Props {
  delay?: number;
  class?: string;
}

const { delay = 0, class: className = '' } = Astro.props;
---

<div data-fade-in data-delay={delay} class={className}>
  <slot />
</div>

<script>
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? 0);
          setTimeout(() => el.classList.add('is-visible'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-fade-in]').forEach((el) => observer.observe(el));
</script>
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: UI primitive components (Button, SectionHeading, FadeIn)"
```

---

## Task 9: Hero Section

**Files:**
- Create: `src/components/sections/Hero.astro`

- [ ] **Step 1: Create Hero.astro**

```astro
---
import Button from '@/components/ui/Button.astro';
---

<section
  id="hero"
  class="relative min-h-screen flex items-center justify-center overflow-hidden"
  style="background: radial-gradient(ellipse at 20% 50%, #16213e 0%, #0a0a0a 60%);"
>
  <!-- Subtle grid pattern overlay -->
  <div
    class="absolute inset-0 opacity-5"
    style="background-image: linear-gradient(#4a9eff 1px, transparent 1px), linear-gradient(90deg, #4a9eff 1px, transparent 1px); background-size: 60px 60px;"
  ></div>

  <div class="section-wrapper relative z-10 pt-20 pb-12 text-center">
    <!-- Eyebrow label -->
    <div class="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10">
      <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
      <span class="text-xs font-medium text-accent tracking-widest uppercase">株式会社KCP</span>
    </div>

    <!-- Headline -->
    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-text-primary mb-6">
      AI時代に必要な業務を引き受け、<br class="hidden sm:block" />
      <span class="text-accent">お客様が本業に集中できる</span><br class="hidden sm:block" />
      環境を提供する。
    </h1>

    <!-- Subtext -->
    <p class="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
      BPO・AI研修・SNS運用代行・開発ディレクション・メディア運営を通じて、
      企業の生産性向上を支援します。
    </p>

    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <Button href="#contact" variant="primary">
        お問い合わせ
      </Button>
      <Button href="#service" variant="outline">
        サービスを見る
      </Button>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted">
    <span class="text-xs tracking-widest">SCROLL</span>
    <div class="w-px h-12 bg-gradient-to-b from-text-muted to-transparent"></div>
  </div>
</section>
```

- [ ] **Step 2: Add Hero to index.astro**

Update `src/pages/index.astro`:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import Hero from '@/components/sections/Hero.astro';
---

<PageLayout title="ホーム">
  <Hero />
</PageLayout>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: Full-screen dark hero with gradient, headline text, two CTA buttons, scroll indicator.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Hero section"
```

---

## Task 10: Service Section

**Files:**
- Create: `src/components/sections/Service.astro`

- [ ] **Step 1: Create Service.astro**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

const services = [
  {
    icon: '📱',
    title: 'SNS運用代行',
    description: 'AI自動投稿・分析を活用した効率的なSNS運用で、ブランドの存在感を高めます。',
  },
  {
    icon: '💻',
    title: 'Web・アプリ開発',
    description: 'Webサイト・アプリ開発を行います。PM・ディレクション代行のみの対応も可能です。',
  },
  {
    icon: '🤖',
    title: 'AI活用研修',
    description: '企業向けAIツール導入・活用支援。現場に合ったAI活用で業務効率を向上します。',
  },
  {
    icon: '📝',
    title: 'メディア運営',
    description: '業務効率化のためのAI・デジタルツール活用などについてのブログを運営しています。',
  },
];
---

<section id="service" class="py-section" style="background-color: #0f0f0f;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading
        title="Service"
        subtitle="AIの力を活かした業務代行で、お客様のコアビジネスに集中できる環境を作ります。"
      />
    </FadeIn>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service, i) => (
        <FadeIn delay={i * 100}>
          <div class="flex flex-col gap-4 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/50 transition-colors duration-300 h-full">
            <div class="text-4xl">{service.icon}</div>
            <h3 class="text-lg font-semibold text-text-primary">{service.title}</h3>
            <p class="text-text-secondary text-sm leading-relaxed flex-1">{service.description}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add to index.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import Hero from '@/components/sections/Hero.astro';
import Service from '@/components/sections/Service.astro';
---

<PageLayout title="ホーム">
  <Hero />
  <Service />
</PageLayout>
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: Service section"
```

---

## Task 11: MVV Section

**Files:**
- Create: `src/components/sections/MVV.astro`

- [ ] **Step 1: Create MVV.astro**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

const values = [
  {
    title: 'シンプル・小さく・速く',
    description: '複雑さと大きく動くのはコスト。全ての業務を一つずつシンプルに小さくとらえ、それでいて速くこなしていく。',
  },
  {
    title: '複利で積み上げる',
    description: '一回の仕事で終わらせない。積み重ねが次の価値を生む。',
  },
  {
    title: '常に進化する',
    description: '経験に頼らず、現状の軌道を注視し、勝っているときでも新たな手を打つ。',
  },
];
---

<section id="mvv" class="py-section" style="background-color: #0a0a0a;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading title="Mission / Vision / Values" />
    </FadeIn>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <!-- Mission -->
      <FadeIn delay={100}>
        <div class="p-8 rounded-2xl border border-accent/30 bg-base-200">
          <p class="text-xs font-medium text-accent tracking-widest uppercase mb-4">Mission</p>
          <p class="text-2xl font-bold text-text-primary leading-relaxed">
            AI時代に必要な業務を引き受け、お客様が本業に集中できる環境を提供する。
          </p>
        </div>
      </FadeIn>

      <!-- Vision -->
      <FadeIn delay={200}>
        <div class="p-8 rounded-2xl border border-border bg-base-100">
          <p class="text-xs font-medium text-accent tracking-widest uppercase mb-4">Vision</p>
          <p class="text-xl font-semibold text-text-primary leading-relaxed">
            AIエージェントを駆使した高効率・低コストの代行業で、世界市場に通用するBPO企業を築く。
          </p>
        </div>
      </FadeIn>
    </div>

    <!-- Values -->
    <FadeIn delay={100}>
      <p class="text-xs font-medium text-accent tracking-widest uppercase mb-8">Values</p>
    </FadeIn>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {values.map((value, i) => (
        <FadeIn delay={i * 100 + 200}>
          <div class="flex flex-col gap-3 p-6 rounded-xl border-l-2 border-accent bg-base-100 pl-6">
            <h3 class="text-base font-bold text-text-primary">{value.title}</h3>
            <p class="text-text-secondary text-sm leading-relaxed">{value.description}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add MVV to index.astro**

Update `src/pages/index.astro`:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import Hero from '@/components/sections/Hero.astro';
import Service from '@/components/sections/Service.astro';
import MVV from '@/components/sections/MVV.astro';
---

<PageLayout title="ホーム">
  <Hero />
  <Service />
  <MVV />
</PageLayout>
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: MVV section"
```

---

## Task 12: Strength + Company + Contact Sections

**Files:**
- Create: `src/components/sections/Strength.astro`
- Create: `src/components/sections/Company.astro`
- Create: `src/components/sections/Contact.astro`

- [ ] **Step 1: Create Strength.astro**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

const strengths = [
  {
    number: '01',
    title: 'AIエージェント活用',
    description: 'Claude Code等を駆使した高効率・低コストの業務代行。AIの力を最大限に活かして、従来の何倍もの速度で高品質な成果を提供します。',
  },
  {
    number: '02',
    title: '技術とビジネスの橋渡し',
    description: '非技術者出身ならではのAI活用や技術の活用術、わかりやすい説明が可能です。難しい技術も、現場で使える言葉でお伝えします。',
  },
  {
    number: '03',
    title: '英語対応・海外知見',
    description: '海外のコネクションを活かし、翻訳や海外マーケティング支援の対応も可能です。グローバル視点でビジネスをサポートします。',
  },
];
---

<section id="strength" class="py-section" style="background-color: #0f0f0f;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading
        title="Strength"
        subtitle="KCPが選ばれる3つの理由"
      />
    </FadeIn>

    <div class="flex flex-col gap-8">
      {strengths.map((item, i) => (
        <FadeIn delay={i * 100}>
          <div class="flex gap-6 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/30 transition-colors duration-300">
            <span class="text-4xl font-bold text-accent/30 font-mono shrink-0 leading-none mt-1">{item.number}</span>
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-bold text-text-primary">{item.title}</h3>
              <p class="text-text-secondary text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create Company.astro**

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

const companyInfo = [
  { label: '会社名', value: '株式会社KCP' },
  { label: '代表者', value: '中野 健太朗' },
  { label: '設立', value: '2026年4月（予定）' },
  { label: '所在地', value: '東京都世田谷区（バーチャルオフィス）' },
  { label: '事業内容', value: 'BPO・AI研修・SNS運用代行・開発ディレクション・メディア運営' },
  { label: '資本金', value: '100万円' },
];
---

<section id="company" class="py-section" style="background-color: #0a0a0a;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading title="Company" subtitle="会社概要" />
    </FadeIn>

    <FadeIn delay={100}>
      <div class="overflow-hidden rounded-xl border border-border">
        <table class="w-full">
          <tbody>
            {companyInfo.map((row, i) => (
              <tr class={i % 2 === 0 ? 'bg-base-100' : 'bg-base'}>
                <th class="px-6 py-4 text-left text-sm font-medium text-text-secondary w-40 shrink-0 border-r border-border">
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

- [ ] **Step 3: Create Contact.astro**

```astro
---
import Button from '@/components/ui/Button.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

// Replace with actual Google Form URL
const GOOGLE_FORM_URL = 'https://forms.google.com/';
---

<section id="contact" class="py-section" style="background-color: #0f0f0f;">
  <div class="section-wrapper">
    <FadeIn>
      <div class="max-w-2xl mx-auto text-center">
        <p class="text-xs font-medium text-accent tracking-widest uppercase mb-4">Contact</p>
        <h2 class="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          お問い合わせ
        </h2>
        <p class="text-text-secondary text-lg mb-10 leading-relaxed">
          まずはお気軽にご相談ください。<br />
          ご要望をお聞きした上で、最適なプランをご提案します。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href={GOOGLE_FORM_URL} variant="primary" target="_blank">
            お問い合わせフォーム
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </div>
      </div>
    </FadeIn>
  </div>
</section>
```

- [ ] **Step 4: Update index.astro with all sections**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import Hero from '@/components/sections/Hero.astro';
import Service from '@/components/sections/Service.astro';
import MVV from '@/components/sections/MVV.astro';
import Strength from '@/components/sections/Strength.astro';
import BlogPreview from '@/components/sections/BlogPreview.astro';
import Company from '@/components/sections/Company.astro';
import Contact from '@/components/sections/Contact.astro';
---

<PageLayout title="ホーム">
  <Hero />
  <Service />
  <MVV />
  <Strength />
  <BlogPreview />
  <Company />
  <Contact />
</PageLayout>
```

(Note: BlogPreview will be created in Task 15. For now, comment it out.)

- [ ] **Step 5: Verify full landing page in browser, commit**

```bash
npm run dev
```

Expected: All sections visible, smooth scroll between anchor links, fade-in animations on scroll.

```bash
git add -A && git commit -m "feat: Strength, Company, Contact sections + complete landing page"
```

---

## Task 13: Content Collections Schema + Sample Posts

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/welcome-to-kcp.md`
- Create: `src/content/blog/ai-jidai-no-gyomu-daiko.md`

- [ ] **Step 1: Create src/content/config.ts**

```ts
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
  }),
});

export const collections = {
  blog: blogCollection,
};
```

- [ ] **Step 2: Create welcome-to-kcp.md**

```markdown
---
title: "株式会社KCPを設立しました"
description: "AI時代のBPO企業として、お客様の業務効率化を支援する株式会社KCPを設立しました。"
pubDate: 2026-04-01
tags: ["KCP", "お知らせ"]
featured: true
author: "中野健太朗"
---

## はじめに

株式会社KCPを設立しました。

私たちは、AIの力を活用して企業の業務を効率化し、お客様が本業に集中できる環境を提供することを使命としています。

## KCPが解決する課題

現代のビジネスでは、本業以外の業務（SNS運用、ドキュメント作成、データ管理など）に多くの時間が取られています。これらの業務をAIと人の力を組み合わせて引き受けることで、お客様は本業に100%集中できます。

## 提供サービス

- **SNS運用代行**: AI自動化を活用した効率的な運用
- **Web・アプリ開発**: 要件定義からディレクションまで
- **AI活用研修**: 企業向けAIツール導入支援
- **メディア運営**: AI・業務効率化に関するブログ

## 今後について

まずは小さく始め、複利で成果を積み上げていきます。ご興味のある方は、お気軽にお問い合わせください。
```

- [ ] **Step 3: Create ai-jidai-no-gyomu-daiko.md**

```markdown
---
title: "AI時代の業務代行とは何か"
description: "AIエージェントを活用した新しい業務代行のあり方について解説します。"
pubDate: 2026-04-10
tags: ["AI活用", "業務効率化", "BPO"]
featured: true
author: "中野健太朗"
---

## AI時代の業務代行

従来のBPO（ビジネスプロセスアウトソーシング）は、人員を大量投入することで成り立っていました。しかしAIの登場により、この構図は大きく変わりつつあります。

## AIエージェントの可能性

Claude CodeやGPT-4などのAIエージェントは、以下のような業務を高速・低コストで実行できます：

- コンテンツ生成・編集
- データ分析・レポート作成
- コードの記述・レビュー
- 翻訳・多言語対応

## KCPのアプローチ

私たちは「AIエージェント × 人間の判断力」の組み合わせで、従来の何倍もの生産性を実現します。

### シンプル・小さく・速く

一つひとつの業務をシンプルに分解し、AIに任せられる部分は徹底的に自動化。人間はクリエイティブな判断と品質確認に集中します。

## おわりに

AI時代の業務代行は、単なる「人件費削減」ではなく「質の向上」を目指すものです。ご興味のある方はお気軽にご相談ください。
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Content Collections schema + sample blog posts"
```

---

## Task 14: Blog Components (PostCard, TagBadge)

**Files:**
- Create: `src/components/blog/PostCard.astro`
- Create: `src/components/blog/TagBadge.astro`

- [ ] **Step 1: Create TagBadge.astro**

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
  : 'bg-accent/10 text-accent hover:bg-accent/20';

const classes = `${base} ${sizes[size]} ${states}`;
---

{href ? (
  <a href={href} class={classes}>{tag}</a>
) : (
  <span class={classes}>{tag}</span>
)}
```

- [ ] **Step 2: Create PostCard.astro**

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';
import { formatDateJa } from '@/utils/date';
import { getReadingTimeMin } from '@/utils/blog';

export interface Props {
  post: CollectionEntry<'blog'>;
  compact?: boolean;
}

const { post, compact = false } = Astro.props;
const { title, description, pubDate, tags } = post.data;
const readMin = getReadingTimeMin(post.body);
---

<article class={`group flex flex-col gap-4 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 ${compact ? '' : 'hover:-translate-y-1'}`}>
  <!-- Tags -->
  <div class="flex flex-wrap gap-2">
    {tags.slice(0, 3).map(tag => (
      <TagBadge tag={tag} href={`/blog/tags/${tag}/`} />
    ))}
  </div>

  <!-- Title -->
  <h2 class={`font-bold text-text-primary group-hover:text-accent transition-colors ${compact ? 'text-base' : 'text-xl'}`}>
    <a href={`/blog/${post.slug}/`} class="stretched-link">
      {title}
    </a>
  </h2>

  <!-- Description -->
  {!compact && (
    <p class="text-text-secondary text-sm leading-relaxed line-clamp-3">{description}</p>
  )}

  <!-- Meta -->
  <div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
    <time datetime={pubDate.toISOString()}>{formatDateJa(pubDate)}</time>
    <span>·</span>
    <span>約{readMin}分</span>
  </div>
</article>
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: PostCard and TagBadge blog components"
```

---

## Task 15: Blog Index Page + BlogPreview Section

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/components/sections/BlogPreview.astro`
- Create: `src/components/blog/TagFilter.astro`

- [ ] **Step 1: Create TagFilter.astro**

```astro
---
export interface Props {
  tags: string[];
  activeTag?: string;
}

const { tags, activeTag } = Astro.props;
---

<nav class="flex flex-wrap gap-2 mb-8" aria-label="タグフィルター">
  <a
    href="/blog/"
    class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      !activeTag ? 'bg-accent text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
    }`}
  >
    すべて
  </a>
  {tags.map(tag => (
    <a
      href={`/blog/tags/${tag}/`}
      class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        activeTag === tag ? 'bg-accent text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
      }`}
    >
      {tag}
    </a>
  ))}
</nav>
```

- [ ] **Step 2: Create src/pages/blog/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import PostCard from '@/components/blog/PostCard.astro';
import TagFilter from '@/components/blog/TagFilter.astro';
import { getSortedPosts, getAllTags } from '@/utils/blog';

const allPosts = await getCollection('blog');
const posts = getSortedPosts(allPosts);
const tags = getAllTags(posts);
---

<PageLayout
  title="ブログ"
  description="AI活用・業務効率化・デジタルトランスフォーメーションに関する記事を発信しています。"
>
  <div class="section-wrapper pt-24 pb-16">
    <h1 class="text-4xl font-bold text-text-primary mb-4">Blog</h1>
    <p class="text-text-secondary mb-10">AI活用・業務効率化に関する記事を発信しています。</p>

    <TagFilter tags={tags} />

    {posts.length === 0 ? (
      <p class="text-text-muted text-center py-16">記事がありません。</p>
    ) : (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard post={post} />
        ))}
      </div>
    )}
  </div>
</PageLayout>
```

- [ ] **Step 3: Create BlogPreview.astro**

```astro
---
import { getCollection } from 'astro:content';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import PostCard from '@/components/blog/PostCard.astro';
import Button from '@/components/ui/Button.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import { getSortedPosts } from '@/utils/blog';

const allPosts = await getCollection('blog');
const featuredPosts = getSortedPosts(allPosts).slice(0, 3);
---

{featuredPosts.length > 0 && (
  <section id="blog" class="py-section" style="background-color: #0a0a0a;">
    <div class="section-wrapper">
      <FadeIn>
        <SectionHeading title="Blog" subtitle="AI活用・業務効率化に関する最新記事" />
      </FadeIn>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {featuredPosts.map((post, i) => (
          <FadeIn delay={i * 100}>
            <PostCard post={post} />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={200}>
        <div class="text-center">
          <Button href="/blog/" variant="outline">記事一覧を見る</Button>
        </div>
      </FadeIn>
    </div>
  </section>
)}
```

- [ ] **Step 4: Uncomment BlogPreview in index.astro**

Update `src/pages/index.astro` to include `import BlogPreview from '@/components/sections/BlogPreview.astro';` and add `<BlogPreview />` between Strength and Company sections.

- [ ] **Step 5: Verify /blog/ page and blog preview on landing page**

```bash
npm run dev
```

Expected: /blog/ shows 2 post cards. Landing page shows blog preview section.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: blog listing page + BlogPreview section on landing"
```

---

## Task 16: BlogLayout + Article Page

**Files:**
- Create: `src/layouts/BlogLayout.astro`
- Create: `src/components/blog/BlogHero.astro`
- Create: `src/components/blog/TableOfContents.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Create BlogLayout.astro**

```astro
---
import PageLayout from './PageLayout.astro';
import type { CollectionEntry } from 'astro:content';
import '@/styles/prose.css';

export interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, description, pubDate, ogImage } = post.data;
const ogImageUrl = ogImage ?? '/og-default.svg';
---

<PageLayout title={title} description={description} ogImage={ogImageUrl}>
  <slot />
</PageLayout>
```

- [ ] **Step 2: Create BlogHero.astro**

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
  <div class="flex flex-wrap gap-2 mb-4">
    {tags.map(tag => <TagBadge tag={tag} href={`/blog/tags/${tag}/`} size="md" />)}
  </div>
  <h1 class="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-6">{title}</h1>
  <div class="flex flex-wrap items-center gap-4 text-sm text-text-muted pb-6 border-b border-border">
    <span>{author}</span>
    <span>·</span>
    <time datetime={pubDate.toISOString()}>{formatDateJa(pubDate)}</time>
    {updatedDate && (
      <>
        <span>·</span>
        <span>更新: <time datetime={updatedDate.toISOString()}>{formatDateJa(updatedDate)}</time></span>
      </>
    )}
    <span>·</span>
    <span>約{readMin}分で読めます</span>
  </div>
</div>
```

- [ ] **Step 3: Create TableOfContents.astro**

```astro
---
export interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;
const toc = headings.filter(h => h.depth === 2 || h.depth === 3);
---

{toc.length > 0 && (
  <nav class="sticky top-24 p-4 rounded-xl border border-border bg-base-100 text-sm" aria-label="目次">
    <p class="text-xs font-medium text-text-muted uppercase tracking-widest mb-3">目次</p>
    <ul class="flex flex-col gap-1">
      {toc.map(heading => (
        <li class={heading.depth === 3 ? 'pl-4' : ''}>
          <a
            href={`#${heading.slug}`}
            class="toc-link block py-1 text-text-secondary hover:text-accent transition-colors truncate"
            data-toc-heading={heading.slug}
          >
            {heading.text}
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

- [ ] **Step 4: Create src/pages/blog/[slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import BlogLayout from '@/layouts/BlogLayout.astro';
import BlogHero from '@/components/blog/BlogHero.astro';
import TableOfContents from '@/components/blog/TableOfContents.astro';
import Button from '@/components/ui/Button.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await post.render();
---

<BlogLayout post={post}>
  <div class="section-wrapper pt-24 pb-16">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 items-start">
      <!-- Article -->
      <article>
        <BlogHero post={post} />
        <div class="prose prose-lg max-w-none">
          <Content />
        </div>
        <div class="mt-12 pt-8 border-t border-border">
          <Button href="/blog/" variant="ghost">← ブログ一覧へ戻る</Button>
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="hidden lg:block">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  </div>
</BlogLayout>
```

- [ ] **Step 5: Add rehype-slug for heading anchors**

```bash
npm install rehype-slug rehype-autolink-headings
```

Replace the entire `astro.config.mjs` with this complete file:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://kcp.co.jp',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
  build: {
    format: 'directory',
  },
});
```

- [ ] **Step 6: Verify article page renders correctly**

```bash
npm run dev
```

Navigate to http://localhost:4321/blog/welcome-to-kcp/

Expected: Article page with hero (title, date, tags, reading time), rendered markdown content, sidebar ToC (desktop only), "back to blog" button.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: blog article page with ToC sidebar"
```

---

## Task 17: Tag Pages

**Files:**
- Create: `src/pages/blog/tags/index.astro`
- Create: `src/pages/blog/tags/[tag].astro`

- [ ] **Step 1: Create tags/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { getAllTags, getSortedPosts, getPostsByTag } from '@/utils/blog';

const allPosts = await getCollection('blog');
const posts = getSortedPosts(allPosts);
const tags = getAllTags(posts);
---

<PageLayout title="タグ一覧">
  <div class="section-wrapper pt-24 pb-16">
    <h1 class="text-4xl font-bold text-text-primary mb-10">タグ一覧</h1>
    <div class="flex flex-wrap gap-3">
      {tags.map(tag => {
        const count = getPostsByTag(posts, tag).length;
        return (
          <a
            href={`/blog/tags/${tag}/`}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-base-100 hover:border-accent/50 text-text-secondary hover:text-accent transition-colors"
          >
            <span class="text-sm font-medium">{tag}</span>
            <span class="text-xs text-text-muted">({count})</span>
          </a>
        );
      })}
    </div>
  </div>
</PageLayout>
```

- [ ] **Step 2: Create tags/[tag].astro**

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import PostCard from '@/components/blog/PostCard.astro';
import { getAllTags, getSortedPosts, getPostsByTag } from '@/utils/blog';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const posts = getSortedPosts(allPosts);
  const tags = getAllTags(posts);

  return tags.map(tag => ({
    params: { tag },
    props: { tag, posts: getPostsByTag(posts, tag) },
  }));
}

const { tag, posts } = Astro.props;
---

<PageLayout title={`${tag} の記事`} description={`${tag} タグが付いた記事一覧`}>
  <div class="section-wrapper pt-24 pb-16">
    <div class="flex items-center gap-3 mb-10">
      <a href="/blog/tags/" class="text-text-muted hover:text-text-secondary transition-colors text-sm">タグ一覧</a>
      <span class="text-border">/</span>
      <h1 class="text-2xl font-bold text-text-primary">{tag}</h1>
      <span class="text-sm text-text-muted">({posts.length}件)</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => <PostCard post={post} />)}
    </div>
  </div>
</PageLayout>
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: tag index and tag-filtered blog pages"
```

---

## Task 18: RSS Feed + SEO Polish

**Files:**
- Create: `src/pages/rss.xml.ts`
- Create: `public/robots.txt`
- Create: `public/og-default.svg` (placeholder SVG; replace with 1200x630 PNG before production launch)
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create rss.xml.ts**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSortedPosts } from '@/utils/blog';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('blog');
  const posts = getSortedPosts(allPosts);

  return rss({
    title: '株式会社KCP ブログ',
    description: 'AI活用・業務効率化・デジタルトランスフォーメーションに関する記事',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: '<language>ja</language>',
  });
}
```

- [ ] **Step 2: Create public/robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://kcp.co.jp/sitemap-index.xml
```

- [ ] **Step 3: Create 404.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
---

<PageLayout title="404 - ページが見つかりません">
  <div class="section-wrapper pt-32 pb-16 text-center">
    <p class="text-8xl font-bold text-accent/20 mb-4">404</p>
    <h1 class="text-2xl font-bold text-text-primary mb-4">ページが見つかりません</h1>
    <p class="text-text-secondary mb-10">お探しのページは移動または削除された可能性があります。</p>
    <a href="/" class="text-accent hover:text-accent-light transition-colors">← トップページへ戻る</a>
  </div>
</PageLayout>
```

- [ ] **Step 4: Create public/og-default.svg placeholder**

BaseLayout uses `/og-default.svg` as its default OGP image. Create a placeholder SVG (replace with a real 1200x630 PNG before launch — rename to `og-default.png` and update `BaseLayout.astro` default accordingly). Create `public/og-default.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect x="0" y="0" width="1200" height="630" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16213e;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <text x="600" y="280" font-family="sans-serif" font-size="96" font-weight="bold" fill="#4a9eff" text-anchor="middle">KCP</text>
  <text x="600" y="370" font-family="sans-serif" font-size="28" fill="#a0a0b0" text-anchor="middle">株式会社KCP</text>
  <text x="600" y="430" font-family="sans-serif" font-size="20" fill="#606070" text-anchor="middle">AI時代のBPO企業</text>
</svg>
```

Note: OGP requires PNG. Replace `public/og-default.svg` with a proper 1200x630 PNG before launch.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: RSS feed, robots.txt, 404 page"
```

---

## Task 19: Build Verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests PASS (date utils + blog utils)

- [ ] **Step 2: Run Astro type check**

```bash
npx astro check
```

Expected: 0 errors, 0 warnings (or only warnings about optional fields)

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Build completes with 0 errors. Output in `dist/`.

- [ ] **Step 4: Verify build output**

```bash
ls dist/
ls dist/blog/
ls dist/blog/tags/
```

Expected:
- `dist/index.html` exists
- `dist/blog/index.html` exists
- `dist/blog/welcome-to-kcp/index.html` exists
- `dist/blog/tags/AI/index.html` exists
- `dist/rss.xml` exists
- `dist/sitemap-index.xml` exists

- [ ] **Step 5: Preview production build**

```bash
npm run preview
```

Navigate to http://localhost:4321 and verify all pages load correctly.

- [ ] **Step 6: Check mobile layout**

Open Chrome DevTools → Device Toolbar. Test at 375px (iPhone), 768px (iPad), 1024px (desktop). Verify:
- Mobile menu (hamburger) opens/closes
- Sections are readable on mobile
- Blog cards stack to single column on mobile

- [ ] **Step 7: Final commit**

```bash
git add -A && git commit -m "feat: complete KCP corporate site Phase 1"
```

---

## Cloudflare Pages Deployment (Manual Steps)

These steps require user action in the browser — not automated:

1. Push repo to GitHub: `git remote add origin <repo-url> && git push -u origin main`
2. Go to Cloudflare Pages dashboard → "Create a project" → Connect GitHub
3. Select the `kcp-site` repo
4. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy → Wait for build to complete
6. Verify at the generated `*.pages.dev` URL:
   - Homepage loads
   - `/blog/` loads
   - `/rss.xml` returns valid RSS
   - `/sitemap-index.xml` loads

---

## Post-Launch Checklist

- [ ] Replace Google Form URL in `Contact.astro` with actual form URL
- [ ] Replace `og-default.svg` with a proper 1200x630 PNG
- [ ] Update `site` in `astro.config.mjs` with actual domain
- [ ] Update `robots.txt` sitemap URL with actual domain
- [ ] Add Cloudflare Web Analytics script to `BaseLayout.astro`
