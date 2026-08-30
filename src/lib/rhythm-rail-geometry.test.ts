import { describe, expect, it } from "vitest";
import { buildRhythmRailTipLattice } from "./rhythm-rail-geometry";

describe("buildRhythmRailTipLattice", () => {
  it("keeps the four-line convergence ratio consistent across rail sizes", () => {
    expect(buildRhythmRailTipLattice({
      anchor: 272,
      baseXs: [78, 122, 166, 210],
    })).toEqual([272, 288, 304, 320]);

    expect(buildRhythmRailTipLattice({
      anchor: 176,
      baseXs: [42, 66, 90, 114],
    })).toEqual([176, 185, 194, 203]);
  });
});
