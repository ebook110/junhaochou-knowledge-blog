import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type Article = CollectionEntry<"articles">;

export async function getPublishedArticles(): Promise<Article[]> {
  const entries = await getCollection("articles", ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function readingMinutes(body: string) {
  return Math.max(1, Math.ceil(body.replace(/[\s#*_`]/g, "").length / 450));
}

export function bySeries(articles: Article[], series: string) {
  return articles
    .filter((article) => article.data.series === series)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}
