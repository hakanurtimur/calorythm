import Image from "next/image";
import Link from "next/link";
import { getArticlesForTopic } from "@/lib/content-selectors";
import { ProteinTopicMotion } from "./protein-topic-motion";
import styles from "./protein-topic-landing.module.css";

const PROTEIN_HERO_SRC = "/images/topics/protein-atlas-hero-v1.webp";
const PROTEIN_ROLE_ATLAS_SRC = "/images/topics/protein-role-atlas-v2.webp";
const PROTEIN_FLAGSHIP_SRC = "/images/calorythm-protein-flagship-v1.webp";

const proteinRoles = [
  {
    id: "structure",
    label: "Yapı",
    verb: "Kurar.",
    note: "Kas lifinden hücre iskeletine; protein, bedenin biçim alan malzemelerinden biridir.",
  },
  {
    id: "catalysis",
    label: "Kataliz",
    verb: "Hızlandırır.",
    note: "Enzimlerin büyük bölümü proteindir. Tepkimeleri mümkün olan hızlara taşırlar.",
  },
  {
    id: "transport",
    label: "Taşıma",
    verb: "Taşır.",
    note: "Hemoglobin oksijeni; başka proteinler yağ asitlerini, vitaminleri ve mineralleri taşır.",
  },
  {
    id: "signal",
    label: "Sinyal",
    verb: "İletir.",
    note: "Reseptörler ve bazı hormonlar, hücrelerin birbirini duymasına yardım eder.",
  },
  {
    id: "defense",
    label: "Savunma",
    verb: "Tanır.",
    note: "Antikorlar, bedenin tanıma ve yanıt verme sisteminin protein yapılı parçalarıdır.",
  },
] as const;

const sources = [
  {
    href: "https://www.efsa.europa.eu/en/press/news/120209",
    label: "EFSA",
    note: "Nüfus referansları",
  },
  {
    href: "https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf",
    label: "WHO–FAO–UNU",
    note: "Gereksinim çerçevesi",
  },
  {
    href: "https://www.fao.org/4/i3124e/i3124e.pdf",
    label: "FAO",
    note: "Protein kalitesi",
  },
  {
    href: "https://www.ncbi.nlm.nih.gov/books/NBK9879/",
    label: "NCBI",
    note: "Hücresel roller",
  },
] as const;

const rhythmTones = ["orange", "coral", "ochre", "olive"] as const;

export function ProteinTopicLanding() {
  const articles = getArticlesForTopic("protein");
  const flagship = articles.find((article) => article.type === "visual-essay")!;
  const notes = articles.filter((article) => article.type === "editorial-note");

  return (
    <ProteinTopicMotion>
      <main
        className={styles.page}
        data-topic-dossier="protein"
        id="ana-icerik"
        tabIndex={-1}
      >
        <section
          className={styles.hero}
          data-header-tone="dark"
          data-protein-topic-scene="hero"
          data-topic-hero=""
        >
          <div className={styles.heroVisual} data-protein-topic-hero-visual="">
            <Image
              alt="Protein atlası kapak görseli: katmanlarında farklı protein dokuları görünen taş bir beden"
              className={styles.heroImage}
              data-protein-topic-hero-image=""
              fill
              preload
              sizes="100vw"
              src={PROTEIN_HERO_SRC}
            />
            <span aria-hidden="true" className={styles.heroLight} data-protein-topic-hero-light="" />
          </div>

          <svg
            aria-hidden="true"
            className={styles.heroRails}
            preserveAspectRatio="none"
            viewBox="0 0 1440 1000"
          >
            {rhythmTones.map((tone, index) => (
              <path
                d={`M ${1130 + index * 18} 588 C ${1020 + index * 8} 652 ${865 + index * 5} 677 ${735 + index * 2} 735 C 548 820 347 875 -90 ${930 + index * 18}`}
                data-protein-hero-rail={tone}
                key={tone}
                pathLength="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <div className={styles.heroCopy} data-protein-topic-hero-copy="">
            <div className={styles.heroTopline} data-hero-copy-beat="">
              <Link href="/topics">Tüm konular</Link>
              <span>Protein / Atlas 01</span>
            </div>
            <h1 data-hero-copy-beat="">
              <span>Protein,{" "}</span>
              <span>bedende tek bir iş yapmaz.</span>
            </h1>
            <p className={styles.heroDeck} data-hero-copy-beat="">
              Yapı kurar, tepkimeleri hızlandırır, molekül taşır, sinyal iletir
              ve savunmaya katılır.
            </p>
            <div className={styles.heroActions} data-hero-copy-beat="">
              <Link href="#protein-dosyasi">Protein dosyasını aç <span aria-hidden="true">↓</span></Link>
              <p>3 yayın · 17 dakika toplam okuma</p>
            </div>
          </div>

          <p className={styles.heroCaption}>CALORYTHM / KONU ATLASI</p>
        </section>

        <section
          aria-labelledby="protein-rolleri-baslik"
          className={styles.roles}
          data-header-tone="dark"
          data-protein-topic-scene="roles"
        >
          <div className={styles.rolesSticky}>
            <div className={styles.rolesIntro}>
              <p className={styles.roleChapter}>Protein / Canlı atlas</p>
              <h2 id="protein-rolleri-baslik">Kas, yalnızca en görünür hikâye.</h2>
              <p className={styles.rolesLead}>
                Protein sözcüğü çoğu zaman tek bir görüntüye sıkışır. Oysa aynı
                yapıtaşı, bedende birbirinden farklı işlerin parçasıdır.
              </p>
            </div>

            <figure
              aria-label="Proteinin bedendeki görevlerini gösteren anatomik atlas"
              className={styles.roleStage}
              data-protein-role-theatre=""
              data-protein-topic-role-stage=""
            >
              <div className={styles.roleAtlasVisual}>
                <Image
                  alt="Yapı, kataliz, taşıma, sinyal ve savunma görevlerinin farklı bölgelerde görünür olduğu taş beden atlası"
                  className={styles.roleAtlasImage}
                  data-protein-role-atlas-image=""
                  fill
                  sizes="(max-width: 700px) 100vw, 100vw"
                  src={PROTEIN_ROLE_ATLAS_SRC}
                />
                <span aria-hidden="true" className={styles.roleAtlasDim} />
                <div
                  aria-hidden="true"
                  className={styles.roleFocusLens}
                  data-protein-role-focus-lens=""
                >
                  <Image
                    alt=""
                    className={styles.roleFocusImage}
                    fill
                    sizes="100vw"
                    src={PROTEIN_ROLE_ATLAS_SRC}
                  />
                </div>
                <span aria-hidden="true" className={styles.roleFocusRing} />
              </div>

              <svg
                aria-hidden="true"
                className={styles.roleRail}
                data-protein-role-rail=""
                preserveAspectRatio="none"
                viewBox="0 0 1000 700"
              >
                <path d="M -80 466 C 160 466 238 456 354 410 C 470 364 548 348 690 350" />
                <path d="M -80 482 C 168 482 246 470 360 422 C 476 374 554 360 696 358" />
                <path d="M -80 498 C 176 498 254 484 366 434 C 482 384 560 372 702 366" />
                <path d="M -80 514 C 184 514 262 498 372 446 C 488 394 566 384 708 374" />
              </svg>

              <div aria-hidden="true" className={styles.roleMarkers}>
                {proteinRoles.map((role) => (
                  <span data-role-marker={role.id} key={role.id} />
                ))}
              </div>

              <div aria-hidden="true" className={styles.roleWords}>
                {proteinRoles.map((role) => (
                  <p data-role-word={role.id} key={role.id}>{role.verb}</p>
                ))}
              </div>

              <figcaption className={styles.roleCaption}>
                {proteinRoles.map((role, index) => (
                  <p
                    aria-hidden={index !== 0}
                    data-role-description={role.id}
                    key={role.id}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {role.note}
                  </p>
                ))}
              </figcaption>

              <div aria-hidden="true" className={styles.roleProgress}>
                {proteinRoles.map((role, index) => (
                  <span data-role-progress={role.id} key={role.id}>
                    {String(index + 1).padStart(2, "0")} / 05
                  </span>
                ))}
              </div>
            </figure>

            <ol aria-label="Proteinin bedendeki rolleri" className={styles.roleList}>
              {proteinRoles.map((role, index) => (
                <li
                  data-protein-topic-role={role.id}
                  data-role-index={String(index + 1).padStart(2, "0")}
                  key={role.id}
                >
                  <button
                    aria-pressed={index === 0}
                    data-role-id={role.id}
                    type="button"
                  >
                    {role.label}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <ol
            aria-label="Proteinin bedendeki rollerinin görsel akışı"
            className={styles.roleMobileSequence}
          >
            {proteinRoles.map((role, index) => (
              <li data-mobile-role={role.id} key={role.id}>
                <div aria-hidden="true" className={styles.roleMobileVisual}>
                  <Image alt="" fill sizes="100vw" src={PROTEIN_ROLE_ATLAS_SRC} />
                </div>
                <div className={styles.roleMobileCopy}>
                  <span>{String(index + 1).padStart(2, "0")} / 05</span>
                  <h3>{role.label}</h3>
                  <strong>{role.verb}</strong>
                  <p>{role.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={styles.flagshipSection}
          data-header-tone="dark"
          data-protein-topic-scene="flagship"
          id="protein-dosyasi"
        >
          <article
            className={styles.flagship}
            data-editorial-role="flagship"
            data-protein-topic-entry=""
          >
            <Image
              alt="Proteinin yapı, taşıma, sinyal, kataliz ve savunma rollerini temsil eden dokulu taş beden"
              className={styles.flagshipImage}
              fill
              sizes="100vw"
              src={PROTEIN_FLAGSHIP_SRC}
            />
            <div className={styles.flagshipShade} />
            <div className={styles.flagshipCopy}>
              <p>02 / Ana dosya · {flagship.readingMinutes} dakika</p>
              <h2>
                <Link href={`/journal/${flagship.slug}`}>{flagship.title}</Link>
              </h2>
              <p>{flagship.deck}</p>
              <Link className={styles.flagshipCta} href={`/journal/${flagship.slug}`}>
                Görsel dosyaya gir <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </section>

        <section
          aria-labelledby="protein-notlari-baslik"
          className={styles.notes}
          data-header-tone="light"
          data-protein-topic-scene="archive"
        >
          <header className={styles.notesHeader}>
            <p className={styles.sectionIndex}>03 / Dosyanın devamı</p>
            <h2 id="protein-notlari-baslik">Aynı konu, iki ayrı soru.</h2>
            <p>
              Bir sayı ya da tek bir etiket yetmez. Protein hakkında ne sorduğumuz,
              hangi cevabın anlamlı olduğunu değiştirir.
            </p>
          </header>

          <div className={styles.noteRiver}>
            {notes.map((article, index) => (
              <article
                className={styles.note}
                data-protein-topic-entry=""
                data-protein-topic-index={String(index + 1).padStart(2, "0")}
                key={article.slug}
              >
                <div className={styles.noteVisual}>
                  <Image
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 48vw"
                    src={index === 0
                      ? "/images/protein-story/protein-material-v1.webp"
                      : "/images/protein-story/protein-pattern-v1.webp"}
                  />
                </div>
                <div className={styles.noteCopy}>
                  <p>0{index + 1} / Editoryal not · {article.readingMinutes} dakika</p>
                  <h3>
                    <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p>{article.deck}</p>
                  <time dateTime={article.publishedAt}>24 Ağustos 2026</time>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="kaynak-omurgasi-baslik"
          className={styles.sourceSpine}
          data-header-tone="dark"
          data-protein-topic-scene="sources"
        >
          <div className={styles.sourceIntro}>
            <p className={styles.sectionIndex}>04 / Kaynak omurgası</p>
            <h2 id="kaynak-omurgasi-baslik">
              Tek bir iddiaya değil, farklı sorulara dayanan bir atlas.
            </h2>
          </div>
          <ul aria-label="Protein atlasının kaynak omurgası" className={styles.sourceList}>
            {sources.map((source, index) => (
              <li key={source.label}>
                <span>0{index + 1}</span>
                <a href={source.href} rel="noreferrer" target="_blank">{source.label}</a>
                <p>{source.note}</p>
                <b aria-hidden="true">↗</b>
              </li>
            ))}
          </ul>
          <p className={styles.sourceNote}>
            Kaynakları tek bir sonuç üretmek için değil; kavramların kapsamını,
            sınırını ve bağlamını görünür kılmak için birlikte okuyoruz.
          </p>
        </section>

        <section className={styles.nextTopic} data-header-tone="light">
          <p>Konu atlasında devam et</p>
          <Link href="/topics/karbonhidrat">
            Sıradaki konu: Karbonhidrat<span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </ProteinTopicMotion>
  );
}
