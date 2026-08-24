import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("CALORYTHM publication landing", () => {
  it("opens the conductor cover into a complete publication", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Beslenmenin bir ritmi var/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Hikâyeyi oku" })).toHaveAttribute(
      "href",
      "/journal/protein-sadece-kas-icin-degildir",
    );
    expect(
      screen.getByRole("heading", { name: "Konu atlası" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Katkı sürecini gör" }),
    ).toHaveAttribute("href", "/about#katki");
  });
});
