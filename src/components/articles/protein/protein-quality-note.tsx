import Image from "next/image";
import Link from "next/link";
import type { ArticleRecord } from "@/content/articles";
import { EditorialNoteEnd } from "@/components/editorial/editorial-note";
import styles from "./protein-quality-note.module.css";

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

function QualityThreads() {
  return (
    <svg className={styles.threads} viewBox="0 0 600 380" fill="none" aria-hidden="true">
      <g strokeWidth="5" strokeLinecap="round">
        <path pathLength="1" d="M -20 64 H 125 C 245 64 225 166 345 166 H 620" />
        <path pathLength="1" d="M -20 94 H 117 C 232 94 228 182 345 182 H 620" />
        <path pathLength="1" d="M -20 286 H 117 C 232 286 228 198 345 198 H 620" />
        <path pathLength="1" d="M -20 316 H 125 C 245 316 225 214 345 214 H 620" />
      </g>
    </svg>
  );
}

export function ProteinQualityNote({ article }: Readonly<{ article: ArticleRecord }>) {
  return (
    <article className={styles.article} data-article-type={article.type} data-header-tone="light">
      <header className={styles.cover}>
        <div className={styles.coverCopy}>
          <nav className={styles.breadcrumb} aria-label="Yazı konumu">
            <Link href="/journal">Journal</Link><span aria-hidden="true">/</span><Link href="/topics/protein">Protein</Link>
          </nav>
          <h1>Bir proteini <em>“kaliteli”</em> yapan ne?</h1>
          <p className={styles.deck}>{article.deck}</p>
          <div className={styles.metadata}>
            <span>{article.author}</span>
            <time dateTime={article.publishedAt}>{dateFormat.format(new Date(`${article.publishedAt}T00:00:00Z`))}</time>
            <span>{article.readingMinutes} dakika okuma</span>
          </div>
          <a className={styles.readLink} href="#kaliteyi-anlamak">Kaliteyi anlamak <span aria-hidden="true">↓</span></a>
        </div>
        <figure className={styles.coverArt}>
          <Image src="/images/protein-story/protein-material-v1.webp" alt="Fildişi, mercan ve zeytin tonlarında birbirine geçen, farklı yapılardaki protein liflerini yorumlayan kompozisyon." width={1586} height={992} sizes="(min-width: 900px) 52vw, 100vw" loading="eager" fetchPriority="high" />
          <figcaption><span>Protein / Yakından</span><span>Birbirini tamamlayan yapılar</span></figcaption>
        </figure>
      </header>

      <section className={styles.opening} id="kaliteyi-anlamak" aria-labelledby="kalite-baslik">
        <div className={styles.openingTitle}>
          <span className={styles.sectionNote}>Bir kavramı açıyoruz</span>
          <h2 id="kalite-baslik">Kalite tek kelimeye sığmaz</h2>
        </div>
        <div className={styles.prose}>
          <p className={styles.lead}>Bir etiketteki protein miktarı bize gramı söyler. Proteinin niteliğini anlamak için biraz daha yakından bakmak gerekir.</p>
          {article.body[0]?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <a className={styles.sourceLink} href="#kalite-kaynak-notu">Bu değerlendirmenin dayanağı <span aria-hidden="true">↘</span></a>
        </div>
      </section>

      <section className={styles.lens} aria-labelledby="iki-soru" data-header-tone="dark">
        <div className={styles.lensVisual}>
          <h2 id="iki-soru">İki soruyu<br /><em>birlikte</em> sor.</h2>
          <div className={styles.threadStage}>
            <div className={styles.threadLabels}><span>Amino asit bileşimi</span><span>Sindirilebilirlik</span></div>
            <QualityThreads />
            <p>Protein kalitesi</p>
          </div>
          <p className={styles.caption}>İki ölçüt arasındaki ilişkiyi gösteren şema; çizgiler sayısal veri temsil etmez.</p>
        </div>
        <div className={styles.factors}>
          <section>
            <span className={styles.factorNumber}>01</span>
            <div><h3>İçinde ne var?</h3><p>Vazgeçilmez amino asitlerin miktarı ve birbirine oranı değerlendirilir. Bir amino asidin referans gereksinime göre daha düşük kalması, proteinin değerlendirmesini sınırlayabilir.</p><span className={styles.term}>Amino asit bileşimi</span></div>
          </section>
          <section>
            <span className={styles.factorNumber}>02</span>
            <div><h3>Ne kadarı sindiriliyor?</h3><p>Besinin içerdiği amino asitlerle sindirim sonunda emilebilen miktar aynı olmayabilir. Bu yüzden yalnızca bileşime bakmak yeterli değildir.</p><span className={styles.term}>Sindirilebilirlik</span></div>
          </section>
          <p className={styles.factorConclusion}>Birlikte okunduğunda, bu iki ölçüt proteinin amino asit gereksinimine katkısını anlamaya yardım eder.</p>
        </div>
      </section>

      <section className={styles.context} aria-labelledby="oruntu-baslik">
        <figure className={styles.patternArt}>
          <Image src="/images/protein-story/protein-pattern-v1.webp" alt="Farklı renk ve dokudaki liflerin yan yana uzandığı, protein kaynaklarının çeşitliliğini yorumlayan kompozisyon." width={1586} height={992} sizes="(min-width: 900px) 48vw, 100vw" loading="lazy" />
          <figcaption>Farklı kaynaklar, birlikte okunan bir bütün.</figcaption>
        </figure>
        <div className={styles.contextCopy}>
          <h2 id="oruntu-baslik">Bağlam örüntünün parçasıdır</h2>
          {article.body[1]?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <blockquote>Tek bir kaynağa bakarken,<br /><em>öğünün bütününü</em> unutma.</blockquote>
        </div>
      </section>

      <section className={styles.method} id="kalite-kaynak-notu" aria-labelledby="yontem-baslik">
        <div><span className={styles.sectionNote}>Kaynağın içinden</span><h2 id="yontem-baslik">Peki, nasıl ölçülüyor?</h2><p>Literatürde iki kısaltmayla karşılaşabilirsin. Aynı hesaplama yöntemini ifade etmezler.</p></div>
        <div className={styles.definitions}>
          <details><summary><span>PDCAAS</span><span className={styles.summaryDetail}>Protein sindirilebilirliğiyle düzeltilmiş amino asit skoru</span><span className={styles.toggle} aria-hidden="true">+</span></summary><p>Amino asit skorunu proteinin toplam sindirilebilirliğiyle düzeltir. Hesaplamada dışkı düzeyindeki sindirilebilirlik kullanılır.</p></details>
          <details><summary><span>DIAAS</span><span className={styles.summaryDetail}>Sindirilebilir vazgeçilmez amino asit skoru</span><span className={styles.toggle} aria-hidden="true">+</span></summary><p>Vazgeçilmez amino asitlerin her birinin ince bağırsağın sonundaki sindirilebilirliğini ayrı ayrı dikkate alır. FAO’nun 2013 raporu bu yaklaşımı önerir.</p></details>
          <a className={styles.sourceLink} href="https://www.fao.org/4/i3124e/i3124e.pdf">FAO raporunu oku <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <EditorialNoteEnd article={article} />
    </article>
  );
}
