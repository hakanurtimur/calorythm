import { describe, expect, it } from "vitest";
import { homeContent } from "./home";

describe("homeContent", () => {
  it("contains the approved Turkish narrative in scene order", () => {
    expect(homeContent.hero.title).toBe("Beslenmenin bir ritmi var.");
    expect(homeContent.matter.title).toBe("Yediğin şey, bir sayıdan fazlası.");
    expect(homeContent.response.title).toBe("Beden sadece almaz. Cevap verir.");
    expect(homeContent.response.concepts).toEqual([
      "Enerji",
      "Sindirim",
      "Emilim",
      "Depolama",
      "Hareket",
      "Toparlanma",
    ]);
  });
});
