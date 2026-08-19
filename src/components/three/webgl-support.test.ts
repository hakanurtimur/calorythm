import { describe, expect, it, vi } from "vitest";
import { probeWebGL2Support } from "./webgl-support";

describe("probeWebGL2Support", () => {
  it("rejects a WebGL 1 only canvas without requesting a legacy context", () => {
    const getContext = vi.fn((contextId: string) => (contextId === "webgl" ? {} : null));
    const canvas = { getContext } as unknown as HTMLCanvasElement;

    expect(probeWebGL2Support(canvas)).toBe(false);
    expect(getContext).toHaveBeenCalledOnce();
    expect(getContext).toHaveBeenCalledWith("webgl2");
  });

  it("releases a successful temporary WebGL 2 context", () => {
    const loseContext = vi.fn();
    const getExtension = vi.fn(() => ({ loseContext }));
    const canvas = {
      getContext: vi.fn(() => ({ getExtension })),
    } as unknown as HTMLCanvasElement;

    expect(probeWebGL2Support(canvas)).toBe(true);
    expect(getExtension).toHaveBeenCalledWith("WEBGL_lose_context");
    expect(loseContext).toHaveBeenCalledOnce();
  });
});
