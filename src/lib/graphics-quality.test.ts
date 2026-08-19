import { describe, expect, it } from "vitest";
import { deriveGraphicsQuality } from "./graphics-quality";

describe("deriveGraphicsQuality", () => {
  it("returns static for reduced motion or data saving", () => {
    expect(deriveGraphicsQuality({ width: 1440, dpr: 2, reducedMotion: true, saveData: false, deviceMemory: 8 })).toBe("static");
    expect(deriveGraphicsQuality({ width: 1440, dpr: 2, reducedMotion: false, saveData: true, deviceMemory: 8 })).toBe("static");
  });

  it("returns low for narrow or constrained devices", () => {
    expect(deriveGraphicsQuality({ width: 390, dpr: 3, reducedMotion: false, saveData: false, deviceMemory: 8 })).toBe("low");
    expect(deriveGraphicsQuality({ width: 1280, dpr: 2, reducedMotion: false, saveData: false, deviceMemory: 2 })).toBe("low");
  });

  it("returns high for capable desktop profiles", () => {
    expect(deriveGraphicsQuality({ width: 1440, dpr: 2, reducedMotion: false, saveData: false, deviceMemory: 8 })).toBe("high");
  });
});
