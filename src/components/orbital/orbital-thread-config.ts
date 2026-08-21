export type OrbitalThreadConfig = {
  cta: {
    fillStart: number;
    inhaleExpansion: number;
    inhaleStrokeWidth: number;
    layerSpacingPx: number;
    pathLags: readonly number[];
    primaryWaveAmplitude: number;
    primaryWaveSpeed: number;
    response: number;
    restStrokeWidth: number;
    secondaryWaveAmplitude: number;
    secondaryWaveSpeedRatio: number;
  };
  glow: {
    blur: number;
    opacity: number;
    regionPadding: number;
  };
  hero: {
    breathCycleMs: number;
    entryStrokeWidth: number;
    entranceMs: number;
    inhaleExpansion: number;
    inhaleStrokeWidth: number;
    primaryWaveAmplitude: number;
    primaryWaveSpeed: number;
    revealDurationMs: number;
    revealStaggerMs: number;
    restStrokeWidth: number;
    secondaryWaveAmplitude: number;
    secondaryWaveSpeed: number;
  };
  pointer: {
    anchorRadius: number;
    intensity: number;
    threads: readonly {
      amplitude: number;
      phase: number;
      response: number;
    }[];
  };
};

export type OrbitalThreadConfigPatch = {
  [Section in keyof OrbitalThreadConfig]?: Partial<OrbitalThreadConfig[Section]>;
};

export const orbitalThreadDefaults: OrbitalThreadConfig = {
  hero: {
    breathCycleMs: 4200,
    entryStrokeWidth: 0.95,
    entranceMs: 800,
    inhaleExpansion: 0.16,
    inhaleStrokeWidth: 20,
    primaryWaveAmplitude: 0.34,
    primaryWaveSpeed: 0.00105,
    revealDurationMs: 900,
    revealStaggerMs: 40,
    restStrokeWidth: 12,
    secondaryWaveAmplitude: 0.09,
    secondaryWaveSpeed: 0.00172,
  },
  cta: {
    fillStart: 0.45,
    inhaleExpansion: 0.07,
    inhaleStrokeWidth: 2.2,
    layerSpacingPx: 2,
    pathLags: [1, 0.92, 0.84, 0.76],
    primaryWaveAmplitude: 0.24,
    primaryWaveSpeed: 0.00118,
    response: 10,
    restStrokeWidth: 1.55,
    secondaryWaveAmplitude: 0.08,
    secondaryWaveSpeedRatio: 0.72,
  },
  glow: {
    blur: 0.8,
    opacity: 0.46,
    regionPadding: 24,
  },
  pointer: {
    anchorRadius: 61,
    intensity: 1,
    threads: [
      { amplitude: 5.2, phase: 0.2, response: 8.2 },
      { amplitude: 4.6, phase: 1.6, response: 6.8 },
      { amplitude: 4, phase: 3.1, response: 5.6 },
      { amplitude: 3.5, phase: 4.7, response: 4.7 },
    ],
  },
};

const listeners = new Set<() => void>();
let currentConfig = orbitalThreadDefaults;

export function getOrbitalThreadConfig() {
  return currentConfig;
}

export function subscribeOrbitalThreadConfig(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setOrbitalThreadConfig(patch: OrbitalThreadConfigPatch) {
  currentConfig = {
    hero: { ...currentConfig.hero, ...patch.hero },
    cta: { ...currentConfig.cta, ...patch.cta },
    glow: { ...currentConfig.glow, ...patch.glow },
    pointer: { ...currentConfig.pointer, ...patch.pointer },
  };
  listeners.forEach((listener) => listener());
}

export function resetOrbitalThreadConfig() {
  currentConfig = orbitalThreadDefaults;
  listeners.forEach((listener) => listener());
}
