const KAPPA = 0.5522847498;
const STAGE_VIEWBOX_SIZE = 128;
const AUTHORED_GROUP_OFFSET = 8;
const AUTHORED_GROUP_SCALE = 1.12;
const CTA_SEGMENT_LENGTH = 0.21;
const CTA_SEGMENT_SLOT = 0.25;
const CTA_SEGMENT_SETTLE_START = 0.62;
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
  pathIndex: number;
  stageRect: RectLike;
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

function smoothstep(value: number) {
  const amount = clampUnit(value);
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

export function serializeCubicLoopPath(points: RingPoint[]) {
  return `M${pointAt(points, 0)}C${pointAt(points, 1)} ${pointAt(points, 2)} ${pointAt(points, 3)}C${pointAt(points, 4)} ${pointAt(points, 5)} ${pointAt(points, 6)}C${pointAt(points, 7)} ${pointAt(points, 8)} ${pointAt(points, 9)}C${pointAt(points, 10)} ${pointAt(points, 11)} ${pointAt(points, 12)}Z`;
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
  stageRect,
}: CtaThreadGeometryInput): RingPoint[] {
  const left = toAuthoredLocal(mapToStage(ctaRect.left, stageRect.left, stageRect.width));
  const right = toAuthoredLocal(
    mapToStage(ctaRect.left + ctaRect.width, stageRect.left, stageRect.width),
  );
  const top = toAuthoredLocal(mapToStage(ctaRect.top, stageRect.top, stageRect.height));
  const bottom = toAuthoredLocal(
    mapToStage(ctaRect.top + ctaRect.height, stageRect.top, stageRect.height),
  );
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const radiusX = Math.max(0, Math.abs(right - left) / 2);
  const radiusY = Math.max(0, Math.abs(bottom - top) / 2);
  const controlX = radiusX * KAPPA;
  const controlY = radiusY * KAPPA;

  return [
    { x: centerX, y: centerY - radiusY },
    { x: centerX + controlX, y: centerY - radiusY },
    { x: centerX + radiusX, y: centerY - controlY },
    { x: centerX + radiusX, y: centerY },
    { x: centerX + radiusX, y: centerY + controlY },
    { x: centerX + controlX, y: centerY + radiusY },
    { x: centerX, y: centerY + radiusY },
    { x: centerX - controlX, y: centerY + radiusY },
    { x: centerX - radiusX, y: centerY + controlY },
    { x: centerX - radiusX, y: centerY },
    { x: centerX - radiusX, y: centerY - controlY },
    { x: centerX - controlX, y: centerY - radiusY },
    { x: centerX, y: centerY - radiusY },
  ];
}

export function computeThreadDash(progress: number, pathIndex: number) {
  const amount = clampUnit(progress);
  if (amount === 0) {
    return { dasharray: "1 0", dashoffset: 0 };
  }

  const safePathIndex = Number.isFinite(pathIndex) ? Math.max(0, pathIndex) : 0;
  const travellingGap = Math.sin(amount * Math.PI) * (0.2 + safePathIndex * 0.025);
  const travellingLength = 1 - travellingGap;
  const travellingOffset = amount * (0.18 + safePathIndex * 0.035);
  const settleProgress = smoothstep(
    (amount - CTA_SEGMENT_SETTLE_START) / (1 - CTA_SEGMENT_SETTLE_START),
  );
  const segmentLength =
    travellingLength + (CTA_SEGMENT_LENGTH - travellingLength) * settleProgress;
  const segmentGap = 1 - segmentLength;
  const terminalOffset = -safePathIndex * CTA_SEGMENT_SLOT;
  const dashoffset = travellingOffset + (terminalOffset - travellingOffset) * settleProgress;

  return {
    dasharray: `${Number(segmentLength.toFixed(3))} ${Number(segmentGap.toFixed(3))}`,
    dashoffset: Number(dashoffset.toFixed(3)),
  };
}
