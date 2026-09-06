import Image from "next/image";
import Link from "next/link";
import { topics } from "@/content/topics";
import styles from "./topics-index.module.css";

const selectTopics = (slugs: readonly string[]) =>
  topics.filter((topic) => slugs.includes(topic.slug));

const territories = [
  {
    id: "materials",
    index: "01",
    title: "Yapıtaşları",
    description: "Bedenin kurduğu, taşıdığı ve gerektiğinde depoladığı maddeler.",
    topics: selectTopics(["protein", "karbonhidrat", "yaglar"]),
  },
  {
    id: "transformation",
    index: "02",
    title: "Dönüşüm",
    description: "Alınan besinin kullanılabilir enerjiye çevrildiği süreçler.",
    topics: selectTopics(["enerji", "metabolizma"]),
  },
  {
    id: "balance",
    index: "03",
    title: "Denge",
    description: "Akışı, emilimi ve sistemin sürekliliğini belirleyen unsurlar.",
    topics: selectTopics(["lif", "hidrasyon", "mikro-besinler"]),
  },
] as const;

const atlasSheets = [
  {
    alt: "Protein lifleri, moleküler bağlar ve yağ dokularını bir araya getiren kabartma çalışma",
    id: "materials",
    src: "/images/calorythm-folio-page-structure-v2.webp",
  },
  {
    alt: "Besinlerin hücre içinde dönüşümünü gösteren kabartma çalışma",
    id: "transformation",
    src: "/images/calorythm-folio-page-metabolism-v2.webp",
  },
  {
    alt: "Sindirim ve emilim süreçlerini gösteren anatomik kabartma çalışma",
    id: "balance",
    src: "/images/calorythm-folio-page-physiology-v2.webp",
  },
] as const;

export default function TopicsPage() {
  return (
    <main className={styles.topics} id="ana-icerik" tabIndex={-1}>
      <section
        aria-labelledby="konu-atlasi-baslik"
        className={styles.atlas}
        data-header-tone="light"
        data-topic-atlas=""
      >
        <header className={styles.atlasIntro}>
          <p className={styles.kicker}>CALORYTHM / KONU ATLASI</p>
          <h1 id="konu-atlasi-baslik">
            Beslenme
            <em>tek bir konu değildir.</em>
          </h1>
          <p className={styles.lede}>
            Sekiz konu; yapıtaşları, dönüşüm ve denge arasında kendi okuma
            rotanı kurar.
          </p>
        </header>

        <aside aria-label="Atlas özeti" className={styles.atlasMeta}>
          <span>01 / 03</span>
          <p>
            <b>08</b>
            konu
          </p>
          <p>
            <b>03</b>
            bölge
          </p>
          <small>Bir bölge seç, kendi okuma rotanı kur.</small>
        </aside>

        <figure
          aria-label="Beslenme konularının üç bölgeli görsel atlası"
          className={styles.atlasPlate}
        >
          <span aria-hidden="true" className={styles.plateHalo} />

          <svg
            aria-hidden="true"
            className={styles.rhythmMap}
            preserveAspectRatio="none"
            viewBox="0 0 800 920"
          >
            <path
              d="M 16 78 C 170 84 176 300 334 310 C 548 323 513 629 784 690"
              data-rhythm-line=""
              pathLength="1"
            />
            <path
              d="M 16 98 C 151 108 175 326 325 336 C 526 349 526 651 784 712"
              data-rhythm-line=""
              pathLength="1"
            />
            <path
              d="M 16 118 C 137 132 175 352 316 362 C 506 376 540 674 784 734"
              data-rhythm-line=""
              pathLength="1"
            />
            <path
              d="M 16 138 C 122 157 176 378 307 388 C 487 402 553 697 784 756"
              data-rhythm-line=""
              pathLength="1"
            />
          </svg>

          <div className={styles.sheetStack}>
            {atlasSheets.map((sheet) => (
              <div
                className={styles.atlasSheet}
                data-atlas-sheet={sheet.id}
                key={sheet.id}
              >
                <Image
                  alt={sheet.alt}
                  fill
                  fetchPriority={sheet.id === "transformation" ? "high" : "auto"}
                  sizes="(max-width: 760px) 54vw, (max-width: 1100px) 32vw, 24vw"
                  src={sheet.src}
                />
                <span aria-hidden="true">
                  {sheet.id === "materials" && "Yapı"}
                  {sheet.id === "transformation" && "Dönüşüm"}
                  {sheet.id === "balance" && "Denge"}
                </span>
              </div>
            ))}
          </div>

          <figcaption>
            <span>CAL / 03</span>
            Üç bölge · sekiz konu · büyüyen arşiv
          </figcaption>
        </figure>

        {territories.map((territory) => {
          const headingId = `${territory.id}-baslik`;

          return (
            <section
              aria-labelledby={headingId}
              className={styles.territory}
              data-topic-group={territory.id}
              key={territory.id}
            >
              <header className={styles.territoryHeader}>
                <span>{territory.index} / 03</span>
                <h2 id={headingId}>{territory.title}</h2>
                <p>{territory.description}</p>
              </header>

              <ol aria-labelledby={headingId} className={styles.topicList}>
                {territory.topics.map((topic, index) => {
                  const descriptionId = `${topic.slug}-topic-definition`;
                  const statusId =
                    topic.slug === "protein" ? `${topic.slug}-topic-status` : undefined;

                  return (
                    <li data-tone={topic.tone} key={topic.slug}>
                      <Link
                        aria-describedby={[descriptionId, statusId]
                          .filter(Boolean)
                          .join(" ")}
                        aria-label={`${topic.title} konusunu keşfet`}
                        href={`/topics/${topic.slug}`}
                      >
                        <span className={styles.topicNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>
                        <p id={descriptionId}>{topic.definition}</p>
                        <span className={styles.topicStatus} id={statusId}>
                          {topic.slug === "protein"
                            ? "Açık dosya · 3 yayın"
                            : "Konuyu keşfet"}
                        </span>
                        <b aria-hidden="true">↗</b>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </section>
    </main>
  );
}
