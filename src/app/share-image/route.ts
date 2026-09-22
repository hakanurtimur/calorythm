import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

// Preserve previously shared image URLs while serving the same static brand card.
export async function GET() {
  const image = await readFile(join(process.cwd(), "public/brand/og-image.png"));
  return new Response(image, { headers: { "Content-Type": "image/png" } });
}
