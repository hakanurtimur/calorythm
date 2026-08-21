import styles from "./home.module.css";

const calLetters = [
  {
    d: "M686 87Q641 33 572.5 6.5Q504 -20 433 -20Q353 -20 287.0 8.0Q221 36 173.0 85.5Q125 135 98.5 204.0Q72 273 72 354Q72 435 98.5 504.0Q125 573 173.0 622.5Q221 672 287.5 700.0Q354 728 433 728Q499 728 561.5 705.5Q624 683 668 637L654 621Q633 643 606.5 659.5Q580 676 550.5 687.0Q521 698 491.0 703.0Q461 708 433 708Q357 708 294.5 680.5Q232 653 187.5 605.0Q143 557 118.5 492.5Q94 428 94 354Q94 280 118.0 215.5Q142 151 186.5 103.0Q231 55 293.5 27.5Q356 0 433 0Q499 0 563.5 25.5Q628 51 670 102L686 87Z",
    transform: "translate(-6.93 70.075) scale(0.096 -0.096)",
  },
  {
    d: "M624 0 540 203H129L42 0H18L325 708H353L648 0ZM338 694 137 222H533Z",
    transform: "translate(91.636 70.075) scale(0.096 -0.096)",
  },
  {
    d: "M106 0V708H128V20H480V0Z",
    transform: "translate(184.62 70.075) scale(0.096 -0.096)",
  },
] as const;

const rythmLetters = [
  {
    d: "M508 0 294 357H128V0H106V708H302Q341 708 381.0 701.0Q421 694 452.5 674.5Q484 655 504.0 621.0Q524 587 524 533Q524 483 505.0 450.0Q486 417 456.0 396.5Q426 376 389.5 367.0Q353 358 318 358L533 0ZM502 533Q502 579 484.0 609.5Q466 640 436.5 657.5Q407 675 368.5 682.0Q330 689 290 689H128V376H301Q399 376 450.5 417.0Q502 458 502 533Z",
    transform: "translate(346.044 72) scale(0.102 -0.102)",
  },
  {
    d: "M280 310V0H258V310L15 708H41L270 332L498 708H523Z",
    transform: "translate(436.959 72) scale(0.102 -0.102)",
  },
  {
    d: "M281 688V0H259V688H18V708H522V688Z",
    transform: "translate(522.179 72) scale(0.102 -0.102)",
  },
  {
    d: "M604 0V356H128V0H106V708H128V376H604V708H626V0Z",
    transform: "translate(607.603 72) scale(0.102 -0.102)",
  },
  {
    d: "M778 0V683H774L461 0H443L131 683H128V0H106V708H145L453 32L761 708H800V0Z",
    transform: "translate(712.552 72) scale(0.102 -0.102)",
  },
] as const;

export function SplashLockup() {
  return (
    <svg
      aria-label="CALORYTHM"
      className={styles.splashLockup}
      data-brand-wordmark="primary"
      data-splash-lockup=""
      focusable="false"
      role="img"
      viewBox="0 0 793.908 82"
    >
      <title>CALORYTHM</title>
      <g
        className={styles.splashCal}
        data-splash-lettering="cal"
        fill="currentColor"
      >
        {calLetters.map((letter) => (
          <path d={letter.d} key={letter.transform} transform={letter.transform} />
        ))}
      </g>

      <g
        className={styles.splashRythm}
        data-splash-lettering="rythm"
        fill="currentColor"
      >
        {rythmLetters.map((letter) => (
          <path d={letter.d} key={letter.transform} transform={letter.transform} />
        ))}
      </g>
    </svg>
  );
}
