"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { readMotionProfile } from "@/components/motion/motion-profile";
import {
  computeThreadDash,
  createCtaThreadGeometry,
  interpolateProgressiveGeometry,
  parseCubicLoopPath,
  serializeCubicLoopPath,
  type RingPoint,
} from "@/components/orbital/orbital-thread-geometry";
import { orbitalPaths } from "@/components/orbital/orbital-paths";
import {
  getOrbitalThreadSnapshot,
  setOrbitalBaseState,
  setOrbitalCtaState,
  setOrbitalPointer,
  subscribeOrbitalThreadState,
} from "@/components/orbital/orbital-thread-store";
import { HOME_SPLASH_DISMISS_EVENT } from "./home-intro-events";
import styles from "./home.module.css";

type OrbitalThreadPhase = "handoff" | "hero" | "intro";

type OrbitalThreadStageProps = {
  durationOverride?: 0 | 1600 | 2400;
};

type ThreadResponse = {
  amplitude: number;
  directionX: number;
  directionY: number;
  phase: number;
  response: number;
  strength: number;
};

const subscribeToHydration = () => () => undefined;
const RING_CENTER = 50;
const POINTER_ANCHOR_RADIUS = 61;
const CTA_RESPONSE = 10;
const CTA_PATH_LAGS = [1, 0.92, 0.84, 0.76] as const;

const threadResponses: ThreadResponse[] = [
  { amplitude: 5.2, directionX: 1, directionY: 0, phase: 0.2, response: 8.2, strength: 0 },
  { amplitude: 4.6, directionX: 1, directionY: 0, phase: 1.6, response: 6.8, strength: 0 },
  { amplitude: 4, directionX: 1, directionY: 0, phase: 3.1, response: 5.6, strength: 0 },
  { amplitude: 3.5, directionX: 1, directionY: 0, phase: 4.7, response: 4.7, strength: 0 },
];

const baseThreadPoints = orbitalPaths.map((path) => parseCubicLoopPath(path.d));

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function morphThreadPath(
  points: RingPoint[],
  response: ThreadResponse,
  elapsed: number,
  entrance: number,
) {
  const directionLength = Math.hypot(response.directionX, response.directionY) || 1;
  const directionX = response.directionX / directionLength;
  const directionY = response.directionY / directionLength;
  const anchorX = RING_CENTER + directionX * POINTER_ANCHOR_RADIUS;
  const anchorY = RING_CENTER + directionY * POINTER_ANCHOR_RADIUS;

  return points.map((point) => {
    const radialX = point.x - RING_CENTER;
    const radialY = point.y - RING_CENTER;
    const radius = Math.hypot(radialX, radialY) || 1;
    const unitX = radialX / radius;
    const unitY = radialY / radius;
    const facing = Math.max(0, unitX * directionX + unitY * directionY);
    const localInfluence = facing ** 5;
    const pullX = anchorX - point.x;
    const pullY = anchorY - point.y;
    const pullLength = Math.hypot(pullX, pullY) || 1;
    const pointerOffset = response.amplitude * response.strength * localInfluence;
    const idleOffset =
      Math.sin(elapsed * 0.00072 + response.phase + Math.atan2(radialY, radialX) * 2.4) *
      0.24 *
      entrance;

    return {
      x: point.x + (pullX / pullLength) * pointerOffset + unitX * idleOffset,
      y: point.y + (pullY / pullLength) * pointerOffset + unitY * idleOffset,
    };
  });
}

function handoffDurationFor(duration: number) {
  return duration >= 2400 ? 620 : 460;
}

function centeredSquare(rect: DOMRect) {
  const size = Math.min(rect.width, rect.height);

  return {
    left: rect.left + (rect.width - size) / 2,
    size,
    top: rect.top + (rect.height - size) / 2,
  };
}

function laggedCtaProgress(progress: number, lag: number) {
  return clamp((progress - (1 - lag)) / lag, 0, 1);
}

function leadingPointForTarget(source: RingPoint[], target: RingPoint[]) {
  const uniqueTargetPoints = target.slice(0, -1);
  const targetCenter = uniqueTargetPoints.reduce(
    (center, point) => ({ x: center.x + point.x, y: center.y + point.y }),
    { x: 0, y: 0 },
  );
  targetCenter.x /= uniqueTargetPoints.length || 1;
  targetCenter.y /= uniqueTargetPoints.length || 1;

  // The current hero point nearest the measured CTA center leads. Ties resolve to
  // the lowest index, making the CTA-facing choice stable for every path.
  return source.slice(0, -1).reduce(
    (nearest, point, index) => {
      const distance = Math.hypot(point.x - targetCenter.x, point.y - targetCenter.y);
      return distance < nearest.distance ? { distance, index } : nearest;
    },
    { distance: Number.POSITIVE_INFINITY, index: 0 },
  ).index;
}

export function OrbitalThreadStage({ durationOverride }: OrbitalThreadStageProps) {
  const [phase, setPhase] = useState<OrbitalThreadPhase>("intro");
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const orbitalSnapshot = useSyncExternalStore(
    subscribeOrbitalThreadState,
    getOrbitalThreadSnapshot,
    getOrbitalThreadSnapshot,
  );
  const snapshotRef = useRef(orbitalSnapshot);
  const stageRef = useRef<SVGSVGElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const ctaAnchorRef = useRef<HTMLElement | null>(null);
  const ctaRectRef = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    snapshotRef.current = orbitalSnapshot;
  }, [orbitalSnapshot]);

  useEffect(() => {
    if (!isHydrated) return;

    const ctaAnchor = document.querySelector<HTMLElement>(
      '[data-orbital-anchor="hero-cta"]',
    );
    if (!ctaAnchor) return;

    ctaAnchorRef.current = ctaAnchor;
    let hasPointer = false;
    let hasFocus = false;
    let wasActive = false;

    const syncCtaState = () => {
      const active = hasPointer || hasFocus;
      if (active && !wasActive) {
        ctaRectRef.current = ctaAnchor.getBoundingClientRect();
      }
      wasActive = active;
      setOrbitalCtaState({ active, anchorId: active ? "hero-cta" : null });
    };
    const handlePointerEnter = () => {
      hasPointer = true;
      syncCtaState();
    };
    const handlePointerLeave = () => {
      hasPointer = false;
      syncCtaState();
    };
    const handleFocus = () => {
      hasFocus = true;
      syncCtaState();
    };
    const handleBlur = () => {
      hasFocus = false;
      syncCtaState();
    };

    ctaAnchor.addEventListener("pointerenter", handlePointerEnter);
    ctaAnchor.addEventListener("pointerleave", handlePointerLeave);
    ctaAnchor.addEventListener("focus", handleFocus);
    ctaAnchor.addEventListener("blur", handleBlur);

    return () => {
      ctaAnchor.removeEventListener("pointerenter", handlePointerEnter);
      ctaAnchor.removeEventListener("pointerleave", handlePointerLeave);
      ctaAnchor.removeEventListener("focus", handleFocus);
      ctaAnchor.removeEventListener("blur", handleBlur);
      ctaAnchor.style.removeProperty("--orbital-fill-progress");
      ctaAnchorRef.current = null;
      ctaRectRef.current = null;
      if (getOrbitalThreadSnapshot().cta.anchorId === "hero-cta") {
        setOrbitalCtaState({ active: false, anchorId: null });
      }
    };
  }, [isHydrated]);

  const settleIntoHero = useCallback(() => {
    const target =
      targetRef.current ?? document.querySelector<HTMLElement>("[data-splash-handoff-target]");
    if (!target) return;

    targetRef.current = target;
    setOrbitalBaseState({ kind: "hero" });
    setPhase("hero");
  }, []);

  useLayoutEffect(() => {
    if (phase !== "hero") return;

    let animationFrame = 0;
    const syncStageToHero = () => {
      animationFrame = 0;
      const stage = stageRef.current;
      const target = targetRef.current;
      if (!stage || !target) return;

      const targetSquare = centeredSquare(target.getBoundingClientRect());
      stage.style.left = `${targetSquare.left}px`;
      stage.style.top = `${targetSquare.top}px`;
      stage.style.width = `${targetSquare.size}px`;
      stage.style.height = `${targetSquare.size}px`;
    };
    const requestSync = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(syncStageToHero);
    };

    syncStageToHero();
    window.addEventListener("resize", requestSync);
    window.addEventListener("scroll", requestSync, { passive: true });

    return () => {
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", requestSync);
      window.removeEventListener("scroll", requestSync);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "hero") return;

    const stage = stageRef.current;
    const target = targetRef.current;
    if (!stage || !target) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer =
      typeof window.matchMedia !== "function" || window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion) return;

    const paths = Array.from(stage.querySelectorAll<SVGPathElement>("[data-orbit-path]"));
    const responses = threadResponses.map((response) => ({ ...response }));
    let animationFrame = 0;
    let ctaProgress = 0;
    let ctaTargets: RingPoint[][] | null = null;
    let leadingPoints: Array<number | null> = orbitalPaths.map(() => null);
    let wasCtaActive = false;
    let firstTimestamp: number | null = null;
    let lastTimestamp: number | null = null;

    const renderMorph = (timestamp: number) => {
      firstTimestamp ??= timestamp;
      const delta =
        lastTimestamp === null ? 1 / 60 : Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      const elapsed = timestamp - firstTimestamp;
      const entrance = clamp(elapsed / 800, 0, 1);
      const snapshot = snapshotRef.current;
      const pointer = snapshot.pointer;
      const ctaActive = snapshot.cta.active && snapshot.cta.anchorId === "hero-cta";
      const ctaTargetProgress = ctaActive ? 1 : 0;
      const ctaEasing = 1 - Math.exp(-CTA_RESPONSE * delta);
      ctaProgress += (ctaTargetProgress - ctaProgress) * ctaEasing;
      if (Math.abs(ctaTargetProgress - ctaProgress) < 0.001) {
        ctaProgress = ctaTargetProgress;
      }
      lastTimestamp = timestamp;

      if (ctaActive && (!wasCtaActive || !ctaTargets)) {
        const stageRect = stage.getBoundingClientRect();
        const ctaRect = ctaRectRef.current;
        if (ctaRect && stageRect.width > 0 && stageRect.height > 0) {
          ctaTargets = orbitalPaths.map((_, pathIndex) =>
            createCtaThreadGeometry({ ctaRect, pathIndex, stageRect }),
          );
          leadingPoints = orbitalPaths.map(() => null);
        }
      }
      wasCtaActive = ctaActive;

      responses.forEach((response, index) => {
        const basePoints = baseThreadPoints[index];
        if (!basePoints) return;
        const easing = 1 - Math.exp(-response.response * delta);
        response.directionX += (pointer.x - response.directionX) * easing;
        response.directionY += (pointer.y - response.directionY) * easing;
        response.strength += (pointer.strength - response.strength) * easing;

        const heroPoints = morphThreadPath(basePoints, response, elapsed, entrance);
        const ctaTarget = ctaTargets?.[index];
        const pathLag = CTA_PATH_LAGS[index] ?? 1;
        const pathProgress = laggedCtaProgress(ctaProgress, pathLag);
        let renderedPoints = heroPoints;

        if (ctaTarget) {
          leadingPoints[index] ??= leadingPointForTarget(heroPoints, ctaTarget);
          renderedPoints = interpolateProgressiveGeometry(
            heroPoints,
            ctaTarget,
            pathProgress,
            { leadingPointIndex: leadingPoints[index] ?? 0 },
          );
        }

        const path = paths[index];
        const dash = computeThreadDash(pathProgress, index);
        path?.setAttribute("d", serializeCubicLoopPath(renderedPoints));
        path?.setAttribute("stroke-dasharray", dash.dasharray);
        path?.setAttribute("stroke-dashoffset", `${dash.dashoffset}`);
      });

      const fillProgress = clamp((ctaProgress - 0.45) / 0.55, 0, 1);
      ctaAnchorRef.current?.style.setProperty(
        "--orbital-fill-progress",
        `${fillProgress}`,
      );

      animationFrame = window.requestAnimationFrame(renderMorph);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!hasFinePointer) return;
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const relativeX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relativeY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const distance = Math.hypot(relativeX, relativeY);
      const currentPointer = snapshotRef.current.pointer;
      const pointer = {
        x: distance > 0.025 ? relativeX / distance : currentPointer.x,
        y: distance > 0.025 ? relativeY / distance : currentPointer.y,
        strength: clamp((distance - 0.04) / 0.76, 0, 1),
      };

      setOrbitalPointer(pointer);
    };
    const releasePointer = () => {
      setOrbitalPointer({ ...snapshotRef.current.pointer, strength: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", releasePointer);
    document.documentElement.addEventListener("pointerleave", releasePointer);
    animationFrame = window.requestAnimationFrame(renderMorph);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", releasePointer);
      document.documentElement.removeEventListener("pointerleave", releasePointer);
      paths.forEach((path, index) => {
        const basePath = orbitalPaths[index];
        if (basePath) path.setAttribute("d", basePath.d);
        path.removeAttribute("stroke-dasharray");
        path.removeAttribute("stroke-dashoffset");
      });
    };
  }, [phase]);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>("[data-splash-handoff-target]");
    targetRef.current = target;

    const duration = durationOverride ?? readMotionProfile().splashDuration;
    const handleDismiss = () => settleIntoHero();
    window.addEventListener(HOME_SPLASH_DISMISS_EVENT, handleDismiss);

    if (duration === 0) {
      const immediateTimeout = window.setTimeout(settleIntoHero, 0);
      return () => {
        window.clearTimeout(immediateTimeout);
        window.removeEventListener(HOME_SPLASH_DISMISS_EVENT, handleDismiss);
      };
    }

    const handoffTimeout = window.setTimeout(() => {
      const stage = stageRef.current;
      const currentTarget = targetRef.current;
      if (!stage || !currentTarget) return;

      const sourceRect = stage.getBoundingClientRect();
      const targetSquare = centeredSquare(currentTarget.getBoundingClientRect());
      if (sourceRect.width <= 0 || sourceRect.height <= 0 || targetSquare.size <= 0) return;

      stage.style.left = `${sourceRect.left}px`;
      stage.style.top = `${sourceRect.top}px`;
      stage.style.width = `${sourceRect.width}px`;
      stage.style.height = `${sourceRect.height}px`;
      stage.style.setProperty("--handoff-source-left", `${sourceRect.left}px`);
      stage.style.setProperty("--handoff-source-top", `${sourceRect.top}px`);
      stage.style.setProperty("--handoff-source-width", `${sourceRect.width}px`);
      stage.style.setProperty("--handoff-source-height", `${sourceRect.height}px`);
      stage.style.setProperty("--handoff-target-left", `${targetSquare.left}px`);
      stage.style.setProperty("--handoff-target-top", `${targetSquare.top}px`);
      stage.style.setProperty("--handoff-target-size", `${targetSquare.size}px`);
      setPhase("handoff");
    }, duration - handoffDurationFor(duration));

    return () => {
      window.clearTimeout(handoffTimeout);
      window.removeEventListener(HOME_SPLASH_DISMISS_EVENT, handleDismiss);
    };
  }, [durationOverride, settleIntoHero]);

  const portalHost = isHydrated ? document.body : null;
  if (!portalHost) return null;

  return createPortal(
    <svg
      aria-hidden="true"
      className={styles.orbitalThreadStage}
      data-orbit-mark="frame"
      data-orbital-thread-stage=""
      data-phase={phase}
      fill="none"
      focusable="false"
      ref={stageRef}
      viewBox="0 0 128 128"
    >
      <g data-orbital-thread-motion="" style={{ transform: "none" }}>
        <g transform="translate(8 8) scale(1.12)">
          {orbitalPaths.map((path) => (
            <path
              className={styles.orbitalThreadPath}
              d={path.d}
              data-orbit-path={path.id}
              data-splash-thread={path.id}
              data-tone={path.id}
              key={path.id}
              pathLength="1"
              stroke={path.color}
            />
          ))}
        </g>
      </g>
    </svg>,
    portalHost,
  );
}
