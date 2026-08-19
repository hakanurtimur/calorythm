"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getSceneState, subscribeSceneState } from "@/components/motion/scene-state-store";
import styles from "@/components/scenes/home-scenes.module.css";
import { deriveGraphicsQuality } from "@/lib/graphics-quality";
import type { GraphicsQuality } from "@/lib/graphics-quality";
import { advanceResponseParticle, createResponseParticles } from "./response-model";

type NavigatorCapabilities = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
  deviceMemory?: number;
};

const PALETTE = ["#ece7dc", "#f05a42", "#d8f34a"] as const;

function readGraphicsQuality(): GraphicsQuality {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "static";

  const capabilities = navigator as NavigatorCapabilities;
  return deriveGraphicsQuality({
    width: window.innerWidth,
    dpr: window.devicePixelRatio,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: capabilities.connection?.saveData === true,
    deviceMemory: capabilities.deviceMemory,
  });
}

function subscribeGraphicsQuality(onStoreChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => undefined;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as NavigatorCapabilities).connection;

  window.addEventListener("resize", onStoreChange, { passive: true });
  motionQuery.addEventListener("change", onStoreChange);
  connection?.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
    motionQuery.removeEventListener("change", onStoreChange);
    connection?.removeEventListener("change", onStoreChange);
  };
}

export function ResponseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(0);
  const quality = useSyncExternalStore(subscribeGraphicsQuality, readGraphicsQuality, () => "static");
  const sceneState = useSyncExternalStore(subscribeSceneState, getSceneState, getSceneState);
  const intensity = sceneState.scene === 3 ? sceneState.progress : 0;

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || quality === "static") return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const particles = createResponseParticles({ count: quality === "high" ? 64 : 28, seed: 43_103 });
    let cssWidth = 0;
    let cssHeight = 0;
    let fieldVisible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let previousTime = 0;
    let animationFrame: number | null = null;

    const draw = (elapsed: number) => {
      if (cssWidth === 0 || cssHeight === 0) return;

      const intensity = intensityRef.current;
      const transferLength = 18 + cssWidth * (0.025 + intensity * 0.035);
      context.clearRect(0, 0, cssWidth, cssHeight);
      context.lineCap = "round";
      context.lineWidth = 0.65;

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index]!;
        advanceResponseParticle(particle, elapsed, intensity);

        const x = particle.x * cssWidth;
        const y = particle.y * cssHeight;
        const bend = Math.sin(particle.phase) * (2 + intensity * 5);
        const color = PALETTE[particle.paletteIndex] ?? PALETTE[0];

        context.globalAlpha = 0.1 + intensity * 0.22;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(x - transferLength * 0.38, y - bend * 0.3);
        context.quadraticCurveTo(x + transferLength * 0.25, y + bend, x + transferLength, y - bend * 0.18);
        context.stroke();

        context.globalAlpha = 0.42 + intensity * 0.42;
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const frame = (time: number) => {
      animationFrame = null;
      if (!fieldVisible || !pageVisible) return;

      const elapsed = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1_000, 0.05);
      previousTime = time;
      draw(elapsed);
      animationFrame = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (animationFrame !== null || !fieldVisible || !pageVisible) return;
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (animationFrame === null) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dprCap = quality === "high" ? 1.5 : 1.25;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      cssWidth = Math.max(0, bounds.width);
      cssHeight = Math.max(0, bounds.height);
      const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
      const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      fieldVisible = entry?.isIntersecting === true;
      if (fieldVisible) start();
      else stop();
    });
    const handleVisibilityChange = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) start();
      else stop();
    };

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [quality]);

  if (quality === "static") return null;

  return <canvas aria-hidden="true" className={styles.responseCanvas} data-quality={quality} ref={canvasRef} />;
}
