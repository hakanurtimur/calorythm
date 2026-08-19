import Image from "next/image";
import { homeContent } from "@/content/home";
import styles from "./home-scenes.module.css";

export function Scene02Matter() {
  const { matter } = homeContent;

  return (
    <section aria-label="Sahne 02: Madde" className={`${styles.scene} ${styles.matter}`} data-scene="02" id="madde">
      <div className={styles.matterGrid}>
        <div className={`${styles.copy} ${styles.matterCopy}`}>
          <p className={styles.index} data-motion="matter-index">
            {matter.index}
          </p>
          <h2 className={styles.sceneTitle} data-motion="matter-title">
            {matter.title}
          </h2>
          <p className={styles.description} data-motion="matter-body">
            {matter.body}
          </p>
        </div>

        <figure className={styles.matterSurface} data-motion="matter-surface">
          <Image
            alt="Koyu ekmek dokusu, yakut renkli narenciye ve zeytinyağının makro görünümü"
            className={styles.matterImage}
            fill
            sizes="(max-width: 767px) calc(100vw - 40px), 62vw"
            src="/images/matter-source.webp"
          />
          <span
            aria-hidden="true"
            className={`${styles.cropWindow} ${styles.cropWindowDetailOne}`}
            data-detail-window="one"
          />
          <span
            aria-hidden="true"
            className={`${styles.cropWindow} ${styles.cropWindowDetailTwo}`}
            data-detail-window="two"
          />
        </figure>

        <ul aria-label="Besin değerleri" className={styles.annotations} data-motion="matter-annotations">
          {matter.annotations.map((annotation) => (
            <li key={annotation}>{annotation}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
