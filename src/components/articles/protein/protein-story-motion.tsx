"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./protein-visual-essay.module.css";

export type ProteinStoryMotionRuntime = {
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  gsap: (typeof import("gsap"))["gsap"];
};

type ProteinStoryMotionProps = {
  children: ReactNode;
  loadRuntime?: () => Promise<ProteinStoryMotionRuntime>;
};

export type ProteinMotionProfile = "full" | "reduced" | "static";

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

const registeredGsapInstances = new WeakSet<object>();

async function loadProteinStoryRuntime(): Promise<ProteinStoryMotionRuntime> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  return { gsap, ScrollTrigger };
}

export function resolveProteinMotionProfile({
  height,
  reducedMotion,
  saveData,
  width,
}: {
  height: number;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
}): ProteinMotionProfile {
  if (reducedMotion || saveData) return "reduced";
  if (width < 1024 || height < 700) return "static";

  return "full";
}

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

const progressState = (progress: number) => {
  if (progress <= 0.001) return "start";
  if (progress >= 0.999) return "end";
  return "active";
};

export function ProteinStoryMotion({
  children,
  loadRuntime = loadProteinStoryRuntime,
}: ProteinStoryMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const scope = currentRoot;

    let active = true;
    let generation = 0;
    let motionContext:
      | ReturnType<ProteinStoryMotionRuntime["gsap"]["context"]>
      | undefined;
    let removeApproachObserver: (() => void) | undefined;
    const motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : undefined;
    const desktopQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(min-width: 1024px) and (min-height: 700px)")
      : undefined;
    const connection = (navigator as NavigatorWithConnection).connection;

    const readProfile = () => resolveProteinMotionProfile({
      height: window.innerHeight,
      reducedMotion: motionQuery?.matches ?? false,
      saveData: connection?.saveData ?? false,
      width: window.innerWidth,
    });

    const clearMotion = () => {
      motionContext?.revert();
      motionContext = undefined;
    };

    const clearApproachObserver = () => {
      removeApproachObserver?.();
      removeApproachObserver = undefined;
    };

    const setRoleFromProgress = (scene: HTMLElement, progress: number) => {
      const roleCopies = Array.from(
        scene.querySelectorAll<HTMLElement>("[data-protein-role-copy]"),
      );
      const activeIndex = progress <= 0 || roleCopies.length === 0
        ? -1
        : Math.min(roleCopies.length - 1, Math.floor(progress * roleCopies.length));

      roleCopies.forEach((role, index) => {
        role.dataset.proteinRoleActive = String(index === activeIndex);
      });
    };

    const publishProgress = (scene: HTMLElement, rawProgress: number) => {
      const progress = clampProgress(rawProgress);
      scene.style.setProperty("--protein-scene-progress", progress.toFixed(3));
      scene.dataset.proteinMotionState = progressState(progress);
      if (scene.dataset.proteinScene === "roles") setRoleFromProgress(scene, progress);
    };

    const clearAuthoredState = () => {
      scope.querySelectorAll<HTMLElement>("[data-protein-scene]").forEach((scene) => {
        scene.style.removeProperty("--protein-scene-progress");
        delete scene.dataset.proteinMotionState;
      });
      scope.querySelectorAll<HTMLElement>("[data-protein-role-copy]").forEach((role) => {
        delete role.dataset.proteinRoleActive;
      });
    };

    async function installMotion(installationGeneration: number) {
      const { gsap, ScrollTrigger } = await loadRuntime();
      if (
        !active
        || installationGeneration !== generation
        || readProfile() !== "full"
      ) return;

      const registrationKey = gsap as unknown as object;
      if (!registeredGsapInstances.has(registrationKey)) {
        gsap.registerPlugin(ScrollTrigger);
        registeredGsapInstances.add(registrationKey);
      }

      motionContext = gsap.context(() => {
        const frame = scope.querySelector<HTMLElement>('[data-protein-scene="frame"]');
        const roles = scope.querySelector<HTMLElement>('[data-protein-scene="roles"]');
        const turnover = scope.querySelector<HTMLElement>('[data-protein-scene="turnover"]');
        const digestion = scope.querySelector<HTMLElement>('[data-protein-scene="digestion"]');
        const reference = scope.querySelector<HTMLElement>('[data-protein-scene="reference"]');
        const pattern = scope.querySelector<HTMLElement>('[data-protein-scene="pattern"]');
        const resolution = scope.querySelector<HTMLElement>('[data-protein-scene="resolution"]');
        if (!frame || !roles || !turnover || !digestion || !reference || !pattern || !resolution) {
          return;
        }

        const frameStage = frame.querySelector<HTMLElement>('[data-protein-pin="frame"]');
        const digestionStage = digestion.querySelector<HTMLElement>(
          '[data-protein-pin="digestion"]',
        );
        const patternStage = pattern.querySelector<HTMLElement>(
          '[data-protein-pin="pattern"]',
        );
        if (!frameStage || !digestionStage || !patternStage) return;

        const frameTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "+=92%",
            onUpdate: ({ progress }) => publishProgress(frame, progress),
            pin: frameStage,
            pinSpacing: false,
            scrub: 0.58,
            start: "top top+=88",
            trigger: frameStage,
          },
        });
        frameTimeline
          .fromTo(
            frame.querySelector("[data-protein-frame-word]"),
            { clipPath: "inset(0 21% 0 21%)", scale: 1.12 },
            { clipPath: "inset(0 0% 0 0)", duration: 0.7, scale: 0.72 },
          )
          .fromTo(
            frame.querySelectorAll("[data-protein-frame-role]"),
            { autoAlpha: 0.34, x: -18 },
            { autoAlpha: 1, duration: 0.52, stagger: 0.065, x: 0 },
            0.18,
          );

        const rolesTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "bottom 30%",
            onUpdate: ({ progress }) => publishProgress(roles, progress),
            scrub: 0.5,
            start: "top 78%",
            trigger: roles,
          },
        });
        rolesTimeline
          .fromTo(
            roles.querySelectorAll("[data-protein-score-rule]"),
            { strokeDashoffset: 720 },
            { duration: 0.64, stagger: 0.075, strokeDashoffset: 0 },
          )
          .fromTo(
            roles.querySelectorAll("[data-protein-role-copy]"),
            { autoAlpha: 0.58, x: 16 },
            { autoAlpha: 1, duration: 0.52, stagger: 0.09, x: 0 },
            0.08,
          );

        const turnoverTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "bottom 28%",
            onUpdate: ({ progress }) => publishProgress(turnover, progress),
            scrub: 0.52,
            start: "top 76%",
            trigger: turnover,
          },
        });
        turnoverTimeline
          .fromTo(
            turnover.querySelector("[data-protein-turnover-visual]"),
            { clipPath: "inset(0 20% 0 0)", scale: 1.04 },
            { clipPath: "inset(0 0% 0 0)", duration: 0.7, scale: 1 },
          )
          .fromTo(
            turnover.querySelectorAll("[data-protein-turnover-state]"),
            { autoAlpha: 0.48, y: 18 },
            { autoAlpha: 1, duration: 0.62, stagger: 0.12, y: 0 },
            0.14,
          );

        const digestionTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "+=128%",
            onUpdate: ({ progress }) => publishProgress(digestion, progress),
            pin: digestionStage,
            pinSpacing: false,
            scrub: 0.62,
            start: "top top+=88",
            trigger: digestionStage,
          },
        });
        digestionTimeline
          .fromTo(
            digestion.querySelector('[data-protein-image-layer="digestion"]'),
            {
              clipPath: "inset(0 18% 0 0)",
              scale: 1.035,
              xPercent: -2.5,
            },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.92,
              scale: 1,
              xPercent: 0,
            },
          )
          .fromTo(
            digestion.querySelector("[data-protein-digestion-focus]"),
            { xPercent: 0 },
            { duration: 0.44, xPercent: 112 },
            0.12,
          )
          .to(
            digestion.querySelector("[data-protein-digestion-focus]"),
            { duration: 0.44, xPercent: 178 },
          );

        const referenceTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "bottom 28%",
            onUpdate: ({ progress }) => publishProgress(reference, progress),
            scrub: 0.52,
            start: "top 78%",
            trigger: reference,
          },
        });
        referenceTimeline.fromTo(
          reference.querySelectorAll("[data-protein-reference-rail]"),
          {
            scaleX: 0.94,
            transformOrigin: (index: number) => (
              ["left center", "right center", "center"][index] ?? "center"
            ),
          },
          { duration: 0.72, scaleX: 1, stagger: 0.13 },
        );

        const patternTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "+=106%",
            onUpdate: ({ progress }) => publishProgress(pattern, progress),
            pin: patternStage,
            pinSpacing: false,
            scrub: 0.62,
            start: "top top+=88",
            trigger: patternStage,
          },
        });
        patternTimeline
          .fromTo(
            pattern.querySelector('[data-protein-image-layer="pattern"]'),
            { clipPath: "inset(3% 6% 3% 6%)", scale: 1.025 },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, scale: 1 },
          )
          .fromTo(
            pattern.querySelectorAll("[data-protein-chord-row]"),
            { xPercent: (index: number) => [5, -4, 3][index] ?? 0 },
            { duration: 0.82, stagger: 0.09, xPercent: 0 },
            0.08,
          );

        const resolutionTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "bottom 55%",
            onUpdate: ({ progress }) => publishProgress(resolution, progress),
            scrub: 0.68,
            start: "top 80%",
            trigger: resolution,
          },
        });
        resolutionTimeline.fromTo(
          resolution.querySelectorAll("[data-protein-resolution-mark]"),
          {
            autoAlpha: 0.68,
            scale: 0.84,
            x: (index: number) => (index - 2) * 12,
            y: (index: number) => (index % 2 === 0 ? -10 : 12),
          },
          { autoAlpha: 1, duration: 1, scale: 1, stagger: 0.08, x: 0, y: 0 },
        );
      }, scope);
    }

    const armApproachObserver = (observerGeneration: number) => {
      const frameScene = scope.querySelector<HTMLElement>(
        '[data-protein-scene="frame"]',
      );
      if (!frameScene) return;

      let armed = true;
      let observer: IntersectionObserver | undefined;
      const begin = () => {
        if (
          !armed
          || !active
          || observerGeneration !== generation
          || readProfile() !== "full"
        ) return;
        armed = false;
        observer?.disconnect();
        removeApproachObserver = undefined;
        void installMotion(observerGeneration);
      };

      if (typeof window.IntersectionObserver === "function") {
        observer = new window.IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) begin();
          },
          { rootMargin: "100% 0px" },
        );
        observer.observe(frameScene);
        removeApproachObserver = () => {
          armed = false;
          observer?.disconnect();
        };
        return;
      }

      begin();
    };

    const configure = () => {
      const nextGeneration = ++generation;
      clearApproachObserver();
      clearMotion();
      clearAuthoredState();
      const profile = readProfile();
      scope.dataset.proteinMotion = profile;
      if (profile === "full") armApproachObserver(nextGeneration);
    };

    const handleConstraintChange = () => configure();
    configure();
    motionQuery?.addEventListener("change", handleConstraintChange);
    desktopQuery?.addEventListener("change", handleConstraintChange);
    connection?.addEventListener("change", handleConstraintChange);

    return () => {
      active = false;
      generation += 1;
      motionQuery?.removeEventListener("change", handleConstraintChange);
      desktopQuery?.removeEventListener("change", handleConstraintChange);
      connection?.removeEventListener("change", handleConstraintChange);
      clearApproachObserver();
      clearMotion();
      clearAuthoredState();
    };
  }, [loadRuntime]);

  return (
    <div className={styles.motionRoot} data-protein-motion="pending" ref={rootRef}>
      {children}
    </div>
  );
}
