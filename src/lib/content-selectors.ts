import { articles, type ArticleRecord } from "@/content/articles";
import { topics, type TopicRecord } from "@/content/topics";

export const getPublishedArticles = (): readonly ArticleRecord[] =>
  articles.filter((article) => article.status === "published");

export const getArticleBySlug = (slug: string): ArticleRecord | undefined =>
  getPublishedArticles().find((article) => article.slug === slug);

export const getTopicBySlug = (slug: string): TopicRecord | undefined =>
  topics.find((topic) => topic.slug === slug);

export const getArticlesForTopic = (topicSlug: string): readonly ArticleRecord[] =>
  getPublishedArticles().filter((article) => article.topics.includes(topicSlug));

export const getRelatedArticles = (
  article: ArticleRecord,
  limit = article.relatedSlugs.length,
): readonly ArticleRecord[] =>
  article.relatedSlugs
    .map(getArticleBySlug)
    .filter((related): related is ArticleRecord => related !== undefined)
    .slice(0, limit);
