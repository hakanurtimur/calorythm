import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  getOrbitalThreadSnapshot,
  resetOrbitalThreadState,
  resolveOrbitalMode,
} from "@/components/orbital/orbital-thread-store";
import { orbitalPaths } from "@/components/orbital/orbital-paths";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeExperience } from "./home-experience";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resetOrbitalThreadState();
});

describe("HomeExperience", () => {
  it("presents one page title followed by the seven-part editorial narrative", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "Bilgiyi okumak kolaydır. Anlamak zordur.",
      "Her konu, kendi hikâyesini anlatır.",
      "Karmaşık olanı, anlaşılır hâle getiriyoruz.",
      "Bir makale okumuyorsun. Bir düşüncenin içine giriyorsun.",
      "Protein Sadece Kas İçin Değildir",
      "Keşfetmeye devam et.",
      "Merak iyi bir başlangıçtır.",
    ]);
    expect(container.querySelectorAll("[data-scene]")).toHaveLength(8);
  });

  it("keeps the complete reading experience available without a graphics runtime", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getByText("Beslenme bilimini ezberlerle değil, anlayarak keşfet.")).toBeInTheDocument();
    expect(container.querySelector("[data-motion-profile]")).toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("uses authored editorial structures instead of a repeated card grid", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getByRole("list", { name: "Makro besin rotaları" }).children).toHaveLength(3);
    expect(screen.getByRole("list", { name: "Beslenme konuları" }).children).toHaveLength(5);
    expect(screen.getByRole("list", { name: "Journal konuları" }).children).toHaveLength(8);
    expect(container.querySelectorAll('[data-motion="journal-topic"]')).toHaveLength(8);
    expect(container.querySelectorAll("[data-orbit-mark]")).toHaveLength(5);
    expect(screen.getByText("Hikâyeyi keşfet").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("keeps every available action valid and exposes only one unavailable destination", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getAllByRole("link").every((link) => Boolean(link.getAttribute("href")))).toBe(true);
    expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(1);
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("uses the official wordmark at each primary brand anchor", () => {
    const { container } = render(<HomeExperience />);

    expect(container.querySelectorAll('[data-brand-wordmark="primary"]')).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: "CALORYTHM ana sayfa" })).toHaveLength(2);
  });

  it("uses the persistent stage as the primary hero action's only orbital treatment", () => {
    const { container } = render(<HomeExperience />);

    const heroAction = container
      .querySelector('[data-motion="hero-copy"]')
      ?.querySelector<HTMLAnchorElement>('a[href="#section-01"]');
    expect(heroAction).not.toBeNull();
    expect(heroAction).toHaveAttribute("data-variant", "orbit");
    expect(heroAction).toHaveAttribute("data-orbital-anchor", "hero-cta");
    expect(heroAction?.querySelector("svg")).toBeNull();
    expect(heroAction?.querySelector("[data-link-orbit-path]")).toBeNull();
  });

  it("keeps one four-path stage without a handoff clone", () => {
    const { container } = render(<HomeExperience />);
    const stage = document.querySelector("[data-orbital-thread-stage]");

    expect(container.querySelectorAll("[data-splash-handoff-target]")).toHaveLength(1);
    expect(stage).not.toBeNull();
    expect(stage?.querySelectorAll("[data-orbit-path]")).toHaveLength(4);
    expect(document.querySelectorAll("[data-orbital-thread-stage]")).toHaveLength(1);
    expect(document.querySelector("[data-splash-handoff-ring]")).not.toBeInTheDocument();
  });

  it("moves the persistent SVG itself without scaling its rendered strokes", () => {
    vi.useFakeTimers();
    const { container } = render(<HomeExperience />);
    const ring = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]");
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]");

    expect(ring).not.toBeNull();
    expect(target).not.toBeNull();
    ring!.getBoundingClientRect = () =>
      ({ bottom: 380, height: 80, left: 400, right: 480, top: 300, width: 80, x: 400, y: 300, toJSON: () => ({}) }) as DOMRect;
    target!.getBoundingClientRect = () =>
      ({ bottom: 700, height: 600, left: 900, right: 1300, top: 100, width: 400, x: 900, y: 100, toJSON: () => ({}) }) as DOMRect;

    act(() => vi.advanceTimersByTime(1780));

    expect(ring).toHaveAttribute("data-phase", "handoff");
    expect(ring?.style.getPropertyValue("--handoff-target-left")).toBe("900px");
    expect(ring?.style.getPropertyValue("--handoff-target-top")).toBe("200px");
    expect(ring?.style.getPropertyValue("--handoff-target-size")).toBe("400px");
    expect(ring?.style.getPropertyValue("--handoff-scale")).toBe("");
  });

  it("settles a positive-duration manual dismissal into the unchanged hero square", () => {
    const { container } = render(<HomeExperience />);
    const ring = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]");
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]");

    expect(ring).not.toBeNull();
    expect(target).not.toBeNull();
    target!.getBoundingClientRect = () =>
      ({ bottom: 700, height: 600, left: 900, right: 1300, top: 100, width: 400, x: 900, y: 100, toJSON: () => ({}) }) as DOMRect;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    expect(ring).toHaveAttribute("data-phase", "hero");
    expect(ring?.style.left).toBe("900px");
    expect(ring?.style.top).toBe("200px");
    expect(ring?.style.width).toBe("400px");
    expect(ring?.style.height).toBe("400px");
  });

  it("settles a positive-duration automatic dismissal into hero", () => {
    vi.useFakeTimers();
    render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]");

    expect(stage).toHaveAttribute("data-phase", "intro");
    expect(getOrbitalThreadSnapshot().base).toEqual({ kind: "intro" });

    act(() => vi.advanceTimersByTime(2399));
    expect(screen.getByTestId("home-splash")).toBeInTheDocument();
    expect(getOrbitalThreadSnapshot().base).toEqual({ kind: "intro" });

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
    expect(stage).toHaveAttribute("data-phase", "hero");
    expect(getOrbitalThreadSnapshot().base).toEqual({ kind: "hero" });
  });

  it("resynchronizes the persistent stage when the hero target resizes", () => {
    const animationFrames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]");
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]");
    let targetRect = {
      bottom: 700,
      height: 600,
      left: 900,
      right: 1300,
      top: 100,
      width: 400,
      x: 900,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect;

    expect(stage).not.toBeNull();
    expect(target).not.toBeNull();
    target!.getBoundingClientRect = () => targetRect;
    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    targetRect = {
      bottom: 380,
      height: 300,
      left: 100,
      right: 600,
      top: 80,
      width: 500,
      x: 100,
      y: 80,
      toJSON: () => ({}),
    } as DOMRect;
    fireEvent.resize(window);
    act(() => animationFrames.shift()?.(0));

    expect(stage?.style.left).toBe("200px");
    expect(stage?.style.top).toBe("80px");
    expect(stage?.style.width).toBe("300px");
    expect(stage?.style.height).toBe("300px");
  });

  it("publishes the hero base state when the splash settles", () => {
    render(<HomeExperience />);

    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    expect(getOrbitalThreadSnapshot().base).toEqual({ kind: "hero" });
  });

  it("keeps the exact same SVG node when ownership settles into hero", () => {
    const { container } = render(<HomeExperience />);
    const ringBefore = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]");

    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    const ringAfter = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]");
    expect(ringAfter === ringBefore).toBe(true);
    expect(container.querySelector("[data-splash-handoff-target] svg")).not.toBeInTheDocument();
  });

  it("morphs path geometry toward the pointer without translating the ring", () => {
    const animationFrames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    const { container } = render(<HomeExperience />);
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]");
    const motionGroup = document.querySelector<SVGGElement>("[data-orbital-thread-motion]");
    const firstPath = document.querySelector<SVGPathElement>("[data-orbital-thread-stage] path");

    expect(target).not.toBeNull();
    expect(motionGroup).not.toBeNull();
    expect(firstPath).not.toBeNull();
    target!.getBoundingClientRect = () =>
      ({ bottom: 700, height: 600, left: 900, right: 1300, top: 100, width: 400, x: 900, y: 100, toJSON: () => ({}) }) as DOMRect;
    const basePath = firstPath!.getAttribute("d");

    const pointerMove = new Event("pointermove");
    Object.defineProperties(pointerMove, {
      clientX: { value: 1300 },
      clientY: { value: 700 },
    });

    window.dispatchEvent(pointerMove);
    expect(animationFrames).toHaveLength(0);

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    expect(animationFrames).toHaveLength(1);
    window.dispatchEvent(pointerMove);

    act(() => {
      [0, 120, 240, 360].forEach((timestamp) => animationFrames.shift()?.(timestamp));
    });

    expect(firstPath?.getAttribute("d")).not.toBe(basePath);
    expect(getOrbitalThreadSnapshot().pointer.strength).toBe(1);
    expect(getOrbitalThreadSnapshot().pointer.x).toBeCloseTo(Math.SQRT1_2);
    expect(getOrbitalThreadSnapshot().pointer.y).toBeCloseTo(Math.SQRT1_2);
    expect(motionGroup?.style.getPropertyValue("--ring-pointer-x")).toBe("");
    expect(motionGroup?.style.getPropertyValue("--ring-pointer-y")).toBe("");
    expect(getComputedStyle(motionGroup!).transform).toBe("none");
  });

  it("morphs the same persistent paths into the CTA and returns them", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const { container } = render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]")!;
    const cta = container.querySelector<HTMLElement>(
      '[data-motion="hero-copy"] a[href="#section-01"]',
    )!;
    const firstPath = stage.querySelector<SVGPathElement>("[data-orbit-path]")!;
    const heroPath = firstPath.getAttribute("d");

    stage.getBoundingClientRect = () =>
      ({ left: 288, top: 18, width: 864, height: 864, right: 1152, bottom: 882, x: 288, y: 18, toJSON: () => ({}) }) as DOMRect;
    cta.getBoundingClientRect = () =>
      ({ left: 640, top: 650, width: 160, height: 52, right: 800, bottom: 702, x: 640, y: 650, toJSON: () => ({}) }) as DOMRect;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    fireEvent.pointerEnter(cta);
    act(() => frames.shift()?.(0));
    expect(Number(cta.style.getPropertyValue("--orbital-fill-progress"))).toBe(0);

    act(() => [120, 240, 480, 720].forEach((time) => frames.shift()?.(time)));
    expect(firstPath.getAttribute("d")).not.toBe(heroPath);
    expect(Number(cta.style.getPropertyValue("--orbital-fill-progress"))).toBeGreaterThan(0.45);
    expect(cta.querySelector("svg")).toBeNull();

    act(() =>
      [780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320].forEach((time) =>
        frames.shift()?.(time),
      ),
    );
    const contractedPath = firstPath.getAttribute("d");
    const contractedPaths = Array.from(
      stage.querySelectorAll<SVGPathElement>("[data-orbit-path]"),
      (path) => path.getAttribute("d"),
    );
    expect(Number(cta.style.getPropertyValue("--orbital-fill-progress"))).toBe(1);
    expect(firstPath.getAttribute("stroke-dasharray")).toBe("1 0");
    expect(new Set(contractedPaths)).toHaveProperty("size", 4);

    fireEvent.pointerLeave(cta);
    act(() => [1380, 1440, 1500, 1560].forEach((time) => frames.shift()?.(time)));
    expect(firstPath.getAttribute("d")).not.toBe(contractedPath);
    expect(Number(cta.style.getPropertyValue("--orbital-fill-progress"))).toBeLessThan(0.1);
  });

  it("paints CTA threads above the gradient only while the morph is away from idle", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const { container } = render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]")!;
    const heroCopy = container.querySelector<HTMLElement>('[data-motion="hero-copy"]')!;
    const header = container.querySelector<HTMLElement>("header")!;
    const cta = heroCopy.querySelector<HTMLElement>('[data-orbital-anchor="hero-cta"]')!;

    stage.getBoundingClientRect = () =>
      ({ left: 288, top: 18, width: 864, height: 864, right: 1152, bottom: 882, x: 288, y: 18, toJSON: () => ({}) }) as DOMRect;
    cta.getBoundingClientRect = () =>
      ({ left: 640, top: 650, width: 160, height: 52, right: 800, bottom: 702, x: 640, y: 650, toJSON: () => ({}) }) as DOMRect;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    expect(stage).toHaveAttribute("data-cta-layer", "idle");
    expect(stage.style.zIndex).toBe("");

    fireEvent.pointerEnter(cta);
    act(() => frames.shift()?.(0));

    const foregroundZIndex = Number(stage.style.zIndex);
    expect(stage).toHaveAttribute("data-cta-layer", "foreground");
    expect(foregroundZIndex).toBeGreaterThan(3);
    expect(foregroundZIndex).toBeLessThan(5);
    expect(heroCopy).toContainElement(cta);
    expect(header).not.toContainElement(stage);

    fireEvent.pointerLeave(cta);
    act(() =>
      [60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].forEach((time) =>
        frames.shift()?.(time),
      ),
    );

    expect(stage).toHaveAttribute("data-cta-layer", "idle");
    expect(stage.style.zIndex).toBe("");
  });

  it("uses the same CTA state for keyboard focus", () => {
    const { container } = render(<HomeExperience />);
    const cta = container.querySelector<HTMLElement>(
      '[data-motion="hero-copy"] a[href="#section-01"]',
    )!;

    fireEvent.focus(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "cta",
      anchorId: "hero-cta",
    });
    fireEvent.blur(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).not.toBe("cta");
  });

  it("keeps CTA state active until both pointer and focus have left", () => {
    const { container } = render(<HomeExperience />);
    const cta = container.querySelector<HTMLElement>(
      '[data-motion="hero-copy"] a[href="#section-01"]',
    )!;

    fireEvent.pointerEnter(cta);
    fireEvent.focus(cta);
    fireEvent.pointerLeave(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "cta",
      anchorId: "hero-cta",
    });

    fireEvent.blur(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).not.toBe("cta");
  });

  it("keeps pointer motion disabled when reduced motion is preferred", () => {
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );
    render(<HomeExperience />);

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    fireEvent.pointerMove(window, { clientX: 1200, clientY: 600 });

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("keeps CTA geometry static with immediate focus state when reduced motion is preferred", () => {
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(<HomeExperience />);
    const cta = container.querySelector<HTMLElement>('[data-orbital-anchor="hero-cta"]')!;
    const firstPath = document.querySelector<SVGPathElement>(
      "[data-orbital-thread-stage] [data-orbit-path]",
    )!;
    const authoredPath = firstPath.getAttribute("d");

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    fireEvent.focus(cta);

    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "cta",
      anchorId: "hero-cta",
    });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(firstPath).toHaveAttribute("d", authoredPath!);
    expect(firstPath).not.toHaveAttribute("stroke-dasharray");
    expect(cta.style.getPropertyValue("--orbital-fill-progress")).toBe("0");
  });

  it("keeps coarse pointer hover from registering deformation or CTA geometry", () => {
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query === "(pointer: coarse)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(<HomeExperience />);
    const cta = container.querySelector<HTMLElement>('[data-orbital-anchor="hero-cta"]')!;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    fireEvent.pointerMove(window, { clientX: 1200, clientY: 600 });
    fireEvent.pointerEnter(cta);

    expect(getOrbitalThreadSnapshot().pointer.strength).toBe(0);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).not.toBe("cta");
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    fireEvent.focus(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "cta",
      anchorId: "hero-cta",
    });
  });

  it("pauses geometry writes while hidden and resumes from the cached state once visible", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query === "(pointer: fine)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
      frames.delete(frame);
    });
    const runPendingFrame = (timestamp: number) => {
      const pending = frames.entries().next().value as [number, FrameRequestCallback] | undefined;
      if (!pending) return;
      frames.delete(pending[0]);
      pending[1](timestamp);
    };
    const { container } = render(<HomeExperience />);
    const firstPath = document.querySelector<SVGPathElement>(
      "[data-orbital-thread-stage] [data-orbit-path]",
    )!;
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]")!;
    target.getBoundingClientRect = () =>
      ({ bottom: 700, height: 600, left: 900, right: 1300, top: 100, width: 400, x: 900, y: 100, toJSON: () => ({}) }) as DOMRect;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    expect(frames.size).toBe(1);
    act(() => runPendingFrame(0));
    expect(firstPath).toHaveAttribute("stroke-dasharray");

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(cancelAnimationFrame).toHaveBeenCalledWith(2);
    expect(frames.size).toBe(0);
    const pathBeforeHiddenFrame = firstPath.getAttribute("d");

    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
    expect(frames.size).toBe(1);
    act(() => runPendingFrame(240));
    expect(firstPath).not.toHaveAttribute("d", pathBeforeHiddenFrame!);
    expect(firstPath).toHaveAttribute("stroke-dasharray");
  });

  it("restores authored paths and CTA interaction state when the stage unmounts", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const { container, unmount } = render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]")!;
    const cta = container.querySelector<HTMLElement>('[data-orbital-anchor="hero-cta"]')!;
    const firstPath = stage.querySelector<SVGPathElement>("[data-orbit-path]")!;

    stage.getBoundingClientRect = () =>
      ({ left: 288, top: 18, width: 864, height: 864, right: 1152, bottom: 882, x: 288, y: 18, toJSON: () => ({}) }) as DOMRect;
    cta.getBoundingClientRect = () =>
      ({ left: 640, top: 650, width: 160, height: 52, right: 800, bottom: 702, x: 640, y: 650, toJSON: () => ({}) }) as DOMRect;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    fireEvent.pointerEnter(cta);
    act(() => [0, 120, 240, 480, 720].forEach((time) => frames.shift()?.(time)));
    expect(firstPath).toHaveAttribute("stroke-dasharray");
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).toBe("cta");

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(stage).toHaveAttribute("data-cta-layer", "idle");
    expect(stage.style.zIndex).toBe("");
    expect(firstPath).toHaveAttribute("d", orbitalPaths[0].d);
    expect(firstPath).not.toHaveAttribute("stroke-dasharray");
    expect(firstPath).not.toHaveAttribute("stroke-dashoffset");
    expect(cta.style.getPropertyValue("--orbital-fill-progress")).toBe("");
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).not.toBe("cta");

    fireEvent.focus(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).not.toBe("cta");
  });

  it("returns an active stage to static hero geometry when reduced motion changes at runtime", () => {
    const frames = new Map<number, FrameRequestCallback>();
    const reducedMotionListeners = new Set<(event: MediaQueryListEvent) => void>();
    let nextFrame = 0;
    let reducedMotion = false;
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => {
        if (query === "(prefers-reduced-motion: reduce)") {
          return {
            addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
              reducedMotionListeners.add(listener),
            get matches() {
              return reducedMotion;
            },
            media: query,
            removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
              reducedMotionListeners.delete(listener),
          };
        }

        return {
          addEventListener: vi.fn(),
          matches: query === "(pointer: fine)",
          media: query,
          removeEventListener: vi.fn(),
        };
      }),
    );
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
      frames.delete(frame);
    });
    const runPendingFrame = (timestamp: number) => {
      const pending = frames.entries().next().value as [number, FrameRequestCallback] | undefined;
      if (!pending) return;
      frames.delete(pending[0]);
      pending[1](timestamp);
    };
    const { container } = render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]")!;
    const cta = container.querySelector<HTMLElement>('[data-orbital-anchor="hero-cta"]')!;
    const firstPath = stage.querySelector<SVGPathElement>("[data-orbit-path]")!;
    const authoredPath = firstPath.getAttribute("d");
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]")!;
    target.getBoundingClientRect = () =>
      ({ bottom: 700, height: 600, left: 900, right: 1300, top: 100, width: 400, x: 900, y: 100, toJSON: () => ({}) }) as DOMRect;

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    fireEvent.pointerMove(window, { clientX: 1200, clientY: 600, pointerType: "mouse" });
    act(() => runPendingFrame(0));
    expect(firstPath).toHaveAttribute("stroke-dasharray");
    expect(frames.size).toBe(1);

    reducedMotion = true;
    reducedMotionListeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));

    expect(cancelAnimationFrame).toHaveBeenCalledWith(2);
    expect(frames.size).toBe(0);
    expect(firstPath).toHaveAttribute("d", authoredPath!);
    expect(firstPath).not.toHaveAttribute("stroke-dasharray");
    expect(firstPath).not.toHaveAttribute("stroke-dashoffset");
    expect(stage).toHaveAttribute("data-cta-layer", "idle");
    expect(stage.style.zIndex).toBe("");
    expect(cta.style.getPropertyValue("--orbital-fill-progress")).toBe("0");

    fireEvent.focus(cta);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);

    reducedMotion = false;
    reducedMotionListeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));
    reducedMotionListeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
    expect(frames.size).toBe(1);
    act(() => runPendingFrame(240));
    expect(firstPath).toHaveAttribute("stroke-dasharray");
  });

  it("ignores touch input on a fine-capable device while keyboard focus still activates CTA geometry", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query === "(pointer: fine)",
        media: query,
        removeEventListener: vi.fn(),
      })),
    );
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const { container } = render(<HomeExperience />);
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]")!;
    const cta = container.querySelector<HTMLElement>('[data-orbital-anchor="hero-cta"]')!;
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]")!;
    target.getBoundingClientRect = () =>
      ({ bottom: 700, height: 600, left: 900, right: 1300, top: 100, width: 400, x: 900, y: 100, toJSON: () => ({}) }) as DOMRect;
    stage.getBoundingClientRect = () =>
      ({ left: 288, top: 18, width: 864, height: 864, right: 1152, bottom: 882, x: 288, y: 18, toJSON: () => ({}) }) as DOMRect;
    cta.getBoundingClientRect = () =>
      ({ left: 640, top: 650, width: 160, height: 52, right: 800, bottom: 702, x: 640, y: 650, toJSON: () => ({}) }) as DOMRect;
    const touchPointerEvent = (type: string) => {
      const event = new Event(type, { bubbles: true }) as PointerEvent;
      Object.defineProperty(event, "pointerType", { value: "touch" });
      return event;
    };

    fireEvent.pointerDown(screen.getByTestId("home-splash"));
    window.dispatchEvent(touchPointerEvent("pointermove"));
    cta.dispatchEvent(touchPointerEvent("pointerenter"));
    cta.dispatchEvent(touchPointerEvent("pointerdown"));
    fireEvent.focus(cta);

    expect(getOrbitalThreadSnapshot().pointer.strength).toBe(0);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot()).kind).not.toBe("cta");
    expect(cta.style.getPropertyValue("--orbital-fill-progress")).toBe("0");

    fireEvent.blur(cta);
    fireEvent.focus(cta);
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "cta",
      anchorId: "hero-cta",
    });
    act(() => frames.shift()?.(0));
    expect(stage).toHaveAttribute("data-cta-layer", "foreground");
  });
});
