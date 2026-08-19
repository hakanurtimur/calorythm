import { homeContent } from "@/content/home";
import styles from "./home-scenes.module.css";

export function Scene01Hero() {
  const { hero } = homeContent;

  return (
    <section aria-label="Sahne 01: Uyanış" className={`${styles.scene} ${styles.hero}`} data-scene="01" id="uyanış">
      <div aria-hidden="true" className={styles.heroForm} data-motion="hero-form" />
      <div className={styles.copy}>
        <p className={styles.eyebrow} data-motion="hero-eyebrow">
          {hero.eyebrow}
        </p>
        <h1 className={styles.heroTitle} data-motion="hero-title">
          {hero.title}
        </h1>
        <p className={styles.description} data-motion="hero-description">
          {hero.description}
        </p>
        <a className={styles.cta} data-motion="hero-cta" href="#madde">
          {hero.cta}
        </a>
      </div>
    </section>
  );
}
