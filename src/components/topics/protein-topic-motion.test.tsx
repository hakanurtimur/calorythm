import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ProteinTopicMotion,
  resolveProteinTopicMotionProfile,
} from "./protein-topic-motion";

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

afterEach(() => {
  cleanup();
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

describe("resolveProteinTopicMotionProfile", () => {
  it.each([
    [{ width: 1024, height: 700, reducedMotion: false, saveData: false }, "full"],
    [{ width: 1440, height: 900, reducedMotion: false, saveData: false }, "full"],
    [{ width: 1023, height: 900, reducedMotion: false, saveData: false }, "static"],
    [{ width: 1440, height: 699, reducedMotion: false, saveData: false }, "static"],
    [{ width: 390, height: 844, reducedMotion: false, saveData: false }, "static"],
    [{ width: 1440, height: 900, reducedMotion: true, saveData: false }, "reduced"],
    [{ width: 1440, height: 900, reducedMotion: false, saveData: true }, "reduced"],
  ] as const)("maps %o to %s", (input, expected) => {
    expect(resolveProteinTopicMotionProfile(input)).toBe(expected);
  });

  it("keeps the full-height spine static and reveals rows once without pinning or scrub", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: false,
        media: query,
        removeEventListener: vi.fn(),
      })),
    });

    const timelines: Array<Record<string, unknown>> = [];
    const timeline = {
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
    };
    const revert = vi.fn();
    const runtime = {
      ScrollTrigger: { create: vi.fn() },
      gsap: {
        context: vi.fn((setup: () => void) => {
          setup();
          return { revert };
        }),
        killTweensOf: vi.fn(),
        quickTo: vi.fn(() => vi.fn()),
        registerPlugin: vi.fn(),
        timeline: vi.fn((config: Record<string, unknown> = {}) => {
          timelines.push(config);
          return timeline;
        }),
      },
    };

    const { unmount } = render(
      <ProteinTopicMotion loadRuntime={vi.fn().mockResolvedValue(runtime)}>
        <section data-protein-topic-scene="hero">
          <div data-protein-topic-hero-visual>
            <span data-protein-topic-hero-light />
            <span data-protein-topic-hero-image />
          </div>
          <span data-protein-topic-hero-copy />
        </section>
        <section data-protein-topic-scene="roles">
          <header data-protein-roles-intro />
          <div data-protein-role-ledger>
            {[0, 1, 2, 3].map((line) => (
              <svg key={line}>
                <path
                  data-protein-role-spine-line={line}
                  pathLength="1"
                />
              </svg>
            ))}
            <ol>
              {["structure", "catalysis", "transport", "signal", "defense"].map(
                (role) => <li data-protein-role-row={role} key={role}>{role}</li>,
              )}
            </ol>
          </div>
        </section>
      </ProteinTopicMotion>,
    );

    await waitFor(() => {
      expect(runtime.gsap.timeline).toHaveBeenCalled();
    });

    const roleTimeline = timelines.find((config) => {
      const scrollTrigger = config.scrollTrigger as Record<string, unknown> | undefined;
      return scrollTrigger?.trigger === '[data-protein-topic-scene="roles"]';
    });
    const roleTrigger = roleTimeline?.scrollTrigger as Record<string, unknown> | undefined;

    expect(roleTrigger).toMatchObject({ once: true, start: "top 78%" });
    expect(roleTrigger).not.toHaveProperty("pin");
    expect(roleTrigger).not.toHaveProperty("scrub");
    expect(runtime.ScrollTrigger.create).not.toHaveBeenCalled();
    expect(
      timeline.fromTo.mock.calls.some(
        ([selector]) => selector === "[data-protein-role-spine-line]",
      ),
    ).toBe(false);
    expect(timeline.fromTo).toHaveBeenCalledWith(
      "[data-protein-role-row]",
      { y: 18 },
      expect.objectContaining({ stagger: 0.08, y: 0 }),
      expect.any(Number),
    );
    unmount();
    expect(revert).toHaveBeenCalledTimes(1);
  });
});
