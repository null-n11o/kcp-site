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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const posts = [
  makeMockPost('post-a', ['AI', '業務効率化']),
  makeMockPost('post-b', ['AI', 'Claude']),
  makeMockPost('post-c', ['ビジネス']),
  makeMockPost('post-d-draft', ['AI'], true),
] as any;

describe('getAllTags', () => {
  it('returns unique tags sorted alphabetically', () => {
    const tags = getAllTags(posts.filter((p: any) => !p.data.draft));
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
