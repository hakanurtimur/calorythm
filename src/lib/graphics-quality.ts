export type GraphicsQuality = "static" | "low" | "high";

export type GraphicsProfileInput = {
  width: number;
  dpr: number;
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory?: number;
};

export function deriveGraphicsQuality(input: GraphicsProfileInput): GraphicsQuality {
  if (input.reducedMotion || input.saveData) return "static";
  if (input.width < 768 || (input.deviceMemory !== undefined && input.deviceMemory <= 4)) return "low";
  return "high";
}
