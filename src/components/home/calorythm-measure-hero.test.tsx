import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CalorythmMeasureHero,
  resolveConductorFrame,
} from "./calorythm-measure-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CalorythmMeasureHero", () => {
  it("maps the hero scroll to one anatomical conducting beat", () => {
    expect(resolveConductorFrame(0)).toBe(1);
    expect(resolveConductorFrame(0.25)).toBe(0);
    expect(resolveConductorFrame(0.5)).toBe(1);
    expect(resolveConductorFrame(0.75)).toBe(2);
    expect(resolveConductorFrame(1)).toBe(1);
  });

  it("keeps four addressable rhythm bands in the journal cover", () => {
    const { container } = render(<CalorythmMeasureHero />);

    expect(container.querySelectorAll("[data-rhythm-band]")).toHaveLength(4);
    expect(
      container.querySelector('[data-evidence-visual="threads"]'),
    ).toHaveAttribute("role", "img");
  });

  it("uses the CALORYTHM brand promise as the cover headline", () => {
    render(<CalorythmMeasureHero />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Beslenmenin bir ritmi var\./i,
      }),
    ).toBeInTheDocument();
  });

  it("leaves the publication wordmark and navigation to the global shell", () => {
    render(<CalorythmMeasureHero />);

    expect(screen.queryByRole("link", { name: "CALORYTHM ana sayfa" })).not.toBeInTheDocument();
  });

  it("identifies CALORYTHM as an independent digital visual-story nutrition publication", () => {
    render(<CalorythmMeasureHero />);

    const publicationPromise = screen.getByText(/bağımsız.*dijital.*yayın/i);
    expect(publicationPromise).toHaveTextContent(/CALORYTHM/i);
    expect(publicationPromise).toHaveTextContent(/beslenme bilimi/i);
    expect(publicationPromise).toHaveTextContent(/görsel hikâye/i);
  });

  it("distributes every chapter between headline and caption zones with the rhythm-ring signature", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const headlines = container.querySelectorAll('[data-copy-zone="headline"]');
    const captions = container.querySelectorAll('[data-copy-zone="caption"]');
    const signature = container.querySelector(
      '[data-cover-signature="rhythm-ring"]',
    );
    const signatureImage = signature?.querySelector("img");

    expect(headlines).toHaveLength(3);
    expect(captions).toHaveLength(3);
    expect(signature).toHaveAttribute("aria-hidden", "true");
    expect(signatureImage?.getAttribute("src")).toContain(
      "/brand/calorythm-ring-primary.svg",
    );
  });

  it("keeps issue numbers and publication dates off the timeless cover", () => {
    render(<CalorythmMeasureHero />);

    expect(screen.queryByText(/\bSayı\s*\d+/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\b20\d{2}\b/)).not.toBeInTheDocument();
  });

  it("does not turn the cover into a first-dossier or article teaser", () => {
    render(<CalorythmMeasureHero />);

    expect(
      screen.queryByRole("complementary", { name: /güncel dosya/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Protein Sadece Kas İçin Değildir/i),
    ).not.toBeInTheDocument();
  });

  it("registers aligned anatomical states for local pointer inspection", () => {
    const { container } = render(<CalorythmMeasureHero />);

    const materialImage = container.querySelector(
      '[data-material-state="stone"]',
    );
    const wireframeImages = [
      ...container.querySelectorAll('[data-wireframe-reveal="pointer"]'),
    ];

    expect(materialImage?.getAttribute("href")).toContain(
      "calorythm-conductor-baton-up-v1.webp",
    );
    expect(wireframeImages.map((image) => image.getAttribute("href"))).toEqual([
      "/images/calorythm-conductor-skeleton-up-v1.webp",
      "/images/calorythm-conductor-skeleton-v1.webp",
      "/images/calorythm-conductor-skeleton-down-v1.webp",
    ]);
    wireframeImages.forEach((image) =>
      expect(image).toHaveAttribute("aria-hidden", "true"),
    );
  });

  it("authors the four rhythm bands as curved SVG paths with stable selectors", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;
    const field = visual.querySelector('[data-composite-layer="rhythm-bands"]');
    const bands = [
      ...field!.querySelectorAll<SVGPathElement>("path[data-rhythm-band]"),
    ];

    expect(field).toBeInTheDocument();
    expect(bands).toHaveLength(4);
    expect(field!.querySelector("line[data-rhythm-band]")).not.toBeInTheDocument();
    expect(bands.map((band) => band.dataset.rhythmBand)).toEqual([
      "claim",
      "source",
      "context",
      "editorial",
    ]);
    const entryMasks = [
      ...visual.querySelectorAll<SVGRectElement>("[data-band-entry-mask]"),
    ];
    expect(entryMasks).toHaveLength(4);
    bands.forEach((band) => {
      expect(band.getAttribute("d")).toMatch(/^M/i);
      expect(band.getAttribute("d")).toMatch(/[CQSA]/i);
      expect(band.getAttribute("clip-path")).toMatch(
        /^url\(#.+-band-entry-\d\)$/,
      );
    });
  });

  it("animates the conductor with three aligned raster frames", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;
    const frames = [
      ...visual.querySelectorAll<SVGImageElement>("[data-conductor-frame]"),
    ];

    expect(frames).toHaveLength(3);
    expect(frames.map((frame) => frame.getAttribute("href"))).toEqual([
      "/images/calorythm-conductor-baton-up-v1.webp",
      "/images/calorythm-conductor-baton-mid-v1.webp",
      "/images/calorythm-conductor-baton-down-v1.webp",
    ]);
    frames.forEach((frame, index) => {
      expect(frame).toHaveAttribute("data-frame-index", String(index));
      expect(frame).toHaveAttribute("width", "1672");
      expect(frame).toHaveAttribute("height", "941");
    });
    expect(visual.querySelector("[data-conductor-baton]")).not.toBeInTheDocument();
  });

  it("uses one coarse elbow-to-hand foreground mask instead of finger-depth tricks", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;

    expect(visual).toHaveAttribute("viewBox", "0 0 1672 941");
    expect(visual).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");

    const compositeLayers = [
      ...container.querySelectorAll("[data-composite-layer]"),
    ].map((layer) => layer.getAttribute("data-composite-layer"));
    expect(compositeLayers).toEqual(
      expect.arrayContaining([
        "stone",
        "rhythm-bands",
        "foreground-occluder",
        "inspection-wash",
        "wireframe",
      ]),
    );

    expect(container.querySelectorAll('svg[viewBox="0 0 1672 941"]')).toHaveLength(1);
    const foregroundMasks = [
      ...visual.querySelectorAll('[data-mask-source="forearms-and-apple"]'),
    ];
    expect(foregroundMasks.map((mask) => mask.getAttribute("href"))).toEqual([
      "/images/calorythm-conductor-baton-up-mask-v1.png",
      "/images/calorythm-conductor-baton-mid-mask-v1.png",
      "/images/calorythm-conductor-baton-down-mask-v1.png",
    ]);
    expect(
      visual.querySelector('[data-mask-source="hand-contact"], [data-depth-window]'),
    ).not.toBeInTheDocument();
  });

  it("uses one aligned wireframe state inside the pointer inspection lens", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;
    const wash = visual.querySelector('[data-composite-layer="inspection-wash"]');
    const wireframe = visual.querySelector('[data-composite-layer="wireframe"]');
    const skeletonMasks = [
      ...visual.querySelectorAll('[data-mask-source="skeleton"]'),
    ];
    const skeletonOverlays = [
      ...(wireframe?.querySelectorAll('[data-skeleton-overlay="ink"]') ?? []),
    ];

    expect(wash?.getAttribute("mask")).toBe(wireframe?.getAttribute("mask"));
    expect(wash).toHaveAttribute("data-inspection-tone", "ivory");
    expect(skeletonMasks.map((mask) => mask.getAttribute("href"))).toEqual([
      "/images/calorythm-conductor-skeleton-up-v1.webp",
      "/images/calorythm-conductor-skeleton-v1.webp",
      "/images/calorythm-conductor-skeleton-down-v1.webp",
    ]);
    expect(skeletonOverlays).toHaveLength(3);
    skeletonOverlays.forEach((overlay, index) => {
      expect(overlay).toHaveAttribute("data-frame-index", String(index));
      expect(overlay.getAttribute("mask")).toMatch(
        new RegExp(`^url\\(#.+-skeleton-content-mask-${index}\\)$`),
      );
    });
    expect(wireframe).toHaveAttribute("aria-hidden", "true");
  });

  it("reveals the skeleton through a soft irregular mask without a visible ellipse outline", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;
    const inspectionMask = visual.querySelector(
      'mask[data-inspection-mask="soft-irregular"]',
    );
    const organicShape = inspectionMask?.querySelector(
      'path[data-inspection-shape="organic"]',
    );

    expect(inspectionMask).not.toBeNull();
    expect(organicShape).not.toBeNull();
    if (!inspectionMask || !organicShape) return;

    expect(inspectionMask.querySelector("ellipse")).not.toBeInTheDocument();
    expect(organicShape.getAttribute("d")).toMatch(/[CQSA]/i);
    expect(
      visual.querySelector('[data-composite-layer="inspection-outline"]'),
    ).not.toBeInTheDocument();
  });

  it("can face the character right without mirroring the rhythm bands", () => {
    const { container } = render(
      <CalorythmMeasureHero characterPose="measure-right" />,
    );
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;
    const characterLayers = [
      ...visual.querySelectorAll("[data-character-layer]"),
    ];
    const rhythmBands = visual.querySelector(
      '[data-composite-layer="rhythm-bands"]',
    );

    expect(visual).toHaveAttribute("data-character-pose", "measure-right");
    expect(characterLayers.length).toBeGreaterThan(0);
    characterLayers.forEach((layer) => {
      expect(layer).toHaveAttribute("transform", "translate(1672 0) scale(-1 1)");
    });
    expect(rhythmBands).not.toHaveAttribute("transform");
  });

  it("gives the cover copy room by composing the default figure to the right", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const visual = container.querySelector('[data-evidence-visual="threads"]')!;
    const characterLayers = [
      ...visual.querySelectorAll("[data-character-layer]"),
    ];
    const rhythmBands = visual.querySelector(
      '[data-composite-layer="rhythm-bands"]',
    );

    characterLayers.forEach((layer) => {
      expect(layer).toHaveAttribute(
        "transform",
        "translate(300 70) scale(0.86)",
      );
    });
    expect(rhythmBands).not.toHaveAttribute("transform");
  });

  it("keeps the wireframe inspection active only while the pointer is inside the hero", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const hero = container.querySelector<HTMLElement>("[data-home-scene]")!;
    const stage = hero.firstElementChild!;

    expect(hero).toHaveAttribute("data-wireframe", "idle");
    fireEvent.pointerMove(stage, { clientX: 640, clientY: 360 });
    expect(hero).toHaveAttribute("data-wireframe", "active");
    fireEvent.pointerLeave(stage);
    expect(hero).toHaveAttribute("data-wireframe", "idle");
  });

  it("offers the anatomical inspection to keyboard users", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const hero = container.querySelector<HTMLElement>("[data-home-scene]")!;
    const visual = screen.getByRole("img", {
      name: /anatomik katmanı incelemek için odağa al/i,
    });

    expect(visual).toHaveAttribute("tabindex", "0");
    fireEvent.focus(visual);
    expect(hero).toHaveAttribute("data-wireframe", "active");
    fireEvent.blur(visual);
    expect(hero).toHaveAttribute("data-wireframe", "idle");
  });

  it("keeps the editorial registration cursor decorative while preserving pointer and focus inspection", () => {
    const { container } = render(<CalorythmMeasureHero />);
    const hero = container.querySelector<HTMLElement>("[data-home-scene]")!;
    const stage = hero.firstElementChild!;
    const cursor = container.querySelector(
      '[data-editorial-cursor="registration"]',
    );
    const visual = screen.getByRole("img", {
      name: /anatomik katmanı incelemek için odağa al/i,
    });

    expect(cursor).not.toBeNull();
    if (!cursor) return;

    expect(cursor).toHaveAttribute("aria-hidden", "true");
    expect(cursor).not.toHaveAttribute("role");
    expect(cursor).not.toHaveAttribute("tabindex");
    expect(visual).toHaveAttribute("tabindex", "0");

    fireEvent.pointerMove(stage, { clientX: 640, clientY: 360 });
    expect(hero).toHaveAttribute("data-wireframe", "active");
    fireEvent.pointerLeave(stage);
    expect(hero).toHaveAttribute("data-wireframe", "idle");

    fireEvent.focus(visual);
    expect(hero).toHaveAttribute("data-wireframe", "active");
    fireEvent.blur(visual);
    expect(hero).toHaveAttribute("data-wireframe", "idle");
  });

  it("coalesces pointer geometry and cursor writes into one animation frame", () => {
    const animationFrames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });

    const { container } = render(<CalorythmMeasureHero />);
    const hero = container.querySelector<HTMLElement>("[data-home-scene]")!;
    const stage = hero.firstElementChild as HTMLElement;
    const visual = container.querySelector<SVGSVGElement>(
      '[data-evidence-visual="threads"]',
    )!;
    const cursor = container.querySelector<HTMLElement>(
      '[data-editorial-cursor="registration"]',
    )!;
    const boundsRead = vi.spyOn(stage, "getBoundingClientRect");
    const matrixRead = vi.fn(() => null);
    Object.defineProperty(visual, "getScreenCTM", {
      configurable: true,
      value: matrixRead,
    });

    fireEvent(
      stage,
      new MouseEvent("pointermove", { clientX: 640, clientY: 360 }),
    );
    fireEvent(
      stage,
      new MouseEvent("pointermove", { clientX: 720, clientY: 420 }),
    );

    expect(boundsRead).not.toHaveBeenCalled();
    expect(matrixRead).not.toHaveBeenCalled();
    expect(stage.style.getPropertyValue("--cursor-x")).toBe("");
    expect(cursor.style.getPropertyValue("--cursor-x")).toBe("");
    expect(animationFrames).toHaveLength(1);

    act(() => animationFrames[0]!(16));

    expect(cursor.style.getPropertyValue("--cursor-x")).toBe("720.00px");
    expect(cursor.style.getPropertyValue("--cursor-y")).toBe("420.00px");
  });

  it("keeps tape geometry and inspection static with reduced motion", () => {
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );

    const { container } = render(<CalorythmMeasureHero />);
    const hero = container.querySelector<HTMLElement>("[data-home-scene]")!;
    const stage = hero.firstElementChild!;
    const visual = container.querySelector<SVGSVGElement>(
      '[data-evidence-visual="threads"]',
    )!;

    fireEvent.pointerMove(stage, { clientX: 640, clientY: 360 });

    expect(hero).toHaveAttribute("data-motion", "reduced");
    expect(hero).toHaveAttribute("data-inspection", "static");
    expect(hero).toHaveAttribute("data-wireframe", "idle");
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    fireEvent.focus(visual);
    expect(hero).toHaveAttribute("data-wireframe", "active");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    fireEvent.blur(visual);
    expect(hero).toHaveAttribute("data-wireframe", "idle");
  });
});
