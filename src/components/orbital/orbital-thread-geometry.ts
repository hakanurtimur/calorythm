const STAGE_VIEWBOX_SIZE = 128;
const AUTHORED_GROUP_OFFSET = 8;
const AUTHORED_GROUP_SCALE = 1.12;
const CTA_LAYER_SPACING_PX = 2;
const SEMICIRCLE_CONTROL = 4 / 3;
const SVG_NUMBER = "[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][-+]?\\d+)?";
const SVG_POINT = `(${SVG_NUMBER})[\\s,]+(${SVG_NUMBER})`;
const SVG_CUBIC_SEGMENT = `\\s*C\\s*${SVG_POINT}[\\s,]+${SVG_POINT}[\\s,]+${SVG_POINT}`;
const CUBIC_LOOP_PATH = new RegExp(
  `^\\s*M\\s*${SVG_POINT}${SVG_CUBIC_SEGMENT.repeat(4)}\\s*Z\\s*$`,
);

export type RingPoint = {
  x: number;
  y: number;
};

export type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type CtaThreadGeometryInput = {
  ctaRect: RectLike;
  layerSpacingPx?: number;
  pathIndex: number;
  stageRect: RectLike;
};

export type EditorialSignalGeometryInput = {
  elapsedMs: number;
  layerIndex: number;
  layerSpacing: number;
  noiseAmplitude: number;
  progress: number;
  radiusX: number;
  radiusY: number;
  settledWaveAmplitude: number;
  waveLobes: number;
  waveSpeed: number;
  pointerBoost?: number;
  pointerStrength?: number;
  pointerX?: number;
  pointerY?: number;
};

export type EditorialProofGeometryInput = {
  layerIndex: number;
  layerSpacing: number;
  progress: number;
  routeDepth: number;
};

/**
 * Selects the point nearest the CTA-facing portion of a loop. Points farther
 * around the closed path receive progressively more delay during a morph.
 */
export type ProgressiveGeometryInput = {
  leadingPointIndex: number;
  trailingLag?: number;
};

function clampUnit(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = clampUnit((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return amount * amount * (3 - 2 * amount);
}

function formatCoordinate(value: number) {
  return `${Number(value.toFixed(2))}`;
}

function pointAt(points: RingPoint[], index: number) {
  const point = points[index];
  if (!point) throw new Error("A four-cubic loop requires 13 points.");
  return `${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`;
}

function mapToStage(coordinate: number, stageStart: number, stageSize: number) {
  if (
    !Number.isFinite(coordinate) ||
    !Number.isFinite(stageStart) ||
    !Number.isFinite(stageSize) ||
    stageSize <= 0
  ) {
    return STAGE_VIEWBOX_SIZE / 2;
  }

  return ((coordinate - stageStart) / stageSize) * STAGE_VIEWBOX_SIZE;
}

function toAuthoredLocal(viewBoxCoordinate: number) {
  return (viewBoxCoordinate - AUTHORED_GROUP_OFFSET) / AUTHORED_GROUP_SCALE;
}

function circularPointDistance(index: number, leadingPointIndex: number, pointCount: number) {
  const seamLength = Math.max(1, pointCount - 1);
  const normalizedIndex = index === seamLength ? 0 : index % seamLength;
  const normalizedLeader = ((leadingPointIndex % seamLength) + seamLength) % seamLength;
  const forwardDistance = Math.abs(normalizedIndex - normalizedLeader);

  return Math.min(forwardDistance, seamLength - forwardDistance);
}

export function parseCubicLoopPath(d: string): RingPoint[] {
  const match = CUBIC_LOOP_PATH.exec(d);
  const values = match?.slice(1).map(Number) ?? [];
  if (values.length !== 26 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("Expected an SVG loop with one move and four cubic segments.");
  }

  return Array.from({ length: 13 }, (_, index) => ({
    x: values[index * 2]!,
    y: values[index * 2 + 1]!,
  }));
}

export function serializeCubicPath(points: RingPoint[], { closed }: { closed: boolean }) {
  const path = `M${pointAt(points, 0)}C${pointAt(points, 1)} ${pointAt(points, 2)} ${pointAt(points, 3)}C${pointAt(points, 4)} ${pointAt(points, 5)} ${pointAt(points, 6)}C${pointAt(points, 7)} ${pointAt(points, 8)} ${pointAt(points, 9)}C${pointAt(points, 10)} ${pointAt(points, 11)} ${pointAt(points, 12)}`;
  return closed ? `${path}Z` : path;
}

export function serializeCubicLoopPath(points: RingPoint[]) {
  return serializeCubicPath(points, { closed: true });
}

export function interpolateGeometry(from: RingPoint[], to: RingPoint[], progress: number) {
  const amount = clampUnit(progress);
  if (amount === 0) return from;
  if (amount === 1) return to;

  return from.map((point, index) => ({
    x: point.x + ((to[index]?.x ?? point.x) - point.x) * amount,
    y: point.y + ((to[index]?.y ?? point.y) - point.y) * amount,
  }));
}

/**
 * Stretches the authored CALORYTHM loop into a wide editorial signal. The
 * source and target retain the same four-cubic topology, so the one persistent
 * SVG can move between hero and scene states without cloning or crossfading.
 */
export function createEditorialSignalGeometry(
  source: RingPoint[],
  {
    elapsedMs,
    layerIndex,
    layerSpacing,
    noiseAmplitude,
    progress,
    radiusX,
    radiusY,
    settledWaveAmplitude,
    waveLobes,
    waveSpeed,
    pointerBoost = 0,
    pointerStrength = 0,
    pointerX = 0,
    pointerY = 0,
  }: EditorialSignalGeometryInput,
) {
  const sceneProgress = clampUnit(progress);
  if (sceneProgress === 0) return source;

  const morphProgress = smoothstep(0.04, 0.42, sceneProgress);
  const straightenProgress = smoothstep(0.18, 0.42, sceneProgress);
  const noiseProgress = smoothstep(0.16, 0.5, sceneProgress) *
    (1 - smoothstep(0.68, 0.96, sceneProgress));
  const safeLayerIndex = Number.isFinite(layerIndex) ? Math.max(0, layerIndex) : 0;
  const safeLayerSpacing = Number.isFinite(layerSpacing) ? Math.max(0, layerSpacing) : 0;
  const centerX = 50;
  const centerY = 50 + (safeLayerIndex - 1.5) * safeLayerSpacing;
  const safeRadiusX = Number.isFinite(radiusX) ? Math.max(1, radiusX) : 70;
  const safeRadiusY = Number.isFinite(radiusY) ? Math.max(1, radiusY) : 9;
  const activeRadiusY = safeRadiusY * (1 - straightenProgress);
  const horizontalControl = safeRadiusX * 0.56;
  const verticalControl = activeRadiusY * 0.64;
  const target: RingPoint[] = [
    { x: centerX, y: centerY - activeRadiusY },
    { x: centerX + horizontalControl, y: centerY - activeRadiusY },
    { x: centerX + safeRadiusX, y: centerY - verticalControl },
    { x: centerX + safeRadiusX, y: centerY },
    { x: centerX + safeRadiusX, y: centerY + verticalControl },
    { x: centerX + horizontalControl, y: centerY + activeRadiusY },
    { x: centerX, y: centerY + activeRadiusY },
    { x: centerX - horizontalControl, y: centerY + activeRadiusY },
    { x: centerX - safeRadiusX, y: centerY + verticalControl },
    { x: centerX - safeRadiusX, y: centerY },
    { x: centerX - safeRadiusX, y: centerY - verticalControl },
    { x: centerX - horizontalControl, y: centerY - activeRadiusY },
    { x: centerX, y: centerY - activeRadiusY },
  ];
  const phase = (Number.isFinite(elapsedMs) ? elapsedMs : 0) * waveSpeed +
    safeLayerIndex * 0.74;
  const amplitude =
    (Math.max(0, settledWaveAmplitude) + Math.max(0, noiseAmplitude) * noiseProgress) *
    (1 - straightenProgress);
  const uniqueCount = target.length - 1;
  const pointerAnchorX = centerX + Math.max(-1, Math.min(1, pointerX)) * safeRadiusX;
  const pointerAnchorY = centerY + Math.max(-1, Math.min(1, pointerY)) * safeRadiusY;
  const breathingTarget = target.map((point, index) => {
    const seamIndex = index === uniqueCount ? 0 : index;
    const perimeter = (seamIndex / uniqueCount) * Math.PI * 2;
    const primary = Math.sin(phase + perimeter * waveLobes) * amplitude;
    const detail = Math.sin(phase * 1.47 - perimeter * (waveLobes + 1.35)) *
      amplitude * 0.24;
    const pointerDistanceX = (point.x - pointerAnchorX) / Math.max(1, safeRadiusX * 0.46);
    const pointerDistanceY = (point.y - pointerAnchorY) / Math.max(1, safeRadiusY * 3.4);
    const pointerInfluence = Math.exp(
      -(pointerDistanceX * pointerDistanceX + pointerDistanceY * pointerDistanceY),
    );
    const pointerWave =
      Math.sin(phase * 1.8 + perimeter * (waveLobes + 0.7)) *
      Math.max(0, pointerStrength) *
      Math.max(0, pointerBoost) *
      pointerInfluence *
      Math.max(1, noiseAmplitude * 0.55) *
      (1 - straightenProgress);

    return {
      x: point.x + Math.cos(perimeter) * (primary + detail + pointerWave) * 0.08,
      y: point.y + primary + detail + pointerWave,
    };
  });
  breathingTarget[uniqueCount] = { ...breathingTarget[0]! };

  return interpolateGeometry(source, breathingTarget, morphProgress);
}

/**
 * Opens the flat Scene 01 signal into one continuous editorial proof route.
 * Its four cubic stops align with Source, Context and Narrative without
 * introducing another SVG or crossfading the persistent brand threads.
 */
export function createEditorialProofGeometry(
  source: RingPoint[],
  {
    layerIndex,
    layerSpacing,
    progress,
    routeDepth,
  }: EditorialProofGeometryInput,
) {
  const amount = smoothstep(0.06, 0.86, progress);
  if (amount === 0) return source;

  const safeLayerIndex = Number.isFinite(layerIndex) ? Math.max(0, layerIndex) : 0;
  const safeLayerSpacing = Number.isFinite(layerSpacing) ? Math.max(0, layerSpacing) : 0;
  const safeRouteDepth = Number.isFinite(routeDepth) ? Math.max(0, routeDepth) : 20;
  const centerY = 50 + safeLayerIndex * safeLayerSpacing;
  const target: RingPoint[] = [
    { x: -12, y: centerY },
    { x: 0, y: centerY },
    { x: 14, y: centerY },
    { x: 27, y: centerY },
    { x: 35, y: centerY },
    { x: 42, y: centerY - safeRouteDepth },
    { x: 50, y: centerY - safeRouteDepth },
    { x: 59, y: centerY - safeRouteDepth },
    { x: 66, y: centerY + safeRouteDepth },
    { x: 74, y: centerY + safeRouteDepth },
    { x: 86, y: centerY + safeRouteDepth },
    { x: 100, y: centerY },
    { x: 112, y: centerY },
  ];

  return interpolateGeometry(source, target, amount);
}

/**
 * Morphs a closed loop with an explicit leading point, so its CTA-facing arc
 * moves ahead of the opposite arc without changing the exact start/end shapes.
 */
export function interpolateProgressiveGeometry(
  from: RingPoint[],
  to: RingPoint[],
  progress: number,
  { leadingPointIndex, trailingLag = 0.36 }: ProgressiveGeometryInput,
) {
  const amount = clampUnit(progress);
  if (amount === 0) return from;
  if (amount === 1) return to;

  const maximumDistance = Math.max(1, Math.floor((from.length - 1) / 2));
  const lag = Math.min(0.95, Math.max(0, trailingLag));

  return from.map((point, index) => {
    const distance = circularPointDistance(index, leadingPointIndex, from.length);
    const delay = (distance / maximumDistance) * lag;
    const localProgress = clampUnit((amount - delay) / (1 - delay));
    const target = to[index] ?? point;

    return {
      x: point.x + (target.x - point.x) * localProgress,
      y: point.y + (target.y - point.y) * localProgress,
    };
  });
}

export function createCtaThreadGeometry({
  ctaRect,
  layerSpacingPx = CTA_LAYER_SPACING_PX,
  pathIndex,
  stageRect,
}: CtaThreadGeometryInput): RingPoint[] {
  const safePathIndex = Number.isFinite(pathIndex) ? Math.max(0, pathIndex) : 0;
  const safeLayerSpacing = Number.isFinite(layerSpacingPx) ? Math.max(0, layerSpacingPx) : 0;
  const layerOffset = safePathIndex * safeLayerSpacing;
  const left = toAuthoredLocal(
    mapToStage(ctaRect.left - layerOffset, stageRect.left, stageRect.width),
  );
  const right = toAuthoredLocal(
    mapToStage(
      ctaRect.left + ctaRect.width + layerOffset,
      stageRect.left,
      stageRect.width,
    ),
  );
  const top = toAuthoredLocal(
    mapToStage(ctaRect.top - layerOffset, stageRect.top, stageRect.height),
  );
  const bottom = toAuthoredLocal(
    mapToStage(
      ctaRect.top + ctaRect.height + layerOffset,
      stageRect.top,
      stageRect.height,
    ),
  );
  const centerX = (left + right) / 2;
  const radiusX = Math.max(0, Math.abs(right - left) / 2);
  const radiusY = Math.max(0, Math.abs(bottom - top) / 2);
  const cornerRadius = Math.min(radiusX, radiusY);
  const straightHalf = Math.max(0, radiusX - cornerRadius);
  const topLeft = centerX - straightHalf;
  const topRight = centerX + straightHalf;
  const straightThird = (topRight - topLeft) / 3;
  const capControl = cornerRadius * SEMICIRCLE_CONTROL;

  return [
    { x: topLeft, y: top },
    { x: topLeft + straightThird, y: top },
    { x: topRight - straightThird, y: top },
    { x: topRight, y: top },
    { x: topRight + capControl, y: top },
    { x: topRight + capControl, y: bottom },
    { x: topRight, y: bottom },
    { x: topRight - straightThird, y: bottom },
    { x: topLeft + straightThird, y: bottom },
    { x: topLeft, y: bottom },
    { x: topLeft - capControl, y: bottom },
    { x: topLeft - capControl, y: top },
    { x: topLeft, y: top },
  ];
}

export function computeThreadDash(progress: number, pathIndex: number) {
  const amount = clampUnit(progress);
  if (amount === 0 || amount === 1) {
    return { dasharray: "1 0", dashoffset: 0 };
  }

  const safePathIndex = Number.isFinite(pathIndex) ? Math.max(0, pathIndex) : 0;
  const gap = Math.sin(amount * Math.PI) * (0.2 + safePathIndex * 0.025);

  return {
    dasharray:
      gap <= 0.0001
        ? "1 0"
        : `${Number((1 - gap).toFixed(3))} ${Number(gap.toFixed(3))}`,
    dashoffset: Number((amount * (0.18 + safePathIndex * 0.035)).toFixed(3)),
  };
}
