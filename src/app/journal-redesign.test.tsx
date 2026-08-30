import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getPublishedArticles } from "@/lib/content-selectors";
import JournalPage from "./(publication)/journal/page";

function expectNextImage(image: HTMLElement) {
  expect(image).toHaveAttribute("src");
  expect(image.getAttribute("src")).toContain("/_next/image");
}

describe("redesigned Journal index", () => {
  afterEach(cleanup);

  it("opens with the approved evidence-led editorial promise", () => {
    render(<JournalPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Kaynakları açık. Sınırları görünür.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Beslenme bilimi üzerine görsel dosyalar ve kısa editoryal notlar.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("main")).not.toHaveTextContent(
      /\b001\b|\bilk dosya\b/i,
    );
  });

  it("moves the shared publication header from the dark cover to light content", () => {
    render(<JournalPage />);

    const main = screen.getByRole("main");
    const cover = main.querySelector("[data-journal-cover]");
    const content = main.querySelector("[data-journal-content]");

    expect(cover).toHaveAttribute("data-header-tone", "dark");
    expect(content).toHaveAttribute("data-header-tone", "light");
  });

  it("publishes one flagship and two visually distinct companion stories", () => {
    render(<JournalPage />);

    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);

    const flagship = articles.filter(
      (article) => article.getAttribute("data-editorial-role") === "flagship",
    );
    const notes = articles.filter(
      (article) => article.getAttribute("data-editorial-role") === "note",
    );

    expect(flagship).toHaveLength(1);
    expect(notes).toHaveLength(2);

    const coverImage = within(flagship[0]!).getByRole("img", {
      name: "Protein dosyasının kapak görseli",
    });
    expectNextImage(coverImage);

    const companionImages = notes.map((note) => within(note).getByRole("img"));
    const companionAlts = companionImages.map((image) => image.getAttribute("alt"));

    expect(new Set(companionAlts).size).toBe(2);
    companionAlts.forEach((alt) => {
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(12);
      expect(alt).not.toMatch(/^(?:görsel|resim|image|kapak)$/i);
    });
    companionImages.forEach(expectNextImage);
  });

  it("draws the four-part evidence rail with semantic line labels", () => {
    render(<JournalPage />);

    const lines = Array.from(
      screen.getByRole("main").querySelectorAll("[data-evidence-line]"),
    );

    expect(lines).toHaveLength(4);
    expect(lines.map((line) => line.getAttribute("data-evidence-line"))).toEqual([
      "claim",
      "source",
      "context",
      "editorial",
    ]);
    lines.forEach((line) => {
      const path = line.getAttribute("d") ?? "";
      expect(path).toMatch(/^M -?\d+(?:\.\d+)? 0 C /);
      expect(path.match(/\bC\b/g)).toHaveLength(4);
      expect(path).not.toContain(" L ");
    });
  });

  it("gives each story a specific action instead of repeating a generic link", () => {
    render(<JournalPage />);

    const articles = screen.getAllByRole("article");
    expect(
      within(articles[0]!).getByRole("link", {
        name: /Protein Sadece Kas İçin Değildir.*dosyasını aç/i,
      }),
    ).toBeVisible();
    expect(
      within(articles[1]!).getByRole("link", {
        name: /Bir proteini “kaliteli” yapan ne\?.*notu oku/i,
      }),
    ).toBeVisible();
    expect(
      within(articles[2]!).getByRole("link", {
        name: /Referans değer, hedef ve üst sınır aynı şey değildir.*notu oku/i,
      }),
    ).toBeVisible();
  });

  it("renders every publication date as visible Turkish time metadata", () => {
    const published = getPublishedArticles();
    const originalDates = published.map((article) => article.publishedAt);
    const fixtureDates = ["2026-08-24", "2026-09-05", "2026-10-11"];

    published.forEach((article, index) => {
      (article as { publishedAt: string }).publishedAt = fixtureDates[index]!;
    });

    try {
      render(<JournalPage />);

      const times = Array.from(screen.getByRole("main").querySelectorAll("time"));
      const expectedLabels = fixtureDates.map((date) =>
        new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
          year: "numeric",
        }).format(new Date(`${date}T00:00:00Z`)),
      );

      expect(times).toHaveLength(3);
      times.forEach((time, index) => {
        expect(time).toBeVisible();
        expect(time).toHaveAttribute("datetime", fixtureDates[index]);
        expect(time).toHaveTextContent(expectedLabels[index]!);
      });
    } finally {
      cleanup();
      published.forEach((article, index) => {
        (article as { publishedAt: string }).publishedAt = originalDates[index]!;
      });
    }
  });
});
