import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { PublicationFooterMotion } from "./publication-footer-motion";
import styles from "./publication-shell.module.css";

const footerBands = ["orange", "coral", "ochre", "olive"] as const;

const footerGroups = [
  {
    label: "Oku",
    links: [
      { href: "/journal", label: "Yazılar" },
      { href: "/topics", label: "Konu Atlası" },
      {
        href: "/journal/protein-sadece-kas-icin-degildir",
        label: "Protein dosyası",
      },
    ],
  },
  {
    label: "Yayın",
    links: [
      { href: "/about", label: "CALORYTHM nedir?" },
      { href: "/about#editorial-method", label: "Editoryal yöntem" },
    ],
  },
  {
    label: "Katkı",
    links: [
      { href: "/about#katki", label: "Katkı ilkeleri" },
      { accent: true, href: "/about#katki", label: "Fikir gönder" },
    ],
  },
] as const;

export function PublicationFooter() {
  return (
    <footer
      className={styles.footer}
      data-footer-reveal-root=""
      data-header-tone="dark"
    >
      <PublicationFooterMotion />

      <div aria-hidden="true" className={styles.footerBands} data-footer-reveal="">
        {footerBands.map((tone) => (
          <i data-footer-band={tone} key={tone} />
        ))}
      </div>

      <div className={styles.footerColophon}>
        <div className={styles.footerLead} data-footer-reveal="">
          <Link
            aria-label="CALORYTHM ana sayfa"
            className={styles.footerWordmark}
            href="/"
          >
            <BrandWordmark variant="inverse" />
          </Link>
          <p className={styles.footerPromise}>
            Beslenme bilimini kaynak, bağlam ve güçlü görsel anlatımla yayımlayan
            bağımsız bir web dergisi.
          </p>
        </div>

        <div className={styles.footerDirectory} data-footer-reveal="">
          {footerGroups.map((group) => (
            <nav aria-label={group.label} className={styles.footerGroup} key={group.label}>
              <p className={styles.footerGroupTitle}>{group.label}</p>
              <ul className={styles.footerLinkList}>
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      className={"accent" in item ? styles.footerCta : undefined}
                      href={item.href}
                    >
                      <span>{item.label}</span>
                      {"accent" in item ? <span aria-hidden="true">↗</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.footerLegal} data-footer-reveal="">
          <span>© 2026 CALORYTHM</span>
          <span aria-hidden="true" className={styles.footerLegalSeparator}> · </span>
          <span>Bağımsız yayın</span>
          <span aria-hidden="true" className={styles.footerLegalSeparator}> · </span>
          <span>İçerikler kişisel sağlık önerisi değildir.</span>
        </div>
      </div>
    </footer>
  );
}
