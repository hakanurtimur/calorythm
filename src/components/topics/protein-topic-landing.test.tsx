import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProteinTopicLanding } from "./protein-topic-landing";

const proteinRoles = [
  {
    example: /Kollajen · Keratin · Aktin/i,
    label: "Yapı",
    note: /Kas lifinden hücre iskeletine/i,
    verb: "Kurar.",
  },
  {
    example: /Pepsin · Amilaz · ATP sentaz/i,
    label: "Kataliz",
    note: /Protein yapılı enzimler/i,
    verb: "Hızlandırır.",
  },
  {
    example: /Hemoglobin · Albumin · Taşıyıcılar/i,
    label: "Taşıma",
    note: /Hemoglobin oksijeni/i,
    verb: "Taşır.",
  },
  {
    example: /İnsülin · Reseptörler/i,
    label: "Sinyal",
    note: /hücrelerin birbirini duymasına/i,
    verb: "Haber verir.",
  },
  {
    example: /Antikorlar · Kompleman proteinleri/i,
    label: "Savunma",
    note: /bedenin yabancıyı tanıma/i,
    verb: "Tanır.",
  },
] as const;

const proteinStories = [
  {
    href: "/journal/protein-sadece-kas-icin-degildir",
    title: "Protein Sadece Kas İçin Değildir",
  },
  {
    href: "/journal/protein-kalitesi-ne-demek",
    title: "Bir proteini “kaliteli” yapan ne?",
  },
  {
    href: "/journal/referans-hedef-ust-sinir",
    title: "Referans değer, hedef ve üst sınır aynı şey değildir",
  },
] as const;

describe("ProteinTopicLanding", () => {
  beforeEach(() => {
    render(<ProteinTopicLanding />);
  });

  afterEach(() => {
    cleanup();
  });

  it("opens the Protein atlas with its editorial premise", () => {
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Protein, bedende tek bir iş yapmaz.",
      }),
    ).toBeVisible();
    expect(document.querySelector("[data-protein-hero-rail]")).toBeNull();
  });

  it("presents all five protein roles as readable editorial entries instead of controls", () => {
    const roles = screen.getByRole("list", {
      name: "Proteinin bedendeki rolleri",
    });
    const items = within(roles).getAllByRole("listitem");

    expect(items).toHaveLength(5);
    expect(within(roles).queryAllByRole("button")).toHaveLength(0);
    proteinRoles.forEach(({ example, label, note, verb }, index) => {
      const item = items[index]!;
      expect(item).toHaveAttribute("data-protein-role-row");
      expect(within(item).getByText(label, { exact: true })).toBeVisible();
      expect(within(item).getByText(verb, { exact: true })).toBeVisible();
      expect(within(item).getByText(note)).toBeVisible();
      expect(within(item).getByText(example)).toBeVisible();
    });
  });

  it("runs four uninterrupted straight brand lines through the complete role ledger", () => {
    const rolesSection = document.querySelector<HTMLElement>(
      '[data-protein-topic-scene="roles"]',
    );
    const ledger = rolesSection?.querySelector<HTMLElement>(
      "[data-protein-role-ledger]",
    );

    expect(rolesSection).toHaveAttribute("data-header-tone", "light");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Tek bir ad. Beş farklı iş.",
      }),
    ).toBeVisible();
    expect(rolesSection?.querySelectorAll("img")).toHaveLength(0);
    expect(ledger).toBeInTheDocument();
    const spineLines = Array.from(
      ledger?.querySelectorAll<SVGLineElement>("[data-protein-role-spine-line]") ?? [],
    );

    expect(spineLines).toHaveLength(4);
    spineLines.forEach((line) => {
      expect(line.tagName.toLowerCase()).toBe("line");
      expect(line).toHaveAttribute("y1", "0");
      expect(line).toHaveAttribute("y2", "1000");
      expect(line).toHaveAttribute("x1", line.getAttribute("x2"));
    });
    expect(rolesSection?.querySelector("figure")).toBeNull();
    expect(document.querySelector("[data-active-protein-role]")).toBeNull();
    expect(document.querySelector("[aria-pressed]")).toBeNull();
  });

  it("links to every published Protein reading", () => {
    proteinStories.forEach(({ href, title }) => {
      expect(screen.getByRole("link", { name: title })).toHaveAttribute("href", href);
    });

    proteinStories.slice(1).forEach(({ href, title }) => {
      const noteLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === href);

      expect(noteLinks).toHaveLength(1);
      expect(noteLinks[0]).toHaveAccessibleName(title);
    });
  });

  it("shows the source spine and continues the topic atlas", () => {
    ["EFSA", "WHO–FAO–UNU", "FAO", "NCBI"].forEach((source) => {
      expect(screen.getByText(source, { exact: true })).toBeVisible();
    });

    expect(
      screen.getByRole("link", {
        name: "Sıradaki konu: Karbonhidrat",
      }),
    ).toHaveAttribute("href", "/topics/karbonhidrat");
  });
});
