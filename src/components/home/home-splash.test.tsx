import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeSplash } from "./home-splash";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("HomeSplash", () => {
  it("lets the visitor dismiss the intro explicitly", () => {
    render(<HomeSplash durationOverride={1750} />);

    fireEvent.click(screen.getByRole("button", { name: "İntroyu geç" }));

    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });

  it("treats the full intro surface as a dismiss action", () => {
    render(<HomeSplash durationOverride={1750} />);

    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });

  it("dismisses automatically after the active motion profile duration", () => {
    vi.useFakeTimers();
    render(<HomeSplash durationOverride={900} />);

    act(() => vi.advanceTimersByTime(899));
    expect(screen.getByTestId("home-splash")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });

  it("introduces no delay for a constrained motion profile", () => {
    render(<HomeSplash durationOverride={0} />);

    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });
});
