import { cleanup, render, waitFor } from "@testing-library/react";
import {
  getOrbitalThreadSnapshot,
  resetOrbitalThreadState,
} from "@/components/orbital/orbital-thread-store";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeMotion, type HomeMotionRuntime } from "./home-motion";

type TriggerState = { progress: number };
type TimelineConfig = {
  scrollTrigger: {
    end?: string;
    onLeave?: () => void;
    onLeaveBack?: () => void;
    onUpdate?: (state: TriggerState) => void;
    pin?: string;
    trigger: string;
  };
};

afterEach(() => {
  cleanup();
  resetOrbitalThreadState();
  vi.restoreAllMocks();
});

describe("Scene 03 orbital motion", () => {
  it("pins the question atlas, publishes progress and activates one topic", async () => {
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

    const { container } = render(
      <HomeMotion loadRuntime={vi.fn().mockResolvedValue(runtime)}>
        <section data-scene="hero"><div data-pin="hero" /></section>
        <section data-scene="01"><div data-pin="01"><h2 /></div></section>
        <section data-scene="02"><div data-pin="02"><h2 /></div></section>
        <section data-scene="03">
          <div data-pin="03">
            <h2 />
            {Array.from({ length: 5 }, (_, index) => (
              <i data-atlas-topic-index={index} data-motion="atlas-topic" key={index} />
            ))}
          </div>
        </section>
        <section data-scene="04"><div data-pin="04" /></section>
        <section data-scene="05"><h2 /></section>
      </HomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    const scene02Timeline = timelines.find(
      ({ scrollTrigger }) => scrollTrigger.trigger === '[data-scene="02"]',
    );
    const scene03Timeline = timelines.find(
      ({ scrollTrigger }) => scrollTrigger.trigger === '[data-scene="03"]',
    );

    scene02Timeline?.scrollTrigger.onLeave?.();
    expect(getOrbitalThreadSnapshot().base).toEqual({
      id: "03",
      kind: "scene",
      progress: 0,
    });

    expect(scene03Timeline?.scrollTrigger.pin).toBe('[data-pin="03"]');
    expect(scene03Timeline?.scrollTrigger.end).toBe("+=180%");
    scene03Timeline?.scrollTrigger.onUpdate?.({ progress: 0.64 });
    expect(getOrbitalThreadSnapshot().base).toEqual({
      id: "03",
      kind: "scene",
      progress: 0.6904,
    });
    expect(container.querySelector('[data-atlas-topic-index="3"]')).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(1);

    scene03Timeline?.scrollTrigger.onLeave?.();
    expect(getOrbitalThreadSnapshot().base).toEqual({
      id: "03",
      kind: "scene",
      progress: 1,
    });

    scene03Timeline?.scrollTrigger.onLeaveBack?.();
    expect(getOrbitalThreadSnapshot().base).toEqual({
      id: "02",
      kind: "scene",
      progress: 1,
    });
  });
});
