"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { contributionLinePaths } from "./publication-home-contribution-geometry";
import {
  buildJournalLinePath,
  mapJournalRowCenterToViewBox,
} from "./publication-home-journal-geometry";
import { buildRhythmRailTipLattice } from "@/lib/rhythm-rail-geometry";
import styles from "./publication-home.module.css";

export { buildJournalLinePath, mapJournalRowCenterToViewBox };

export type PublicationHomeMotionRuntime = {
  DrawSVGPlugin: (typeof import("gsap/DrawSVGPlugin"))["DrawSVGPlugin"];
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  gsap: (typeof import("gsap"))["gsap"];
};

type PublicationHomeMotionProps = {
  children: ReactNode;
  loadRuntime?: () => Promise<PublicationHomeMotionRuntime>;
};

type MotionProfile = "full" | "reduced" | "static";

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

const RHYTHM_BAND_IDS = ["claim", "source", "context", "editorial"] as const;
const JOURNAL_LINE_BASE_X = [78, 122, 166, 210] as const;
const JOURNAL_LINE_TIP_X = buildRhythmRailTipLattice({
  anchor: 272,
  baseXs: JOURNAL_LINE_BASE_X,
});
const PROTEIN_ROLE_IDS = ["structure", "catalysis", "transport", "signal", "defense"] as const;
const RHYTHM_BAND_STEP = 0.055;
const NOISE_BAND_STAGGER = 0.13;
const NOISE_FEED_DURATION = 0.38;
const NOISE_FORM_DURATION = 0.72;
const NOISE_RELEASE_DURATION = 0.28;
const FOLIO_BEAT_TRANSITIONS = [
  { at: 1.28, from: "opening", to: "layers" },
  { at: 2.62, from: "layers", to: "story" },
] as const;
const FOLIO_PAGE_ENTRIES = [
  {
    at: 0.42,
    from: { rotation: 12, scale: 0.25, xPercent: 180, yPercent: 100 },
    id: "physiology",
    toRotation: -10,
  },
  {
    at: 1.08,
    from: { rotation: 11, scale: 0.3, xPercent: 125, yPercent: 125 },
    id: "structure",
    toRotation: -5,
  },
  {
    at: 1.74,
    from: { rotation: 10, scale: 0.34, xPercent: 78, yPercent: 115 },
    id: "metabolism",
    toRotation: 1.5,
  },
  {
    at: 2.4,
    from: { rotation: 9, scale: 0.38, xPercent: 35, yPercent: 100 },
    id: "research",
    toRotation: 8,
  },
] as const;

async function loadPublicationMotionRuntime(): Promise<PublicationHomeMotionRuntime> {
  const [{ DrawSVGPlugin }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap/DrawSVGPlugin"),
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  return { DrawSVGPlugin, gsap, ScrollTrigger };
}

export function resolvePublicationMotionProfile({
  height,
  reducedMotion,
  saveData,
  width,
}: {
  height: number;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
}): MotionProfile {
  if (reducedMotion || saveData) return "reduced";
  if (width < 1024 || height < 700) return "static";

  return "full";
}

const sceneState = (progress: number) =>
  progress <= 0.001 ? "start" : progress >= 0.999 ? "end" : "active";

export function PublicationHomeMotion({
  children,
  loadRuntime = loadPublicationMotionRuntime,
}: PublicationHomeMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const scope: HTMLDivElement = currentRoot;

    let active = true;
    let configurationVersion = 0;
    let motionContext: ReturnType<PublicationHomeMotionRuntime["gsap"]["context"]> | undefined;
    let removeBoundaryWatch: (() => void) | undefined;
    let removeJournalListeners: (() => void) | undefined;
    let removeTopicListeners: (() => void) | undefined;
    const motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : undefined;
    const connection = (navigator as NavigatorWithConnection).connection;
    const heroBands = () => scope.querySelectorAll<SVGPathElement>("[data-rhythm-band]");

    const readProfile = (): MotionProfile => resolvePublicationMotionProfile({
      height: window.innerHeight,
      reducedMotion: motionQuery?.matches ?? true,
      saveData: connection?.saveData ?? false,
      width: window.innerWidth,
    });

    const setBandLoopState = (state: "paused" | "running" | "") => {
      heroBands().forEach((band) => {
        band.style.animationPlayState = state;
      });
    };

    const restoreStaticSceneState = () => {
      scope.querySelectorAll<HTMLElement>("[data-home-scene]").forEach((scene) => {
        scene.dataset.motionState = "start";
        scene.dataset.motionProgress = "0.000";
      });
      const topicScene = scope.querySelector<HTMLElement>('[data-home-scene="topics"]');
      const topicCursor = topicScene?.querySelector<HTMLElement>("[data-topic-cursor]");
      const journalScene = scope.querySelector<HTMLElement>('[data-home-scene="journal"]');
      if (topicScene) delete topicScene.dataset.activeTopic;
      if (topicCursor) topicCursor.dataset.active = "false";
      if (journalScene) delete journalScene.dataset.activeJournalStory;
      journalScene?.querySelectorAll<HTMLElement>("[data-journal-story]").forEach((story) => {
        delete story.dataset.journalStoryActive;
      });
      journalScene?.querySelectorAll<SVGPathElement>("[data-journal-line]").forEach((path, index) => {
        const baseX = JOURNAL_LINE_BASE_X[index] ?? JOURNAL_LINE_BASE_X[0];
        path.setAttribute("d", buildJournalLinePath({ baseX, targetY: 500, tipX: baseX }));
      });
    };

    const clearMotion = () => {
      removeJournalListeners?.();
      removeJournalListeners = undefined;
      removeTopicListeners?.();
      removeTopicListeners = undefined;
      motionContext?.revert();
      motionContext = undefined;
    };

    const clearBoundaryWatch = () => {
      removeBoundaryWatch?.();
      removeBoundaryWatch = undefined;
    };

    const publishSceneProgress = (selector: string, progress: number) => {
      const scene = scope.querySelector<HTMLElement>(selector);
      if (!scene) return;
      scene.dataset.motionState = sceneState(progress);
      scene.dataset.motionProgress = progress.toFixed(3);
    };

    async function installMotion(version: number) {
      const { DrawSVGPlugin, gsap, ScrollTrigger } = await loadRuntime();
      if (!active || version !== configurationVersion || readProfile() !== "full") return;

      gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
      motionContext = gsap.context(() => {
        const handoff = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="hero"]',
            start: "bottom bottom",
            endTrigger: '[data-home-scene="noise"]',
            end: "top top",
            invalidateOnRefresh: true,
            scrub: 0.65,
            onUpdate: ({ progress }) => {
              publishSceneProgress('[data-home-scene="hero"]', progress);
              setBandLoopState(progress >= 0.999 ? "paused" : "running");
            },
          },
        });
        handoff
          .to("[data-copy-zone]", { autoAlpha: 0, duration: 0.3, y: -24 }, 0)
          .to(
            '[data-composite-layer="stone"], [data-composite-layer="foreground-occluder"]',
            { duration: 0.38, scale: 0.985, transformOrigin: "50% 70%", yPercent: 1.2 },
            0,
          );

        RHYTHM_BAND_IDS.forEach((id, index) => {
          const exitAt = index * RHYTHM_BAND_STEP;

          handoff.to(
            `[data-rhythm-band="${id}"]`,
            { duration: 0.36, xPercent: 122 },
            exitAt,
          );
        });

        const noise = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="noise"]',
            start: "top top",
            end: "+=140%",
            pin: '[data-home-scene="noise"]',
            scrub: 0.9,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="noise"]', progress),
          },
        });

        RHYTHM_BAND_IDS.forEach((id, index) => {
          const feedAt = index * NOISE_BAND_STAGGER;
          const formAt = feedAt + NOISE_FEED_DURATION;

          noise.fromTo(
            `[data-noise-apostrophe-feeder="${id}"]`,
            { autoAlpha: 1, drawSVG: "0% 0%" },
            {
              drawSVG: "0% 100%",
              duration: NOISE_FEED_DURATION,
              immediateRender: true,
            },
            feedAt,
          );
          noise.fromTo(
            `[data-noise-apostrophe-band="${id}"]`,
            { autoAlpha: 1, drawSVG: "0% 0%" },
            {
              drawSVG: "0% 100%",
              duration: NOISE_FORM_DURATION,
              immediateRender: true,
            },
            formAt,
          );
          noise.to(
            `[data-noise-apostrophe-feeder="${id}"]`,
            { drawSVG: "100% 100%", duration: NOISE_RELEASE_DURATION },
            formAt,
          );
        });

        const method = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="method"]',
            start: "top top",
            end: "+=340%",
            pin: '[data-home-scene="method"]',
            scrub: 0.86,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="method"]', progress),
          },
        });
        method.to("[data-folio-progress-fill]", { duration: 3.58, scaleX: 1 }, 0);

        FOLIO_PAGE_ENTRIES.forEach(({ at, from, id, toRotation }) => {
          method.fromTo(
            `[data-folio-page="${id}"]`,
            { ...from, opacity: 0 },
            {
              duration: 0.74,
              ease: "power3.out",
              immediateRender: true,
              opacity: 1,
              rotation: toRotation,
              scale: 1,
              xPercent: 0,
              yPercent: 0,
            },
            at,
          );
          method.fromTo(
            `[data-folio-page-label="${id}"]`,
            { opacity: 0, y: 10 },
            {
              duration: 0.3,
              ease: "power2.out",
              immediateRender: true,
              opacity: 1,
              y: 0,
            },
            at + 0.44,
          );
        });

        FOLIO_BEAT_TRANSITIONS.forEach(({ at, from, to }) => {
          method.to(
            `[data-folio-beat="${from}"]`,
            { duration: 0.22, opacity: 0, y: -18 },
            at - 0.12,
          );
          method.fromTo(
            `[data-folio-beat="${to}"]`,
            { opacity: 0, y: 22 },
            { duration: 0.32, immediateRender: true, opacity: 1, y: 0 },
            at,
          );
        });

        const flagship = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="flagship"]',
            start: "top top",
            end: "+=240%",
            pin: '[data-protein-flagship-stage]',
            scrub: 0.82,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="flagship"]', progress),
          },
        });
        flagship
          .fromTo(
            "[data-protein-flagship-image]",
            {
              opacity: 0,
              scale: 1.48,
              transformOrigin: "73% 45%",
              xPercent: 5,
              yPercent: 4,
            },
            {
              duration: 1.38,
              ease: "power2.out",
              immediateRender: true,
              opacity: 1,
              scale: 1,
              transformOrigin: "73% 45%",
              xPercent: 0,
              yPercent: 0,
            },
            0,
          )
          .fromTo(
            "[data-protein-flagship-title]",
            { opacity: 0, y: 34 },
            { duration: 0.42, ease: "power3.out", immediateRender: true, opacity: 1, y: 0 },
            0.48,
          );

        PROTEIN_ROLE_IDS.forEach((role, index) => {
          flagship.fromTo(
            `[data-protein-role="${role}"]`,
            { opacity: 0, y: 14 },
            {
              duration: 0.3,
              ease: "power2.out",
              immediateRender: true,
              opacity: 1,
              y: 0,
            },
            0.82 + index * 0.24,
          );
        });

        flagship
          .fromTo(
            "[data-protein-flagship-deck]",
            { opacity: 0, y: 18 },
            { duration: 0.34, ease: "power2.out", immediateRender: true, opacity: 1, y: 0 },
            2.12,
          )
          .fromTo(
            `.${styles.flagshipMetadata}`,
            { opacity: 0, y: 12 },
            { duration: 0.28, ease: "power2.out", immediateRender: true, opacity: 1, y: 0 },
            2.22,
          )
          .fromTo(
            "[data-protein-flagship-cta]",
            { opacity: 0, y: 18 },
            { duration: 0.34, ease: "power2.out", immediateRender: true, opacity: 1, y: 0 },
            2.26,
          );

        const journal = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: '[data-home-scene="journal"]',
            start: "top 86%",
            end: "top -20%",
            scrub: 0.62,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="journal"]', progress),
          },
        });
        journal
          .fromTo(
            "[data-journal-line]",
            { drawSVG: "0% 0%" },
            {
              drawSVG: "0% 100%",
              duration: 0.78,
              immediateRender: true,
              stagger: 0.075,
            },
          )
          .fromTo(
            "[data-journal-story-entrance]",
            { opacity: 0, y: 34 },
            {
              duration: 0.52,
              immediateRender: true,
              opacity: 1,
              stagger: 0.1,
              y: 0,
            },
            0.18,
          )
          .fromTo(
            "[data-journal-index-cta]",
            { opacity: 0, x: -24 },
            { duration: 0.34, immediateRender: true, opacity: 1, x: 0 },
            0.6,
          );

        const journalScene = scope.querySelector<HTMLElement>('[data-home-scene="journal"]');
        const journalField = journalScene?.querySelector<SVGElement>("[data-journal-line-field]");
        const journalLines = Array.from(
          journalScene?.querySelectorAll<SVGPathElement>("[data-journal-line]") ?? [],
        );
        const journalStories = Array.from(
          journalScene?.querySelectorAll<HTMLElement>("[data-journal-story]") ?? [],
        );
        if (journalScene && journalField && journalLines.length === 4 && journalStories.length > 0) {
          let focusedStory: HTMLElement | undefined;
          let hoveredStory: HTMLElement | undefined;
          const removers: Array<() => void> = [];
          const setActiveStory = (story: HTMLElement | undefined) => {
            journalStories.forEach((candidate) => {
              candidate.dataset.journalStoryActive = candidate === story ? "true" : "false";
            });

            if (!story) {
              delete journalScene.dataset.activeJournalStory;
              gsap.to(journalLines, {
                attr: {
                  d: (index: number) => {
                    const baseX = JOURNAL_LINE_BASE_X[index] ?? JOURNAL_LINE_BASE_X[0];
                    return buildJournalLinePath({ baseX, targetY: 500, tipX: baseX });
                  },
                },
                duration: 0.42,
                ease: "power2.inOut",
                overwrite: "auto",
              });
              return;
            }

            const fieldBounds = journalField.getBoundingClientRect();
            const storyBounds = story.getBoundingClientRect();
            const targetY = mapJournalRowCenterToViewBox({
              fieldHeight: fieldBounds.height,
              fieldTop: fieldBounds.top,
              rowHeight: storyBounds.height,
              rowTop: storyBounds.top,
            });
            journalScene.dataset.activeJournalStory = story.dataset.journalStory ?? "";
            gsap.to(journalLines, {
              attr: {
                d: (index: number) => buildJournalLinePath({
                  baseX: JOURNAL_LINE_BASE_X[index] ?? JOURNAL_LINE_BASE_X[0],
                  targetY,
                  tipX: JOURNAL_LINE_TIP_X[index] ?? JOURNAL_LINE_TIP_X[0] ?? 272,
                }),
              },
              duration: 0.5,
              ease: "power3.out",
              overwrite: "auto",
            });
          };

          journalStories.forEach((story) => {
            const link = story.querySelector<HTMLElement>("[data-journal-story-link]");
            const handleEnter = () => {
              hoveredStory = story;
              setActiveStory(story);
            };
            const handleLeave = () => {
              if (hoveredStory === story) hoveredStory = undefined;
              setActiveStory(focusedStory);
            };
            const handleFocus = () => {
              focusedStory = story;
              setActiveStory(story);
            };
            const handleBlur = () => {
              if (focusedStory === story) focusedStory = undefined;
              setActiveStory(hoveredStory);
            };

            story.addEventListener("mouseenter", handleEnter);
            story.addEventListener("mouseleave", handleLeave);
            link?.addEventListener("focus", handleFocus);
            link?.addEventListener("blur", handleBlur);
            removers.push(() => {
              story.removeEventListener("mouseenter", handleEnter);
              story.removeEventListener("mouseleave", handleLeave);
              link?.removeEventListener("focus", handleFocus);
              link?.removeEventListener("blur", handleBlur);
            });
          });
          removeJournalListeners = () => {
            removers.forEach((remove) => remove());
            gsap.killTweensOf(journalLines);
            focusedStory = undefined;
            hoveredStory = undefined;
            delete journalScene.dataset.activeJournalStory;
            journalStories.forEach((story) => delete story.dataset.journalStoryActive);
            journalLines.forEach((path, index) => {
              const baseX = JOURNAL_LINE_BASE_X[index] ?? JOURNAL_LINE_BASE_X[0];
              path.setAttribute("d", buildJournalLinePath({ baseX, targetY: 500, tipX: baseX }));
            });
          };
        }

        const contribution = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="contribution"]',
            start: "top 84%",
            end: "top 12%",
            scrub: 0.75,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="contribution"]', progress),
          },
        });
        contribution
          .fromTo(
            "[data-contribution-figure]",
            {
              clipPath: "inset(0% 0% 0% 100%)",
              scale: 1.045,
              x: 64,
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.68,
              immediateRender: true,
              scale: 1,
              transformOrigin: "72% 58%",
              x: 0,
            },
          )
          .fromTo(
            "[data-contribution-line]",
            {
              attr: {
                d: (index: number) => contributionLinePaths[index]?.from ?? contributionLinePaths[0].from,
              },
              drawSVG: "0% 0%",
            },
            {
              attr: {
                d: (index: number) => contributionLinePaths[index]?.to ?? contributionLinePaths[0].to,
              },
              drawSVG: "0% 100%",
              duration: 0.78,
              immediateRender: true,
              stagger: 0.045,
            },
            0.08,
          )
          .fromTo(
            "[data-contribution-apostrophe]",
            {
              autoAlpha: 0,
              rotate: 9,
              scale: 0.78,
              y: 26,
            },
            {
              autoAlpha: 1,
              duration: 0.46,
              ease: "power2.out",
              immediateRender: true,
              rotate: 3,
              scale: 1,
              transformOrigin: "50% 18%",
              y: 0,
            },
            0.3,
          )
          .fromTo(
            "[data-contribution-copy]",
            { clipPath: "inset(0% 0% 100% 0%)", y: 30 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.6,
              immediateRender: true,
              y: 0,
            },
            0.22,
          )
          .fromTo(
            "[data-contribution-cta-rule]",
            { scaleX: 0 },
            {
              duration: 0.4,
              immediateRender: true,
              scaleX: 1,
              transformOrigin: "left center",
            },
            0.56,
          );

        const topicScene = scope.querySelector<HTMLElement>('[data-home-scene="topics"]');
        const topicCursor = topicScene?.querySelector<HTMLElement>("[data-topic-cursor]");
        const topicRows = Array.from(topicScene?.querySelectorAll<HTMLElement>("[data-topic-row]") ?? []);
        if (!topicScene || !topicCursor || topicRows.length === 0) return;

        const moveCursor = gsap.quickTo(topicCursor, "y", { duration: 0.32, ease: "power3.out" });
        const removers: Array<() => void> = [];
        topicRows.forEach((row) => {
          const activate = () => {
            const sceneBounds = topicScene.getBoundingClientRect();
            const rowBounds = row.getBoundingClientRect();
            topicCursor.dataset.active = "true";
            topicScene.dataset.activeTopic = row.dataset.topicRow;
            moveCursor(rowBounds.top - sceneBounds.top + rowBounds.height / 2);
          };
          const deactivate = () => {
            topicCursor.dataset.active = "false";
          };
          row.addEventListener("focus", activate);
          row.addEventListener("blur", deactivate);
          row.addEventListener("mouseenter", activate);
          row.addEventListener("mouseleave", deactivate);
          removers.push(() => {
            row.removeEventListener("focus", activate);
            row.removeEventListener("blur", deactivate);
            row.removeEventListener("mouseenter", activate);
            row.removeEventListener("mouseleave", deactivate);
          });
        });
        removeTopicListeners = () => {
          removers.forEach((remove) => remove());
          gsap.killTweensOf(topicCursor);
        };
      }, scope);

      scope.dataset.motionProfile = "full";
    }

    const armBoundaryWatch = (version: number) => {
      const boundary = scope.querySelector<HTMLElement>('[data-home-scene="noise"]');
      if (!boundary) return;
      const observedBoundary = boundary;

      let armed = true;
      let fallbackFrame = 0;
      let observer: IntersectionObserver | undefined;

      const detach = () => {
        observer?.disconnect();
        if (fallbackFrame !== 0) {
          window.cancelAnimationFrame(fallbackFrame);
          fallbackFrame = 0;
        }
        window.removeEventListener("scroll", queueBoundaryCheck);
      };
      const begin = () => {
        if (!armed || !active || version !== configurationVersion || readProfile() !== "full") return;
        armed = false;
        detach();
        removeBoundaryWatch = undefined;
        void installMotion(version);
      };
      function checkBoundaryPosition() {
        if (observedBoundary.getBoundingClientRect().top <= window.innerHeight * 2.5) begin();
      }
      function queueBoundaryCheck() {
        if (fallbackFrame !== 0) return;
        fallbackFrame = window.requestAnimationFrame(() => {
          fallbackFrame = 0;
          checkBoundaryPosition();
        });
      }

      if (typeof window.IntersectionObserver === "function") {
        observer = new window.IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => (
              entry.isIntersecting || entry.boundingClientRect.bottom <= 0
            ))) begin();
          },
          { rootMargin: "160% 0px" },
        );
        observer.observe(observedBoundary);
      } else {
        window.addEventListener("scroll", queueBoundaryCheck, { passive: true });
        if (window.scrollY > 0) queueBoundaryCheck();
      }
      removeBoundaryWatch = () => {
        armed = false;
        detach();
      };
    };

    function configure() {
      const version = ++configurationVersion;
      clearBoundaryWatch();
      clearMotion();
      const profile = readProfile();
      scope.dataset.motionProfile = profile;

      if (profile !== "full") {
        setBandLoopState("paused");
        restoreStaticSceneState();
        return;
      }

      setBandLoopState("running");
      armBoundaryWatch(version);
    }

    const handleConstraintChange = () => void configure();
    void configure();
    motionQuery?.addEventListener("change", handleConstraintChange);
    connection?.addEventListener("change", handleConstraintChange);
    window.addEventListener("resize", handleConstraintChange);

    return () => {
      active = false;
      configurationVersion += 1;
      motionQuery?.removeEventListener("change", handleConstraintChange);
      connection?.removeEventListener("change", handleConstraintChange);
      window.removeEventListener("resize", handleConstraintChange);
      clearBoundaryWatch();
      clearMotion();
      setBandLoopState("");
    };
  }, [loadRuntime]);

  return (
    <div className={styles.publicationHome} data-motion-profile="pending" ref={rootRef}>
      {children}
    </div>
  );
}
