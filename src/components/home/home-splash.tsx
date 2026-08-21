"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readMotionProfile } from "@/components/motion/motion-profile";
import { orbitalPaths } from "@/components/orbital/orbital-paths";
import { HOME_SPLASH_DISMISS_EVENT } from "./home-intro-events";
import styles from "./home.module.css";
import { SplashLockup } from "./splash-lockup";

type HomeSplashProps = {
  durationOverride?: 0 | 1600 | 2400;
};

type BackgroundState = {
  ariaHidden: string | null;
  element: HTMLElement;
  inert: boolean;
};

function isolateBackground(surface: HTMLElement) {
  const background: BackgroundState[] = [];
  let branch: Element = surface;
  let parent = surface.parentElement;

  while (parent) {
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === branch || !(sibling instanceof HTMLElement)) return;
      background.push({
        ariaHidden: sibling.getAttribute("aria-hidden"),
        element: sibling,
        inert: sibling.hasAttribute("inert"),
      });
      sibling.setAttribute("aria-hidden", "true");
      sibling.setAttribute("inert", "");
    });
    if (parent === document.body) break;
    branch = parent;
    parent = parent.parentElement;
  }

  return () => {
    background.reverse().forEach(({ ariaHidden, element, inert }) => {
      if (!inert) element.removeAttribute("inert");
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
  };
}

export function HomeSplash({ durationOverride }: HomeSplashProps) {
  const [visible, setVisible] = useState(durationOverride !== 0);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => {
    window.dispatchEvent(new Event(HOME_SPLASH_DISMISS_EVENT));
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    const root = document.documentElement;
    const body = document.body;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const restoreBackground = isolateBackground(surface);
    const restorePageScroll = () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };
    const restoreFocus = () => {
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
    const containFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Node) || !surface.contains(event.target)) {
        surface.focus({ preventScroll: true });
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        surface.focus({ preventScroll: true });
        return;
      }
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        dismiss();
      }
    };

    window.scrollTo({ behavior: "instant", left: 0, top: 0 });
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    document.addEventListener("focusin", containFocus);
    window.addEventListener("keydown", handleKeyDown);
    surface.focus({ preventScroll: true });

    const duration = durationOverride ?? readMotionProfile().splashDuration;

    if (duration === 0) {
      const immediateTimeout = window.setTimeout(dismiss, 0);
      return () => {
        window.clearTimeout(immediateTimeout);
        document.removeEventListener("focusin", containFocus);
        window.removeEventListener("keydown", handleKeyDown);
        restoreBackground();
        restorePageScroll();
        restoreFocus();
      };
    }

    const timeout = window.setTimeout(dismiss, duration);

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("focusin", containFocus);
      window.removeEventListener("keydown", handleKeyDown);
      restoreBackground();
      restorePageScroll();
      restoreFocus();
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
      ref={surfaceRef}
      role="dialog"
      tabIndex={0}
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
