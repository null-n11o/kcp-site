const SITE_URL = 'https://kcp.co.jp';
const ORG_NAME = '株式会社KCP';

export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [] as string[],
  };
}

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  datePublished: Date;
  authorName: string;
  authorUrl: string;
  pageUrl: string;
}

export function buildArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished.toISOString(),
    url: input.pageUrl,
    author: {
      '@type': 'Person',
      name: input.authorName,
      url: input.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    },
  };
}

export interface PersonSchemaInput {
  name: string;
  url: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
}

export function buildPersonSchema(input: PersonSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: input.url,
  };
  if (input.jobTitle) schema.jobTitle = input.jobTitle;
  if (input.description) schema.description = input.description;
  if (input.sameAs && input.sameAs.length > 0) schema.sameAs = input.sameAs;
  return schema;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPageSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

const AUTHOR_SLUG_MAP: Record<string, string> = {
  '中野健太朗': 'nakanokentaro',
  '中野 健太朗': 'nakanokentaro',
};

export function getAuthorSlug(authorName: string): string {
  return AUTHOR_SLUG_MAP[authorName] ?? authorName.replace(/\s+/g, '');
}
