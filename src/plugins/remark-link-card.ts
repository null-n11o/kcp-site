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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getReadingTimeMin(body: string): number {
  const charCount = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(charCount / 500));
}

export function buildInternalCard(data: InternalPostData, slug: string): string {
  const readMin = getReadingTimeMin(data.body);
  const year = data.pubDate.getUTCFullYear();
  const month = data.pubDate.getUTCMonth() + 1;
  const day = data.pubDate.getUTCDate();
  const dateStr = `${year}年${month}月${day}日`;
  const isoDate = data.pubDate.toISOString();
  const tagBadges = data.tags.slice(0, 3)
    .map(tag => `<span class="inline-flex items-center rounded-full font-medium px-2.5 py-0.5 text-xs border border-accent/60 text-accent bg-transparent">${escapeHtml(tag)}</span>`)
    .join('');

  return `<a href="/blog/${slug}/" class="not-prose block group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 no-underline my-6">
  <div class="text-xs font-medium text-text-muted tracking-wide">株式会社KCP Blog</div>
  <div class="flex flex-wrap gap-2">${tagBadges}</div>
  <p class="font-bold text-text-primary group-hover:text-accent transition-colors text-xl m-0">${escapeHtml(data.title)}</p>
  <p class="text-text-secondary text-sm leading-relaxed line-clamp-3 m-0">${escapeHtml(data.description)}</p>
  <div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
    <time datetime="${isoDate}">${dateStr}</time>
    <span>·</span>
    <span>約${readMin}分</span>
  </div>
</a>`;
}

export function buildExternalCard(url: string, ogp: OgpData): string {
  const hostname = new URL(url).hostname;
  const title = ogp.title || url;
  const descHtml = ogp.description
    ? `\n  <p class="text-text-secondary text-sm leading-relaxed line-clamp-2 m-0">${escapeHtml(ogp.description)}</p>`
    : '';

  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="not-prose block group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 no-underline my-6">
  <div class="text-xs font-medium text-text-muted tracking-wide">参考資料</div>
  <p class="font-bold text-text-primary group-hover:text-accent transition-colors text-xl m-0">${escapeHtml(title)}</p>${descHtml}
  <div class="text-xs text-text-muted">${escapeHtml(hostname)}</div>
</a>`;
}

export function readInternalPostData(slug: string, contentDir?: string): InternalPostData | null {
  const dir = contentDir ?? path.join(process.cwd(), 'src/content/blog');
  const filePath = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  return {
    title: data.title ?? '',
    description: data.description ?? '',
    pubDate: data.pubDate instanceof Date ? data.pubDate : new Date(data.pubDate),
    tags: Array.isArray(data.tags) ? data.tags : [],
    body: content,
  };
}

export function readOgpCache(cachePath: string): Record<string, OgpData> {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeOgpCache(cachePath: string, cache: Record<string, OgpData>): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
}

export async function fetchOgpData(url: string): Promise<OgpData> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await res.text();
    const title =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"[^>]*>/i)?.[1] ??
      html.match(/<meta[^>]+content="([^"]*)"[^>]+property="og:title"[^>]*>/i)?.[1] ??
      '';
    const description =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"[^>]*>/i)?.[1] ??
      html.match(/<meta[^>]+content="([^"]*)"[^>]+property="og:description"[^>]*>/i)?.[1] ??
      '';
    return { title, description, fetchedAt: new Date().toISOString() };
  } catch {
    return { title: '', description: '', fetchedAt: new Date().toISOString() };
  }
}

export async function getOgp(
  url: string,
  cachePath: string = path.join(process.cwd(), 'src/data/ogp-cache.json')
): Promise<OgpData> {
  const cache = readOgpCache(cachePath);
  if (cache[url]) return cache[url];
  const data = await fetchOgpData(url);
  cache[url] = data;
  writeOgpCache(cachePath, cache);
  return data;
}

export default function remarkLinkCard(_options: RemarkLinkCardOptions = {}) {
  return async function (_tree: Root): Promise<void> {};
}
