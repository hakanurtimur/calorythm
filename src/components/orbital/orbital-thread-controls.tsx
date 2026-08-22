"use client";

import { useEffect } from "react";
import { folder, Leva, useControls } from "leva";
import {
  orbitalThreadDefaults,
  resetOrbitalThreadConfig,
  setOrbitalThreadConfig,
} from "./orbital-thread-config";

export function OrbitalThreadControls() {
  const values = useControls("CALORYTHM / ORBITAL", {
    "Hero material": folder({
      heroEntryStrokeWidth: {
        label: "Entry width",
        max: 8,
        min: 0.25,
        step: 0.05,
        value: orbitalThreadDefaults.hero.entryStrokeWidth,
      },
      heroRestStrokeWidth: {
        label: "Rest width",
        max: 30,
        min: 1,
        step: 0.1,
        value: orbitalThreadDefaults.hero.restStrokeWidth,
      },
      heroInhaleStrokeWidth: {
        label: "Inhale width",
        max: 40,
        min: 1,
        step: 0.1,
        value: orbitalThreadDefaults.hero.inhaleStrokeWidth,
      },
      breathCycleMs: {
        label: "Breath cycle",
        max: 9000,
        min: 1200,
        step: 50,
        value: orbitalThreadDefaults.hero.breathCycleMs,
      },
      heroRevealDurationMs: {
        label: "Reveal duration",
        max: 2400,
        min: 200,
        step: 25,
        value: orbitalThreadDefaults.hero.revealDurationMs,
      },
      heroRevealStaggerMs: {
        label: "Reveal stagger",
        max: 240,
        min: 0,
        step: 5,
        value: orbitalThreadDefaults.hero.revealStaggerMs,
      },
      heroInhaleExpansion: {
        label: "Inhale expansion",
        max: 1,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.hero.inhaleExpansion,
      },
    }),
    "Hero wave": folder({
      heroPrimaryWaveAmplitude: {
        label: "Wave depth",
        max: 3,
        min: 0,
        step: 0.02,
        value: orbitalThreadDefaults.hero.primaryWaveAmplitude,
      },
      heroSecondaryWaveAmplitude: {
        label: "Wave detail",
        max: 1.5,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.hero.secondaryWaveAmplitude,
      },
      heroTangentialWaveAmplitude: {
        label: "Contour flow",
        max: 1.2,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.hero.tangentialWaveAmplitude,
      },
      heroPrimaryWaveSpeed: {
        label: "Flow speed",
        max: 3,
        min: 0.2,
        step: 0.05,
        value: orbitalThreadDefaults.hero.primaryWaveSpeed * 1000,
      },
      heroSecondaryWaveSpeed: {
        label: "Detail speed",
        max: 3,
        min: 0.2,
        step: 0.05,
        value: orbitalThreadDefaults.hero.secondaryWaveSpeed * 1000,
      },
      heroPrimaryWaveLobes: {
        label: "Wave span",
        max: 5,
        min: 1,
        step: 0.05,
        value: orbitalThreadDefaults.hero.primaryWaveLobes,
      },
      heroSecondaryWaveLobes: {
        label: "Detail span",
        max: 6,
        min: 1,
        step: 0.05,
        value: orbitalThreadDefaults.hero.secondaryWaveLobes,
      },
      heroLayerPhaseStep: {
        label: "Layer phase",
        max: 3.14,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.hero.layerPhaseStep,
      },
      heroPointerWaveBoost: {
        label: "Pointer boost",
        max: 2,
        min: 0,
        step: 0.05,
        value: orbitalThreadDefaults.hero.pointerWaveBoost,
      },
    }),
    "Scene 01 signal": folder({
      scene01RadiusX: {
        label: "Horizontal reach",
        max: 86,
        min: 44,
        step: 1,
        value: orbitalThreadDefaults.scene01.radiusX,
      },
      scene01RadiusY: {
        label: "Band height",
        max: 24,
        min: 3,
        step: 0.25,
        value: orbitalThreadDefaults.scene01.radiusY,
      },
      scene01LayerSpacing: {
        label: "Layer spacing",
        max: 8,
        min: 0,
        step: 0.1,
        value: orbitalThreadDefaults.scene01.layerSpacing,
      },
      scene01NoiseAmplitude: {
        label: "Noise depth",
        max: 16,
        min: 0,
        step: 0.1,
        value: orbitalThreadDefaults.scene01.noiseAmplitude,
      },
      scene01SettledWaveAmplitude: {
        label: "Settled wave",
        max: 6,
        min: 0,
        step: 0.05,
        value: orbitalThreadDefaults.scene01.settledWaveAmplitude,
      },
      scene01WaveLobes: {
        label: "Wave span",
        max: 8,
        min: 1,
        step: 0.05,
        value: orbitalThreadDefaults.scene01.waveLobes,
      },
      scene01WaveSpeed: {
        label: "Wave speed",
        max: 3,
        min: 0.1,
        step: 0.05,
        value: orbitalThreadDefaults.scene01.waveSpeed * 1000,
      },
      scene01RestStrokeWidth: {
        label: "Rest width",
        max: 24,
        min: 1,
        step: 0.1,
        value: orbitalThreadDefaults.scene01.restStrokeWidth,
      },
      scene01InhaleStrokeWidth: {
        label: "Inhale width",
        max: 30,
        min: 1,
        step: 0.1,
        value: orbitalThreadDefaults.scene01.inhaleStrokeWidth,
      },
      scene01PointerWaveBoost: {
        label: "Pointer boost",
        max: 4,
        min: 0,
        step: 0.05,
        value: orbitalThreadDefaults.scene01.pointerWaveBoost,
      },
    }),
    "Scene 02 proof route": folder({
      scene02RouteDepth: {
        label: "Route depth",
        max: 32,
        min: 8,
        step: 0.5,
        value: orbitalThreadDefaults.scene02.routeDepth,
      },
      scene02LayerSpacing: {
        label: "Layer spacing",
        max: 8,
        min: 0,
        step: 0.1,
        value: orbitalThreadDefaults.scene02.layerSpacing,
      },
      scene02RestStrokeWidth: {
        label: "Rest width",
        max: 14,
        min: 0.5,
        step: 0.1,
        value: orbitalThreadDefaults.scene02.restStrokeWidth,
      },
      scene02InhaleStrokeWidth: {
        label: "Inhale width",
        max: 18,
        min: 0.5,
        step: 0.1,
        value: orbitalThreadDefaults.scene02.inhaleStrokeWidth,
      },
    }),
    Glow: folder({
      glowBlur: {
        label: "Blur",
        max: 3,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.glow.blur,
      },
      glowOpacity: {
        label: "Opacity",
        max: 1,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.glow.opacity,
      },
    }),
    "CTA form": folder({
      ctaRestStrokeWidth: {
        label: "Rest width",
        max: 6,
        min: 0.5,
        step: 0.05,
        value: orbitalThreadDefaults.cta.restStrokeWidth,
      },
      ctaInhaleStrokeWidth: {
        label: "Inhale width",
        max: 8,
        min: 0.5,
        step: 0.05,
        value: orbitalThreadDefaults.cta.inhaleStrokeWidth,
      },
      ctaLayerSpacing: {
        label: "Layer spacing",
        max: 8,
        min: 0,
        step: 0.25,
        value: orbitalThreadDefaults.cta.layerSpacingPx,
      },
      ctaWaveAmplitude: {
        label: "Wave",
        max: 0.8,
        min: 0,
        step: 0.01,
        value: orbitalThreadDefaults.cta.primaryWaveAmplitude,
      },
    }),
    Pointer: folder({
      pointerIntensity: {
        label: "Intensity",
        max: 2,
        min: 0,
        step: 0.05,
        value: orbitalThreadDefaults.pointer.intensity,
      },
      pointerAnchorRadius: {
        label: "Reach",
        max: 90,
        min: 10,
        step: 1,
        value: orbitalThreadDefaults.pointer.anchorRadius,
      },
    }),
  });

  useEffect(() => {
    setOrbitalThreadConfig({
      hero: {
        breathCycleMs: values.breathCycleMs,
        entryStrokeWidth: values.heroEntryStrokeWidth,
        inhaleExpansion: values.heroInhaleExpansion,
        inhaleStrokeWidth: values.heroInhaleStrokeWidth,
        layerPhaseStep: values.heroLayerPhaseStep,
        pointerWaveBoost: values.heroPointerWaveBoost,
        primaryWaveAmplitude: values.heroPrimaryWaveAmplitude,
        primaryWaveLobes: values.heroPrimaryWaveLobes,
        primaryWaveSpeed: values.heroPrimaryWaveSpeed / 1000,
        revealDurationMs: values.heroRevealDurationMs,
        revealStaggerMs: values.heroRevealStaggerMs,
        restStrokeWidth: values.heroRestStrokeWidth,
        secondaryWaveAmplitude: values.heroSecondaryWaveAmplitude,
        secondaryWaveLobes: values.heroSecondaryWaveLobes,
        secondaryWaveSpeed: values.heroSecondaryWaveSpeed / 1000,
        tangentialWaveAmplitude: values.heroTangentialWaveAmplitude,
      },
      cta: {
        inhaleStrokeWidth: values.ctaInhaleStrokeWidth,
        layerSpacingPx: values.ctaLayerSpacing,
        primaryWaveAmplitude: values.ctaWaveAmplitude,
        restStrokeWidth: values.ctaRestStrokeWidth,
      },
      glow: {
        blur: values.glowBlur,
        opacity: values.glowOpacity,
      },
      pointer: {
        anchorRadius: values.pointerAnchorRadius,
        intensity: values.pointerIntensity,
      },
      scene01: {
        inhaleStrokeWidth: values.scene01InhaleStrokeWidth,
        layerSpacing: values.scene01LayerSpacing,
        noiseAmplitude: values.scene01NoiseAmplitude,
        pointerWaveBoost: values.scene01PointerWaveBoost,
        radiusX: values.scene01RadiusX,
        radiusY: values.scene01RadiusY,
        restStrokeWidth: values.scene01RestStrokeWidth,
        settledWaveAmplitude: values.scene01SettledWaveAmplitude,
        waveLobes: values.scene01WaveLobes,
        waveSpeed: values.scene01WaveSpeed / 1000,
      },
      scene02: {
        inhaleStrokeWidth: values.scene02InhaleStrokeWidth,
        layerSpacing: values.scene02LayerSpacing,
        restStrokeWidth: values.scene02RestStrokeWidth,
        routeDepth: values.scene02RouteDepth,
      },
    });
  }, [values]);

  useEffect(() => resetOrbitalThreadConfig, []);

  return (
    <div data-control-runtime="leva" data-orbital-controls="">
      <Leva
        collapsed
        hideCopyButton
        theme={{
          colors: {
            accent1: "#ea735d",
            accent2: "#f3a65a",
            accent3: "#c79a45",
            elevation1: "#20211e",
            elevation2: "#2b2c28",
            elevation3: "#353630",
            highlight1: "#f6f1e8",
            highlight2: "#dcd6cc",
            highlight3: "#a7be89",
          },
          fonts: {
            mono: '"IBM Plex Mono", monospace',
            sans: '"Manrope Variable", sans-serif',
          },
          radii: { lg: "10px", sm: "6px", xs: "3px" },
          sizes: { rootWidth: "320px" },
        }}
        titleBar={{ drag: true, filter: false, title: "CALORYTHM / ORBITAL" }}
      />
    </div>
  );
}
