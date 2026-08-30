export type RhythmRailPathInput = {
  baseX: number;
  height?: number;
  renderScaleX?: number;
  renderScaleY?: number;
  targetY: number;
  tipX: number;
};

export type RhythmRailTipLatticeInput = {
  anchor: number;
  baseXs: readonly number[];
  compression?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const finiteNumber = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback;

const formatCoordinate = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
};

export function buildRhythmRailTipLattice({
  anchor,
  baseXs,
  compression = 0.36,
}: RhythmRailTipLatticeInput) {
  const safeAnchor = finiteNumber(anchor, 0);
  const safeCompression = clamp(finiteNumber(compression, 0.36), 0.1, 0.8);
  const gaps = baseXs.slice(1).map((value, index) => (
    Math.abs(finiteNumber(value, 0) - finiteNumber(baseXs[index] ?? value, value))
  )).filter((gap) => gap > 0);
  const averageGap = gaps.length > 0
    ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    : 24;
  const tipGap = Math.max(1, Math.round(averageGap * safeCompression));

  return baseXs.map((_, index) => safeAnchor + index * tipGap);
}

/**
 * Builds the shared CALORYTHM rail shape. Rest and active paths always keep
 * the same four-cubic topology so GSAP can interpolate them without a jump.
 */
export function buildRhythmRailPath({
  baseX,
  height = 1000,
  renderScaleX = 1,
  renderScaleY = 1,
  targetY,
  tipX,
}: RhythmRailPathInput) {
  const x = finiteNumber(baseX, 0);
  const railHeight = Math.max(1, finiteNumber(height, 1000));
  const tip = finiteNumber(tipX, x);
  const displacement = tip - x;
  const distance = Math.abs(displacement);
  const direction = Math.sign(displacement);
  const halfSpan = Math.round(clamp(64 + distance * 0.06, 64, 78));
  const shoulder = Math.round(halfSpan * 0.72);
  const innerHandle = Math.round(halfSpan * 0.36);
  const safeScaleX = Math.max(0.001, Math.abs(finiteNumber(renderScaleX, 1)));
  const safeScaleY = Math.max(0.001, Math.abs(finiteNumber(renderScaleY, 1)));
  const aspectCompensation = clamp(safeScaleY / safeScaleX, 0.5, 4);
  const naturalCuspDepth = clamp(distance * 0.11, 10, 22);
  const maximumCuspDepth = Math.min(48, distance * 0.45);
  const cuspDepth = distance < 0.01
    ? 0
    : Math.round(clamp(
      naturalCuspDepth * aspectCompensation,
      Math.min(10, maximumCuspDepth),
      maximumCuspDepth,
    ));
  const cuspLift = distance < 0.01
    ? 0
    : Math.round(clamp(distance * 0.055, 5, 11));
  const y = clamp(
    finiteNumber(targetY, railHeight / 2),
    halfSpan + 10,
    railHeight - halfSpan - 10,
  );
  const approachX = tip - direction * cuspDepth;

  const point = (value: number) => formatCoordinate(value);

  return [
    `M ${point(x)} 0`,
    `C ${point(x)} ${point(y - halfSpan - 10)} ${point(x)} ${point(y - halfSpan)} ${point(x)} ${point(y - shoulder)}`,
    `C ${point(x)} ${point(y - innerHandle)} ${point(approachX)} ${point(y - cuspLift)} ${point(tip)} ${point(y)}`,
    `C ${point(approachX)} ${point(y + cuspLift)} ${point(x)} ${point(y + innerHandle)} ${point(x)} ${point(y + shoulder)}`,
    `C ${point(x)} ${point(y + halfSpan)} ${point(x)} ${point(y + halfSpan + 10)} ${point(x)} ${point(railHeight)}`,
  ].join(" ");
}
