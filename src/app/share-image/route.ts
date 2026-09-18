import OpenGraphImage from "@/components/brand/social-card";

export const dynamic = "force-static";

export async function GET() {
  return OpenGraphImage();
}
