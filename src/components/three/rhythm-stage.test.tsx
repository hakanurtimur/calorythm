import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RhythmStage } from "./rhythm-stage";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <canvas data-rhythm-webgl="true" />,
  useFrame: vi.fn(),
}));
vi.mock("./webgl-support", () => ({ probeWebGL2Support: vi.fn(() => true) }));

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

describe("RhythmStage constrained quality", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
    else Reflect.deleteProperty(window, "matchMedia");
  });

  it("keeps the fibrous fallback and never creates a WebGL canvas for reduced motion", () => {
    const { container } = render(<RhythmStage />);
    const stage = container.firstChild;

    expect(stage).toHaveAttribute("data-quality", "static");
    expect(stage).toHaveAttribute("data-rendering", "fallback");
    expect(container.querySelector('[data-rhythm-webgl="true"]')).not.toBeInTheDocument();
  });
});
