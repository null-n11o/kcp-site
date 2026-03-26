import { describe, it, expect } from 'vitest';
import { generateLlmsFullContent } from './llms';

const makeMockPost = (slug: string, title: string, description: string, tags: string[], pubDate: Date) => ({
  slug,
  data: { title, description, pubDate, tags },
});

describe('generateLlmsFullContent', () => {
  it('generates header lines', () => {
    const content = generateLlmsFullContent([]);
    expect(content).toContain('# 株式会社KCP');
    expect(content).toContain('LLM向け');
  });

  it('includes post title and URL', () => {
    const posts = [makeMockPost('my-post', 'テスト記事タイトル', 'テスト説明', ['AI'], new Date('2026-01-15'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('## テスト記事タイトル');
    expect(content).toContain('https://kcp.co.jp/blog/my-post/');
  });

  it('includes post description', () => {
    const posts = [makeMockPost('post-a', 'タイトル', 'これは説明文です', ['AI'], new Date('2026-01-15'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('これは説明文です');
  });

  it('includes publication date in ISO format', () => {
    const posts = [makeMockPost('post-a', 'タイトル', '説明', [], new Date('2026-03-23'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('2026-03-23');
  });

  it('includes tags when present', () => {
    const posts = [makeMockPost('post-a', 'タイトル', '説明', ['AI', '業務効率化'], new Date('2026-01-15'))];
    const content = generateLlmsFullContent(posts as any);
    expect(content).toContain('AI, 業務効率化');
  });

  it('separates multiple posts with ---', () => {
    const posts = [
      makeMockPost('post-a', 'A', '説明A', [], new Date('2026-01-01')),
      makeMockPost('post-b', 'B', '説明B', [], new Date('2026-01-02')),
    ];
    const content = generateLlmsFullContent(posts as any);
    const separators = (content.match(/^---$/gm) ?? []).length;
    expect(separators).toBe(2);
  });
});
