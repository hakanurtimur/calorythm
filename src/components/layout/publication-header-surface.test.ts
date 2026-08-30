import { describe, expect, it } from "vitest";
import { resolvePublicationSurfaceTone } from "./publication-header-surface";

describe("resolvePublicationSurfaceTone", () => {
  it("uses the nearest explicit publication surface", () => {
    const darkSurface = document.createElement("section");
    const child = document.createElement("div");
    darkSurface.dataset.headerTone = "dark";
    darkSurface.append(child);

    expect(resolvePublicationSurfaceTone([child], "light")).toBe("dark");
  });

  it("ignores the fixed header and keeps the route fallback", () => {
    const header = document.createElement("header");
    const child = document.createElement("a");
    header.dataset.headerTone = "dark";
    header.append(child);

    expect(resolvePublicationSurfaceTone([child], "light", header)).toBe("light");
  });
});
