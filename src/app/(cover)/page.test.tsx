import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("CALORYTHM homepage prototype", () => {
  it("opens with one focused editorial hero instead of the legacy multi-scene landing", () => {
    const { container } = render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Beslenmenin bir ritmi var.",
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("[data-home-scene]")).toHaveLength(1);
    expect(container.querySelector('[data-scene="01"]')).not.toBeInTheDocument();
    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });
});
