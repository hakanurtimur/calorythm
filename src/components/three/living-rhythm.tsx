"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
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

function RhythmMotion({ children, progress, scene }: LivingRhythmProps & { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const sceneProgress = THREE.MathUtils.clamp(progress, 0, 1);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const frameDelta = Math.min(delta, 0.05);
    elapsedRef.current += frameDelta;
    const elapsed = elapsedRef.current;
    const inhale = Math.sin(elapsed * 0.42) * 0.026 + Math.sin(elapsed * 0.19 + 1.4) * 0.011;
    const targetTilt = (scene - 1) * 0.055 + sceneProgress * 0.025;
    const damping = 1 - Math.exp(-frameDelta * 2.4);

    group.scale.set(1 + inhale, 1 - inhale * 0.34, 1 + inhale * 0.58);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0.78 + targetTilt, damping);
    group.rotation.y += frameDelta * 0.026;
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -0.18 + Math.sin(elapsed * 0.23) * 0.024, damping);
  });

  return (
    <group ref={groupRef} rotation={[0.78, 0.18, -0.18]}>
      {children}
    </group>
  );
}

export function LivingRhythm({ scene, progress, quality }: LivingRhythmProps) {
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
    <RhythmMotion progress={progress} quality={quality} scene={scene}>
      {geometries.map((geometry, strandIndex) => (
        <mesh
          geometry={geometry}
          key={strandIndex}
          material={materials[strandIndex % materials.length]}
          renderOrder={strandIndex}
        />
      ))}
    </RhythmMotion>
  );
}
