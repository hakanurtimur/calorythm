import { SiteHeader } from "@/components/layout/site-header";
import { Scene01Hero } from "@/components/scenes/scene-01-hero";
import { Scene02Matter } from "@/components/scenes/scene-02-matter";
import { Scene03Response } from "@/components/scenes/scene-03-response";
import { RhythmStageClient } from "@/components/three/rhythm-stage-client";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="ana-icerik">
        <RhythmStageClient progress={0} scene={1} />
        <Scene01Hero />
        <Scene02Matter />
        <Scene03Response />
      </main>
    </>
  );
}
