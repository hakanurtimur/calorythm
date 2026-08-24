import Link from "next/link";
import type { ArticleRecord } from "@/content/articles";
import { getRelatedArticles } from "@/lib/content-selectors";
import styles from "./editorial.module.css";

const turkishDate = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

type EditorialNoteProps = Readonly<{
  article: ArticleRecord;
}>;

export function EditorialNote({ article }: EditorialNoteProps) {
  const related = getRelatedArticles(article);

  return (
    <article className={styles.article} data-article-type={article.type}>
      <header className={styles.articleHeader}>
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
      </header>

      <div className={styles.body}>
        {article.body.map((section) => (
          <section className={styles.bodySection} key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      <aside className={styles.disclaimer} aria-label="Yazının kapsamı">
        Bu yazı genel bilimsel açıklamadır; kişisel beslenme veya tedavi önerisi değildir.
      </aside>

      <section className={styles.sources} aria-labelledby="kaynaklar-basligi">
        <h2 id="kaynaklar-basligi">Kaynaklar</h2>
        <ol aria-label="Kaynaklar">
          {article.references.map((reference) => (
            <li key={reference.href}>
              <a href={reference.href}>
                <span>{reference.title}</span>
                <small>{reference.publisher}</small>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.related} aria-labelledby="ilgili-okumalar-basligi">
        <h2 id="ilgili-okumalar-basligi">İlgili okumalar</h2>
        <ul>
          {related.map((relatedArticle) => (
            <li key={relatedArticle.slug}>
              <Link href={`/journal/${relatedArticle.slug}`}>
                <span>{relatedArticle.title}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
