import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import TopicsPage from "./(publication)/topics/page";

const territories = [
  { name: "Yapıtaşları", topics: ["Protein", "Karbonhidrat", "Yağlar"] },
  { name: "Dönüşüm", topics: ["Enerji", "Metabolizma"] },
  { name: "Denge", topics: ["Lif", "Hidrasyon", "Mikro Besinler"] },
] as const;

describe("Topics index", () => {
  beforeEach(() => {
    render(<TopicsPage />);
  });

  afterEach(() => {
    cleanup();
  });

  it("turns eight topics into one three-territory editorial atlas", () => {
    const atlas = screen.getByRole("region", {
      name: "Beslenme tek bir konu değildir.",
    });

    expect(atlas).toHaveAttribute("data-header-tone", "light");
    expect(
      within(atlas).getByText(
        "Sekiz konu; yapıtaşları, dönüşüm ve denge arasında kendi okuma rotanı kurar.",
      ),
    ).toBeVisible();

    territories.forEach(({ name, topics }) => {
      const territory = within(atlas).getByRole("region", { name });
      const list = within(territory).getByRole("list", { name });

      expect(within(list).getAllByRole("listitem")).toHaveLength(topics.length);
      topics.forEach((topic) => {
        expect(within(territory).getByRole("heading", { level: 3, name: topic })).toBeVisible();
      });
    });
  });

  it("uses one shared relief composition instead of eight image cards", () => {
    const figure = screen.getByRole("figure", {
      name: "Beslenme konularının üç bölgeli görsel atlası",
    });

    expect(within(figure).getAllByRole("img")).toHaveLength(3);
    expect(figure.querySelectorAll("[data-atlas-sheet]")).toHaveLength(3);
    expect(figure.querySelectorAll("[data-rhythm-line]")).toHaveLength(4);
  });

  it("gives every topic a heading, a readable definition, and an accurate destination name", () => {
    const protein = screen.getByRole("link", { name: "Protein konusunu keşfet" });

    expect(protein).toHaveAttribute("href", "/topics/protein");
    expect(protein).toHaveAccessibleDescription(
      /Yapı, onarım, taşıma ve savunmada kullanılan amino asitlerin hikâyesi\./,
    );
    expect(protein).toHaveAccessibleDescription(/Açık dosya · 3 yayın/);
    expect(within(protein).getByText("Açık dosya · 3 yayın")).toBeVisible();

    expect(screen.getAllByRole("link", { name: /konusunu keşfet/i })).toHaveLength(8);
    expect(screen.queryByRole("link", { name: /yazıları gör/i })).not.toBeInTheDocument();
  });
});
