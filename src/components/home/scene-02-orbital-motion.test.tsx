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

describe("Scene 02 orbital motion", () => {
  it("keeps the persistent threads in Scene 02 and publishes proof-route progress", async () => {
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
        <section data-scene="02">
          <div data-pin="02">
            <h2 />
            <i data-motion="proof-stop" />
          </div>
        </section>
        <section data-scene="03" />
        <section data-scene="04"><div data-pin="04" /></section>
        <section data-scene="05"><h2 /></section>
      </HomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    const sceneTimeline = timelines.find(
      ({ scrollTrigger }) => scrollTrigger.trigger === '[data-scene="02"]',
    );

    expect(sceneTimeline?.scrollTrigger.pin).toBe('[data-pin="02"]');
    expect(sceneTimeline?.scrollTrigger.onUpdate).toBeTypeOf("function");
    sceneTimeline?.scrollTrigger.onUpdate?.({ progress: 0.64 });
    expect(getOrbitalThreadSnapshot().base).toEqual({
      id: "02",
      kind: "scene",
      progress: 0.64,
    });

    sceneTimeline?.scrollTrigger.onLeaveBack?.();
    expect(getOrbitalThreadSnapshot().base).toEqual({
      id: "01",
      kind: "scene",
      progress: 1,
    });
  });
});
