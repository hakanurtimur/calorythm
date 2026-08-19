import "@fontsource-variable/bodoni-moda/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CALORYTHM",
  description: "Beslenmenin bir ritmi var.",
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
