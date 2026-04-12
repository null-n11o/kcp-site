import type { CollectionEntry } from 'astro:content';

type PressRelease = CollectionEntry<'press'>;

export function getSortedPressReleases(releases: PressRelease[]): PressRelease[] {
  return releases
    .filter(r => !r.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
