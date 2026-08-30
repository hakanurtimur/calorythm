import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProteinTopicLanding } from "./protein-topic-landing";

const proteinRoles = ["Yapı", "Kataliz", "Taşıma", "Sinyal", "Savunma"] as const;

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
  });

  it("makes all five protein roles available as one readable set", () => {
    const roles = screen.getByRole("list", {
      name: "Proteinin bedendeki rolleri",
    });
    const items = within(roles).getAllByRole("listitem");

    expect(items).toHaveLength(5);
    expect(items.map((item) => item.textContent?.trim())).toEqual(proteinRoles);
  });

  it("stages the five roles around one decisive anatomical atlas instead of a texture carousel", () => {
    const theatre = screen.getByRole("figure", {
      name: "Proteinin bedendeki görevlerini gösteren anatomik atlas",
    });

    expect(within(theatre).getAllByRole("img")).toHaveLength(1);
    expect(within(theatre).getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("protein-role-atlas-v2.webp"),
    );
    expect(
      new Set(
        Array.from(theatre.querySelectorAll("img"), (image) => image.getAttribute("src")),
      ),
    ).toHaveLength(1);
    expect(theatre.querySelectorAll("[data-role-marker]")).toHaveLength(5);
    expect(theatre.querySelector("[data-protein-role-focus-lens]")).not.toBeNull();
    expect(document.querySelector("[data-role-texture]")).toBeNull();
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
