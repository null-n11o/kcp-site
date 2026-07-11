# X（Twitter）ポスト引用カード埋め込み Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** ブログ本文に X の投稿 URL を1行で貼ると、ビルド時に oembed から取得した引用ポスト風の静的カードに変換する（外部JSゼロ）。

**Architecture:** 既存の remark プラグイン `src/plugins/remark-link-card.ts` に X 用の分岐を追加する。`publish.twitter.com/oembed`（`omit_script=true&dnt=true`）からビルド時にツイート HTML を取得し、専用キャッシュ `src/data/tweet-cache.json` に保存、`not-prose` コンテナで包んで埋め込む。取得失敗時は既存の外部リンクカードにフォールバック。

**Tech Stack:** Astro（remark プラグイン / unified・mdast）、TypeScript、Vitest、Tailwind CSS。追加npm依存なし（astro-embed の**アプローチ**のみ踏襲し、パッケージは導入しない）。

## Global Constraints

- テスト: `src/plugins/` のピュア関数は Vitest でテスト必須、TDD（テスト先行）。テストは `src/plugins/remark-link-card.test.ts` に追記。
- I/O 関数（`fetch` を使う `fetchTweetOembed`）はテストで `vi.spyOn(globalThis, 'fetch')` によりモックし、実ネットワークを叩かない。
- 外部JSバンドルなし・静的。`widgets.js` は読み込まない（oembed は `omit_script=true`）。
- oembed 取得元は `https://publish.twitter.com/oembed` 固定。タイムアウトは `AbortSignal.timeout(5000)`。
- サイトはダークテーマ固定（背景 `#0a0a0a` / 文字 `#f0f0f0`）。ライト対応は不要。
- 既存の内部カード／外部カードのロジックには手を入れない（X 分岐の追加のみ）。
- テストコマンド: `npx vitest run src/plugins/remark-link-card.test.ts`
- コミットは各タスク末尾。コミットメッセージ末尾に `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` を付ける。

## File Structure

- Modify: `src/plugins/remark-link-card.ts` — X 判定・oembed 取得・キャッシュ・カード生成・プラグイン分岐を追加。
- Modify: `src/plugins/remark-link-card.test.ts` — 上記のテストを追記。
- Create: `src/data/tweet-cache.json` — 生成物（ビルド時に自動更新）。初期は `{}`。
- Modify: `src/styles/global.css` — `.twitter-tweet` のダークテーマ用スタイルを追加。

型 `TweetOembedData` は `src/plugins/remark-link-card.ts` に定義し `export` する（テストから型参照するため）。

---

### Task 1: `isTwitterStatusUrl`（X ステータス URL 判定）

**Files:**
- Modify: `src/plugins/remark-link-card.ts`（`isInternalBlogUrl` の近くに追加）
- Test: `src/plugins/remark-link-card.test.ts`

**Interfaces:**
- Consumes: なし
- Produces: `export function isTwitterStatusUrl(url: string): boolean`

- [x] **Step 1: Write the failing test**

`src/plugins/remark-link-card.test.ts` の import に `isTwitterStatusUrl` を追加:

```ts
import remarkLinkCard, {
  isStandaloneUrl,
  isInternalBlogUrl,
  isTwitterStatusUrl,
  extractSlug,
  buildInternalCard,
  buildExternalCard,
  readInternalPostData,
  readOgpCache,
  writeOgpCache,
  getOgp,
} from './remark-link-card.ts';
```

`describe('isInternalBlogUrl', …)` ブロックの直後に追加:

```ts
describe('isTwitterStatusUrl', () => {
  it('returns true for twitter.com status URLs', () => {
    expect(isTwitterStatusUrl('https://twitter.com/jack/status/20')).toBe(true);
  });

  it('returns true for x.com status URLs', () => {
    expect(isTwitterStatusUrl('https://x.com/jack/status/20')).toBe(true);
  });

  it('returns true for mobile and www subdomains', () => {
    expect(isTwitterStatusUrl('https://mobile.twitter.com/jack/status/20')).toBe(true);
    expect(isTwitterStatusUrl('https://www.x.com/jack/status/20')).toBe(true);
  });

  it('returns true with query string and trailing slash', () => {
    expect(isTwitterStatusUrl('https://x.com/jack/status/20?s=20')).toBe(true);
    expect(isTwitterStatusUrl('https://x.com/jack/status/20/')).toBe(true);
  });

  it('returns false for profile URLs', () => {
    expect(isTwitterStatusUrl('https://x.com/jack')).toBe(false);
  });

  it('returns false for search and non-status paths', () => {
    expect(isTwitterStatusUrl('https://x.com/search?q=a')).toBe(false);
  });

  it('returns false for non-X hosts', () => {
    expect(isTwitterStatusUrl('https://example.com/jack/status/20')).toBe(false);
  });

  it('returns false when status id is not numeric', () => {
    expect(isTwitterStatusUrl('https://x.com/jack/status/abc')).toBe(false);
  });

  it('returns false for unparseable strings', () => {
    expect(isTwitterStatusUrl('not-a-url')).toBe(false);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t isTwitterStatusUrl`
Expected: FAIL（`isTwitterStatusUrl is not a function` / import エラー）

- [x] **Step 3: Write minimal implementation**

`src/plugins/remark-link-card.ts` の `isInternalBlogUrl` 関数の直後に追加:

```ts
export function isTwitterStatusUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www\.|mobile\.)/, '');
    if (host !== 'twitter.com' && host !== 'x.com') return false;
    return /^\/[^/]+\/status\/\d+\/?$/.test(parsed.pathname);
  } catch {
    return false;
  }
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t isTwitterStatusUrl`
Expected: PASS（9 tests）

- [x] **Step 5: Commit**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "$(cat <<'EOF'
feat: X ステータス URL 判定関数を追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `TweetOembedData` 型・キャッシュ read/write

**Files:**
- Modify: `src/plugins/remark-link-card.ts`
- Test: `src/plugins/remark-link-card.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `export interface TweetOembedData { html: string; authorName: string; authorUrl: string; fetchedAt: string; }`
  - `export function readTweetCache(cachePath: string): Record<string, TweetOembedData>`
  - `export function writeTweetCache(cachePath: string, cache: Record<string, TweetOembedData>): void`

- [x] **Step 1: Write the failing test**

import に `readTweetCache`, `writeTweetCache` を追加（Task 1 の import ブロックに並べる）。`describe('readOgpCache / writeOgpCache', …)` の直後に追加:

```ts
describe('readTweetCache / writeTweetCache', () => {
  it('returns empty object when file does not exist', () => {
    expect(readTweetCache('/nonexistent/path/tweet-cache.json')).toEqual({});
  });

  it('round-trips tweet data correctly', () => {
    const tmpPath = path.join(os.tmpdir(), `tweet-cache-test-${Date.now()}.json`);
    const data: Record<string, import('./remark-link-card.ts').TweetOembedData> = {
      'https://x.com/jack/status/20': {
        html: '<blockquote class="twitter-tweet">…</blockquote>',
        authorName: 'jack',
        authorUrl: 'https://x.com/jack',
        fetchedAt: '2026-07-11T00:00:00.000Z',
      },
    };
    writeTweetCache(tmpPath, data);
    expect(readTweetCache(tmpPath)).toEqual(data);
    fs.unlinkSync(tmpPath);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t "readTweetCache"`
Expected: FAIL（import エラー）

- [x] **Step 3: Write minimal implementation**

`src/plugins/remark-link-card.ts` の `OgpData` インターフェース定義の直後に型を追加:

```ts
export interface TweetOembedData {
  html: string;
  authorName: string;
  authorUrl: string;
  fetchedAt: string;
}
```

`writeOgpCache` 関数の直後にキャッシュ read/write を追加（実装は OGP 版と同型）:

```ts
export function readTweetCache(cachePath: string): Record<string, TweetOembedData> {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeTweetCache(cachePath: string, cache: Record<string, TweetOembedData>): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t "readTweetCache"`
Expected: PASS（2 tests）

- [x] **Step 5: Commit**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "$(cat <<'EOF'
feat: tweet oembed 型とキャッシュ read/write を追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `fetchTweetOembed`（oembed 取得）

**Files:**
- Modify: `src/plugins/remark-link-card.ts`
- Test: `src/plugins/remark-link-card.test.ts`

**Interfaces:**
- Consumes: `TweetOembedData`
- Produces: `export async function fetchTweetOembed(url: string): Promise<TweetOembedData | null>`

oembed レスポンス例: `{ url, author_name, author_url, html }`。失敗時（非200・例外・JSON不正・`html` 欠落）は `null`。

- [x] **Step 1: Write the failing test**

import に `fetchTweetOembed` を追加。ファイル末尾付近（`getOgp` の describe の後）に追加:

```ts
describe('fetchTweetOembed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed tweet data on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: 'https://x.com/jack/status/20',
        author_name: 'jack',
        author_url: 'https://x.com/jack',
        html: '<blockquote class="twitter-tweet"><p>just setting up my twttr</p></blockquote>',
      }),
    } as Response);

    const result = await fetchTweetOembed('https://x.com/jack/status/20');
    expect(result).not.toBeNull();
    expect(result!.authorName).toBe('jack');
    expect(result!.authorUrl).toBe('https://x.com/jack');
    expect(result!.html).toContain('twitter-tweet');
    expect(typeof result!.fetchedAt).toBe('string');
  });

  it('returns null on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false } as Response);
    expect(await fetchTweetOembed('https://x.com/jack/status/404')).toBeNull();
  });

  it('returns null on fetch rejection', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    expect(await fetchTweetOembed('https://x.com/jack/status/20')).toBeNull();
  });

  it('returns null when html is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ author_name: 'jack', author_url: 'https://x.com/jack' }),
    } as Response);
    expect(await fetchTweetOembed('https://x.com/jack/status/20')).toBeNull();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t fetchTweetOembed`
Expected: FAIL（import エラー）

- [x] **Step 3: Write minimal implementation**

`src/plugins/remark-link-card.ts` の `fetchOgpData` 関数の直後に追加:

```ts
export async function fetchTweetOembed(url: string): Promise<TweetOembedData | null> {
  try {
    const oembedUrl = new URL('https://publish.twitter.com/oembed');
    oembedUrl.searchParams.set('url', url);
    oembedUrl.searchParams.set('omit_script', 'true');
    oembedUrl.searchParams.set('dnt', 'true');

    const res = await fetch(oembedUrl.href, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      author_name?: string;
      author_url?: string;
      html?: string;
    };
    if (!data.html) return null;
    return {
      html: data.html,
      authorName: data.author_name ?? '',
      authorUrl: data.author_url ?? '',
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t fetchTweetOembed`
Expected: PASS（4 tests）

- [x] **Step 5: Commit**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "$(cat <<'EOF'
feat: publish.twitter.com/oembed からツイートを取得する関数を追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `getTweet`（キャッシュ優先取得）

**Files:**
- Modify: `src/plugins/remark-link-card.ts`
- Test: `src/plugins/remark-link-card.test.ts`

**Interfaces:**
- Consumes: `TweetOembedData`, `readTweetCache`, `writeTweetCache`, `fetchTweetOembed`
- Produces: `export async function getTweet(url: string, cachePath?: string): Promise<TweetOembedData | null>`

- [x] **Step 1: Write the failing test**

import に `getTweet` を追加。`describe('fetchTweetOembed', …)` の直後に追加:

```ts
describe('getTweet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached data without calling fetch', async () => {
    const tmpPath = path.join(os.tmpdir(), `tweet-cache-test-${Date.now()}.json`);
    const cached: import('./remark-link-card.ts').TweetOembedData = {
      html: '<blockquote class="twitter-tweet">cached</blockquote>',
      authorName: 'jack',
      authorUrl: 'https://x.com/jack',
      fetchedAt: '2026-07-11T00:00:00.000Z',
    };
    writeTweetCache(tmpPath, { 'https://x.com/jack/status/20': cached });

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await getTweet('https://x.com/jack/status/20', tmpPath);
    expect(result).toEqual(cached);
    expect(fetchSpy).not.toHaveBeenCalled();
    fs.unlinkSync(tmpPath);
  });

  it('fetches and writes to cache on cache miss', async () => {
    const tmpPath = path.join(os.tmpdir(), `tweet-cache-test-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        author_name: 'jack',
        author_url: 'https://x.com/jack',
        html: '<blockquote class="twitter-tweet">fetched</blockquote>',
      }),
    } as Response);

    const result = await getTweet('https://x.com/jack/status/99', tmpPath);
    expect(result!.html).toContain('fetched');
    expect(readTweetCache(tmpPath)['https://x.com/jack/status/99']).toBeDefined();
    fs.unlinkSync(tmpPath);
  });

  it('does not cache when fetch returns null', async () => {
    const tmpPath = path.join(os.tmpdir(), `tweet-cache-test-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false } as Response);

    const result = await getTweet('https://x.com/jack/status/404', tmpPath);
    expect(result).toBeNull();
    expect(readTweetCache(tmpPath)['https://x.com/jack/status/404']).toBeUndefined();
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t getTweet`
Expected: FAIL（import エラー）

- [x] **Step 3: Write minimal implementation**

`src/plugins/remark-link-card.ts` の `getOgp` 関数の直後に追加:

```ts
export async function getTweet(
  url: string,
  cachePath: string = path.join(process.cwd(), 'src/data/tweet-cache.json')
): Promise<TweetOembedData | null> {
  const cache = readTweetCache(cachePath);
  if (cache[url]) return cache[url];
  const data = await fetchTweetOembed(url);
  if (data) {
    cache[url] = data;
    writeTweetCache(cachePath, cache);
  }
  return data;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t getTweet`
Expected: PASS（3 tests）

- [x] **Step 5: Commit**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "$(cat <<'EOF'
feat: ツイートをキャッシュ優先で取得する getTweet を追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `buildTweetCard`（カードHTML生成）

**Files:**
- Modify: `src/plugins/remark-link-card.ts`
- Test: `src/plugins/remark-link-card.test.ts`

**Interfaces:**
- Consumes: `TweetOembedData`
- Produces: `export function buildTweetCard(oembed: TweetOembedData): string`

- [x] **Step 1: Write the failing test**

import に `buildTweetCard` を追加。`describe('buildExternalCard', …)` の直後に追加:

```ts
describe('buildTweetCard', () => {
  const oembed: import('./remark-link-card.ts').TweetOembedData = {
    html: '<blockquote class="twitter-tweet"><p>just setting up my twttr</p>&mdash; jack (@jack) <a href="https://x.com/jack/status/20">March 21, 2006</a></blockquote>',
    authorName: 'jack',
    authorUrl: 'https://x.com/jack',
    fetchedAt: '2026-07-11T00:00:00.000Z',
  };

  it('wraps the blockquote in a not-prose container', () => {
    const html = buildTweetCard(oembed);
    expect(html).toContain('not-prose');
    expect(html).toContain('my-6');
  });

  it('embeds the oembed blockquote html verbatim', () => {
    const html = buildTweetCard(oembed);
    expect(html).toContain(oembed.html);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t buildTweetCard`
Expected: FAIL（import エラー）

- [x] **Step 3: Write minimal implementation**

`src/plugins/remark-link-card.ts` の `buildExternalCard` 関数の直後に追加:

```ts
export function buildTweetCard(oembed: TweetOembedData): string {
  return `<div class="not-prose tweet-embed my-6">${oembed.html}</div>`;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t buildTweetCard`
Expected: PASS（2 tests）

- [x] **Step 5: Commit**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts
git commit -m "$(cat <<'EOF'
feat: ツイート引用カードのHTMLを生成する buildTweetCard を追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: プラグイン本体に X 分岐を組み込み

**Files:**
- Modify: `src/plugins/remark-link-card.ts`（`RemarkLinkCardOptions` と `remarkLinkCard` の分岐）
- Create: `src/data/tweet-cache.json`
- Test: `src/plugins/remark-link-card.test.ts`

**Interfaces:**
- Consumes: `isTwitterStatusUrl`, `getTweet`, `buildTweetCard`, `getOgp`, `buildExternalCard`
- Produces: `RemarkLinkCardOptions` に `tweetCachePath?: string` を追加

- [x] **Step 1: Write the failing test**

`describe('remarkLinkCard plugin (integration)', …)` ブロック内に追加。既存の統合テストと同じスタイル（`fetch` をモック）。X URL 段落が tweet カードに置換されることを確認:

```ts
it('replaces standalone X status URL with a tweet card', async () => {
  const tmpTweetCache = path.join(os.tmpdir(), `tweet-cache-int-${Date.now()}.json`);
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      author_name: 'jack',
      author_url: 'https://x.com/jack',
      html: '<blockquote class="twitter-tweet"><p>just setting up my twttr</p></blockquote>',
    }),
  } as Response);

  const plugin = remarkLinkCard({ tweetCachePath: tmpTweetCache });
  const tree: Root = {
    type: 'root',
    children: [makeParagraphWithBareUrl('https://x.com/jack/status/20')],
  };
  await plugin(tree);

  expect(tree.children[0].type).toBe('html');
  expect((tree.children[0] as any).value).toContain('tweet-embed');
  expect((tree.children[0] as any).value).toContain('twitter-tweet');
  if (fs.existsSync(tmpTweetCache)) fs.unlinkSync(tmpTweetCache);
});

it('falls back to external card when tweet fetch fails', async () => {
  const tmpTweetCache = path.join(os.tmpdir(), `tweet-cache-int-${Date.now()}.json`);
  const tmpOgpCache = path.join(os.tmpdir(), `ogp-cache-int-${Date.now()}.json`);
  // 1回目: oembed 失敗 / 2回目: OGP フォールバックの fetch
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce({ ok: false } as Response)
    .mockResolvedValueOnce({ text: async () => '<meta property="og:title" content="T">' } as Response);

  const plugin = remarkLinkCard({ tweetCachePath: tmpTweetCache, cachePath: tmpOgpCache });
  const tree: Root = {
    type: 'root',
    children: [makeParagraphWithBareUrl('https://x.com/jack/status/404')],
  };
  await plugin(tree);

  expect(tree.children[0].type).toBe('html');
  expect((tree.children[0] as any).value).toContain('参考資料'); // buildExternalCard のラベル
  for (const p of [tmpTweetCache, tmpOgpCache]) if (fs.existsSync(p)) fs.unlinkSync(p);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/plugins/remark-link-card.test.ts -t "X status URL"`
Expected: FAIL（X 分岐が未実装のため OGP カードになる／`tweet-embed` を含まない）

- [x] **Step 3: Write minimal implementation**

`RemarkLinkCardOptions` に `tweetCachePath` を追加:

```ts
export interface RemarkLinkCardOptions {
  cachePath?: string;
  contentDir?: string;
  tweetCachePath?: string;
}
```

`remarkLinkCard` 関数の冒頭のパス解決に追加:

```ts
export default function remarkLinkCard(options: RemarkLinkCardOptions = {}) {
  const cachePath = options.cachePath ?? path.join(process.cwd(), 'src/data/ogp-cache.json');
  const contentDir = options.contentDir ?? path.join(process.cwd(), 'src/content/blog');
  const tweetCachePath = options.tweetCachePath ?? path.join(process.cwd(), 'src/data/tweet-cache.json');
```

`for` ループ内の分岐を、X 判定を最優先にして書き換える:

```ts
      if (isTwitterStatusUrl(url)) {
        const tweet = await getTweet(url, tweetCachePath);
        if (tweet) {
          html = buildTweetCard(tweet);
        } else {
          const ogp = await getOgp(url, cachePath);
          html = buildExternalCard(url, ogp);
        }
      } else if (isInternalBlogUrl(url)) {
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
```

空のキャッシュファイルを作成:

```bash
printf '{}\n' > src/data/tweet-cache.json
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/plugins/remark-link-card.test.ts`
Expected: PASS（全テスト。X 統合2件含む）

- [x] **Step 5: Commit**

```bash
git add src/plugins/remark-link-card.ts src/plugins/remark-link-card.test.ts src/data/tweet-cache.json
git commit -m "$(cat <<'EOF'
feat: remark プラグインに X ツイート引用カード分岐を組み込み

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: ダークテーマ用スタイル追加

**Files:**
- Modify: `src/styles/global.css`（`@layer components` 内）

**Interfaces:**
- Consumes: `buildTweetCard` が出力する `.tweet-embed` コンテナと oembed の `.twitter-tweet` blockquote
- Produces: なし（スタイルのみ）

このタスクはピュア関数を含まないため手動確認で代替（CLAUDE.md: `.astro`/CSS はテスト対象外）。

- [x] **Step 1: スタイルを追加**

`src/styles/global.css` の `@layer components { … }` ブロック内（`.section-wrapper` の後）に追加:

```css
  /* X（Twitter）引用ツイートカード（widgets.js 非使用の静的表示・ダークテーマ） */
  .tweet-embed {
    max-width: 550px;
  }
  .tweet-embed .twitter-tweet:not(.twitter-tweet-rendered) {
    display: block;
    margin: 0;
    padding: 1.25rem 1.5rem;
    border: 1px solid #2a2a3e;
    border-radius: 0.75rem;
    background: #141414;
    color: #f0f0f0;
    font-size: 0.95rem;
    line-height: 1.7;
  }
  .tweet-embed .twitter-tweet:not(.twitter-tweet-rendered) > :first-child {
    margin-top: 0;
  }
  .tweet-embed .twitter-tweet:not(.twitter-tweet-rendered) > :last-child {
    margin-bottom: 0;
  }
  .tweet-embed .twitter-tweet:not(.twitter-tweet-rendered) a {
    color: #4a9eff;
    text-decoration: none;
  }
  .tweet-embed .twitter-tweet:not(.twitter-tweet-rendered) a:hover {
    text-decoration: underline;
  }
```

- [x] **Step 2: 手動確認**

任意のブログ記事に公開ツイート URL を1行で貼り、開発サーバーで表示を確認:

```bash
npm run dev
```

Expected: URL がボーダー付きのダークな引用ボックスになり、本文・`— 名前 (@handle) 日付` リンクがアクセントカラーで表示される。外部スクリプト（widgets.js）は読み込まれない（ネットワークタブで確認）。

- [x] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "$(cat <<'EOF'
feat: X 引用ツイートカードのダークテーマ用スタイルを追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: ビルド確認と最終検証

**Files:** なし（検証のみ）

- [x] **Step 1: 全テスト実行**

Run: `npm run test`
Expected: PASS（全スイート）

- [x] **Step 2: 本番ビルド**

Run: `npm run build`
Expected: エラーなく完了。実ツイート URL を記事に含めた場合、`src/data/tweet-cache.json` にエントリが追加される。

- [x] **Step 3: フォールバック確認**

存在しない／削除済みツイート URL（例: `https://x.com/i/status/1`）を記事に貼って `npm run build` → ビルドが通り、外部リンクカードにフォールバックすることを確認。

（このタスクにコミットは不要。検証で確認した記事用の一時 URL は削除しておく。）

---

## Self-Review

**1. Spec coverage:**
- `isTwitterStatusUrl` → Task 1 ✓
- `fetchTweetOembed` / oembed 取得 → Task 3 ✓
- `getTweet` キャッシュ → Task 4 ✓
- `buildTweetCard` → Task 5 ✓
- 専用キャッシュ `tweet-cache.json` → Task 2（read/write）+ Task 6（生成）✓
- プラグイン分岐（X 最優先）→ Task 6 ✓
- フォールバック → Task 6（実装）+ Task 8（検証）✓
- ダークテーマ用スタイル → Task 7 ✓
- テスト（各関数・統合・モック）→ Task 1–6 ✓
- セキュリティ（oembed HTML をそのまま埋め込み）→ Task 5 の設計どおり（信頼ソース固定）✓

**2. Placeholder scan:** プレースホルダなし。全ステップに実コード・実コマンド・期待結果を記載。

**3. Type consistency:** `TweetOembedData`（`html`/`authorName`/`authorUrl`/`fetchedAt`）は Task 2 で定義し Task 3–6 で一貫使用。関数名 `isTwitterStatusUrl` / `fetchTweetOembed` / `getTweet` / `buildTweetCard` / `readTweetCache` / `writeTweetCache` はタスク間で統一。オプション名 `tweetCachePath` も Task 4・6 で一致。
