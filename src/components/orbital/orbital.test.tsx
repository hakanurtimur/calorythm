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

  it("never exposes an unavailable destination as a dead link", () => {
    render(<OrbitalLink unavailable>Hikâyeyi keşfet</OrbitalLink>);

    expect(screen.getByText("Hikâyeyi keşfet").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.queryByRole("link", { name: "Hikâyeyi keşfet" })).not.toBeInTheDocument();
  });
});
