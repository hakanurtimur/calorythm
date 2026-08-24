import Link from "next/link";
import Image from "next/image";
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

type ProteinVisualEssayProps = Readonly<{
  article: ArticleRecord;
}>;

type SourceNoteProps = Readonly<{
  children: ReactNode;
  sourceKey: ProteinSourceKey;
  sources: readonly ProteinSource[];
}>;

function SourceNote({ children, sourceKey, sources }: SourceNoteProps) {
  const source = sources.find((entry) => entry.key === sourceKey);

  if (!source) {
    return null;
  }

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
      <header className={styles.prologue}>
        <div className={styles.prologueRule} aria-hidden="true" />
        <p className={styles.eyebrow}>{article.eyebrow}</p>
        <h1>{article.title}</h1>
        <p className={styles.deck}>{article.deck}</p>
        <div className={styles.metadata}>
          <span>{article.author}</span>
          <time dateTime={article.publishedAt}>
            {turkishDate.format(new Date(`${article.publishedAt}T00:00:00Z`))}
          </time>
          <span>{article.readingMinutes} dakika okuma</span>
        </div>
        <p className={styles.scope}>
          Bu yazı sağlıklı yetişkinlerde protein fizyolojisini açıklar; çocuklar,
          gebeler, hastalık tedavisi görenler, kilo vermeye çalışanlar, kırılganlığı
          olan ileri yaştaki yetişkinler ve elit sporcular için kişisel protein alımı
          önermez.
        </p>
      </header>

      <ProteinStoryMotion>
      <section className={`${styles.scene} ${styles.frameScene}`} data-protein-scene="frame">
        <div className={styles.sceneNumber}>01 / Çerçeve</div>
        <div className={styles.frameStage} data-protein-pin="frame">
          <div className={styles.frameWord} data-protein-frame-word aria-hidden="true">
            KAS
          </div>
          <div className={styles.frameRoles} aria-hidden="true">
            {proteinRoles.map((role) => (
              <span data-protein-frame-role={role.key} key={role.key}>
                {role.label}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.sceneCopy}>
          <h2>Kas, hikâyenin tamamı değil</h2>
          <p className={styles.lead}>
            Protein ile kas arasındaki ilişki gerçektir. Fakat kas, çok daha geniş
            bir bakım düzeninin yalnızca en görünür parçasıdır.
          </p>
          <p>
            Proteinler dokuların yapısına katılır; tepkimeleri hızlandırır,
            molekül taşır, sinyal iletir ve savunmada görev alır. Proteini yalnızca
            antrenmanla yan yana koyduğumuzda bu eşzamanlı işleri kadrajın dışında
            bırakırız.
          </p>
          <SourceNote sourceKey="ncbi-protein-roles" sources={sources}>
            Proteinlerin hücresel rollerine ilişkin temel çerçeve
          </SourceNote>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.rolesScene}`} data-protein-scene="roles">
        <div className={styles.sceneNumber}>02 / İşlevler</div>
        <div className={styles.sceneIntro}>
          <h2>Görünmeyen işler</h2>
          <p className={styles.lead}>
            Proteinler bedende tek bir işle sınırlı değildir; farklı dokularda farklı
            görevler üstlenir.
          </p>
        </div>

        <div className={styles.roleComposition}>
          <svg
            aria-describedby="protein-role-score-description"
            aria-label="Proteinlerin bedendeki beş rolü"
            className={styles.roleScore}
            role="img"
            viewBox="0 0 760 430"
          >
            <title id="protein-role-score-title">Proteinlerin bedendeki beş rolü</title>
            <desc id="protein-role-score-description">
              Beş yatay çizgi; proteinlerin yapı, kataliz, taşıma, sinyal ve savunma
              görevlerini örnekleriyle gösterir.
            </desc>
            {proteinRoles.map((role, index) => {
              const y = 58 + index * 76;

              return (
                <g data-protein-role={role.key} key={role.key}>
                  <line
                    className={styles.scoreRule}
                    data-protein-score-rule
                    x1="22"
                    x2="738"
                    y1={y}
                    y2={y}
                  />
                  <circle className={styles.scoreBeat} cx={82 + index * 91} cy={y} r="10" />
                  <text className={styles.scoreLabel} x="24" y={y - 17}>
                    {role.label}
                  </text>
                  <text className={styles.scoreExample} textAnchor="end" x="736" y={y - 17}>
                    {role.example}
                  </text>
                </g>
              );
            })}
          </svg>

          <ul aria-label="Proteinlerin beş rolü" className={styles.roleList}>
            {proteinRoles.map((role, index) => (
              <li data-protein-role-copy={role.key} key={role.key}>
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
        className={`${styles.scene} ${styles.turnoverScene}`}
        data-protein-scene="turnover"
      >
        <div className={styles.sceneNumber}>03 / Dönüşüm</div>
        <div className={styles.sceneIntro}>
          <h2>Beden bitmiş bir yapı değildir</h2>
          <p className={styles.lead}>
            Doku, tamamlanıp rafa kaldırılan bir nesne değildir. Proteinler sürekli
            kurulur, iş görür ve parçalanır.
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
            Bu görsel, proteinlerin sürekli kurulmasını, iş görmesini ve
            parçalanmasını bir malzeme akışı olarak yorumlar.
          </figcaption>
        </figure>

        <ol aria-label="Protein dönüşümünün üç durumu" className={styles.turnoverStates}>
          <li data-protein-turnover-state="building">
            <span className={styles.stateKicker}>Durum 01</span>
            <h3>Kuruluyor</h3>
            <p>Amino asitler yeni protein yapılarına katılıyor.</p>
          </li>
          <li data-protein-turnover-state="working">
            <span className={styles.stateKicker}>Durum 02</span>
            <h3>İş görüyor</h3>
            <p>Yapı, taşıma, kataliz, sinyal veya savunma görevine katılıyor.</p>
          </li>
          <li data-protein-turnover-state="dismantling">
            <span className={styles.stateKicker}>Durum 03</span>
            <h3>Parçalanıyor</h3>
            <p>Yapı sökülüyor; açığa çıkan amino asitlerin bir bölümü yeniden kullanılıyor.</p>
          </li>
        </ol>
        <p className={styles.turnoverCoda}>
          Protein dönüşümü şunu gösterir: vücuttaki protein yapıları sabit değildir;
          sürekli yenilenir.
        </p>
        <SourceNote sourceKey="waterlow-turnover" sources={sources}>
          İnsanlarda tüm-vücut protein dönüşümünün bilimsel çerçevesi
        </SourceNote>
      </section>

      <section
        className={`${styles.scene} ${styles.digestionScene}`}
        data-protein-scene="digestion"
      >
        <div className={styles.sceneNumber}>04 / Biçim değişimi</div>
        <div className={styles.sceneIntro}>
          <h2>Bir lokma, aynı biçimde kalmaz</h2>
          <p className={styles.lead}>
            Yediğimiz protein, bitmiş bir ürün gibi doğrudan kasa taşınmaz. Sindirim,
            biçimi değiştirir ve kullanılabilir malzemeleri açığa çıkarır.
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
              <i aria-hidden="true" data-protein-digestion-focus />
            </div>
            <figcaption>
              Bu görsel, sindirimin ölçeği nasıl küçülttüğünü anlatır;
              moleküler yapı çizimi değildir.
            </figcaption>
          </figure>
          <ol
            aria-label="Protein sindiriminin üç görünümü"
            className={styles.digestionStates}
          >
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
            <span className={styles.stateKicker}>Kullanım</span>
            <h3>Amino asitler</h3>
            <p>Sindirim ve emilimden sonra dolaşımdaki amino asit havuzuna katılır.</p>
          </li>
          </ol>
        </div>

        <div className={styles.notePair}>
          <SourceNote sourceKey="who-protein-requirements" sources={sources}>
            Protein ve amino asit gereksinimlerinin temel değerlendirmesi
          </SourceNote>
          <SourceNote sourceKey="fao-protein-quality" sources={sources}>
            Bileşim ve sindirilebilirliğin değerlendirilmesi
          </SourceNote>
        </div>
      </section>

      <section
        className={`${styles.scene} ${styles.referenceScene}`}
        data-protein-scene="reference"
      >
        <div className={styles.sceneNumber}>05 / Referans değerler</div>
        <div className={styles.referenceHeading}>
          <h2>“Yeterli” tek bir sayı değildir</h2>
          <p className={styles.referenceWarning}>Referans ≠ hedef ≠ üst sınır.</p>
        </div>
        <p className={styles.lead}>
          Aynı birimle yazılan değerler, aynı soruya yanıt vermez. EFSA’nın sağlıklı
          yetişkinler için nüfus referansı, sporcu rehberliği ve klinik değerlendirme
          birbirinin yerine kullanılamaz.
        </p>

        <div className={styles.referenceRails}>
          <section data-protein-reference-rail="population">
            <span className={styles.railPattern} data-rail-pattern="solid" aria-hidden="true" />
            <div className={styles.railLabel}>Nüfus referansı</div>
            <h3>EFSA · sağlıklı yetişkinler</h3>
            <strong>0,83 g/kg/gün</strong>
            <p>
              0,83 g/kg/gün, yani kilogram vücut ağırlığı başına günlük 0,83 gram,
              EFSA’nın sağlıklı yetişkinler için belirlediği nüfus referans alımıdır
              (PRI); kişisel hedef, optimum veya üst sınır değildir.
            </p>
          </section>
          <section data-protein-reference-rail="sport">
            <span className={styles.railPattern} data-rail-pattern="stripe" aria-hidden="true" />
            <div className={styles.railLabel}>Sporcu beslenmesi bağlamı</div>
            <h3>2016 ortak uzman pozisyonu</h3>
            <strong>1,2–2,0 g/kg/gün</strong>
            <p>
              Bu aralık düzenli ve yapılandırılmış antrenman yapan sporcular için
              ortak pozisyon rehberliğidir; CALORYTHM kişisel önerisi değildir.
              Antrenman türü ve dönemi, enerji alımı ve hedefler bu aralığın nasıl
              yorumlanacağını değiştirir.
            </p>
          </section>
          <section data-protein-reference-rail="assessment">
            <span className={styles.railPattern} data-rail-pattern="dot" aria-hidden="true" />
            <div className={styles.railLabel}>Ayrı değerlendirme</div>
            <h3>Çocukluk, gebelik, kırılgan ileri yaş ve hastalık</h3>
            <strong>Bağlama özgü değerler</strong>
            <p>
              Çocukluk ve gebelik için yaşa veya döneme özgü referanslar vardır.
              Kırılganlığı olan ileri yaştaki yetişkinlerde ve kronik böbrek
              hastalığında ise protein alımı bireysel klinik değerlendirme gerektirir.
            </p>
          </section>
        </div>

        <div
          aria-label="Protein referans bağlamları tablosu"
          className={styles.tableScroll}
          data-protein-table-scroll="reference-contexts"
          role="region"
          tabIndex={0}
        >
          <table>
            <caption>Protein değerlerini doğru bağlamda okuma tablosu</caption>
            <thead>
              <tr>
                <th scope="col">Bağlam</th>
                <th scope="col">Görünen ifade</th>
                <th scope="col">Nasıl okunmalı?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">EFSA sağlıklı yetişkin nüfus referansı</th>
                <td>0,83 g/kg/gün</td>
                <td>Nüfus düzeyinde PRI; kişisel hedef, optimum veya üst sınır değil.</td>
              </tr>
              <tr>
                <th scope="row">Sporcular için 2016 ortak pozisyonu</th>
                <td>1,2–2,0 g/kg/gün</td>
                <td>
                  Düzenli ve yapılandırılmış antrenman yapan sporcular için bağlama
                  bağlı rehberlik; CALORYTHM kişisel önerisi değil.
                </td>
              </tr>
              <tr>
                <th scope="row">Çocukluk, gebelik, kırılgan ileri yaş ve hastalık</th>
                <td>Bağlama özgü değerler</td>
                <td>
                  Yaşa veya döneme özgü referans ya da bireysel klinik değerlendirme
                  gerekir.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside className={styles.chartSummary} aria-label="Grafiğin kısa açıklaması">
          <strong>Bu grafik ne söylüyor?</strong>
          <p>
            Değerlerin birimi benzer görünse de amaçları farklıdır. Bir nüfus
            referansını kişisel reçeteye, optimuma veya güvenlik sınırına çeviremeyiz.
          </p>
        </aside>

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
            Protein kaynakları yalnızca toplam miktarla değil, vazgeçilmez amino asit
            bileşimi ve sindirilebilirlikle de değerlendirilir.
          </p>
        </div>

        <div className={styles.patternStage} data-protein-pin="pattern">
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
              <div className={styles.patternSlices} aria-hidden="true">
                {["one", "two", "three"].map((slice) => (
                  <i
                    data-protein-chord-row={slice}
                    data-protein-pattern-slice={slice}
                    key={slice}
                  >
                    <Image
                      alt=""
                      height={992}
                      loading="lazy"
                      sizes="(min-width: 1024px) calc(100vw - 23rem), 100vw"
                      src="/images/protein-story/protein-pattern-v1.webp"
                      width={1586}
                    />
                  </i>
                ))}
              </div>
            </div>
            <figcaption className={styles.chordCaption}>
              Şeritler farklı bileşim örüntülerini temsil eder; renk, uzunluk ve
              parça sayısı nicel değer ya da sıralama değildir.
            </figcaption>
          </figure>
        </div>

        <ul aria-label="Kanıt durumları" className={styles.evidenceStatuses}>
          {proteinEvidenceStatuses.map((status) => (
            <li data-protein-evidence-status={status.key} key={status.key}>
              <span
                className={styles.evidencePattern}
                data-evidence-pattern={status.key}
                aria-hidden="true"
              />
              <div>
                <strong>{status.label}</strong>
                <p>{status.statement}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className={styles.patternBoundary}>
          Bu yüzden besinleri “tam” ya da “eksik” diye etiketlemek, karmaşık bir
          örüntüyü tek sözcüğe indirger. Aynı nedenle “iyi” ya da “kötü” rozetleri
          kullanmıyoruz; kaynağı, öğünü ve genel beslenme örüntüsünü birlikte okuyoruz.
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
          <div className={styles.resolutionNotation} aria-hidden="true">
            <i data-protein-resolution-mark="one" />
            <i data-protein-resolution-mark="two" />
            <i data-protein-resolution-mark="three" />
            <i data-protein-resolution-mark="four" />
            <i data-protein-resolution-mark="five" />
          </div>
          <div>
            <h2>Bakım dili</h2>
            <p className={styles.resolutionQuestion}>Yalnızca “Kaç gram?” değil.</p>
            <p className={styles.lead}>
              Hangi bağlamda, hangi beslenme örüntüsü içinde ve ne amaçla? Protein için
              anlamlı yanıt, bu üç soruyu birlikte düşünmekle başlar.
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
            {sources.map(({ id, reference }) => (
              <li id={id} key={id}>
                <span className={styles.sourceIndex}>
                  {String(sources.findIndex((source) => source.id === id) + 1).padStart(
                    2,
                    "0",
                  )}
                </span>
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
                <Link href={`/journal/${relatedArticle.slug}`}>
                  {relatedArticle.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </footer>
    </article>
  );
}
