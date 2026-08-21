export type OrbitalBaseState =
  | { kind: "intro" }
  | { kind: "hero" }
  | { kind: "scene"; id: string; progress: number };

export type OrbitalPointerState = { x: number; y: number; strength: number };
export type OrbitalCtaState = { active: boolean; anchorId: string | null };
export type OrbitalThreadSnapshot = {
  base: OrbitalBaseState;
  pointer: OrbitalPointerState;
  cta: OrbitalCtaState;
};

export type ResolvedOrbitalMode =
  | { kind: "intro" }
  | { kind: "hero" }
  | { kind: "pointer"; x: number; y: number; strength: number }
  | { kind: "cta"; anchorId: string }
  | { kind: "scene"; id: string; progress: number };

const initialSnapshot: OrbitalThreadSnapshot = {
  base: { kind: "intro" },
  pointer: { x: 0, y: 0, strength: 0 },
  cta: { active: false, anchorId: null },
};

let snapshot = initialSnapshot;
const listeners = new Set<() => void>();
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function getOrbitalThreadSnapshot() {
  return snapshot;
}

export function subscribeOrbitalThreadState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(next: OrbitalThreadSnapshot) {
  if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function setOrbitalBaseState(base: OrbitalBaseState) {
  publish({
    ...snapshot,
    base: base.kind === "scene" ? { ...base, progress: clamp01(base.progress) } : base,
  });
}

export function setOrbitalPointer(pointer: OrbitalPointerState) {
  publish({ ...snapshot, pointer: { ...pointer, strength: clamp01(pointer.strength) } });
}

export function setOrbitalCtaState(cta: OrbitalCtaState) {
  publish({ ...snapshot, cta });
}

export function resolveOrbitalMode(value: OrbitalThreadSnapshot): ResolvedOrbitalMode {
  if (value.cta.active && value.cta.anchorId) {
    return { kind: "cta", anchorId: value.cta.anchorId };
  }
  if (value.base.kind === "scene") return value.base;
  if (value.pointer.strength > 0) return { kind: "pointer", ...value.pointer };
  return value.base;
}

export function resetOrbitalThreadState() {
  snapshot = initialSnapshot;
}
