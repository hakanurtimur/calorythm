import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicationHome } from "./publication-home";

const homeStyles = readFileSync(
  resolve(process.cwd(), "src/components/home/publication-home.module.css"),
  "utf8",
);

const SCENES = [
  "noise",
  "method",
  "flagship",
  "journal",
  "topics",
  "contribution",
] as const;

describe("PublicationHome", () => {
  it("renders six distinct editorial scenes below the conductor cover", () => {
    const { container } = render(<PublicationHome />);

    expect(container.querySelector('[data-home-scene="hero"]')).toBeInTheDocument();
    SCENES.forEach((scene) => {
      expect(container.querySelector(`[data-home-scene="${scene}"]`)).toBeInTheDocument();
    });
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector('[data-scene="01"]')).not.toBeInTheDocument();
  });

  it("keeps the editorial method and evidence understandable without motion", () => {
    const { container } = render(<PublicationHome />);
    const method = container.querySelector('[data-home-scene="method"]');

    expect(method).not.toBeNull();
    expect(
      within(method as HTMLElement).getByRole("heading", {
        name: "Bir iddiayı yayımlamadan önce, nereden geldiğine bakarız.",
      }),
    ).toBeVisible();
    expect(
      within(method as HTMLElement).getByText(
        "Kaynak → Kanıtın gücü → Bağlam → Anlatım.",
      ),
    ).toBeVisible();
    expect(
      within(method as HTMLElement).getByRole("img", {
        name: /makro besin yüzeyi/i,
      }),
    ).toHaveAttribute("src", expect.stringContaining("matter-source.webp"));
  });

  it("publishes one flagship, two editorial notes, and eight defined topics", () => {
    const { container } = render(<PublicationHome />);
    const journal = container.querySelector('[data-home-scene="journal"]');
    const atlas = container.querySelector('[data-home-scene="topics"]');

    expect(journal).not.toBeNull();
    expect(
      within(journal as HTMLElement).getByRole("link", {
        name: "Protein Sadece Kas İçin Değildir",
      }),
    ).toHaveAttribute("href", "/journal/protein-sadece-kas-icin-degildir");
    expect(
      within(journal as HTMLElement).getByRole("link", {
        name: "Bir proteini “kaliteli” yapan ne?",
      }),
    ).toBeVisible();
    expect(
      within(journal as HTMLElement).getByRole("link", {
        name: "Referans değer, hedef ve üst sınır aynı şey değildir",
      }),
    ).toBeVisible();

    const topicLinks = within(atlas as HTMLElement).getAllByRole("link");
    expect(topicLinks).toHaveLength(8);
    topicLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringMatching(/^\/topics\//));
      expect(link.querySelector("p")).not.toBeEmptyDOMElement();
    });
  });

  it("replaces the sticky 290svh cover with a readable native-flow cover for static profiles", () => {
    expect(homeStyles).toMatch(
      /\.publicationHome\[data-motion-profile="static"\][\s\S]*?:global\(\[data-home-scene="hero"\]\)[\s\S]*?height:\s*auto\s*!important/,
    );
    expect(homeStyles).toMatch(
      /data-home-scene="hero"\]\)\s*>\s*div[\s\S]*?position:\s*relative\s*!important/,
    );
    expect(homeStyles).toMatch(
      /data-home-scene="hero"\]\)\s+article[\s\S]*?opacity:\s*1\s*!important[\s\S]*?position:\s*relative\s*!important/,
    );
  });
});
