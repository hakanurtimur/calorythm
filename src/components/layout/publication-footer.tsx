import Link from "next/link";
import Image from "next/image";
import { getEditorialContactUrl } from "@/lib/editorial-contact";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { PublicationFooterMotion } from "./publication-footer-motion";
import closing from "./publication-closing.module.css";
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
      { accent: true, href: getEditorialContactUrl(), label: "Fikir gönder" },
    ],
  },
] as const;

export function PublicationFooter() {
  return (
    <footer
      className={`${styles.footer} ${closing.footer}`}
      data-footer-reveal-root=""
      data-header-tone="dark"
    >
      <PublicationFooterMotion />

      <div className={closing.signature}>
        <h2 className={closing.motto}>Beslenmenin<em>bi ritmi var.</em></h2>
        <figure className={closing.artwork}>
          <Image
            alt="Armut, incir ve cevizin pirinç kollar üzerinde dengelendiği heykelsi bir ritim kompozisyonu"
            src="/images/calorythm-nutrition-rhythm-v1.webp"
            width={1440}
            height={960}
            sizes="(max-width: 767px) 100vw, 60vw"
          />
        </figure>
      </div>

      <div aria-hidden="true" className={closing.palette}>
        {footerBands.map((tone) => <i key={tone} data-footer-band={tone} style={{ background: `var(--${tone})` }} />)}
      </div>
      <div className={`${styles.footerColophon} ${closing.colophon}`}>
        <div className={`${styles.footerLead} ${closing.lead}`} data-footer-reveal="">
          <Link
            aria-label="CALORYTHM ana sayfa"
            className={styles.footerWordmark}
            href="/"
          >
            <BrandWordmark variant="inverse" />
          </Link>
          <p className={`${styles.footerPromise} ${closing.promise}`}>
            Bağımsız beslenme bilimi yayını.
            Araştırma, bağlam ve görsel anlatım.
          </p>
        </div>

        <div className={`${styles.footerDirectory} ${closing.directory}`} data-footer-reveal="">
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
