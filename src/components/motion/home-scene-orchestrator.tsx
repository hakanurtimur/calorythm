"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "@/components/scenes/home-scenes.module.css";
import { readMotionProfile } from "./motion-profile";
import { setSceneState } from "./scene-state-store";

type HomeSceneOrchestratorProps = {
  children: ReactNode;
  loadRuntime?: () => Promise<HomeMotionRuntime>;
};

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

type HomeMotionRuntime = {
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  gsap: (typeof import("gsap"))["gsap"];
};

async function loadHomeMotionRuntime(): Promise<HomeMotionRuntime> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
  return { gsap, ScrollTrigger };
}

export function HomeSceneOrchestrator({ children, loadRuntime = loadHomeMotionRuntime }: HomeSceneOrchestratorProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope: HTMLDivElement = root;

    let active = true;
    let configurationVersion = 0;
    let media: ReturnType<(typeof import("gsap"))["gsap"]["matchMedia"]> | undefined;
    const connection = (navigator as NavigatorWithConnection).connection;
    const motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : undefined;
    const readProfile = () => motionQuery ? readMotionProfile() : { animate: false, pin: false };

    const showReducedMotionState = () => {
      scope.dataset.motionProfile = "reduced";
      setSceneState({ scene: 1, progress: 0 });
    };

    async function configure() {
      const version = ++configurationVersion;
      media?.revert();
      media = undefined;

      if (!readProfile().animate) {
        showReducedMotionState();
        return;
      }

      const { gsap, ScrollTrigger } = await loadRuntime();
      if (!active || version !== configurationVersion) return;

      if (!readProfile().animate) {
        showReducedMotionState();
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia(scope);
      media.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const conditions = context.conditions as { isDesktop: boolean; isMobile: boolean } | undefined;
          const profile = readProfile();

          if (!profile.animate) {
            showReducedMotionState();
            return;
          }

          scope.dataset.motionProfile = "full";

          const hero = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: '[data-scene="01"]',
              start: "top 82%",
              end: "bottom 22%",
              scrub: 0.55,
              onUpdate: (self) => setSceneState({ scene: 1, progress: self.progress }),
            },
          });
          hero
            .fromTo(
              '[data-motion="site-wordmark"]',
              { autoAlpha: 0, y: -12 },
              { autoAlpha: 1, duration: 0.38, y: 0 },
            )
            .fromTo(
              '[data-motion="hero-title"]',
              { autoAlpha: 0, y: 36 },
              { autoAlpha: 1, duration: 0.75, y: 0 },
            )
            .fromTo(
              '[data-motion="hero-description"]',
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, duration: 0.55, y: 0 },
            )
            .fromTo(
              '[data-motion="hero-cta"]',
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, duration: 0.42, y: 0 },
            )
            .fromTo(
              '[data-motion="hero-form"]',
              { autoAlpha: 0, scaleX: 0.7, transformOrigin: "right center" },
              { autoAlpha: 1, duration: 0.8, scaleX: 1 },
            );

          const matterScrollTrigger = {
            trigger: '[data-scene="02"]',
            start: conditions?.isDesktop ? "top top" : "top 78%",
            end: conditions?.isDesktop ? "+=130%" : "bottom 28%",
            scrub: 0.7,
            onUpdate: (self: { progress: number }) => setSceneState({ scene: 2, progress: self.progress }),
            ...(profile.pin && conditions?.isDesktop ? { pin: '[data-scene="02"]', anticipatePin: 1 } : {}),
          };
          const matter = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: matterScrollTrigger,
          });
          const matterSurfaceFrom = conditions?.isDesktop
            ? {
                "--crop-main-x": "-5%",
                "--crop-main-width": "24%",
                "--crop-detail-one-y": "28%",
                "--crop-detail-two-x": "73%",
                scale: 0.96,
              }
            : { scale: 0.985 };
          const matterSurfaceTo = conditions?.isDesktop
            ? {
                "--crop-main-x": "2%",
                "--crop-main-width": "31%",
                "--crop-detail-one-y": "12%",
                "--crop-detail-two-x": "64%",
                duration: 1,
                scale: 1,
              }
            : { duration: 1, scale: 1 };
          matter
            .fromTo(
              '[data-motion="matter-surface"]',
              matterSurfaceFrom,
              matterSurfaceTo,
            )
            .fromTo(
              '[data-motion="matter-annotations"] li',
              { autoAlpha: 0, y: 32 },
              { autoAlpha: 1, duration: 0.6, stagger: 0.12, y: 0 },
              0.28,
            );

          const response = gsap.timeline({
            defaults: { ease: "power1.out" },
            scrollTrigger: {
              trigger: '[data-scene="03"]',
              start: "top 80%",
              end: "bottom 24%",
              scrub: 0.65,
              onUpdate: (self) => setSceneState({ scene: 3, progress: self.progress }),
            },
          });
          response
            .to('[data-motion="matter-surface"]', { autoAlpha: 0.16, duration: 0.5, scale: 1.04, xPercent: 8 })
            .fromTo(
              '[data-motion="response-field"]',
              { autoAlpha: 0, scaleX: 0.22, transformOrigin: "left center" },
              { autoAlpha: 1, duration: 0.65, scaleX: 1 },
              0,
            )
            .fromTo(
              '[data-motion="response-title"], [data-motion="response-body"]',
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, duration: 0.55, stagger: 0.14, y: 0 },
              0.22,
            )
            .fromTo(
              '[data-motion="response-concepts"] li',
              { autoAlpha: 0, x: -18 },
              { autoAlpha: 1, duration: 0.32, stagger: 0.1, x: 0 },
              0.48,
            );
        },
      );
    }

    const handleConstraintChange = () => void configure();

    void configure();
    motionQuery?.addEventListener("change", handleConstraintChange);
    connection?.addEventListener("change", handleConstraintChange);

    return () => {
      active = false;
      configurationVersion += 1;
      motionQuery?.removeEventListener("change", handleConstraintChange);
      connection?.removeEventListener("change", handleConstraintChange);
      media?.revert();
    };
  }, [loadRuntime]);

  return (
    <div className={styles.sceneOrchestrator} data-motion-profile="pending" ref={rootRef}>
      {children}
    </div>
  );
}
