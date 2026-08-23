"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { readMotionProfile } from "@/components/motion/motion-profile";
import { setOrbitalBaseState } from "@/components/orbital/orbital-thread-store";
import {
  HOME_SCROLL_CONDUCTOR_CONFIG,
  HOME_SCROLL_SCENE_IDS,
  clampScrollProgress,
  resolveHomeScrollState,
  type HomeScrollSceneId,
} from "./home-scroll-conductor";
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

function publishScrollGuide(
  scope: HTMLElement,
  sceneId: HomeScrollSceneId,
  progress: number,
) {
  const guide = scope.querySelector<HTMLElement>('[data-scroll-guide=""]');
  if (!guide) return;

  setScrollGuideVisibility(scope, true);
  const state = resolveHomeScrollState(sceneId, progress);
  guide.dataset.activeScene = state.sceneId;
  guide.dataset.scrollPhase = state.phase;
  guide.style.setProperty(
    "--scroll-guide-progress",
    String(Number(state.globalProgress.toFixed(4))),
  );

  const current = guide.querySelector<HTMLElement>('[data-scroll-guide-current=""]');
  if (current) current.textContent = state.currentLabel;

  guide.querySelectorAll<HTMLElement>("[data-scroll-guide-item]").forEach((item) => {
    const itemId = item.dataset.scrollGuideItem as HomeScrollSceneId | undefined;
    const itemIndex = itemId ? HOME_SCROLL_SCENE_IDS.indexOf(itemId) : -1;
    const isActive = itemId === sceneId;
    item.dataset.state = isActive
      ? "active"
      : itemIndex < state.chapterIndex
        ? "past"
        : "future";
    if (isActive) item.dataset.active = "true";
    else delete item.dataset.active;

    const link = item.querySelector("a");
    if (isActive) link?.setAttribute("aria-current", "step");
    else link?.removeAttribute("aria-current");
  });
}

function setScrollGuideVisibility(scope: HTMLElement, visible: boolean) {
  const guide = scope.querySelector<HTMLElement>('[data-scroll-guide=""]');
  if (!guide) return;

  guide.dataset.visible = visible ? "true" : "false";
  guide.inert = !visible;
  if (visible) guide.removeAttribute("aria-hidden");
  else guide.setAttribute("aria-hidden", "true");
}

function resetScrollGuide(scope: HTMLElement) {
  publishScrollGuide(scope, "hero", 0);
}

function publishSceneEntry(
  scope: HTMLElement,
  sceneId: Exclude<HomeScrollSceneId, "hero">,
  progress: number,
) {
  const scene = scope.querySelector<HTMLElement>(`[data-scene="${sceneId}"]`);
  if (!scene) return;

  const entryProgress = clampScrollProgress(progress);
  scene.style.setProperty("--scene-entry-progress", String(entryProgress));
  scene.style.setProperty("--scene-entry-muted", String(entryProgress * 0.56));
  scene.style.setProperty("--scene-entry-detail", String(entryProgress * 0.28));
}

function setSceneEntries(scope: HTMLElement, progress: number) {
  (["01", "02", "03"] as const).forEach((sceneId) => {
    publishSceneEntry(scope, sceneId, progress);
  });
}

function composeSceneProgress(sceneId: Exclude<HomeScrollSceneId, "hero">, progress: number) {
  const { entryShare } = HOME_SCROLL_CONDUCTOR_CONFIG[sceneId];
  return entryShare + progress * (1 - entryShare);
}

function pinProgressForSceneProgress(
  sceneId: Exclude<HomeScrollSceneId, "hero">,
  sceneProgress: number,
) {
  const { entryShare } = HOME_SCROLL_CONDUCTOR_CONFIG[sceneId];
  return clampScrollProgress((sceneProgress - entryShare) / (1 - entryShare));
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
      resetScrollGuide(scope);
      setSceneEntries(scope, 1);
      setScrollGuideVisibility(scope, false);
    };

    const showReducedState = () => {
      scope.dataset.motionProfile = "reduced";
      clearActiveTopics(scope);
      resetScrollGuide(scope);
      setSceneEntries(scope, 1);
      setScrollGuideVisibility(scope, false);
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
            setSceneEntries(scope, canPin ? 0 : 1);

            const hero = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: HOME_SCROLL_CONDUCTOR_CONFIG.hero.end,
                onLeave: () => publishScrollGuide(scope, "01", 0),
                onLeaveBack: () => publishScrollGuide(scope, "hero", 0),
                onUpdate: ({ progress }) => publishScrollGuide(scope, "hero", progress),
                pin: canPin ? '[data-pin="hero"]' : undefined,
                scrub: 0.7,
                start: "top top",
                trigger: '[data-scene="hero"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            hero.to(
              '[data-motion="hero-copy"]',
              { autoAlpha: 0.22, duration: 0.3, y: -24 },
              0.58,
            );

            const scene01HandoffShare = HOME_SCROLL_CONDUCTOR_CONFIG["01"].entryShare;
            if (canPin) {
              ScrollTrigger.create({
                end: "top top",
                id: "scene-01-handoff",
                onLeaveBack: () => {
                  setOrbitalBaseState({ kind: "hero" });
                  publishScrollGuide(scope, "hero", 1);
                  publishSceneEntry(scope, "01", 0);
                },
                onUpdate: ({ progress }) => {
                  setOrbitalBaseState({
                    id: "01",
                    kind: "scene",
                    progress: progress * scene01HandoffShare,
                  });
                  publishScrollGuide(scope, "01", progress * scene01HandoffShare);
                  publishSceneEntry(scope, "01", progress);
                },
                start: "top 118%",
                trigger: '[data-scene="01"]',
              });
            }

            const knowledge = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? HOME_SCROLL_CONDUCTOR_CONFIG["01"].end : "bottom 30%",
                onLeave: () => {
                  setOrbitalBaseState({ id: "02", kind: "scene", progress: 0 });
                  publishScrollGuide(scope, "02", 0);
                },
                onLeaveBack: () => {
                  setOrbitalBaseState({ kind: "hero" });
                  publishScrollGuide(scope, "hero", 1);
                },
                onUpdate: ({ progress }) => {
                  const sceneProgress = composeSceneProgress("01", progress);
                  publishScrollGuide(scope, "01", sceneProgress);
                  publishSceneEntry(scope, "01", 1);
                  if (!canPin) return;
                  setOrbitalBaseState({
                    id: "01",
                    kind: "scene",
                    progress: sceneProgress,
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
            if (knowledgeFragments.length > 0) {
              knowledge.to(
                knowledgeFragments,
                { autoAlpha: 0.72, duration: 0.38, stagger: 0.06, x: 0, y: 0 },
                0.08,
              );
            }
            const knowledgeExitTargets = [
              knowledgeSignalIndex,
              ...knowledgeFragments,
              ...knowledgeTitleLines,
              knowledgeBody,
            ].filter(Boolean);
            if (knowledgeExitTargets.length > 0) {
              knowledge.to(
                knowledgeExitTargets,
                { autoAlpha: 0.16, duration: 0.18, stagger: 0.008, y: -14 },
                pinProgressForSceneProgress(
                  "01",
                  HOME_SCROLL_CONDUCTOR_CONFIG["01"].exitStart,
                ),
              );
            }

            if (canPin) {
              const scene02EntryShare = HOME_SCROLL_CONDUCTOR_CONFIG["02"].entryShare;
              ScrollTrigger.create({
                end: "top top",
                id: "scene-02-entry",
                onLeaveBack: () => {
                  setOrbitalBaseState({ id: "01", kind: "scene", progress: 1 });
                  publishScrollGuide(scope, "01", 1);
                  publishSceneEntry(scope, "02", 0);
                },
                onUpdate: ({ progress }) => {
                  const sceneProgress = progress * scene02EntryShare;
                  setOrbitalBaseState({ id: "02", kind: "scene", progress: sceneProgress });
                  publishScrollGuide(scope, "02", sceneProgress);
                  publishSceneEntry(scope, "02", progress);
                },
                start: "top bottom",
                trigger: '[data-scene="02"]',
              });
            }

            const macros = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? HOME_SCROLL_CONDUCTOR_CONFIG["02"].end : "bottom 28%",
                onLeave: () => {
                  setOrbitalBaseState({ id: "03", kind: "scene", progress: 0 });
                  publishScrollGuide(scope, "03", 0);
                },
                onLeaveBack: () => {
                  setOrbitalBaseState({ id: "01", kind: "scene", progress: 1 });
                  publishScrollGuide(scope, "01", 1);
                },
                onUpdate: ({ progress }) => {
                  const sceneProgress = composeSceneProgress("02", progress);
                  publishScrollGuide(scope, "02", sceneProgress);
                  publishSceneEntry(scope, "02", 1);
                  if (!canPin) return;
                  setOrbitalBaseState({ id: "02", kind: "scene", progress: sceneProgress });
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
            if (proofStops.length > 0) {
              macros.to(
                proofStops,
                { autoAlpha: 1, duration: 0.42, scale: 1, stagger: 0.1, y: 0 },
                0.08,
              );
            }
            const proofExitTargets = [
              proofIndex,
              ...proofTitleLines,
              proofBody,
              ...proofStops,
            ].filter(Boolean);
            if (proofExitTargets.length > 0) {
              macros.to(
                proofExitTargets,
                { autoAlpha: 0.14, duration: 0.16, stagger: 0.006, y: -12 },
                pinProgressForSceneProgress(
                  "02",
                  HOME_SCROLL_CONDUCTOR_CONFIG["02"].exitStart,
                ),
              );
            }

            if (canPin) {
              const scene03EntryShare = HOME_SCROLL_CONDUCTOR_CONFIG["03"].entryShare;
              ScrollTrigger.create({
                end: "top top",
                id: "scene-03-entry",
                onLeaveBack: () => {
                  setOrbitalBaseState({ id: "02", kind: "scene", progress: 1 });
                  publishScrollGuide(scope, "02", 1);
                  publishSceneEntry(scope, "03", 0);
                },
                onUpdate: ({ progress }) => {
                  const sceneProgress = progress * scene03EntryShare;
                  setOrbitalBaseState({ id: "03", kind: "scene", progress: sceneProgress });
                  publishScrollGuide(scope, "03", sceneProgress);
                  publishSceneEntry(scope, "03", progress);
                },
                start: "top bottom",
                trigger: '[data-scene="03"]',
              });
            }

            const atlasTopics = Array.from(
              scope.querySelectorAll<HTMLElement>('[data-motion="atlas-topic"]'),
            );
            const activateAtlasTopic = (progress: number) => {
              const activeIndex = Math.min(
                Math.max(0, atlasTopics.length - 1),
                Math.floor(clampScrollProgress(progress) * atlasTopics.length),
              );
              atlasTopics.forEach((topic, index) => {
                if (index === activeIndex) topic.dataset.active = "true";
                else delete topic.dataset.active;
              });
            };
            const atlas = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                end: canPin ? HOME_SCROLL_CONDUCTOR_CONFIG["03"].end : "bottom 24%",
                onLeave: () => {
                  setOrbitalBaseState({ id: "03", kind: "scene", progress: 1 });
                  publishScrollGuide(scope, "03", 1);
                  setScrollGuideVisibility(scope, false);
                },
                onLeaveBack: () => {
                  setOrbitalBaseState({ id: "02", kind: "scene", progress: 1 });
                  publishScrollGuide(scope, "02", 1);
                },
                onUpdate: ({ progress }) => {
                  const sceneProgress = composeSceneProgress("03", progress);
                  publishScrollGuide(scope, "03", sceneProgress);
                  publishSceneEntry(scope, "03", 1);
                  if (!canPin) return;
                  setOrbitalBaseState({ id: "03", kind: "scene", progress: sceneProgress });
                  activateAtlasTopic(progress);
                },
                pin: canPin ? '[data-pin="03"]' : undefined,
                scrub: 0.6,
                start: canPin ? "top top" : "top 78%",
                trigger: '[data-scene="03"]',
                ...(canPin ? { anticipatePin: 1 } : {}),
              },
            });
            if (atlasTopics.length > 0) {
              atlas.to(
                atlasTopics,
                { autoAlpha: 1, duration: 0.38, stagger: 0.07, x: 0 },
                0.08,
              );
            }
            const atlasExitTargets = [
              scope.querySelector('[data-atlas-index=""]'),
              scope.querySelector('[data-motion="atlas-copy"]'),
              ...atlasTopics,
              scope.querySelector(`[data-scene="03"] .${styles.atlasAxis}`),
            ].filter(Boolean);
            if (atlasExitTargets.length > 0) {
              atlas.to(
                atlasExitTargets,
                { autoAlpha: 0.14, duration: 0.14, stagger: 0.006, y: -10 },
                pinProgressForSceneProgress(
                  "03",
                  HOME_SCROLL_CONDUCTOR_CONFIG["03"].exitStart,
                ),
              );
            }

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
