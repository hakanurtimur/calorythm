import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicationHome } from "./publication-home";
import { PublicationHomeMotion } from "./publication-home-motion";

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
  it("publishes the approved header-tone sequence for every landing scene", () => {
    const { container } = render(<PublicationHome />);

    expect(
      Array.from(container.querySelectorAll<HTMLElement>("[data-home-scene]")).map(
        (scene) => [scene.dataset.homeScene, scene.dataset.headerTone],
      ),
    ).toEqual([
      ["hero", "light"],
      ["noise", "dark"],
      ["method", "light"],
      ["flagship", "dark"],
      ["journal", "light"],
      ["topics", "light"],
      ["contribution", "dark"],
    ]);
  });

  it("keeps the one-poster mobile cover below the fixed masthead", () => {
    expect(homeStyles).toMatch(
      /\[data-home-scene="hero"\]\[data-hero-visual="poster"\][^\{]*\{[^}]*--mobile-cover-title-top:/,
    );
    expect(homeStyles).toMatch(
      /article\[data-copy-chapter="cover"\] \[data-copy-zone="headline"\][^\{]*\{[^}]*position:\s*absolute !important;[^}]*top:\s*var\(--mobile-cover-title-top\) !important/,
    );
    expect(homeStyles).toMatch(
      /article\[data-copy-chapter="cover"\] \[data-copy-zone="caption"\][^\{]*\{[^}]*bottom:\s*var\(--mobile-cover-caption-bottom\) !important;[^}]*position:\s*absolute !important/,
    );
    expect(homeStyles).toMatch(
      /article\[data-copy-chapter\]:not\(\[data-copy-chapter="cover"\]\)[^\{]*\{[^}]*display:\s*none/,
    );
  });

  it("renders six distinct editorial scenes below the conductor cover", () => {
    const { container } = render(<PublicationHome />);

    expect(container.querySelector('[data-home-scene="hero"]')).toBeInTheDocument();
    SCENES.forEach((scene) => {
      expect(container.querySelector(`[data-home-scene="${scene}"]`)).toBeInTheDocument();
    });
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector('[data-scene="01"]')).not.toBeInTheDocument();
  });

  it("keeps the living-folio story understandable without motion", () => {
    const { container } = render(<PublicationHome />);
    const method = container.querySelector('[data-home-scene="method"]');

    expect(method).not.toBeNull();
    expect(
      within(method as HTMLElement).getByRole("heading", {
        name: "Bir konu, tek bir sonuçtan ibaret değildir.",
      }),
    ).toBeVisible();
    [
      "Bilgiyi, bağlantılarıyla birlikte görünür kılıyoruz.",
      "Her dosya, kendi görsel dünyasını kurar.",
    ].forEach((heading) => {
      expect(
        within(method as HTMLElement).getByRole("heading", { name: heading }),
      ).toBeVisible();
    });

    const pageIds = ["physiology", "structure", "metabolism", "research"] as const;
    const paperSources = pageIds.map((pageId) => {
      const paper = method?.querySelector(`[data-folio-page="${pageId}"]`);
      const image = paper?.querySelector<HTMLImageElement>("[data-folio-page-image]");

      expect(paper).not.toBeNull();
      expect(image).not.toBeNull();
      expect(paper?.querySelector(`[data-folio-page-label="${pageId}"]`)).toBeInTheDocument();

      const renderedSource = image?.getAttribute("src") ?? "";
      const source = renderedSource.startsWith("/_next/image")
        ? new URL(renderedSource, "http://localhost").searchParams.get("url") ?? ""
        : renderedSource;
      expect(source).toMatch(
        new RegExp(`calorythm-folio-page-${pageId}(?:-[^/]+)?\\.webp$`),
      );
      expect(existsSync(resolve(process.cwd(), "public", source.replace(/^\//, "")))).toBe(true);

      return source;
    });

    expect(new Set(paperSources).size).toBe(4);
    expect(method?.querySelectorAll("[data-folio-beat]")).toHaveLength(3);
    const brandedBase = method?.querySelector<HTMLImageElement>("[data-folio-base]");
    const brandedForeground = method?.querySelector<HTMLImageElement>(
      "[data-folio-foreground] img",
    );
    const resolveImageSource = (image: HTMLImageElement | null | undefined) => {
      const renderedSource = image?.getAttribute("src") ?? "";

      return renderedSource.startsWith("/_next/image")
        ? new URL(renderedSource, "http://localhost").searchParams.get("url") ?? ""
        : renderedSource;
    };
    const brandedBaseSource = resolveImageSource(brandedBase);

    expect(brandedBaseSource).toBe("/images/calorythm-folio-base-branded-v2.webp");
    expect(resolveImageSource(brandedForeground)).toBe(brandedBaseSource);
    expect(
      existsSync(resolve(process.cwd(), "public", brandedBaseSource.replace(/^\//, ""))),
    ).toBe(true);
    expect(method?.querySelectorAll("clipPath, [clip-path]")).toHaveLength(0);
    expect(method?.querySelector('[href*="calorythm-folio-pages-v1"]')).not.toBeInTheDocument();
    expect(method?.querySelector("[data-folio-foreground]")).toBeInTheDocument();
    expect(method?.querySelector("[data-folio-brand]")).not.toBeInTheDocument();
    expect(method).toHaveTextContent(
      "Her görsel dosya; araştırma, beden ve gündelik yaşam arasında bağ kurar.",
    );
    expect(method?.querySelector('img[src*="calorythm-apple-"]')).not.toBeInTheDocument();
    expect(method?.querySelector('img[src*="matter-source.webp"]')).not.toBeInTheDocument();
  });

  it("opens the Protein flagship as one complete visual-essay preview", () => {
    const { container } = render(<PublicationHome />);
    const flagship = container.querySelector('[data-home-scene="flagship"]') as HTMLElement;
    const images = flagship.querySelectorAll<HTMLImageElement>("img");

    expect(flagship).not.toBeNull();
    expect(images).toHaveLength(1);

    const renderedSource = images[0]?.getAttribute("src") ?? "";
    const source = renderedSource.startsWith("/_next/image")
      ? new URL(renderedSource, "http://localhost").searchParams.get("url") ?? ""
      : renderedSource;

    expect(source).toBe("/images/calorythm-protein-flagship-v1.webp");
    expect(existsSync(resolve(process.cwd(), "public", source.replace(/^\//, "")))).toBe(true);

    const roleMarkers = Array.from(
      flagship.querySelectorAll<HTMLElement>("[data-protein-role]"),
    );
    expect(roleMarkers).toHaveLength(5);
    expect(roleMarkers.map((marker) => marker.textContent?.trim())).toEqual([
      "Yapı",
      "Kataliz",
      "Taşıma",
      "Sinyal",
      "Savunma",
    ]);
    roleMarkers.forEach((marker) => {
      expect(marker).toBeVisible();
      expect(marker).not.toHaveAttribute("aria-hidden", "true");
    });

    expect(
      within(flagship).getByRole("heading", {
        name: "Protein Sadece Kas İçin Değildir",
      }),
    ).toBeVisible();
    expect(flagship).toHaveTextContent(
      "Kas, proteinin en görünür hikâyesi. Oysa proteinler aynı anda yapı kurar, tepkimeleri hızlandırır, molekül taşır, sinyal iletir ve savunmaya katılır.",
    );
    expect(
      within(flagship).getByRole("link", { name: "Hikâyeyi oku" }),
    ).toHaveAttribute("href", "/journal/protein-sadece-kas-icin-degildir");
    expect(flagship.querySelectorAll("[data-fiber-path], .fiberScore")).toHaveLength(0);
  });

  it("re-enters the four hero bands as one spiral apostrophe", () => {
    const { container } = render(<PublicationHome />);
    const noise = container.querySelector('[data-home-scene="noise"]');

    expect(noise).not.toBeNull();
    expect(
      within(noise as HTMLElement).getByRole("heading", {
        name: "Peki, hangisi yayımlanmaya değer?",
      }),
    ).toBeVisible();
    const spiralBands = noise?.querySelectorAll("[data-noise-apostrophe-band]");
    const descendingFeeders = noise?.querySelectorAll("[data-noise-apostrophe-feeder]");
    const greyTracks = noise?.querySelectorAll("[data-noise-apostrophe-base]");
    const heroBandSequence = Array.from(
      container.querySelectorAll("[data-rhythm-band]"),
      (band) => band.getAttribute("data-rhythm-band"),
    );
    const apostropheBandSequence = Array.from(
      spiralBands ?? [],
      (band) => band.getAttribute("data-noise-apostrophe-band"),
    );

    expect(spiralBands).toHaveLength(4);
    expect(descendingFeeders).toHaveLength(4);
    expect(greyTracks).toHaveLength(4);
    expect(apostropheBandSequence).toEqual(heroBandSequence);
    spiralBands?.forEach((band) => expect(band).not.toHaveAttribute("pathLength"));
    descendingFeeders?.forEach((feeder, index) => {
      const pathNumbers = (feeder.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g) ?? [])
        .map(Number);
      const yCoordinates = pathNumbers.filter((_, index) => index % 2 === 1);
      const spiralNumbers = (spiralBands?.[index]?.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g) ?? [])
        .map(Number);
      const spiralTransform = (spiralBands?.[index]?.getAttribute("transform")
        ?.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

      expect(yCoordinates[0]).toBeLessThanOrEqual(0);
      expect(Math.max(...yCoordinates) - Math.min(...yCoordinates)).toBeGreaterThan(1000);
      expect(pathNumbers.at(-2)).toBe(spiralNumbers[0]! + (spiralTransform[0] ?? 0));
      expect(pathNumbers.at(-1)).toBe(spiralNumbers[1]! + (spiralTransform[1] ?? 0));
      expect(feeder).not.toHaveAttribute("pathLength");
    });
    expect(Array.from(greyTracks ?? [], (track) =>
      track.getAttribute("data-noise-apostrophe-base"),
    )).toEqual(heroBandSequence);
    const apostrophe = within(noise as HTMLElement).getByTestId("noise-apostrophe");
    expect(apostrophe).toBeVisible();
    expect(apostrophe).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
    expect(homeStyles).toMatch(
      /\.noiseApostropheBase\s*{[\s\S]*?stroke:\s*color-mix\([\s\S]*?stroke-dashoffset:\s*0/,
    );
    const fullBandRule = homeStyles.match(
      /\.publicationHome\[data-motion-profile="full"\] \.noiseApostropheBand\s*\{([^}]*)\}/,
    )?.[1] ?? "";
    const pendingBandRule = homeStyles.match(
      /\.publicationHome\[data-motion-profile="pending"\] \.noiseApostropheBand\s*\{([^}]*)\}/,
    )?.[1] ?? "";
    expect(fullBandRule).toMatch(/opacity:\s*0/);
    expect(pendingBandRule).toMatch(/opacity:\s*0/);
    expect(homeStyles).toMatch(
      /@media \(max-width: 1023px\), \(max-height: 699px\), \(prefers-reduced-motion: reduce\)[\s\S]*?\.publicationHome\[data-motion-profile="pending"\] \.noiseApostropheBand\s*\{[^}]*opacity:\s*1/,
    );
    expect(
      within(noise as HTMLElement).queryAllByText(/Hızlı cevaplar|Kesin sonuçlar|Tek doğru/i),
    ).toHaveLength(0);
    expect(
      within(noise as HTMLElement).getByText(
        "Araştırma · Bağlam · Editoryal özen",
      ),
    ).toBeVisible();
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

  it("turns the Journal into a four-line interactive publication index", () => {
    const { container } = render(<PublicationHome />);
    const journal = container.querySelector<HTMLElement>('[data-home-scene="journal"]')!;
    const stories = Array.from(
      journal.querySelectorAll<HTMLElement>("article[data-journal-story]"),
    );
    const lines = Array.from(
      journal.querySelectorAll<SVGPathElement>("[data-journal-line]"),
    );

    expect(journal).toHaveAttribute("aria-labelledby", "journal-title");
    expect(within(journal).getByRole("heading", { name: "Journal" })).toHaveAttribute(
      "id",
      "journal-title",
    );
    expect(journal.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(journal.querySelector("svg")).toHaveAttribute(
      "preserveAspectRatio",
      "xMinYMid slice",
    );
    expect(lines.map((line) => [
      line.getAttribute("data-journal-line"),
      line.getAttribute("data-band-tone"),
    ])).toEqual([
      ["claim", "orange"],
      ["source", "coral"],
      ["context", "ochre"],
      ["editorial", "olive"],
    ]);

    expect(stories.map((story) => story.dataset.journalStory)).toEqual([
      "protein-sadece-kas-icin-degildir",
      "protein-kalitesi-ne-demek",
      "referans-hedef-ust-sinir",
    ]);
    expect(stories[0]).toHaveTextContent("9 dakika");
    expect(stories[0]).toHaveTextContent("Bedenin bakım dili");
    expect(stories[1]).toHaveTextContent("4 dakika");
    expect(stories[1]).toHaveTextContent("Örüntüyü okumak");
    expect(stories[2]).toHaveTextContent("Sayının bağlamı");
    stories.forEach((story) => {
      expect(story).toHaveTextContent("CALORYTHM Editorya");
      expect(story).toHaveTextContent("Protein");
      expect(story.querySelector("[data-journal-story-deck]")).toBeVisible();
    });
    expect(
      within(journal).getByRole("link", { name: "Tüm Journal’ı keşfet" }),
    ).toHaveAttribute("href", "/journal");

    const scenes = Array.from(container.querySelectorAll("[data-home-scene]"));
    expect(scenes.indexOf(container.querySelector('[data-home-scene="flagship"]')!))
      .toBeLessThan(scenes.indexOf(journal));
    expect(scenes.indexOf(journal))
      .toBeLessThan(scenes.indexOf(container.querySelector('[data-home-scene="topics"]')!));
  });

  it("keeps inactive Journal stories readable while another row is active", () => {
    const inactiveStoryRule = homeStyles.match(
      /\.journal\[data-active-journal-story\] \.journalStory\[data-journal-story-active="false"\]\s*\{([^}]*)\}/,
    )?.[1];
    const footerRule = Array.from(
      homeStyles.matchAll(/\.journalStoryFooter\s*\{([^}]*)\}/g),
      (match) => match[1] ?? "",
    ).find((rule) => rule.includes("color-mix"));
    const footerInkMix = Number(footerRule?.match(/var\(--ink\)\s+(\d+)%/)?.[1]);

    expect(inactiveStoryRule).toBeDefined();
    expect(inactiveStoryRule).not.toMatch(/\bopacity\s*:/);
    expect(footerInkMix).toBeGreaterThanOrEqual(64);
  });

  it("turns the contribution finale into a dark editorial echo invitation", () => {
    const { container } = render(<PublicationHome />);
    const contribution = container.querySelector<HTMLElement>(
      '[data-home-scene="contribution"]',
    )!;
    const lines = Array.from(
      contribution.querySelectorAll<SVGPathElement>("[data-contribution-line]"),
    );
    const figure = contribution.querySelector<HTMLElement>("[data-contribution-figure]");
    const figureImage = figure?.querySelector<HTMLImageElement>(
      "[data-contribution-figure-image]",
    );
    const renderedFigureSource = figureImage?.getAttribute("src") ?? "";
    const figureSource = renderedFigureSource.startsWith("/_next/image")
      ? new URL(renderedFigureSource, "http://localhost").searchParams.get("url") ?? ""
      : renderedFigureSource;

    expect(contribution).toHaveAttribute("aria-labelledby", "contribution-title");
    expect(
      within(contribution).getByRole("heading", {
        name: "Beslenme üzerine iyi bir fikrin varsa, birlikte anlatalım.",
      }),
    ).toHaveAttribute("id", "contribution-title");
    expect(contribution.querySelector("[data-contribution-stage]")).toBeInTheDocument();
    expect(figure).toHaveAttribute("aria-hidden", "true");
    expect(figure).toHaveAttribute("data-contribution-artwork", "editorial-echo");
    expect(figureImage).toHaveAttribute("alt", "");
    expect(figureSource).toBe(
      "/images/calorythm-editorial-echo-v1.png",
    );
    expect(
      existsSync(resolve(process.cwd(), "public", figureSource.replace(/^\//, ""))),
    ).toBe(true);
    expect(contribution.querySelector("[data-contribution-figure-mask]")).not.toBeInTheDocument();
    expect(contribution.querySelector("mask")).not.toBeInTheDocument();
    expect(contribution.querySelector('img[src*="conductor-baton"]')).not.toBeInTheDocument();
    expect(figureImage).toHaveAttribute(
      "data-contribution-figure-image",
      "",
    );
    const apostrophe = contribution.querySelector<SVGElement>(
      "[data-contribution-apostrophe]",
    );
    expect(apostrophe).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(apostrophe).toHaveAttribute("viewBox", "0 0 140 250");
    expect(apostrophe?.querySelector("linearGradient")).toBeInTheDocument();
    expect(apostrophe?.querySelector("path")).toHaveAttribute("data-apostrophe-shape", "");
    expect(contribution.querySelector("[data-contribution-lines]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(contribution.querySelector("[data-contribution-lines]")).toHaveAttribute(
      "focusable",
      "false",
    );
    expect(lines.map((line) => [
      line.getAttribute("data-contribution-line"),
      line.getAttribute("data-band-tone"),
    ])).toEqual([
      ["claim", "orange"],
      ["source", "coral"],
      ["context", "ochre"],
      ["editorial", "olive"],
    ]);
    lines.forEach((line) => {
      expect(line).toHaveAttribute("pathLength", "1");
      expect(line.getAttribute("d")).toMatch(/^M /);
    });
    expect(contribution).not.toHaveTextContent("Açık editorya");
    expect(contribution).not.toHaveTextContent("Editoryal prova");
    expect(contribution).not.toHaveTextContent("UzmanlıkAraştırmaYazarlık");
    expect(
      within(contribution).getByRole("link", { name: "Fikrini paylaş" }),
    ).toHaveAttribute("href", "/about#katki");
  });

  it("uses editorial taxonomy without issue or first-publication framing", () => {
    const { container } = render(<PublicationHome />);

    expect(container).toHaveTextContent("Journal · Protein");
    expect(container).not.toHaveTextContent(/\b001\b|ilk dosya|ilk içerik/i);
    expect(
      within(container).getByRole("heading", {
        name: /Peki, hangisi yayımlanmaya değer\?/i,
      }),
    ).toBeVisible();
  });

  it("gives flagship and topic links surface-aware keyboard focus indicators", () => {
    const { container } = render(<PublicationHome />);
    const flagship = within(
      container.querySelector('[data-home-scene="flagship"]') as HTMLElement,
    ).getByRole("link", { name: "Hikâyeyi oku" });
    const topic = within(
      container.querySelector('[data-home-scene="topics"]') as HTMLElement,
    ).getByRole("link", { name: /Protein/i });

    expect(flagship.className).toContain("primaryLink");
    expect(topic).toHaveAttribute("data-topic-row", "protein");
    expect(homeStyles).toMatch(
      /\.primaryLink:focus-visible\s*{[^}]*outline:\s*3px solid var\(--ink\)/,
    );
    expect(homeStyles).toMatch(
      /\.topicList a:focus-visible\s*{[^}]*outline:\s*3px solid var\(--ink\)/,
    );
  });

  it("server-renders a desktop-stable pending profile with native media fallbacks", () => {
    const markup = renderToStaticMarkup(
      <PublicationHomeMotion><span>İçerik</span></PublicationHomeMotion>,
    );

    expect(markup).toContain('data-motion-profile="pending"');
    expect(homeStyles).toMatch(
      /@media \(max-width: 1023px\), \(max-height: 699px\), \(prefers-reduced-motion: reduce\)[\s\S]*?data-motion-profile="pending"[\s\S]*?data-home-scene="hero"[\s\S]*?height:\s*auto\s*!important/,
    );
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
    expect(homeStyles).toMatch(
      /data-motion-profile="static"[\s\S]*?data-copy-zone="headline"[\s\S]*?clip-path:\s*none\s*!important/,
    );
  });
});
