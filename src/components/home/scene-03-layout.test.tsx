import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeExperience } from "./home-experience";

vi.mock("./home-motion", () => ({
  HomeMotion: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./home-splash", () => ({ HomeSplash: () => null }));

vi.mock("./orbital-thread-stage", () => ({
  OrbitalThreadStage: () => <svg data-orbital-thread-stage="" />,
}));

vi.mock("@/components/orbital/orbital-thread-controls-loader", () => ({
  OrbitalThreadControlsLoader: () => null,
}));

describe("Scene 03 question atlas", () => {
  it("keeps one persistent orbital stage and exposes five ordered topics", () => {
    const { container } = render(<HomeExperience />);
    const scene = container.querySelector('[data-scene="03"]');

    expect(scene).toHaveAttribute("data-scene-role", "question-atlas");
    expect(scene?.querySelector('[data-pin="03"]')).not.toBeNull();
    expect(scene?.querySelectorAll('[data-motion="atlas-topic"]')).toHaveLength(5);
    expect(scene?.querySelector('[data-atlas-index]')).not.toBeNull();
    expect(container.querySelectorAll("[data-orbital-thread-stage]")).toHaveLength(1);
  });
});
