import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  it("leaves the CTA outer border entirely to the persistent orbital threads", () => {
    const style = document.createElement("style");
    style.textContent = readFileSync(
      resolve(process.cwd(), "src/components/orbital/orbital.module.css"),
      "utf8",
    );
    const link = document.createElement("a");
    link.className = "orbitalLink";
    link.dataset.variant = "orbit";
    document.head.append(style);
    document.body.append(link);

    const computedStyle = getComputedStyle(link);
    expect(computedStyle.borderTopStyle).not.toBe("solid");
    expect(Number.parseFloat(computedStyle.borderTopWidth || "0")).toBe(0);

    link.remove();
    style.remove();
  });

  it("does not paint a static gradient behind the orbital CTA", () => {
    const style = document.createElement("style");
    style.textContent = readFileSync(
      resolve(process.cwd(), "src/components/orbital/orbital.module.css"),
      "utf8",
    );
    document.head.append(style);

    const paintsStaticGradient = Array.from(style.sheet?.cssRules ?? []).some((rule) => {
      const styleRule = rule as CSSStyleRule;
      return (
        styleRule.selectorText === '.orbitalLink[data-variant="orbit"]::before' &&
        styleRule.style.getPropertyValue("background").includes("linear-gradient")
      );
    });

    expect(paintsStaticGradient).toBe(false);

    style.remove();
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
