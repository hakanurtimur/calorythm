import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { PublicationHeaderSurface } from "./publication-header-surface";
import { PublicationMenu } from "./publication-menu";
import styles from "./publication-shell.module.css";

export type PublicationHeaderTone = "solid" | "transparent";

export type PublicationNavigationItem = Readonly<{
  href: string;
  label: string;
}>;

export const publicationNavigation: readonly PublicationNavigationItem[] = [
  { href: "/journal", label: "Yazılar" },
  { href: "/topics", label: "Konu Atlası" },
  { href: "/about", label: "Yayın" },
];

type PublicationHeaderProps = Readonly<{
  tone?: PublicationHeaderTone;
}>;

export function PublicationHeader({ tone = "transparent" }: PublicationHeaderProps) {
  const initialSurface = "light" as const;

  return (
    <header
      className={styles.header}
      data-compact="false"
      data-surface={initialSurface}
      data-tone={tone}
      id="publication-header"
    >
      <Link aria-label="CALORYTHM ana sayfa" className={styles.wordmark} href="/">
        <span className={styles.wordmarkPrimary}>
          <BrandWordmark priority />
        </span>
        <span aria-hidden="true" className={styles.wordmarkInverse}>
          <BrandWordmark priority variant="inverse" />
        </span>
      </Link>
      <nav aria-label="Ana navigasyon" className={styles.primaryNavigation}>
        {publicationNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        <Link className={styles.contributeLink} href="/about#katki">
          Fikir gönder
        </Link>
      </nav>
      <PublicationMenu items={publicationNavigation} />
      <PublicationHeaderSurface
        fallbackTone={initialSurface}
        headerId="publication-header"
      />
    </header>
  );
}
