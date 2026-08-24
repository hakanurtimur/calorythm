import { describe, expect, it } from "vitest";
import {
  getArticleBySlug,
  getArticlesForTopic,
  getPublishedArticles,
  getRelatedArticles,
  getTopicBySlug,
} from "./content-selectors";

describe("publication content selectors", () => {
  it("keeps published articles in editorial order", () => {
    expect(getPublishedArticles().map(({ slug }) => slug)).toEqual([
      "protein-sadece-kas-icin-degildir",
      "protein-kalitesi-ne-demek",
      "referans-hedef-ust-sinir",
    ]);
  });

  it("finds the flagship article and preserves its source list", () => {
    expect(getArticleBySlug("protein-sadece-kas-icin-degildir")?.references.length)
      .toBeGreaterThanOrEqual(7);
  });

  it("resolves articles for a topic in source order", () => {
    expect(getArticlesForTopic("protein")).toHaveLength(3);
    expect(getArticlesForTopic("protein").map(({ slug }) => slug)).toEqual([
      "protein-sadece-kas-icin-degildir",
      "protein-kalitesi-ne-demek",
      "referans-hedef-ust-sinir",
    ]);
  });

  it("resolves explicit related articles up to the requested limit", () => {
    const flagship = getArticleBySlug("protein-sadece-kas-icin-degildir");

    expect(flagship).toBeDefined();
    expect(getRelatedArticles(flagship!)).toHaveLength(2);
    expect(getRelatedArticles(flagship!, 1).map(({ slug }) => slug)).toEqual([
      "protein-kalitesi-ne-demek",
    ]);
  });

  it("returns the matching topic and leaves unknown slugs unresolved", () => {
    expect(getTopicBySlug("protein")?.title).toBe("Protein");
    expect(getArticleBySlug("bilinmeyen")).toBeUndefined();
    expect(getTopicBySlug("bilinmeyen")).toBeUndefined();
  });
});
