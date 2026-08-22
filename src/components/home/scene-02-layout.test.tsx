import { cleanup, render } from "@testing-library/react";
import { resetOrbitalThreadState } from "@/components/orbital/orbital-thread-store";
import { afterEach, describe, expect, it } from "vitest";
import { HomeExperience } from "./home-experience";

afterEach(() => {
  cleanup();
  resetOrbitalThreadState();
});

describe("Scene 02 editorial proof route", () => {
  it("composes Source, Context and Narrative as three stops on one continuous field", () => {
    const { container } = render(<HomeExperience />);
    const scene = container.querySelector<HTMLElement>('[data-scene="02"]')!;

    expect(scene).toHaveAttribute("data-scene-role", "editorial-proof-route");
    expect(scene.querySelector('[data-pin="02"]')).not.toBeNull();
    expect(scene.querySelector('[data-motion="proof-copy"]')).not.toBeNull();
    expect(scene.querySelectorAll('[data-motion="proof-stop"]')).toHaveLength(3);
    expect(scene.querySelector('[data-proof-index]')).not.toBeNull();
    expect(document.querySelectorAll("[data-orbital-thread-stage]")).toHaveLength(1);
  });
});
