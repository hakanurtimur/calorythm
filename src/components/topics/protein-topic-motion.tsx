"use client";

import { useEffect, useRef, type ReactNode } from "react";

export type ProteinTopicMotionProfile = "full" | "reduced" | "static";

export type ProteinTopicMotionRuntime = {
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  gsap: (typeof import("gsap"))["gsap"];
};

type ProteinTopicMotionProps = Readonly<{
  children: ReactNode;
  loadRuntime?: () => Promise<ProteinTopicMotionRuntime>;
}>;

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

export function resolveProteinTopicMotionProfile({
  height,
  reducedMotion,
  saveData,
  width,
}: {
  height: number;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
}): ProteinTopicMotionProfile {
  if (reducedMotion || saveData) return "reduced";
  if (width < 1024 || height < 700) return "static";

  return "full";
}

async function loadProteinTopicMotionRuntime(): Promise<ProteinTopicMotionRuntime> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  return { gsap, ScrollTrigger };
}

export function ProteinTopicMotion({
  children,
  loadRuntime = loadProteinTopicMotionRuntime,
}: ProteinTopicMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const scope: HTMLDivElement = currentRoot;

    let active = true;
    let configurationVersion = 0;
    let currentProfile: ProteinTopicMotionProfile | undefined;
    let motionContext: ReturnType<ProteinTopicMotionRuntime["gsap"]["context"]> | undefined;
    let removePointerLight: (() => void) | undefined;
    const motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : undefined;
    const pointerQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(hover: hover) and (pointer: fine)")
      : undefined;
    const connection = (navigator as NavigatorWithConnection).connection;

    const readProfile = () => {
      if (!motionQuery) return "static" as const;

      return resolveProteinTopicMotionProfile({
        height: window.innerHeight,
        reducedMotion: motionQuery.matches,
        saveData: connection?.saveData ?? false,
        width: window.innerWidth,
      });
    };

    const clearMotion = () => {
      removePointerLight?.();
      removePointerLight = undefined;
      motionContext?.revert();
      motionContext = undefined;
    };

    async function installMotion(version: number) {
      const { gsap, ScrollTrigger } = await loadRuntime();
      if (!active || version !== configurationVersion || readProfile() !== "full") return;

      gsap.registerPlugin(ScrollTrigger);
      motionContext = gsap.context(() => {
        const entrance = gsap.timeline({
          defaults: { ease: "power3.out" },
        });
        entrance
          .fromTo(
            "[data-protein-topic-hero-image]",
            { scale: 1.035 },
            { duration: 1.55, scale: 1 },
            0,
          )
          .fromTo(
            "[data-hero-copy-beat]",
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, duration: 0.9, stagger: 0.09, y: 0 },
            0.16,
          );

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: '[data-protein-topic-scene="hero"]',
            start: "top top",
            end: "bottom top",
            scrub: 0.45,
          },
        })
          .to("[data-protein-topic-hero-copy]", { duration: 1, y: -18 }, 0)
          .to("[data-protein-topic-hero-image]", { duration: 1, scale: 1.018 }, 0)
          .to("[data-protein-topic-hero-light]", { autoAlpha: 0.32, duration: 1 }, 0);

        gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: '[data-protein-topic-scene="roles"]',
            start: "top 78%",
            once: true,
          },
        })
          .fromTo(
            "[data-protein-role-row]",
            { y: 18 },
            { duration: 0.78, stagger: 0.08, y: 0, ease: "power3.out" },
            0,
          );

        const heroVisual = scope.querySelector<HTMLElement>("[data-protein-topic-hero-visual]");
        const heroLight = scope.querySelector<HTMLElement>("[data-protein-topic-hero-light]");
        if (heroVisual && heroLight && pointerQuery?.matches) {
          const moveX = gsap.quickTo(heroLight, "--light-x", { duration: 0.5, ease: "power3" });
          const moveY = gsap.quickTo(heroLight, "--light-y", { duration: 0.5, ease: "power3" });
          const handlePointerMove = (event: PointerEvent) => {
            const bounds = heroVisual.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 100;
            const y = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 100;
            moveX(Number(x.toFixed(2)));
            moveY(Number(y.toFixed(2)));
          };
          const handlePointerLeave = () => {
            moveX(74);
            moveY(42);
          };

          heroVisual.addEventListener("pointermove", handlePointerMove, { passive: true });
          heroVisual.addEventListener("pointerleave", handlePointerLeave);
          removePointerLight = () => {
            heroVisual.removeEventListener("pointermove", handlePointerMove);
            heroVisual.removeEventListener("pointerleave", handlePointerLeave);
          };
        }
      }, scope);

    }

    const configure = () => {
      const nextProfile = readProfile();
      if (nextProfile === currentProfile) return;

      configurationVersion += 1;
      clearMotion();
      currentProfile = nextProfile;
      scope.dataset.motionProfile = nextProfile;
      if (nextProfile === "full") void installMotion(configurationVersion);
    };

    configure();
    window.addEventListener("resize", configure, { passive: true });
    motionQuery?.addEventListener?.("change", configure);
    connection?.addEventListener?.("change", configure);

    return () => {
      active = false;
      configurationVersion += 1;
      clearMotion();
      window.removeEventListener("resize", configure);
      motionQuery?.removeEventListener?.("change", configure);
      connection?.removeEventListener?.("change", configure);
    };
  }, [loadRuntime]);

  return (
    <div
      data-motion-profile="pending"
      data-protein-topic-motion-root=""
      ref={rootRef}
    >
      {children}
    </div>
  );
}
