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

  it("centers reliable editorial work without marketing implementation features", () => {
    const publicCopy = JSON.stringify(orbitalHomeContent).toLocaleLowerCase("tr");

    expect(publicCopy).not.toMatch(/interaktif makale|scroll|animasyon/);
    expect(publicCopy).toContain("bilgi kirliliği");
    expect(publicCopy).toContain("güvenilir kaynak");
  });

  it("positions the brand as an independent journal with editorial standards and a quiet founder signature", () => {
    expect(orbitalHomeContent.hero.prelude).toBe("Bağımsız beslenme dergisi");
    expect(orbitalHomeContent.hero.attribution).toBe(
      "Bir diyetisyen ve yazılımcı tarafından kuruldu.",
    );
    expect(orbitalHomeContent.editorialPrinciples.map(({ title }) => title)).toEqual([
      "Kaynak",
      "Bağlam",
      "Anlatım",
    ]);
    expect(orbitalHomeContent.sections[6].body).toContain("uzmanların ve yazarların metinlerine");
  });

  it("keeps the first editorial file open until its subject is chosen", () => {
    expect(orbitalHomeContent.sections[4].title).toEqual(["İlk dosya", "hazırlanıyor."]);
    expect(JSON.stringify(orbitalHomeContent.sections[4])).not.toContain(
      "Protein Sadece Kas İçin Değildir",
    );
  });
});
