import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeSplash } from "./home-splash";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
});

describe("HomeSplash", () => {
  it("leaves the O aperture open for the persistent stage", () => {
    const { container } = render(<HomeSplash durationOverride={2400} />);

    const lockup = screen.getByRole("img", { name: "CALORYTHM" });

    expect(lockup.tagName.toLowerCase()).toBe("svg");
    expect(lockup.querySelectorAll("[data-splash-lettering]")).toHaveLength(2);
    expect(lockup.querySelector("[data-splash-ring]")).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-splash-color]")).toHaveLength(4);
    expect(container.querySelector("[data-testid='home-splash'] img")).not.toBeInTheDocument();
  });

  it("keeps the splash free of helper controls and edition copy", () => {
    render(<HomeSplash durationOverride={2400} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("İntroyu geç")).not.toBeInTheDocument();
    expect(screen.queryByText("Beslenme bilimi · Bağımsız yayın")).not.toBeInTheDocument();
  });

  it("treats the full intro surface as a dismiss action", () => {
    render(<HomeSplash durationOverride={2400} />);

    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });

  it("announces an explicit dismissal so the persistent ring can settle into hero", () => {
    let dismissals = 0;
    const handleDismiss = () => {
      dismissals += 1;
    };
    window.addEventListener("calorythm:splash-dismiss", handleDismiss);

    render(<HomeSplash durationOverride={2400} />);
    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    expect(dismissals).toBe(1);
    window.removeEventListener("calorythm:splash-dismiss", handleDismiss);
  });

  it("dismisses automatically after the active motion profile duration", () => {
    vi.useFakeTimers();
    render(<HomeSplash durationOverride={1600} />);

    act(() => vi.advanceTimersByTime(1599));
    expect(screen.getByTestId("home-splash")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });

  it("announces an automatic dismissal so the persistent stage can settle", () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    window.addEventListener("calorythm:splash-dismiss", handleDismiss);

    render(<HomeSplash durationOverride={1600} />);
    act(() => vi.advanceTimersByTime(1600));

    expect(handleDismiss).toHaveBeenCalledOnce();
    window.removeEventListener("calorythm:splash-dismiss", handleDismiss);
  });

  it("introduces no delay for a constrained motion profile", () => {
    render(<HomeSplash durationOverride={0} />);

    expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  });

  it("returns the opening scene to the hero and locks background scrolling", () => {
    const scrollTo = vi.mocked(window.scrollTo);
    document.documentElement.style.overflow = "clip";
    document.body.style.overflow = "auto";

    render(<HomeSplash durationOverride={2400} />);

    expect(scrollTo).toHaveBeenCalledWith({ behavior: "instant", left: 0, top: 0 });
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.pointerDown(screen.getByTestId("home-splash"));

    expect(document.documentElement.style.overflow).toBe("clip");
    expect(document.body.style.overflow).toBe("auto");
  });
});
