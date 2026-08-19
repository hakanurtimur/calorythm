import { homeContent } from "@/content/home";
import styles from "./home-scenes.module.css";

export function Scene03Response() {
  const { response } = homeContent;

  return (
    <section aria-label="Sahne 03: Cevap" className={`${styles.scene} ${styles.response}`} data-scene="03" id="cevap">
      <div aria-hidden="true" className={styles.responseField} data-motion="response-field" />
      <div className={styles.copy}>
        <p className={styles.index} data-motion="response-index">
          {response.index}
        </p>
        <h2 aria-label={response.title} className={styles.sceneTitle} data-motion="response-title">
          <span aria-hidden="true" className={styles.titleLine}>
            Beden sadece almaz.
          </span>
          <span aria-hidden="true" className={styles.titleLine}>
            Cevap verir.
          </span>
        </h2>
        <p className={styles.description} data-motion="response-body">
          {response.body}
        </p>
        <ul aria-label="Bedenin yanıtları" className={styles.concepts} data-motion="response-concepts">
          {response.concepts.map((concept) => (
            <li key={concept}>{concept}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
