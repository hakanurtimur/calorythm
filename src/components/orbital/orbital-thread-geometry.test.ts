import { describe, expect, it } from "vitest";
import { orbitalPaths } from "./orbital-paths";
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
});
