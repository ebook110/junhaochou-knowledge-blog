import rss from "@astrojs/rss";
import { getPublishedArticles } from "../utils/articles";
import { site } from "../data/site";
export async function GET(context: { site: URL }) {
  const articles = await getPublishedArticles();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.pubDate,
      link: `/articles/${article.data.slug}/`,
    })),
  });
}
