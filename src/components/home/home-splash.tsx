"use client";

import { useCallback, useEffect, useState } from "react";
import { readMotionProfile } from "@/components/motion/motion-profile";
import { orbitalPaths } from "@/components/orbital/orbital-paths";
import { HOME_SPLASH_DISMISS_EVENT } from "./home-intro-events";
import styles from "./home.module.css";
import { SplashLockup } from "./splash-lockup";

type HomeSplashProps = {
  durationOverride?: 0 | 1600 | 2400;
};

export function HomeSplash({ durationOverride }: HomeSplashProps) {
  const [visible, setVisible] = useState(durationOverride !== 0);
  const dismiss = useCallback(() => {
    window.dispatchEvent(new Event(HOME_SPLASH_DISMISS_EVENT));
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const restorePageScroll = () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };

    window.scrollTo({ behavior: "instant", left: 0, top: 0 });
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const duration = durationOverride ?? readMotionProfile().splashDuration;

    if (duration === 0) {
      const immediateTimeout = window.setTimeout(dismiss, 0);
      return () => {
        window.clearTimeout(immediateTimeout);
        restorePageScroll();
      };
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
      restorePageScroll();
    };
  }, [dismiss, durationOverride, visible]);

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
      <div aria-hidden="true" className={styles.splashChromaticField}>
        {orbitalPaths.map((path) => (
          <span data-splash-color={path.id} key={path.id} />
        ))}
      </div>

      <div className={styles.splashIdentity}>
        <SplashLockup />
      </div>
    </div>
  );
}
