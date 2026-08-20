import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HomeExperience } from "./home-experience";

afterEach(cleanup);

describe("HomeExperience", () => {
  it("presents one page title followed by the seven-part editorial narrative", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "Bilgiyi okumak kolaydır. Anlamak zordur.",
      "Her konu, kendi hikâyesini anlatır.",
      "Karmaşık olanı, anlaşılır hâle getiriyoruz.",
      "Bir makale okumuyorsun. Bir düşüncenin içine giriyorsun.",
      "Protein Sadece Kas İçin Değildir",
      "Keşfetmeye devam et.",
      "Merak iyi bir başlangıçtır.",
    ]);
    expect(container.querySelectorAll("[data-scene]")).toHaveLength(8);
  });

  it("keeps the complete reading experience available without a graphics runtime", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getByText("Beslenme bilimini ezberlerle değil, anlayarak keşfet.")).toBeInTheDocument();
    expect(container.querySelector("[data-motion-profile]")).toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("uses authored editorial structures instead of a repeated card grid", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getByRole("list", { name: "Makro besin rotaları" }).children).toHaveLength(3);
    expect(screen.getByRole("list", { name: "Beslenme konuları" }).children).toHaveLength(5);
    expect(screen.getByRole("list", { name: "Journal konuları" }).children).toHaveLength(8);
    expect(container.querySelectorAll('[data-motion="journal-topic"]')).toHaveLength(8);
    expect(container.querySelectorAll("[data-orbit-mark]")).toHaveLength(7);
    expect(screen.getByText("Hikâyeyi keşfet").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("keeps every available action valid and exposes only one unavailable destination", () => {
    const { container } = render(<HomeExperience />);

    expect(screen.getAllByRole("link").every((link) => Boolean(link.getAttribute("href")))).toBe(true);
    expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(1);
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});
