import { buildRhythmRailPath } from "@/lib/rhythm-rail-geometry";

export const JOURNAL_LINE_VIEWBOX_HEIGHT = 1000;

const JOURNAL_TARGET_MIN = 120;
const JOURNAL_TARGET_MAX = 880;

const finiteNumber = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback;

export function buildJournalLinePath({
  baseX,
  targetY,
  tipX,
}: {
  baseX: number;
  targetY: number;
  tipX: number;
}) {
  return buildRhythmRailPath({
    baseX,
    height: JOURNAL_LINE_VIEWBOX_HEIGHT,
    targetY,
    tipX,
  });
}

export function mapJournalRowCenterToViewBox({
  fieldHeight,
  fieldTop,
  rowHeight,
  rowTop,
}: {
  fieldHeight: number;
  fieldTop: number;
  rowHeight: number;
  rowTop: number;
}) {
  if (!Number.isFinite(fieldHeight) || fieldHeight <= 0) {
    return JOURNAL_LINE_VIEWBOX_HEIGHT / 2;
  }

  const rowCenter = finiteNumber(rowTop, fieldTop) + finiteNumber(rowHeight, 0) / 2;
  const progress = (rowCenter - finiteNumber(fieldTop, 0)) / fieldHeight;
  const mapped = progress * JOURNAL_LINE_VIEWBOX_HEIGHT;

  return Math.round(Math.min(JOURNAL_TARGET_MAX, Math.max(JOURNAL_TARGET_MIN, mapped)));
}
