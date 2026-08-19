export function probeWebGL2Support(canvas: HTMLCanvasElement): boolean {
  try {
    const context = canvas.getContext("webgl2");
    if (!context) return false;

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
