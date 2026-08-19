"use client";

import dynamic from "next/dynamic";
import styles from "@/components/scenes/home-scenes.module.css";
import type { RhythmStageProps } from "./rhythm-stage";

function StageLoadingStill() {
  return (
    <div aria-hidden="true" className={styles.rhythmStage} data-quality="static" data-rendering="fallback">
      <div className={styles.rhythmFallback}>
        {Array.from({ length: 7 }, (_, index) => (
          <span className={styles.rhythmBand} data-fiber={index + 1} key={index} />
        ))}
      </div>
    </div>
  );
}

const DynamicRhythmStage = dynamic(
  () => import("./rhythm-stage").then((module) => module.RhythmStage),
  { loading: StageLoadingStill, ssr: false },
);

export function RhythmStageClient(props: RhythmStageProps) {
  return <DynamicRhythmStage {...props} />;
}
