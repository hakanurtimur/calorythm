"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { readMotionProfile } from "@/components/motion/motion-profile";
import { setOrbitalBaseState } from "@/components/orbital/orbital-thread-store";
import styles from "./home.module.css";

export type HomeMotionRuntime = {
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  gsap: (typeof import("gsap"))["gsap"];
};

type HomeMotionProps = {
  children: ReactNode;
  loadRuntime?: () => Promise<HomeMotionRuntime>;
};

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

const registeredRuntimes = new WeakSet<object>();

async function loadHomeMotionRuntime(): Promise<HomeMotionRuntime> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  return { gsap, ScrollTrigger };
}

function clearActiveTopics(scope: HTMLElement) {
  scope.querySelectorAll<HTMLElement>('[data-motion="journal-topic"]').forEach((topic) => {
    delete topic.dataset.active;
  });
}

export function HomeMotion({ children, loadRuntime = loadHomeMotionRuntime }: HomeMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope: HTMLDivElement = root;

    let active = true;
    let configurationVersion = 0;
    let context: ReturnType<HomeMotionRuntime["gsap"]["context"]> | undefined;
    let media: ReturnType<HomeMotionRuntime["gsap"]["matchMedia"]> | undefined;
    const connection = (navigator as NavigatorWithConnection).connection;
    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : undefined;
    const readProfile = () =>
      motionQuery
        ? readMotionProfile()
        : { animate: false, pin: false, splashDuration: 0 as const };

    const teardown = () => {
      media?.revert();
      context?.revert();
      media = undefined;
      context = undefined;
      clearActiveTopics(scope);
    };

    const showReducedState = () => {
      scope.dataset.motionProfile = "reduced";
      clearActiveTopics(scope);
    };

    async function configure() {
      const version = ++configurationVersion;
      teardown();

      if (!readProfile().animate) {
        showReducedState();
        return;
      }

      const runtime = await loadRuntime();
      if (!active || version !== configurationVersion) return;

      const profile = readProfile();
      if (!profile.animate) {
        showReducedState();
        return;
      }

      const { gsap, ScrollTrigger } = runtime;
      if (!registeredRuntimes.has(gsap)) {
        gsap.registerPlugin(ScrollTrigger);
        registeredRuntimes.add(gsap);
      }

      context = gsap.context(() => {
        media = gsap.matchMedia(scope);
        media.add(
          {
            isDesktop: "(min-width: 768px) and (min-height: 700px)",
            isMobile: "(max-width: 767px), (max-height: 699px)",
          },
          (mediaContext) => {
            const conditions = mediaContext.conditions as
              | { isDesktop: boolean; isMobile: boolean }
              | undefined;
            const currentProfile = readProfile();
            const canPin = currentProfile.pin && conditions?.isDesktop === true;

            if (!currentProfile.animate) {
              showReducedState();
              return;
            }

            scope.dataset.motionProfile = "full";

            const hero = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: "+=80%",
                pin: canPin ? '[data-pin="hero"]' : undefined,
                scrub: 0.7,
                start: "top top",
                trigger: '[data-scene="hero"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            hero.to(
              '[data-motion="hero-copy"]',
              { autoAlpha: 0.28, duration: 0.25, y: -24 },
              0.75,
            );

            const scene01HandoffShare = 0.22;
            if (canPin) {
              ScrollTrigger.create({
                end: "top top",
                id: "scene-01-handoff",
                onLeaveBack: () => setOrbitalBaseState({ kind: "hero" }),
                onUpdate: ({ progress }) =>
                  setOrbitalBaseState({
                    id: "01",
                    kind: "scene",
                    progress: progress * scene01HandoffShare,
                  }),
                start: "top bottom",
                trigger: '[data-scene="01"]',
              });
            }

            const knowledge = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? "+=200%" : "bottom 30%",
                onLeave: () =>
                  setOrbitalBaseState({ id: "02", kind: "scene", progress: 0 }),
                onLeaveBack: () => setOrbitalBaseState({ kind: "hero" }),
                onUpdate: ({ progress }) => {
                  if (!canPin) return;
                  setOrbitalBaseState({
                    id: "01",
                    kind: "scene",
                    progress:
                      scene01HandoffShare + progress * (1 - scene01HandoffShare),
                  });
                },
                pin: canPin ? '[data-pin="01"]' : undefined,
                scrub: 0.55,
                start: canPin ? "top top" : "top 82%",
                trigger: '[data-scene="01"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            const knowledgeSignalIndex = scope.querySelector(
              `[data-scene="01"] .${styles.knowledgeSignalIndex}`,
            );
            const knowledgeFragments = Array.from(
              scope.querySelectorAll('[data-motion="knowledge-fragment"]'),
            );
            const knowledgeTitleLines = Array.from(
              scope.querySelectorAll('[data-scene="01"] h2 span'),
            );
            const knowledgeBody = scope.querySelector(
              `[data-motion="knowledge-copy"] .${styles.sceneBody}`,
            );
            if (knowledgeSignalIndex) {
              knowledge.fromTo(
                knowledgeSignalIndex,
                { autoAlpha: 0 },
                { autoAlpha: 0.5, duration: 0.2 },
                0.05,
              );
            }
            if (knowledgeFragments.length > 0) {
              knowledge.fromTo(
                knowledgeFragments,
                { autoAlpha: 0, x: 18, y: 12 },
                { autoAlpha: 0.72, duration: 0.5, stagger: 0.08, x: 0, y: 0 },
                0.16,
              );
            }
            if (knowledgeTitleLines.length > 0) {
              knowledge.fromTo(
                knowledgeTitleLines,
                { autoAlpha: 0, yPercent: 42 },
                { autoAlpha: 1, duration: 0.46, stagger: 0.08, yPercent: 0 },
                0.28,
              );
            }
            if (knowledgeBody) {
              knowledge.fromTo(
                knowledgeBody,
                { autoAlpha: 0, y: 28 },
                { autoAlpha: 1, duration: 0.34, y: 0 },
                0.54,
              );
            }

            const macros = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? "+=220%" : "bottom 28%",
                onLeave: () => setOrbitalBaseState({ kind: "hero" }),
                onLeaveBack: () =>
                  setOrbitalBaseState({ id: "01", kind: "scene", progress: 1 }),
                onUpdate: ({ progress }) => {
                  if (!canPin) return;
                  setOrbitalBaseState({ id: "02", kind: "scene", progress });
                },
                pin: canPin ? '[data-pin="02"]' : undefined,
                scrub: 0.8,
                start: canPin ? "top top" : "top 80%",
                trigger: '[data-scene="02"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            const proofIndex = scope.querySelector('[data-proof-index]');
            const proofTitleLines = Array.from(
              scope.querySelectorAll('[data-scene="02"] h2 span'),
            );
            const proofBody = scope.querySelector(
              `[data-motion="proof-copy"] .${styles.sceneBody}`,
            );
            const proofStops = Array.from(
              scope.querySelectorAll('[data-motion="proof-stop"]'),
            );
            if (proofIndex) {
              macros.fromTo(
                proofIndex,
                { autoAlpha: 0 },
                { autoAlpha: 0.5, duration: 0.18 },
                0.03,
              );
            }
            if (proofTitleLines.length > 0) {
              macros.fromTo(
                proofTitleLines,
                { autoAlpha: 0, yPercent: 40 },
                { autoAlpha: 1, duration: 0.42, stagger: 0.08, yPercent: 0 },
                0.06,
              );
            }
            if (proofBody) {
              macros.fromTo(
                proofBody,
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, duration: 0.32, y: 0 },
                0.18,
              );
            }
            if (proofStops.length > 0) {
              macros.fromTo(
                proofStops,
                { autoAlpha: 0.12, scale: 0.96, y: 34 },
                { autoAlpha: 1, duration: 0.54, scale: 1, stagger: 0.18, y: 0 },
                0.2,
              );
            }

            const atlas = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: "bottom 24%",
                pin: undefined,
                scrub: 0.6,
                start: "top 78%",
                trigger: '[data-scene="03"]',
              },
            });
            atlas.fromTo(
              '[data-motion="topic-atlas-item"]',
              { autoAlpha: 0.3, x: 28 },
              { autoAlpha: 1, duration: 0.72, stagger: 0.1, x: 0 },
            );

            const thought = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? "+=140%" : "bottom 25%",
                pin: canPin ? '[data-pin="04"]' : undefined,
                scrub: 0.78,
                start: canPin ? "top top" : "top 78%",
                trigger: '[data-scene="04"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            thought.fromTo(
              '[data-motion="thought-resolution"]',
              { autoAlpha: 0.3, y: 28 },
              { autoAlpha: 1, duration: 0.42, y: 0 },
              0.56,
            );

            const flagship = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: "bottom 24%",
                pin: undefined,
                scrub: 0.58,
                start: "top 76%",
                trigger: '[data-scene="05"]',
              },
            });
            flagship.fromTo(
              '[data-scene="05"] h2',
              { y: 36 },
              { duration: 0.7, y: 0 },
              0,
            );

            const topics = Array.from(
              scope.querySelectorAll<HTMLElement>('[data-motion="journal-topic"]'),
            );
            const activateTopic = (activeTopic?: HTMLElement) => {
              topics.forEach((topic) => delete topic.dataset.active);
              if (activeTopic) activeTopic.dataset.active = "true";
            };
            topics.forEach((topic) => {
              ScrollTrigger.create({
                end: "bottom 42%",
                onEnter: () => activateTopic(topic),
                onEnterBack: () => activateTopic(topic),
                onLeaveBack: () => activateTopic(topics[topics.indexOf(topic) - 1]),
                start: "top 58%",
                trigger: topic,
              });
            });

            const fontsReady = document.fonts?.ready;
            fontsReady?.then(() => {
              if (active && version === configurationVersion) ScrollTrigger.refresh();
            });

            return () => clearActiveTopics(scope);
          },
        );
      }, scope);
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
      teardown();
    };
  }, [loadRuntime]);

  return (
    <div className={styles.motionRoot} data-motion-profile="pending" ref={rootRef}>
      {children}
    </div>
  );
}
