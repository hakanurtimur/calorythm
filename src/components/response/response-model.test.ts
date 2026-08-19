import { describe, expect, it } from "vitest";
import { advanceResponseParticle, createResponseParticles } from "./response-model";

describe("response particle model", () => {
  it("creates a deterministic bounded field", () => {
    const first = createResponseParticles({ count: 12, seed: 42 });
    const second = createResponseParticles({ count: 12, seed: 42 });
    expect(first).toEqual(second);
    expect(first.every((particle) => particle.x >= 0 && particle.x <= 1)).toBe(true);
  });

  it("does not move when intensity is zero", () => {
    const particle = createResponseParticles({ count: 1, seed: 7 })[0]!;
    const before = { ...particle };

    expect(advanceResponseParticle(particle, 2, 0)).toEqual(before);
    expect(particle).toEqual(before);
  });

  it("uses elapsed time for bounded horizontal transfer", () => {
    const particle = {
      x: 0.99,
      y: 0.5,
      phase: 0,
      speed: 0.08,
      radius: 1,
      paletteIndex: 0,
    };

    expect(advanceResponseParticle({ ...particle }, 0, 1).x).toBe(0.99);
    const advanced = advanceResponseParticle({ ...particle }, 1, 1);
    expect(advanced.x).toBeCloseTo(0.07);
    expect(advanced.y).toBeGreaterThanOrEqual(0);
    expect(advanced.y).toBeLessThanOrEqual(1);
  });
});
