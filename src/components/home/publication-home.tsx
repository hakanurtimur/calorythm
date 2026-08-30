import Image from "next/image";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/content-selectors";
import { topics } from "@/content/topics";
import { publicationHomeContent as copy } from "@/content/publication-home";
import { CalorythmMeasureHero } from "./calorythm-measure-hero";
import { contributionLinePaths } from "./publication-home-contribution-geometry";
import { buildJournalLinePath } from "./publication-home-journal-geometry";
import { PublicationHomeMotion } from "./publication-home-motion";
import styles from "./publication-home.module.css";

const FLAGSHIP_SLUG = "protein-sadece-kas-icin-degildir";
const FOLIO_BASE_SRC = "/images/calorythm-folio-base-branded-v2.webp";
const PROTEIN_FLAGSHIP_SRC = "/images/calorythm-protein-flagship-v1.webp";
const CONTRIBUTION_ECHO_SRC = "/images/calorythm-editorial-echo-v1.png";

const proteinRoles = [
  { id: "structure", label: "Yapı" },
  { id: "catalysis", label: "Kataliz" },
  { id: "transport", label: "Taşıma" },
  { id: "signal", label: "Sinyal" },
  { id: "defense", label: "Savunma" },
] as const;

const rhythmBandSequence = [
  { id: "claim", tone: "orange" },
  { id: "source", tone: "coral" },
  { id: "context", tone: "ochre" },
  { id: "editorial", tone: "olive" },
] as const;
const journalLineBaseX = [78, 122, 166, 210] as const;
const folioPages = [
  {
    id: "physiology",
    label: "Sindirim ve emilim",
    number: "01",
    src: "/images/calorythm-folio-page-physiology-v2.webp",
  },
  {
    id: "structure",
    label: "Besinin mikro yapısı",
    number: "02",
    src: "/images/calorythm-folio-page-structure-v2.webp",
  },
  {
    id: "metabolism",
    label: "Metabolizma",
    number: "03",
    src: "/images/calorythm-folio-page-metabolism-v2.webp",
  },
  {
    id: "research",
    label: "Araştırma verisi",
    number: "04",
    src: "/images/calorythm-folio-page-research-v2.webp",
  },
] as const;
const noiseApostropheOffsets = [-63, -21, 21, 63] as const;
const noiseApostropheFeederOffsets = [-54, -18, 18, 54] as const;
const noiseApostrophePath = [
  "M 1120 960",
  "C 968 960 850 944 752 908",
  "C 606 854 520 744 548 606",
  "C 576 463 714 369 850 409",
  "C 966 443 1017 564 978 676",
  "C 938 786 818 837 720 786",
  "C 636 742 610 641 660 570",
  "C 705 506 793 493 850 542",
  "C 896 582 896 651 858 690",
  "C 825 724 768 732 732 702",
].join(" ");
const noiseApostropheFeederPath = (index: number) => {
  const xOffset = noiseApostropheFeederOffsets[index] ?? 0;
  const yOffset = noiseApostropheOffsets[index] ?? 0;

  return [
    `M ${1038 + xOffset} -160`,
    `C ${1038 + xOffset} 180 ${1060 + xOffset * 0.45} 620 1120 ${960 + yOffset}`,
  ].join(" ");
};

export function PublicationHome() {
  const published = getPublishedArticles();
  const flagship = published.find((article) => article.slug === FLAGSHIP_SLUG)!;
  const notes = published.filter((article) => article.type === "editorial-note");
  const journalStories = [flagship, ...notes.slice(0, 2)];

  return (
    <PublicationHomeMotion>
      <CalorythmMeasureHero />

      <section className={styles.noise} data-header-tone="dark" data-home-scene="noise" data-motion-state="start">
        <p className={styles.noiseIndex}>01 / Editoryal filtre</p>
        <div className={styles.noiseStatement}>
          <h2>{copy.noise.title}</h2>
          <p>{copy.noise.body}</p>
          <strong>{copy.noise.resolution}</strong>
        </div>
        <svg
          aria-hidden="true"
          className={styles.noiseApostrophe}
          data-testid="noise-apostrophe"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1080 1120"
        >
          <g aria-hidden="true">
            {rhythmBandSequence.map(({ id }, index) => (
              <path
                className={styles.noiseApostropheBase}
                d={noiseApostrophePath}
                data-noise-apostrophe-base={id}
                key={`base-${id}`}
                strokeLinecap="round"
                transform={`translate(0 ${noiseApostropheOffsets[index]})`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <g aria-hidden="true">
            {rhythmBandSequence.map(({ id, tone }, index) => (
              <path
                className={styles.noiseApostropheFeeder}
                d={noiseApostropheFeederPath(index)}
                data-band-tone={tone}
                data-noise-apostrophe-feeder={id}
                key={`feeder-${id}`}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <g aria-hidden="true">
            {rhythmBandSequence.map(({ id, tone }, index) => (
              <path
                className={styles.noiseApostropheBand}
                d={noiseApostrophePath}
                data-band-tone={tone}
                data-noise-apostrophe-band={id}
                key={id}
                strokeLinecap="round"
                transform={`translate(0 ${noiseApostropheOffsets[index]})`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>
      </section>

      <section
        aria-labelledby="folio-story-title"
        className={styles.method}
        data-header-tone="light"
        data-home-scene="method"
        data-motion-state="start"
      >
        <figure className={styles.folioFigure}>
          <div className={styles.folioStage} data-folio-stage="">
            <div className={styles.folioArtwork}>
              <Image
                alt="Mermer bir editörün açık CALORYTHM foliosundan beslenme biliminin farklı katmanlarını gösteren sayfalar yükseliyor."
                className={styles.folioBase}
                data-folio-base=""
                height={941}
                sizes="(max-width: 1023px) 100vw, 82vw"
                src={FOLIO_BASE_SRC}
                width={1672}
              />
              <div aria-hidden="true" className={styles.folioSheets}>
                {folioPages.map(({ id, label, number, src }) => (
                  <article
                    className={styles.folioPage}
                    data-folio-page={id}
                    key={id}
                  >
                    <Image
                      alt=""
                      className={styles.folioPageImage}
                      data-folio-page-image=""
                      height={1200}
                      sizes="(max-width: 1023px) 24vw, 16vw"
                      src={src}
                      width={900}
                    />
                    <span
                      className={styles.folioPageLabel}
                      data-folio-page-label={id}
                    >
                      <i>{number}</i>
                      <b>{label}</b>
                    </span>
                    <span className={styles.folioPageFooter}>CALORYTHM / VISUAL FILE</span>
                  </article>
                ))}
              </div>
              <div
                aria-hidden="true"
                className={styles.folioForeground}
                data-folio-foreground=""
              >
                <Image
                  alt=""
                  height={941}
                  sizes="(max-width: 1023px) 100vw, 82vw"
                  src={FOLIO_BASE_SRC}
                  width={1672}
                />
              </div>
            </div>
          </div>
          <figcaption className={styles.folioCaption}>{copy.method.caption}</figcaption>
        </figure>

        <div className={styles.folioCopy}>
          <div className={styles.folioCopyRail}>
            {copy.method.beats.map((beat, index) => {
              const Heading = index === 0 ? "h2" : "h3";

              return (
                <article
                  className={styles.folioBeat}
                  data-folio-beat={beat.id}
                  key={beat.id}
                >
                  <p className={styles.folioBeatLabel}>{beat.label}</p>
                  <Heading id={index === 0 ? "folio-story-title" : undefined}>
                    {beat.title}
                  </Heading>
                  <p className={styles.folioBeatBody}>{beat.body}</p>
                </article>
              );
            })}
          </div>
          <div aria-hidden="true" className={styles.folioMeter}>
            <span>Dosya açılıyor</span>
            <i><b data-folio-progress-fill="" /></i>
            <span>04 katman</span>
          </div>
        </div>
      </section>

      <section className={styles.flagship} data-header-tone="dark" data-home-scene="flagship" data-motion-state="start">
        <div className={styles.flagshipStage} data-protein-flagship-stage="">
          <figure
            aria-labelledby="protein-flagship-title"
            className={styles.flagshipVisual}
          >
            <Image
              alt="Mermer bir beden üzerinde proteinin farklı görevlerini temsil eden beş oyuk doku"
              className={styles.flagshipImage}
              data-protein-flagship-image=""
              height={941}
              sizes="(max-width: 767px) 100vw, 100vw"
              src={PROTEIN_FLAGSHIP_SRC}
              width={1672}
            />
            <ol
              aria-label="Proteinin bedendeki beş görevi"
              className={styles.proteinRoles}
            >
              {proteinRoles.map((role) => (
                <li data-role-position={role.id} key={role.id}>
                  <span data-protein-role={role.id}>{role.label}</span>
                </li>
              ))}
            </ol>
          </figure>

          <div className={styles.flagshipCopy}>
            <p className={styles.flagshipLabel}>{copy.flagship.label}</p>
            <h2 data-protein-flagship-title="" id="protein-flagship-title">
              {flagship.title}
            </h2>
            <p className={styles.flagshipDeck} data-protein-flagship-deck="">
              {flagship.deck}
            </p>
            <p className={styles.flagshipMetadata}>{copy.flagship.metadata}</p>
            <Link
              className={styles.primaryLink}
              data-protein-flagship-cta=""
              href={`/journal/${flagship.slug}`}
            >
              {copy.flagship.cta}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="journal-title"
        className={styles.journal}
        data-header-tone="light"
        data-home-scene="journal"
        data-motion-state="start"
      >
        <header className={styles.journalHeader}>
          <p className={styles.journalKicker}>05 / Yayın arşivi</p>
          <h2 id="journal-title">{copy.journal.title}</h2>
          <p>{copy.journal.introduction}</p>
        </header>
        <div className={styles.journalStage}>
          <figure
            aria-hidden="true"
            className={styles.journalLineField}
            data-journal-line-field=""
          >
            <svg aria-hidden="true" preserveAspectRatio="xMinYMid slice" viewBox="0 0 560 1000">
              {rhythmBandSequence.map(({ id, tone }, index) => {
                const baseX = journalLineBaseX[index] ?? 78;

                return (
                  <path
                    d={buildJournalLinePath({ baseX, targetY: 500, tipX: baseX })}
                    data-band-tone={tone}
                    data-journal-line={id}
                    data-journal-line-index={index}
                    key={id}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
            <figcaption>Bir dosyaya yaklaş; çizgiler okuma yönünü gösterir.</figcaption>
          </figure>
          <div className={styles.journalIndex} data-journal-index="">
            {journalStories.map((article, index) => {
              const articleTopics = article.topics
                .map((slug) => topics.find((topic) => topic.slug === slug)?.title ?? slug)
                .join(" · ");

              return (
                <article
                  className={styles.journalStory}
                  data-journal-story={article.slug}
                  key={article.slug}
                >
                  <span className={styles.journalStoryNumber}>0{index + 1}</span>
                  <div className={styles.journalStoryBody} data-journal-story-entrance="">
                    <p className={styles.journalStoryMeta}>
                      <span>{article.type === "visual-essay" ? "Görsel dosya" : "Editoryal not"}</span>
                      <span>{article.readingMinutes} dakika</span>
                    </p>
                    <h3>
                      <Link
                        data-journal-story-link={article.slug}
                        href={`/journal/${article.slug}`}
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className={styles.journalStoryDeck} data-journal-story-deck="">
                      {article.deck}
                    </p>
                    <footer className={styles.journalStoryFooter}>
                      <span>{article.eyebrow}</span>
                      <span>{articleTopics}</span>
                      <span>{article.author}</span>
                    </footer>
                  </div>
                  <span aria-hidden="true" className={styles.journalStoryArrow}>↗</span>
                </article>
              );
            })}
            <Link className={styles.journalIndexCta} data-journal-index-cta="" href="/journal">
              <span>Tüm Journal’ı keşfet</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.topicAtlas} data-header-tone="light" data-home-scene="topics">
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

      <section
        aria-labelledby="contribution-title"
        className={styles.contribution}
        data-header-tone="dark"
        data-home-scene="contribution"
        data-motion-state="start"
      >
        <div className={styles.contributionStage} data-contribution-stage="">
          <figure
            aria-hidden="true"
            className={styles.contributionFigure}
            data-contribution-artwork="editorial-echo"
            data-contribution-figure=""
          >
            <Image
              alt=""
              className={styles.contributionFigureImage}
              data-contribution-figure-image=""
              fill
              sizes="(max-width: 767px) 100vw, 100vw"
              src={CONTRIBUTION_ECHO_SRC}
            />
          </figure>

          <svg
            aria-hidden="true"
            className={styles.contributionApostrophe}
            data-contribution-apostrophe=""
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 140 250"
          >
            <defs>
              <linearGradient
                id="contribution-apostrophe-gradient"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0" stopColor="var(--orange)" />
                <stop offset="0.33" stopColor="var(--coral)" />
                <stop offset="0.66" stopColor="var(--ochre)" />
                <stop offset="1" stopColor="var(--olive)" />
              </linearGradient>
            </defs>
            <path
              d="M 91 10 C 51 10 25 38 25 76 C 25 109 47 132 79 132 C 72 161 56 190 28 220 L 62 242 C 108 200 127 144 127 82 C 127 38 114 10 91 10 Z"
              data-apostrophe-shape=""
              fill="url(#contribution-apostrophe-gradient)"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <svg
            aria-hidden="true"
            className={styles.contributionLines}
            data-contribution-lines=""
            focusable="false"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1672 941"
          >
            {rhythmBandSequence.map(({ id, tone }, index) => (
              <path
                d={contributionLinePaths[index]?.to}
                data-band-tone={tone}
                data-contribution-line={id}
                key={id}
                pathLength="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <header className={styles.contributionCopy} data-contribution-copy="">
            <h2 id="contribution-title">{copy.contribution.title}</h2>
            <p className={styles.contributionBody}>{copy.contribution.body}</p>
            <Link
              className={styles.contributionCta}
              data-contribution-cta=""
              href="/about#katki"
            >
              <span>{copy.contribution.cta}</span>
              <span aria-hidden="true">↗</span>
              <i aria-hidden="true" data-contribution-cta-rule="" />
            </Link>
          </header>
        </div>
      </section>
    </PublicationHomeMotion>
  );
}
