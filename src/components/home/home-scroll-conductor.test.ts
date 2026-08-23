import { describe, expect, it } from "vitest";
import {
  HOME_SCROLL_CONDUCTOR_CONFIG,
  HOME_SCROLL_SCENE_IDS,
  clampScrollProgress,
  resolveHomeScrollState,
} from "./home-scroll-conductor";

describe("home scroll conductor", () => {
  it("keeps scene duration, phase, and entry-share direction in one contract", () => {
    expect(HOME_SCROLL_SCENE_IDS).toEqual(["hero", "01", "02", "03"]);
    expect(HOME_SCROLL_CONDUCTOR_CONFIG).toEqual({
      hero: {
        end: "+=70%",
        enterEnd: 0.12,
        exitStart: 0.62,
        entryShare: 0,
      },
      "01": {
        end: "+=135%",
        enterEnd: 0.2,
        exitStart: 0.72,
        entryShare: 0.2,
      },
      "02": {
        end: "+=150%",
        enterEnd: 0.18,
        exitStart: 0.78,
        entryShare: 0.18,
      },
      "03": {
        end: "+=180%",
        enterEnd: 0.14,
        exitStart: 0.86,
        entryShare: 0.14,
      },
    });
  });

  it("resolves phase boundaries and phase-local progress", () => {
    expect(resolveHomeScrollState("01", 0.1)).toMatchObject({
      phase: "enter",
      phaseProgress: 0.5,
    });
    expect(resolveHomeScrollState("01", 0.2)).toMatchObject({
      phase: "read",
      phaseProgress: 0,
    });
    expect(resolveHomeScrollState("01", 0.46)).toMatchObject({
      phase: "read",
      phaseProgress: 0.5,
    });
    expect(resolveHomeScrollState("01", 0.72)).toMatchObject({
      phase: "exit",
      phaseProgress: 0,
    });
    expect(resolveHomeScrollState("01", 0.86)).toMatchObject({
      phase: "exit",
      phaseProgress: 0.5,
    });
  });

  it("returns chapter metadata and continuous global progress", () => {
    expect(resolveHomeScrollState("hero", 0.5)).toMatchObject({
      chapterIndex: 0,
      currentLabel: "00",
      globalProgress: 0.125,
      localProgress: 0.5,
    });
    expect(resolveHomeScrollState("02", 0.5)).toMatchObject({
      chapterIndex: 2,
      currentLabel: "02",
      globalProgress: 0.625,
      localProgress: 0.5,
    });
    expect(resolveHomeScrollState("03", 1)).toMatchObject({
      chapterIndex: 3,
      currentLabel: "03",
      globalProgress: 1,
      localProgress: 1,
    });
  });

  it("clamps finite progress and safely resets non-finite input", () => {
    expect(clampScrollProgress(-0.4)).toBe(0);
    expect(clampScrollProgress(1.4)).toBe(1);
    expect(clampScrollProgress(0.42)).toBe(0.42);
    expect(clampScrollProgress(Number.NaN)).toBe(0);
    expect(clampScrollProgress(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampScrollProgress(Number.NEGATIVE_INFINITY)).toBe(0);

    expect(resolveHomeScrollState("03", -2).localProgress).toBe(0);
    expect(resolveHomeScrollState("03", 2).localProgress).toBe(1);
    expect(resolveHomeScrollState("03", Number.NaN)).toMatchObject({
      globalProgress: 0.75,
      localProgress: 0,
      phase: "enter",
      phaseProgress: 0,
    });
  });
});
