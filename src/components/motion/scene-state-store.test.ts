import { describe, expect, it, vi } from "vitest";
import { getSceneState, setSceneState, subscribeSceneState } from "./scene-state-store";

describe("scene state store", () => {
  it("publishes clamped scene progress only when state changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSceneState(listener);
    setSceneState({ scene: 2, progress: 1.4 });
    expect(getSceneState()).toEqual({ scene: 2, progress: 1 });
    expect(listener).toHaveBeenCalledOnce();

    setSceneState({ scene: 2, progress: 1 });
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
