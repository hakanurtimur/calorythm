import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PublicationFooter } from "./publication-footer";
import { PublicationHeader } from "./publication-header";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("PublicationHeader", () => {
  it("offers the publication navigation from one visible wordmark", () => {
    const { container } = render(<PublicationHeader />);

    expect(screen.getByRole("navigation", { name: "Ana navigasyon" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: "Yazar olarak katıl" })).toHaveAttribute(
      "href",
      "/about#katki",
    );
    expect(screen.getAllByRole("link", { name: "CALORYTHM ana sayfa" })).toHaveLength(1);
    expect(container.querySelectorAll('[data-brand-wordmark="primary"]')).toHaveLength(1);
  });

  it("opens a keyboard-operable mobile menu with a 44px target", () => {
    render(<PublicationHeader />);
    const menuButton = screen.getByRole("button", { name: "Menüyü aç" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveStyle({ minHeight: "44px", minWidth: "44px" });

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Mobil navigasyon" })).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the mobile menu when its navigation is used", () => {
    render(<PublicationHeader />);
    const menuButton = screen.getByRole("button", { name: "Menüyü aç" });

    fireEvent.click(menuButton);
    const topicLink = within(
      screen.getByRole("navigation", { name: "Mobil navigasyon" }),
    ).getByRole(
        "link",
        { name: "Konular" },
    );
    topicLink.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
      once: true,
    });
    fireEvent.click(topicLink);

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });
});

describe("PublicationFooter", () => {
  it("keeps journal and contribution links available at the end of a reading route", () => {
    render(<PublicationFooter />);

    expect(screen.getByRole("contentinfo")).toBeVisible();
    expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: "Yazar olarak katıl" })).toHaveAttribute(
      "href",
      "/about#katki",
    );
  });
});
