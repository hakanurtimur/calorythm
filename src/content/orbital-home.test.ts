import { describe, expect, it } from "vitest";
import { orbitalHomeContent } from "./orbital-home";

describe("orbitalHomeContent", () => {
  it("keeps the homepage narrative in its approved editorial order", () => {
    expect(orbitalHomeContent.hero.title).toBe("Beslenmenin bir ritmi var.");
    expect(orbitalHomeContent.sections.map((section) => section.id)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
    ]);
    expect(orbitalHomeContent.journalTopics.map((topic) => topic.title)).toEqual([
      "Protein",
      "Karbonhidrat",
      "Yağlar",
      "Metabolizma",
      "Enerji Dengesi",
      "Lif",
      "Hidrasyon",
      "Mikro Besinler",
    ]);
  });

  it("promises understanding without marketing implementation features", () => {
    const publicCopy = JSON.stringify(orbitalHomeContent).toLocaleLowerCase("tr");

    expect(publicCopy).not.toMatch(/interaktif makale|scroll|animasyon/);
    expect(publicCopy).toContain("anlaşılmasını sağlamak");
  });
});
