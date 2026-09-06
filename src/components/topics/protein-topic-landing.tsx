import Image from "next/image";
import Link from "next/link";
import { getArticlesForTopic } from "@/lib/content-selectors";
import { ProteinTopicMotion } from "./protein-topic-motion";
import styles from "./protein-topic-landing.module.css";

const PROTEIN_HERO_SRC = "/images/topics/protein-atlas-hero-v1.webp";
const PROTEIN_FLAGSHIP_SRC = "/images/calorythm-protein-flagship-v1.webp";

const proteinRoles = [
  {
    example: "Kollajen · Keratin · Aktin",
    id: "structure",
    label: "Yapı",
    verb: "Kurar.",
    note: "Kas lifinden hücre iskeletine, protein bedenin biçim alan malzemelerinden biridir.",
  },
  {
    example: "Pepsin · Amilaz · ATP sentaz",
    id: "catalysis",
    label: "Kataliz",
    verb: "Hızlandırır.",
    note: "Protein yapılı enzimler, biyokimyasal tepkimeleri mümkün olan hızlara taşır.",
  },
  {
    example: "Hemoglobin · Albumin · Taşıyıcılar",
    id: "transport",
    label: "Taşıma",
    verb: "Taşır.",
    note: "Hemoglobin oksijeni; taşıyıcı proteinler yağ asitlerini, vitaminleri ve mineralleri taşır.",
  },
  {
    example: "İnsülin · Reseptörler",
    id: "signal",
    label: "Sinyal",
    verb: "Haber verir.",
    note: "Reseptörler ve bazı hormonlar, hücrelerin birbirini duymasına yardım eder.",
  },
  {
    example: "Antikorlar · Kompleman proteinleri",
    id: "defense",
    label: "Savunma",
    verb: "Tanır.",
    note: "Antikorlar, bedenin yabancıyı tanıma ve yanıt verme sisteminin parçalarıdır.",
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
const roleSpinePositions = [24, 43, 62, 81] as const;

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
          data-header-tone="light"
          data-protein-topic-scene="roles"
        >
          <div className={styles.rolesFrame}>
            <header className={styles.rolesIntro} data-protein-roles-intro="">
              <p className={styles.roleChapter}>Protein / Bedendeki roller</p>
              <h2 id="protein-rolleri-baslik">
                <span>Tek bir ad.</span>
                <span>Beş farklı iş.</span>
              </h2>
              <p className={styles.rolesLead}>
                Protein dediğimiz şey tek bir molekül değildir. Yapı kuran,
                tepkimeleri hızlandıran, taşıyan, haber veren ve tanıyan büyük
                bir molekül ailesidir.
              </p>
            </header>

            <div className={styles.roleLedger} data-protein-role-ledger="">
              <div aria-hidden="true" className={styles.roleSpine}>
                <svg preserveAspectRatio="none" viewBox="0 0 110 1000">
                  {rhythmTones.map((tone, lineIndex) => (
                    <line
                      className={styles.roleSpineLine}
                      data-protein-role-spine-line={tone}
                      key={tone}
                      vectorEffect="non-scaling-stroke"
                      x1={roleSpinePositions[lineIndex]}
                      x2={roleSpinePositions[lineIndex]}
                      y1="0"
                      y2="1000"
                    />
                  ))}
                </svg>
              </div>

              <ol aria-label="Proteinin bedendeki rolleri" className={styles.roleList}>
                {proteinRoles.map((role, index) => (
                  <li
                    data-protein-role-row={role.id}
                    data-protein-topic-role={role.id}
                    key={role.id}
                  >
                    <span aria-hidden="true" className={styles.roleRowIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.roleRowHeading}>
                      <span className={styles.roleRowLabel}>
                        {role.label}
                      </span>
                      <strong className={styles.roleRowVerb}>
                        {role.verb}
                      </strong>
                    </span>
                    <p className={styles.roleRowNote}>
                      {role.note}
                    </p>
                    <div className={styles.roleRowExample}>
                      <span>Örnekler</span>
                      <p>{role.example}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
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
