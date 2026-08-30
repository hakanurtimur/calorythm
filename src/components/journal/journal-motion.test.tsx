import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildEvidenceRailPath,
  JournalMotion,
  resolveJournalMotionProfile,
  type JournalMotionRuntime,
} from "./journal-motion";

const originalConnection = Object.getOwnPropertyDescriptor(navigator, "connection");
const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

function installEnvironment({
  height = 900,
  reducedMotion = false,
  saveData = false,
  width = 1440,
} = {}) {
  const motionListeners = new Set<EventListenerOrEventListenerObject>();
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

  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => motionQuery),
  });
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: connection,
  });

  return {
    addConnectionListener,
    connection,
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
      window.dispatchEvent(new Event("resize"));
    },
  };
}

type TimelineConfig = {
  defaults?: Record<string, unknown>;
  scrollTrigger?: {
    end?: string;
    pin?: unknown;
    scrub?: number | boolean;
    start?: string;
    trigger?: Element;
  };
};

function createRuntime() {
  const context = { revert: vi.fn() };
  const directTweens: Array<{ target: unknown; vars: Record<string, unknown> }> = [];
  const timelineSteps: Array<{
    from: Record<string, unknown>;
    position?: unknown;
    target: unknown;
    timelineIndex: number;
    to: Record<string, unknown>;
  }> = [];
  const timelines: Array<{ config: TimelineConfig }> = [];
  const gsap = {
    context: vi.fn((callback: () => void) => {
      callback();
      return context;
    }),
    killTweensOf: vi.fn(),
    registerPlugin: vi.fn(),
    timeline: vi.fn((config: TimelineConfig = {}) => {
      const timelineIndex = timelines.length;
      const timeline = {
        fromTo: vi.fn(
          (
            target: unknown,
            from: Record<string, unknown>,
            to: Record<string, unknown>,
            position?: unknown,
          ) => {
            timelineSteps.push({ from, position, target, timelineIndex, to });
            return timeline;
          },
        ),
      };
      timelines.push({ config });
      return timeline;
    }),
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
  };
  const ScrollTrigger = { name: "ScrollTrigger" };

  return {
    context,
    directTweens,
    gsap,
    runtime: { gsap, ScrollTrigger } as unknown as JournalMotionRuntime,
    ScrollTrigger,
    timelineSteps,
    timelines,
  };
}

function Fixture({ children }: { children?: ReactNode }) {
  const railXs = [72, 96, 120, 144] as const;

  return (
    <>
      <header data-journal-cover-copy>
        <h1>Beslenme biliminin yaşayan arşivi.</h1>
      </header>
      <figure data-journal-cover-image />
      <svg data-evidence-rail viewBox="0 0 320 800">
        {(["claim", "source", "context", "editorial"] as const).map((id, index) => (
          <path
            d={buildEvidenceRailPath({
              baseX: railXs[index]!,
              height: 800,
              targetY: 800,
              tipX: railXs[index]!,
            })}
            data-evidence-line={id}
            data-evidence-line-index={index}
            key={id}
          />
        ))}
      </svg>
      {(["00", "01"] as const).map((index) => (
        <article data-journal-entry data-journal-index={index} key={index}>
          <button type="button">Dosya {index}</button>
          <div data-journal-entry-visual />
        </article>
      ))}
      <button data-outside-focus type="button">Dışarı</button>
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
  if (originalConnection) Object.defineProperty(navigator, "connection", originalConnection);
  else Reflect.deleteProperty(navigator, "connection");
});

describe("resolveJournalMotionProfile", () => {
  it.each([
    [{ width: 900, height: 650, reducedMotion: false, saveData: false }, "full"],
    [{ width: 1440, height: 900, reducedMotion: false, saveData: false }, "full"],
    [{ width: 899, height: 900, reducedMotion: false, saveData: false }, "static"],
    [{ width: 1440, height: 649, reducedMotion: false, saveData: false }, "static"],
    [{ width: 390, height: 844, reducedMotion: false, saveData: false }, "static"],
    [{ width: 1440, height: 900, reducedMotion: true, saveData: false }, "reduced"],
    [{ width: 1440, height: 900, reducedMotion: false, saveData: true }, "reduced"],
  ] as const)("maps %o to %s", (input, expected) => {
    expect(resolveJournalMotionProfile(input)).toBe(expected);
  });
});

describe("buildEvidenceRailPath", () => {
  it("draws a full-height symmetric four-cubic pinch around its active tip", () => {
    const path = buildEvidenceRailPath({
      baseX: 80,
      height: 800,
      targetY: 420,
      tipX: 230,
    });

    expect(path).toMatch(/^M 80 0 C /);
    expect(path.match(/\bC\b/g)).toHaveLength(4);
    expect(path).toContain("C 80 394 213 412 230 420 C 213 428 80 446 80 473");
    expect(path).toMatch(/80 800$/);
    expect(path).not.toContain(" L ");
    expect(path).not.toContain("NaN");
  });

  it("keeps an inactive authored rail as four full-height cubics", () => {
    const path = buildEvidenceRailPath({
      baseX: 96,
      height: 800,
      targetY: 800,
      tipX: 96,
    });

    expect(path).toMatch(/^M 96 0 C /);
    expect(path.match(/\bC\b/g)).toHaveLength(4);
    expect(path).toMatch(/96 800$/);
    expect(path).not.toContain(" L ");
  });
});

describe("JournalMotion", () => {
  it("server-renders semantic children behind a pending journal motion root", () => {
    const markup = renderToString(
      <JournalMotion>
        <h1>Journal</h1>
        <p>Beslenme bilimi, bağlamıyla birlikte.</p>
      </JournalMotion>,
    );

    expect(markup).toContain("data-journal-motion-root");
    expect(markup).toContain('data-motion-profile="pending"');
    expect(markup).toContain("Beslenme bilimi, bağlamıyla birlikte.");
  });

  it.each([
    [{ width: 899 }, "static"],
    [{ height: 649 }, "static"],
    [{ reducedMotion: true }, "reduced"],
    [{ saveData: true }, "reduced"],
  ] as const)("never imports GSAP and leaves composed content visible for %o", async (environment, expected) => {
    installEnvironment(environment);
    const loadRuntime = vi.fn();
    const { container } = render(
      <JournalMotion loadRuntime={loadRuntime}><Fixture /></JournalMotion>,
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-motion-profile", expected);
    });
    expect(loadRuntime).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLElement>("[data-journal-cover-copy]")?.style.opacity).toBe("");
    expect(container.querySelector<HTMLElement>("[data-journal-entry-visual]")?.style.clipPath).toBe("");
  });

  it("publishes pointer and keyboard entry state even in the CSS fallback", async () => {
    installEnvironment({ width: 667 });
    const { container } = render(
      <JournalMotion loadRuntime={vi.fn()}><Fixture /></JournalMotion>,
    );
    const root = container.firstElementChild as HTMLElement;
    const entries = Array.from(container.querySelectorAll<HTMLElement>("[data-journal-entry]"));
    const firstButton = entries[0]!.querySelector("button")!;
    const outside = container.querySelector<HTMLElement>("[data-outside-focus]")!;

    await waitFor(() => expect(root).toHaveAttribute("data-motion-profile", "static"));
    fireEvent.pointerEnter(entries[1]!);
    expect(root).toHaveAttribute("data-active-journal-entry", "01");
    fireEvent.pointerLeave(entries[1]!);
    expect(root).not.toHaveAttribute("data-active-journal-entry");

    fireEvent.focusIn(firstButton);
    expect(root).toHaveAttribute("data-active-journal-entry", "00");
    fireEvent.focusOut(firstButton, { relatedTarget: outside });
    expect(root).not.toHaveAttribute("data-active-journal-entry");
  });

  it("creates a scoped cover entrance, scrubbed evidence rail, and one unpinned timeline per entry", async () => {
    installEnvironment();
    const fake = createRuntime();
    const { container } = render(
      <JournalMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </JournalMotion>,
    );

    await waitFor(() => expect(fake.timelines).toHaveLength(4));
    const root = container.firstElementChild as HTMLElement;
    const entries = Array.from(container.querySelectorAll<HTMLElement>("[data-journal-entry]"));
    const rail = container.querySelector<SVGElement>("[data-evidence-rail]")!;

    expect(root).toHaveAttribute("data-motion-profile", "full");
    expect(fake.gsap.registerPlugin).toHaveBeenCalledWith(fake.ScrollTrigger);
    expect(fake.gsap.context).toHaveBeenCalledWith(expect.any(Function), root);
    expect(fake.timelines[0]?.config.scrollTrigger).toBeUndefined();
    expect(fake.timelines[1]?.config.scrollTrigger).toMatchObject({
      trigger: rail,
      scrub: expect.any(Number),
    });
    expect(fake.timelines[1]?.config.scrollTrigger?.pin).toBeUndefined();
    expect(fake.timelines.slice(2).map(({ config }) => config.scrollTrigger?.trigger)).toEqual(entries);
    expect(fake.timelines.slice(2).every(({ config }) => config.scrollTrigger?.pin === undefined)).toBe(true);

    const coverTargets = fake.timelineSteps
      .filter(({ timelineIndex }) => timelineIndex === 0)
      .map(({ target }) => target);
    expect(coverTargets).toEqual([
      container.querySelector("[data-journal-cover-copy]"),
      container.querySelector("[data-journal-cover-image]"),
    ]);
    const railStep = fake.timelineSteps.find(({ target }) => target === rail);
    expect(railStep).toMatchObject({
      from: { scaleY: 0, transformOrigin: "top center" },
      to: expect.objectContaining({ scaleY: 1 }),
    });
    entries.forEach((entry) => {
      const entryStep = fake.timelineSteps.find(({ target }) => target === entry);
      const visual = entry.querySelector("[data-journal-entry-visual]");
      const visualStep = fake.timelineSteps.find(({ target }) => target === visual);
      expect(entryStep).toMatchObject({
        from: expect.objectContaining({ opacity: 0, y: expect.any(Number) }),
        to: expect.objectContaining({ opacity: 1, y: 0 }),
      });
      expect(visualStep).toMatchObject({
        from: expect.objectContaining({ clipPath: expect.stringContaining("100%") }),
        to: expect.objectContaining({ clipPath: "inset(0% 0% 0% 0%)" }),
      });
    });
  });

  it("bends the four rail paths with one overwrite tween per active-state change and restores them", async () => {
    installEnvironment();
    const fake = createRuntime();
    const { container } = render(
      <JournalMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </JournalMotion>,
    );

    await waitFor(() => expect(fake.timelines).toHaveLength(4));
    const root = container.firstElementChild as HTMLElement;
    const rail = container.querySelector<SVGSVGElement>("[data-evidence-rail]")!;
    const paths = Array.from(container.querySelectorAll<SVGPathElement>("[data-evidence-line]"));
    const entries = Array.from(container.querySelectorAll<HTMLElement>("[data-journal-entry]"));
    const firstButton = entries[0]!.querySelector<HTMLButtonElement>("button")!;
    const outside = container.querySelector<HTMLElement>("[data-outside-focus]")!;
    const initialPaths = paths.map((path) => path.getAttribute("d"));

    vi.spyOn(rail, "getBoundingClientRect").mockReturnValue({
      height: 800,
      top: 100,
      width: 160,
    } as DOMRect);
    entries.forEach((entry, index) => {
      vi.spyOn(entry, "getBoundingClientRect").mockReturnValue({
        height: 160,
        top: 180 + index * 260,
      } as DOMRect);
    });

    fireEvent.pointerEnter(entries[1]!);
    expect(root).toHaveAttribute("data-active-journal-entry", "01");
    expect(fake.directTweens).toHaveLength(1);
    expect(fake.directTweens[0]?.vars).toMatchObject({
      attr: { d: expect.any(Function) },
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
    expect(paths.every((path, index) => path.getAttribute("d") !== initialPaths[index])).toBe(true);
    expect(paths.every((path) => path.getAttribute("d")?.includes(" C "))).toBe(true);
    expect(new Set(paths.map((path) => path.getAttribute("d"))).size).toBe(4);
    expect(paths[0]?.getAttribute("d")).toContain(
      "C 72 395 153 414 176 420 C 153 426 72 445 72 470",
    );

    fireEvent.pointerLeave(entries[1]!);
    expect(root).not.toHaveAttribute("data-active-journal-entry");
    expect(fake.directTweens).toHaveLength(2);
    expect(fake.directTweens[1]?.vars).toMatchObject({
      duration: 0.42,
      ease: "power2.inOut",
      overwrite: "auto",
    });
    expect(paths.map((path) => path.getAttribute("d"))).toEqual(initialPaths);

    fireEvent.focusIn(firstButton);
    expect(root).toHaveAttribute("data-active-journal-entry", "00");
    expect(fake.directTweens).toHaveLength(3);
    fireEvent.focusOut(firstButton, { relatedTarget: outside });
    expect(root).not.toHaveAttribute("data-active-journal-entry");
    expect(fake.directTweens).toHaveLength(4);
  });

  it("reverts its context, kills interaction tweens, and removes every constraint", async () => {
    const environment = installEnvironment();
    const fake = createRuntime();
    const removeWindowListener = vi.spyOn(window, "removeEventListener");
    const { container, unmount } = render(
      <JournalMotion loadRuntime={vi.fn().mockResolvedValue(fake.runtime)}>
        <Fixture />
      </JournalMotion>,
    );

    await waitFor(() => expect(fake.timelines).toHaveLength(4));
    const entries = Array.from(container.querySelectorAll<HTMLElement>("[data-journal-entry]"));
    const paths = Array.from(container.querySelectorAll<SVGPathElement>("[data-evidence-line]"));
    const removeEntryListener = vi.spyOn(entries[0]!, "removeEventListener");

    act(() => environment.setSaveData(true));
    await waitFor(() => {
      expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced");
    });
    expect(fake.context.revert).toHaveBeenCalledOnce();
    expect(fake.gsap.killTweensOf).toHaveBeenCalledOnce();
    const killedPaths = fake.gsap.killTweensOf.mock.calls[0]?.[0] as SVGPathElement[];
    expect(killedPaths).toHaveLength(paths.length);
    expect(killedPaths.every((path, index) => path === paths[index])).toBe(true);

    unmount();
    expect(removeEntryListener).toHaveBeenCalledWith("pointerenter", expect.any(Function));
    expect(removeEntryListener).toHaveBeenCalledWith("pointerleave", expect.any(Function));
    expect(removeEntryListener).toHaveBeenCalledWith("focusin", expect.any(Function));
    expect(removeEntryListener).toHaveBeenCalledWith("focusout", expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(environment.motionQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    expect(environment.removeConnectionListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
