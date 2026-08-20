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
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});
