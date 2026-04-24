import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Link, Text } from 'mdast';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

// --- Types ---

export interface InternalPostData {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  body: string;
}

export interface OgpData {
  title: string;
  description: string;
  fetchedAt: string;
}

export interface RemarkLinkCardOptions {
  cachePath?: string;
  contentDir?: string;
}

// --- Exports (implemented in later tasks) ---

export function isStandaloneUrl(node: Paragraph): boolean {
  if (node.children.length !== 1) return false;
  const child = node.children[0];
  if (child.type !== 'link') return false;
  const link = child as Link;
  if (link.children.length !== 1) return false;
  const text = link.children[0];
  if (text.type !== 'text') return false;
  return (text as Text).value === link.url;
}

export function isInternalBlogUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'kcp.co.jp' && parsed.pathname.startsWith('/blog/');
  } catch {
    return false;
  }
}

export function extractSlug(url: string): string {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts[1] ?? '';
}
export function buildInternalCard(_data: InternalPostData, _slug: string): string { return ''; }
export function buildExternalCard(_url: string, _ogp: OgpData): string { return ''; }
export function readInternalPostData(_slug: string, _contentDir?: string): InternalPostData | null { return null; }
export function readOgpCache(_cachePath: string): Record<string, OgpData> { return {}; }
export function writeOgpCache(_cachePath: string, _cache: Record<string, OgpData>): void {}
export async function fetchOgpData(_url: string): Promise<OgpData> { return { title: '', description: '', fetchedAt: '' }; }
export async function getOgp(_url: string, _cachePath?: string): Promise<OgpData> { return { title: '', description: '', fetchedAt: '' }; }

export default function remarkLinkCard(_options: RemarkLinkCardOptions = {}) {
  return async function (_tree: Root): Promise<void> {};
}
