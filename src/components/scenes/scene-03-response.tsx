import { homeContent } from "@/content/home";
import { ResponseField } from "@/components/response/response-field";
import styles from "./home-scenes.module.css";

export function Scene03Response() {
  const { response } = homeContent;

  return (
    <section aria-label="Sahne 03: Cevap" className={`${styles.scene} ${styles.response}`} data-scene="03" id="cevap">
      <div aria-hidden="true" className={styles.responseField} data-motion="response-field">
        <ResponseField />
      </div>
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
          {response.concepts.map((concept, index) => (
            <li key={concept}>
              <span aria-hidden="true" className={styles.conceptIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className={styles.conceptConnector} />
              <span>{concept}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
