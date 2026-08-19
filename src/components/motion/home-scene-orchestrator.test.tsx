import { act, cleanup, render, waitFor } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeSceneOrchestrator } from "./home-scene-orchestrator";

const defaultRuntime = vi.hoisted(() => {
  const timeline = {
    fromTo: vi.fn(),
    to: vi.fn(),
  };
  timeline.fromTo.mockReturnValue(timeline);
  timeline.to.mockReturnValue(timeline);
  const media = { add: vi.fn(), revert: vi.fn() };

  return {
    gsap: {
      matchMedia: vi.fn(() => media),
      registerPlugin: vi.fn(),
      timeline: vi.fn(() => timeline),
    },
    media,
  };
});

vi.mock("gsap", () => ({ gsap: defaultRuntime.gsap }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

type MotionRuntime = {
  ScrollTrigger: object;
  gsap: {
    matchMedia: ReturnType<typeof vi.fn>;
    registerPlugin: ReturnType<typeof vi.fn>;
    timeline: ReturnType<typeof vi.fn>;
  };
};

type LoadableOrchestratorProps = {
  children: ReactNode;
  loadRuntime?: () => Promise<MotionRuntime>;
};

type ConstrainedEnvironment = {
  setReducedMotion: (value: boolean) => void;
  setSaveData: (value: boolean) => void;
};

const originalConnection = Object.getOwnPropertyDescriptor(navigator, "connection");
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

function createRuntime(): MotionRuntime & { media: { add: ReturnType<typeof vi.fn>; revert: ReturnType<typeof vi.fn> } } {
  const timeline = {
    fromTo: vi.fn(),
    to: vi.fn(),
  };
  timeline.fromTo.mockReturnValue(timeline);
  timeline.to.mockReturnValue(timeline);
  const media = {
    add: vi.fn(
      (
        _queries: Record<string, string>,
        callback: (context: { conditions: { isDesktop: boolean; isMobile: boolean } }) => void,
      ) => callback({ conditions: { isDesktop: true, isMobile: false } }),
    ),
    revert: vi.fn(),
  };

  return {
    ScrollTrigger: {},
    gsap: {
      matchMedia: vi.fn(() => media),
      registerPlugin: vi.fn(),
      timeline: vi.fn(() => timeline),
    },
    media,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((fulfil) => {
    resolve = fulfil;
  });

  return { promise, resolve };
}

function installEnvironment(): ConstrainedEnvironment {
  let reducedMotion = false;
  const motionListeners = new Set<EventListenerOrEventListenerObject>();
  const motionQuery = {
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => motionListeners.add(listener),
    dispatchEvent: () => true,
    get matches() {
      return reducedMotion;
    },
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => motionListeners.delete(listener),
  };
  const connection = new EventTarget() as EventTarget & { saveData: boolean };
  connection.saveData = false;

  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1_440 });
  Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => motionQuery) });
  Object.defineProperty(navigator, "connection", { configurable: true, value: connection });

  const emitMotionChange = () => {
    const event = new Event("change");
    for (const listener of motionListeners) {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    }
  };

  return {
    setReducedMotion: (value) => {
      reducedMotion = value;
      emitMotionChange();
    },
    setSaveData: (value) => {
      connection.saveData = value;
      connection.dispatchEvent(new Event("change"));
    },
  };
}

function renderWithRuntime(loadRuntime: () => Promise<MotionRuntime>) {
  const TestableOrchestrator = HomeSceneOrchestrator as ComponentType<LoadableOrchestratorProps>;

  return render(
    <TestableOrchestrator loadRuntime={loadRuntime}>
      <section data-scene="01" />
      <section data-motion="matter-surface" data-scene="02" />
      <section data-scene="03" />
    </TestableOrchestrator>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  if (originalConnection) Object.defineProperty(navigator, "connection", originalConnection);
  else Reflect.deleteProperty(navigator, "connection");
  if (originalInnerWidth) Object.defineProperty(window, "innerWidth", originalInnerWidth);
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

describe("HomeSceneOrchestrator constraint changes", () => {
  it("does not perform late setup when reduced motion starts while runtime loading is pending", async () => {
    const environment = installEnvironment();
    const runtime = createRuntime();
    const pendingRuntime = deferred<MotionRuntime>();
    const loadRuntime = vi.fn(() => pendingRuntime.promise);
    const { container } = renderWithRuntime(loadRuntime);

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    act(() => environment.setReducedMotion(true));
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced"));
    await act(async () => pendingRuntime.resolve(runtime));

    expect(runtime.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(runtime.gsap.matchMedia).not.toHaveBeenCalled();
  });

  it("does not perform late setup when Save Data starts while runtime loading is pending", async () => {
    const environment = installEnvironment();
    const runtime = createRuntime();
    const pendingRuntime = deferred<MotionRuntime>();
    const loadRuntime = vi.fn(() => pendingRuntime.promise);
    const { container } = renderWithRuntime(loadRuntime);

    await waitFor(() => expect(loadRuntime).toHaveBeenCalledOnce());
    act(() => environment.setSaveData(true));
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced"));
    await act(async () => pendingRuntime.resolve(runtime));

    expect(runtime.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(runtime.gsap.matchMedia).not.toHaveBeenCalled();
  });

  it("reverts active orchestration when reduced motion becomes preferred", async () => {
    const environment = installEnvironment();
    const runtime = createRuntime();
    const { container } = renderWithRuntime(vi.fn().mockResolvedValue(runtime));

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    expect(runtime.media.add).toHaveBeenCalledWith(
      { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
      expect.any(Function),
    );
    act(() => environment.setReducedMotion(true));
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced"));

    expect(runtime.media.revert).toHaveBeenCalledOnce();
  });

  it("reverts active orchestration when Save Data becomes enabled", async () => {
    const environment = installEnvironment();
    const runtime = createRuntime();
    const { container } = renderWithRuntime(vi.fn().mockResolvedValue(runtime));

    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "full"));
    act(() => environment.setSaveData(true));
    await waitFor(() => expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced"));

    expect(runtime.media.revert).toHaveBeenCalledOnce();
  });
});
