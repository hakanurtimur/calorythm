import { describe, expect, it } from "vitest";
import { createRhythmCurves } from "./rhythm-geometry";

describe("createRhythmCurves", () => {
  it("creates closed, offset strands without invalid coordinates", () => {
    const curves = createRhythmCurves({ strands: 7, segments: 96 });

    expect(curves).toHaveLength(7);
    for (const curve of curves) {
      expect(curve.closed).toBe(true);
      expect(curve.getPoints(12).every((point) => Number.isFinite(point.length()))).toBe(true);
    }
    expect(curves[0]?.getPoint(0).equals(curves[1]!.getPoint(0))).toBe(false);
  });
});
