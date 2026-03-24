import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://kcp.co.jp',
  output: "hybrid",

  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },

  build: {
    format: 'directory',
  },

  adapter: cloudflare()
});