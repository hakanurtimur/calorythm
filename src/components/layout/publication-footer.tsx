import Link from "next/link";
import { publicationNavigation } from "./publication-header";
import styles from "./publication-shell.module.css";

export function PublicationFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footerMark}>CALORYTHM</p>
      <div className={styles.footerContent}>
        <p>Beslenme bilimi üzerine bağımsız yayın.</p>
        <nav aria-label="Alt navigasyon" className={styles.footerNavigation}>
          {publicationNavigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/about#katki">Yazar olarak katıl</Link>
        </nav>
      </div>
    </footer>
  );
}
