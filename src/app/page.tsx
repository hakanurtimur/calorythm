import { SiteHeader } from "@/components/layout/site-header";
import { HomeSceneOrchestrator } from "@/components/motion/home-scene-orchestrator";
import { Scene01Hero } from "@/components/scenes/scene-01-hero";
import { Scene02Matter } from "@/components/scenes/scene-02-matter";
import { Scene03Response } from "@/components/scenes/scene-03-response";
import { RhythmStageClient } from "@/components/three/rhythm-stage-client";

export default function Home() {
  return (
    <HomeSceneOrchestrator>
      <SiteHeader />
      <main id="ana-icerik" tabIndex={-1}>
        <RhythmStageClient progress={0} scene={1} />
        <Scene01Hero />
        <Scene02Matter />
        <Scene03Response />
      </main>
    </HomeSceneOrchestrator>
  );
}
