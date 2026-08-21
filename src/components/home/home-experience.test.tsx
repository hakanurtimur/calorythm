import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  getOrbitalThreadSnapshot,
  resetOrbitalThreadState,
} from "@/components/orbital/orbital-thread-store";
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

  it("uses the four-thread orbital treatment for the primary hero action", () => {
    const { container } = render(<HomeExperience />);

    const heroAction = container
      .querySelector('[data-motion="hero-copy"]')
      ?.querySelector<HTMLAnchorElement>('a[href="#section-01"]');
    expect(heroAction).not.toBeNull();
    expect(heroAction).toHaveAttribute("data-variant", "orbit");
    expect(heroAction?.querySelectorAll("[data-link-orbit-path]")).toHaveLength(4);
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
});
