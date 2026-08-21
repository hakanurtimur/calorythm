import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrbitalLink } from "./orbital-link";
import { OrbitalMark } from "./orbital-mark";

describe("orbital brand primitives", () => {
  it("keeps all four brand paths independently addressable", () => {
    const { container } = render(<OrbitalMark tone="brand" variant="signature" />);

    expect(
      Array.from(container.querySelectorAll("[data-orbit-path]"), (path) =>
        path.getAttribute("data-orbit-path"),
      ),
    ).toEqual(["orange", "coral", "ochre", "olive"]);
  });

  it("renders available destinations as real links", () => {
    render(<OrbitalLink href="#konular">Konuları keşfet</OrbitalLink>);

    expect(screen.getByRole("link", { name: "Konuları keşfet" })).toHaveAttribute(
      "href",
      "#konular",
    );
  });

  it("keeps the orbital CTA semantic while the persistent stage owns its threads", () => {
    render(
      <OrbitalLink href="#konular" variant="orbit">
        Keşfet
      </OrbitalLink>,
    );

    const link = screen.getByRole("link", { name: "Keşfet" });
    expect(link).toHaveAttribute("data-variant", "orbit");
    expect(link).toHaveAttribute("data-orbital-anchor", "hero-cta");
    expect(link.style.getPropertyValue("--orbital-fill-progress")).toBe("0");
    expect(link.querySelector("svg")).toBeNull();
    expect(link.querySelector("[data-link-orbit-path]")).toBeNull();
  });

  it("never exposes an unavailable destination as a dead link", () => {
    render(<OrbitalLink unavailable>Hikâyeyi keşfet</OrbitalLink>);

    expect(screen.getByText("Hikâyeyi keşfet").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.queryByRole("link", { name: "Hikâyeyi keşfet" })).not.toBeInTheDocument();
  });
});
