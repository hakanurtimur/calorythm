import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleRecord } from "@/content/articles";
import { getRelatedArticles } from "@/lib/content-selectors";
import {
  getProteinSources,
  proteinEvidenceStatuses,
  proteinRoles,
  type ProteinSource,
  type ProteinSourceKey,
} from "./protein-evidence";
import { ProteinStoryMotion } from "./protein-story-motion";
import styles from "./protein-visual-essay.module.css";

const turkishDate = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

type ProteinVisualEssayProps = Readonly<{ article: ArticleRecord }>;

type SourceNoteProps = Readonly<{
  children: ReactNode;
  sourceKey: ProteinSourceKey;
  sources: readonly ProteinSource[];
}>;

const proteinReferenceContexts = [
  {
    explanation:
      "Kilogram vücut ağırlığı başına günlük 0,83 gram olan bu değer, EFSA’nın sağlıklı yetişkinler için belirlediği nüfus referans alımıdır (PRI); kişisel hedef, optimum veya üst sınır değildir.",
    key: "population",
    label: "Nüfus referansı",
    rowAriaLabel: "EFSA sağlıklı yetişkin nüfus referansı",
    title: "EFSA · sağlıklı yetişkinler",
    value: "0,83 g/kg/gün",
  },
  {
    explanation:
      "Bu aralık, düzenli ve yapılandırılmış antrenman yapan sporcular için ortak pozisyon rehberliğidir; CALORYTHM kişisel önerisi değildir. Antrenman türü ve dönemi, enerji alımı ve hedefler aralığın nasıl yorumlanacağını değiştirir.",
    key: "sport",
    label: "Sporcu beslenmesi bağlamı",
    rowAriaLabel: "Sporcular için 2016 ortak pozisyonu",
    title: "2016 ortak uzman pozisyonu",
    value: "1,2–2,0 g/kg/gün",
  },
  {
    explanation:
      "Çocukluk ve gebelik için yaşa veya döneme özgü referanslar vardır. Kırılganlığı olan ileri yaştaki yetişkinlerde ve kronik böbrek hastalığında ise protein alımı bireysel klinik değerlendirme gerektirir.",
    key: "assessment",
    label: "Ayrı değerlendirme",
    rowAriaLabel: "Çocukluk, gebelik, kırılgan ileri yaş ve hastalık",
    title: "Çocukluk, gebelik, kırılgan ileri yaş ve hastalık",
    value: "Bağlama özgü değerler",
  },
] as const;

function SourceNote({ children, sourceKey, sources }: SourceNoteProps) {
  const source = sources.find((entry) => entry.key === sourceKey);
  if (!source) return null;

  return (
    <a className={styles.sourceNote} data-source-note href={`#${source.id}`}>
      <span>{children}</span>
      <span className={styles.sourceMarker}>[{sources.indexOf(source) + 1}]</span>
    </a>
  );
}

export function ProteinVisualEssay({ article }: ProteinVisualEssayProps) {
  const related = getRelatedArticles(article);
  const sources = getProteinSources(article);

  return (
    <article
      className={styles.article}
      data-article-type={article.type}
      data-protein-essay="static"
    >
      <ProteinStoryMotion>
        <header
          className={styles.prologue}
          data-header-tone="dark"
          data-protein-cover="flagship"
          data-protein-scene="cover"
        >
          <figure className={styles.coverArt} data-protein-art="cover">
            <div className={styles.coverImage} data-protein-cover-image>
              <Image
                alt="Mermer bir heykelin çevresinde protein işlevlerini simgeleyen renkli lifler"
                fetchPriority="high"
                height={992}
                loading="eager"
                sizes="(min-width: 1024px) 68vw, 100vw"
                src="/images/protein-story/protein-cover-v2.webp"
                width={1586}
              />
            </div>
          </figure>

          <div className={styles.coverMask} aria-hidden="true" data-protein-cover-mask>
            {proteinRoles.map((role) => (
              <i data-protein-cover-mask-panel={role.key} key={role.key} />
            ))}
          </div>

          <div className={styles.coverContent}>
            <p className={styles.eyebrow}>{article.eyebrow}</p>
            <h1 data-protein-cover-title>
              <span>Protein</span>
              <span>
                Sadece <em>Kas</em>
              </span>
              <span>İçin Değildir</span>
            </h1>
            <p className={styles.deck}>
              Protein ile kas arasındaki ilişki gerçektir. Ama proteinlerin
              bedendeki işi kasla sınırlı değildir.
            </p>
            <div className={styles.metadata}>
              <span>{article.author}</span>
              <time dateTime={article.publishedAt}>
                {turkishDate.format(new Date(`${article.publishedAt}T00:00:00Z`))}
              </time>
              <span>{article.readingMinutes} dakika okuma</span>
            </div>
            <p className={styles.scope}>
              Bu yazı sağlıklı yetişkinlerde protein fizyolojisini açıklar;
              çocuklar, gebeler, hastalık tedavisi görenler, kilo vermeye
              çalışanlar, kırılganlığı olan ileri yaştaki yetişkinler ve elit
              sporcular için kişisel protein alımı önermez.
            </p>
          </div>

          <div className={styles.coverStrands} aria-hidden="true">
            {proteinRoles.map((role) => (
              <i data-protein-cover-strand={role.key} key={role.key} />
            ))}
          </div>
          <div className={styles.scrollCue} aria-hidden="true">
            <span>Hikâyeye gir</span>
            <i />
          </div>
        </header>

        <section className={`${styles.scene} ${styles.rolesScene}`} data-protein-scene="roles">
          <div className={styles.sceneNumber}>02 / Beş rol</div>
          <div className={styles.sceneIntro}>
            <h2>Tek bir ad. Beş farklı iş.</h2>
            <p className={styles.lead}>
              Kas bu tablonun yalnızca bir parçasıdır; proteinler farklı
              dokularda farklı görevler üstlenir.
            </p>
          </div>

          <div className={styles.roleComposition}>
            <ul aria-label="Proteinlerin beş rolü" className={styles.roleList}>
              {proteinRoles.map((role, index) => (
                <li data-protein-role-copy={role.key} key={role.key}>
                  <span
                    aria-hidden="true"
                    className={styles.roleLine}
                    data-protein-role-line={role.key}
                  />
                  <span className={styles.roleIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.roleName}>{role.label}</span>
                  <strong>{role.example}</strong>
                  <p>{role.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
          <SourceNote sourceKey="ncbi-protein-roles" sources={sources}>
            Hücresel protein işlevleri ve örnekleri
          </SourceNote>
        </section>

        <section
          className={`${styles.scene} ${styles.digestionScene}`}
          data-protein-scene="digestion"
        >
          <div className={styles.sceneNumber}>03 / Sindirim</div>
          <div className={styles.sceneIntro}>
            <h2>Bir lokma, aynı biçimde kalmaz</h2>
            <p className={styles.lead}>
              Yediğimiz protein doğrudan kasa taşınmaz. Önce sindirimle daha küçük
              parçalara ayrılır; ardından emilen amino asitler dolaşıma katılır.
            </p>
          </div>

          <div className={styles.digestionStage} data-protein-pin="digestion">
            <figure className={styles.digestionArt} data-protein-art="digestion">
              <div
                className={styles.digestionImage}
                data-protein-digestion-visual="transformation"
                data-protein-image-layer="digestion"
              >
                <Image
                  alt=""
                  height={992}
                  loading="lazy"
                  sizes="(min-width: 1024px) calc(100vw - 11rem), 100vw"
                  src="/images/protein-story/protein-digestion-v1.webp"
                  width={1586}
                />
                <div className={styles.digestionFragments} aria-hidden="true">
                  {(["food", "peptides", "amino-acids"] as const).map((state) => (
                    <i data-protein-digestion-fragment={state} key={state} />
                  ))}
                </div>
                <i aria-hidden="true" data-protein-digestion-focus />
              </div>
              <figcaption>
                Yorumlayıcı görsel: sindirim boyunca ölçek küçülür; bu bir
                moleküler yapı çizimi değildir.
              </figcaption>
            </figure>

            <ol aria-label="Protein sindiriminin üç görünümü" className={styles.digestionStates}>
              <li data-protein-digestion-state="food">
                <span className={styles.stateKicker}>Başlangıç</span>
                <h3>Besin proteini</h3>
                <p>Birbirine bağlı uzun amino asit dizileri.</p>
              </li>
              <li data-protein-digestion-state="peptides">
                <span className={styles.stateKicker}>Sindirim</span>
                <h3>Peptitler</h3>
                <p>Sindirim sırasında oluşan daha kısa amino asit zincirleri.</p>
              </li>
              <li data-protein-digestion-state="amino-acids">
                <span className={styles.stateKicker}>Emilim</span>
                <h3>Amino asitler</h3>
                <p>Sindirim ve emilimden sonra dolaşımdaki amino asit havuzuna katılır.</p>
              </li>
            </ol>
          </div>
          <SourceNote sourceKey="who-protein-requirements" sources={sources}>
            Protein ve amino asit gereksinimlerinin temel değerlendirmesi
          </SourceNote>
        </section>

        <section
          className={`${styles.scene} ${styles.turnoverScene}`}
          data-protein-scene="turnover"
        >
          <div className={styles.sceneNumber}>04 / Dönüşüm</div>
          <div className={styles.sceneIntro}>
            <h2>Beden bitmiş bir yapı değildir</h2>
            <p className={styles.lead}>
              Dolaşıma katılan amino asitler yeni proteinlerin yapımında
              kullanılabilir. Vücut proteinleri sürekli sentezlenir, işlev görür
              ve parçalanır.
            </p>
          </div>

          <figure className={styles.materialSpecimen} data-protein-art="material">
            <div
              className={styles.materialImage}
              data-protein-image-layer="material"
              data-protein-turnover-visual="material"
            >
              <Image
                alt=""
                height={992}
                loading="lazy"
                sizes="(min-width: 1024px) calc(100vw - 17rem), 100vw"
                src="/images/protein-story/protein-material-v1.webp"
                width={1586}
              />
            </div>
            <figcaption>
              Yorumlayıcı görsel: protein yapıları kurulur, iş görür ve parçalanır.
            </figcaption>
          </figure>

          <ol aria-label="Protein dönüşümünün üç durumu" className={styles.turnoverStates}>
            <li data-protein-turnover-state="building">
              <span className={styles.stateKicker}>Kurulum</span>
              <h3>Kuruluyor</h3>
              <p>Amino asitler yeni protein yapılarına katılıyor.</p>
            </li>
            <li data-protein-turnover-state="working">
              <span className={styles.stateKicker}>İşlev</span>
              <h3>İş görüyor</h3>
              <p>Yapı, taşıma, kataliz, sinyal veya savunma görevine katılıyor.</p>
            </li>
            <li data-protein-turnover-state="dismantling">
              <span className={styles.stateKicker}>Yenilenme</span>
              <h3>Parçalanıyor</h3>
              <p>Yapı sökülüyor; amino asitlerin bir bölümü yeniden kullanılıyor.</p>
            </li>
          </ol>
          <p className={styles.turnoverCoda}>
            Kas proteinleri de bu dönüşümün içindedir; vücuttaki protein yapıları
            sabit değildir, sürekli yenilenir.
          </p>
          <SourceNote sourceKey="waterlow-turnover" sources={sources}>
            İnsanlarda tüm-vücut protein dönüşümünün bilimsel çerçevesi
          </SourceNote>
        </section>

        <section
          className={`${styles.scene} ${styles.referenceScene}`}
          data-protein-scene="reference"
        >
          <div className={styles.sceneNumber}>05 / Sayının bağlamı</div>
          <div className={styles.referenceHeading}>
            <h2>“Yeterli” tek bir sayı değildir</h2>
            <p className={styles.referenceWarning}>Referans ≠ hedef ≠ üst sınır.</p>
          </div>
          <p className={styles.lead}>
            “Kaç gram?” sorusunun yanıtı, değerin hangi amaçla kullanıldığına
            bağlıdır. EFSA’nın sağlıklı yetişkinler için nüfus referansı, sporcu
            rehberliği ve klinik değerlendirme birbirinin yerine kullanılamaz.
          </p>

          <div
            aria-label="Protein referans bağlamları tablosu"
            className={`${styles.tableScroll} ${styles.referenceMatrix}`}
            data-protein-table-scroll="reference-contexts"
            role="region"
            tabIndex={0}
          >
            <table>
              <caption>Protein değerlerini doğru bağlamda okuma tablosu</caption>
              <thead>
                <tr>
                  <th scope="col">Bağlam</th>
                  <th scope="col">Değer</th>
                  <th scope="col">Nasıl okunmalı?</th>
                </tr>
              </thead>
              <tbody>
                {proteinReferenceContexts.map((context) => (
                  <tr data-protein-reference-row={context.key} key={context.key}>
                    <th aria-label={context.rowAriaLabel} scope="row">
                      <span className={styles.railLabel}>{context.label}</span>
                      <strong>{context.title}</strong>
                    </th>
                    <td className={styles.referenceValue}>{context.value}</td>
                    <td>{context.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol aria-label="Protein referans bağlamları" className={styles.referenceCards}>
            {proteinReferenceContexts.map((context) => (
              <li data-protein-reference-card={context.key} key={context.key}>
                <span className={styles.railLabel}>{context.label}</span>
                <h3>{context.title}</h3>
                <strong className={styles.referenceValue}>{context.value}</strong>
                <p>{context.explanation}</p>
              </li>
            ))}
          </ol>

          <div className={styles.noteCluster}>
            <SourceNote sourceKey="efsa-adult-pri" sources={sources}>
              EFSA yetişkin PRI tanımı
            </SourceNote>
            <SourceNote sourceKey="sport-position" sources={sources}>
              Beslenme ve atletik performans ortak pozisyonu
            </SourceNote>
            <SourceNote sourceKey="kdigo-ckd" sources={sources}>
              Kronik böbrek hastalığında protein alımının ayrı klinik değerlendirilmesi
            </SourceNote>
          </div>
        </section>

        <section className={`${styles.scene} ${styles.patternScene}`} data-protein-scene="pattern">
          <div className={styles.sceneNumber}>06 / Örüntü</div>
          <div className={styles.patternHeading}>
            <h2>Miktarın yanında örüntü var</h2>
            <p className={styles.lead}>
              Protein kaynakları yalnızca toplam miktarla değil, vazgeçilmez amino
              asit bileşimi ve sindirilebilirlikle de değerlendirilir.
            </p>
          </div>

          <div className={styles.patternComposition}>
            <figure className={styles.patternArt} data-protein-art="pattern">
              <div className={styles.patternSurface}>
                <div className={styles.patternImage} data-protein-image-layer="pattern">
                  <Image
                    alt=""
                    height={992}
                    loading="lazy"
                    sizes="(min-width: 1024px) calc(100vw - 23rem), 100vw"
                    src="/images/protein-story/protein-pattern-v1.webp"
                    width={1586}
                  />
                </div>
                <div className={styles.patternBands} aria-hidden="true">
                  {["one", "two", "three"].map((band) => (
                    <i data-protein-pattern-band={band} key={band} />
                  ))}
                </div>
              </div>
              <figcaption className={styles.chordCaption}>
                Şeritler bileşim örüntülerini yorumlar; renk, uzunluk ve parça
                sayısı nicel değer ya da sıralama göstermez.
              </figcaption>
            </figure>

            <ul aria-label="Protein değerlendirme çerçevesi" className={styles.evidenceStatuses}>
              {proteinEvidenceStatuses.map((status) => (
                <li data-protein-evidence-status={status.key} key={status.key}>
                  <span
                    aria-hidden="true"
                    className={styles.evidencePattern}
                    data-evidence-pattern={status.key}
                  />
                  <div>
                    <strong>{status.label}</strong>
                    <p>{status.statement}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.patternBoundary}>
            Bu özellikler bir besine değişmez bir “tam/eksik” ya da “iyi/kötü”
            rozeti vermez. Protein kaynağını, öğündeki diğer kaynakları ve genel
            beslenme örüntüsünü birlikte okuruz.
          </p>
          <SourceNote sourceKey="fao-protein-quality" sources={sources}>
            FAO 2013: amino asit bileşimi, sindirilebilirlik ve veri sınırları
          </SourceNote>
        </section>

        <section
          className={`${styles.scene} ${styles.resolutionScene}`}
          data-protein-scene="resolution"
        >
          <div className={styles.sceneNumber}>07 / Sonuç</div>
          <div className={styles.resolution} data-protein-resolution="open-pattern">
            <div className={styles.resolutionScore} aria-hidden="true">
              {proteinRoles.map((role) => (
                <i data-protein-resolution-line={role.key} key={role.key} />
              ))}
            </div>
            <div className={styles.resolutionCopy}>
              <p className={styles.resolutionLabel}>Bakım dili</p>
              <h2>Protein kas için de çalışır. Ama hikâye orada bitmez.</h2>
              <p className={styles.lead}>
                Yediğimiz protein amino asitlere ayrılır; bu amino asitler sürekli
                yenilenen protein yapılarına katılabilir. Proteinler yapı kurar,
                tepkimeleri hızlandırır, molekül taşır, sinyal iletir ve savunmaya
                katılır; kas bu geniş tablonun yalnızca bir parçasıdır. Miktar ise
                ancak bağlam ve genel beslenme örüntüsüyle birlikte anlam kazanır.
              </p>
            </div>
          </div>
          <SourceNote sourceKey="who-protein-requirements" sources={sources}>
            Gereksinimi bağlam içinde değerlendiren temel rapor
          </SourceNote>
        </section>
      </ProteinStoryMotion>

      <footer className={styles.articleFooter}>
        <aside className={styles.disclaimer} aria-label="Yazının kapsamı">
          <p>
            Bu yazı genel bilimsel açıklamadır; kişisel beslenme veya tedavi önerisi
            değildir.
          </p>
          <Link href="/about#editorial-method">Editoryal yöntem</Link>
        </aside>

        <section className={styles.sources} aria-labelledby="protein-sources-heading">
          <h2 id="protein-sources-heading">Kaynaklar</h2>
          <ol aria-label="Kaynaklar">
            {sources.map(({ id, reference }, index) => (
              <li id={id} key={id}>
                <span className={styles.sourceIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p>{reference.title}</p>
                  <small>{reference.publisher}</small>
                </div>
                <a
                  aria-label={`Kaynağı aç: ${reference.title}`}
                  href={reference.href}
                  rel="noreferrer"
                >
                  Kaynağı aç
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.related} aria-labelledby="protein-related-heading">
          <h2 id="protein-related-heading">İlgili okumalar</h2>
          <ul aria-label="İlgili okumalar">
            {related.map((relatedArticle) => (
              <li key={relatedArticle.slug}>
                <Link href={`/journal/${relatedArticle.slug}`}>{relatedArticle.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </footer>
    </article>
  );
}
