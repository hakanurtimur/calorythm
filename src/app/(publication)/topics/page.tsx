import Link from "next/link";
import { topics } from "@/content/topics";
import styles from "./topics.module.css";

export default function TopicsPage() {
  return (
    <main className={styles.topics} id="ana-icerik" tabIndex={-1}>
      <header className={styles.topicsHeader}>
        <p>Başlangıç noktaları</p>
        <h1>Konular</h1>
        <p>
          Beslenme, tek bir besin ya da tek bir sayı değildir. Sekiz kalıcı konu,
          yazılar arasında kendi okuma rotanı kurmak için bir atlas oluşturur.
        </p>
      </header>

      <ol className={styles.topicList}>
        {topics.map((topic) => (
          <li data-tone={topic.tone} key={topic.slug}>
            <Link
              aria-label={`${topic.title} konusundaki yazıları gör`}
              href={`/topics/${topic.slug}`}
            >
              <span>{topic.title}</span>
              <p>{topic.definition}</p>
              <b aria-hidden="true">↗</b>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
