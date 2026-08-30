import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildJournalLinePath,
  PublicationHomeMotion,
  type PublicationHomeMotionRuntime,
} from "./publication-home-motion";

const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
const originalIntersectionObserver = Object.getOwnPropertyDescriptor(window, "IntersectionObserver");

function installEnvironment({
  height = 900,
  reducedMotion = false,
  width = 1440,
} = {}) {
  const motionQuery = {
    addEventListener: vi.fn(),
    matches: reducedMotion,
    media: "(prefers-reduced-motion: reduce)",
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => motionQuery),
  });

  return {
    setViewport: (nextWidth: number, nextHeight: number) => {
      Object.defineProperty(window, "innerHeight", { configurable: true, value: nextHeight });
      Object.defineProperty(window, "innerWidth", { configurable: true, value: nextWidth });
      window.dispatchEvent(new Event("resize"));
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((fulfil) => {
    resolve = fulfil;
  });

  return { promise, resolve };
}

function installIntersectionObserver() {
  let callback: IntersectionObserverCallback | undefined;
  let target: Element | undefined;
  const disconnect = vi.fn();
  const observe = vi.fn((nextTarget: Element) => {
    target = nextTarget;
  });

  class TestIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "160% 0px";
    readonly thresholds = [0];

    constructor(nextCallback: IntersectionObserverCallback) {
      callback = nextCallback;
    }

    disconnect = disconnect;
    observe = observe;
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();
  }

  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    value: TestIntersectionObserver,
  });

  return {
    disconnect,
    observe,
    reveal: () => {
      if (!callback || !target) throw new Error("Noise boundary was not observed");
      callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    },
  };
}

function createRuntime() {
  const animationCalls: Record<string, unknown>[] = [];
  const animationSteps: Array<{
    from?: Record<string, unknown>;
    kind: "fromTo" | "to";
    position?: unknown;
    target: unknown;
    timelineIndex: number;
    to: Record<string, unknown>;
  }> = [];
  const moveCursor = vi.fn();
  const directTweens: Array<{ target: unknown; vars: Record<string, unknown> }> = [];
  const timelines: Array<{
    config: { scrollTrigger?: {
      end?: unknown;
      endTrigger?: unknown;
      onUpdate?: (state: { progress: number }) => void;
      pin?: unknown;
      scrub?: unknown;
      start?: unknown;
      trigger?: unknown;
    } };
  }> = [];
  const context = { revert: vi.fn() };
  const DrawSVGPlugin = { name: "drawSVG" };
  const ScrollTrigger = { name: "scrollTrigger" };
  const gsap = {
    context: vi.fn((callback: () => void) => {
      callback();
      return context;
    }),
    killTweensOf: vi.fn(),
    quickTo: vi.fn(() => moveCursor),
    registerPlugin: vi.fn(),
    to: vi.fn((target: unknown, vars: Record<string, unknown>) => {
      directTweens.push({ target, vars });
      const targets = target instanceof Element
        ? [target]
        : Array.from(target as ArrayLike<Element>);
      const attr = vars.attr as { d?: string | ((index: number) => string) } | undefined;

      targets.forEach((element, index) => {
        const nextPath = typeof attr?.d === "function" ? attr.d(index) : attr?.d;
        if (nextPath) element.setAttribute("d", nextPath);
      });

      return { kill: vi.fn() };
    }),
    timeline: vi.fn((config: (typeof timelines)[number]["config"]) => {
      const timelineIndex = timelines.length;
      const timeline = {
        fromTo: vi.fn((target: unknown, from: Record<string, unknown>, to: Record<string, unknown>, position?: unknown) => {
          animationCalls.push(from, to);
          animationSteps.push({ from, kind: "fromTo", position, target, timelineIndex, to });
          return timeline;
        }),
        to: vi.fn((target: unknown, vars: Record<string, unknown>, position?: unknown) => {
          animationCalls.push(vars);
          animationSteps.push({ kind: "to", position, target, timelineIndex, to: vars });
          return timeline;
        }),
      };
      timelines.push({ config });
      return timeline;
    }),
  };

  return {
    animationCalls,
    animationSteps,
    context,
    DrawSVGPlugin,
    gsap,
    runtime: { DrawSVGPlugin, gsap, ScrollTrigger } as unknown as PublicationHomeMotionRuntime,
    ScrollTrigger,
    timelines,
    moveCursor,
    directTweens,
  };
}

function Fixture({ children }: { children?: ReactNode }) {
  const bandIds = ["claim", "source", "context", "editorial"] as const;

  return (
    <>
      <section data-home-scene="hero">
        <svg>
          {bandIds.map((id) => <path data-rhythm-band={id} key={id} />)}
        </svg>
        <h1 data-copy-zone="headline">Kapak</h1>
      </section>
      <section data-home-scene="noise" data-motion-state="start">
        <svg>
          {bandIds.map((id) => (
            <path data-noise-apostrophe-feeder={id} key={`feeder-${id}`} pathLength="1" />
          ))}
          {bandIds.map((id) => (
            <path data-noise-apostrophe-band={id} key={id} pathLength="1" />
          ))}
        </svg>
      </section>
      <section data-home-scene="method">
        <div data-folio-stage="">
          <i data-folio-base="" />
          {(["physiology", "structure", "metabolism", "research"] as const).map((page) => (
            <article data-folio-page={page} key={page}>
              <span data-folio-page-label={page} />
            </article>
          ))}
        </div>
        <article data-folio-beat="opening">Açılış</article>
        <article data-folio-beat="layers">Katmanlar</article>
        <article data-folio-beat="story">Hikâye</article>
        <i data-folio-progress-fill="" />
      </section>
      <section data-home-scene="flagship">
        <div data-protein-flagship-stage="">
          {/* eslint-disable-next-line @next/next/no-img-element -- motion fixture needs a literal DOM image target */}
          <img alt="" data-protein-flagship-image="" src="/images/calorythm-protein-flagship-v1.webp" />
          {([
            ["structure", "Yapı"],
            ["catalysis", "Kataliz"],
            ["transport", "Taşıma"],
            ["signal", "Sinyal"],
            ["defense", "Savunma"],
          ] as const).map(([role, label]) => (
            <span data-protein-role={role} key={role}>{label}</span>
          ))}
          <h2 data-protein-flagship-title="">Protein Sadece Kas İçin Değildir</h2>
          <p data-protein-flagship-deck="">Protein dosyası</p>
          <Link data-protein-flagship-cta="" href="/journal/protein-sadece-kas-icin-degildir">
            Hikâyeyi oku
          </Link>
        </div>
      </section>
      <section data-home-scene="journal">
        <svg data-journal-line-field="" viewBox="0 0 560 1000">
          {([
            ["claim", 78],
            ["source", 122],
            ["context", 166],
            ["editorial", 210],
          ] as const).map(([id, x], index) => (
            <path
              d={buildJournalLinePath({ baseX: x, targetY: 500, tipX: x })}
              data-journal-line={id}
              data-journal-line-index={index}
              key={id}
            />
          ))}
        </svg>
        {([
          ["protein-sadece-kas-icin-degildir", "Protein Sadece Kas İçin Değildir"],
          ["protein-kalitesi-ne-demek", "Bir proteini kaliteli yapan ne?"],
          ["referans-hedef-ust-sinir", "Referans değer ve hedef"],
        ] as const).map(([slug, title]) => (
          <article data-journal-story={slug} key={slug}>
            <div data-journal-story-entrance="">
              <Link data-journal-story-link={slug} href={`/journal/${slug}`}>{title}</Link>
            </div>
          </article>
        ))}
        <Link data-journal-index-cta="" href="/journal">Tüm Journal’ı keşfet</Link>
      </section>
      <section data-home-scene="topics">
        <i data-topic-cursor="" />
        <Link data-topic-row="protein" href="/topics/protein">Protein</Link>
      </section>
      <section data-home-scene="contribution">
        <header data-contribution-copy="">Birlikte anlatalım</header>
        <div data-contribution-stage="">
          <figure data-contribution-figure="">
            <span data-contribution-figure-image="" />
          </figure>
          <span data-contribution-apostrophe="">’</span>
          <svg data-contribution-lines="">
            {bandIds.map((id) => <path data-contribution-line={id} key={id} />)}
          </svg>
          <Link data-contribution-cta="" href="/about#katki">
            Fikrini paylaş
            <i data-contribution-cta-rule="" />
          </Link>
        </div>
      </section>
      {children}
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalInnerHeight) Object.defineProperty(window, "innerHeight", originalInnerHeight);
  if (originalInnerWidth) Object.defineProperty(window, "innerWidth", originalInnerWidth);
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
  if (originalIntersectionObserver) {
    Object.defineProperty(window, "IntersectionObserver", originalIntersectionObserver);
  } else {
    Reflect.deleteProperty(window, "IntersectionObserver");
  }
});

describe("PublicationHomeMotion", () => {
  it("never imports GSAP when reduced motion is preferred", async () => {
    installEnvironment({ reducedMotion: true });
    const loadRuntime = vi.fn();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced"));
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("keeps mobile and short landscape viewports in static native flow", async () => {
    installEnvironment({ height: 375, width: 667 });
    const loadRuntime = vi.fn();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "static"));
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("cancels a pending full-profile runtime when the viewport becomes static", async () => {
    const environment = installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const pendingRuntime = deferred<PublicationHomeMotionRuntime>();
    const loadRuntime = vi.fn(() => pendingRuntime.promise);
    const { container } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    expect(loadRuntime).not.toHaveBeenCalled();
    act(() => boundary.reveal());
    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    act(() => environment.setViewport(667, 375));
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "static"));
    await act(async () => pendingRuntime.resolve(fake.runtime));

    expect(fake.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(fake.gsap.timeline).not.toHaveBeenCalled();
  });

  it("defers the full runtime until the noise boundary approaches", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    const addEventListener = vi.spyOn(window, "addEventListener");
    const { container } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    expect(loadRuntime).not.toHaveBeenCalled();
    expect(boundary.observe).toHaveBeenCalledWith(
      container.querySelector('[data-home-scene="noise"]'),
    );
    expect(
      addEventListener.mock.calls.filter(([eventName]) => eventName === "scroll"),
    ).toHaveLength(0);

    act(() => boundary.reveal());

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());
  });

  it("disconnects an armed boundary observer when unmounted", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const loadRuntime = vi.fn();
    const { container, unmount } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    unmount();

    expect(boundary.disconnect).toHaveBeenCalledOnce();
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("coalesces no-IntersectionObserver scroll fallback reads into one animation frame", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    let scheduledFrame: FrameRequestCallback | undefined;
    const requestFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      scheduledFrame = callback;
      return 41;
    });
    const { container } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );
    const noise = container.querySelector<HTMLElement>('[data-home-scene="noise"]')!;
    const readBounds = vi.spyOn(noise, "getBoundingClientRect").mockReturnValue({ top: 120 } as DOMRect);

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    expect(loadRuntime).not.toHaveBeenCalled();
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    expect(requestFrame).toHaveBeenCalledOnce();
    expect(readBounds).not.toHaveBeenCalled();
    act(() => scheduledFrame?.(0));

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    expect(readBounds).toHaveBeenCalledOnce();
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());
  });

  it("cancels a pending no-IntersectionObserver geometry read on cleanup", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const loadRuntime = vi.fn(() => new Promise<PublicationHomeMotionRuntime>(() => undefined));
    const requestFrame = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(73);
    const cancelFrame = vi.spyOn(window, "cancelAnimationFrame");
    const { container, unmount } = render(
      <PublicationHomeMotion loadRuntime={loadRuntime}><Fixture /></PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(requestFrame).toHaveBeenCalledOnce();
    unmount();

    expect(cancelFrame).toHaveBeenCalledWith(73);
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("hands off at the boundary, then pins the apostrophe and living-folio scenes", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container, unmount } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());
    expect(fake.timelines.map(({ config }) => config.scrollTrigger?.trigger)).toEqual([
      '[data-home-scene="hero"]',
      '[data-home-scene="noise"]',
      '[data-home-scene="method"]',
      '[data-home-scene="flagship"]',
      '[data-home-scene="journal"]',
      '[data-home-scene="contribution"]',
    ]);
    expect(fake.timelines[0]?.config.scrollTrigger).toMatchObject({
      end: "top top",
      endTrigger: '[data-home-scene="noise"]',
    });
    expect(
      fake.timelines
        .filter(({ config }) => config.scrollTrigger?.pin)
        .map(({ config }) => config.scrollTrigger?.trigger),
    ).toEqual([
      '[data-home-scene="noise"]',
      '[data-home-scene="method"]',
      '[data-home-scene="flagship"]',
    ]);
    expect(fake.timelines[1]?.config.scrollTrigger).toMatchObject({
      end: "+=140%",
      pin: '[data-home-scene="noise"]',
      scrub: 0.9,
      start: "top top",
    });
    expect(fake.timelines[2]?.config.scrollTrigger).toMatchObject({
      end: "+=340%",
      pin: '[data-home-scene="method"]',
      scrub: 0.86,
      start: "top top",
    });
    expect(fake.timelines[3]?.config.scrollTrigger).toMatchObject({
      pin: '[data-protein-flagship-stage]',
      start: "top top",
    });
    expect(fake.timelines[3]?.config.scrollTrigger?.scrub).toEqual(expect.any(Number));
    expect(Number(fake.timelines[3]?.config.scrollTrigger?.scrub)).toBeGreaterThanOrEqual(0.75);
    expect(Number(fake.timelines[3]?.config.scrollTrigger?.scrub)).toBeLessThanOrEqual(0.9);

    unmount();
    expect(fake.context.revert).toHaveBeenCalledOnce();
  });

  it("lifts the four nutrition pages from the folio with synchronized copy", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());

    const pageEntries = ["physiology", "structure", "metabolism", "research"].map((page) =>
      fake.animationSteps.find(({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === 2 &&
        target === `[data-folio-page="${page}"]`,
      ),
    );
    const copyEntries = ["layers", "story"].map((beat) =>
      fake.animationSteps.find(({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === 2 &&
        target === `[data-folio-beat="${beat}"]`,
      ),
    );
    const labelEntries = ["physiology", "structure", "metabolism", "research"].map((page) =>
      fake.animationSteps.find(({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === 2 &&
        target === `[data-folio-page-label="${page}"]`,
      ),
    );

    expect(pageEntries.every(Boolean)).toBe(true);
    expect(copyEntries.every(Boolean)).toBe(true);
    expect(labelEntries.every(Boolean)).toBe(true);
    pageEntries.forEach((entry) => {
      expect(entry).toMatchObject({
        from: {
          opacity: 0,
          rotation: expect.any(Number),
          scale: expect.any(Number),
          xPercent: expect.any(Number),
          yPercent: expect.any(Number),
        },
        to: expect.objectContaining({
          opacity: 1,
          rotation: expect.any(Number),
          scale: 1,
          xPercent: 0,
          yPercent: 0,
        }),
      });
    });
    copyEntries.forEach((entry) => {
      expect(entry).toMatchObject({
        from: { opacity: 0, y: expect.any(Number) },
        to: expect.objectContaining({ opacity: 1, y: 0 }),
      });
    });
    labelEntries.forEach((entry) => {
      expect(entry).toMatchObject({
        from: { opacity: 0, y: expect.any(Number) },
        to: expect.objectContaining({ opacity: 1, y: 0 }),
      });
    });
    expect(pageEntries.map((entry) => Number(entry?.position))).toEqual(
      [...pageEntries].map((entry) => Number(entry?.position)).sort((a, b) => a - b),
    );
    expect(fake.animationSteps.some(({ target, timelineIndex }) =>
      timelineIndex === 2 && target === "[data-folio-page]",
    )).toBe(false);
    expect(fake.animationSteps.some(({ target, timelineIndex }) =>
      timelineIndex === 2 && target === "[data-folio-brand]",
    )).toBe(false);
    expect(fake.animationSteps.some(({ timelineIndex, to }) =>
      timelineIndex === 2 &&
      ["clipPath", "filter", "height", "left", "mask", "top", "width"].some((property) => property in to),
    )).toBe(false);
  });

  it("stages the Protein visual essay before revealing its deck and CTA", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());

    const flagshipTimelineIndex = fake.timelines.findIndex(
      ({ config }) => config.scrollTrigger?.trigger === '[data-home-scene="flagship"]',
    );
    const flagshipSteps = fake.animationSteps.filter(
      ({ timelineIndex }) => timelineIndex === flagshipTimelineIndex,
    );
    const imageSteps = flagshipSteps.filter(
      ({ target }) => target === "[data-protein-flagship-image]",
    );

    expect(flagshipTimelineIndex).toBeGreaterThanOrEqual(0);
    expect(imageSteps.length).toBeGreaterThan(0);
    expect(imageSteps.some(({ from, to }) =>
      from?.opacity === 0 &&
      typeof from.scale === "number" &&
      (typeof from.x === "number" || typeof from.xPercent === "number") &&
      (typeof from.y === "number" || typeof from.yPercent === "number") &&
      to.opacity === 1 &&
      to.scale === 1
    )).toBe(true);

    const imageMotionKeys = new Set([
      "duration",
      "ease",
      "immediateRender",
      "opacity",
      "scale",
      "transformOrigin",
      "x",
      "xPercent",
      "y",
      "yPercent",
    ]);
    imageSteps.forEach(({ from = {}, to }) => {
      expect([...Object.keys(from), ...Object.keys(to)].every(
        (property) => imageMotionKeys.has(property),
      )).toBe(true);
    });

    const roles = ["structure", "catalysis", "transport", "signal", "defense"] as const;
    const roleEntries = roles.map((role) => flagshipSteps.find(
      ({ kind, target }) => kind === "fromTo" && target === `[data-protein-role="${role}"]`,
    ));
    expect(roleEntries.every(Boolean)).toBe(true);
    roleEntries.forEach((entry) => {
      expect(entry).toMatchObject({
        from: { opacity: 0, y: expect.any(Number) },
        to: expect.objectContaining({ opacity: 1, y: 0 }),
      });
    });

    const rolePositions = roleEntries.map((entry) => Number(entry?.position));
    expect(rolePositions.every((position, index) =>
      index === 0 || position > rolePositions[index - 1]!,
    )).toBe(true);

    const deckEntry = flagshipSteps.find(
      ({ kind, target }) => kind === "fromTo" && target === "[data-protein-flagship-deck]",
    );
    const ctaEntry = flagshipSteps.find(
      ({ kind, target }) => kind === "fromTo" && target === "[data-protein-flagship-cta]",
    );
    expect(deckEntry).toMatchObject({
      from: { opacity: 0, y: expect.any(Number) },
      to: expect.objectContaining({ opacity: 1, y: 0 }),
    });
    expect(ctaEntry).toMatchObject({
      from: { opacity: 0, y: expect.any(Number) },
      to: expect.objectContaining({ opacity: 1, y: 0 }),
    });
    expect(Number(deckEntry?.position)).toBeGreaterThan(rolePositions.at(-1)!);
    expect(Number(ctaEntry?.position)).toBeGreaterThanOrEqual(Number(deckEntry?.position));

    const layoutHeavyProperties = ["height", "left", "top", "width"];
    expect(flagshipSteps.some(({ from = {}, to }) =>
      layoutHeavyProperties.some((property) => property in from || property in to),
    )).toBe(false);
  });

  it("draws the four Journal lines in order without pinning the section", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());

    const journalTimelineIndex = fake.timelines.findIndex(
      ({ config }) => config.scrollTrigger?.trigger === '[data-home-scene="journal"]',
    );
    const lineEntry = fake.animationSteps.find(
      ({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === journalTimelineIndex &&
        target === "[data-journal-line]",
    );
    const storyEntry = fake.animationSteps.find(
      ({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === journalTimelineIndex &&
        target === "[data-journal-story-entrance]",
    );
    const ctaEntry = fake.animationSteps.find(
      ({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === journalTimelineIndex &&
        target === "[data-journal-index-cta]",
    );

    expect(journalTimelineIndex).toBeGreaterThanOrEqual(0);
    expect(fake.timelines[journalTimelineIndex]?.config.scrollTrigger?.pin).toBeUndefined();
    expect(lineEntry).toMatchObject({
      from: { drawSVG: "0% 0%" },
      to: expect.objectContaining({
        drawSVG: "0% 100%",
        stagger: expect.any(Number),
      }),
    });
    expect(storyEntry).toMatchObject({
      from: { opacity: 0, y: expect.any(Number) },
      to: expect.objectContaining({ opacity: 1, y: 0 }),
    });
    expect(storyEntry?.from).not.toHaveProperty("autoAlpha");
    expect(storyEntry?.to).not.toHaveProperty("autoAlpha");
    expect(ctaEntry).toMatchObject({
      from: { opacity: 0, x: expect.any(Number) },
      to: expect.objectContaining({ opacity: 1, x: 0 }),
    });
    expect(ctaEntry?.from).not.toHaveProperty("autoAlpha");
    expect(ctaEntry?.to).not.toHaveProperty("autoAlpha");
    expect(fake.animationSteps.some(
      ({ kind, target, timelineIndex }) =>
        kind === "fromTo" &&
        timelineIndex === journalTimelineIndex &&
        target === "[data-journal-story]",
    )).toBe(false);
  });

  it("bends all Journal lines toward the hovered or focused story and restores them", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());

    const journal = container.querySelector<HTMLElement>('[data-home-scene="journal"]')!;
    const field = journal.querySelector<SVGElement>("[data-journal-line-field]")!;
    const stories = Array.from(journal.querySelectorAll<HTMLElement>("[data-journal-story]"));
    const paths = Array.from(journal.querySelectorAll<SVGPathElement>("[data-journal-line]"));
    const firstLink = stories[0]!.querySelector<HTMLAnchorElement>("[data-journal-story-link]")!;
    const initialPaths = paths.map((path) => path.getAttribute("d"));

    vi.spyOn(field, "getBoundingClientRect").mockReturnValue({
      height: 800,
      top: 100,
    } as DOMRect);
    stories.forEach((story, index) => {
      vi.spyOn(story, "getBoundingClientRect").mockReturnValue({
        height: 120,
        top: 180 + index * 220,
      } as DOMRect);
    });

    fireEvent.mouseEnter(stories[1]!);

    expect(journal).toHaveAttribute("data-active-journal-story", "protein-kalitesi-ne-demek");
    expect(paths.every((path, index) => path.getAttribute("d") !== initialPaths[index])).toBe(true);
    expect(new Set(paths.map((path) => path.getAttribute("d"))).size).toBe(4);
    expect(paths.every((path) => path.getAttribute("d")?.includes(" C "))).toBe(true);
    expect(paths.every((path) => !path.getAttribute("d")?.includes(" L "))).toBe(true);
    const furthestBend = Math.max(...paths.flatMap((path) => {
      const coordinates = path.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
      return coordinates.filter((_, index) => index % 2 === 0);
    }));
    expect(furthestBend).toBeLessThanOrEqual(320);
    expect(fake.directTweens.at(-1)?.vars).toMatchObject({
      duration: 0.5,
      ease: "power3.out",
    });

    act(() => firstLink.focus());
    expect(journal).toHaveAttribute(
      "data-active-journal-story",
      "protein-sadece-kas-icin-degildir",
    );

    act(() => firstLink.blur());
    expect(journal).toHaveAttribute("data-active-journal-story", "protein-kalitesi-ne-demek");

    fireEvent.mouseLeave(stories[1]!);
    expect(journal).not.toHaveAttribute("data-active-journal-story");
    expect(paths.map((path) => path.getAttribute("d"))).toEqual(initialPaths);
    expect(fake.directTweens.at(-1)?.vars).toMatchObject({
      duration: 0.42,
      ease: "power2.inOut",
    });

    act(() => firstLink.focus());
    const focusedPaths = paths.map((path) => path.getAttribute("d"));
    expect(journal).toHaveAttribute(
      "data-active-journal-story",
      "protein-sadece-kas-icin-degildir",
    );
    expect(focusedPaths).not.toEqual(initialPaths);

    fireEvent.mouseLeave(stories[0]!);
    expect(paths.map((path) => path.getAttribute("d"))).toEqual(focusedPaths);

    act(() => firstLink.blur());
    expect(journal).not.toHaveAttribute("data-active-journal-story");
    expect(paths.map((path) => path.getAttribute("d"))).toEqual(initialPaths);
  });

  it("conducts the final invitation without pinning or hiding its contribution link", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());

    const contributionTimelineIndex = fake.timelines.findIndex(
      ({ config }) => config.scrollTrigger?.trigger === '[data-home-scene="contribution"]',
    );
    const findStep = (target: string) => fake.animationSteps.find(
      (step) => step.timelineIndex === contributionTimelineIndex && step.target === target,
    );

    expect(fake.timelines[contributionTimelineIndex]?.config.scrollTrigger).toMatchObject({
      end: "top 12%",
      scrub: 0.75,
      start: "top 84%",
    });
    expect(fake.timelines[contributionTimelineIndex]?.config.scrollTrigger?.pin).toBeUndefined();
    expect(findStep("[data-contribution-figure]")).toMatchObject({
      from: expect.objectContaining({
        clipPath: expect.stringContaining("100%"),
        scale: expect.any(Number),
        x: expect.any(Number),
      }),
      to: expect.objectContaining({
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        x: 0,
      }),
    });
    expect(findStep("[data-contribution-line]")).toMatchObject({
      from: expect.objectContaining({
        attr: expect.objectContaining({ d: expect.any(Function) }),
        drawSVG: "0% 0%",
      }),
      to: expect.objectContaining({
        attr: expect.objectContaining({ d: expect.any(Function) }),
        drawSVG: "0% 100%",
        stagger: expect.any(Number),
      }),
    });
    expect(findStep("[data-contribution-apostrophe]")).toMatchObject({
      from: expect.objectContaining({ autoAlpha: 0, scale: expect.any(Number) }),
      to: expect.objectContaining({ autoAlpha: 1, scale: 1 }),
    });
    expect(findStep("[data-contribution-copy]")).toMatchObject({
      from: expect.objectContaining({ clipPath: expect.stringContaining("100%"), y: expect.any(Number) }),
      to: expect.objectContaining({ clipPath: "inset(0% 0% 0% 0%)", y: 0 }),
    });
    expect(findStep("[data-contribution-cta-rule]")).toMatchObject({
      from: { scaleX: 0 },
      to: expect.objectContaining({ scaleX: 1 }),
    });
    expect(fake.animationSteps.some(({ from, target, to }) =>
      target === "[data-contribution-cta]" &&
      ("autoAlpha" in (from ?? {}) || "autoAlpha" in to),
    )).toBe(false);
  });

  it("extends the bands downward in order after the noise scene reaches the viewport", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());

    const bandIds = ["claim", "source", "context", "editorial"];
    const heroExits = bandIds.map((id) => fake.animationSteps.find(
      ({ target }) => target === `[data-rhythm-band="${id}"]`,
    ));
    const apostropheEntries = bandIds.map((id) => fake.animationSteps.find(
      ({ target }) => target === `[data-noise-apostrophe-band="${id}"]`,
    ));
    const feederEntries = bandIds.map((id) => fake.animationSteps.find(
      ({ kind, target }) => kind === "fromTo" &&
        target === `[data-noise-apostrophe-feeder="${id}"]`,
    ));
    const feederReleases = bandIds.map((id) => fake.animationSteps.find(
      ({ kind, target }) => kind === "to" &&
        target === `[data-noise-apostrophe-feeder="${id}"]`,
    ));

    expect(heroExits.every(Boolean)).toBe(true);
    expect(apostropheEntries.every(Boolean)).toBe(true);
    expect(feederEntries.every(Boolean)).toBe(true);
    expect(feederReleases.every(Boolean)).toBe(true);
    apostropheEntries.forEach((entry, index) => {
      expect(entry).toMatchObject({
        from: { autoAlpha: 1, drawSVG: "0% 0%" },
        kind: "fromTo",
        to: { drawSVG: "0% 100%", duration: expect.any(Number) },
      });
      expect(entry?.timelineIndex).toBe(1);
      expect(entry?.timelineIndex).not.toBe(heroExits[index]?.timelineIndex);
      expect(Number(entry?.position)).toBeGreaterThanOrEqual(
        Number(feederEntries[index]?.position) + Number(feederEntries[index]?.to.duration),
      );
      expect(feederReleases[index]).toMatchObject({
        timelineIndex: 1,
        to: { drawSVG: "100% 100%" },
      });
      expect(Number(feederReleases[index]?.position)).toBeGreaterThanOrEqual(
        Number(feederEntries[index]?.position) + Number(feederEntries[index]?.to.duration),
      );
    });
    const apostrophePositions = apostropheEntries.map((entry) => Number(entry?.position));
    expect(apostrophePositions).toEqual(
      [...apostrophePositions].sort((left, right) => left - right),
    );
    apostrophePositions.slice(1).forEach((position, index) => {
      expect(position - apostrophePositions[index]!).toBeGreaterThanOrEqual(0.1);
    });
    expect(fake.animationSteps.some(({ target }) =>
      typeof target === "string" && target.includes("data-noise-apostrophe-base"),
    )).toBe(false);
    expect(fake.gsap.registerPlugin).toHaveBeenCalledWith(
      fake.ScrollTrigger,
      fake.DrawSVGPlugin,
    );
  });

  it("positions the topic cursor in scene coordinates on keyboard focus", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());
    const topicScene = container.querySelector<HTMLElement>('[data-home-scene="topics"]')!;
    const topicRow = container.querySelector<HTMLElement>("[data-topic-row]")!;
    vi.spyOn(topicScene, "getBoundingClientRect").mockReturnValue({ top: 100 } as DOMRect);
    vi.spyOn(topicRow, "getBoundingClientRect").mockReturnValue({ height: 80, top: 400 } as DOMRect);

    act(() => topicRow.focus());

    expect(fake.moveCursor).toHaveBeenCalledWith(340);
    expect(topicScene).toHaveAttribute("data-active-topic", "protein");
    expect(container.querySelector("[data-topic-cursor]")).toHaveAttribute("data-active", "true");
  });

  it("derives reverse-scroll state from progress and creates no animation loop", async () => {
    installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());
    const handoffUpdate = fake.timelines[0]?.config.scrollTrigger?.onUpdate;
    const noiseUpdate = fake.timelines[1]?.config.scrollTrigger?.onUpdate;
    const heroBand = container.querySelector<SVGPathElement>("[data-rhythm-band]");
    const noise = container.querySelector('[data-home-scene="noise"]');

    act(() => handoffUpdate?.({ progress: 1 }));
    expect(heroBand?.style.animationPlayState).toBe("paused");
    expect(noise).toHaveAttribute("data-motion-state", "start");
    act(() => noiseUpdate?.({ progress: 1 }));
    expect(noise).toHaveAttribute("data-motion-state", "end");
    act(() => noiseUpdate?.({ progress: 0 }));
    expect(noise).toHaveAttribute("data-motion-state", "start");
    act(() => handoffUpdate?.({ progress: 0 }));
    expect(heroBand?.style.animationPlayState).toBe("running");
    expect(fake.animationCalls).not.toContainEqual(expect.objectContaining({ repeat: -1 }));
  });

  it("restores deterministic visible start states when full motion becomes static", async () => {
    const environment = installEnvironment();
    const boundary = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <PublicationHomeMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </PublicationHomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => boundary.reveal());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalled());
    act(() => fake.timelines[1]?.config.scrollTrigger?.onUpdate?.({ progress: 1 }));
    expect(container.querySelector('[data-home-scene="noise"]')).toHaveAttribute("data-motion-state", "end");

    act(() => environment.setViewport(667, 375));
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "static"));
    container.querySelectorAll<HTMLElement>("[data-motion-state]").forEach((scene) => {
      expect(scene).toHaveAttribute("data-motion-state", "start");
      expect(scene).toHaveAttribute("data-motion-progress", "0.000");
    });
    expect(container.querySelector<SVGPathElement>("[data-rhythm-band]")?.style.animationPlayState).toBe("paused");
  });
});
