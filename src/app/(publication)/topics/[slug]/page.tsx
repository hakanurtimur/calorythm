import Link from "next/link";
import { notFound } from "next/navigation";
import { topics } from "@/content/topics";
import { getArticlesForTopic, getTopicBySlug } from "@/lib/content-selectors";
import styles from "../topics.module.css";

type TopicPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const relatedArticles = getArticlesForTopic(topic.slug);

  return (
    <main className={styles.topicPage} id="ana-icerik" tabIndex={-1}>
      <header className={styles.topicIntro} data-tone={topic.tone}>
        <Link href="/topics">Konu atlasına dön</Link>
        <h1>{topic.title}</h1>
        <p>{topic.definition}</p>
      </header>

      {relatedArticles.length > 0 ? (
        <section className={styles.topicArticles} aria-labelledby="konu-yazilari">
          <h2 id="konu-yazilari">Bu konuda yayımlananlar</h2>
          <div>
            {relatedArticles.map((article) => (
              <article key={article.slug}>
                <p>
                  {article.type === "visual-essay" ? "Görsel dosya" : "Editoryal not"}
                  {" · "}
                  {article.readingMinutes} dakika
                </p>
                <h3>
                  <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                </h3>
                <p>{article.deck}</p>
                <time dateTime={article.publishedAt}>24 Ağustos 2026</time>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.emptyArchive} aria-labelledby="buyuyen-arsiv">
          <h2 id="buyuyen-arsiv">Bu konu arşivi büyüyor.</h2>
          <p>
            {topic.title} için henüz yayımlanmış bir yazı yok. Yeni çalışmalar kaynak,
            kapsam ve anlatım açısından hazır olduğunda burada yerini alacak.
          </p>
          <Link href="/journal">Tüm Journal’ı gör</Link>
        </section>
      )}
    </main>
  );
}
