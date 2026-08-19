"use client";

import { Canvas } from "@react-three/fiber";
import { Component, useCallback, useSyncExternalStore, useState } from "react";
import type { ReactNode } from "react";
import type { WebGLRenderer } from "three";
import { deriveGraphicsQuality } from "@/lib/graphics-quality";
import type { GraphicsQuality } from "@/lib/graphics-quality";
import styles from "@/components/scenes/home-scenes.module.css";
import { LivingRhythm } from "./living-rhythm";

export type RhythmStageProps = {
  scene?: 1 | 2 | 3;
  progress?: number;
};

type NavigatorCapabilities = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
  deviceMemory?: number;
};

type WebGLErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type WebGLErrorBoundaryState = {
  failed: boolean;
};

let cachedWebGLSupport: boolean | undefined;

function readGraphicsQuality(): GraphicsQuality {
  if (typeof window === "undefined") return "static";

  const capabilities = navigator as NavigatorCapabilities;
  return deriveGraphicsQuality({
    width: window.innerWidth,
    dpr: window.devicePixelRatio,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: capabilities.connection?.saveData === true,
    deviceMemory: capabilities.deviceMemory,
  });
}

function readServerGraphicsQuality(): GraphicsQuality {
  return "static";
}

function subscribeGraphicsQuality(onStoreChange: () => void) {
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

function readDocumentVisibility() {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}

function subscribeDocumentVisibility(onStoreChange: () => void) {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function readWebGLSupport() {
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport;
  if (typeof document === "undefined") return false;

  try {
    const probe = document.createElement("canvas");
    cachedWebGLSupport = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    cachedWebGLSupport = false;
  }

  return cachedWebGLSupport;
}

function subscribeOnce() {
  return () => undefined;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  state: WebGLErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function FibrousFallback() {
  return (
    <div className={styles.rhythmFallback}>
      {Array.from({ length: 7 }, (_, index) => (
        <span className={styles.rhythmBand} data-fiber={index + 1} key={index} />
      ))}
    </div>
  );
}

export function RhythmStage({ scene = 1, progress = 0 }: RhythmStageProps) {
  const quality = useSyncExternalStore(subscribeGraphicsQuality, readGraphicsQuality, readServerGraphicsQuality);
  const pageVisible = useSyncExternalStore(subscribeDocumentVisibility, readDocumentVisibility, () => true);
  const webglSupported = useSyncExternalStore(subscribeOnce, readWebGLSupport, () => false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const handleWebGLFailure = useCallback(() => {
    setWebglFailed(true);
    setWebglReady(false);
  }, []);
  const handleCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      setWebglReady(true);
      gl.domElement.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          handleWebGLFailure();
        },
        { once: true },
      );
    },
    [handleWebGLFailure],
  );
  const canRenderCanvas = quality !== "static" && webglSupported && !webglFailed;
  const rendering = canRenderCanvas && webglReady ? "webgl" : "fallback";

  return (
    <div
      aria-hidden="true"
      className={styles.rhythmStage}
      data-quality={quality}
      data-rendering={rendering}
    >
      <FibrousFallback />
      {canRenderCanvas ? (
        <WebGLErrorBoundary onError={handleWebGLFailure}>
          <Canvas
            camera={{ fov: 35, near: 0.1, far: 40, position: [0, 0, 5.4] }}
            className={styles.rhythmCanvas}
            dpr={quality === "high" ? [1, 1.5] : 1}
            fallback={null}
            frameloop={pageVisible ? "always" : "never"}
            gl={{ alpha: true, antialias: quality === "high", powerPreference: "high-performance" }}
            onCreated={handleCreated}
          >
            <hemisphereLight color="#ece7dc" groundColor="#24221f" intensity={1.35} />
            <directionalLight color="#fff7e8" intensity={2.2} position={[3.5, 4.5, 5]} />
            <pointLight color="#f05a42" decay={2} distance={9} intensity={5.5} position={[-3, -1.4, 2.4]} />
            <LivingRhythm progress={progress} quality={quality} scene={scene} />
          </Canvas>
        </WebGLErrorBoundary>
      ) : null}
    </div>
  );
}
