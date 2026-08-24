import { act, cleanup, render, waitFor } from "@testing-library/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
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
  const moveCursor = vi.fn();
  const timelines: Array<{
    config: { scrollTrigger?: { onUpdate?: (state: { progress: number }) => void; pin?: unknown; trigger?: unknown } };
  }> = [];
  const timeline = {
    fromTo: vi.fn((_target: unknown, from: Record<string, unknown>, to: Record<string, unknown>) => {
      animationCalls.push(from, to);
      return timeline;
    }),
    to: vi.fn((_target: unknown, vars: Record<string, unknown>) => {
      animationCalls.push(vars);
      return timeline;
    }),
  };
  const context = { revert: vi.fn() };
  const gsap = {
    context: vi.fn((callback: () => void) => {
      callback();
      return context;
    }),
    killTweensOf: vi.fn(),
    quickTo: vi.fn(() => moveCursor),
    registerPlugin: vi.fn(),
    timeline: vi.fn((config: (typeof timelines)[number]["config"]) => {
      timelines.push({ config });
      return timeline;
    }),
  };

  return {
    animationCalls,
    context,
    gsap,
    runtime: { gsap, ScrollTrigger: {} } as unknown as PublicationHomeMotionRuntime,
    timelines,
    moveCursor,
  };
}

function Fixture({ children }: { children?: ReactNode }) {
  return (
    <>
      <section data-home-scene="hero">
        <svg><path data-rhythm-band="claim" /></svg>
        <h1 data-copy-zone="headline">Kapak</h1>
      </section>
      <section data-home-scene="noise"><i data-noise-shutter="" /></section>
      <section data-home-scene="method"><i data-evidence-slice="one" /></section>
      <section data-home-scene="flagship"><svg><path data-fiber-path="structure" /></svg></section>
      <section data-home-scene="journal"><i data-journal-baseline="" /></section>
      <section data-home-scene="topics">
        <i data-topic-cursor="" />
        <Link data-topic-row="protein" href="/topics/protein">Protein</Link>
      </section>
      <section data-home-scene="contribution"><i data-converging-band="claim" /></section>
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

  it("owns ordered scene transitions and pins only explanatory scenes", async () => {
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
    expect(
      fake.timelines
        .filter(({ config }) => config.scrollTrigger?.pin)
        .map(({ config }) => config.scrollTrigger?.trigger),
    ).toEqual(['[data-home-scene="noise"]', '[data-home-scene="method"]']);

    unmount();
    expect(fake.context.revert).toHaveBeenCalledOnce();
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
    const noiseUpdate = fake.timelines[1]?.config.scrollTrigger?.onUpdate;
    const heroUpdate = fake.timelines[0]?.config.scrollTrigger?.onUpdate;
    const heroBand = container.querySelector<SVGPathElement>("[data-rhythm-band]");
    const noise = container.querySelector('[data-home-scene="noise"]');

    act(() => heroUpdate?.({ progress: 1 }));
    expect(heroBand?.style.animationPlayState).toBe("paused");
    act(() => heroUpdate?.({ progress: 0 }));
    expect(heroBand?.style.animationPlayState).toBe("running");
    act(() => noiseUpdate?.({ progress: 1 }));
    expect(noise).toHaveAttribute("data-motion-state", "end");
    act(() => noiseUpdate?.({ progress: 0 }));
    expect(noise).toHaveAttribute("data-motion-state", "start");
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
