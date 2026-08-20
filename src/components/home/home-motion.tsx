"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { readMotionProfile } from "@/components/motion/motion-profile";
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
            hero
              .fromTo(
                '[data-motion="hero-mark"]',
                { rotation: 0, scale: 1 },
                { duration: 1, rotation: 8, scale: 1.55 },
                0,
              )
              .to('[data-motion="hero-copy"]', { autoAlpha: 0.28, duration: 0.25, y: -24 }, 0.75);

            const knowledge = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: "bottom 30%",
                pin: undefined,
                scrub: 0.55,
                start: "top 82%",
                trigger: '[data-scene="01"]',
              },
            });
            knowledge
              .fromTo(
                '[data-motion="knowledge-fragment"]',
                { autoAlpha: 0.35, y: 24 },
                { autoAlpha: 1, duration: 0.72, stagger: 0.1, y: 0 },
                0,
              )
              .fromTo(
                '[data-scene="01"] h2',
                { y: 20 },
                { duration: 0.65, y: 0 },
                0.22,
              );

            const macros = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? "+=160%" : "bottom 28%",
                pin: canPin ? '[data-pin="02"]' : undefined,
                scrub: 0.8,
                start: canPin ? "top top" : "top 80%",
                trigger: '[data-scene="02"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            macros
              .fromTo(
                '[data-scene="02"] [data-orbit-mark]',
                { rotation: -10, scale: 0.9 },
                { duration: 1, rotation: 24, scale: 1.08 },
                0,
              )
              .fromTo(
                '[data-motion="macro-route"]',
                { autoAlpha: 0.28, scale: 0.96, y: 34 },
                { autoAlpha: 1, duration: 0.62, scale: 1, stagger: 0.2, y: 0 },
                0.12,
              );

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
            thought
              .fromTo(
                '[data-scene="04"] [data-orbit-mark]',
                { rotation: -18, scale: 0.62 },
                { duration: 1, rotation: 6, scale: 1.28 },
                0,
              )
              .fromTo(
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
            flagship
              .fromTo(
                '[data-scene="05"] h2',
                { y: 36 },
                { duration: 0.7, y: 0 },
                0,
              )
              .fromTo(
                '[data-motion="flagship-mark"]',
                { autoAlpha: 0.12, rotation: -12, scale: 0.74 },
                { autoAlpha: 1, duration: 0.85, rotation: 4, scale: 1 },
                0.12,
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

            const finale = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: "bottom 20%",
                pin: undefined,
                scrub: 0.64,
                start: "top 78%",
                trigger: '[data-scene="07"]',
              },
            });
            finale.fromTo(
              '[data-scene="07"] [data-orbit-path]',
              { strokeDasharray: 1, strokeDashoffset: 1 },
              { duration: 0.8, stagger: 0.08, strokeDashoffset: 0 },
            );

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
