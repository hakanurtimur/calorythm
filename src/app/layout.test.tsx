import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CoverLayout from "./(cover)/layout";
import PublicationLayout from "./(publication)/layout";
import RootLayout, { metadata, viewport } from "./layout";

const globalStyles = readFileSync(
  resolve(process.cwd(), "src/app/globals.css"),
  "utf8",
);

function rule(selector: string) {
  const selectorIndex = globalStyles.indexOf(selector);
  expect(selectorIndex, `missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const openingBrace = globalStyles.indexOf("{", selectorIndex);
  const closingBrace = globalStyles.indexOf("}", openingBrace);

  return globalStyles
    .slice(openingBrace + 1, closingBrace)
    .replace(/\s+/g, " ")
    .trim();
}

describe("RootLayout", () => {
  it("authors a Turkish document with a skip link to the main reading surface", () => {
    const markup = renderToStaticMarkup(
      <RootLayout><main id="ana-icerik">İçerik</main></RootLayout>,
    );
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(document.documentElement.lang).toBe("tr");
    expect(document.querySelector('a[href="#ana-icerik"]')?.textContent).toBe("Ana içeriğe geç");
    expect(document.querySelector("main")?.id).toBe("ana-icerik");
    expect(viewport.viewportFit).toBe("cover");
  });

  it("keeps the skip link above fixed route shells", () => {
    expect(rule(".skip-link")).toContain("z-index: 40");
  });

  it("leaves shell ownership to the route group and composes page titles", () => {
    const markup = renderToStaticMarkup(
      <RootLayout><main id="ana-icerik">İçerik</main></RootLayout>,
    );
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(document.querySelector("header")).toBeNull();
    expect(document.querySelector("footer")).toBeNull();
    expect(metadata.title).toEqual({
      default: "CALORYTHM",
      template: "%s | CALORYTHM",
    });
  });

  it.each([
    ["cover", CoverLayout, "transparent"],
    ["publication", PublicationLayout, "solid"],
  ] as const)("renders the %s shell tone once with its footer", (_name, Layout, tone) => {
    const markup = renderToStaticMarkup(
      <Layout><main id="ana-icerik">İçerik</main></Layout>,
    );
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(document.querySelector(`header[data-tone="${tone}"]`)).not.toBeNull();
    expect(document.querySelectorAll("header")).toHaveLength(1);
    expect(document.querySelectorAll("footer")).toHaveLength(1);
  });
});
