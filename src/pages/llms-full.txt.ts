import { getCollection } from 'astro:content';
import { getSortedPosts } from '@/utils/blog';
import { generateLlmsFullContent } from '@/utils/llms';

export async function GET(): Promise<Response> {
  const allPosts = await getCollection('blog');
  const posts = getSortedPosts(allPosts);
  const content = generateLlmsFullContent(posts);

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
