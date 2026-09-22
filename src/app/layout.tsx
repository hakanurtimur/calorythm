import "@fontsource-variable/bodoni-moda/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://calorythm.com.tr"),
  openGraph: {
    title: "CALORYTHM — Bağımsız beslenme bilimi yayını",
    description: "Beslenme bilimini kaynak, bağlam ve güçlü görsel anlatımla keşfet.",
    siteName: "CALORYTHM",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "CALORYTHM — Bağımsız beslenme bilimi yayını" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CALORYTHM — Bağımsız beslenme bilimi yayını",
    description: "Beslenme bilimini kaynak, bağlam ve güçlü görsel anlatımla keşfet.",
    images: ["/brand/og-image.png"],
  },
  title: { default: "CALORYTHM", template: "%s | CALORYTHM" },
  description:
    "Beslenme bilimini güvenilir kaynaklarla ele alan bağımsız dijital dergi.",
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <a className="skip-link" href="#ana-icerik">
          Ana içeriğe geç
        </a>
        {children}
      </body>
    </html>
  );
}
