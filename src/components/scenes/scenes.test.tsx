import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import * as rootLayoutModule from "@/app/layout";
import { HomeSceneOrchestrator } from "@/components/motion/home-scene-orchestrator";

const gsapRuntime = vi.hoisted(() => {
  const timeline = {
    fromTo: vi.fn(),
    to: vi.fn(),
  };
  timeline.fromTo.mockReturnValue(timeline);
  timeline.to.mockReturnValue(timeline);

  return {
    matchMedia: vi.fn(() => ({
      add: vi.fn(
        (
          _queries: Record<string, string>,
          callback: (context: { conditions: { isDesktop: boolean; isMobile: boolean } }) => void,
        ) => {
          callback({ conditions: { isDesktop: window.innerWidth > 768, isMobile: window.innerWidth <= 768 } });
        },
      ),
      revert: vi.fn(),
    })),
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => timeline),
    timelineInstance: timeline,
  };
});

vi.mock("gsap", () => ({ gsap: gsapRuntime }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
  if (originalInnerWidth) Object.defineProperty(window, "innerWidth", originalInnerWidth);
});

describe("homepage scenes", () => {
  it("presents the three-scene narrative with one page title", () => {
    render(<Home />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Yediğin şey, bir sayıdan fazlası." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Beden sadece almaz. Cevap verir." })).toBeInTheDocument();
  });

  it("authors Turkish document language and a focusable skip-link destination", () => {
    const layout = rootLayoutModule.default({ children: <Home /> });
    const body = layout.props.children;

    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("tr");
    expect(rootLayoutModule).toHaveProperty("viewport.viewportFit", "cover");

    render(<>{body.props.children}</>);

    const skipLink = screen.getByRole("link", { name: "Ana içeriğe geç" });
    const main = screen.getByRole("main");

    expect(skipLink).toHaveAttribute("href", "#ana-icerik");
    expect(main).toHaveAttribute("id", "ana-icerik");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("keeps the explore action and scene hooks available without unbuilt navigation", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Keşfet" })).toHaveAttribute("href", "#madde");
    expect(screen.getByRole("region", { name: "Sahne 01: Uyanış" })).toHaveAttribute("data-scene", "01");
    expect(screen.getByRole("region", { name: "Sahne 02: Madde" })).toHaveAttribute("data-scene", "02");
    expect(screen.getByRole("region", { name: "Sahne 03: Cevap" })).toHaveAttribute("data-scene", "03");
    expect(screen.getByRole("region", { name: "Sahne 01: Uyanış" })).toHaveAttribute("id", "uyanış");
    expect(screen.getByRole("region", { name: "Sahne 02: Madde" })).toHaveAttribute("id", "madde");
    expect(screen.getByRole("region", { name: "Sahne 03: Cevap" })).toHaveAttribute("id", "cevap");
    expect(Array.from(document.querySelectorAll<HTMLElement>("[data-motion]"), (node) => node.dataset.motion)).toEqual([
      "site-wordmark",
      "hero-form",
      "hero-eyebrow",
      "hero-title",
      "hero-description",
      "hero-cta",
      "matter-index",
      "matter-title",
      "matter-body",
      "matter-surface",
      "matter-annotations",
      "response-field",
      "response-index",
      "response-title",
      "response-body",
      "response-concepts",
    ]);
    expect(screen.getByText("Journal")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Konular")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Hakkında")).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("link", { name: "Journal" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Konular" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Hakkında" })).not.toBeInTheDocument();
  });

  it("renders every response concept as readable text without canvas execution", () => {
    const { container } = render(<Home />);

    for (const concept of ["Enerji", "Sindirim", "Emilim", "Depolama", "Hareket", "Toparlanma"]) {
      expect(screen.getByText(concept)).toBeInTheDocument();
    }
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("presents one meaningful matter image with two decorative detail windows", () => {
    render(<Home />);

    const matterScene = screen.getByRole("region", { name: "Sahne 02: Madde" });
    const matterImage = screen.getByRole("img", {
      name: "Koyu ekmek dokusu, yakut renkli narenciye ve zeytinyağının makro görünümü",
    });

    expect(matterScene).toContainElement(matterImage);
    expect(matterScene.querySelectorAll("img")).toHaveLength(1);
    expect(matterScene.querySelectorAll('[data-detail-window][aria-hidden="true"]')).toHaveLength(2);
  });

  it("hides decorative visual fields from assistive technology", () => {
    const { container } = render(<Home />);

    expect(container.querySelector('[data-rendering][aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-motion="response-field"][aria-hidden="true"]')).toBeInTheDocument();
  });

  it("does not initialise GSAP or ScrollTrigger when reduced motion is requested", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    });

    const { container } = render(<Home />);

    await waitFor(() => {
      expect(container.querySelector('[data-motion-profile="reduced"]')).toBeInTheDocument();
    });
    expect(gsapRuntime.registerPlugin).not.toHaveBeenCalled();
    expect(gsapRuntime.matchMedia).not.toHaveBeenCalled();
  });

  it("keeps mobile Scene 02 unpinned without overwriting its authored crop composition", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(max-width: 48rem)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    });

    const { container } = render(
      <HomeSceneOrchestrator>
        <section data-scene="01" />
        <section data-motion="matter-surface" data-scene="02" />
        <section data-scene="03" />
      </HomeSceneOrchestrator>,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-motion-profile="full"]')).toBeInTheDocument();
    });

    const timelineCalls = gsapRuntime.timeline.mock.calls as unknown as Array<[
      { scrollTrigger?: { pin?: string; trigger?: string } },
    ]>;
    const matterTimeline = timelineCalls.find(
      ([options]) => options.scrollTrigger?.trigger === '[data-scene="02"]',
    )?.[0];
    const tweenCalls = gsapRuntime.timelineInstance.fromTo.mock.calls as unknown as Array<[
      string,
      Record<string, unknown>,
      Record<string, unknown>,
    ]>;
    const matterTween = tweenCalls
      .find(([target]) => target === '[data-motion="matter-surface"]');

    expect(matterTimeline?.scrollTrigger).not.toHaveProperty("pin");
    expect(matterTween?.[1]).not.toHaveProperty("--crop-main-x");
    expect(matterTween?.[2]).not.toHaveProperty("--crop-detail-two-x");
  });
});
