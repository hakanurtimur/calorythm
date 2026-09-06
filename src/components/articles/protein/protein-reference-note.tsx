import Image from "next/image";
import Link from "next/link";
import type { ArticleRecord } from "@/content/articles";
import { EditorialNoteEnd } from "@/components/editorial/editorial-note";
import styles from "./protein-reference-note.module.css";

const concepts = [
  { id: "referans", name: "Referans", question: "Bir toplumun gereksinimi ne?", text: "Nüfus referans alımı (PRI), belirli bir sağlıklı nüfus grubunun büyük çoğunluğunun gereksinimini karşılamayı amaçlar. Tek bir kişinin ideal alım miktarını söylemez.", note: "Nüfus düzeyinde değerlendirme", kind: "population" },
  { id: "hedef", name: "Hedef", question: "Bu kişi için ne amaçlanıyor?", text: "Kişisel hedef; yaş, fizyolojik durum, hareket, sağlık ve beslenme düzeniyle birlikte değerlendirilir. Bir araştırmadaki ya da rehberdeki sayı, bu bağlam olmadan kişiye aktarılamaz.", note: "Kişiye ve amaca göre değerlendirme", kind: "target" },
  { id: "ust-sinir", name: "Üst sınır", question: "Uzun süreli alımda risk nerede?", text: "Tolere edilebilir üst alım düzeyi (UL), uzun süreli günlük alımda olumsuz etki beklenmeyen en yüksek düzeyi tanımlar. Ulaşılması gereken bir hedef değildir.", note: "Güvenlik açısından değerlendirme", kind: "limit" },
] as const;

function ConceptMark({ kind }: Readonly<{ kind: typeof concepts[number]["kind"] }>) {
  return <svg className={styles.conceptMark} viewBox="0 0 160 90" fill="none" aria-hidden="true">
    {kind === "population" ? <g fill="currentColor">{Array.from({length: 15}, (_, i) => <circle key={i} cx={22 + (i % 5) * 28} cy={17 + Math.floor(i / 5) * 28} r="4" />)}</g>
      : kind === "target" ? <g stroke="currentColor" strokeWidth="2"><circle cx="80" cy="45" r="30" /><circle cx="80" cy="45" r="16" /><circle cx="80" cy="45" r="3" fill="currentColor" /></g>
        : <g stroke="currentColor" strokeWidth="3"><path d="M 15 29 H 135 M 15 45 H 135 M 15 61 H 135" /><path d="M 137 13 V 77" strokeWidth="5" /></g>}
  </svg>;
}

export function ProteinReferenceNote({ article }: Readonly<{ article: ArticleRecord }>) {
  return <article className={styles.article} data-article-type={article.type} data-header-tone="light">
    <header className={styles.cover}>
      <nav className={styles.breadcrumb} aria-label="Yazı konumu"><Link href="/journal">Journal</Link><span aria-hidden="true">/</span><Link href="/topics/protein">Protein</Link></nav>
      <div className={styles.coverGrid}>
        <div className={styles.coverCopy}>
          <h1><span>Referans değer,</span>{" "}<span>hedef ve üst sınır</span>{" "}<em>aynı şey değildir.</em></h1>
          <p className={styles.deck}>{article.deck}</p>
          <div className={styles.metadata}><span>{article.author}</span><time dateTime={article.publishedAt}>{new Intl.DateTimeFormat("tr-TR", {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(`${article.publishedAt}T00:00:00Z`))}</time><span>{article.readingMinutes} dakika okuma</span></div>
        </div>
        <figure className={styles.coverArt}>
          <Image src="/images/calorythm-folio-page-research-v2.webp" alt="Beslenme araştırmalarını, dağılımları ve bireysel farklılıkları yorumlayan kabartma kâğıt kompozisyonu." width={900} height={1200} sizes="(min-width: 900px) 32vw, 90vw" loading="eager" fetchPriority="high" />
          <figcaption>Veriye bir bakış.<br />Yorumlayıcı görsel; sayısal veri içermez.</figcaption>
        </figure>
      </div>
      <nav className={styles.chapterLinks} aria-label="Bu yazıda">
        {concepts.map((concept) => <a href={`#${concept.id}`} key={concept.id}><span>{concept.name}</span><span aria-hidden="true">↓</span></a>)}
      </nav>
    </header>

    <section className={styles.comparison} aria-labelledby="uc-farkli-soru">
      <div className={styles.sectionIntro}><h2 id="uc-farkli-soru">Üç kavram.<br /><em>Üç farklı soru.</em></h2><p>Beslenme hakkında bir sayı gördüğünde, önce neyi tarif ettiğine bak. Gereksinimi, kişisel amacı ve güvenliği aynı kelimeyle anlatamayız.</p></div>
      <div className={styles.conceptList}>
        {concepts.map((concept) => <section id={concept.id} className={styles.concept} data-kind={concept.kind} key={concept.id} aria-labelledby={`${concept.id}-baslik`}>
          <ConceptMark kind={concept.kind} />
          <div className={styles.conceptTitle}><h3 id={`${concept.id}-baslik`}>{concept.name}</h3><p>{concept.question}</p></div>
          <div className={styles.conceptBody}><p>{concept.text}</p><span>{concept.note}</span></div>
        </section>)}
      </div>
      <a className={styles.sourceLink} href="https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values">Kavramların kaynağı: EFSA <span aria-hidden="true">↗</span></a>
    </section>

    <section className={styles.example} data-header-tone="dark" aria-labelledby="referans-ornek">
      <div className={styles.exampleIntro}><span className={styles.label}>Protein üzerinden okuyalım</span><h2 id="referans-ornek">Referans bir<br /><em>başlangıç noktasıdır.</em></h2></div>
      <div className={styles.exampleGrid}>
        <div className={styles.referenceValue}>
          <span className={styles.label}>EFSA · Sağlıklı yetişkinler · 2012</span>
          <p className={styles.value}>0,83<span>g/kg/gün</span></p>
          <p>Her kilogram vücut ağırlığı başına,<br />günlük protein için nüfus referans alımı.</p>
          <svg className={styles.referenceLines} viewBox="0 0 500 100" fill="none" aria-hidden="true"><g strokeWidth="4" strokeLinecap="round">{[18,38,58,78].map((y,i)=><path key={y} pathLength="1" d={`M 2 ${y} H ${380-i*22} Q ${440-i*22} ${y} ${440-i*22} ${y-12}`} />)}</g></svg>
          <a className={styles.sourceLink} href="https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557">Bilimsel değerlendirmeyi oku <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.exampleCopy}>
          {article.body[0]?.paragraphs.map(p=><p key={p}>{p}</p>)}
          <dl><div><dt>Neyi söyler?</dt><dd>Sağlıklı yetişkin nüfus için belirlenen referansı.</dd></div><div><dt>Neyi söylemez?</dt><dd>Senin kişisel hedefini, optimum alımını ya da güvenlik sınırını.</dd></div></dl>
          <p className={styles.exampleNote}>Sayıyı doğru aktarmak kadar, hangi amaçla belirlendiğini aktarmak da önemlidir.</p>
        </div>
      </div>
    </section>

    <section className={styles.safety} aria-labelledby="guvenlik-baslik">
      <div><span className={styles.label}>Verinin sınırı</span><h2 id="guvenlik-baslik">Hedef ve güvenlik<br /><em>ayrı sorulardır.</em></h2></div>
      <div className={styles.safetyCopy}><p className={styles.lead}>Üst sınır belirlenememiş olması, sınırsız alımın güvenli olduğunu göstermez.</p><p>EFSA’nın 2012 protein değerlendirmesinde, tolere edilebilir üst alım düzeyi belirlemek için verilerin yetersiz olduğu belirtilir. Bu, kişisel bir güvenlik garantisi olarak okunmamalıdır.</p>{article.body[1]?.paragraphs.map(p=><p key={p}>{p}</p>)}</div>
    </section>

    <section className={styles.takeaway} aria-labelledby="sonraki-sayi">
      <h2 id="sonraki-sayi">Bir sonraki sayıda,<br /><em>önce bunları sor.</em></h2>
      <ul><li><span>Kimin için?</span><p>Hangi yaş, sağlık ve yaşam koşulundaki kişiler için?</p></li><li><span>Ne amaçla?</span><p>Bir referans mı, kişisel hedef mi, güvenlik sınırı mı?</p></li><li><span>Hangi kaynağa göre?</span><p>Hangi araştırma veya rehber, hangi değerlendirmeyle?</p></li></ul>
    </section>
    <EditorialNoteEnd article={article} />
  </article>;
}
