export const HOME_SCROLL_SCENE_IDS = ["hero", "01", "02", "03"] as const;

export type HomeScrollSceneId = (typeof HOME_SCROLL_SCENE_IDS)[number];
export type HomeScrollPhase = "enter" | "read" | "exit";

type HomeScrollSceneConfig = Readonly<{
  end: `+=${number}%`;
  enterEnd: number;
  exitStart: number;
  entryShare: number;
}>;

export const HOME_SCROLL_CONDUCTOR_CONFIG = {
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
} as const satisfies Record<HomeScrollSceneId, HomeScrollSceneConfig>;

export type HomeScrollState = Readonly<{
  sceneId: HomeScrollSceneId;
  chapterIndex: number;
  currentLabel: "00" | "01" | "02" | "03";
  localProgress: number;
  globalProgress: number;
  phase: HomeScrollPhase;
  phaseProgress: number;
}>;

export function clampScrollProgress(value: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.min(1, Math.max(0, value));
}

export function resolveHomeScrollState(
  sceneId: HomeScrollSceneId,
  progress: number,
): HomeScrollState {
  const localProgress = clampScrollProgress(progress);
  const chapterIndex = HOME_SCROLL_SCENE_IDS.indexOf(sceneId);
  const config = HOME_SCROLL_CONDUCTOR_CONFIG[sceneId];

  let phase: HomeScrollPhase;
  let phaseProgress: number;

  if (localProgress < config.enterEnd) {
    phase = "enter";
    phaseProgress = localProgress / config.enterEnd;
  } else if (localProgress < config.exitStart) {
    phase = "read";
    phaseProgress =
      (localProgress - config.enterEnd) / (config.exitStart - config.enterEnd);
  } else {
    phase = "exit";
    phaseProgress = (localProgress - config.exitStart) / (1 - config.exitStart);
  }

  return {
    sceneId,
    chapterIndex,
    currentLabel: String(chapterIndex).padStart(2, "0") as HomeScrollState["currentLabel"],
    localProgress,
    globalProgress: (chapterIndex + localProgress) / HOME_SCROLL_SCENE_IDS.length,
    phase,
    phaseProgress: clampScrollProgress(phaseProgress),
  };
}
