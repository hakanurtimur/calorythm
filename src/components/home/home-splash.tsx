"use client";

import { useCallback, useEffect, useState } from "react";
import { readMotionProfile } from "@/components/motion/motion-profile";
import { OrbitalMark } from "@/components/orbital/orbital-mark";
import { orbitalHomeContent } from "@/content/orbital-home";
import styles from "./home.module.css";

type HomeSplashProps = {
  durationOverride?: 0 | 900 | 1750;
};

export function HomeSplash({ durationOverride }: HomeSplashProps) {
  const [visible, setVisible] = useState(durationOverride !== 0);
  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    const duration = durationOverride ?? readMotionProfile().splashDuration;

    if (duration === 0) {
      const immediateTimeout = window.setTimeout(dismiss, 0);
      return () => window.clearTimeout(immediateTimeout);
    }

    const timeout = window.setTimeout(dismiss, duration);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        dismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss, durationOverride]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-label="CALORYTHM açılış"
      aria-modal="true"
      className={styles.splash}
      data-testid="home-splash"
      onPointerDown={dismiss}
      role="dialog"
    >
      <OrbitalMark className={styles.splashMark} tone="ivory" variant="signature" />
      <div className={styles.splashCopy}>
        <p className={styles.splashWordmark}>{orbitalHomeContent.splash.label}</p>
        <p className={styles.splashStatement}>{orbitalHomeContent.splash.statement}</p>
      </div>
      <button className={styles.splashSkip} onClick={dismiss} type="button">
        <span>İntroyu geç</span>
        <span aria-hidden="true">↗</span>
      </button>
      <p aria-hidden="true" className={styles.splashTempo}>
        <span>AL</span>
        <i />
        <span>DÖNÜŞTÜR</span>
        <i />
        <span>ANLA</span>
      </p>
    </div>
  );
}
