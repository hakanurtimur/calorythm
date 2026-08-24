import { PublicationFooter } from "@/components/layout/publication-footer";
import { PublicationHeader } from "@/components/layout/publication-header";

export default function PublicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PublicationHeader tone="solid" />
      {children}
      <PublicationFooter />
    </>
  );
}
