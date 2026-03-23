import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub astro:content virtual module — it only exists in Astro's build pipeline
      'astro:content': path.resolve(__dirname, './src/__mocks__/astro-content.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
