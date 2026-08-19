import { describe, expect, it } from "vitest";
import { readMotionProfile } from "./motion-profile";

describe("readMotionProfile", () => {
  it.each([
    { reducedMotion: true, saveData: false, width: 1440 },
    { reducedMotion: false, saveData: true, width: 1440 },
  ])("disables animation and pinning for constrained motion", (environment) => {
    expect(readMotionProfile(() => environment)).toEqual({ animate: false, pin: false });
  });

  it("enables animation and pinning by default on desktop", () => {
    expect(readMotionProfile(() => ({ reducedMotion: false, saveData: false, width: 1440 }))).toEqual({
      animate: true,
      pin: true,
    });
  });

  it("keeps animation without pinning on mobile", () => {
    expect(readMotionProfile(() => ({ reducedMotion: false, saveData: false, width: 640 }))).toEqual({
      animate: true,
      pin: false,
    });
  });
});
