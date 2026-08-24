export const CALORYTHM_COVER_VIEWBOX = {
  height: 941,
  width: 1672,
} as const;

const BAND_X_POSITIONS = [
  -168, 74, 322, 574, 828, 1086, 1344, 1596, 1840,
] as const;

const NEUTRAL_CONDUCTOR_FRAME = 1 as const;
const BEAT_ENTRY_END = 0.32;
const BEAT_EXIT_START = 0.68;

export type CalorythmCoverPoint = Readonly<{
  x: number;
  y: number;
}>;

export type CalorythmCoverBand = Readonly<{
  d: string;
  index: number;
  points: readonly CalorythmCoverPoint[];
  strokeWidth: number;
}>;

export type CalorythmCoverChapter = "cover" | "editorial" | "journal";
export type CalorythmConductorFrame = 0 | 1 | 2;

export type CalorythmCoverMotion = Readonly<{
  activeChapter: CalorythmCoverChapter;
  conductor: Readonly<{
    dominantFrame: CalorythmConductorFrame;
    frameWeights: readonly [number, number, number];
    fromFrame: CalorythmConductorFrame;
    handoffEnergy: number;
    mix: number;
    toFrame: CalorythmConductorFrame;
  }>;
  copyWeights: Readonly<Record<CalorythmCoverChapter, number>>;
  progress: number;
  transitions: Readonly<{
    coverToEditorial: number;
    editorialToJournal: number;
  }>;
}>;

export function clampCalorythmCoverProgress(value: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.min(1, Math.max(0, value));
}

function smoothstep(from: number, to: number, value: number) {
  const progress = clampCalorythmCoverProgress((value - from) / (to - from));

  return progress * progress * (3 - 2 * progress);
}

function formatPathNumber(value: number) {
  const rounded = Number(value.toFixed(2));

  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function toCubicPath(points: readonly CalorythmCoverPoint[]) {
  const first = points[0]!;
  let path = `M ${formatPathNumber(first.x)} ${formatPathNumber(first.y)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]!;
    const next = points[index + 1]!;
    const previous = points[index - 1] ?? current;
    const following = points[index + 2] ?? next;
    const controlA = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlB = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    };

    path += [
      " C",
      formatPathNumber(controlA.x),
      formatPathNumber(controlA.y),
      formatPathNumber(controlB.x),
      formatPathNumber(controlB.y),
      formatPathNumber(next.x),
      formatPathNumber(next.y),
    ].join(" ");
  }

  return path;
}

export function resolveCalorythmCoverBands(): readonly CalorythmCoverBand[] {
  const span = BAND_X_POSITIONS.at(-1)! - BAND_X_POSITIONS[0];
  const spacing = 42;
  const sharedAmplitude = 25;
  const secondaryAmplitude = 8;
  const sharedPhase = Math.PI * 0.12;

  return Array.from({ length: 4 }, (_, index) => {
    const points = BAND_X_POSITIONS.map((x) => {
      const position = (x - BAND_X_POSITIONS[0]) / span;
      const sharedWave =
        Math.sin(position * Math.PI * 2.15 + sharedPhase) * sharedAmplitude +
        Math.sin(
          position * Math.PI * 4.2 - sharedPhase * 0.42 + Math.PI * 0.18,
        ) * secondaryAmplitude;
      const individualWave =
        Math.sin(
          position * Math.PI * 3.1 + index * 0.74,
        ) * 3;

      return {
        x,
        y: 432 + index * spacing + sharedWave + individualWave,
      };
    });

    return {
      d: toCubicPath(points),
      index,
      points,
      strokeWidth: 22.5,
    };
  });
}

function resolveFrameHandoff(
  fromFrame: CalorythmConductorFrame,
  toFrame: CalorythmConductorFrame,
  rawMix: number,
) {
  const mix = fromFrame === toFrame ? 0 : clampCalorythmCoverProgress(rawMix);
  const frameWeights: [number, number, number] = [0, 0, 0];

  if (fromFrame === toFrame) {
    frameWeights[fromFrame] = 1;
  } else {
    frameWeights[fromFrame] = 1 - mix;
    frameWeights[toFrame] = mix;
  }

  return {
    dominantFrame: (mix < 0.5 ? fromFrame : toFrame) as CalorythmConductorFrame,
    frameWeights,
    fromFrame,
    handoffEnergy:
      fromFrame === toFrame
        ? 0
        : smoothstep(0, 1, 1 - Math.abs(mix * 2 - 1)),
    mix,
    toFrame,
  };
}

function resolveConductorBeat(
  transitionProgress: number,
  accentFrame: Exclude<CalorythmConductorFrame, 1>,
) {
  if (transitionProgress <= 0 || transitionProgress >= 1) {
    return resolveFrameHandoff(
      NEUTRAL_CONDUCTOR_FRAME,
      NEUTRAL_CONDUCTOR_FRAME,
      0,
    );
  }

  if (transitionProgress < BEAT_ENTRY_END) {
    return resolveFrameHandoff(
      NEUTRAL_CONDUCTOR_FRAME,
      accentFrame,
      smoothstep(0, BEAT_ENTRY_END, transitionProgress),
    );
  }

  if (transitionProgress <= BEAT_EXIT_START) {
    return resolveFrameHandoff(accentFrame, accentFrame, 0);
  }

  return resolveFrameHandoff(
    accentFrame,
    NEUTRAL_CONDUCTOR_FRAME,
    smoothstep(BEAT_EXIT_START, 1, transitionProgress),
  );
}

function resolveCopySwap(transitionProgress: number) {
  if (transitionProgress <= BEAT_ENTRY_END) {
    return {
      incoming: 0,
      outgoing: 1 - smoothstep(0, BEAT_ENTRY_END, transitionProgress),
    };
  }

  if (transitionProgress < BEAT_EXIT_START) {
    return { incoming: 0, outgoing: 0 };
  }

  return {
    incoming: smoothstep(BEAT_EXIT_START, 1, transitionProgress),
    outgoing: 0,
  };
}

function resolveConductorPose(
  coverToEditorial: number,
  editorialToJournal: number,
) {
  if (editorialToJournal > 0 && editorialToJournal < 1) {
    return resolveConductorBeat(editorialToJournal, 2);
  }

  if (coverToEditorial > 0 && coverToEditorial < 1) {
    return resolveConductorBeat(coverToEditorial, 0);
  }

  return resolveFrameHandoff(
    NEUTRAL_CONDUCTOR_FRAME,
    NEUTRAL_CONDUCTOR_FRAME,
    0,
  );
}

export function resolveCalorythmCoverMotion(
  rawProgress: number,
): CalorythmCoverMotion {
  const progress = clampCalorythmCoverProgress(rawProgress);
  const coverToEditorial = smoothstep(0.2, 0.45, progress);
  const editorialToJournal = smoothstep(0.62, 0.88, progress);
  const coverSwap = resolveCopySwap(coverToEditorial);
  const journalSwap = resolveCopySwap(editorialToJournal);
  const copyWeights = {
    cover: coverSwap.outgoing,
    editorial: coverSwap.incoming * journalSwap.outgoing,
    journal: journalSwap.incoming,
  };
  const chapterWeights = {
    cover: 1 - coverToEditorial,
    editorial: coverToEditorial * (1 - editorialToJournal),
    journal: editorialToJournal,
  };
  const activeChapter = (
    Object.entries(chapterWeights) as [CalorythmCoverChapter, number][]
  ).reduce<CalorythmCoverChapter>(
    (active, [chapter, weight]) =>
      weight > chapterWeights[active] ? chapter : active,
    "cover",
  );

  return {
    activeChapter,
    conductor: resolveConductorPose(coverToEditorial, editorialToJournal),
    copyWeights,
    progress,
    transitions: {
      coverToEditorial,
      editorialToJournal,
    },
  };
}
