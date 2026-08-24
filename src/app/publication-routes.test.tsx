import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => navigation);

const journalStyles = readFileSync(
  resolve(process.cwd(), "src/app/(publication)/journal/journal.module.css"),
  "utf8",
);
const topicStyles = readFileSync(
  resolve(process.cwd(), "src/app/(publication)/topics/topics.module.css"),
  "utf8",
);
const editorialStyles = readFileSync(
  resolve(process.cwd(), "src/components/editorial/editorial.module.css"),
  "utf8",
);
const aboutStyles = readFileSync(
  resolve(process.cwd(), "src/app/(publication)/about/about.module.css"),
  "utf8",
);

function cssRule(source: string, selector: string, startAt = 0) {
  const selectorIndex = source.indexOf(selector, startAt);
  expect(selectorIndex, `missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const openingBrace = source.indexOf("{", selectorIndex);
  const closingBrace = source.indexOf("}", openingBrace);

  return source
    .slice(openingBrace + 1, closingBrace)
    .replace(/\s+/g, " ")
    .trim();
}

describe("publication routes", () => {
  beforeEach(() => {
    navigation.notFound.mockClear();
    delete process.env.NEXT_PUBLIC_EDITORIAL_CONTACT_URL;
  });

  afterEach(() => {
    cleanup();
    delete process.env.NEXT_PUBLIC_EDITORIAL_CONTACT_URL;
  });

  it("publishes a three-story Journal river with one dominant visual essay", async () => {
    const { default: JournalPage } = await import("./(publication)/journal/page");

    render(<JournalPage />);

    const main = screen.getByRole("main");
    const stories = within(main).getAllByRole("article");
    expect(stories).toHaveLength(3);
    expect(stories[0]).toHaveAttribute("data-editorial-role", "flagship");
    expect(
      within(stories[0]!).getByRole("link", {
        name: "Protein Sadece Kas İçin Değildir",
      }),
    ).toHaveAttribute("href", "/journal/protein-sadece-kas-icin-degildir");
    expect(
      within(stories[1]!).getByRole("link", {
        name: "Bir proteini “kaliteli” yapan ne?",
      }),
    ).toHaveAttribute("href", "/journal/protein-kalitesi-ne-demek");
    expect(
      within(stories[2]!).getByRole("link", {
        name: "Referans değer, hedef ve üst sınır aynı şey değildir",
      }),
    ).toHaveAttribute("href", "/journal/referans-hedef-ust-sinir");
    expect(within(main).queryByText(/yakında/i)).not.toBeInTheDocument();
  });

  it("renders every editorial note with its full body, sources, and related reading", async () => {
    const { default: ArticlePage } = await import(
      "./(publication)/journal/[slug]/page"
    );
    const page = await ArticlePage({
      params: Promise.resolve({ slug: "protein-kalitesi-ne-demek" }),
    });

    render(page);

    expect(screen.getByRole("article")).toHaveAttribute(
      "data-article-type",
      "editorial-note",
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Bir proteini “kaliteli” yapan ne?",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Kalite tek kelimeye sığmaz" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Bağlam örüntünün parçasıdır" }),
    ).toBeVisible();
    const sources = screen.getByRole("list", { name: "Kaynaklar" });
    expect(within(sources).getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Protein Sadece Kas İçin Değildir" }),
    ).toHaveAttribute("href", "/journal/protein-sadece-kas-icin-degildir");
    expect(screen.getByText("24 Ağustos 2026").closest("time")).toHaveAttribute(
      "datetime",
      "2026-08-24",
    );
  });

  it("dispatches only the flagship visual essay to the seven-scene renderer", async () => {
    const { default: ArticlePage } = await import(
      "./(publication)/journal/[slug]/page"
    );
    const page = await ArticlePage({
      params: Promise.resolve({ slug: "protein-sadece-kas-icin-degildir" }),
    });

    render(page);

    expect(screen.getByRole("article")).toHaveAttribute(
      "data-article-type",
      "visual-essay",
    );
    expect(document.querySelectorAll("[data-protein-scene]")).toHaveLength(7);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(9);
    expect(screen.getByRole("list", { name: "Kaynaklar" })).toBeVisible();
    expect(
      screen.getByText(
        "Bu yazı genel bilimsel açıklamadır; kişisel beslenme veya tedavi önerisi değildir.",
      ),
    ).toBeVisible();
  });

  it("keeps the second short article on the editorial-note renderer", async () => {
    const { default: ArticlePage } = await import(
      "./(publication)/journal/[slug]/page"
    );
    const page = await ArticlePage({
      params: Promise.resolve({ slug: "referans-hedef-ust-sinir" }),
    });

    render(page);

    expect(screen.getByRole("article")).toHaveAttribute(
      "data-article-type",
      "editorial-note",
    );
    expect(document.querySelector("[data-protein-scene]")).toBeNull();
  });

  it("pre-renders every published article and rejects an unknown article slug", async () => {
    const { default: ArticlePage, generateStaticParams } = await import(
      "./(publication)/journal/[slug]/page"
    );

    expect(generateStaticParams()).toEqual([
      { slug: "protein-sadece-kas-icin-degildir" },
      { slug: "protein-kalitesi-ne-demek" },
      { slug: "referans-hedef-ust-sinir" },
    ]);
    await expect(
      ArticlePage({ params: Promise.resolve({ slug: "bilinmeyen-yazi" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(navigation.notFound).toHaveBeenCalledOnce();
  });

  it("exposes all eight permanent topic definitions as working routes", async () => {
    const { default: TopicsPage } = await import("./(publication)/topics/page");

    render(<TopicsPage />);

    const topics = screen.getAllByRole("link", { name: /konusundaki yazıları gör/i });
    expect(topics).toHaveLength(8);
    expect(topics[0]).toHaveAttribute("href", "/topics/protein");
    expect(topics[7]).toHaveAttribute("href", "/topics/mikro-besinler");
    expect(
      screen.getByText(
        "Yapı, onarım, taşıma ve savunmada kullanılan amino asitlerin hikâyesi.",
      ),
    ).toBeVisible();
  });

  it("shows related published work on populated topic pages", async () => {
    const { default: TopicPage } = await import(
      "./(publication)/topics/[slug]/page"
    );
    const page = await TopicPage({
      params: Promise.resolve({ slug: "protein" }),
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "Protein" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(
      screen.getByRole("link", { name: "Protein Sadece Kas İçin Değildir" }),
    ).toHaveAttribute("href", "/journal/protein-sadece-kas-icin-degildir");
  });

  it("names a growing archive instead of inventing a story for an empty topic", async () => {
    const { default: TopicPage } = await import(
      "./(publication)/topics/[slug]/page"
    );
    const page = await TopicPage({
      params: Promise.resolve({ slug: "lif" }),
    });

    render(page);

    expect(
      screen.getByText(/Bu konu arşivi büyüyor/i),
    ).toBeVisible();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tüm Journal’ı gör" })).toHaveAttribute(
      "href",
      "/journal",
    );
  });

  it("pre-renders all topics and rejects an unknown topic slug", async () => {
    const { default: TopicPage, generateStaticParams } = await import(
      "./(publication)/topics/[slug]/page"
    );

    expect(generateStaticParams()).toHaveLength(8);
    expect(generateStaticParams()).toContainEqual({ slug: "hidrasyon" });
    await expect(
      TopicPage({ params: Promise.resolve({ slug: "bilinmeyen-konu" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(navigation.notFound).toHaveBeenCalledOnce();
  });

  it("explains the publication, method, founder perspective, and contribution boundaries", async () => {
    const { default: AboutPage } = await import("./(publication)/about/page");

    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: "CALORYTHM nedir?" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Editoryal yöntem" })).toBeVisible();
    expect(screen.getByText(/diyetisyenlik/i)).toBeVisible();
    expect(screen.getByText(/yazılım ve tasarım/i)).toBeVisible();
    const contribution = document.querySelector("#katki");
    expect(contribution).not.toBeNull();
    expect(contribution).toHaveTextContent(/konu uyumu/i);
    expect(contribution).toHaveTextContent(/kaynak/i);
    expect(contribution).toHaveTextContent(/editoryal inceleme/i);
    expect(contribution).toHaveTextContent(/kapsam ve sınırlar/i);
    expect(contribution).toHaveTextContent(/çıkar çatışması/i);
  });

  it("keeps the unconfigured contribution CTA honest and actionable", async () => {
    const { default: AboutPage } = await import("./(publication)/about/page");

    render(<AboutPage />);

    expect(screen.getByRole("link", { name: "Katkı için iletişime geç" })).toHaveAttribute(
      "href",
      "#iletisim-bilgisi",
    );
    const contactNote = document.querySelector("#iletisim-bilgisi");
    expect(contactNote).toHaveTextContent(
      "Yayın sahibi, canlıya geçmeden önce NEXT_PUBLIC_EDITORIAL_CONTACT_URL değerini yapılandırmalıdır.",
    );
  });

  it("uses the configured editorial contact destination without inventing another channel", async () => {
    process.env.NEXT_PUBLIC_EDITORIAL_CONTACT_URL = "https://example.org/calorythm-katki";
    const { default: AboutPage } = await import("./(publication)/about/page");

    render(<AboutPage />);

    expect(screen.getByRole("link", { name: "Katkı için iletişime geç" })).toHaveAttribute(
      "href",
      "https://example.org/calorythm-katki",
    );
    expect(document.querySelector("#iletisim-bilgisi")).not.toHaveTextContent(
      /canlıya geçmeden önce/i,
    );
  });

  it("keeps keyboard focus visible on every publication surface", () => {
    expect(
      cssRule(
        journalStyles,
        ".flagshipCopy h2 a:focus-visible,\n.storyMeta a:focus-visible,\n.note h2 a:focus-visible,\n.readLink:focus-visible",
      ),
    ).toContain("outline: 3px solid var(--ink)");
    expect(
      cssRule(
        topicStyles,
        ".topicList a:focus-visible,\n.topicIntro > a:focus-visible,\n.topicArticles h3 a:focus-visible",
      ),
    ).toContain("outline: 3px solid var(--ink)");
    expect(cssRule(topicStyles, ".emptyArchive a:focus-visible")).toContain(
      "outline: 3px solid var(--ivory)",
    );
    expect(cssRule(editorialStyles, ".sources a:focus-visible")).toContain(
      "outline: 3px solid var(--ivory)",
    );
    expect(cssRule(editorialStyles, ".related a:focus-visible")).toContain(
      "outline: 3px solid var(--ink)",
    );
    expect(cssRule(aboutStyles, ".contactLink:focus-visible")).toContain(
      "outline: 3px solid var(--ivory)",
    );
  });

  it("fits long publication and topic names inside the narrow mobile reading gutter", () => {
    const topicMobile = topicStyles.indexOf("@media (max-width: 800px)");
    const aboutMobile = aboutStyles.indexOf("@media (max-width: 800px)");

    expect(topicMobile).toBeGreaterThanOrEqual(0);
    expect(aboutMobile).toBeGreaterThanOrEqual(0);
    expect(cssRule(topicStyles, ".topicIntro {", topicMobile)).toContain(
      "grid-template-columns: minmax(0, 1fr)",
    );
    expect(cssRule(topicStyles, ".topicIntro h1", topicMobile)).toContain(
      "font-size: clamp(2rem, 10vw, 4.5rem)",
    );
    expect(cssRule(topicStyles, ".topicIntro h1", topicMobile)).toContain(
      "overflow-wrap: anywhere",
    );
    expect(cssRule(topicStyles, ".topicIntro h1", topicMobile)).toContain(
      "min-width: 0",
    );
    expect(cssRule(aboutStyles, ".manifesto h1", aboutMobile)).toContain(
      "font-size: clamp(2rem, 10vw, 4rem)",
    );
    expect(cssRule(aboutStyles, ".manifesto h1", aboutMobile)).toContain(
      "overflow-wrap: anywhere",
    );
    expect(cssRule(aboutStyles, ".manifesto h1", aboutMobile)).toContain(
      "min-width: 0",
    );
    expect(cssRule(aboutStyles, ".manifesto {", aboutMobile)).toContain(
      "grid-template-columns: minmax(0, 1fr)",
    );
  });
});
