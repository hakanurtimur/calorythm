import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResponseField } from "./response-field";

type TestCanvasContext = CanvasRenderingContext2D & {
  arc: ReturnType<typeof vi.fn>;
};

class TestResizeObserver {
  static instances: TestResizeObserver[] = [];

  disconnected = false;

  constructor(private readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }

  disconnect() {
    this.disconnected = true;
  }

  observe() {}

  unobserve() {}

  emit(width: number, height: number) {
    this.callback([{ contentRect: { width, height } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
}

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = [];

  disconnected = false;

  constructor(private readonly callback: IntersectionObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }

  disconnect() {
    this.disconnected = true;
  }

  observe() {}

  takeRecords() {
    return [];
  }

  unobserve() {}

  emit(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

function createCanvasContext(): TestCanvasContext {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    globalAlpha: 1,
    lineCap: "butt",
    lineWidth: 1,
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
  } as unknown as TestCanvasContext;
}

describe("ResponseField", () => {
  let context: TestCanvasContext;
  let reducedMotion = false;
  let transformedWidth = 400;
  let transformedHeight = 200;
  let nextAnimationFrame = 1;
  let animationFrames: Map<number, FrameRequestCallback>;

  beforeEach(() => {
    reducedMotion = false;
    transformedWidth = 400;
    transformedHeight = 200;
    nextAnimationFrame = 1;
    context = createCanvasContext();
    animationFrames = new Map();
    TestResizeObserver.instances = [];
    TestIntersectionObserver.instances = [];

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1_440 });
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(prefers-reduced-motion: reduce)" ? reducedMotion : false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    });

    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          bottom: transformedHeight,
          height: transformedHeight,
          left: 0,
          right: transformedWidth,
          top: 0,
          width: transformedWidth,
          x: 0,
          y: 0,
          toJSON: () => undefined,
        }) as DOMRect,
    );
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = nextAnimationFrame;
      nextAnimationFrame += 1;
      animationFrames.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      animationFrames.delete(id);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sizes the backing store from untransformed ResizeObserver dimensions", () => {
    transformedWidth = 160;
    transformedHeight = 80;
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 });
    const { container } = render(<ResponseField />);
    const canvas = container.querySelector("canvas")!;

    act(() => TestResizeObserver.instances[0]!.emit(400, 200));

    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(300);
  });

  it("draws 64 particles at high quality", () => {
    render(<ResponseField />);
    context.arc.mockClear();

    act(() => TestResizeObserver.instances[0]!.emit(400, 200));

    expect(context.arc).toHaveBeenCalledTimes(64);
  });

  it("draws 28 particles at low quality", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<ResponseField />);
    context.arc.mockClear();

    act(() => TestResizeObserver.instances[0]!.emit(390, 200));

    expect(context.arc).toHaveBeenCalledTimes(28);
  });

  it("renders no canvas at static quality", () => {
    reducedMotion = true;

    const { container } = render(<ResponseField />);

    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("invalidates the backing store when DPR changes without a quality change", () => {
    const { container } = render(<ResponseField />);
    const canvas = container.querySelector("canvas")!;
    Object.defineProperty(canvas, "clientWidth", { configurable: true, value: 400 });
    Object.defineProperty(canvas, "clientHeight", { configurable: true, value: 200 });
    act(() => TestResizeObserver.instances[0]!.emit(400, 200));
    expect(canvas.width).toBe(400);

    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 });
    act(() => window.dispatchEvent(new Event("resize")));

    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(300);
  });

  it("runs one RAF only while visible and cleans up its lifecycle", () => {
    const { unmount } = render(<ResponseField />);
    const resizeObserver = TestResizeObserver.instances[0]!;
    const intersectionObserver = TestIntersectionObserver.instances[0]!;

    expect(animationFrames).toHaveLength(0);
    act(() => intersectionObserver.emit(true));
    expect(animationFrames).toHaveLength(1);

    const [frameId, frame] = animationFrames.entries().next().value!;
    animationFrames.delete(frameId);
    act(() => frame(16));
    expect(animationFrames).toHaveLength(1);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(animationFrames).toHaveLength(0);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(animationFrames).toHaveLength(1);

    act(() => intersectionObserver.emit(false));
    expect(animationFrames).toHaveLength(0);
    act(() => intersectionObserver.emit(true));
    expect(animationFrames).toHaveLength(1);

    const resizeCallsBeforeUnmount = vi.mocked(context.setTransform).mock.calls.length;
    unmount();
    expect(animationFrames).toHaveLength(0);
    expect(resizeObserver.disconnected).toBe(true);
    expect(intersectionObserver.disconnected).toBe(true);

    window.dispatchEvent(new Event("resize"));
    expect(context.setTransform).toHaveBeenCalledTimes(resizeCallsBeforeUnmount);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(animationFrames).toHaveLength(0);
  });
});
