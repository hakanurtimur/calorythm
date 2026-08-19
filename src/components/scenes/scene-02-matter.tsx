import { homeContent } from "@/content/home";
import styles from "./home-scenes.module.css";

export function Scene02Matter() {
  const { matter } = homeContent;

  return (
    <section aria-label="Sahne 02: Madde" className={`${styles.scene} ${styles.matter}`} data-scene="02" id="madde">
      <div aria-hidden="true" className={styles.matterSurface} data-motion="matter-surface" />
      <div className={styles.copy}>
        <p className={styles.index} data-motion="matter-index">
          {matter.index}
        </p>
        <h2 className={styles.sceneTitle} data-motion="matter-title">
          {matter.title}
        </h2>
        <p className={styles.description} data-motion="matter-body">
          {matter.body}
        </p>
        <ul aria-label="Besin değerleri" className={styles.annotations} data-motion="matter-annotations">
          {matter.annotations.map((annotation) => (
            <li key={annotation}>{annotation}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
