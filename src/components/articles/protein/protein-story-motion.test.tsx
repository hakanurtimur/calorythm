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

function Fixture({ children }: { children?: ReactNode }) {
  return (
    <>
      <header data-protein-scene="cover">
        <h1 data-protein-cover-title>Protein sadece kas için değildir</h1>
        <div aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <i data-protein-cover-mask-panel={`panel-${index}`} key={`panel-${index}`} />
          ))}
        </div>
        <div aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <i data-protein-cover-strand={`strand-${index}`} key={`strand-${index}`} />
          ))}
        </div>
      </header>

      <section data-protein-scene="roles">
        <h2>Protein bedende aynı anda beş iş görür</h2>
        <ul>
          {Array.from({ length: 5 }, (_, index) => (
            <li data-protein-role-copy={`role-${index}`} key={`role-${index}`}>
              <i aria-hidden="true" data-protein-role-line={`role-${index}`} />
              <strong>Rol {index + 1}</strong>
              <p>Okunabilir açıklama {index + 1}</p>
            </li>
          ))}
        </ul>
      </section>

      <section data-protein-scene="digestion">
        <h2>Bir lokma aynı biçimde kalmaz</h2>
        <div data-protein-pin="digestion">
          <div data-protein-image-layer="digestion">
            {Array.from({ length: 3 }, (_, index) => (
              <i
                aria-hidden="true"
                data-protein-digestion-fragment={`fragment-${index}`}
                key={`fragment-${index}`}
              />
            ))}
            <i aria-hidden="true" data-protein-digestion-focus />
          </div>
          <ol>
            {Array.from({ length: 3 }, (_, index) => (
              <li data-protein-digestion-state={`state-${index}`} key={`state-${index}`}>
                Sindirim açıklaması {index + 1}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section data-protein-scene="turnover"><h2>Dönüşüm</h2></section>
      <section data-protein-scene="reference"><h2>Referans değerler</h2></section>
      <section data-protein-scene="pattern"><h2>Örüntü</h2></section>
      <section data-protein-scene="resolution"><h2>Sonuç</h2></section>
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
    connection,
    desktopQuery,
    motionQuery,
    removeConnectionListener,
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
      if (!callback || !target) throw new Error("Cover scene was not observed");
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
    endTrigger?: Element;
    invalidateOnRefresh?: boolean;
    once?: boolean;
    pin?: Element;
    pinSpacing?: boolean;
    scrub?: boolean | number;
    start?: string | (() => string);
    trigger?: Element;
  };
};

type AnimationStep = {
  from?: Record<string, unknown>;
  kind: "fromTo" | "set" | "to";
  target: unknown;
  to: Record<string, unknown>;
};

function createRuntime() {
  const animationSteps: AnimationStep[] = [];
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
            animationSteps.push({ from, kind: "fromTo", target, to });
            return timeline;
          },
        ),
        set: vi.fn(
          (target: unknown, vars: Record<string, unknown>) => {
            animationVars.push(vars);
            animationSteps.push({ kind: "set", target, to: vars });
            return timeline;
          },
        ),
        to: vi.fn(
          (target: unknown, vars: Record<string, unknown>) => {
            animationVars.push(vars);
            animationSteps.push({ kind: "to", target, to: vars });
            return timeline;
          },
        ),
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

function elementsFromTarget(target: unknown): Element[] {
  if (target instanceof Element) return [target];
  if (target instanceof NodeList || Array.isArray(target)) {
    return Array.from(target).filter((item): item is Element => item instanceof Element);
  }
  return [];
}

function sceneName(element: Element | undefined) {
  return element
    ?.closest<HTMLElement>("[data-protein-scene]")
    ?.dataset.proteinScene;
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
  it("server-renders all copy behind a pending motion root", () => {
    const markup = renderToString(
      <ProteinStoryMotion>
        <Fixture><p>Makalenin tamamı okunabilir.</p></Fixture>
      </ProteinStoryMotion>,
    );

    expect(markup).toContain('data-protein-motion="pending"');
    expect(markup).toContain("Protein sadece kas için değildir");
    expect(markup).toMatch(/Okunabilir açıklama (?:<!-- -->)?5/);
    expect(markup).toMatch(/Sindirim açıklaması (?:<!-- -->)?3/);
    expect(markup).toContain("Makalenin tamamı okunabilir.");
  });

  it.each([
    [{ reducedMotion: true }, "reduced"],
    [{ saveData: true }, "reduced"],
    [{ width: 1023 }, "static"],
    [{ height: 699 }, "static"],
  ] as const)("keeps copy static and never loads GSAP for %o", async (environment, expected) => {
    installEnvironment(environment);
    const loadRuntime = vi.fn();
    const { container } = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", expected);
    });
    expect(container).toHaveTextContent("Okunabilir açıklama 5");
    expect(container).toHaveTextContent("Sindirim açıklaması 3");
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("defers full runtime loading until the cover approaches", async () => {
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
      container.querySelector('[data-protein-scene="cover"]'),
    );
    expect(observer.rootMargin()).toBe("100% 0px");
    expect(
      addWindowListener.mock.calls.filter(([eventName]) => eventName === "scroll"),
    ).toHaveLength(0);

    act(() => observer.reveal());

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalledTimes(3));
  });

  it("disconnects an armed observer without loading on unmount", async () => {
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
    await waitFor(() => expect(fake.gsap.timeline).toHaveBeenCalledTimes(3));
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

  it("installs exactly the cover, handoff, and digestion timelines", async () => {
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
    await waitFor(() => expect(fake.timelines).toHaveLength(3));

    const [cover, handoff, digestion] = fake.timelines.map(
      ({ config }) => config,
    ) as [TimelineConfig, TimelineConfig, TimelineConfig];
    expect(fake.timelines.map(({ config }) => sceneName(config.scrollTrigger?.trigger))).toEqual([
      "cover",
      "cover",
      "digestion",
    ]);
    expect(cover.scrollTrigger).toMatchObject({
      invalidateOnRefresh: true,
      once: true,
    });
    expect(cover.scrollTrigger?.start).toBeTypeOf("function");
    expect(cover.scrollTrigger?.pin).toBeUndefined();
    expect(cover.scrollTrigger?.scrub).toBeUndefined();

    expect(handoff.scrollTrigger?.end).toBe("top 48%");
    expect(handoff.scrollTrigger?.scrub).toBeTypeOf("number");
    expect(handoff.scrollTrigger?.pin).toBeUndefined();
    expect(sceneName(handoff.scrollTrigger?.endTrigger)).toBe("roles");

    expect(digestion.scrollTrigger?.end).toBe("+=78%");
    expect(digestion.scrollTrigger?.start).toBeTypeOf("function");
    expect(digestion.scrollTrigger?.scrub).toBeTypeOf("number");
    expect(digestion.scrollTrigger?.pin).toHaveAttribute("data-protein-pin", "digestion");
    expect(digestion.scrollTrigger?.trigger).toBe(digestion.scrollTrigger?.pin);
    expect(digestion.scrollTrigger?.pinSpacing).not.toBe(false);
    expect(fake.timelines.filter(({ config }) => config.scrollTrigger?.pin)).toHaveLength(1);
    expect(fake.timelines.filter(({ config }) => (
      config.scrollTrigger?.scrub !== undefined
    ))).toHaveLength(2);
    expect(fake.timelines.map(({ config }) => config.defaults?.ease)).toEqual([
      "power3.out",
      "none",
      "none",
    ]);
  });

  it("targets only approved decorative layers and leaves readable copy untouched", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const fake = createRuntime();
    const { container } = render(
      <ProteinStoryMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </ProteinStoryMotion>,
    );

    await waitFor(() => expect(fake.timelines).toHaveLength(3));
    const animatedElements = new Set(
      fake.animationSteps.flatMap(({ target }) => elementsFromTarget(target)),
    );

    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-cover-mask-panel")
    ))).toHaveLength(5);
    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-cover-strand")
    ))).toHaveLength(5);
    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-role-line")
    ))).toHaveLength(5);
    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-digestion-fragment")
    ))).toHaveLength(3);
    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-cover-title")
    ))).toHaveLength(1);
    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-image-layer")
    ))).toHaveLength(1);
    expect([...animatedElements].filter((element) => (
      element.hasAttribute("data-protein-digestion-focus")
    ))).toHaveLength(1);

    const displayedBeforeTweening = fake.animationSteps
      .filter(({ kind, to }) => kind === "set" && to.display === "block")
      .flatMap(({ target }) => elementsFromTarget(target));
    expect(displayedBeforeTweening.filter((element) => (
      element.hasAttribute("data-protein-cover-mask-panel")
    ))).toHaveLength(5);
    expect(displayedBeforeTweening.filter((element) => (
      element.hasAttribute("data-protein-digestion-fragment")
    ))).toHaveLength(3);

    expect([...animatedElements].some((element) => element.matches(
      "[data-protein-role-copy], [data-protein-digestion-state], p, li, h2, h3, strong",
    ))).toBe(false);
    expect(container).toHaveTextContent("Okunabilir açıklama 5");
    expect(container).toHaveTextContent("Sindirim açıklaması 3");
  });

  it("uses transform-only tween properties without loops or per-frame publishers", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const fake = createRuntime();
    const { container } = render(
      <ProteinStoryMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </ProteinStoryMotion>,
    );

    await waitFor(() => expect(fake.timelines).toHaveLength(3));
    const forbiddenProperties = [
      "autoAlpha",
      "clipPath",
      "height",
      "left",
      "opacity",
      "top",
      "width",
    ];
    const allowedProperties = new Set([
      "duration",
      "scale",
      "scaleX",
      "stagger",
      "transformOrigin",
      "xPercent",
      "yPercent",
    ]);
    const discreteSets = fake.animationSteps
      .filter(({ kind }) => kind === "set")
      .map(({ to }) => to);
    expect(discreteSets).toEqual([
      { display: "block" },
      { display: "block" },
    ]);

    fake.animationSteps
      .filter(({ kind }) => kind !== "set")
      .flatMap(({ from, to }) => from ? [from, to] : [to])
      .forEach((vars) => {
      expect(Object.keys(vars).every((property) => allowedProperties.has(property))).toBe(true);
      forbiddenProperties.forEach((property) => {
        expect(vars).not.toHaveProperty(property);
      });
      expect(vars).not.toMatchObject({ repeat: -1 });
      expect(vars).not.toMatchObject({ yoyo: true });
      });
    fake.timelines.forEach(({ config }) => {
      expect(config.scrollTrigger).not.toHaveProperty("onUpdate");
    });

    container.querySelectorAll<HTMLElement>("[data-protein-scene]").forEach((scene) => {
      expect(scene.style.getPropertyValue("--protein-scene-progress")).toBe("");
      expect(scene).not.toHaveAttribute("data-protein-motion-state");
    });
    container.querySelectorAll<HTMLElement>("[data-protein-role-copy]").forEach((role) => {
      expect(role).not.toHaveAttribute("data-protein-role-active");
    });
  });

  it("cleans the scoped context and constraints on profile change and unmount", async () => {
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
    await waitFor(() => expect(fake.timelines).toHaveLength(3));
    act(() => environment.setSaveData(true));
    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-protein-motion", "reduced");
    });
    expect(fake.context.revert).toHaveBeenCalledOnce();

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

  it("registers a shared runtime plugin once across remounts", async () => {
    installEnvironment();
    Reflect.deleteProperty(window, "IntersectionObserver");
    const fake = createRuntime();
    const loadRuntime = vi.fn().mockResolvedValue(fake.runtime);
    const first = render(
      <ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>,
    );
    await waitFor(() => expect(fake.timelines).toHaveLength(3));
    first.unmount();
    render(<ProteinStoryMotion loadRuntime={loadRuntime}><Fixture /></ProteinStoryMotion>);
    await waitFor(() => expect(fake.timelines).toHaveLength(6));

    expect(fake.gsap.registerPlugin).toHaveBeenCalledOnce();
  });

  it("uses scoped observer-driven motion without raw frame loops or progress publishing", () => {
    const motionSource = readFileSync(
      resolve(process.cwd(), "src/components/articles/protein/protein-story-motion.tsx"),
      "utf8",
    );

    expect(motionSource).not.toMatch(/addEventListener\(\s*["']scroll/i);
    expect(motionSource).not.toMatch(/requestAnimationFrame|cancelAnimationFrame/);
    expect(motionSource).not.toMatch(/killAll|getAll\(\)|ScrollTrigger\.kill/i);
    expect(motionSource).not.toMatch(/onUpdate\s*:/);
    expect(motionSource).not.toMatch(/style\.setProperty/);
    expect(motionSource).not.toMatch(/proteinRoleActive|proteinMotionState/);
  });
});
