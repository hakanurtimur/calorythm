import { cleanup, render } from "@testing-library/react";
import { resetOrbitalThreadState } from "@/components/orbital/orbital-thread-store";
import { afterEach, describe, expect, it } from "vitest";
import { HomeExperience } from "./home-experience";

afterEach(() => {
  cleanup();
  resetOrbitalThreadState();
});

describe("Scene 01 editorial-noise layout", () => {
  it("gives the pinned signal field one centered story layer and three noise annotations", () => {
    const { container } = render(<HomeExperience />);
    const scene = container.querySelector<HTMLElement>('[data-scene="01"]')!;

    expect(scene).toHaveAttribute("data-scene-role", "editorial-noise");
    expect(scene.querySelector('[data-pin="01"]')).not.toBeNull();
    expect(scene.querySelectorAll('[data-motion="knowledge-fragment"]')).toHaveLength(3);
    expect(scene.querySelector('[data-motion="knowledge-copy"]')).not.toBeNull();
    expect(document.querySelectorAll("[data-orbital-thread-stage]")).toHaveLength(1);
  });
});
