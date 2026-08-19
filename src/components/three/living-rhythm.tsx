"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { getSceneState, subscribeSceneState } from "@/components/motion/scene-state-store";
import type { GraphicsQuality } from "@/lib/graphics-quality";
import { createRhythmCurves } from "./rhythm-geometry";

export type LivingRhythmProps = {
  scene: 1 | 2 | 3;
  progress: number;
  quality: GraphicsQuality;
};

const STRAND_COUNT = 7;
const RADIAL_SEGMENTS = 6;
const MATERIAL_COLORS = ["#ece7dc", "#f05a42", "#84837d"] as const;

export function LivingRhythm({ quality }: LivingRhythmProps) {
  const { progress, scene } = useSyncExternalStore(subscribeSceneState, getSceneState, getSceneState);
  const groupRef = useRef<THREE.Group>(null);
  const strandRefs = useRef<Array<THREE.Mesh | null>>([]);
  const elapsedRef = useRef(0);
  const tubularSegments = quality === "high" ? 96 : 48;
  const geometries = useMemo(() => {
    const curves = createRhythmCurves({ strands: STRAND_COUNT, segments: tubularSegments });
    return curves.map((curve, strandIndex) => {
      const radius = 0.029 + (strandIndex % 3) * 0.006;
      return new THREE.TubeGeometry(curve, tubularSegments, radius, RADIAL_SEGMENTS, true);
    });
  }, [tubularSegments]);
  const materials = useMemo(
    () =>
      MATERIAL_COLORS.map(
        (color, index) =>
          new THREE.MeshStandardMaterial({
            color,
            metalness: index === 2 ? 0.08 : 0.025,
            roughness: index === 0 ? 0.67 : 0.74,
          }),
      ),
    [],
  );
  const targetColors = useMemo(
    () => [new THREE.Color("#ece7dc"), new THREE.Color("#5367e8"), new THREE.Color("#d8f34a")],
    [],
  );
  const baseColors = useMemo(() => MATERIAL_COLORS.map((color) => new THREE.Color(color)), []);
  const interpolatedColors = useMemo(() => MATERIAL_COLORS.map((color) => new THREE.Color(color)), []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const frameDelta = Math.min(delta, 0.05);
    const damping = 1 - Math.exp(-frameDelta * 2.8);
    const sceneProgress = THREE.MathUtils.clamp(progress, 0, 1);
    elapsedRef.current += frameDelta;
    const elapsed = elapsedRef.current;
    const breathing = scene === 1
      ? Math.sin(elapsed * 0.42) * 0.026 + Math.sin(elapsed * 0.19 + 1.4) * 0.011
      : 0;
    const sceneTwoProgress = scene === 2 ? sceneProgress : scene > 2 ? 1 : 0;
    const sceneThreeProgress = scene === 3 ? sceneProgress : 0;

    group.position.z = THREE.MathUtils.lerp(
      group.position.z,
      scene === 2 ? -0.38 - sceneProgress * 0.34 : -0.08 + sceneThreeProgress * 0.18,
      damping,
    );
    group.scale.x = THREE.MathUtils.lerp(group.scale.x, 1 + breathing + sceneThreeProgress * 0.34, damping);
    group.scale.y = THREE.MathUtils.lerp(group.scale.y, 1 - breathing * 0.34 - sceneTwoProgress * 0.05, damping);
    group.scale.z = THREE.MathUtils.lerp(group.scale.z, 1 + breathing * 0.58, damping);
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      0.78 + sceneTwoProgress * 0.1 - sceneThreeProgress * 0.17,
      damping,
    );
    group.rotation.y += frameDelta * (scene === 1 ? 0.026 : 0.012);
    group.rotation.z = THREE.MathUtils.lerp(
      group.rotation.z,
      -0.18 + Math.sin(elapsed * 0.23) * 0.024 + sceneThreeProgress * 0.2,
      damping,
    );

    strandRefs.current.forEach((strand, index) => {
      if (!strand) return;
      const offset = index - (STRAND_COUNT - 1) / 2;
      strand.position.y = THREE.MathUtils.lerp(strand.position.y, offset * 0.06 * sceneTwoProgress, damping);
      strand.position.x = THREE.MathUtils.lerp(strand.position.x, offset * 0.035 * sceneThreeProgress, damping);
      strand.rotation.y = THREE.MathUtils.lerp(strand.rotation.y, sceneThreeProgress * 0.12, damping);
    });

    materials.forEach((material, index) => {
      const baseColor = baseColors[index];
      const targetColor = targetColors[index];
      const interpolatedColor = interpolatedColors[index];
      if (!baseColor || !targetColor || !interpolatedColor) return;
      const colorMix = scene === 1 ? 0 : scene === 2 ? sceneProgress * 0.45 : 0.45 + sceneProgress * 0.55;
      interpolatedColor.copy(baseColor).lerp(targetColor, colorMix);
      material.color.lerp(interpolatedColor, damping);
    });
  });

  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry.dispose());
    },
    [geometries],
  );

  useEffect(
    () => () => {
      materials.forEach((material) => material.dispose());
    },
    [materials],
  );

  if (quality === "static") return null;

  return (
    <group ref={groupRef} rotation={[0.78, 0.18, -0.18]}>
      {geometries.map((geometry, strandIndex) => (
        <mesh
          geometry={geometry}
          key={strandIndex}
          material={materials[strandIndex % materials.length]}
          ref={(mesh) => {
            strandRefs.current[strandIndex] = mesh;
          }}
          renderOrder={strandIndex}
        />
      ))}
    </group>
  );
}
