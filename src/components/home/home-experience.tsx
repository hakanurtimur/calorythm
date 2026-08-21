import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { OrbitalLink } from "@/components/orbital/orbital-link";
import { OrbitalThreadControlsLoader } from "@/components/orbital/orbital-thread-controls-loader";
import { orbitalHomeContent } from "@/content/orbital-home";
import { HomeMotion } from "./home-motion";
import { HomeSplash } from "./home-splash";
import { OrbitalThreadStage } from "./orbital-thread-stage";
import styles from "./home.module.css";

type EditorialSection = (typeof orbitalHomeContent.sections)[number];

function SceneTitle({ section }: { section: EditorialSection }) {
  return (
    <h2 id={`section-${section.id}-title`}>
      <span>{section.title[0]}</span>{" "}
      <span>{section.title[1]}</span>
    </h2>
  );
}

export function HomeExperience() {
  const [knowledge, stories, clarity, thought, flagship, journal, finale] =
    orbitalHomeContent.sections;

  return (
    <div className={styles.home} data-home-experience="" id="top">
      <OrbitalThreadControlsLoader />
      <HomeSplash />
      <HomeMotion>
        <section aria-labelledby="home-hero-title" className={styles.hero} data-scene="hero">
        <div className={styles.heroViewport} data-pin="hero">
          <header className={styles.siteHeader}>
            <a aria-label="CALORYTHM ana sayfa" className={styles.wordmark} href="#top">
              <BrandWordmark className={styles.wordmarkImage} priority />
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
              <OrbitalLink href="#section-01" variant="orbit">
                {orbitalHomeContent.hero.cta}
              </OrbitalLink>
            </div>

            <div
              aria-hidden="true"
              className={styles.heroMarkFrame}
              data-orbital-anchor="hero"
              data-splash-handoff-target=""
            >
              <OrbitalThreadStage />
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

        <section
        aria-labelledby="section-01-title"
        className={`${styles.scene} ${styles.knowledgeScene}`}
        data-scene="01"
        id="section-01"
      >
        <div className={`${styles.sceneInner} ${styles.knowledgeInner}`}>
          <p aria-hidden="true" className={styles.sceneNumber}>01</p>
          <div aria-hidden="true" className={styles.knowledgeFragments}>
            {orbitalHomeContent.knowledgeFragments.map((fragment, index) => (
              <span data-motion="knowledge-fragment" key={fragment}>
                <small>0{index + 1}</small>{fragment}
              </span>
            ))}
          </div>
          <div className={`${styles.sceneCopy} ${styles.knowledgeCopy}`}>
            <SceneTitle section={knowledge} />
            <p className={styles.sceneBody}>{knowledge.body}</p>
          </div>
        </div>
        </section>

        <section
        aria-labelledby="section-02-title"
        className={`${styles.scene} ${styles.macroScene}`}
        data-scene="02"
        id="section-02"
      >
        <div className={styles.macroViewport} data-pin="02">
          <div className={`${styles.sceneInner} ${styles.macroInner}`}>
            <p aria-hidden="true" className={styles.sceneNumber}>02</p>
            <div className={`${styles.sceneCopy} ${styles.macroCopy}`}>
              <SceneTitle section={stories} />
              <p className={styles.sceneBody}>{stories.body}</p>
            </div>
            <ol aria-label="Makro besin rotaları" className={styles.macroRoutes}>
              {orbitalHomeContent.macroRoutes.map((route, index) => (
                <li
                  data-motion="macro-route"
                  data-tone={route.tone}
                  key={route.id}
                >
                  <span className={styles.routeIndex}>0{index + 1}</span>
                  <div>
                    <h3>{route.title}</h3>
                    <p>{route.statement}</p>
                  </div>
                  <small>{route.detail}</small>
                </li>
              ))}
            </ol>
          </div>
        </div>
        </section>

        <section
        aria-labelledby="section-03-title"
        className={`${styles.scene} ${styles.atlasScene}`}
        data-scene="03"
        id="konular"
      >
        <div className={`${styles.sceneInner} ${styles.atlasInner}`}>
          <p aria-hidden="true" className={styles.sceneNumber}>03</p>
          <div className={`${styles.sceneCopy} ${styles.atlasCopy}`}>
            <SceneTitle section={clarity} />
            <p className={styles.sceneBody}>{clarity.body}</p>
          </div>
          <ol aria-label="Beslenme konuları" className={styles.topicAtlas}>
            {orbitalHomeContent.topicAtlas.map((topic, index) => (
              <li data-motion="topic-atlas-item" key={topic.title}>
                <span>0{index + 1}</span>
                <h3>{topic.title}</h3>
                <p>{topic.note}</p>
              </li>
            ))}
          </ol>
        </div>
        </section>

        <section
        aria-labelledby="section-04-title"
        className={`${styles.scene} ${styles.thoughtScene}`}
        data-scene="04"
        id="section-04"
      >
        <div className={styles.thoughtViewport} data-pin="04">
          <div className={`${styles.sceneInner} ${styles.thoughtInner}`}>
            <p aria-hidden="true" className={styles.sceneNumber}>04</p>
            <div className={`${styles.sceneCopy} ${styles.thoughtCopy}`}>
              <SceneTitle section={thought} />
              <p className={styles.sceneBody}>{thought.body}</p>
              <p className={styles.thoughtEmphasis} data-motion="thought-resolution">
                <span>Amaç yalnızca bilgi vermek değil.</span>
                <strong>Anlaşılmasını sağlamak.</strong>
              </p>
            </div>
          </div>
        </div>
        </section>

        <section
        aria-labelledby="section-05-title"
        className={`${styles.scene} ${styles.flagshipScene}`}
        data-scene="05"
        id="section-05"
      >
        <div className={`${styles.sceneInner} ${styles.flagshipInner}`}>
          <p className={styles.flagshipLabel}>İlk hikâye <span>001</span></p>
          <div className={`${styles.sceneCopy} ${styles.flagshipCopy}`}>
            <SceneTitle section={flagship} />
            <p className={styles.sceneBody}>{flagship.body}</p>
            <p className={styles.flagshipEmphasis}>{flagship.emphasis}</p>
            <OrbitalLink unavailable>Hikâyeyi keşfet</OrbitalLink>
          </div>
          <p aria-hidden="true" className={styles.flagshipNotation}>
            YAPI <i /> ONARIM <i /> ENZİM <i /> SİNYAL
          </p>
        </div>
        </section>

        <section
        aria-labelledby="section-06-title"
        className={`${styles.scene} ${styles.journalScene}`}
        data-scene="06"
        id="journal"
      >
        <div className={`${styles.sceneInner} ${styles.journalInner}`}>
          <div className={styles.journalLead}>
            <p aria-hidden="true" className={styles.sceneNumber}>06</p>
            <div className={`${styles.sceneCopy} ${styles.journalCopy}`}>
              <SceneTitle section={journal} />
              <p>Bir sonraki merakını seç.</p>
            </div>
          </div>
          <ol
            aria-label="Journal konuları"
            className={styles.journalTopics}
            data-journal-orbit=""
          >
            {orbitalHomeContent.journalTopics.map((topic, index) => (
              <li
                data-motion="journal-topic"
                data-tone={topic.tone}
                key={topic.id}
              >
                <span>0{index + 1}</span>
                <div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </div>
                <i aria-hidden="true">↗</i>
              </li>
            ))}
          </ol>
        </div>
        </section>

        <section
        aria-labelledby="section-07-title"
        className={`${styles.scene} ${styles.finaleScene}`}
        data-scene="07"
        id="hakkinda"
      >
        <div className={`${styles.sceneInner} ${styles.finaleInner}`}>
          <p aria-hidden="true" className={styles.sceneNumber}>07</p>
          <div className={`${styles.sceneCopy} ${styles.finaleCopy}`}>
            <SceneTitle section={finale} />
            <p className={styles.sceneBody}>{finale.body}</p>
            <p className={styles.finaleEmphasis}>{finale.emphasis}</p>
            <OrbitalLink href="#journal">Journal’ı keşfet</OrbitalLink>
          </div>
          <footer className={styles.finaleFooter}>
            <a aria-label="CALORYTHM ana sayfa" href="#top">
              <BrandWordmark className={styles.finaleWordmark} />
            </a>
            <span>Beslenme bilimi için bağımsız yayın</span>
            <span>İstanbul · 2026</span>
          </footer>
        </div>
        </section>
      </HomeMotion>
    </div>
  );
}
