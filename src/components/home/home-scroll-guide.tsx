import styles from "./home.module.css";

const chapters = [
  { href: "#top", id: "hero", index: "00", label: "Hero" },
  { href: "#section-01", id: "01", index: "01", label: "Gürültü" },
  { href: "#section-02", id: "02", index: "02", label: "Kanıt" },
  { href: "#konular", id: "03", index: "03", label: "Konular" },
] as const;

export function HomeScrollGuide() {
  return (
    <nav
      aria-label="Ana sayfa bölümleri"
      className={styles.scrollGuide}
      data-active-scene="hero"
      data-scroll-guide=""
      data-scroll-phase="enter"
      data-visible="true"
    >
      <p aria-hidden="true" className={styles.scrollGuideCurrent}>
        <span data-scroll-guide-current="">00</span>
        <span>/03</span>
      </p>
      <span aria-hidden="true" className={styles.scrollGuideTrack}>
        <i data-scroll-guide-meter="" />
      </span>
      <ol>
        {chapters.map((chapter, index) => (
          <li
            data-active={index === 0 ? "true" : undefined}
            data-scroll-guide-item={chapter.id}
            data-state={index === 0 ? "active" : "future"}
            key={chapter.id}
          >
            <a
              aria-current={index === 0 ? "step" : undefined}
              href={chapter.href}
            >
              <span>{chapter.index}</span>
              <small>{chapter.label}</small>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
