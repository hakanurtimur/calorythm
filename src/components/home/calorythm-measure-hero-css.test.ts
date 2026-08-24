import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const heroStyles = readFileSync(
  resolve(
    process.cwd(),
    "src/components/home/calorythm-measure-hero.module.css",
  ),
  "utf8",
);

function rule(selector: string) {
  const selectorIndex = heroStyles.indexOf(selector);
  expect(selectorIndex, `missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const openingBrace = heroStyles.indexOf("{", selectorIndex);
  const closingBrace = heroStyles.indexOf("}", openingBrace);

  return heroStyles
    .slice(openingBrace + 1, closingBrace)
    .replace(/\s+/g, " ")
    .trim();
}

describe("CalorythmMeasureHero skeleton layers", () => {
  it("keeps inactive conducting poses transparent", () => {
    const poseRule = rule(
      ".conductorFrame,\n.conductorForegroundFrame,\n.conductorSkeletonFrame",
    );

    expect(poseRule).toContain("opacity: 0");
    expect(poseRule).not.toContain("transition:");
    expect(poseRule).not.toContain("will-change:");
    expect(rule(".skeletonOverlay")).not.toContain("opacity:");
    expect(heroStyles).not.toMatch(
      /data-conductor-(?:from|to)[^\{]*\{[^\}]*clip-path:/,
    );
    expect(rule(".figureLayer")).toContain(
      "filter: blur(calc(var(--conductor-energy) * 1.6px))",
    );
    expect(rule(".figureLayer")).toContain("transform-box: view-box");
  });

  it("does not interpolate cursor coordinates behind the pointer", () => {
    const cursorRule = rule(".editorialCursor");

    expect(cursorRule).not.toContain("left 70ms");
    expect(cursorRule).not.toContain("top 70ms");
    expect(cursorRule).toContain(
      "transform: translate3d(var(--cursor-x), var(--cursor-y), 0) translate3d(-50%, -50%, 0)",
    );
  });

  it("unmasks every band from left to right on entry", () => {
    expect(rule(".bandRevealMask")).toContain("transform-origin: left center");
    expect(heroStyles).toMatch(
      /@keyframes band-unveil[\s\S]*?from\s*\{[\s\S]*?scaleX\(0\)/,
    );
  });

  it("separates cover headlines from lower-left captions around one shared gutter", () => {
    const chapterRule = rule(".opening,\n.method,\n.journalStatement");
    const captionRule = rule(
      ".intro,\n.method > p,\n.journalStatement > p",
    );
    const signatureRule = rule(".coverSignature");

    expect(chapterRule).toContain("inset: 0");
    expect(captionRule).toContain("position: absolute");
    expect(captionRule).toContain("bottom: var(--cover-baseline)");
    expect(captionRule).toContain("left: var(--cover-caption-left)");
    expect(signatureRule).toContain("bottom: var(--cover-baseline)");
    expect(signatureRule).toContain("left: var(--cover-gutter)");
  });
});
