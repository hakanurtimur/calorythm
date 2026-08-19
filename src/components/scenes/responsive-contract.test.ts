import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sceneStyles = readFileSync(resolve(process.cwd(), "src/components/scenes/home-scenes.module.css"), "utf8");
const globalStyles = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function rule(source: string, selector: string, startAt = 0) {
  const selectorIndex = source.indexOf(selector, startAt);
  expect(selectorIndex, `missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const openingBrace = source.indexOf("{", selectorIndex);
  const closingBrace = source.indexOf("}", openingBrace);

  return source.slice(openingBrace + 1, closingBrace).replace(/\s+/g, " ").trim();
}

describe("authored responsive contracts", () => {
  it("defines the independent mobile composition through 767px", () => {
    const mobileStart = sceneStyles.indexOf("@media (max-width: 47.9375rem)");

    expect(mobileStart).toBeGreaterThanOrEqual(0);
    expect(rule(sceneStyles, ".matterSurface", mobileStart)).toContain("aspect-ratio: 4 / 5");
    expect(rule(sceneStyles, ".matterSurface", mobileStart)).toContain("--crop-main-height: 100%");
    expect(rule(sceneStyles, ".matterSurface", mobileStart)).toContain("--crop-detail-one-x: 0%");
    expect(rule(sceneStyles, ".matterSurface", mobileStart)).toContain("--crop-detail-one-y: 15%");
    expect(rule(sceneStyles, ".matterSurface", mobileStart)).toContain("--crop-detail-two-x: 56%");
    expect(rule(sceneStyles, ".matterSurface", mobileStart)).toContain("--crop-detail-two-y: 65%");
    expect(rule(sceneStyles, ".concepts", mobileStart)).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr))",
    );
    expect(rule(sceneStyles, ".description", mobileStart)).toContain("font-size: 1rem");
    expect(rule(sceneStyles, ".scene", mobileStart)).toContain("env(safe-area-inset-right)");
    expect(rule(sceneStyles, ".scene", mobileStart)).toContain("env(safe-area-inset-left)");
  });

  it("keeps real controls touch-sized, safe-area aware, and the wordmark unbroken", () => {
    expect(rule(globalStyles, ".skip-link")).toContain("min-height: 2.75rem");
    expect(rule(globalStyles, ".skip-link")).toContain("env(safe-area-inset-left)");
    expect(rule(sceneStyles, ".siteHeader")).toContain("env(safe-area-inset-top)");
    expect(rule(sceneStyles, ".wordmark")).toContain("min-height: 2.75rem");
    expect(rule(sceneStyles, ".wordmark")).toContain("white-space: nowrap");
    expect(rule(sceneStyles, ".cta")).toContain("min-height: 2.75rem");
  });

  it("preserves the desktop grid, prose measure, and display ceiling", () => {
    expect(sceneStyles).toMatch(/\.hero,\s*\.response\s*\{[\s\S]*?grid-template-columns:\s*repeat\(12,/);
    expect(rule(sceneStyles, ".matterGrid")).toContain("grid-template-columns: repeat(12,");
    expect(rule(sceneStyles, ".heroTitle,\n.sceneTitle")).toContain("letter-spacing: -0.04em");
    expect(sceneStyles).toMatch(/\.heroTitle\s*\{\s*font-size:\s*clamp\(3\.5rem, 8\.5vw, 6rem\)/);
    expect(sceneStyles).toMatch(/\.sceneTitle\s*\{\s*font-size:\s*clamp\(3rem, 6\.5vw, 6rem\)/);
    expect(rule(sceneStyles, ".description")).toContain("max-width: 70ch");
  });
});
