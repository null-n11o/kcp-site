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
  fetchTweetSyndication,
  getTweet,
  tweetToken,
  extractTweetId,
  renderTweetText,
  parseSyndicationTweet,
} from './remark-link-card.ts';

import type { TweetData } from './remark-link-card.ts';

// テスト用の TweetData サンプル
function sampleTweet(overrides: Partial<TweetData> = {}): TweetData {
  return {
    url: 'https://x.com/jack/status/20',
    name: 'jack',
    handle: 'jack',
    avatar: 'https://pbs.twimg.com/profile_images/1/avatar_bigger.jpg',
    verified: true,
    bodyHtml: 'just setting up my twttr',
    createdAt: '2006-03-21T00:00:00.000Z',
    likes: 100,
    photos: [],
    article: null,
    quote: null,
    fetchedAt: '2026-07-12T00:00:00.000Z',
    ...overrides,
  };
}

// syndication API のレスポンス風オブジェクトを作る
function syndicationJson(overrides: Record<string, any> = {}): any {
  return {
    __typename: 'Tweet',
    id_str: '20',
    text: 'just setting up my twttr',
    display_text_range: [0, 24],
    created_at: '2006-03-21T00:00:00.000Z',
    favorite_count: 100,
    user: {
      name: 'jack',
      screen_name: 'jack',
      is_blue_verified: true,
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1/avatar_normal.jpg',
    },
    ...overrides,
  };
}

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
  it('renders a tweet-card anchor to the tweet URL with author info', () => {
    const html = buildTweetCard(sampleTweet());
    expect(html).toContain('not-prose tweet-card');
    expect(html).toContain('href="https://x.com/jack/status/20"');
    expect(html).toContain('jack');
    expect(html).toContain('@jack');
    expect(html).toContain('just setting up my twttr');
  });

  it('shows the verified badge only when verified', () => {
    expect(buildTweetCard(sampleTweet({ verified: true }))).toContain('tweet-card__badge');
    expect(buildTweetCard(sampleTweet({ verified: false }))).not.toContain('tweet-card__badge');
  });

  it('renders photos when present', () => {
    const html = buildTweetCard(
      sampleTweet({ photos: [{ url: 'https://pbs.twimg.com/media/x.jpg', width: 600, height: 400 }] })
    );
    expect(html).toContain('tweet-card__media');
    expect(html).toContain('https://pbs.twimg.com/media/x.jpg');
  });

  it('renders an article card with title and cover', () => {
    const html = buildTweetCard(
      sampleTweet({ bodyHtml: '', article: { title: 'My Article', cover: 'https://pbs.twimg.com/media/cover.jpg' } })
    );
    expect(html).toContain('tweet-card__article');
    expect(html).toContain('My Article');
    expect(html).toContain('cover.jpg');
  });

  it('renders a nested quote', () => {
    const html = buildTweetCard(
      sampleTweet({ quote: { name: 'Machina', handle: 'EXM7777', bodyHtml: 'quoted body' } })
    );
    expect(html).toContain('tweet-card__quote');
    expect(html).toContain('Machina');
    expect(html).toContain('@EXM7777');
    expect(html).toContain('quoted body');
  });

  it('escapes author name to prevent HTML injection', () => {
    const html = buildTweetCard(sampleTweet({ name: '<script>evil</script>' }));
    expect(html).not.toContain('<script>evil</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('readInternalPostData', () => {
  const contentDir = path.join(process.cwd(), 'src/content/blog');

  it('returns post data for existing slug', () => {
    const data = readInternalPostData('harness-engineering', contentDir);
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
    const data: Record<string, TweetData> = {
      'https://x.com/jack/status/20': sampleTweet(),
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

describe('tweetToken / extractTweetId', () => {
  it('extracts the numeric id from a status URL', () => {
    expect(extractTweetId('https://x.com/jack/status/20?s=20')).toBe('20');
    expect(extractTweetId('https://twitter.com/a/status/12345/')).toBe('12345');
    expect(extractTweetId('https://x.com/jack')).toBe('');
  });

  it('produces a deterministic non-empty token for an id', () => {
    const t = tweetToken('2075394620536578128');
    expect(typeof t).toBe('string');
    expect(t.length).toBeGreaterThan(0);
    expect(t).not.toMatch(/[.0]/); // 0 と . は除去される
    expect(tweetToken('2075394620536578128')).toBe(t); // 決定的
  });
});

describe('renderTweetText', () => {
  it('slices to display_text_range and escapes/keeps newlines', () => {
    const html = renderTweetText('hello\nworld TAIL', [0, 11]);
    expect(html).toBe('hello<br>world');
  });

  it('expands t.co links to their display_url', () => {
    const html = renderTweetText('see https://t.co/abc now', undefined, [
      { url: 'https://t.co/abc', display_url: 'example.com/x' },
    ]);
    expect(html).toContain('example.com/x');
    expect(html).not.toContain('t.co/abc');
  });

  it('escapes HTML in the text', () => {
    expect(renderTweetText('<b>hi</b>')).toBe('&lt;b&gt;hi&lt;/b&gt;');
  });
});

describe('parseSyndicationTweet', () => {
  it('maps user, verified, likes and upgrades avatar size', () => {
    const t = parseSyndicationTweet(syndicationJson(), 'https://x.com/jack/status/20');
    expect(t.name).toBe('jack');
    expect(t.handle).toBe('jack');
    expect(t.verified).toBe(true);
    expect(t.likes).toBe(100);
    expect(t.avatar).toContain('_bigger');
    expect(t.url).toBe('https://x.com/jack/status/20');
    expect(t.bodyHtml).toBe('just setting up my twttr');
  });

  it('hides body and captures article for article-share tweets', () => {
    const t = parseSyndicationTweet(
      syndicationJson({
        text: 'https://t.co/x',
        article: { title: 'My Article', cover_media: { media_info: { original_img_url: 'https://pbs.twimg.com/cover.jpg' } } },
      }),
      'https://x.com/jack/status/20'
    );
    expect(t.bodyHtml).toBe('');
    expect(t.article).toEqual({ title: 'My Article', cover: 'https://pbs.twimg.com/cover.jpg' });
  });

  it('captures photos from mediaDetails', () => {
    const t = parseSyndicationTweet(
      syndicationJson({
        mediaDetails: [
          { type: 'photo', media_url_https: 'https://pbs.twimg.com/media/a.jpg', original_info: { width: 600, height: 400 } },
          { type: 'video', media_url_https: 'https://pbs.twimg.com/media/v.jpg' },
        ],
      }),
      'https://x.com/jack/status/20'
    );
    expect(t.photos).toEqual([{ url: 'https://pbs.twimg.com/media/a.jpg', width: 600, height: 400 }]);
  });

  it('captures a nested quote', () => {
    const t = parseSyndicationTweet(
      syndicationJson({
        quoted_tweet: { user: { name: 'Machina', screen_name: 'EXM7777' }, text: 'quoted' },
      }),
      'https://x.com/jack/status/20'
    );
    expect(t.quote).toEqual({ name: 'Machina', handle: 'EXM7777', bodyHtml: 'quoted' });
  });
});

describe('fetchTweetSyndication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed tweet data on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => syndicationJson(),
    } as Response);

    const result = await fetchTweetSyndication('https://x.com/jack/status/20');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('jack');
    expect(result!.handle).toBe('jack');
    expect(typeof result!.fetchedAt).toBe('string');
  });

  it('returns null on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false } as Response);
    expect(await fetchTweetSyndication('https://x.com/jack/status/404')).toBeNull();
  });

  it('returns null on fetch rejection', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    expect(await fetchTweetSyndication('https://x.com/jack/status/20')).toBeNull();
  });

  it('returns null when the payload is not a Tweet (deleted/tombstone)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ __typename: 'TweetTombstone' }),
    } as Response);
    expect(await fetchTweetSyndication('https://x.com/jack/status/20')).toBeNull();
  });
});

describe('getTweet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached data without calling fetch', async () => {
    const tmpPath = path.join(os.tmpdir(), `tweet-cache-test-${Date.now()}.json`);
    const cached = sampleTweet();
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
      json: async () => syndicationJson({ id_str: '99' }),
    } as Response);

    const result = await getTweet('https://x.com/jack/status/99', tmpPath);
    expect(result!.name).toBe('jack');
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
      children: [makeParagraphWithBareUrl('https://kcp-8.com/blog/harness-engineering') as any],
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

  it('replaces standalone X status URL with a tweet card', async () => {
    const tmpTweetCache = path.join(os.tmpdir(), `tweet-cache-int-${Date.now()}.json`);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => syndicationJson(),
    } as Response);

    const plugin = remarkLinkCard({ tweetCachePath: tmpTweetCache });
    const tree: Root = {
      type: 'root',
      children: [makeParagraphWithBareUrl('https://x.com/jack/status/20')],
    };
    await plugin(tree);

    expect(tree.children[0].type).toBe('html');
    expect((tree.children[0] as any).value).toContain('tweet-card');
    expect((tree.children[0] as any).value).toContain('@jack');
    if (fs.existsSync(tmpTweetCache)) fs.unlinkSync(tmpTweetCache);
  });

  it('falls back to external card when tweet fetch fails', async () => {
    const tmpTweetCache = path.join(os.tmpdir(), `tweet-cache-int-${Date.now()}.json`);
    const tmpOgpCache = path.join(os.tmpdir(), `ogp-cache-int-${Date.now()}.json`);
    // 1回目: syndication 失敗 / 2回目: OGP フォールバックの fetch
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
});
