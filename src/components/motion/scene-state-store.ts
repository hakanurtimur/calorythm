export type SceneState = {
  scene: 1 | 2 | 3;
  progress: number;
};

let state: SceneState = { scene: 1, progress: 0 };
const listeners = new Set<() => void>();

export function getSceneState(): SceneState {
  return state;
}

export function setSceneState(next: SceneState): void {
  const progress = Math.min(1, Math.max(0, next.progress));

  if (state.scene === next.scene && state.progress === progress) return;

  state = { scene: next.scene, progress };
  listeners.forEach((listener) => listener());
}

export function subscribeSceneState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
