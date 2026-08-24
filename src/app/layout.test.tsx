import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata, viewport } from "./layout";

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

  it("wraps every route in the publication shell and composes page titles", () => {
    const markup = renderToStaticMarkup(
      <RootLayout><main id="ana-icerik">İçerik</main></RootLayout>,
    );
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(document.querySelector('header [data-brand-wordmark="primary"]')).not.toBeNull();
    expect(document.querySelector("footer")).not.toBeNull();
    expect(metadata.title).toEqual({
      default: "CALORYTHM",
      template: "%s | CALORYTHM",
    });
  });
});
