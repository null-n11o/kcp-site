import { describe, it, expect } from 'vitest';
import { getSortedPressReleases } from './press';

const makePress = (slug: string, pubDate: string, draft = false) => ({
  id: slug,
  slug,
  body: '',
  collection: 'press' as const,
  data: {
    title: `Press ${slug}`,
    description: 'desc',
    pubDate: new Date(pubDate),
    category: 'お知らせ',
    draft,
  },
  render: async () => ({ Content: () => null, headings: [], remarkPluginFrontmatter: {} }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const releases = [
  makePress('old', '2026-01-01'),
  makePress('new', '2026-04-01'),
  makePress('draft', '2026-05-01', true),
] as any;

describe('getSortedPressReleases', () => {
  it('filters out drafts and sorts by pubDate descending', () => {
    const result = getSortedPressReleases(releases);
    expect(result.map((r: any) => r.slug)).toEqual(['new', 'old']);
  });

  it('returns empty array when all are drafts', () => {
    const allDraft = [makePress('d', '2026-01-01', true)] as any;
    expect(getSortedPressReleases(allDraft)).toEqual([]);
  });
});
