import Image from "next/image";
import Link from "next/link";
import { JournalMotion } from "@/components/journal/journal-motion";
import { getPublishedArticles } from "@/lib/content-selectors";
import { buildRhythmRailPath } from "@/lib/rhythm-rail-geometry";
import styles from "./journal.module.css";

const turkishDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const evidenceLines = [
  { id: "claim", label: "İddia", x: 42 },
  { id: "source", label: "Kaynak", x: 66 },
  { id: "context", label: "Bağlam", x: 90 },
  { id: "editorial", label: "Editorya", x: 114 },
] as const;

const companionVisuals = [
  {
    alt: "Protein liflerinin katmanlı doku kompozisyonu",
    src: "/images/protein-story/protein-material-v1.webp",
  },
  {
    alt: "Sindirim sırasında parçalanan protein dokularının görsel yorumu",
    src: "/images/protein-story/protein-digestion-v1.webp",
  },
] as const;

function formatPublicationDate(date: string) {
  return turkishDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export default function JournalPage() {
  const articles = getPublishedArticles();
  const flagship = articles.find((article) => article.type === "visual-essay") ?? articles[0];
  const notes = articles.filter((article) => article.slug !== flagship?.slug);

  if (!flagship) return null;

  return (
    <main className={styles.journal} id="ana-icerik" tabIndex={-1}>
      <JournalMotion>
        <section
          className={styles.cover}
          data-header-tone="dark"
          data-journal-cover=""
        >
          <div className={styles.coverGrid}>
            <header className={styles.coverCopy} data-journal-cover-copy="">
              <p className={styles.imprint}>CALORYTHM JOURNAL</p>
              <h1>
                <span>Kaynakları açık.</span>
                <span>Sınırları görünür.</span>
              </h1>
              <p className={styles.coverLead}>
                Beslenme bilimi üzerine görsel dosyalar ve kısa editoryal notlar.
              </p>
              <p className={styles.coverPrinciple}>
                Her yazıda iddiayı, dayandığı kaynağı ve geçerli olduğu bağlamı
                birlikte görünür kılarız.
              </p>
            </header>

            <article
              className={styles.flagship}
              data-editorial-role="flagship"
              data-journal-entry=""
              data-journal-index="00"
            >
              <figure
                className={styles.flagshipVisual}
                data-journal-cover-image=""
                data-journal-entry-visual=""
              >
                <Image
                  alt="Protein dosyasının kapak görseli"
                  fill
                  priority
                  sizes="(max-width: 760px) 100vw, 64vw"
                  src="/images/calorythm-protein-flagship-v1.webp"
                />
                <div aria-hidden="true" className={styles.coverRegister}>
                  <span>Güncel odak</span>
                  <strong>Protein</strong>
                </div>
              </figure>

              <div className={styles.flagshipCopy}>
                <p className={styles.storyType}>Öne çıkan · Görsel dosya</p>
                <h2>
                  <Link href={`/journal/${flagship.slug}`}>{flagship.title}</Link>
                </h2>
                <p className={styles.storyDeck}>{flagship.deck}</p>
                <div className={styles.storyMeta}>
                  <Link href={`/topics/${flagship.topics[0]}`}>Protein</Link>
                  <span>{flagship.readingMinutes} dakika okuma</span>
                  <time dateTime={flagship.publishedAt}>
                    {formatPublicationDate(flagship.publishedAt)}
                  </time>
                </div>
                <Link
                  aria-label={`${flagship.title} dosyasını aç`}
                  className={styles.primaryCta}
                  href={`/journal/${flagship.slug}`}
                >
                  <span>Dosyayı aç</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </div>

          <div aria-hidden="true" className={styles.coverFolio}>
            <span>Beslenme bilimi</span>
            <span>Görsel anlatı</span>
            <span>Bağımsız yayın</span>
          </div>
        </section>

        <section
          aria-labelledby="kisa-okumalar-baslik"
          className={styles.content}
          data-header-tone="light"
          data-journal-content=""
        >
          <div aria-hidden="true" className={styles.evidenceRailWrap}>
            <svg
              className={styles.evidenceRail}
              data-evidence-rail=""
              preserveAspectRatio="none"
              viewBox="0 0 320 1200"
            >
              {evidenceLines.map(({ id, x }, index) => (
                <path
                  d={buildRhythmRailPath({
                    baseX: x,
                    height: 1200,
                    targetY: 600,
                    tipX: x,
                  })}
                  data-evidence-line={id}
                  data-evidence-line-index={index}
                  key={id}
                  pathLength="1"
                />
              ))}
            </svg>
          </div>

          <header className={styles.contentHeader}>
            <div>
              <p>Kısa okumalar</p>
              <h2 id="kisa-okumalar-baslik">Bir fikri, bağlamı içinde oku.</h2>
            </div>
            <div className={styles.evidenceLegend}>
              {evidenceLines.map(({ id, label }) => (
                <span data-evidence-label={id} key={id}>
                  {label}
                </span>
              ))}
            </div>
          </header>

          <div className={styles.storyFlow}>
            {notes.map((article, index) => {
              const visual = companionVisuals[index] ?? companionVisuals[0];
              const articleIndex = String(index + 1).padStart(2, "0");

              return (
                <article
                  className={`${styles.note} ${index % 2 === 0 ? styles.noteWarm : styles.noteDark}`}
                  data-editorial-role="note"
                  data-journal-entry=""
                  data-journal-index={articleIndex}
                  key={article.slug}
                >
                  <figure className={styles.noteVisual} data-journal-entry-visual="">
                    <Image
                      alt={visual.alt}
                      fill
                      sizes="(max-width: 760px) 100vw, 58vw"
                      src={visual.src}
                    />
                  </figure>

                  <div className={styles.noteCopy}>
                    <div className={styles.noteMetaTop}>
                      <span>Editoryal not · Protein</span>
                      <span>{article.readingMinutes} dakika okuma</span>
                    </div>
                    <h2>
                      <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <p>{article.deck}</p>
                    <div className={styles.noteFooter}>
                      <time dateTime={article.publishedAt}>
                        {formatPublicationDate(article.publishedAt)}
                      </time>
                      <Link
                        aria-label={`${article.title} notu oku`}
                        className={styles.noteCta}
                        href={`/journal/${article.slug}`}
                      >
                        <span>Notu oku</span>
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.continueReading}>
            <p>Okumaya bir konunun izini sürerek devam et.</p>
            <Link href="/topics">
              Konu Atlası’na geç <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </JournalMotion>
    </main>
  );
}
