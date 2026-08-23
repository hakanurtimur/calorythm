import { cleanup, render } from "@testing-library/react";
import { resetOrbitalThreadState } from "@/components/orbital/orbital-thread-store";
import { afterEach, describe, expect, it } from "vitest";
import { HomeExperience } from "./home-experience";

afterEach(() => {
  cleanup();
  resetOrbitalThreadState();
});

describe("Home scroll guide and orbital layer contract", () => {
  it("keeps the persistent orbital stage between scene backgrounds and pinned content", () => {
    const { container } = render(<HomeExperience />);

    ["hero", "01", "02", "03"].forEach((sceneId) => {
      expect(container.querySelector(`[data-scene="${sceneId}"] [data-pin="${sceneId}"]`))
        .toHaveAttribute("data-orbital-content-layer", "foreground");
    });
    ["04", "05", "06", "07"].forEach((sceneId) => {
      expect(
        container.querySelector(
          `[data-scene="${sceneId}"] [data-orbital-content-layer="foreground"]`,
        ),
      ).not.toBeNull();
    });
    expect(document.querySelectorAll("[data-orbital-thread-stage]")).toHaveLength(1);
  });

  it("offers one restrained four-chapter navigation rail", () => {
    const { container } = render(<HomeExperience />);
    const guide = container.querySelector('[data-scroll-guide=""]');

    expect(guide).toHaveAttribute("aria-label", "Ana sayfa bölümleri");
    expect(guide).toHaveAttribute("data-visible");
    expect(guide?.querySelectorAll("[data-scroll-guide-item]")).toHaveLength(4);
    expect(
      Array.from(guide?.querySelectorAll("a") ?? [], (link) => link.getAttribute("href")),
    ).toEqual(["#top", "#section-01", "#section-02", "#konular"]);
    expect(guide?.querySelector('[data-scroll-guide-meter=""]')).not.toBeNull();
  });
});
