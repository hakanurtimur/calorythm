import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeMotion, type HomeMotionRuntime } from "./home-motion";
import { HomeScrollGuide } from "./home-scroll-guide";

type TriggerState = { progress: number };
type TimelineConfig = {
  scrollTrigger: {
    end?: string;
    onLeave?: () => void;
    onUpdate?: (state: TriggerState) => void;
    pin?: string;
    snap?: unknown;
    trigger: string;
  };
};

const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalInnerHeight) Object.defineProperty(window, "innerHeight", originalInnerHeight);
  if (originalInnerWidth) Object.defineProperty(window, "innerWidth", originalInnerWidth);
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
});

function renderConductor() {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      removeEventListener: vi.fn(),
    })),
  });

  const timelines: TimelineConfig[] = [];
  const timeline = { fromTo: vi.fn(), to: vi.fn() };
  timeline.fromTo.mockReturnValue(timeline);
  timeline.to.mockReturnValue(timeline);
  const media = {
    add: vi.fn(
      (
        _conditions: Record<string, string>,
        callback: (context: { conditions: { isDesktop: boolean; isMobile: boolean } }) => void,
      ) => callback({ conditions: { isDesktop: true, isMobile: false } }),
    ),
    revert: vi.fn(),
  };
  const runtime = {
    gsap: {
      context: vi.fn((callback: () => void) => {
        callback();
        return { revert: vi.fn() };
      }),
      matchMedia: vi.fn(() => media),
      registerPlugin: vi.fn(),
      timeline: vi.fn((config: TimelineConfig) => {
        timelines.push(config);
        return timeline;
      }),
    },
    ScrollTrigger: { create: vi.fn(), refresh: vi.fn() },
  } as unknown as HomeMotionRuntime;

  const result = render(
    <HomeMotion loadRuntime={vi.fn().mockResolvedValue(runtime)}>
      <HomeScrollGuide />
      <section data-scene="hero"><div data-pin="hero"><i data-motion="hero-copy" /></div></section>
      <section data-scene="01"><div data-pin="01"><h2><span /></h2></div></section>
      <section data-scene="02"><div data-pin="02"><h2><span /></h2></div></section>
      <section data-scene="03"><div data-pin="03"><i data-motion="atlas-topic" /></div></section>
      <section data-scene="04"><div data-pin="04" /></section>
      <section data-scene="05"><h2 /></section>
    </HomeMotion>,
  );

  return { ...result, timelines };
}

describe("Home scroll conductor motion", () => {
  it("keeps editorial content readable while the animation runtime is pending", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
        removeEventListener: vi.fn(),
      })),
    });
    const loadRuntime = vi.fn(() => new Promise<HomeMotionRuntime>(() => undefined));
    const { container } = render(
      <HomeMotion loadRuntime={loadRuntime}>
        <section data-scene="01" />
      </HomeMotion>,
    );

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    expect(
      container.querySelector<HTMLElement>('[data-scene="01"]')?.style.getPropertyValue(
        "--scene-entry-progress",
      ),
    ).toBe("1");
  });

  it("uses compact, intentional scene distances without forced snapping", async () => {
    const { container, timelines } = renderConductor();
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));

    const pinned = Object.fromEntries(
      timelines
        .filter(({ scrollTrigger }) => scrollTrigger.pin)
        .map(({ scrollTrigger }) => [scrollTrigger.trigger, scrollTrigger]),
    );

    expect(pinned['[data-scene="hero"]']?.end).toBe("+=70%");
    expect(pinned['[data-scene="01"]']?.end).toBe("+=135%");
    expect(pinned['[data-scene="02"]']?.end).toBe("+=150%");
    expect(pinned['[data-scene="03"]']?.end).toBe("+=180%");
    expect(Object.values(pinned).every(({ snap }) => snap === undefined)).toBe(true);
  });

  it("publishes one continuous chapter progress signal from hero through topics", async () => {
    const { container, timelines } = renderConductor();
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));

    const guide = container.querySelector<HTMLElement>('[data-scroll-guide=""]');
    const current = guide?.querySelector('[data-scroll-guide-current=""]');
    const timelineFor = (id: string) =>
      timelines.find(({ scrollTrigger }) =>
        scrollTrigger.pin && scrollTrigger.trigger === `[data-scene="${id}"]`
      );

    timelineFor("hero")?.scrollTrigger.onUpdate?.({ progress: 0.5 });
    expect(guide).toHaveAttribute("data-active-scene", "hero");
    expect(guide?.style.getPropertyValue("--scroll-guide-progress")).toBe("0.125");
    expect(current).toHaveTextContent("00");

    timelineFor("01")?.scrollTrigger.onUpdate?.({ progress: 0.4 });
    expect(guide).toHaveAttribute("data-active-scene", "01");
    expect(guide).toHaveAttribute("data-scroll-phase", "read");
    expect(guide?.style.getPropertyValue("--scroll-guide-progress")).toBe("0.38");
    expect(current).toHaveTextContent("01");

    timelineFor("02")?.scrollTrigger.onUpdate?.({ progress: 0.5 });
    expect(guide).toHaveAttribute("data-active-scene", "02");
    expect(guide?.style.getPropertyValue("--scroll-guide-progress")).toBe("0.6475");

    timelineFor("03")?.scrollTrigger.onUpdate?.({ progress: 0.8 });
    expect(guide).toHaveAttribute("data-active-scene", "03");
    expect(guide).toHaveAttribute("data-scroll-phase", "read");
    expect(guide?.style.getPropertyValue("--scroll-guide-progress")).toBe("0.957");
    expect(guide?.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(guide?.querySelector('[data-scroll-guide-item="03"]')).toHaveAttribute(
      "data-active",
      "true",
    );

    timelineFor("03")?.scrollTrigger.onLeave?.();
    expect(guide).toHaveAttribute("data-visible", "false");
    expect(guide).toHaveAttribute("aria-hidden", "true");
    expect(guide?.inert).toBe(true);

    timelineFor("03")?.scrollTrigger.onUpdate?.({ progress: 0.72 });
    expect(guide).toHaveAttribute("data-visible", "true");
    expect(guide).not.toHaveAttribute("aria-hidden");
    expect(guide?.inert).toBe(false);
  });
});
