import { OrbitalLink } from "@/components/orbital/orbital-link";
import { OrbitalMark } from "@/components/orbital/orbital-mark";
import { orbitalHomeContent } from "@/content/orbital-home";
import { HomeSplash } from "./home-splash";
import styles from "./home.module.css";

function sectionAnchor(id: (typeof orbitalHomeContent.sections)[number]["id"]) {
  if (id === "03") return "konular";
  if (id === "06") return "journal";
  if (id === "07") return "hakkinda";
  return `section-${id}`;
}

export function HomeExperience() {
  return (
    <div className={styles.home} data-home-experience="" id="top">
      <HomeSplash />

      <section aria-labelledby="home-hero-title" className={styles.hero} data-scene="hero">
        <div className={styles.heroViewport} data-pin="hero">
          <header className={styles.siteHeader}>
            <a aria-label="CALORYTHM ana sayfa" className={styles.wordmark} href="#top">
              CALORYTHM
            </a>
            <nav aria-label="Ana navigasyon" className={styles.navigation}>
              {orbitalHomeContent.navigation.map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a className={styles.headerCta} href="#journal">
              Günlük ritim <span aria-hidden="true">↘</span>
            </a>
          </header>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy} data-motion="hero-copy">
              <p className={styles.heroPrelude}>Besin. Beden. Bağlam.</p>
              <h1 aria-label={orbitalHomeContent.hero.title} id="home-hero-title">
                <span>Beslenmenin</span>
                <span>bir ritmi var.</span>
              </h1>
              <p className={styles.heroBody}>{orbitalHomeContent.hero.body}</p>
              <OrbitalLink href="#section-01">{orbitalHomeContent.hero.cta}</OrbitalLink>
            </div>

            <div aria-hidden="true" className={styles.heroMarkFrame} data-motion="hero-mark">
              <OrbitalMark className={styles.heroMark} tone="brand" variant="frame" />
            </div>
          </div>

          <p aria-hidden="true" className={styles.heroNotation}>
            <span>ENERJİ</span>
            <i />
            <span>METABOLİZMA</span>
            <i />
            <span>HAREKET</span>
            <i />
            <span>TOPARLANMA</span>
          </p>
        </div>
      </section>

      {orbitalHomeContent.sections.map((section) => (
        <section
          aria-labelledby={`section-${section.id}-title`}
          className={styles.scene}
          data-scene={section.id}
          id={sectionAnchor(section.id)}
          key={section.id}
        >
          <div className={styles.sceneInner}>
            <p aria-hidden="true" className={styles.sceneNumber}>
              {section.id}
            </p>
            <div className={styles.sceneCopy}>
              <h2 id={`section-${section.id}-title`}>
                <span>{section.title[0]}</span>{" "}
                <span>{section.title[1]}</span>
              </h2>
              {section.body ? <p className={styles.sceneBody}>{section.body}</p> : null}
              {"emphasis" in section ? (
                <p className={styles.sceneEmphasis}>{section.emphasis}</p>
              ) : null}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
