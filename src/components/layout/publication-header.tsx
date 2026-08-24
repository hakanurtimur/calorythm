import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { PublicationMenu } from "./publication-menu";
import styles from "./publication-shell.module.css";

export type PublicationHeaderTone = "solid" | "transparent";

export type PublicationNavigationItem = Readonly<{
  href: string;
  label: string;
}>;

export const publicationNavigation: readonly PublicationNavigationItem[] = [
  { href: "/journal", label: "Journal" },
  { href: "/topics", label: "Konular" },
  { href: "/about", label: "Hakkında" },
];

type PublicationHeaderProps = Readonly<{
  tone?: PublicationHeaderTone;
}>;

export function PublicationHeader({ tone = "transparent" }: PublicationHeaderProps) {
  return (
    <header className={styles.header} data-tone={tone}>
      <Link aria-label="CALORYTHM ana sayfa" className={styles.wordmark} href="/">
        <BrandWordmark priority />
      </Link>
      <nav aria-label="Ana navigasyon" className={styles.primaryNavigation}>
        {publicationNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        <Link className={styles.contributeLink} href="/about#katki">
          Yazar olarak katıl
        </Link>
      </nav>
      <PublicationMenu items={publicationNavigation} />
    </header>
  );
}
