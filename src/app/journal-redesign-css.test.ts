import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const journalStyles = readFileSync(
  resolve(process.cwd(), "src/app/(publication)/journal/journal.module.css"),
  "utf8",
);

describe("Journal responsive design contract", () => {
  it("keeps both editorial gutters clear of device safe areas", () => {
    expect(journalStyles).toMatch(
      /padding-left:\s*max\([^;]*env\(safe-area-inset-left\)[^;]*\)/,
    );
    expect(journalStyles).toMatch(
      /padding-right:\s*max\([^;]*env\(safe-area-inset-right\)[^;]*\)/,
    );
  });

  it("uses a focused phone breakpoint near 760 pixels", () => {
    const breakpoints = Array.from(
      journalStyles.matchAll(/@media\s*\(max-width:\s*(\d+)px\)/g),
      (match) => Number(match[1]),
    );

    expect(breakpoints.some((width) => width >= 740 && width <= 780)).toBe(true);
  });

  it("removes nonessential motion when reduced motion is requested", () => {
    expect(journalStyles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?(?:animation|transition)(?:-duration)?:\s*(?:none|0(?:\.0+)?m?s)/,
    );
  });

  it("does not reserve a 38rem blank masthead on phones", () => {
    expect(journalStyles).not.toMatch(/min-height:\s*38rem/);
  });
});
