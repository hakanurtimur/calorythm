import { describe, expect, it } from "vitest";
import { orbitalPaths } from "./orbital-paths";
import * as orbitalGeometry from "./orbital-thread-geometry";
import {
  computeThreadDash,
  createCtaThreadGeometry,
  interpolateGeometry,
  interpolateProgressiveGeometry,
  parseCubicLoopPath,
  serializeCubicLoopPath,
} from "./orbital-thread-geometry";

describe("orbital thread geometry", () => {
  it("round-trips the authored four-cubic loop", () => {
    const points = parseCubicLoopPath(orbitalPaths[0].d);

    expect(points).toHaveLength(13);
    expect(serializeCubicLoopPath(points)).toBe(orbitalPaths[0].d);
  });

  it.each([
    orbitalPaths[0].d.replace("C", "L"),
    orbitalPaths[0].d.slice(0, -1),
    `${orbitalPaths[0].d} L`,
  ])("rejects authored data outside the M plus four C plus Z grammar", (path) => {
    expect(() => parseCubicLoopPath(path)).toThrow(
      "Expected an SVG loop with one move and four cubic segments.",
    );
  });

  it("serializes runtime coordinates with no more than two decimal places", () => {
    const points = parseCubicLoopPath(orbitalPaths[0].d);
    points[1] = { x: 76.126, y: 5.129 };

    expect(serializeCubicLoopPath(points)).toContain("C76.13 5.13");
    expect(serializeCubicLoopPath(points)).not.toMatch(/\.\d{3}/);
  });

  it("keeps interpolation endpoints exact", () => {
    const from = parseCubicLoopPath(orbitalPaths[0].d);
    const to = createCtaThreadGeometry({
      ctaRect: { left: 620, top: 650, width: 160, height: 52 },
      pathIndex: 0,
      stageRect: { left: 288, top: 18, width: 864, height: 864 },
    });

    expect(interpolateGeometry(from, to, 0)).toEqual(from);
    expect(interpolateGeometry(from, to, 1)).toEqual(to);
  });

  it("keeps standard and progressive interpolation midpoints finite", () => {
    const from = parseCubicLoopPath(orbitalPaths[0].d);
    const to = createCtaThreadGeometry({
      ctaRect: { left: 620, top: 650, width: 160, height: 52 },
      pathIndex: 0,
      stageRect: { left: 288, top: 18, width: 864, height: 864 },
    });
    const midpoints = [
      interpolateGeometry(from, to, 0.5),
      interpolateProgressiveGeometry(from, to, 0.5, { leadingPointIndex: 3 }),
    ];

    expect(
      midpoints.flat().every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)),
    ).toBe(true);
  });

  it("creates four finite CTA rounded rectangles in two-pixel outer layers", () => {
    const loops = [0, 1, 2, 3].map((pathIndex) =>
      createCtaThreadGeometry({
        ctaRect: { left: 620, top: 650, width: 160, height: 52 },
        pathIndex,
        stageRect: { left: 288, top: 18, width: 864, height: 864 },
      }),
    );

    expect(loops.every((loop) => loop.length === 13)).toBe(true);
    expect(loops.flat().every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
    expect(new Set(loops.map(serializeCubicLoopPath))).toHaveProperty("size", 4);
    loops.forEach((loop) => {
      expect(new Set(loop.slice(0, 4).map(({ y }) => y))).toHaveProperty("size", 1);
      expect(new Set(loop.slice(6, 10).map(({ y }) => y))).toHaveProperty("size", 1);
      expect(loop[0]!.x).toBeLessThan(loop[3]!.x);
    });
    expect(loops.map((loop) => loop[0]!.y)).toEqual(
      [...loops.map((loop) => loop[0]!.y)].sort((a, b) => b - a),
    );
    expect(loops[0]![0]!.y - loops[1]![0]!.y).toBeCloseTo(0.26455, 5);
    expect(loops[1]![0]!.y - loops[2]![0]!.y).toBeCloseTo(0.26455, 5);
    expect(loops[2]![0]!.y - loops[3]![0]!.y).toBeCloseTo(0.26455, 5);
  });

  it("opens a travelling gap before closing each layered CTA outline", () => {
    expect(computeThreadDash(0, 0)).toEqual({ dasharray: "1 0", dashoffset: 0 });
    expect(computeThreadDash(0.5, 0).dasharray).not.toBe("1 0");
    expect([0, 1, 2, 3].map((pathIndex) => computeThreadDash(1, pathIndex))).toEqual([
      { dasharray: "1 0", dashoffset: 0 },
      { dasharray: "1 0", dashoffset: 0 },
      { dasharray: "1 0", dashoffset: 0 },
      { dasharray: "1 0", dashoffset: 0 },
    ]);
  });

  it("lets the CTA-facing segment lead while the remaining arc trails", () => {
    const from = Array.from({ length: 13 }, () => ({ x: 0, y: 0 }));
    const to = Array.from({ length: 13 }, () => ({ x: 100, y: 100 }));
    const morphed = interpolateProgressiveGeometry(from, to, 0.5, {
      leadingPointIndex: 3,
      trailingLag: 0.4,
    });

    expect(morphed[3]).toEqual({ x: 50, y: 50 });
    expect(morphed[9]!.x).toBeCloseTo(16.667, 3);
    expect(morphed[9]!.x).toBeLessThan(morphed[3]!.x);
    expect(interpolateProgressiveGeometry(from, to, 0, { leadingPointIndex: 3 })).toEqual(from);
    expect(interpolateProgressiveGeometry(from, to, 1, { leadingPointIndex: 3 })).toEqual(to);
  });

  it("morphs the authored loop into a layered editorial signal without breaking its seam", () => {
    type SignalGeometry = (
      source: ReturnType<typeof parseCubicLoopPath>,
      input: {
        elapsedMs: number;
        layerIndex: number;
        layerSpacing: number;
        noiseAmplitude: number;
        progress: number;
        radiusX: number;
        radiusY: number;
        settledWaveAmplitude: number;
        waveLobes: number;
        waveSpeed: number;
      },
    ) => ReturnType<typeof parseCubicLoopPath>;
    const createEditorialSignalGeometry = (
      orbitalGeometry as unknown as { createEditorialSignalGeometry?: SignalGeometry }
    ).createEditorialSignalGeometry;

    expect(createEditorialSignalGeometry).toBeTypeOf("function");
    if (!createEditorialSignalGeometry) return;

    const source = parseCubicLoopPath(orbitalPaths[0].d);
    const input = {
      elapsedMs: 1200,
      layerIndex: 0,
      layerSpacing: 2.4,
      noiseAmplitude: 7,
      progress: 1,
      radiusX: 70,
      radiusY: 9,
      settledWaveAmplitude: 1.2,
      waveLobes: 3.2,
      waveSpeed: 0.001,
    };
    const signal = createEditorialSignalGeometry(source, input);
    const xValues = signal.map(({ x }) => x);
    const yValues = signal.map(({ y }) => y);
    const lowerLayer = createEditorialSignalGeometry(source, { ...input, layerIndex: 3 });
    const animatedMidpoint = createEditorialSignalGeometry(source, {
      ...input,
      elapsedMs: 1650,
      progress: 0.3,
    });
    const initialMidpoint = createEditorialSignalGeometry(source, {
      ...input,
      elapsedMs: 0,
      progress: 0.3,
    });

    expect(createEditorialSignalGeometry(source, { ...input, progress: 0 })).toEqual(source);
    expect(Math.max(...xValues) - Math.min(...xValues)).toBeGreaterThan(130);
    expect(Math.max(...yValues) - Math.min(...yValues)).toBeLessThan(28);
    expect(signal.at(-1)).toEqual(signal[0]);
    expect(lowerLayer[0]!.y).toBeGreaterThan(signal[0]!.y + 5);
    expect(animatedMidpoint).not.toEqual(initialMidpoint);
    expect(signal.flatMap(({ x, y }) => [x, y]).every(Number.isFinite)).toBe(true);
  });

  it("settles each editorial signal into an exact horizontal line before the copy enters", () => {
    const source = parseCubicLoopPath(orbitalPaths[0].d);
    const input = {
      elapsedMs: 1200,
      layerIndex: 1,
      layerSpacing: 2.4,
      noiseAmplitude: 7,
      pointerBoost: 1.35,
      pointerStrength: 1,
      pointerX: 0.35,
      pointerY: -0.2,
      progress: 0.45,
      radiusX: 70,
      radiusY: 9,
      settledWaveAmplitude: 1.2,
      waveLobes: 3.2,
      waveSpeed: 0.001,
    };
    const signal = orbitalGeometry.createEditorialSignalGeometry(source, input);
    const laterSignal = orbitalGeometry.createEditorialSignalGeometry(source, {
      ...input,
      elapsedMs: 3600,
    });

    expect(new Set(signal.map(({ y }) => Number(y.toFixed(6))))).toHaveProperty("size", 1);
    expect(
      Math.max(...signal.map(({ x }) => x)) - Math.min(...signal.map(({ x }) => x)),
    ).toBeGreaterThan(130);
    expect(laterSignal).toEqual(signal);
  });
});
