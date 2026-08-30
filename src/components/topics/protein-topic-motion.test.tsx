import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("publishes one coherent role state for click and keyboard focus", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        removeEventListener: vi.fn(),
      })),
    });

    const roles = ["structure", "catalysis", "transport", "signal", "defense"];
    const { container } = render(
      <ProteinTopicMotion loadRuntime={vi.fn()}>
        {roles.map((role) => (
          <div key={role}>
            <button aria-pressed="false" data-role-id={role}>{role}</button>
            <p data-role-description={role}>{role} açıklaması</p>
          </div>
        ))}
      </ProteinTopicMotion>,
    );

    const root = container.querySelector("[data-protein-topic-motion-root]");
    const transport = screen.getByRole("button", { name: "transport" });
    const signal = screen.getByRole("button", { name: "signal" });

    fireEvent.click(transport);
    expect(root).toHaveAttribute("data-active-protein-role", "transport");
    expect(transport).toHaveAttribute("aria-pressed", "true");
    expect(signal).toHaveAttribute("aria-pressed", "false");

    fireEvent.focus(signal);
    expect(root).toHaveAttribute("data-active-protein-role", "signal");
    expect(signal).toHaveAttribute("aria-pressed", "true");

    fireEvent.blur(signal);
    expect(root).toHaveAttribute("data-active-protein-role", "transport");
  });
});
