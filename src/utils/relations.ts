type RelationCollection = "articles" | "research" | "projects";

const stableSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/** Extract canonical internal detail links from Markdown, MDX, and plain HTML attributes. */
export function extractInternalSlugs(body: string, collection: RelationCollection): string[] {
  const escapedCollection = collection.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(`/${escapedCollection}/([a-z0-9]+(?:-[a-z0-9]+)*)/?`, "gu");
  const slugs = new Set<string>();
  for (const match of body.matchAll(pattern)) {
    const slug = match[1];
    if (slug && stableSlug.test(slug)) slugs.add(slug);
  }
  return [...slugs];
}

export function relatedSlugs(
  explicit: readonly string[],
  body: string,
  collection: RelationCollection,
): Set<string> {
  return new Set([...explicit, ...extractInternalSlugs(body, collection)]);
}
