import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ProteinStoryMotion,
  resolveProteinMotionProfile,
  type ProteinStoryMotionRuntime,
} from "./protein-story-motion";

const originalConnection = Object.getOwnPropertyDescriptor(navigator, "connection");
const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalIntersectionObserver = Object.getOwnPropertyDescriptor(
  window,
  "IntersectionObserver",
);
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

const sceneNames = [
  "frame",
  "roles",
  "turnover",
  "digestion",
  "reference",
  "pattern",
  "resolution",
] as const;

function Fixture({ children }: { children?: ReactNode }) {
  return (
    <>
      <section data-protein-scene="frame">
        <div data-protein-pin="frame">
          <strong data-protein-frame-word>KAS</strong>
          <span data-protein-frame-role="structure">Yapı</span>
        </div>
      </section>
      <section data-protein-scene="roles">
        <svg><g data-protein-role="structure"><line data-protein-score-rule /></g></svg>
        {Array.from({ length: 5 }, (_, index) => (
          <p data-protein-role-copy={`role-${index}`} key={index}>Rol {index + 1}</p>
        ))}
      </section>
      <section data-protein-scene="turnover">
        <div data-protein-turnover-visual="material" data-protein-image-layer="material" />
        <ol>
          <li data-protein-turnover-state="building" />
          <li data-protein-turnover-state="working" />
          <li data-protein-turnover-state="dismantling" />
        </ol>
      </section>
      <section data-protein-scene="digestion">
        <div data-protein-pin="digestion">
          <div data-protein-digestion-visual="transformation" data-protein-image-layer="digestion" />
          <i data-protein-digestion-focus />
        </div>
      </section>
      <section data-protein-scene="reference">
        <div data-protein-reference-rail="population" />
        <div data-protein-reference-rail="sport" />
        <div data-protein-reference-rail="assessment" />
      </section>
      <section data-protein-scene="pattern">
        <div data-protein-pin="pattern">
          <div data-protein-image-layer="pattern" />
          <i data-protein-chord-row="one" data-protein-pattern-slice="one" />
          <i data-protein-chord-row="two" data-protein-pattern-slice="two" />
          <i data-protein-chord-row="three" data-protein-pattern-slice="three" />
        </div>
      </section>
      <section data-protein-scene="resolution">
        <i data-protein-resolution-mark="one" />
      </section>
      {children}
    </>
  );
}

function installEnvironment({
  height = 900,
  reducedMotion = false,
  saveData = false,
  width = 1440,
} = {}) {
  const motionListeners = new Set<EventListenerOrEventListenerObject>();
  const desktopListeners = new Set<EventListenerOrEventListenerObject>();
  const connection = new EventTarget() as EventTarget & { saveData: boolean };
  connection.saveData = saveData;
  const addConnectionListener = vi.spyOn(connection, "addEventListener");
  const removeConnectionListener = vi.spyOn(connection, "removeEventListener");
  const motionQuery = {
    addEventListener: vi.fn(
      (eventName: string, listener: EventListenerOrEventListenerObject) => {
        if (eventName === "change") motionListeners.add(listener);
      },
    ),
    matches: reducedMotion,
    media: "(prefers-reduced-motion: reduce)",
    removeEventListener: vi.fn(
      (eventName: string, listener: EventListenerOrEventListenerObject) => {
        if (eventName === "change") motionListeners.delete(listener);
      },
    ),
  };
  const desktopQuery = {
    addEventListener: vi.fn(
      (eventName: string, listener: EventListenerOrEventListenerObject) => {
        if (eventName === "change") desktopListeners.add(listener);
      },
    ),
    matches: width >= 1024 && height >= 700,
    media: "(min-width: 1024px) and (min-height: 700px)",
    removeEventListener: vi.fn(
      (eventName: string, listener: EventListenerOrEventListenerObject) => {
        if (eventName === "change") desktopListeners.delete(listener);
      },
    ),
  };

  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => (
      query === "(prefers-reduced-motion: reduce)" ? motionQuery : desktopQuery
    )),
  });
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: connection,
  });

  return {
    addConnectionListener,
    connection,
    desktopQuery,
    motionQuery,
    removeConnectionListener,
    setReducedMotion(nextValue: boolean) {
      motionQuery.matches = nextValue;
      const event = new Event("change");
      motionListeners.forEach((listener) => {
        if (typeof listener === "function") listener(event);
        else listener.handleEvent(event);
      });
    },
    setSaveData(nextValue: boolean) {
      connection.saveData = nextValue;
      connection.dispatchEvent(new Event("change"));
    },
    setViewport(nextWidth: number, nextHeight: number) {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: nextHeight,
      });
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: nextWidth,
      });
      desktopQuery.matches = nextWidth >= 1024 && nextHeight >= 700;
      const event = new Event("change");
      desktopListeners.forEach((listener) => {
        if (typeof listener === "function") listener(event);
        else listener.handleEvent(event);
      });
    },
  };
}

function installIntersectionObserver() {
  let callback: IntersectionObserverCallback | undefined;
  let target: Element | undefined;
  let rootMargin = "";
  const disconnect = vi.fn();
  const observe = vi.fn((nextTarget: Element) => {
    target = nextTarget;
  });

  class TestIntersectionObserver {
    readonly root = null;
    readonly thresholds = [0];

    constructor(
      nextCallback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      callback = nextCallback;
      rootMargin = options?.rootMargin ?? "0px";
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
    reveal() {
      if (!callback || !target) throw new Error("Frame scene was not observed");
      callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    },
    rootMargin: () => rootMargin,
  };
}

function deferred<T>() {
  let resolvePromise!: (value: T) => void;
  const promise = new Promise<T>((resolveValue) => {
    resolvePromise = resolveValue;
  });

  return { promise, resolve: resolvePromise };
}

type TimelineConfig = {
  defaults?: { ease?: string };
  scrollTrigger?: {
    end?: string;
    onUpdate?: (state: { progress: number }) => void;
    pin?: Element;
    pinSpacing?: boolean;
    start?: string;
    trigger?: Element;
  };
};

function createRuntime() {
  const animationSteps: Array<{
    from: Record<string, unknown>;
    target: unknown;
    to: Record<string, unknown>;
  }> = [];
  const animationVars: Record<string, unknown>[] = [];
  const timelines: Array<{ config: TimelineConfig }> = [];
  const context = { revert: vi.fn() };
  const gsap = {
    context: vi.fn((callback: () => void) => {
      callback();
      return context;
    }),
    registerPlugin: vi.fn(),
    timeline: vi.fn((config: TimelineConfig) => {
      timelines.push({ config });
      const timeline = {
        fromTo: vi.fn(
          (
            target: unknown,
            from: Record<string, unknown>,
            to: Record<string, unknown>,
          ) => {
            animationVars.push(from, to);
            animationSteps.push({ from, target, to });
            return timeline;
          },
        ),
        to: vi.fn((_target: unknown, vars: Record<string, unknown>) => {
          animationVars.push(vars);
          return timeline;
        }),
      };
      return timeline;
    }),
  };

  return {
    animationSteps,
    animationVars,
    context,
    gsap,
    runtime: { gsap, ScrollTrigger: {} } as unknown as ProteinStoryMotionRuntime,
    timelines,
  };
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
  if (originalConnection) Object.defineProperty(navigator, "connection", originalConnection);
  else Reflect.deleteProperty(navigator, "connection");
});

describe("resolveProteinMotionProfile", () => {
  it.each([
    [{ width: 1024, height: 700, reducedMotion: false, saveData: false }, "full"],
    [{ width: 1440, height: 900, reducedMotion: false, saveData: false }, "full"],
    [{ width: 1023, height: 900, reducedMotion: false, saveData: false }, "static"],
    [{ width: 1440, height: 699, reducedMotion: false, saveData: false }, "static"],
    [{ width: 667, height: 375, reducedMotion: false, saveData: false }, "static"],
    [{ width: 1440, height: 900, reducedMotion: true, saveData: false }, "reduced"],
    [{ width: 1440, height: 900, reducedMotion: false, saveData: true }, "reduced"],
    [{ width: 390, height: 844, reducedMotion: true, saveData: true }, "reduced"],
  ] as const)("maps %o to %s", (input, expected) => {
    expect(resolveProteinMotionProfile(input)).toBe(expected);
  });
});

describe("ProteinStoryMotion", () => {
  it("server-renders complete semantic children behind a pending motion root", () => {
    const markup = renderToString(
      <ProteinStoryMotion>
        <h2>Kas, hikâyenin tamamı değil</h2>
        <p>Complete article copy</p>
      </ProteinStoryMotion>,
    );

    expect(markup).toContain('data-protein-motion="pending"');
    expect(markup).toContain("Kas, hikâyenin tamamı değil");
    expect(markup).toContain("Complete article copy");
  });

  it.each([
    [{ reducedMotion: true }, "reduced"],
    [{ saveData: true }, "reduced"],
    [{ width: 1023 }, "static"],
    [{ height: 699 }, "static"],
  ] as const)("never loads the runtime for %o", async (environment, expected) => {
    installEnvironment(environment);
    const loadRuntime = vi.fn();
    const { container } = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", expected);
    });
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("defers full runtime loading until the frame scene approaches", async () => {
    installEnvironment();
    const observer = installIntersectionObserver();
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    const addWindowListener = vi.spyOn(window, "addEventListener");
    const { container } = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "full");
    });
    expect(loadRuntime).not.toHaveBeenCalled();
    expect(observer.observe).toHaveBeenCalledWith(
      container.querySelector('[data-protein-scene="frame"]'),
    );
    expect(observer.rootMargin()).toBe("100% 0px");
    expect(
      addWindowListener.mock.calls.filter(([eventName]) => eventName === "scroll"),
    ).toHaveLength(0);

    act(() => observer.reveal());

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalledTimes(7));
  });

  it("disconnects an armed observer without loading when unmounted", async () => {
    installEnvironment();
    const observer = installIntersectionObserver();
    const loadRuntime = vi.fn();
    const { container, unmount } = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "full");
    });
    unmount();

    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("loads immediately when IntersectionObserver is unavailable", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    render(<ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>);

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalledTimes(7));
  });

  it("suppresses a stale async install after the viewport becomes static", async () => {
    const environment = installEnvironment();
    const observer = installIntersectionObserver();
    const pendingRuntime = deferred<ProteinStoryMotionRuntime>();
    const fake = createRuntime();
    const loadRuntime = vi.fn(() => pendingRuntime.promise);
    const { container } = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "full");
    });
    act(() => observer.reveal());
    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    act(() => environment.setViewport(667, 375));
    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "static");
    });
    await act(async () => pendingRuntime.resolve(fake.runtime));

    expect(fake.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(fake.gsap.timeline).not.toHaveBeenCalled();
  });

  it("creates seven ordered scene timelines and pins only frame, digestion, and pattern", async () => {
    installEnvironment();
    const observer = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <ProteinStoryMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "full");
    });
    act(() => observer.reveal());
    await waitFor(() => expect(fake.timelines).toHaveLength(7));

    expect(
      fake.timelines.map(({ config }) => (
        config.scrollTrigger?.trigger as HTMLElement | undefined
      )?.closest<HTMLElement>("[data-protein-scene]")?.dataset.proteinScene),
    ).toEqual(sceneNames);
    expect(
      fake.timelines
        .filter(({ config }) => config.scrollTrigger?.pin)
        .every(({ config }) => config.scrollTrigger?.trigger === config.scrollTrigger?.pin),
    ).toBe(true);
    expect(
      fake.timelines
        .filter(({ config }) => config.scrollTrigger?.pin)
        .map(({ config }) => (
          config.scrollTrigger?.pin as HTMLElement | undefined
        )?.dataset.proteinPin),
    ).toEqual(["frame", "digestion", "pattern"]);
    expect(
      fake.timelines
        .filter(({ config }) => config.scrollTrigger?.pin)
        .every(({ config }) => config.scrollTrigger?.pinSpacing === false),
    ).toBe(true);
    expect(fake.timelines.map(({ config }) => config.defaults?.ease)).toEqual(
      Array.from({ length: 7 }, () => "none"),
    );
    const railStep = fake.animationSteps.find(({ target }) => (
      target instanceof NodeList
      && Array.from(target).some(
        (node) => node instanceof HTMLElement
          && node.hasAttribute("data-protein-reference-rail"),
      )
    ));
    expect(railStep?.from).toEqual(expect.objectContaining({ scaleX: 0.94 }));
    expect(railStep?.from).not.toHaveProperty("xPercent");
    const materialStep = fake.animationSteps.find(
      ({ target }) => target instanceof HTMLElement
        && target.hasAttribute("data-protein-turnover-visual"),
    );
    expect(materialStep?.from).toEqual(expect.objectContaining({
      clipPath: expect.stringContaining("inset"),
      scale: 1.04,
    }));
    const turnoverStatesStep = fake.animationSteps.find(({ target }) => (
      target instanceof NodeList
      && Array.from(target).some(
        (node) => node instanceof HTMLElement
          && node.hasAttribute("data-protein-turnover-state"),
      )
    ));
    expect(turnoverStatesStep?.from).toEqual(
      expect.objectContaining({ autoAlpha: 0.48, y: 18 }),
    );
    expect(turnoverStatesStep?.to).toEqual(
      expect.objectContaining({ autoAlpha: 1, stagger: expect.any(Number), y: 0 }),
    );
    const animatedElements = fake.animationSteps.flatMap(({ target }) => {
      if (target instanceof Element) return [target];
      if (target instanceof NodeList) return Array.from(target).filter(
        (item): item is Element => item instanceof Element,
      );
      return [];
    });
    expect(
      animatedElements.some((element) => element.hasAttribute("data-protein-image-layer")),
    ).toBe(true);
    expect(
      animatedElements.some((element) => element.hasAttribute("data-protein-score-rule")),
    ).toBe(true);
    expect(
      animatedElements.some((element) => element.hasAttribute("data-protein-pattern-slice")),
    ).toBe(true);
    expect(
      animatedElements.some((element) => element.hasAttribute("data-protein-pin")),
    ).toBe(false);
  });

  it("derives progress, endpoint state, and active role from current progress in both directions", async () => {
    installEnvironment();
    const observer = installIntersectionObserver();
    const fake = createRuntime();
    const { container } = render(
      <ProteinStoryMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "full");
    });
    act(() => observer.reveal());
    await waitFor(() => expect(fake.timelines).toHaveLength(7));
    const frame = container.querySelector<HTMLElement>('[data-protein-scene="frame"]')!;
    const roles = container.querySelector<HTMLElement>('[data-protein-scene="roles"]')!;
    const roleCopies = Array.from(
      roles.querySelectorAll<HTMLElement>("[data-protein-role-copy]"),
    );

    act(() => fake.timelines[0]?.config.scrollTrigger?.onUpdate?.({ progress: 1.4 }));
    expect(frame.style.getPropertyValue("--protein-scene-progress")).toBe("1.000");
    expect(frame).toHaveAttribute("data-protein-motion-state", "end");
    act(() => fake.timelines[0]?.config.scrollTrigger?.onUpdate?.({ progress: -0.3 }));
    expect(frame.style.getPropertyValue("--protein-scene-progress")).toBe("0.000");
    expect(frame).toHaveAttribute("data-protein-motion-state", "start");

    act(() => fake.timelines[1]?.config.scrollTrigger?.onUpdate?.({ progress: 0.52 }));
    expect(roles).toHaveAttribute("data-protein-motion-state", "active");
    expect(roleCopies.map((copy) => copy.dataset.proteinRoleActive)).toEqual([
      "false",
      "false",
      "true",
      "false",
      "false",
    ]);
    act(() => fake.timelines[1]?.config.scrollTrigger?.onUpdate?.({ progress: 0 }));
    expect(roles.style.getPropertyValue("--protein-scene-progress")).toBe("0.000");
    expect(roles).toHaveAttribute("data-protein-motion-state", "start");
    expect(roleCopies.map((copy) => copy.dataset.proteinRoleActive)).toEqual([
      "false",
      "false",
      "false",
      "false",
      "false",
    ]);
  });

  it("cleans the scoped context and all constraints on profile change and unmount", async () => {
    const environment = installEnvironment();
    const observer = installIntersectionObserver();
    const fake = createRuntime();
    const { container, unmount } = render(
      <ProteinStoryMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "full");
    });
    act(() => observer.reveal());
    await waitFor(() => expect(fake.timelines).toHaveLength(7));
    act(() => environment.setSaveData(true));
    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "reduced");
    });
    expect(fake.context.revert).toHaveBeenCalledOnce();
    container.querySelectorAll<HTMLElement>("[data-protein-scene]").forEach((scene) => {
      expect(scene.style.getPropertyValue("--protein-scene-progress")).toBe("");
      expect(scene).not.toHaveAttribute("data-protein-motion-state");
    });
    container.querySelectorAll<HTMLElement>("[data-protein-role-copy]").forEach((role) => {
      expect(role).not.toHaveAttribute("data-protein-role-active");
    });

    unmount();
    expect(environment.motionQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    expect(environment.removeConnectionListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    expect(environment.desktopQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("registers a shared runtime plugin once and creates no continuous animation", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    const first = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );
    await waitFor(() => expect(fake.timelines).toHaveLength(7));
    first.unmount();
    render(<ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>);
    await waitFor(() => expect(fake.timelines).toHaveLength(14));

    expect(fake.gsap.registerPlugin).toHaveBeenCalledOnce();
    expect(fake.animationVars).not.toContainEqual(expect.objectContaining({ repeat: -1 }));
    expect(fake.animationVars).not.toContainEqual(expect.objectContaining({ yoyo: true }));
  });

  it("uses observer-driven loading without raw scroll or frame fallbacks and keeps CSS non-sticky", () => {
    const motionSource = readFileSync(
      resolve(
        process.cwd(),
        "src/components/articles/protein/protein-story-motion.tsx",
      ),
      "utf8",
    );
    const essayStyles = readFileSync(
      resolve(
        process.cwd(),
        "src/components/articles/protein/protein-visual-essay.module.css",
      ),
      "utf8",
    );

    expect(motionSource).not.toMatch(/addEventListener\(\s*["']scroll/i);
    expect(motionSource).not.toMatch(/requestAnimationFrame|cancelAnimationFrame/);
    expect(motionSource).not.toMatch(/killAll|getAll\(\)|ScrollTrigger\.kill/i);
    expect(essayStyles).not.toMatch(/position\s*:\s*sticky/i);
    expect(essayStyles).not.toMatch(/\.article\s*\{[^}]*overflow\s*:\s*clip/i);
    expect(essayStyles).toMatch(
      /@media\s*\(min-width:\s*1024px\)\s*and\s*\(min-height:\s*700px\)/i,
    );
    expect(essayStyles).toMatch(
      /\.motionRoot\[data-protein-motion="full"\][^{]*\.frameScene\s*\{[^}]*min-height:/i,
    );
    expect(essayStyles).toMatch(
      /\.motionRoot\[data-protein-motion="pending"\][^{]*\.digestionScene\s*\{[^}]*min-height:/i,
    );
    expect(essayStyles).toMatch(
      /data-protein-motion="full"[^}]*data-protein-motion-state="active"[^}]*\{[^}]*will-change:/i,
    );
  });
});
