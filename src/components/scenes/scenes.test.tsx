import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";

afterEach(cleanup);

describe("homepage scenes", () => {
  it("presents the three-scene narrative with one page title", () => {
    render(<Home />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Yediğin şey, bir sayıdan fazlası." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Beden sadece almaz. Cevap verir." })).toBeInTheDocument();
  });

  it("keeps the explore action and scene hooks available without unbuilt navigation", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Keşfet" })).toHaveAttribute("href", "#madde");
    expect(screen.getByRole("region", { name: "Sahne 01: Uyanış" })).toHaveAttribute("data-scene", "01");
    expect(screen.getByRole("region", { name: "Sahne 02: Madde" })).toHaveAttribute("data-scene", "02");
    expect(screen.getByRole("region", { name: "Sahne 03: Cevap" })).toHaveAttribute("data-scene", "03");
    expect(document.querySelectorAll("[data-motion]")).not.toHaveLength(0);
    expect(screen.getByText("Journal")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Konular")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Hakkında")).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("link", { name: "Journal" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Konular" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Hakkında" })).not.toBeInTheDocument();
  });

  it("renders every response concept as readable text", () => {
    render(<Home />);

    for (const concept of ["Enerji", "Sindirim", "Emilim", "Depolama", "Hareket", "Toparlanma"]) {
      expect(screen.getByText(concept)).toBeInTheDocument();
    }
  });
});
