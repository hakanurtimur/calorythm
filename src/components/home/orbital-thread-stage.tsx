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
  getOrbitalThreadConfig,
  subscribeOrbitalThreadConfig,
  type OrbitalThreadConfig,
} from "@/components/orbital/orbital-thread-config";
import {
  computeThreadDash,
  createCtaThreadGeometry,
  createEditorialProofGeometry,
  createEditorialSignalGeometry,
  createQuestionAtlasGeometry,
  interpolateProgressiveGeometry,
  parseCubicLoopPath,
  serializeCubicPath,
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
  directionX: number;
  directionY: number;
  strength: number;
};

const subscribeToHydration = () => () => undefined;
const RING_CENTER = 50;

const baseThreadPoints = orbitalPaths.map((path) => parseCubicLoopPath(path.d));

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function easeOutQuart(progress: number) {
  return 1 - (1 - progress) ** 4;
}

function breathingEnvelope(elapsed: number, cycleMs: number) {
  return (1 - Math.cos((elapsed / Math.max(1, cycleMs)) * Math.PI * 2)) / 2;
}

function morphThreadPath(
  points: RingPoint[],
  response: ThreadResponse,
  profile: OrbitalThreadConfig["pointer"]["threads"][number],
  config: OrbitalThreadConfig,
  elapsed: number,
  entrance: number,
  layerIndex: number,
) {
  const directionLength = Math.hypot(response.directionX, response.directionY) || 1;
  const directionX = response.directionX / directionLength;
  const directionY = response.directionY / directionLength;
  const anchorX = RING_CENTER + directionX * config.pointer.anchorRadius;
  const anchorY = RING_CENTER + directionY * config.pointer.anchorRadius;
  const inhale = breathingEnvelope(elapsed, config.hero.breathCycleMs);
  const layerPhase = layerIndex * config.hero.layerPhaseStep;

  const deformations = points.map((point) => {
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
    const pointerOffset =
      profile.amplitude * config.pointer.intensity * response.strength * localInfluence;
    const perimeterAngle = Math.atan2(radialY, radialX);
    const localWaveScale =
      1 + response.strength * localInfluence * config.hero.pointerWaveBoost;
    const radialOffset =
      ((Math.sin(
        elapsed * config.hero.primaryWaveSpeed -
          perimeterAngle * config.hero.primaryWaveLobes +
          layerPhase,
      ) *
        config.hero.primaryWaveAmplitude +
        Math.sin(
          elapsed * config.hero.secondaryWaveSpeed +
            perimeterAngle * config.hero.secondaryWaveLobes -
            layerPhase * 0.68,
        ) *
          config.hero.secondaryWaveAmplitude) *
        localWaveScale +
        inhale * config.hero.inhaleExpansion) *
      entrance;
    const tangentialOffset =
      Math.sin(
        elapsed * config.hero.primaryWaveSpeed * config.hero.tangentialWaveSpeedRatio +
          perimeterAngle * (config.hero.primaryWaveLobes - 0.45) +
          layerPhase * 1.14,
      ) *
      config.hero.tangentialWaveAmplitude *
      entrance;
    const idleX = unitX * radialOffset - unitY * tangentialOffset;
    const idleY = unitY * radialOffset + unitX * tangentialOffset;

    return {
      idleX,
      idleY,
      pointerX: (pullX / pullLength) * pointerOffset,
      pointerY: (pullY / pullLength) * pointerOffset,
    };
  });
  const uniqueCount = Math.max(1, points.length - 1);
  const centerCorrection = deformations.slice(0, uniqueCount).reduce(
    (center, deformation) => ({
      x: center.x + deformation.idleX / uniqueCount,
      y: center.y + deformation.idleY / uniqueCount,
    }),
    { x: 0, y: 0 },
  );

  return points.map((point, index) => {
    const deformation = deformations[index] ?? deformations[0]!;
    return {
      x: point.x + deformation.idleX - centerCorrection.x + deformation.pointerX,
      y: point.y + deformation.idleY - centerCorrection.y + deformation.pointerY,
    };
  });
}

function morphCtaHalo(points: RingPoint[], elapsed: number, config: OrbitalThreadConfig) {
  const uniquePoints = points.slice(0, -1);
  const center = uniquePoints.reduce(
    (current, point) => ({
      x: current.x + point.x / (uniquePoints.length || 1),
      y: current.y + point.y / (uniquePoints.length || 1),
    }),
    { x: 0, y: 0 },
  );
  const uniqueCount = Math.max(1, uniquePoints.length);
  const time = elapsed * config.cta.primaryWaveSpeed;
  const inhale = breathingEnvelope(elapsed, config.hero.breathCycleMs);

  return points.map((point, index) => {
    const seamIndex = index === uniqueCount ? 0 : index;
    const perimeterPhase = (seamIndex / uniqueCount) * Math.PI * 2;
    const radialX = point.x - center.x;
    const radialY = point.y - center.y;
    const radius = Math.hypot(radialX, radialY) || 1;
    const haloOffset =
      Math.sin(time + perimeterPhase * 2) * config.cta.primaryWaveAmplitude +
      Math.sin(time * config.cta.secondaryWaveSpeedRatio - perimeterPhase * 3) *
        config.cta.secondaryWaveAmplitude +
      inhale * config.cta.inhaleExpansion;

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
  const threadConfig = useSyncExternalStore(
    subscribeOrbitalThreadConfig,
    getOrbitalThreadConfig,
    getOrbitalThreadConfig,
  );
  const orbitalSnapshot = useSyncExternalStore(
    subscribeOrbitalThreadState,
    getOrbitalThreadSnapshot,
    getOrbitalThreadSnapshot,
  );
  const configRef = useRef(threadConfig);
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

  useLayoutEffect(() => {
    configRef.current = threadConfig;
    ctaLayoutRevisionRef.current += 1;
  }, [threadConfig]);

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

      const baseState = snapshotRef.current.base;
      const targetSquare = centeredSquare(target.getBoundingClientRect());
      if (baseState.kind === "scene" && baseState.id === "03") {
        stage.dataset.orbitalLayout = "scene-03";
        stage.style.left = "0px";
        stage.style.top = "0px";
        stage.style.width = `${window.innerWidth}px`;
        stage.style.height = `${window.innerHeight}px`;
        return;
      }
      if (baseState.kind === "scene" && baseState.id === "02") {
        stage.dataset.orbitalLayout = "scene-02";
        stage.style.left = "0px";
        stage.style.top = "0px";
        stage.style.width = `${window.innerWidth}px`;
        stage.style.height = `${window.innerHeight}px`;
        return;
      }
      if (baseState.kind === "scene" && baseState.id === "01") {
        const rawLayoutProgress = clamp(baseState.progress / 0.22, 0, 1);
        const layoutProgress =
          rawLayoutProgress * rawLayoutProgress * (3 - rawLayoutProgress * 2);
        stage.dataset.orbitalLayout = "scene-01";
        stage.style.left = `${targetSquare.left * (1 - layoutProgress)}px`;
        stage.style.top = `${targetSquare.top * (1 - layoutProgress)}px`;
        stage.style.width = `${
          targetSquare.size + (window.innerWidth - targetSquare.size) * layoutProgress
        }px`;
        stage.style.height = `${
          targetSquare.size + (window.innerHeight - targetSquare.size) * layoutProgress
        }px`;
        return;
      }

      stage.dataset.orbitalLayout = "hero";
      stage.style.removeProperty("opacity");
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
      threadWidth: path.style.getPropertyValue("--thread-width"),
    }));
    const responses: ThreadResponse[] = orbitalPaths.map(() => ({
      directionX: 1,
      directionY: 0,
      strength: 0,
    }));
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
        if (authored.threadWidth) path.style.setProperty("--thread-width", authored.threadWidth);
        else path.style.removeProperty("--thread-width");
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
      const config = configRef.current;
      const entrance = clamp(elapsed / Math.max(1, config.hero.entranceMs), 0, 1);
      const totalRevealDuration =
        config.hero.revealDurationMs +
        config.hero.revealStaggerMs * Math.max(0, paths.length - 1);
      const motionElapsed = Math.max(0, elapsed - totalRevealDuration);
      const inhale = breathingEnvelope(motionElapsed, config.hero.breathCycleMs);
      const revealedHeroThreadWidth =
        config.hero.restStrokeWidth +
        inhale * (config.hero.inhaleStrokeWidth - config.hero.restStrokeWidth);
      const ctaThreadWidth =
        config.cta.restStrokeWidth +
        inhale * (config.cta.inhaleStrokeWidth - config.cta.restStrokeWidth);
      const snapshot = snapshotRef.current;
      const pointer = snapshot.pointer;
      const scene01Progress =
        snapshot.base.kind === "scene" && snapshot.base.id === "01"
          ? snapshot.base.progress
          : 0;
      const scene02Progress =
        snapshot.base.kind === "scene" && snapshot.base.id === "02"
          ? snapshot.base.progress
          : 0;
      const scene03Progress =
        snapshot.base.kind === "scene" && snapshot.base.id === "03"
          ? snapshot.base.progress
          : 0;
      const isProofRoute = snapshot.base.kind === "scene" && snapshot.base.id === "02";
      const isQuestionAtlas = snapshot.base.kind === "scene" && snapshot.base.id === "03";
      const isEditorialSignal = snapshot.base.kind === "scene" && snapshot.base.id === "01";
      const ctaActive = snapshot.cta.active && snapshot.cta.anchorId === "hero-cta";
      const ctaTargetProgress = ctaActive ? 1 : 0;
      const ctaEasing = 1 - Math.exp(-config.cta.response * delta);
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
            createCtaThreadGeometry({
              ctaRect,
              layerSpacingPx: config.cta.layerSpacingPx,
              pathIndex,
              stageRect,
            }),
          );
          leadingPoints = orbitalPaths.map(() => null);
          ctaLayoutRevision = currentCtaLayoutRevision;
        }
      }
      wasCtaActive = ctaActive;

      responses.forEach((response, index) => {
        const basePoints = baseThreadPoints[index];
        const profile = config.pointer.threads[index];
        if (!basePoints || !profile) return;
        const easing = 1 - Math.exp(-profile.response * delta);
        response.directionX += (pointer.x - response.directionX) * easing;
        response.directionY += (pointer.y - response.directionY) * easing;
        response.strength += (pointer.strength - response.strength) * easing;

        const heroPoints = morphThreadPath(
          basePoints,
          response,
          profile,
          config,
          motionElapsed,
          entrance,
          index,
        );
        const ctaTarget = ctaTargets?.[index];
        const breathingCtaTarget = ctaTarget
          ? morphCtaHalo(ctaTarget, motionElapsed, config)
          : null;
        const pathLag = config.cta.pathLags[index] ?? 1;
        const pathProgress = laggedCtaProgress(ctaProgress, pathLag);
        const revealProgress = easeOutQuart(
          clamp(
            (elapsed - index * config.hero.revealStaggerMs) /
              Math.max(1, config.hero.revealDurationMs),
            0,
            1,
          ),
        );
        const heroThreadWidth =
          config.hero.entryStrokeWidth +
          (revealedHeroThreadWidth - config.hero.entryStrokeWidth) * revealProgress;
        const sceneThreadWidth =
          config.scene01.restStrokeWidth +
          inhale * (config.scene01.inhaleStrokeWidth - config.scene01.restStrokeWidth);
        const proofThreadWidth =
          config.scene02.restStrokeWidth +
          inhale * (config.scene02.inhaleStrokeWidth - config.scene02.restStrokeWidth);
        const atlasThreadWidth =
          config.scene03.restStrokeWidth +
          inhale * (config.scene03.inhaleStrokeWidth - config.scene03.restStrokeWidth);
        const sceneWidthProgress =
          isProofRoute || isQuestionAtlas
            ? 1
            : easeOutQuart(clamp(scene01Progress / 0.42, 0, 1));
        const signalThreadWidth =
          heroThreadWidth + (sceneThreadWidth - heroThreadWidth) * sceneWidthProgress;
        const proofWidthProgress = isQuestionAtlas ? 1 : easeOutQuart(scene02Progress);
        const editorialThreadWidth =
          signalThreadWidth +
          (proofThreadWidth - signalThreadWidth) * proofWidthProgress;
        const baseThreadWidth =
          editorialThreadWidth +
          (atlasThreadWidth - editorialThreadWidth) * easeOutQuart(scene03Progress);
        const threadWidth =
          baseThreadWidth + (ctaThreadWidth - baseThreadWidth) * pathProgress;
        let renderedPoints = createEditorialSignalGeometry(heroPoints, {
          elapsedMs: motionElapsed,
          layerIndex: index,
          layerOffset: config.scene01.layerOffsets[index],
          layerSpacing: config.scene01.layerSpacing,
          noiseAmplitude: config.scene01.noiseAmplitude,
          pointerBoost: config.scene01.pointerWaveBoost,
          pointerStrength: pointer.strength,
          pointerX: pointer.x,
          pointerY: pointer.y,
          progress: scene01Progress,
          radiusX: config.scene01.radiusX,
          radiusY: config.scene01.radiusY,
          settledWaveAmplitude: config.scene01.settledWaveAmplitude,
          waveLobes: config.scene01.waveLobes,
          waveSpeed: config.scene01.waveSpeed,
        });
        if (isProofRoute || isQuestionAtlas) {
          const flatSignal = createEditorialSignalGeometry(basePoints, {
            elapsedMs: 0,
            layerIndex: index,
            layerOffset: config.scene01.layerOffsets[index],
            layerSpacing: config.scene01.layerSpacing,
            noiseAmplitude: config.scene01.noiseAmplitude,
            progress: 1,
            radiusX: config.scene01.radiusX,
            radiusY: config.scene01.radiusY,
            settledWaveAmplitude: config.scene01.settledWaveAmplitude,
            waveLobes: config.scene01.waveLobes,
            waveSpeed: config.scene01.waveSpeed,
          });
          const proofRoute = createEditorialProofGeometry(flatSignal, {
            layerIndex: index,
            layerSpacing: config.scene02.layerSpacing,
            progress: isQuestionAtlas ? 1 : scene02Progress,
            routeDepth: config.scene02.routeDepth,
          });
          renderedPoints = isQuestionAtlas
            ? createQuestionAtlasGeometry(proofRoute, {
                focusBend: config.scene03.focusBend,
                focusTravel: config.scene03.focusTravel,
                layerIndex: index,
                layerSpacing: config.scene03.layerSpacing,
                progress: scene03Progress,
              })
            : proofRoute;
        }

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
        path?.setAttribute(
          "d",
          isEditorialSignal || isProofRoute || isQuestionAtlas
            ? serializeCubicPath(renderedPoints, { closed: false })
            : serializeCubicLoopPath(renderedPoints),
        );
        path?.setAttribute("stroke-dasharray", dash.dasharray);
        path?.setAttribute("stroke-dashoffset", `${dash.dashoffset}`);
        path?.style.setProperty("--thread-width", threadWidth.toFixed(3));
      });

      const fillProgress = clamp(
        (ctaProgress - config.cta.fillStart) / Math.max(0.01, 1 - config.cta.fillStart),
        0,
        1,
      );
      ctaAnchorRef.current?.style.setProperty(
        "--orbital-fill-progress",
        `${fillProgress}`,
      );
      if (isQuestionAtlas && scene03Progress > 0) {
        const exitFade = clamp((scene03Progress - 0.94) / 0.06, 0, 1);
        stage.style.opacity = `${1 - exitFade}`;
      } else {
        stage.style.removeProperty("opacity");
      }

      requestRender();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!hasFinePointer || event.pointerType === "touch") return;
      const baseState = snapshotRef.current.base;
      const rect =
        baseState.kind === "scene" && baseState.id === "01"
          ? stage.getBoundingClientRect()
          : target.getBoundingClientRect();
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
      data-orbital-layout="hero"
      data-phase={phase}
      fill="none"
      focusable="false"
      preserveAspectRatio="none"
      ref={stageRef}
      viewBox="0 0 128 128"
    >
      <defs>
        {orbitalPaths.map((path) => (
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height={128 + threadConfig.glow.regionPadding * 2}
            id={`calorythm-orbital-glow-${path.id}`}
            key={path.id}
            width={128 + threadConfig.glow.regionPadding * 2}
            x={-threadConfig.glow.regionPadding}
            y={-threadConfig.glow.regionPadding}
          >
            <feGaussianBlur
              in="SourceGraphic"
              result="softGlow"
              stdDeviation={threadConfig.glow.blur}
            />
            <feFlood
              floodColor={path.color}
              floodOpacity={threadConfig.glow.opacity}
              result="glowColor"
            />
            <feComposite in="glowColor" in2="softGlow" operator="in" result="coloredGlow" />
            <feMerge>
              <feMergeNode in="coloredGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
      <g data-orbital-thread-motion="" style={{ transform: "none" }}>
        <g transform="translate(8 8) scale(1.12)">
          {orbitalPaths.map((path) => (
            <path
              className={styles.orbitalThreadPath}
              d={path.d}
              data-orbit-path={path.id}
              data-splash-thread={path.id}
              data-tone={path.id}
              filter={phase === "hero" ? `url(#calorythm-orbital-glow-${path.id})` : undefined}
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
