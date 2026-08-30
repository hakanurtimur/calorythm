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

  it("maps three copy chapters to three persistent conductor poses", () => {
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

    expect(resolveCalorythmCoverMotion(0).conductor.dominantFrame).toBe(1);
    expect(resolveCalorythmCoverMotion(0.5).conductor.dominantFrame).toBe(0);
    expect(resolveCalorythmCoverMotion(1).conductor.dominantFrame).toBe(2);

    for (let step = 0; step <= 100; step += 1) {
      const motion = resolveCalorythmCoverMotion(step / 100);
      const weights = Object.values(motion.copyWeights);
      const frameByChapter = { cover: 1, editorial: 0, journal: 2 } as const;

      expect(weights.reduce((total, weight) => total + weight, 0)).toBeCloseTo(1, 8);
      expect(weights.filter((weight) => weight > 0.001).length).toBeLessThanOrEqual(2);
      weights.forEach((weight) => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      });

      expect(motion.conductor.frameWeights).toEqual([
        motion.copyWeights.editorial,
        motion.copyWeights.cover,
        motion.copyWeights.journal,
      ]);
      expect(motion.conductor.dominantFrame).toBe(
        frameByChapter[motion.activeChapter],
      );
    }
  });

  it("moves each pose once while its matching copy crossfades", () => {
    const firstLift = resolveCalorythmCoverMotion(0.3);
    const editorialHold = resolveCalorythmCoverMotion(0.5);
    const secondDrop = resolveCalorythmCoverMotion(0.68);
    const journalHold = resolveCalorythmCoverMotion(0.9);

    expect(firstLift.copyWeights.cover).toBeGreaterThan(0);
    expect(firstLift.copyWeights.editorial).toBeGreaterThan(0);
    expect(firstLift.copyWeights.journal).toBe(0);
    expect(firstLift.conductor.fromFrame).toBe(1);
    expect(firstLift.conductor.toFrame).toBe(0);
    expect(firstLift.conductor.mix).toBeGreaterThan(0);
    expect(firstLift.conductor.mix).toBeLessThan(1);
    expect(firstLift.conductor.handoffEnergy).toBeGreaterThan(0);

    expect(editorialHold.conductor.fromFrame).toBe(0);
    expect(editorialHold.conductor.toFrame).toBe(0);
    expect(editorialHold.copyWeights).toEqual({
      cover: 0,
      editorial: 1,
      journal: 0,
    });

    expect(secondDrop.conductor.fromFrame).toBe(0);
    expect(secondDrop.conductor.toFrame).toBe(2);
    expect(secondDrop.copyWeights.editorial).toBeGreaterThan(0);
    expect(secondDrop.copyWeights.journal).toBeGreaterThan(0);

    expect(journalHold.conductor.fromFrame).toBe(2);
    expect(journalHold.conductor.toFrame).toBe(2);
    expect(journalHold.copyWeights).toEqual({
      cover: 0,
      editorial: 0,
      journal: 1,
    });
  });

  it("keeps the exact three-beat pose sequence in both scroll directions", () => {
    expect(resolveCalorythmCoverMotion(0).conductor).toMatchObject({
      dominantFrame: 1,
      frameWeights: [0, 1, 0],
      fromFrame: 1,
      handoffEnergy: 0,
      mix: 0,
      toFrame: 1,
    });
    expect(resolveCalorythmCoverMotion(0.5).conductor).toMatchObject({
      dominantFrame: 0,
      frameWeights: [1, 0, 0],
      fromFrame: 0,
      handoffEnergy: 0,
      mix: 0,
      toFrame: 0,
    });
    expect(resolveCalorythmCoverMotion(1).conductor).toMatchObject({
      dominantFrame: 2,
      frameWeights: [0, 0, 1],
      fromFrame: 2,
      handoffEnergy: 0,
      mix: 0,
      toFrame: 2,
    });
    expect(
      [0, 0.5, 1, 0.5, 0].map(
        (progress) =>
          resolveCalorythmCoverMotion(progress).conductor.dominantFrame,
      ),
    ).toEqual([1, 0, 2, 0, 1]);
  });

  it("keeps every raster handoff continuous with at most two visible poses", () => {
    for (let step = 0; step <= 100; step += 1) {
      const { frameWeights } = resolveCalorythmCoverMotion(step / 100).conductor;

      expect(frameWeights.reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1, 8);
      expect(frameWeights.filter((weight) => weight > 0.001).length).toBeLessThanOrEqual(2);
      frameWeights.forEach((weight) => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      });
    }

    [0.22, 0.38, 0.6, 0.76].forEach((boundary) => {
      const before = resolveCalorythmCoverMotion(boundary - 0.0001).conductor.frameWeights;
      const after = resolveCalorythmCoverMotion(boundary + 0.0001).conductor.frameWeights;

      before.forEach((weight, index) => {
        expect(Math.abs(weight - after[index]!)).toBeLessThan(0.01);
      });
    });
  });
});
