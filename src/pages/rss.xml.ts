import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSortedPosts } from '@/utils/blog';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('blog');
  const posts = getSortedPosts(allPosts);

  return rss({
    title: '株式会社KCP ブログ',
    description: 'AI活用・業務効率化・デジタルトランスフォーメーションに関する記事',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: '<language>ja</language>',
  });
}
