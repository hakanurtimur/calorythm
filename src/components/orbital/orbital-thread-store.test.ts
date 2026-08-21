import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOrbitalThreadSnapshot,
  resetOrbitalThreadState,
  resolveOrbitalMode,
  setOrbitalBaseState,
  setOrbitalCtaState,
  setOrbitalPointer,
  subscribeOrbitalThreadState,
} from "./orbital-thread-store";

beforeEach(resetOrbitalThreadState);

describe("orbital thread store", () => {
  it("resolves CTA above scene, pointer, and idle states", () => {
    setOrbitalBaseState({ kind: "scene", id: "protein", progress: 0.6 });
    setOrbitalPointer({ x: 0.4, y: -0.2, strength: 0.8 });
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "scene",
      id: "protein",
      progress: 0.6,
    });

    setOrbitalCtaState({ active: true, anchorId: "hero-cta" });
    expect(resolveOrbitalMode(getOrbitalThreadSnapshot())).toEqual({
      kind: "cta",
      anchorId: "hero-cta",
    });
  });

  it("clamps scene progress and pointer strength", () => {
    setOrbitalBaseState({ kind: "scene", id: "energy", progress: 3 });
    setOrbitalPointer({ x: 1, y: 1, strength: -2 });
    expect(getOrbitalThreadSnapshot()).toMatchObject({
      base: { kind: "scene", id: "energy", progress: 1 },
      pointer: { strength: 0 },
    });
  });

  it("does not notify subscribers when the snapshot is unchanged", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeOrbitalThreadState(listener);
    setOrbitalCtaState({ active: false, anchorId: null });
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("notifies subscribers when reset changes state and suppresses stable resets", () => {
    setOrbitalBaseState({ kind: "hero" });
    const listener = vi.fn();
    const unsubscribe = subscribeOrbitalThreadState(listener);

    resetOrbitalThreadState();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getOrbitalThreadSnapshot().base).toEqual({ kind: "intro" });

    resetOrbitalThreadState();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("normalizes non-finite scene progress and pointer strength", () => {
    setOrbitalBaseState({ kind: "scene", id: "energy", progress: Number.NaN });
    setOrbitalPointer({ x: 0, y: 0, strength: Number.POSITIVE_INFINITY });

    expect(getOrbitalThreadSnapshot()).toMatchObject({
      base: { kind: "scene", id: "energy", progress: 0 },
      pointer: { strength: 0 },
    });
  });
});
