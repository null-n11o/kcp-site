const SITE_URL = 'https://kcp.co.jp';

interface LlmsPost {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
  };
}

export function generateLlmsFullContent(posts: LlmsPost[]): string {
  const lines: string[] = [
    '# 株式会社KCP - 全記事テキスト',
    '',
    '> このファイルはLLM向けに自動生成されています。最新情報は https://kcp.co.jp/blog/ を参照してください。',
    '',
  ];

  for (const post of posts) {
    const dateStr = post.data.pubDate.toISOString().split('T')[0];
    lines.push(`## ${post.data.title}`);
    lines.push(`URL: ${SITE_URL}/blog/${post.slug}/`);
    lines.push(`公開日: ${dateStr}`);
    if (post.data.tags.length > 0) {
      lines.push(`タグ: ${post.data.tags.join(', ')}`);
    }
    lines.push('');
    lines.push(post.data.description);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
