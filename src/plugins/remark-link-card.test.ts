import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Paragraph, Root } from 'mdast';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import remarkLinkCard, {
  isStandaloneUrl,
  isInternalBlogUrl,
  isTwitterStatusUrl,
  extractSlug,
  buildInternalCard,
  buildExternalCard,
  buildTweetCard,
  readInternalPostData,
  readOgpCache,
  writeOgpCache,
  readTweetCache,
  writeTweetCache,
  getOgp,
  fetchTweetOembed,
  getTweet,
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

// スケルトン段階: テストケースは後のタスクで追加される
describe('remark-link-card (scaffold)', () => {
  it.todo('テストケースは後のタスクで実装する');
});

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
  it('returns true for kcp-8.com/blog/* URLs', () => {
    expect(isInternalBlogUrl('https://kcp-8.com/blog/my-article')).toBe(true);
  });

  it('returns true for kcp-8.com/blog/* with trailing slash', () => {
    expect(isInternalBlogUrl('https://kcp-8.com/blog/my-article/')).toBe(true);
  });

  it('returns false for external blog URLs', () => {
    expect(isInternalBlogUrl('https://example.com/blog/post')).toBe(false);
  });

  it('returns false for kcp-8.com non-blog URLs', () => {
    expect(isInternalBlogUrl('https://kcp-8.com/about')).toBe(false);
  });

  it('returns false for invalid URLs', () => {
    expect(isInternalBlogUrl('not-a-url')).toBe(false);
  });
});

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

describe('extractSlug', () => {
  it('extracts slug from /blog/slug/', () => {
    expect(extractSlug('https://kcp-8.com/blog/my-article/')).toBe('my-article');
  });

  it('extracts slug from /blog/slug without trailing slash', () => {
    expect(extractSlug('https://kcp-8.com/blog/my-article')).toBe('my-article');
  });
});

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
      children: [makeParagraphWithBareUrl('https://kcp-8.com/blog/ai-jidai-no-gyomu-daiko') as any],
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
      children: [makeParagraphWithBareUrl('https://kcp-8.com/blog/does-not-exist') as any],
    } as Root;

    await plugin(tree);
    expect(tree.children[0].type).toBe('html');
    expect((tree.children[0] as any).value).toContain('参考資料');
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  });
});
