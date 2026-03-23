// src/__mocks__/astro-content.ts
export type CollectionEntry<T extends string> = {
  id: string;
  slug: string;
  body: string;
  collection: T;
  data: Record<string, unknown>;
  render: () => Promise<{ Content: () => null; headings: unknown[]; remarkPluginFrontmatter: Record<string, unknown> }>;
};

export function getCollection(_name: string) {
  return Promise.resolve([]);
}

export function defineCollection(config: unknown) {
  return config;
}

export const z = {
  object: (schema: unknown) => schema,
  string: () => ({ max: () => ({}) }),
  array: () => ({ default: () => ({}) }),
  boolean: () => ({ default: () => ({}) }),
  coerce: { date: () => ({ optional: () => ({}) }) },
};
