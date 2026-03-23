import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

export function getSortedPosts(posts: BlogPost[]): BlogPost[] {
  return posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach(post => post.data.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ja'));
}

export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter(post => post.data.tags.includes(tag));
}

export function getReadingTimeMin(body: string): number {
  const wordsPerMinute = 500; // Japanese characters per minute
  const charCount = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(charCount / wordsPerMinute));
}
