import { cleanup, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeMotion } from "./home-motion";
import type { HomeMotionRuntime } from "./home-motion";

const originalConnection = Object.getOwnPropertyDescriptor(navigator, "connection");
const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

function installEnvironment({ reducedMotion = false, saveData = false } = {}) {
  const connection = new EventTarget() as EventTarget & { saveData: boolean };
  connection.saveData = saveData;
  const motionQuery = {
    addEventListener: vi.fn(),
    matches: reducedMotion,
    media: "(prefers-reduced-motion: reduce)",
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => motionQuery),
  });
  Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
}

function createRuntime() {
  type TimelineConfig = {
    scrollTrigger: { pin?: string; trigger: string };
  };
  const missingTargets: string[] = [];
  const timeline = {
    fromTo: vi.fn(),
    to: vi.fn(),
  };
  const recordTarget = (target: unknown) => {
    if (typeof target === "string" && document.querySelector(target) === null) {
      missingTargets.push(target);
    }
    return timeline;
  };
  timeline.fromTo.mockImplementation(recordTarget);
  timeline.to.mockImplementation(recordTarget);

  const media = {
    add: vi.fn(
      (
        _conditions: Record<string, string>,
        callback: (context: { conditions: { isDesktop: boolean; isMobile: boolean } }) => void,
      ) => callback({ conditions: { isDesktop: true, isMobile: false } }),
    ),
    revert: vi.fn(),
  };
  const context = { revert: vi.fn() };
  const gsap = {
    context: vi.fn((callback: () => void) => {
      callback();
      return context;
    }),
    matchMedia: vi.fn(() => media),
    registerPlugin: vi.fn(),
    timeline: vi.fn((config: TimelineConfig) => {
      void config;
      return timeline;
    }),
  };
  const ScrollTrigger = {
    create: vi.fn(),
    refresh: vi.fn(),
  };

  return {
    context,
    media,
    missingTargets,
    runtime: { gsap, ScrollTrigger } as unknown as HomeMotionRuntime,
    ScrollTrigger,
    gsap,
  };
}

function MotionFixture({ children }: { children?: ReactNode }) {
  return (
    <>
      <section data-scene="hero"><div data-pin="hero"><i data-motion="hero-copy" /></div></section>
      <section data-scene="01"><h2 /><i data-motion="knowledge-fragment" /></section>
      <section data-scene="02"><div data-pin="02"><i data-motion="macro-route" /></div></section>
      <section data-scene="03"><i data-motion="topic-atlas-item" /></section>
      <section data-scene="04"><div data-pin="04"><i data-motion="thought-resolution" /></div></section>
      <section data-scene="05"><h2 /></section>
      <section data-scene="06">
        <ol>
          {Array.from({ length: 8 }, (_, index) => <li data-motion="journal-topic" key={index} />)}
        </ol>
      </section>
      <section data-scene="07"><h2 /></section>
      {children}
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  if (originalConnection) Object.defineProperty(navigator, "connection", originalConnection);
  else Reflect.deleteProperty(navigator, "connection");
  if (originalInnerHeight) Object.defineProperty(window, "innerHeight", originalInnerHeight);
  if (originalInnerWidth) Object.defineProperty(window, "innerWidth", originalInnerWidth);
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

describe("HomeMotion", () => {
  it.each([
    { reducedMotion: true, saveData: false },
    { reducedMotion: false, saveData: true },
  ])("does not load the animation runtime for constrained profiles", async (environment) => {
    installEnvironment(environment);
    const loadRuntime = vi.fn();
    const { container } = render(
      <HomeMotion loadRuntime={loadRuntime}><MotionFixture /></HomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced"));
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("owns scene triggers in document order and reverts them on unmount", async () => {
    installEnvironment();
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    const { container, unmount } = render(
      <HomeMotion loadRuntime={loadRuntime}><MotionFixture /></HomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));

    const timelineTriggers = fake.gsap.timeline.mock.calls.map(([config]) => ({
      pin: config.scrollTrigger.pin,
      trigger: config.scrollTrigger.trigger,
    }));
    expect(timelineTriggers).toEqual([
      { trigger: '[data-scene="hero"]', pin: '[data-pin="hero"]' },
      { trigger: '[data-scene="01"]', pin: '[data-pin="01"]' },
      { trigger: '[data-scene="02"]', pin: '[data-pin="02"]' },
      { trigger: '[data-scene="03"]', pin: undefined },
      { trigger: '[data-scene="04"]', pin: '[data-pin="04"]' },
      { trigger: '[data-scene="05"]', pin: undefined },
    ]);
    expect(fake.ScrollTrigger.create).toHaveBeenCalledTimes(9);

    unmount();
    expect(fake.media.revert).toHaveBeenCalledOnce();
    expect(fake.context.revert).toHaveBeenCalledOnce();
  });

  it("only sends rendered home elements to the animation runtime", async () => {
    installEnvironment();
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    const { container } = render(
      <HomeMotion loadRuntime={loadRuntime}><MotionFixture /></HomeMotion>,
    );

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));

    expect(fake.missingTargets).toEqual([]);
  });

});
