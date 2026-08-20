import { describe, expect, it } from "vitest";
import { readMotionProfile } from "./motion-profile";

describe("readMotionProfile", () => {
  it.each([
    { reducedMotion: true, saveData: false, width: 1440, height: 900 },
    { reducedMotion: false, saveData: true, width: 1440, height: 900 },
  ])("disables animation and pinning for constrained motion", (environment) => {
    expect(readMotionProfile(() => environment)).toEqual({
      animate: false,
      pin: false,
      splashDuration: 0,
    });
  });

  it("enables animation and pinning by default on desktop", () => {
    expect(
      readMotionProfile(() => ({
        reducedMotion: false,
        saveData: false,
        width: 1440,
        height: 900,
      })),
    ).toEqual({ animate: true, pin: true, splashDuration: 1750 });
  });

  it("keeps animation without pinning on mobile", () => {
    expect(
      readMotionProfile(() => ({
        reducedMotion: false,
        saveData: false,
        width: 640,
        height: 844,
      })),
    ).toEqual({ animate: true, pin: false, splashDuration: 900 });
  });

  it.each([
    { height: 900, pin: false, width: 767 },
    { height: 699, pin: false, width: 768 },
    { height: 700, pin: true, width: 768 },
  ])("pins only when the viewport can hold a complete scene", ({ height, pin, width }) => {
    expect(
      readMotionProfile(() => ({ reducedMotion: false, saveData: false, width, height })),
    ).toEqual({ animate: true, pin, splashDuration: width < 768 ? 900 : 1750 });
  });
});
