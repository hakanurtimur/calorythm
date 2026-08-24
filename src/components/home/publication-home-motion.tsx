"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./publication-home.module.css";

export type PublicationHomeMotionRuntime = {
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

async function loadPublicationMotionRuntime(): Promise<PublicationHomeMotionRuntime> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  return { gsap, ScrollTrigger };
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
      if (topicScene) delete topicScene.dataset.activeTopic;
      if (topicCursor) topicCursor.dataset.active = "false";
    };

    const clearMotion = () => {
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
      const { gsap, ScrollTrigger } = await loadRuntime();
      if (!active || version !== configurationVersion || readProfile() !== "full") return;

      gsap.registerPlugin(ScrollTrigger);
      motionContext = gsap.context(() => {
        const hero = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="hero"]',
            start: "bottom bottom",
            end: "+=48%",
            scrub: 0.45,
            onUpdate: ({ progress }) => {
              publishSceneProgress('[data-home-scene="hero"]', progress);
              setBandLoopState(progress >= 0.999 ? "paused" : "running");
            },
          },
        });
        hero
          .to("[data-rhythm-band]", { duration: 0.78, stagger: 0.035, xPercent: 122 }, 0)
          .to("[data-copy-zone]", { autoAlpha: 0, duration: 0.36, y: -24 }, 0)
          .to(
            '[data-composite-layer="stone"], [data-composite-layer="foreground-occluder"]',
            { duration: 0.5, scale: 0.985, transformOrigin: "50% 70%", yPercent: 1.2 },
            0,
          );

        const noise = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="noise"]',
            start: "top top",
            end: "+=78%",
            pin: '[data-home-scene="noise"]',
            scrub: 0.55,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="noise"]', progress),
          },
        });
        noise
          .fromTo(
            "[data-noise-shutter]",
            { scaleX: 0, transformOrigin: "left center" },
            { duration: 0.62, scaleX: 1 },
          )
          .fromTo(
            "[data-noise-fragment]",
            { xPercent: (index: number) => index % 2 === 0 ? -18 : 21 },
            { duration: 0.7, stagger: 0.08, xPercent: 0 },
            0.14,
          );

        const method = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="method"]',
            start: "top top",
            end: "+=82%",
            pin: '[data-home-scene="method"]',
            scrub: 0.6,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="method"]', progress),
          },
        });
        method.fromTo(
          "[data-evidence-slice]",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.82, stagger: 0.1 },
        );

        const flagship = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-home-scene="flagship"]',
            start: "top 78%",
            end: "bottom 28%",
            scrub: 0.55,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="flagship"]', progress),
          },
        });
        flagship.to("[data-fiber-path]", {
          duration: 1,
          rotation: (index: number) => (index - 1.5) * 0.7,
          transformOrigin: "50% 50%",
          xPercent: (index: number) => (index - 1.5) * 3.2,
          y: (index: number) => (index - 1.5) * 24,
        });

        const journal = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: '[data-home-scene="journal"]',
            start: "top 82%",
            end: "bottom 35%",
            scrub: 0.5,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="journal"]', progress),
          },
        });
        journal.fromTo(
          "[data-journal-baseline]",
          { scaleX: 0.08, transformOrigin: "left center" },
          { duration: 0.7, scaleX: 1, stagger: 0.15 },
        );

        const contribution = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: '[data-home-scene="contribution"]',
            start: "top 80%",
            end: "bottom 42%",
            scrub: 0.55,
            onUpdate: ({ progress }) => publishSceneProgress('[data-home-scene="contribution"]', progress),
          },
        });
        contribution
          .fromTo(
            "[data-converging-band]",
            { xPercent: (index: number) => index % 2 === 0 ? -42 : 42 },
            { duration: 0.72, stagger: 0.05, xPercent: 0 },
          )
          .fromTo(
            '[data-home-scene="contribution"] img',
            { rotation: -8, scale: 0.86 },
            { duration: 0.52, rotation: 0, scale: 1 },
            0.3,
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
