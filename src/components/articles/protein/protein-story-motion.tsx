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

function readPublicationShellOffset() {
  const fallback = 4.9 * 16;
  const rootStyles = window.getComputedStyle(document.documentElement);
  const token = rootStyles
    .getPropertyValue("--publication-shell-height")
    .trim();
  const numericValue = Number.parseFloat(token);

  if (!Number.isFinite(numericValue)) return fallback;
  if (token.endsWith("rem")) {
    const rootFontSize = Number.parseFloat(rootStyles.fontSize);
    return numericValue * (Number.isFinite(rootFontSize) ? rootFontSize : 16);
  }

  return numericValue;
}

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
        const cover = scope.querySelector<HTMLElement>('[data-protein-scene="cover"]');
        const roles = scope.querySelector<HTMLElement>('[data-protein-scene="roles"]');
        const digestion = scope.querySelector<HTMLElement>('[data-protein-scene="digestion"]');
        if (!cover || !roles || !digestion) return;

        const digestionStage = digestion.querySelector<HTMLElement>(
          '[data-protein-pin="digestion"]',
        );
        const coverMaskPanels = cover.querySelectorAll<HTMLElement>(
          "[data-protein-cover-mask-panel]",
        );
        const coverStrands = cover.querySelectorAll<HTMLElement>(
          "[data-protein-cover-strand]",
        );
        const coverTitle = cover.querySelector<HTMLElement>(
          "[data-protein-cover-title]",
        );
        const roleLines = roles.querySelectorAll<HTMLElement>(
          "[data-protein-role-line]",
        );
        const digestionImage = digestionStage?.querySelector<HTMLElement>(
          '[data-protein-image-layer="digestion"]',
        );
        const digestionFragments = digestionStage?.querySelectorAll<HTMLElement>(
          "[data-protein-digestion-fragment]",
        );
        const digestionFocus = digestionStage?.querySelector<HTMLElement>(
          "[data-protein-digestion-focus]",
        );

        if (
          !coverTitle
          || !digestionStage
          || !digestionImage
          || !digestionFragments
          || !digestionFocus
          || coverMaskPanels.length !== 5
          || coverStrands.length !== 5
          || roleLines.length !== 5
          || digestionFragments.length !== 3
        ) return;

        const coverTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            invalidateOnRefresh: true,
            once: true,
            start: () => `top top+=${readPublicationShellOffset()}`,
            trigger: cover,
          },
        });
        coverTimeline
          .set(coverMaskPanels, { display: "block" }, 0)
          .fromTo(
            coverMaskPanels,
            { scaleX: 1, transformOrigin: "right center" },
            { duration: 0.72, scaleX: 0, stagger: 0.055 },
            0,
          )
          .fromTo(
            coverTitle,
            { yPercent: 12 },
            { duration: 0.78, yPercent: 0 },
            0.08,
          );

        const handoffTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "top 48%",
            endTrigger: roles,
            invalidateOnRefresh: true,
            scrub: 0.45,
            start: "bottom 96%",
            trigger: cover,
          },
        });
        handoffTimeline
          .fromTo(
            coverStrands,
            {
              scaleX: 1,
              transformOrigin: "right center",
              xPercent: 0,
            },
            {
              duration: 0.22,
              scaleX: 0.12,
              stagger: 0.025,
              xPercent: 28,
            },
            0,
          )
          .fromTo(
            roleLines,
            { scaleX: 0, transformOrigin: "left center" },
            { duration: 0.32, scaleX: 1, stagger: 0.045 },
            0.68,
          );

        const digestionTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: "+=78%",
            invalidateOnRefresh: true,
            pin: digestionStage,
            pinSpacing: true,
            scrub: 0.55,
            start: () => `top top+=${readPublicationShellOffset()}`,
            trigger: digestionStage,
          },
        });
        digestionTimeline
          .set(digestionFragments, { display: "block" }, 0)
          .fromTo(
            digestionImage,
            { scale: 1.025, xPercent: -1.5 },
            { duration: 1, scale: 1, xPercent: 0 },
            0,
          )
          .fromTo(
            digestionFragments,
            {
              scaleX: 1,
              transformOrigin: (index: number) => (
                index % 2 === 0 ? "left center" : "right center"
              ),
            },
            { duration: 0.58, scaleX: 0, stagger: 0.12 },
            0.08,
          )
          .fromTo(
            digestionFocus,
            { xPercent: -105 },
            { duration: 0.84, xPercent: 235 },
            0.08,
          );
      }, scope);
    }

    const armApproachObserver = (observerGeneration: number) => {
      const coverScene = scope.querySelector<HTMLElement>(
        '[data-protein-scene="cover"]',
      );
      if (!coverScene) return;

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
        observer.observe(coverScene);
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
    };
  }, [loadRuntime]);

  return (
    <div className={styles.motionRoot} data-protein-motion="pending" ref={rootRef}>
      {children}
    </div>
  );
}
