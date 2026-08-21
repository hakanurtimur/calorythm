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

function morphCtaHalo(points: RingPoint[], elapsed: number) {
  const uniquePoints = points.slice(0, -1);
  const center = uniquePoints.reduce(
    (current, point) => ({
      x: current.x + point.x / (uniquePoints.length || 1),
      y: current.y + point.y / (uniquePoints.length || 1),
    }),
    { x: 0, y: 0 },
  );
  const uniqueCount = Math.max(1, uniquePoints.length);
  const time = elapsed * 0.00078;

  return points.map((point, index) => {
    const seamIndex = index === uniqueCount ? 0 : index;
    const perimeterPhase = (seamIndex / uniqueCount) * Math.PI * 2;
    const radialX = point.x - center.x;
    const radialY = point.y - center.y;
    const radius = Math.hypot(radialX, radialY) || 1;
    const haloOffset =
      Math.sin(time + perimeterPhase * 2) * 0.16 +
      Math.sin(time * 0.63 - perimeterPhase * 3) * 0.04;

    return {
      x: point.x + (radialX / radius) * haloOffset,
      y: point.y + (radialY / radius) * haloOffset,
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
  const ctaLayoutRevisionRef = useRef(0);
  const handoffTimeoutRef = useRef<number | null>(null);
  const settledRef = useRef(false);

  useLayoutEffect(() => {
    snapshotRef.current = orbitalSnapshot;
  }, [orbitalSnapshot]);

  useEffect(() => {
    return () => {
      setOrbitalPointer({ x: 0, y: 0, strength: 0 });
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const ctaAnchor = document.querySelector<HTMLElement>(
      '[data-orbital-anchor="hero-cta"]',
    );
    if (!ctaAnchor) return;

    ctaAnchorRef.current = ctaAnchor;
    const hasFinePointer =
      typeof window.matchMedia !== "function" || window.matchMedia("(pointer: fine)").matches;
    let hasPointer = false;
    let hasFocus = false;
    let lastInputModality: PointerEvent["pointerType"] | "keyboard" | null = null;
    let wasActive = false;

    const syncCtaState = () => {
      const active = hasPointer || hasFocus;
      if (active && !wasActive) {
        ctaRectRef.current = ctaAnchor.getBoundingClientRect();
      }
      wasActive = active;
      setOrbitalCtaState({ active, anchorId: active ? "hero-cta" : null });
    };
    const recordPointerModality = (event: PointerEvent) => {
      if (event.pointerType) lastInputModality = event.pointerType;
    };
    const handlePointerEnter = (event: PointerEvent) => {
      recordPointerModality(event);
      if (event.pointerType === "touch") return;
      hasPointer = true;
      syncCtaState();
    };
    const handlePointerLeave = (event: PointerEvent) => {
      recordPointerModality(event);
      if (event.pointerType === "touch") return;
      hasPointer = false;
      syncCtaState();
    };
    const handlePointerDown = (event: PointerEvent) => {
      recordPointerModality(event);
    };
    const handlePointerUp = (event: PointerEvent) => {
      recordPointerModality(event);
    };
    const handleKeyboardInput = () => {
      lastInputModality = "keyboard";
    };
    const handleFocus = () => {
      if (lastInputModality === "touch") return;
      hasFocus = true;
      syncCtaState();
    };
    const handleBlur = () => {
      hasFocus = false;
      syncCtaState();
    };

    if (hasFinePointer) {
      ctaAnchor.addEventListener("pointerenter", handlePointerEnter);
      ctaAnchor.addEventListener("pointerleave", handlePointerLeave);
      ctaAnchor.addEventListener("pointerdown", handlePointerDown);
      ctaAnchor.addEventListener("pointerup", handlePointerUp);
    }
    ctaAnchor.addEventListener("focus", handleFocus);
    ctaAnchor.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyboardInput);

    return () => {
      if (hasFinePointer) {
        ctaAnchor.removeEventListener("pointerenter", handlePointerEnter);
        ctaAnchor.removeEventListener("pointerleave", handlePointerLeave);
        ctaAnchor.removeEventListener("pointerdown", handlePointerDown);
        ctaAnchor.removeEventListener("pointerup", handlePointerUp);
      }
      ctaAnchor.removeEventListener("focus", handleFocus);
      ctaAnchor.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyboardInput);
      ctaAnchor.style.removeProperty("--orbital-fill-progress");
      ctaAnchorRef.current = null;
      ctaRectRef.current = null;
      if (getOrbitalThreadSnapshot().cta.anchorId === "hero-cta") {
        setOrbitalCtaState({ active: false, anchorId: null });
      }
    };
  }, [isHydrated]);

  const settleIntoHero = useCallback(() => {
    if (settledRef.current) return;
    const target =
      targetRef.current ?? document.querySelector<HTMLElement>("[data-splash-handoff-target]");
    if (!target) return;

    settledRef.current = true;
    if (handoffTimeoutRef.current !== null) {
      window.clearTimeout(handoffTimeoutRef.current);
      handoffTimeoutRef.current = null;
    }
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

      const ctaAnchor = ctaAnchorRef.current;
      const ctaState = snapshotRef.current.cta;
      if (ctaAnchor && ctaState.active && ctaState.anchorId === "hero-cta") {
        ctaRectRef.current = ctaAnchor.getBoundingClientRect();
        ctaLayoutRevisionRef.current += 1;
      }
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

    const reducedMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const hasFinePointer =
      typeof window.matchMedia !== "function" || window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    const paths = Array.from(stage.querySelectorAll<SVGPathElement>("[data-orbit-path]"));
    const authoredPathAttributes = paths.map((path) => ({
      d: path.getAttribute("d"),
      dasharray: path.getAttribute("stroke-dasharray"),
      dashoffset: path.getAttribute("stroke-dashoffset"),
    }));
    const responses = threadResponses.map((response) => ({ ...response }));
    let animationFrame = 0;
    let ctaProgress = 0;
    let ctaTargets: RingPoint[][] | null = null;
    let ctaLayoutRevision = -1;
    let leadingPoints: Array<number | null> = orbitalPaths.map(() => null);
    let wasCtaActive = false;
    let firstTimestamp: number | null = null;
    let lastTimestamp: number | null = null;

    const restoreAuthoredPathAttributes = () => {
      paths.forEach((path, index) => {
        const authored = authoredPathAttributes[index];
        if (!authored) return;
        if (authored.d === null) path.removeAttribute("d");
        else path.setAttribute("d", authored.d);
        if (authored.dasharray === null) path.removeAttribute("stroke-dasharray");
        else path.setAttribute("stroke-dasharray", authored.dasharray);
        if (authored.dashoffset === null) path.removeAttribute("stroke-dashoffset");
        else path.setAttribute("stroke-dashoffset", authored.dashoffset);
      });
    };
    const restoreStaticStage = () => {
      ctaProgress = 0;
      ctaTargets = null;
      ctaLayoutRevision = -1;
      leadingPoints = orbitalPaths.map(() => null);
      wasCtaActive = false;
      stage.setAttribute("data-cta-layer", "idle");
      stage.style.removeProperty("z-index");
      ctaAnchorRef.current?.style.setProperty("--orbital-fill-progress", "0");
      restoreAuthoredPathAttributes();
    };
    const prefersReducedMotion = () => reducedMotionQuery?.matches === true;
    const requestRender = () => {
      if (document.hidden || prefersReducedMotion() || animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(renderMorph);
    };
    const renderMorph = (timestamp: number) => {
      animationFrame = 0;
      if (document.hidden) return;
      if (prefersReducedMotion()) {
        restoreStaticStage();
        return;
      }
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
      const ctaLayer = ctaActive || ctaProgress > 0 ? "foreground" : "idle";
      stage.setAttribute("data-cta-layer", ctaLayer);
      if (ctaLayer === "foreground") {
        stage.style.zIndex = "4";
      } else {
        stage.style.removeProperty("z-index");
      }

      const currentCtaLayoutRevision = ctaLayoutRevisionRef.current;
      if (
        ctaActive &&
        (!wasCtaActive || !ctaTargets || ctaLayoutRevision !== currentCtaLayoutRevision)
      ) {
        const stageRect = stage.getBoundingClientRect();
        const ctaRect = ctaRectRef.current;
        if (ctaRect && stageRect.width > 0 && stageRect.height > 0) {
          ctaTargets = orbitalPaths.map((_, pathIndex) =>
            createCtaThreadGeometry({ ctaRect, pathIndex, stageRect }),
          );
          leadingPoints = orbitalPaths.map(() => null);
          ctaLayoutRevision = currentCtaLayoutRevision;
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
        const breathingCtaTarget = ctaTarget ? morphCtaHalo(ctaTarget, elapsed) : null;
        const pathLag = CTA_PATH_LAGS[index] ?? 1;
        const pathProgress = laggedCtaProgress(ctaProgress, pathLag);
        let renderedPoints = heroPoints;

        if (ctaTarget && breathingCtaTarget) {
          leadingPoints[index] ??= leadingPointForTarget(heroPoints, ctaTarget);
          renderedPoints = interpolateProgressiveGeometry(
            heroPoints,
            breathingCtaTarget,
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

      requestRender();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!hasFinePointer || event.pointerType === "touch") return;
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
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }
      requestRender();
    };
    const handleReducedMotionChange = () => {
      if (prefersReducedMotion()) {
        if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        restoreStaticStage();
        return;
      }
      requestRender();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", releasePointer);
    document.documentElement.addEventListener("pointerleave", releasePointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery?.addEventListener("change", handleReducedMotionChange);
    if (prefersReducedMotion()) restoreStaticStage();
    else requestRender();

    return () => {
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      stage.setAttribute("data-cta-layer", "idle");
      stage.style.removeProperty("z-index");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", releasePointer);
      document.documentElement.removeEventListener("pointerleave", releasePointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery?.removeEventListener("change", handleReducedMotionChange);
      restoreAuthoredPathAttributes();
      if (getOrbitalThreadSnapshot().cta.anchorId === "hero-cta") {
        setOrbitalCtaState({ active: false, anchorId: null });
      }
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
      if (settledRef.current) return;
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
    handoffTimeoutRef.current = handoffTimeout;

    return () => {
      window.clearTimeout(handoffTimeout);
      if (handoffTimeoutRef.current === handoffTimeout) handoffTimeoutRef.current = null;
      window.removeEventListener(HOME_SPLASH_DISMISS_EVENT, handleDismiss);
    };
  }, [durationOverride, settleIntoHero]);

  const portalHost = isHydrated ? document.body : null;
  if (!portalHost) return null;

  return createPortal(
    <svg
      aria-hidden="true"
      className={styles.orbitalThreadStage}
      data-cta-layer="idle"
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
