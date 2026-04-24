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
