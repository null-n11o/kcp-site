# Link Card Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Markdown 内で単独行に書いた URL を、内部ブログ記事カード（株式会社KCP Blog）または外部リンクカード（参考資料）として自動表示する remark プラグインを実装する。

**Architecture:** `src/plugins/remark-link-card.ts` に単一の remark プラグインを実装する。段落ノードが bare URL リンク1つのみで構成されている場合を検出し、内部URL（kcp.co.jp/blog/*）はファイルシステムからフロントマターを取得、外部URLはOGPキャッシュ（`src/data/ogp-cache.json`）を参照またはフェッチしてHTMLカードノードに変換する。

**Tech Stack:** unist-util-visit（Astro依存に含まれる）, @types/mdast（同上）, gray-matter（要インストール）, Node.js built-in fetch, Vitest

---

## ファイル構成

| ファイル | 種別 | 役割 |
|---|---|---|
| `src/plugins/remark-link-card.ts` | 新規作成 | プラグイン本体（純粋関数をエクスポートしてテスト可能にする） |
| `src/plugins/remark-link-card.test.ts` | 新規作成 | Vitest ユニットテスト |
| `src/data/ogp-cache.json` | 新規作成 | OGPキャッシュ（ビルド間で永続化） |
| `astro.config.mjs` | 修正 | remarkPlugins に追加 |
| `package.json` | 修正 | gray-matter を追加 |

---

## Task 1: ブランチ作成・依存インストール・ファイルスケルトン

**Files:**
- Modify: `package.json`
- Create: `src/data/ogp-cache.json`
- Create: `src/plugins/remark-link-card.ts`（スケルトン）
- Create: `src/plugins/remark-link-card.test.ts`（スケルトン）

- [ ] **Step 1: feature ブランチを作成する**

```bash
git checkout -b feat/link-card-embed
```

- [ ] **Step 2: gray-matter をインストールする**

```bash
npm install gray-matter
```

Expected: `package.json` の `dependencies` に `"gray-matter": "^4.x.x"` が追加される。

- [ ] **Step 3: `src/data/ogp-cache.json` を作成する**

内容:
```json
{}
```

- [ ] **Step 4: `src/plugins/remark-link-card.ts` スケルトンを作成する**

```typescript
import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Link, Text } from 'mdast';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

// --- Types ---

export interface InternalPostData {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  body: string;
}

export interface OgpData {
  title: string;
  description: string;
  fetchedAt: string;
}

export interface RemarkLinkCardOptions {
  cachePath?: string;
  contentDir?: string;
}

// --- Exports (implemented in later tasks) ---

export function isStandaloneUrl(_node: Paragraph): boolean { return false; }
export function isInternalBlogUrl(_url: string): boolean { return false; }
export function extractSlug(_url: string): string { return ''; }
export function buildInternalCard(_data: InternalPostData, _slug: string): string { return ''; }
export function buildExternalCard(_url: string, _ogp: OgpData): string { return ''; }
export function readInternalPostData(_slug: string, _contentDir?: string): InternalPostData | null { return null; }
export function readOgpCache(_cachePath: string): Record<string, OgpData> { return {}; }
export function writeOgpCache(_cachePath: string, _cache: Record<string, OgpData>): void {}
export async function fetchOgpData(_url: string): Promise<OgpData> { return { title: '', description: '', fetchedAt: '' }; }
export async function getOgp(_url: string, _cachePath?: string): Promise<OgpData> { return { title: '', description: '', fetchedAt: '' }; }

export default function remarkLinkCard(_options: RemarkLinkCardOptions = {}) {
  return async function (_tree: Root): Promise<void> {};
}
```

- [ ] **Step 5: `src/plugins/remark-link-card.test.ts` スケルトンを作成する**

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Paragraph, Root } from 'mdast';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import remarkLinkCard, {
  isStandaloneUrl,
  isInternalBlogUrl,
  extractSlug,
  buildInternalCard,
  buildExternalCard,
  readInternalPostData,
  readOgpCache,
  writeOgpCache,
  getOgp,
} from './remark-link-card.ts';

// Helper: bare URL paragraph ノードを生成する
function makeParagraphWithBareUrl(url: string): Paragraph {
  return {
    type: 'paragraph',
    children: [{ type: 'link', url, children: [{ type: 'text', value: url }] }],
  } as Paragraph;
}

// Helper: テキスト付きリンク段落ノードを生成する
function makeParagraphWithTextLink(url: string, text: string): Paragraph {
  return {
    type: 'paragraph',
    children: [{ type: 'link', url, children: [{ type: 'text', value: text }] }],
  } as Paragraph;
}
```

- [ ] **Step 6: テストが実行可能なことを確認する（スケルトン段階）**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: テストが0件でパス（スケルトンにテストケースはまだない）。

- [ ] **Step 7: コミットする**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts src/data/ogp-cache.json package.json package-lock.json
git commit -m "feat: scaffold remark-link-card plugin and install gray-matter"
```

---

## Task 2: URL 検出ヘルパー（TDD）

**Files:**
- Modify: `src/plugins/remark-link-card.test.ts`（テスト追加）
- Modify: `src/plugins/remark-link-card.ts`（実装）

- [ ] **Step 1: テストを追加する**

`src/plugins/remark-link-card.test.ts` のスケルトン末尾に追記:

```typescript
describe('isStandaloneUrl', () => {
  it('returns true for a paragraph with only a bare URL link', () => {
    const node = makeParagraphWithBareUrl('https://example.com');
    expect(isStandaloneUrl(node)).toBe(true);
  });

  it('returns false when link text differs from URL', () => {
    const node = makeParagraphWithTextLink('https://example.com', 'Read more');
    expect(isStandaloneUrl(node)).toBe(false);
  });

  it('returns false when paragraph has multiple children', () => {
    const node: Paragraph = {
      type: 'paragraph',
      children: [
        { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'https://example.com' }] },
        { type: 'text', value: ' and more' },
      ],
    } as Paragraph;
    expect(isStandaloneUrl(node)).toBe(false);
  });
});

describe('isInternalBlogUrl', () => {
  it('returns true for kcp.co.jp/blog/* URLs', () => {
    expect(isInternalBlogUrl('https://kcp.co.jp/blog/my-article')).toBe(true);
  });

  it('returns true for kcp.co.jp/blog/* with trailing slash', () => {
    expect(isInternalBlogUrl('https://kcp.co.jp/blog/my-article/')).toBe(true);
  });

  it('returns false for external blog URLs', () => {
    expect(isInternalBlogUrl('https://example.com/blog/post')).toBe(false);
  });

  it('returns false for kcp.co.jp non-blog URLs', () => {
    expect(isInternalBlogUrl('https://kcp.co.jp/about')).toBe(false);
  });

  it('returns false for invalid URLs', () => {
    expect(isInternalBlogUrl('not-a-url')).toBe(false);
  });
});

describe('extractSlug', () => {
  it('extracts slug from /blog/slug/', () => {
    expect(extractSlug('https://kcp.co.jp/blog/my-article/')).toBe('my-article');
  });

  it('extracts slug from /blog/slug without trailing slash', () => {
    expect(extractSlug('https://kcp.co.jp/blog/my-article')).toBe('my-article');
  });
});
```

- [ ] **Step 2: テストを実行してすべてが FAIL することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 7件すべて FAIL。

- [ ] **Step 3: 実装する**

`src/plugins/remark-link-card.ts` の `isStandaloneUrl`, `isInternalBlogUrl`, `extractSlug` を以下に置き換える:

```typescript
export function isStandaloneUrl(node: Paragraph): boolean {
  if (node.children.length !== 1) return false;
  const child = node.children[0];
  if (child.type !== 'link') return false;
  const link = child as Link;
  if (link.children.length !== 1) return false;
  const text = link.children[0];
  if (text.type !== 'text') return false;
  return (text as Text).value === link.url;
}

export function isInternalBlogUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'kcp.co.jp' && parsed.pathname.startsWith('/blog/');
  } catch {
    return false;
  }
}

export function extractSlug(url: string): string {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts[1] ?? '';
}
```

- [ ] **Step 4: テストを実行してすべてが PASS することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 7件すべて PASS。

- [ ] **Step 5: コミットする**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "feat: implement URL detection helpers with tests"
```

---

## Task 3: カード HTML ビルダー（TDD）

**Files:**
- Modify: `src/plugins/remark-link-card.test.ts`（テスト追加）
- Modify: `src/plugins/remark-link-card.ts`（実装）

- [ ] **Step 1: テストを追加する**

`src/plugins/remark-link-card.test.ts` に追記:

```typescript
describe('buildInternalCard', () => {
  const sampleData: import('./remark-link-card.ts').InternalPostData = {
    title: 'テスト記事',
    description: '説明文です',
    pubDate: new Date('2026-04-24T00:00:00.000Z'),
    tags: ['AI', 'Business'],
    body: 'あ'.repeat(1000),
  };

  it('contains label, title, description', () => {
    const html = buildInternalCard(sampleData, 'test-slug');
    expect(html).toContain('株式会社KCP Blog');
    expect(html).toContain('テスト記事');
    expect(html).toContain('説明文です');
  });

  it('links to /blog/slug/', () => {
    const html = buildInternalCard(sampleData, 'test-slug');
    expect(html).toContain('href="/blog/test-slug/"');
  });

  it('shows up to 3 tags and omits 4th', () => {
    const data = { ...sampleData, tags: ['A', 'B', 'C', 'D'] };
    const html = buildInternalCard(data, 'slug');
    expect(html).toContain('>A<');
    expect(html).toContain('>B<');
    expect(html).toContain('>C<');
    expect(html).not.toContain('>D<');
  });

  it('escapes HTML special chars in title', () => {
    const data = { ...sampleData, title: '<script>alert(1)</script>' };
    const html = buildInternalCard(data, 'slug');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('shows reading time', () => {
    const html = buildInternalCard(sampleData, 'slug');
    expect(html).toMatch(/約\d+分/);
  });
});

describe('buildExternalCard', () => {
  const ogp: import('./remark-link-card.ts').OgpData = {
    title: 'Example Article',
    description: 'Some description',
    fetchedAt: '2026-04-24T00:00:00.000Z',
  };

  it('contains label, title, description, domain', () => {
    const html = buildExternalCard('https://example.com/article', ogp);
    expect(html).toContain('参考資料');
    expect(html).toContain('Example Article');
    expect(html).toContain('Some description');
    expect(html).toContain('example.com');
  });

  it('uses URL as title when og:title is empty', () => {
    const html = buildExternalCard('https://example.com/article', { ...ogp, title: '' });
    expect(html).toContain('https://example.com/article');
  });

  it('omits description element when og:description is empty', () => {
    const html = buildExternalCard('https://example.com', { ...ogp, description: '' });
    expect(html).not.toContain('line-clamp-2');
  });

  it('opens in new tab with rel noopener', () => {
    const html = buildExternalCard('https://example.com', ogp);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('escapes HTML special chars in title', () => {
    const html = buildExternalCard('https://example.com', { ...ogp, title: '<b>bold</b>' });
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;');
  });
});
```

- [ ] **Step 2: テストを実行してすべてが FAIL することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 新規追加の9件が FAIL、既存7件は PASS のまま。

- [ ] **Step 3: ヘルパー関数と実装を追加する**

`src/plugins/remark-link-card.ts` の `buildInternalCard`, `buildExternalCard` を以下に置き換える（また `escapeHtml` と `getReadingTimeMin` を先頭のプライベート関数として追加する）:

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getReadingTimeMin(body: string): number {
  const charCount = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(charCount / 500));
}

export function buildInternalCard(data: InternalPostData, slug: string): string {
  const readMin = getReadingTimeMin(data.body);
  const year = data.pubDate.getUTCFullYear();
  const month = data.pubDate.getUTCMonth() + 1;
  const day = data.pubDate.getUTCDate();
  const dateStr = `${year}年${month}月${day}日`;
  const isoDate = data.pubDate.toISOString();
  const tagBadges = data.tags.slice(0, 3)
    .map(tag => `<span class="inline-flex items-center rounded-full font-medium px-2.5 py-0.5 text-xs border border-accent/60 text-accent bg-transparent">${escapeHtml(tag)}</span>`)
    .join('');

  return `<a href="/blog/${slug}/" class="not-prose block group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 no-underline my-6">
  <div class="text-xs font-medium text-text-muted tracking-wide">株式会社KCP Blog</div>
  <div class="flex flex-wrap gap-2">${tagBadges}</div>
  <p class="font-bold text-text-primary group-hover:text-accent transition-colors text-xl m-0">${escapeHtml(data.title)}</p>
  <p class="text-text-secondary text-sm leading-relaxed line-clamp-3 m-0">${escapeHtml(data.description)}</p>
  <div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
    <time datetime="${isoDate}">${dateStr}</time>
    <span>·</span>
    <span>約${readMin}分</span>
  </div>
</a>`;
}

export function buildExternalCard(url: string, ogp: OgpData): string {
  const hostname = new URL(url).hostname;
  const title = ogp.title || url;
  const descHtml = ogp.description
    ? `\n  <p class="text-text-secondary text-sm leading-relaxed line-clamp-2 m-0">${escapeHtml(ogp.description)}</p>`
    : '';

  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="not-prose block group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 no-underline my-6">
  <div class="text-xs font-medium text-text-muted tracking-wide">参考資料</div>
  <p class="font-bold text-text-primary group-hover:text-accent transition-colors text-xl m-0">${escapeHtml(title)}</p>${descHtml}
  <div class="text-xs text-text-muted">${escapeHtml(hostname)}</div>
</a>`;
}
```

- [ ] **Step 4: テストを実行してすべてが PASS することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 16件すべて PASS。

- [ ] **Step 5: コミットする**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "feat: implement card HTML builders with tests"
```

---

## Task 4: フロントマター読み取り（TDD）

**Files:**
- Modify: `src/plugins/remark-link-card.test.ts`（テスト追加）
- Modify: `src/plugins/remark-link-card.ts`（実装）

- [ ] **Step 1: テストを追加する**

`src/plugins/remark-link-card.test.ts` に追記:

```typescript
describe('readInternalPostData', () => {
  const contentDir = path.join(process.cwd(), 'src/content/blog');

  it('returns post data for existing slug', () => {
    const data = readInternalPostData('ai-jidai-no-gyomu-daiko', contentDir);
    expect(data).not.toBeNull();
    expect(typeof data!.title).toBe('string');
    expect(data!.title.length).toBeGreaterThan(0);
    expect(data!.pubDate).toBeInstanceOf(Date);
    expect(Array.isArray(data!.tags)).toBe(true);
    expect(typeof data!.body).toBe('string');
  });

  it('returns null for non-existent slug', () => {
    const data = readInternalPostData('does-not-exist-xyz', contentDir);
    expect(data).toBeNull();
  });
});
```

- [ ] **Step 2: テストを実行して FAIL することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 新規2件が FAIL。

- [ ] **Step 3: 実装する**

`src/plugins/remark-link-card.ts` の `readInternalPostData` を以下に置き換える:

```typescript
export function readInternalPostData(slug: string, contentDir?: string): InternalPostData | null {
  const dir = contentDir ?? path.join(process.cwd(), 'src/content/blog');
  const filePath = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  return {
    title: data.title ?? '',
    description: data.description ?? '',
    pubDate: data.pubDate instanceof Date ? data.pubDate : new Date(data.pubDate),
    tags: Array.isArray(data.tags) ? data.tags : [],
    body: content,
  };
}
```

- [ ] **Step 4: テストを実行してすべてが PASS することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 18件すべて PASS。

- [ ] **Step 5: コミットする**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "feat: implement frontmatter reader with tests"
```

---

## Task 5: OGP キャッシュ・フェッチ（TDD）

**Files:**
- Modify: `src/plugins/remark-link-card.test.ts`（テスト追加）
- Modify: `src/plugins/remark-link-card.ts`（実装）

- [ ] **Step 1: テストを追加する**

`src/plugins/remark-link-card.test.ts` に追記:

```typescript
describe('readOgpCache / writeOgpCache', () => {
  it('returns empty object when file does not exist', () => {
    const result = readOgpCache('/nonexistent/path/ogp-cache.json');
    expect(result).toEqual({});
  });

  it('round-trips data correctly', () => {
    const tmpPath = path.join(os.tmpdir(), `ogp-cache-test-${Date.now()}.json`);
    const data: Record<string, import('./remark-link-card.ts').OgpData> = {
      'https://example.com': { title: 'Test', description: 'Desc', fetchedAt: '2026-04-24T00:00:00.000Z' },
    };
    writeOgpCache(tmpPath, data);
    expect(readOgpCache(tmpPath)).toEqual(data);
    fs.unlinkSync(tmpPath);
  });
});

describe('getOgp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached data without calling fetch', async () => {
    const tmpPath = path.join(os.tmpdir(), `ogp-cache-test-${Date.now()}.json`);
    const cached: import('./remark-link-card.ts').OgpData = {
      title: 'Cached Title',
      description: 'Cached Desc',
      fetchedAt: '2026-04-24T00:00:00.000Z',
    };
    writeOgpCache(tmpPath, { 'https://example.com': cached });

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await getOgp('https://example.com', tmpPath);
    expect(result).toEqual(cached);
    expect(fetchSpy).not.toHaveBeenCalled();
    fs.unlinkSync(tmpPath);
  });

  it('fetches OGP and writes to cache on cache miss', async () => {
    const tmpPath = path.join(os.tmpdir(), `ogp-cache-test-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      text: async () =>
        '<meta property="og:title" content="Fetched Title"><meta property="og:description" content="Fetched Desc">',
    } as Response);

    const result = await getOgp('https://example.com/new', tmpPath);
    expect(result.title).toBe('Fetched Title');
    expect(result.description).toBe('Fetched Desc');

    const cache = readOgpCache(tmpPath);
    expect(cache['https://example.com/new']).toBeDefined();
    expect(cache['https://example.com/new'].title).toBe('Fetched Title');
    fs.unlinkSync(tmpPath);
  });

  it('returns empty strings and caches on fetch failure', async () => {
    const tmpPath = path.join(os.tmpdir(), `ogp-cache-test-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const result = await getOgp('https://failing.example.com', tmpPath);
    expect(result.title).toBe('');
    expect(result.description).toBe('');

    const cache = readOgpCache(tmpPath);
    expect(cache['https://failing.example.com']).toBeDefined();
    fs.unlinkSync(tmpPath);
  });
});
```

- [ ] **Step 2: テストを実行して FAIL することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 新規5件が FAIL。

- [ ] **Step 3: 実装する**

`src/plugins/remark-link-card.ts` の `readOgpCache`, `writeOgpCache`, `fetchOgpData`, `getOgp` を以下に置き換える:

```typescript
export function readOgpCache(cachePath: string): Record<string, OgpData> {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeOgpCache(cachePath: string, cache: Record<string, OgpData>): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
}

export async function fetchOgpData(url: string): Promise<OgpData> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await res.text();
    const title =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"[^>]*>/i)?.[1] ??
      html.match(/<meta[^>]+content="([^"]*)"[^>]+property="og:title"[^>]*>/i)?.[1] ??
      '';
    const description =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"[^>]*>/i)?.[1] ??
      html.match(/<meta[^>]+content="([^"]*)"[^>]+property="og:description"[^>]*>/i)?.[1] ??
      '';
    return { title, description, fetchedAt: new Date().toISOString() };
  } catch {
    return { title: '', description: '', fetchedAt: new Date().toISOString() };
  }
}

export async function getOgp(
  url: string,
  cachePath: string = path.join(process.cwd(), 'src/data/ogp-cache.json')
): Promise<OgpData> {
  const cache = readOgpCache(cachePath);
  if (cache[url]) return cache[url];
  const data = await fetchOgpData(url);
  cache[url] = data;
  writeOgpCache(cachePath, cache);
  return data;
}
```

- [ ] **Step 4: テストを実行してすべてが PASS することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 23件すべて PASS。

- [ ] **Step 5: コミットする**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "feat: implement OGP cache and fetch with tests"
```

---

## Task 6: メインプラグイン組み立て + 統合テスト

**Files:**
- Modify: `src/plugins/remark-link-card.test.ts`（統合テスト追加）
- Modify: `src/plugins/remark-link-card.ts`（プラグイン本体実装）

- [ ] **Step 1: 統合テストを追加する**

`src/plugins/remark-link-card.test.ts` に追記:

```typescript
describe('remarkLinkCard plugin (integration)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves paragraphs with non-standalone URLs unchanged', async () => {
    const plugin = remarkLinkCard();
    const tree: Root = {
      type: 'root',
      children: [{
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Check out ' },
          { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'this link' }] },
        ],
      }],
    } as Root;

    await plugin(tree);
    expect(tree.children[0].type).toBe('paragraph');
  });

  it('transforms external bare URL to HTML node', async () => {
    const tmpPath = path.join(os.tmpdir(), `ogp-cache-test-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      text: async () => '<meta property="og:title" content="Ext Title">',
    } as Response);

    const plugin = remarkLinkCard({ cachePath: tmpPath });
    const tree: Root = {
      type: 'root',
      children: [makeParagraphWithBareUrl('https://example.com') as any],
    } as Root;

    await plugin(tree);
    expect(tree.children[0].type).toBe('html');
    expect((tree.children[0] as any).value).toContain('参考資料');
    expect((tree.children[0] as any).value).toContain('Ext Title');
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  });

  it('transforms internal blog URL to HTML node with frontmatter', async () => {
    const plugin = remarkLinkCard();
    const tree: Root = {
      type: 'root',
      children: [makeParagraphWithBareUrl('https://kcp.co.jp/blog/ai-jidai-no-gyomu-daiko') as any],
    } as Root;

    await plugin(tree);
    expect(tree.children[0].type).toBe('html');
    expect((tree.children[0] as any).value).toContain('株式会社KCP Blog');
  });

  it('transforms internal blog URL with missing slug to external card fallback', async () => {
    const tmpPath = path.join(os.tmpdir(), `ogp-cache-test-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      text: async () => '',
    } as Response);

    const plugin = remarkLinkCard({ cachePath: tmpPath });
    const tree: Root = {
      type: 'root',
      children: [makeParagraphWithBareUrl('https://kcp.co.jp/blog/does-not-exist') as any],
    } as Root;

    await plugin(tree);
    expect(tree.children[0].type).toBe('html');
    expect((tree.children[0] as any).value).toContain('参考資料');
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  });
});
```

- [ ] **Step 2: テストを実行して統合テストが FAIL することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 新規4件が FAIL、既存23件は PASS。

- [ ] **Step 3: プラグイン本体を実装する**

`src/plugins/remark-link-card.ts` の `remarkLinkCard` デフォルトエクスポートを以下に置き換える:

```typescript
export default function remarkLinkCard(options: RemarkLinkCardOptions = {}) {
  const cachePath = options.cachePath ?? path.join(process.cwd(), 'src/data/ogp-cache.json');
  const contentDir = options.contentDir ?? path.join(process.cwd(), 'src/content/blog');

  return async function (tree: Root): Promise<void> {
    const targets: Array<{ node: Paragraph; index: number; parent: any }> = [];

    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (isStandaloneUrl(node)) {
        targets.push({ node, index: index!, parent });
      }
    });

    // 逆順で処理してインデックスのずれを防ぐ
    for (const { node, index, parent } of targets.reverse()) {
      const link = node.children[0] as Link;
      const url = link.url;
      let html: string;

      if (isInternalBlogUrl(url)) {
        const slug = extractSlug(url);
        const data = readInternalPostData(slug, contentDir);
        if (data) {
          html = buildInternalCard(data, slug);
        } else {
          const ogp = await getOgp(url, cachePath);
          html = buildExternalCard(url, ogp);
        }
      } else {
        const ogp = await getOgp(url, cachePath);
        html = buildExternalCard(url, ogp);
      }

      parent.children.splice(index, 1, { type: 'html', value: html });
    }
  };
}
```

- [ ] **Step 4: テストを実行してすべてが PASS することを確認する**

```bash
npx vitest run src/plugins/remark-link-card.test.ts
```

Expected: 27件すべて PASS。

- [ ] **Step 5: コミットする**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "feat: implement main plugin and integration tests"
```

---

## Task 7: astro.config.mjs への登録と手動動作確認

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: `astro.config.mjs` を修正する**

ファイル冒頭の import 群に追加:
```js
import remarkLinkCard from './src/plugins/remark-link-card.ts';
```

`markdown:` セクションを修正:
```js
markdown: {
  shikiConfig: {
    theme: 'github-dark',
    wrap: true,
  },
  remarkPlugins: [remarkLinkCard],
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
  ],
},
```

- [ ] **Step 2: 開発サーバーを起動する**

```bash
npm run dev
```

- [ ] **Step 3: テスト用記事に内部リンクを追加してカード表示を確認する**

`src/content/blog/welcome-to-kcp.md` の末尾に以下を追記（確認後に削除）:

```markdown

https://kcp.co.jp/blog/ai-jidai-no-gyomu-daiko
```

ブラウザで `http://localhost:4321/blog/welcome-to-kcp/` を開き、内部カード（「株式会社KCP Blog」ラベル、タイトル、説明文、タグ、日付・読了時間）が表示されることを確認する。

- [ ] **Step 4: 外部リンクのカード表示を確認する**

同ファイルにさらに追記（確認後に削除）:

```markdown

https://anthropic.com
```

ブラウザで同ページを確認し、外部カード（「参考資料」ラベル、OGPタイトル、ドメイン名）が表示されることを確認する。`src/data/ogp-cache.json` に `https://anthropic.com` のエントリが追記されていることも確認する。

- [ ] **Step 5: テスト用追記を元に戻す**

`src/content/blog/welcome-to-kcp.md` から Step 3・4 で追記した2行を削除する。

- [ ] **Step 6: コミットする**

```bash
git add astro.config.mjs src/data/ogp-cache.json
git commit -m "feat: register remark-link-card plugin in Astro config"
```

---

## 完了チェックリスト

- [ ] 全テスト PASS: `npx vitest run src/plugins/remark-link-card.test.ts`
- [ ] 内部ブログリンクがカード表示される
- [ ] 外部リンクがカード表示される（OGPありの場合タイトルと説明が表示される）
- [ ] 通常の `[テキスト](url)` リンクは変換されない
- [ ] `src/data/ogp-cache.json` にキャッシュが書き込まれる
- [ ] `npm run build` がエラーなく完了する
