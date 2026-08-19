import Link from "next/link";
import styles from "../scenes/home-scenes.module.css";

export function SiteHeader() {
  return (
    <header className={styles.siteHeader}>
      <Link aria-label="CALORYTHM ana sayfa" className={styles.wordmark} data-motion="site-wordmark" href="/">
        CALORYTHM
      </Link>
      <nav aria-label="Ana navigasyon" className={styles.prototypeNav}>
        <span aria-disabled="true">Journal</span>
        <span aria-disabled="true">Konular</span>
        <span aria-disabled="true">Hakkında</span>
      </nav>
    </header>
  );
}
