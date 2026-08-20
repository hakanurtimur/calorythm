import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout, { viewport } from "./layout";

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
});
