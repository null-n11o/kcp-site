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
