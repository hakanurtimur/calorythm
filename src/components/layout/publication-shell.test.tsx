import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicationFooter } from "./publication-footer";
import { PublicationHeader } from "./publication-header";

const shellStyles = readFileSync(
  resolve(process.cwd(), "src/components/layout/publication-shell.module.css"),
  "utf8",
);

function rule(selector: string) {
  const selectorIndex = shellStyles.indexOf(selector);
  expect(selectorIndex, `missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const openingBrace = shellStyles.indexOf("{", selectorIndex);
  const closingBrace = shellStyles.indexOf("}", openingBrace);

  return shellStyles
    .slice(openingBrace + 1, closingBrace)
    .replace(/\s+/g, " ")
    .trim();
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  Reflect.deleteProperty(document, "elementsFromPoint");
  vi.restoreAllMocks();
});

describe("PublicationHeader", () => {
  it("offers the Turkish publication vocabulary from one visible wordmark", () => {
    const { container } = render(<PublicationHeader />);

    expect(screen.getByRole("navigation", { name: "Ana navigasyon" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Yazılar" })).toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: "Konu Atlası" })).toHaveAttribute("href", "/topics");
    expect(screen.getByRole("link", { name: "Yayın" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Fikir gönder" })).toHaveAttribute(
      "href",
      "/about#katki",
    );
    expect(screen.getAllByRole("link", { name: "CALORYTHM ana sayfa" })).toHaveLength(1);
    expect(container.querySelectorAll('[data-brand-wordmark="primary"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-brand-wordmark="inverse"]')).toHaveLength(1);
  });

  it.each(["transparent", "solid"] as const)("sets the %s header tone", (tone) => {
    render(<PublicationHeader tone={tone} />);

    expect(screen.getByRole("banner")).toHaveAttribute("data-tone", tone);
  });

  it("keeps surface changes explicit instead of using blend modes", () => {
    expect(rule('.header[data-surface="light"]')).toContain("background:");
    expect(rule('.header[data-surface="dark"]')).toContain("background:");
    expect(shellStyles).not.toContain("mix-blend-mode");
    expect(rule(".contributeLink")).not.toContain("border: 1px solid");
  });

  it("adopts the explicit tone of the surface beneath the fixed masthead", async () => {
    const darkSurface = document.createElement("section");
    darkSurface.dataset.headerTone = "dark";
    document.body.append(darkSurface);
    const elementsFromPoint = vi.fn(() => [darkSurface]);
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: elementsFromPoint,
    });

    render(<PublicationHeader tone="solid" />);

    await waitFor(() =>
      expect(screen.getByRole("banner")).toHaveAttribute("data-surface", "dark"),
    );
    expect(elementsFromPoint).toHaveBeenCalled();
    darkSurface.remove();
  });

  it("contains focus inside the mobile menu and restores it to the trigger", async () => {
    render(<PublicationHeader />);
    const menuButton = screen.getByRole("button", { name: "Menüyü aç" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveStyle({ minHeight: "44px", minWidth: "44px" });

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobil navigasyon",
    });
    const links = within(mobileNavigation).getAllByRole("link");
    await waitFor(() => expect(links[0]).toHaveFocus());
    expect(document.body.style.overflow).toBe("hidden");

    links.at(-1)?.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(links[0]).toHaveFocus();

    links[0]?.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(links.at(-1)).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
    await waitFor(() => expect(menuButton).toHaveFocus());
  });

  it("closes the mobile menu when its navigation is used", () => {
    render(<PublicationHeader />);
    const menuButton = screen.getByRole("button", { name: "Menüyü aç" });

    fireEvent.click(menuButton);
    const topicLink = within(
      screen.getByRole("navigation", { name: "Mobil navigasyon" }),
    ).getByRole("link", { name: "Konu Atlası" });
    topicLink.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
      once: true,
    });
    fireEvent.click(topicLink);

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("anchors the mobile menu at the end of the header grid", () => {
    const menuRule = rule(".mobileMenu");

    expect(menuRule).toContain("grid-column: 3");
    expect(menuRule).toContain("justify-self: end");
    expect(rule(".menuButton")).toContain("color: inherit");
  });
});

describe("PublicationFooter", () => {
  it("closes the publication with a dark, branded editorial colophon", () => {
    const { container } = render(<PublicationFooter />);
    const footer = screen.getByRole("contentinfo");

    expect(footer).toBeVisible();
    expect(footer).toHaveAttribute("data-header-tone", "dark");
    expect(
      within(footer).getByRole("link", { name: "CALORYTHM ana sayfa" }),
    ).toHaveAttribute("href", "/");
    expect(container.querySelectorAll('[data-brand-wordmark="inverse"]')).toHaveLength(1);
    expect(footer).toHaveTextContent(
      "Beslenme bilimini kaynak, bağlam ve güçlü görsel anlatımla yayımlayan bağımsız bir web dergisi.",
    );
  });

  it("organizes reading, publication, and contribution links by intent", () => {
    render(<PublicationFooter />);

    const reading = screen.getByRole("navigation", { name: "Oku" });
    expect(within(reading).getByRole("link", { name: "Yazılar" })).toHaveAttribute(
      "href",
      "/journal",
    );
    expect(within(reading).getByRole("link", { name: "Konu Atlası" })).toHaveAttribute(
      "href",
      "/topics",
    );
    expect(within(reading).getByRole("link", { name: "Protein dosyası" })).toHaveAttribute(
      "href",
      "/journal/protein-sadece-kas-icin-degildir",
    );

    const publication = screen.getByRole("navigation", { name: "Yayın" });
    expect(
      within(publication).getByRole("link", { name: "CALORYTHM nedir?" }),
    ).toHaveAttribute("href", "/about");
    expect(
      within(publication).getByRole("link", { name: "Editoryal yöntem" }),
    ).toHaveAttribute("href", "/about#editorial-method");

    const contribution = screen.getByRole("navigation", { name: "Katkı" });
    expect(
      within(contribution).getByRole("link", { name: "Katkı ilkeleri" }),
    ).toHaveAttribute("href", "/about#katki");
    expect(within(contribution).getByRole("link", { name: "Fikir gönder" })).toHaveAttribute(
      "href",
      "/about#katki",
    );
  });

  it("ends with the publication status and four rhythm lines", () => {
    const { container } = render(<PublicationFooter />);
    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveTextContent(
      "© 2026 CALORYTHM · Bağımsız yayın · İçerikler kişisel sağlık önerisi değildir.",
    );
    expect(
      Array.from(container.querySelectorAll<HTMLElement>("[data-footer-band]")).map(
        (band) => band.dataset.footerBand,
      ),
    ).toEqual(["orange", "coral", "ochre", "olive"]);
  });

  it("keeps server content visible, then reveals it when the footer intersects", async () => {
    const originalObserver = Object.getOwnPropertyDescriptor(window, "IntersectionObserver");
    let callback: IntersectionObserverCallback | undefined;

    class TestIntersectionObserver {
      constructor(nextCallback: IntersectionObserverCallback) {
        callback = nextCallback;
      }

      disconnect() {}
      observe() {}
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: TestIntersectionObserver,
    });

    try {
      render(<PublicationFooter />);
      const footer = screen.getByRole("contentinfo");

      expect(footer).toBeVisible();
      expect(footer).not.toHaveAttribute("data-footer-revealed");
      expect(callback).toBeTypeOf("function");

      callback?.(
        [
          {
            isIntersecting: true,
            target: footer,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );

      await waitFor(() => expect(footer).toHaveAttribute("data-footer-revealed", "true"));
    } finally {
      if (originalObserver) {
        Object.defineProperty(window, "IntersectionObserver", originalObserver);
      } else {
        Reflect.deleteProperty(window, "IntersectionObserver");
      }
    }
  });

  it("leaves the server-rendered footer static for reduced motion", () => {
    const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
    const originalObserver = Object.getOwnPropertyDescriptor(window, "IntersectionObserver");
    let observerCount = 0;

    class TestIntersectionObserver {
      constructor() {
        observerCount += 1;
      }

      disconnect() {}
      observe() {}
    }

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true }),
    });
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: TestIntersectionObserver,
    });

    try {
      const { container } = render(<PublicationFooter />);
      const footer = screen.getByRole("contentinfo");

      expect(container.querySelector("[data-footer-motion-anchor]")).toBeInTheDocument();
      expect(footer).toBeVisible();
      expect(footer).not.toHaveAttribute("data-footer-revealed");
      expect(observerCount).toBe(0);
    } finally {
      if (originalMatchMedia) {
        Object.defineProperty(window, "matchMedia", originalMatchMedia);
      } else {
        Reflect.deleteProperty(window, "matchMedia");
      }

      if (originalObserver) {
        Object.defineProperty(window, "IntersectionObserver", originalObserver);
      } else {
        Reflect.deleteProperty(window, "IntersectionObserver");
      }
    }
  });
});
