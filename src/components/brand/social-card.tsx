import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "CALORYTHM — Bağımsız beslenme bilimi yayını";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const artwork = await readFile(join(process.cwd(), "public/images/calorythm-editorial-echo-v1.png"));

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#171811", color: "#f4f1e7" }}>
      {/* ImageResponse renders an embedded local asset without a network dependency. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires a native image element. */}
      <img src={`data:image/png;base64,${artwork.toString("base64")}`} alt="" width={1120} height={630} style={{ position: "absolute", right: -160, top: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", width: 690, padding: "64px 0 64px 64px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 7 }}>CALORYTHM</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.08, maxWidth: 610 }}>Beslenmeyi anlamak için.</div>
          <div style={{ display: "flex", fontSize: 25, marginTop: 30 }}>Bağımsız beslenme bilimi yayını.</div>
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "#d4c9ad" }}>ARAŞTIRMA · BAĞLAM · GÖRSEL ANLATIM</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", height: 10 }}>
        {["#dba45d", "#cf8674", "#b9a366", "#a5ad83"].map((color) => <div key={color} style={{ display: "flex", width: "25%", background: color }} />)}
      </div>
    </div>,
    size,
  );
}
