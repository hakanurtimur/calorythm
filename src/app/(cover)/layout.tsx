import { PublicationFooter } from "@/components/layout/publication-footer";
import { PublicationHeader } from "@/components/layout/publication-header";

export default function CoverLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PublicationHeader tone="transparent" />
      {children}
      <PublicationFooter />
    </>
  );
}
