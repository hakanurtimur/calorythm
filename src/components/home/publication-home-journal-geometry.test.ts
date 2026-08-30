import { describe, expect, it } from "vitest";
import * as journalGeometry from "./publication-home-motion";

type JournalGeometryModule = {
  buildJournalLinePath?: (input: {
    baseX: number;
    targetY: number;
    tipX: number;
  }) => string;
  mapJournalRowCenterToViewBox?: (input: {
    fieldHeight: number;
    fieldTop: number;
    rowHeight: number;
    rowTop: number;
  }) => number;
};

const geometry = journalGeometry as JournalGeometryModule;

describe("Journal line geometry", () => {
  it("keeps straight and bent lines morph-compatible", () => {
    expect(geometry.buildJournalLinePath).toBeTypeOf("function");
    if (!geometry.buildJournalLinePath) return;

    const straight = geometry.buildJournalLinePath({
      baseX: 80,
      targetY: 500,
      tipX: 80,
    });
    const bent = geometry.buildJournalLinePath({
      baseX: 80,
      targetY: 500,
      tipX: 300,
    });

    expect(straight.match(/\bC\b/g)).toHaveLength(4);
    expect(bent.match(/\bC\b/g)).toHaveLength(4);
    expect(straight).not.toContain(" L ");
    expect(bent).not.toContain(" L ");
    expect(straight).toMatch(/80 1000$/);
    expect(bent).toContain(
      "C 80 472 278 489 300 500 C 278 511 80 528 80 555",
    );
    expect(straight.match(/[MC]/g)).toEqual(bent.match(/[MC]/g));
    const straightCoordinates = straight.match(/-?\d+(?:\.\d+)?/g) ?? [];
    const bentCoordinates = bent.match(/-?\d+(?:\.\d+)?/g) ?? [];
    expect(straightCoordinates).toHaveLength(bentCoordinates.length);
  });

  it("maps story centers into a safe SVG range without producing NaN", () => {
    expect(geometry.mapJournalRowCenterToViewBox).toBeTypeOf("function");
    if (!geometry.mapJournalRowCenterToViewBox) return;

    expect(geometry.mapJournalRowCenterToViewBox({
      fieldHeight: 1000,
      fieldTop: 100,
      rowHeight: 80,
      rowTop: -100,
    })).toBe(120);
    expect(geometry.mapJournalRowCenterToViewBox({
      fieldHeight: 1000,
      fieldTop: 100,
      rowHeight: 80,
      rowTop: 1200,
    })).toBe(880);
    expect(geometry.mapJournalRowCenterToViewBox({
      fieldHeight: 0,
      fieldTop: 100,
      rowHeight: 80,
      rowTop: 400,
    })).toBe(500);
  });
});
