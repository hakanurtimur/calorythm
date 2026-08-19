import * as THREE from "three";

export type RhythmCurveOptions = {
  strands: number;
  segments: number;
};

export function createRhythmCurves({ strands, segments }: RhythmCurveOptions): THREE.CatmullRomCurve3[] {
  return Array.from({ length: strands }, (_, strandIndex) => {
    const strandPhase = (strandIndex / strands) * Math.PI * 2;
    const orbitOffset = (strandIndex - (strands - 1) / 2) * 0.055;
    const points = Array.from({ length: segments }, (__, segmentIndex) => {
      const angle = (segmentIndex / segments) * Math.PI * 2;
      const weave = Math.sin(angle * 3 + strandPhase) * 0.18;

      return new THREE.Vector3(
        Math.cos(angle) * (1.72 + orbitOffset) + Math.cos(angle * 2 + strandPhase) * 0.11,
        Math.sin(angle * 2 + strandPhase) * 0.34 + Math.sin(angle) * 0.12,
        Math.sin(angle) * (1.04 - orbitOffset) + weave,
      );
    });

    return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.42);
  });
}
