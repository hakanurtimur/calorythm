import { act, cleanup, render } from "@testing-library/react";
import {
  resetOrbitalThreadState,
  setOrbitalBaseState,
} from "@/components/orbital/orbital-thread-store";
import { orbitalPaths } from "@/components/orbital/orbital-paths";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrbitalThreadStage } from "./orbital-thread-stage";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resetOrbitalThreadState();
});

describe("OrbitalThreadStage Scene 01", () => {
  it("uses the one persistent stage as a full-viewport editorial signal", () => {
    vi.useFakeTimers();
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query === "(pointer: fine)",
        media: query,
        removeEventListener: vi.fn(),
      })),
    );
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });

    const { container } = render(
      <>
        <div data-splash-handoff-target="" />
        <OrbitalThreadStage durationOverride={0} />
      </>,
    );
    const target = container.querySelector<HTMLElement>("[data-splash-handoff-target]")!;
    target.getBoundingClientRect = () =>
      ({
        bottom: 700,
        height: 600,
        left: 900,
        right: 1300,
        top: 100,
        width: 400,
        x: 900,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect;

    act(() => vi.advanceTimersByTime(0));
    const stage = document.querySelector<SVGSVGElement>("[data-orbital-thread-stage]")!;
    const firstPath = stage.querySelector<SVGPathElement>("[data-orbit-path]")!;

    act(() => {
      setOrbitalBaseState({ id: "01", kind: "scene", progress: 0.72 });
      window.dispatchEvent(new Event("scroll"));
    });
    act(() => {
      Array.from({ length: 4 }, (_, index) => frames.shift()?.(1000 + index * 16));
    });

    expect(stage).toHaveAttribute("data-orbital-layout", "scene-01");
    expect(stage).toHaveAttribute("preserveAspectRatio", "none");
    expect(stage.style.left).toBe("0px");
    expect(stage.style.top).toBe("0px");
    expect(stage.style.width).toBe("1440px");
    expect(stage.style.height).toBe("900px");
    expect(firstPath.getAttribute("d")).not.toBe(orbitalPaths[0].d);
  });
});
