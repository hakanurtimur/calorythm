import "@fontsource-variable/bodoni-moda/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import type { Metadata, Viewport } from "next";
import { PublicationFooter } from "@/components/layout/publication-footer";
import { PublicationHeader } from "@/components/layout/publication-header";
import "./globals.css";

export const metadata: Metadata = {
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
        <PublicationHeader />
        {children}
        <PublicationFooter />
      </body>
    </html>
  );
}
