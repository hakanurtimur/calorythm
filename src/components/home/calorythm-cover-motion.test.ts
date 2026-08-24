import { describe, expect, it } from "vitest";
import {
  CALORYTHM_COVER_VIEWBOX,
  resolveCalorythmCoverBands,
  resolveCalorythmCoverMotion,
} from "./calorythm-cover-motion";

describe("calorythm cover motion", () => {
  it("draws four deterministic cubic bands beyond both viewport edges", () => {
    const first = resolveCalorythmCoverBands();
    const second = resolveCalorythmCoverBands();

    expect(CALORYTHM_COVER_VIEWBOX).toEqual({ height: 941, width: 1672 });
    expect(second).toEqual(first);
    expect(first).toHaveLength(4);

    first.forEach((band, index) => {
      expect(band.index).toBe(index);
      expect(band.points[0]?.x).toBeLessThan(0);
      expect(band.points.at(-1)?.x).toBeGreaterThan(
        CALORYTHM_COVER_VIEWBOX.width,
      );
      expect(band.d).toMatch(/^M -?\d+(?:\.\d+)? -?\d+(?:\.\d+)? C /);
      expect(band.d.match(/ C /g)?.length).toBe(
        band.points.length - 1,
      );
      expect(band.d).not.toMatch(/NaN|Infinity/);
    });
  });

  it("keeps every authored band visually separated at every anchor", () => {
    const bands = resolveCalorythmCoverBands();

    bands[0]!.points.forEach((_, pointIndex) => {
      for (let bandIndex = 1; bandIndex < bands.length; bandIndex += 1) {
        const previousY = bands[bandIndex - 1]!.points[pointIndex]!.y;
        const currentY = bands[bandIndex]!.points[pointIndex]!.y;

        expect(currentY - previousY).toBeGreaterThanOrEqual(30);
      }
    });
  });

  it("gives the cover bands a clearly organic wave instead of a near-straight line", () => {
    const authored = resolveCalorythmCoverBands()[0]!;
    const verticalRange = (band: typeof authored) => {
      const values = band.points.map((point) => point.y);

      return Math.max(...values) - Math.min(...values);
    };

    expect(verticalRange(authored)).toBeGreaterThan(48);
  });

  it("clamps malformed progress before resolving chapter state", () => {
    expect(resolveCalorythmCoverMotion(Number.POSITIVE_INFINITY)).toEqual(
      resolveCalorythmCoverMotion(0),
    );
  });

  it("crossfades cover copy through editorial copy without opacity gaps", () => {
    expect(resolveCalorythmCoverMotion(0).copyWeights).toEqual({
      cover: 1,
      editorial: 0,
      journal: 0,
    });
    expect(resolveCalorythmCoverMotion(0.5).copyWeights).toEqual({
      cover: 0,
      editorial: 1,
      journal: 0,
    });
    expect(resolveCalorythmCoverMotion(1).copyWeights).toEqual({
      cover: 0,
      editorial: 0,
      journal: 1,
    });

    [0.25, 0.38, 0.5, 0.75, 0.86].forEach((progress) => {
      const weights = Object.values(
        resolveCalorythmCoverMotion(progress).copyWeights,
      );

      expect(weights.reduce((total, weight) => total + weight, 0)).toBeCloseTo(
        1,
        8,
      );
      weights.forEach((weight) => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      });
    });
  });

  it("publishes one atomic conductor pose at a time across the beat", () => {
    expect(resolveCalorythmCoverMotion(0).conductor).toEqual({
      dominantFrame: 1,
    });
    expect(resolveCalorythmCoverMotion(0.124).conductor).toEqual({
      dominantFrame: 1,
    });
    expect(resolveCalorythmCoverMotion(0.126).conductor).toEqual({
      dominantFrame: 0,
    });
    expect(resolveCalorythmCoverMotion(0.5).conductor).toEqual({
      dominantFrame: 1,
    });
    expect(resolveCalorythmCoverMotion(0.75).conductor).toEqual({
      dominantFrame: 2,
    });
    expect(resolveCalorythmCoverMotion(1).conductor).toEqual({
      dominantFrame: 1,
    });
  });
});
