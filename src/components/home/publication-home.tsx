import Image from "next/image";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/content-selectors";
import { topics } from "@/content/topics";
import { publicationHomeContent as copy } from "@/content/publication-home";
import { CalorythmMeasureHero } from "./calorythm-measure-hero";
import { PublicationHomeMotion } from "./publication-home-motion";
import styles from "./publication-home.module.css";

const FLAGSHIP_SLUG = "protein-sadece-kas-icin-degildir";

const bandTones = ["orange", "coral", "ochre", "olive"] as const;

export function PublicationHome() {
  const published = getPublishedArticles();
  const flagship = published.find((article) => article.slug === FLAGSHIP_SLUG)!;
  const notes = published.filter((article) => article.type === "editorial-note");

  return (
    <PublicationHomeMotion>
      <CalorythmMeasureHero />

      <section className={styles.noise} data-home-scene="noise" data-motion-state="start">
        <div aria-hidden="true" className={styles.noiseShutter} data-noise-shutter="" />
        <div className={styles.noiseClaims} aria-hidden="true">
          {copy.noise.claims.map((claim, index) => (
            <span data-noise-fragment="" key={claim} style={{ "--claim-offset": index } as React.CSSProperties}>
              {claim}
            </span>
          ))}
        </div>
        <div className={styles.noiseStatement}>
          <h2>{copy.noise.title}</h2>
          <p>{copy.noise.body}</p>
          <strong>{copy.noise.resolution}</strong>
        </div>
        <div aria-hidden="true" className={styles.annotationLeaders}>
          {bandTones.map((tone) => <i data-band-tone={tone} key={tone} />)}
        </div>
      </section>

      <section className={styles.method} data-home-scene="method" data-motion-state="start">
        <div className={styles.methodCopy}>
          <h2>{copy.method.title}</h2>
          <p className={styles.methodSequence}>{copy.method.sequence}</p>
          <p>{copy.method.body}</p>
        </div>
        <figure className={styles.evidenceFigure}>
          <div className={styles.evidenceSurface}>
            <Image
              alt="Katmanları incelenen makro besin yüzeyi"
              height={1629}
              sizes="(max-width: 767px) 100vw, 56vw"
              src="/images/matter-source.webp"
              width={2172}
            />
            <div aria-hidden="true" className={styles.evidenceSlices}>
              <i data-evidence-slice="source" />
              <i data-evidence-slice="strength" />
              <i data-evidence-slice="context" />
            </div>
          </div>
          <figcaption>Kaynak yüzeyi, kanıtın gücü ve bağlam birlikte okunur.</figcaption>
        </figure>
      </section>

      <section className={styles.flagship} data-home-scene="flagship" data-motion-state="start">
        <svg aria-hidden="true" className={styles.fiberScore} preserveAspectRatio="none" viewBox="0 0 1600 900">
          <path data-fiber-path="structure" d="M -80 610 C 240 350 430 690 780 470 S 1260 220 1690 410" />
          <path data-fiber-path="catalysis" d="M -80 655 C 250 395 460 730 790 505 S 1260 270 1690 455" />
          <path data-fiber-path="transport" d="M -80 700 C 270 450 490 760 825 555 S 1290 320 1690 510" />
          <path data-fiber-path="signal" d="M -80 745 C 290 510 520 790 860 605 S 1320 380 1690 565" />
        </svg>
        <div className={styles.flagshipCopy}>
          <p className={styles.flagshipLabel}>{copy.flagship.label}</p>
          <h2>{flagship.title}</h2>
          <p className={styles.flagshipDeck}>{flagship.deck}</p>
          <p className={styles.flagshipMetadata}>{copy.flagship.metadata}</p>
          <Link className={styles.primaryLink} href={`/journal/${flagship.slug}`}>
            {copy.flagship.cta}<span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className={styles.journal} data-home-scene="journal" data-motion-state="start">
        <header className={styles.journalHeader}>
          <h2>{copy.journal.title}</h2>
          <p>{copy.journal.introduction}</p>
        </header>
        <div className={styles.journalRiver}>
          <article className={styles.leadStory}>
            <i aria-hidden="true" data-journal-baseline="" />
            <p>Görsel dosya · 9 dakika</p>
            <h3>
              <Link href={`/journal/${flagship.slug}`}>{flagship.title}</Link>
            </h3>
            <p>{flagship.deck}</p>
            <span>Protein · CALORYTHM Editorya</span>
          </article>
          <div className={styles.editorialNotes}>
            {notes.map((article, index) => (
              <article className={styles.note} key={article.slug}>
                <i aria-hidden="true" data-journal-baseline="" />
                <p>Editoryal not · {article.readingMinutes} dakika</p>
                <h3>
                  <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                </h3>
                <p>{article.deck}</p>
                <span>{index === 0 ? "Örüntüyü okumak" : "Sayının bağlamı"}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.topicAtlas} data-home-scene="topics">
        <header className={styles.topicHeader}>
          <h2>{copy.topics.title}</h2>
          <p>{copy.topics.introduction}</p>
        </header>
        <div aria-hidden="true" className={styles.topicCursor} data-topic-cursor="" />
        <ol className={styles.topicList}>
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link data-topic-row={topic.slug} href={`/topics/${topic.slug}`}>
                <span>{topic.title}</span>
                <p>{topic.definition}</p>
                <b aria-hidden="true">↗</b>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.contribution} data-home-scene="contribution" data-motion-state="start">
        <div aria-hidden="true" className={styles.convergence}>
          {bandTones.map((tone) => <i data-converging-band={tone} key={tone} />)}
          <Image alt="" height={240} src="/brand/calorythm-ring-white.svg" unoptimized width={240} />
        </div>
        <div className={styles.contributionCopy}>
          <h2>{copy.contribution.title}</h2>
          <p>{copy.contribution.body}</p>
          <Link className={styles.finalLink} href="/about#katki">
            {copy.contribution.cta}<span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </PublicationHomeMotion>
  );
}
