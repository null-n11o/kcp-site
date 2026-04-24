import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Paragraph, Root } from 'mdast';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import remarkLinkCard, {
  isStandaloneUrl,
  isInternalBlogUrl,
  extractSlug,
  buildInternalCard,
  buildExternalCard,
  readInternalPostData,
  readOgpCache,
  writeOgpCache,
  getOgp,
} from './remark-link-card.ts';

// Helper: bare URL paragraph ノードを生成する
function makeParagraphWithBareUrl(url: string): Paragraph {
  return {
    type: 'paragraph',
    children: [{ type: 'link', url, children: [{ type: 'text', value: url }] }],
  } as Paragraph;
}

// Helper: テキスト付きリンク段落ノードを生成する
function makeParagraphWithTextLink(url: string, text: string): Paragraph {
  return {
    type: 'paragraph',
    children: [{ type: 'link', url, children: [{ type: 'text', value: text }] }],
  } as Paragraph;
}

// スケルトン段階: テストケースは後のタスクで追加される
describe('remark-link-card (scaffold)', () => {
  it.todo('テストケースは後のタスクで実装する');
});
