import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(
  resolve(process.cwd(), "src/components/topics/protein-topic-landing.module.css"),
  "utf8",
);

const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 560px)"));

describe("Protein topic responsive art direction", () => {
  it("uses one natural-flow light atlas instead of a multi-viewport sticky scene", () => {
    expect(styles).toMatch(/\.roles\s*{[\s\S]*?background:\s*var\(--ivory\)/);
    expect(styles).not.toContain("430svh");
    expect(styles).not.toMatch(/\.roles(?:Sticky|Frame)\s*{[\s\S]*?position:\s*sticky/);
  });

  it("keeps one integrated brand spine and readable ledger on narrow mobile", () => {
    expect(styles).not.toContain(".heroRails");
    expect(styles).toContain(".roleLedger");
    expect(styles).toContain(".roleSpine");
    expect(mobileStyles).not.toMatch(/\.roleSpine\s*{[\s\S]*?display:\s*none/);
    expect(styles).not.toContain(".roleScore");
    expect(styles).not.toMatch(/content:\s*["']P["']/);
    expect(styles).not.toMatch(/\.roleList\s+button/);
    expect(styles).not.toContain("overflow-wrap: anywhere");
  });
});
