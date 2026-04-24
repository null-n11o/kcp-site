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

export function isStandaloneUrl(_node: Paragraph): boolean { return false; }
export function isInternalBlogUrl(_url: string): boolean { return false; }
export function extractSlug(_url: string): string { return ''; }
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
