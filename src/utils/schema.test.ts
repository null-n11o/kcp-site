import { describe, it, expect } from 'vitest';
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildArticleSchema,
  buildPersonSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getAuthorSlug,
} from './schema';

describe('buildOrganizationSchema', () => {
  it('returns Organization schema with correct fields', () => {
    const schema = buildOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('株式会社KCP');
    expect(schema.url).toBe('https://kcp.co.jp');
  });
});

describe('buildWebSiteSchema', () => {
  it('returns WebSite schema', () => {
    const schema = buildWebSiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe('https://kcp.co.jp');
  });
});

describe('buildArticleSchema', () => {
  it('returns Article schema with all required fields', () => {
    const schema = buildArticleSchema({
      title: 'テスト記事',
      description: 'テスト説明',
      datePublished: new Date('2026-03-23T00:00:00Z'),
      authorName: '中野 健太朗',
      authorUrl: 'https://kcp.co.jp/author/nakanokentaro/',
      pageUrl: 'https://kcp.co.jp/blog/test-post/',
    });
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('テスト記事');
    expect(schema.datePublished).toBe('2026-03-23T00:00:00.000Z');
    expect((schema.author as Record<string, string>).name).toBe('中野 健太朗');
    expect((schema.author as Record<string, string>).url).toBe('https://kcp.co.jp/author/nakanokentaro/');
    expect((schema.publisher as Record<string, string>).name).toBe('株式会社KCP');
  });
});

describe('buildPersonSchema', () => {
  it('returns Person schema with required fields', () => {
    const schema = buildPersonSchema({
      name: '中野 健太朗',
      url: 'https://kcp.co.jp/author/nakanokentaro/',
    });
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('中野 健太朗');
    expect(schema.url).toBe('https://kcp.co.jp/author/nakanokentaro/');
  });

  it('includes optional fields when provided', () => {
    const schema = buildPersonSchema({
      name: '中野 健太朗',
      url: 'https://kcp.co.jp/author/nakanokentaro/',
      jobTitle: '代表取締役',
      description: 'KCP 代表',
      sameAs: ['https://x.com/test'],
    });
    expect(schema.jobTitle).toBe('代表取締役');
    expect(schema.description).toBe('KCP 代表');
    expect(schema.sameAs).toEqual(['https://x.com/test']);
  });

  it('omits optional fields when not provided', () => {
    const schema = buildPersonSchema({ name: 'Test', url: 'https://example.com' });
    expect('jobTitle' in schema).toBe(false);
    expect('description' in schema).toBe(false);
    expect('sameAs' in schema).toBe(false);
  });
});

describe('buildBreadcrumbSchema', () => {
  it('returns BreadcrumbList schema with correct items', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'ホーム', url: 'https://kcp.co.jp/' },
      { name: 'ブログ', url: 'https://kcp.co.jp/blog/' },
      { name: 'テスト記事', url: 'https://kcp.co.jp/blog/test/' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[0].name).toBe('ホーム');
    expect(items[2].position).toBe(3);
    expect(items[2].name).toBe('テスト記事');
  });
});

describe('buildFaqPageSchema', () => {
  it('returns FAQPage schema with Question/Answer entities', () => {
    const schema = buildFaqPageSchema([
      { question: 'Q1は何ですか？', answer: 'A1です。' },
      { question: 'Q2は何ですか？', answer: 'A2です。' },
    ]);
    expect(schema['@type']).toBe('FAQPage');
    const entities = schema.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]['@type']).toBe('Question');
    expect(entities[0].name).toBe('Q1は何ですか？');
    const answer = entities[0].acceptedAnswer as Record<string, unknown>;
    expect(answer['@type']).toBe('Answer');
    expect(answer.text).toBe('A1です。');
  });
});

describe('getAuthorSlug', () => {
  it('maps 中野健太朗 to nakanokentaro', () => {
    expect(getAuthorSlug('中野健太朗')).toBe('nakanokentaro');
  });

  it('maps 中野 健太朗 (with space) to nakanokentaro', () => {
    expect(getAuthorSlug('中野 健太朗')).toBe('nakanokentaro');
  });

  it('returns lowercase fallback for unknown names', () => {
    expect(getAuthorSlug('山田 太郎')).toBe('山田太郎');
  });
});
