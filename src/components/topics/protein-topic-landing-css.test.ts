import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(
  resolve(process.cwd(), "src/components/topics/protein-topic-landing.module.css"),
  "utf8",
);

const tabletStyles = styles.slice(
  styles.indexOf("@media (max-width: 900px)"),
  styles.indexOf("@media (max-width: 560px)"),
);
const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 560px)"));

describe("Protein topic responsive art direction", () => {
  it("keeps the rhythm rail on tablet without relying on a sticky scroll scene", () => {
    expect(tabletStyles).not.toMatch(/\.heroLight,\s*\.heroRails/);
    expect(tabletStyles).toMatch(/\.heroRails\s*{[\s\S]*?opacity:/);
    expect(tabletStyles).toMatch(
      /\.rolesSticky\s*{[\s\S]*?position:\s*relative/,
    );
  });

  it("replaces the pinned theatre with sequential visual chapters on narrow mobile", () => {
    expect(mobileStyles).toMatch(/\.heroRails\s*{[\s\S]*?display:\s*none/);
    expect(mobileStyles).toMatch(/\.roleStage\s*{[\s\S]*?display:\s*none/);
    expect(mobileStyles).toMatch(/\.roleMobileSequence\s*{[\s\S]*?display:\s*grid/);
    expect(styles).not.toContain("overflow-wrap: anywhere");
  });
});
