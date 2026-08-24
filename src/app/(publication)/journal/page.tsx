import Link from "next/link";
import { getPublishedArticles } from "@/lib/content-selectors";
import styles from "./journal.module.css";

const flagshipSlug = "protein-sadece-kas-icin-degildir";

export default function JournalPage() {
  const articles = getPublishedArticles();
  const flagship = articles.find((article) => article.slug === flagshipSlug)!;
  const notes = articles.filter((article) => article.type === "editorial-note");

  return (
    <main className={styles.journal} id="ana-icerik" tabIndex={-1}>
      <header className={styles.masthead}>
        <p>Beslenme bilimi, kaynakları ve bağlamıyla</p>
        <h1>Journal</h1>
        <p>
          Kesin cümleleri çoğaltmak yerine iddianın nereden geldiğini, kanıtın ne
          söylediğini ve nerede sustuğunu birlikte okuyoruz.
        </p>
        <div aria-hidden="true" className={styles.bands}>
          <i />
          <i />
          <i />
          <i />
        </div>
      </header>

      <section aria-label="Yayımlanmış yazılar" className={styles.river}>
        <article className={styles.flagship} data-editorial-role="flagship">
          <div className={styles.flagshipSignal} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={styles.flagshipCopy}>
            <p>Görsel dosya · {flagship.readingMinutes} dakika</p>
            <h2>
              <Link href={`/journal/${flagship.slug}`}>{flagship.title}</Link>
            </h2>
            <p>{flagship.deck}</p>
            <div className={styles.storyMeta}>
              <span>{flagship.author}</span>
              <time dateTime={flagship.publishedAt}>24 Ağustos 2026</time>
              <Link href="/topics/protein">Protein</Link>
            </div>
          </div>
        </article>

        <div className={styles.notes}>
          {notes.map((article) => (
            <article className={styles.note} data-editorial-role="note" key={article.slug}>
              <div>
                <p>Editoryal not · {article.readingMinutes} dakika</p>
                <time dateTime={article.publishedAt}>24 Ağustos 2026</time>
              </div>
              <h2>
                <Link href={`/journal/${article.slug}`}>{article.title}</Link>
              </h2>
              <p>{article.deck}</p>
              <Link className={styles.readLink} href={`/journal/${article.slug}`}>
                Yazıyı oku <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
