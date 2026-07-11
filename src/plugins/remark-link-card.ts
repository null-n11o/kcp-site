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

export interface TweetMedia {
  url: string;
  width: number;
  height: number;
}

export interface TweetData {
  url: string; // 正規化したツイートURL
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  bodyHtml: string; // エスケープ済み・<br>変換済み。無ければ ''
  createdAt: string; // ISO 文字列
  likes: number;
  photos: TweetMedia[];
  article: { title: string; cover: string } | null;
  quote: { name: string; handle: string; bodyHtml: string } | null;
  fetchedAt: string;
}

export interface RemarkLinkCardOptions {
  cachePath?: string;
  contentDir?: string;
  tweetCachePath?: string;
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
    return parsed.hostname === 'kcp-8.com' && parsed.pathname.startsWith('/blog/');
  } catch {
    return false;
  }
}

export function isTwitterStatusUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www\.|mobile\.)/, '');
    if (host !== 'twitter.com' && host !== 'x.com') return false;
    return /^\/[^/]+\/status\/\d+\/?$/.test(parsed.pathname);
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

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
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

function formatTweetDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}

const X_LOGO_SVG =
  '<svg class="tweet-card__logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';

const VERIFIED_SVG =
  '<svg class="tweet-card__badge" viewBox="0 0 22 22" aria-label="認証済みアカウント"><path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.018-1.273.215-1.813.568s-.972.85-1.245 1.436c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.688.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.212 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>';

function buildTweetMedia(photos: TweetMedia[]): string {
  if (photos.length === 0) return '';
  const imgs = photos
    .slice(0, 4)
    .map(
      (p) =>
        `<img class="tweet-card__photo" src="${escapeHtml(p.url)}" alt="" loading="lazy" decoding="async" />`
    )
    .join('');
  return `<div class="tweet-card__media tweet-card__media--${Math.min(photos.length, 4)}">${imgs}</div>`;
}

function buildTweetArticle(article: { title: string; cover: string }): string {
  const cover = article.cover
    ? `<img class="tweet-card__article-cover" src="${escapeHtml(article.cover)}" alt="" loading="lazy" decoding="async" />`
    : '';
  return `<div class="tweet-card__article">${cover}<div class="tweet-card__article-body"><span class="tweet-card__article-label">記事</span><span class="tweet-card__article-title">${escapeHtml(article.title)}</span></div></div>`;
}

function buildTweetQuote(quote: { name: string; handle: string; bodyHtml: string }): string {
  const head = `<div class="tweet-card__quote-head"><span class="tweet-card__quote-name">${escapeHtml(quote.name)}</span><span class="tweet-card__quote-handle">@${escapeHtml(quote.handle)}</span></div>`;
  const body = quote.bodyHtml ? `<div class="tweet-card__quote-body">${quote.bodyHtml}</div>` : '';
  return `<div class="tweet-card__quote">${head}${body}</div>`;
}

export function buildTweetCard(tweet: TweetData): string {
  const avatar = tweet.avatar
    ? `<img class="tweet-card__avatar" src="${escapeHtml(tweet.avatar)}" alt="" width="44" height="44" loading="lazy" decoding="async" />`
    : '<span class="tweet-card__avatar tweet-card__avatar--empty" aria-hidden="true"></span>';
  const badge = tweet.verified ? VERIFIED_SVG : '';
  const body = tweet.bodyHtml ? `<div class="tweet-card__body">${tweet.bodyHtml}</div>` : '';
  const media = buildTweetMedia(tweet.photos);
  const article = tweet.article ? buildTweetArticle(tweet.article) : '';
  const quote = tweet.quote ? buildTweetQuote(tweet.quote) : '';
  const date = formatTweetDate(tweet.createdAt);
  const likes =
    tweet.likes > 0
      ? `<span class="tweet-card__likes"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg>${tweet.likes.toLocaleString('en-US')}</span>`
      : '';
  const foot =
    date || likes
      ? `<div class="tweet-card__foot">${date ? `<time datetime="${escapeHtml(tweet.createdAt)}">${date}</time>` : ''}${likes}</div>`
      : '';

  return `<a href="${escapeHtml(tweet.url)}" target="_blank" rel="noopener noreferrer" class="not-prose tweet-card my-6">
  <div class="tweet-card__head">
    ${avatar}
    <div class="tweet-card__id">
      <span class="tweet-card__name">${escapeHtml(tweet.name)}${badge}</span>
      <span class="tweet-card__handle">@${escapeHtml(tweet.handle)}</span>
    </div>
    ${X_LOGO_SVG}
  </div>${body}${media}${article}${quote}${foot}
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

export function readTweetCache(cachePath: string): Record<string, TweetData> {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeTweetCache(cachePath: string, cache: Record<string, TweetData>): void {
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
    return { title: decodeHtmlEntities(title), description: decodeHtmlEntities(description), fetchedAt: new Date().toISOString() };
  } catch {
    return { title: '', description: '', fetchedAt: new Date().toISOString() };
  }
}

// syndication API のトークン生成（react-tweet と同一アルゴリズム）
export function tweetToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

export function extractTweetId(url: string): string {
  return url.match(/\/status\/(\d+)/)?.[1] ?? '';
}

// display_text_range と entities.urls を使い、末尾メディアリンクを除いた本文HTMLを生成する
export function renderTweetText(
  text: string,
  range?: [number, number],
  urls: Array<{ url: string; display_url: string }> = []
): string {
  const chars = Array.from(text ?? '');
  const sliced = range ? chars.slice(range[0], range[1]).join('') : chars.join('');
  let s = sliced;
  for (const u of urls) {
    if (u.url && u.display_url) s = s.split(u.url).join(u.display_url);
  }
  return escapeHtml(s).replace(/\n/g, '<br>');
}

// syndication JSON を TweetData に整形する（信頼できる形のみ）
export function parseSyndicationTweet(data: any, url: string): TweetData {
  const handle = data.user?.screen_name ?? '';
  const id = data.id_str ?? extractTweetId(url);
  const article = data.article
    ? {
        title: data.article.title ?? '',
        cover: data.article.cover_media?.media_info?.original_img_url ?? '',
      }
    : null;
  const photos: TweetMedia[] = (data.mediaDetails ?? [])
    .filter((m: any) => m.type === 'photo')
    .map((m: any) => ({
      url: m.media_url_https,
      width: m.original_info?.width ?? 0,
      height: m.original_info?.height ?? 0,
    }));
  const quote = data.quoted_tweet
    ? {
        name: data.quoted_tweet.user?.name ?? '',
        handle: data.quoted_tweet.user?.screen_name ?? '',
        bodyHtml: renderTweetText(
          data.quoted_tweet.text ?? '',
          data.quoted_tweet.display_text_range,
          data.quoted_tweet.entities?.urls ?? []
        ),
      }
    : null;
  // 記事共有ツイートの本文は t.co リンクだけなので隠す
  const bodyHtml = article
    ? ''
    : renderTweetText(data.text ?? '', data.display_text_range, data.entities?.urls ?? []);
  const avatar = (data.user?.profile_image_url_https ?? '').replace('_normal', '_bigger');
  return {
    url: handle && id ? `https://x.com/${handle}/status/${id}` : url,
    name: data.user?.name ?? '',
    handle,
    avatar,
    verified: data.user?.is_blue_verified ?? data.user?.verified ?? false,
    bodyHtml,
    createdAt: data.created_at ?? '',
    likes: data.favorite_count ?? 0,
    photos,
    article,
    quote,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchTweetSyndication(url: string): Promise<TweetData | null> {
  try {
    const id = extractTweetId(url);
    if (!id) return null;
    const api = new URL('https://cdn.syndication.twimg.com/tweet-result');
    api.searchParams.set('id', id);
    api.searchParams.set('token', tweetToken(id));
    api.searchParams.set('lang', 'en');

    const res = await fetch(api.href, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (!data || data.__typename !== 'Tweet' || !data.user) return null;
    return parseSyndicationTweet(data, url);
  } catch {
    return null;
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

export async function getTweet(
  url: string,
  cachePath: string = path.join(process.cwd(), 'src/data/tweet-cache.json')
): Promise<TweetData | null> {
  const cache = readTweetCache(cachePath);
  if (cache[url]) return cache[url];
  const data = await fetchTweetSyndication(url);
  if (data) {
    cache[url] = data;
    writeTweetCache(cachePath, cache);
  }
  return data;
}

export default function remarkLinkCard(options: RemarkLinkCardOptions = {}) {
  const cachePath = options.cachePath ?? path.join(process.cwd(), 'src/data/ogp-cache.json');
  const contentDir = options.contentDir ?? path.join(process.cwd(), 'src/content/blog');
  const tweetCachePath = options.tweetCachePath ?? path.join(process.cwd(), 'src/data/tweet-cache.json');

  return async function (tree: Root): Promise<void> {
    const targets: Array<{ node: Paragraph; index: number; parent: any }> = [];

    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (isStandaloneUrl(node)) {
        targets.push({ node, index: index!, parent });
      }
    });

    // 逆順で処理してインデックスのずれを防ぐ
    for (const { node, index, parent } of targets.reverse()) {
      const link = node.children[0] as Link;
      const url = link.url;
      let html: string;

      if (isTwitterStatusUrl(url)) {
        const tweet = await getTweet(url, tweetCachePath);
        if (tweet) {
          html = buildTweetCard(tweet);
        } else {
          const ogp = await getOgp(url, cachePath);
          html = buildExternalCard(url, ogp);
        }
      } else if (isInternalBlogUrl(url)) {
        const slug = extractSlug(url);
        const data = readInternalPostData(slug, contentDir);
        if (data) {
          html = buildInternalCard(data, slug);
        } else {
          const ogp = await getOgp(url, cachePath);
          html = buildExternalCard(url, ogp);
        }
      } else {
        const ogp = await getOgp(url, cachePath);
        html = buildExternalCard(url, ogp);
      }

      parent.children.splice(index, 1, { type: 'html', value: html });
    }
  };
}
