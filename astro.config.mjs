import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkLinkCard from './src/plugins/remark-link-card.ts';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://kcp.co.jp',
  output: "hybrid",

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    remarkPlugins: [remarkLinkCard],
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