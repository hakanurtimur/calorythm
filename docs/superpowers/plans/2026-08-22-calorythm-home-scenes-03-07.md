# CALORYTHM Homepage Scenes 03–07 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the single persistent four-thread CALORYTHM SVG through homepage Scenes 03–07 and replace the remaining generic section treatments with one coherent editorial scroll narrative.

**Architecture:** `HomeMotion` owns desktop ScrollTrigger progress and publishes normalized scene state. Pure geometry functions transform the previous scene's 13-point paths, while `OrbitalThreadStage` remains the only SVG renderer and selects open or closed serialization. Markup and CSS express each scene's editorial meaning without manipulating path geometry.

**Tech Stack:** Next.js 16.3.1, React 19, TypeScript, CSS Modules, GSAP ScrollTrigger, SVG cubic paths, Vitest, Testing Library, Leva.

**Spec:** `docs/superpowers/specs/2026-08-22-calorythm-home-scenes-03-07-design.md`

## Global Constraints

- Keep exactly one persistent SVG stage and four independently colored paths.
- Use the existing palette: `#F6F1E8`, `#20211E`, `#F3A65A`, `#EA735D`, `#C79A45`, `#A7BE89`.
- Do not add images, video, WebGL, Three.js, or new runtime dependencies.
- Do not invent the first dossier's subject or publication date.
- Keep all Turkish reading content available without JavaScript animation.
- Disable pinning and continuous orbital geometry for reduced-motion and coarse-pointer profiles.
- Animate typography with transforms and opacity; update path `d` only inside the existing requestAnimationFrame loop.
- Preserve reverse-scroll determinism and never crossfade or clone the orbital paths.
- Preserve unrelated dirty-worktree changes and commit only files named by each task.

---

## File Structure

### New files

- `src/components/orbital/orbital-editorial-scenes.ts` — pure Scene 03–07 geometry functions and the scene resolver.
- `src/components/orbital/orbital-editorial-scenes.test.ts` — finite, reversible, layered, open/closed geometry tests.
- `src/components/home/scene-03-07-orbital-motion.test.tsx` — ScrollTrigger-to-store contract for remaining scenes.
- `src/components/home/orbital-thread-scenes-03-07.test.tsx` — one-stage rendering contract for Scene 03–07 geometries.
- `src/components/home/scene-03-layout.test.tsx` — question-atlas semantic composition.
- `src/components/home/scene-04-05-layout.test.tsx` — understanding frame and dossier seal composition.
- `src/components/home/scene-06-07-layout.test.tsx` — journal spine and final resolution composition.

### Modified files

- `src/components/orbital/orbital-thread-config.ts` — typed defaults and patch merging for Scene 03–07.
- `src/components/orbital/orbital-thread-controls.tsx` — Leva controls for Scene 03–07 geometry.
- `src/components/home/orbital-thread-stage.tsx` — scene resolver, fullscreen/centered layouts, open/closed path serialization.
- `src/components/home/home-motion.tsx` — Scene 03–07 pinning, store progress, active topic progress, scoped transforms.
- `src/components/home/home-experience.tsx` — editorial scene labels, anchors, annotations, and motion hooks.
- `src/components/home/home.module.css` — desktop art direction and mobile static fallbacks.
- `src/content/orbital-home.ts` — restrained Turkish annotations only; existing main copy remains intact.
- `src/components/home/home-motion.test.tsx` — expected trigger ownership/count only if the existing fixture requires it; stage only this plan's hunk.

---

### Task 1: Pure Scene 03–07 Geometry System

**Files:**
- Create: `src/components/orbital/orbital-editorial-scenes.ts`
- Create: `src/components/orbital/orbital-editorial-scenes.test.ts`
- Read: `src/components/orbital/orbital-thread-geometry.ts`
- Read: `src/components/orbital/orbital-paths.ts`

**Interfaces:**
- Consumes: `RingPoint[]`, `interpolateGeometry()`, authored `orbitalPaths`.
- Produces:

```ts
export type RemainingEditorialSceneId = "03" | "04" | "05" | "06" | "07";

export type RemainingSceneGeometryConfig = {
  layerSpacing: number;
  routeDepth: number;
  sealRadiusX: number;
  sealRadiusY: number;
  spineX: number;
  topicFocus: number;
};

export type RemainingSceneGeometryInput = {
  config: RemainingSceneGeometryConfig;
  layerIndex: number;
  progress: number;
  sceneId: RemainingEditorialSceneId;
  source: RingPoint[];
};

export type RemainingSceneGeometryResult = {
  closed: boolean;
  points: RingPoint[];
};

export function resolveRemainingSceneGeometry(
  input: RemainingSceneGeometryInput,
): RemainingSceneGeometryResult;
```

- [ ] **Step 1: Write failing tests for all remaining scene endpoints**

```ts
const config = {
  layerSpacing: 2.8,
  routeDepth: 20,
  sealRadiusX: 30,
  sealRadiusY: 24,
  spineX: 24,
  topicFocus: 0.5,
};

it.each(["03", "04", "05", "06", "07"] as const)(
  "returns finite four-cubic geometry for Scene %s",
  (sceneId) => {
    const result = resolveRemainingSceneGeometry({
      config,
      layerIndex: 2,
      progress: 1,
      sceneId,
      source: flatSignal,
    });
    expect(result.points).toHaveLength(13);
    expect(result.points.flatMap(({ x, y }) => [x, y]).every(Number.isFinite)).toBe(true);
  },
);

it("keeps progress zero identical to its source", () => {
  expect(resolveRemainingSceneGeometry({
    config,
    layerIndex: 0,
    progress: 0,
    sceneId: "03",
    source: flatSignal,
  }).points).toEqual(flatSignal);
});

it("closes only the final resolved ring", () => {
  expect(resolveRemainingSceneGeometry({ ...baseInput, sceneId: "06" }).closed).toBe(false);
  expect(resolveRemainingSceneGeometry({ ...baseInput, sceneId: "07", progress: 1 }).closed).toBe(true);
});
```

- [ ] **Step 2: Run the new geometry test and confirm the intended failure**

Run: `pnpm test src/components/orbital/orbital-editorial-scenes.test.ts`

Expected: FAIL because `resolveRemainingSceneGeometry` does not exist.

- [ ] **Step 3: Implement deterministic scene target geometries**

Implement these exact endpoint responsibilities:

```ts
const targets: Record<RemainingEditorialSceneId, (input: TargetInput) => RingPoint[]> = {
  "03": createVerticalScannerPoints,
  "04": createEditorialBracketPoints,
  "05": createDossierSealPoints,
  "06": createJournalSpinePoints,
  "07": createFinalRingPoints,
};

export function resolveRemainingSceneGeometry(input: RemainingSceneGeometryInput) {
  const progress = clamp01(input.progress);
  if (progress === 0) return { closed: false, points: input.source };
  const target = targets[input.sceneId](input);
  return {
    closed: input.sceneId === "07" && progress >= 0.98,
    points: interpolateGeometry(input.source, target, smoothstep(0.04, 0.92, progress)),
  };
}
```

Scene endpoint shapes must be:

- Scene 03: four vertical scanner rails with layer-separated `x` values.
- Scene 04: two open bracket turns framing the center.
- Scene 05: asymmetric four-cubic seal centered near `(64, 64)`.
- Scene 06: vertical spine at `config.spineX` with a topic-focus reach toward the right.
- Scene 07: exact authored path points at progress `1` for each corresponding layer.

- [ ] **Step 4: Run geometry tests**

Run: `pnpm test src/components/orbital/orbital-editorial-scenes.test.ts src/components/orbital/orbital-thread-geometry.test.ts`

Expected: PASS with finite points, exact progress endpoints, independent layers, and final authored-loop equality.

- [ ] **Step 5: Commit the geometry unit**

```bash
git add src/components/orbital/orbital-editorial-scenes.ts src/components/orbital/orbital-editorial-scenes.test.ts
git -c commit.gpgsign=false commit -m "feat: add remaining editorial scene geometries"
```

---

### Task 2: Scene Configuration and Persistent Stage Routing

**Files:**
- Modify: `src/components/orbital/orbital-thread-config.ts` (`OrbitalThreadConfig`, defaults, patch merger)
- Modify: `src/components/orbital/orbital-thread-controls.tsx` (Leva folders after Scene 02)
- Modify: `src/components/home/orbital-thread-stage.tsx` (layout and render resolver)
- Create: `src/components/home/orbital-thread-scenes-03-07.test.tsx`

**Interfaces:**
- Consumes: `resolveRemainingSceneGeometry()` from Task 1 and orbital store scene state.
- Produces: one SVG stage with `data-orbital-layout="scene-03"` through `"scene-07"` and an open/closed path selected from resolver output.

- [ ] **Step 1: Write the failing persistent-stage tests**

```tsx
it.each(["03", "04", "05", "06"] as const)(
  "keeps Scene %s fullscreen with open paths",
  (id) => {
    setOrbitalBaseState({ id, kind: "scene", progress: 0.72 });
    dispatchScrollAndFrames();
    expect(stage).toHaveAttribute("data-orbital-layout", `scene-${id}`);
    expect(stage.style.width).toBe("1440px");
    expect(firstPath.getAttribute("d")).not.toMatch(/Z$/);
  },
);

it("centers and closes the final ring", () => {
  setOrbitalBaseState({ id: "07", kind: "scene", progress: 1 });
  dispatchScrollAndFrames();
  expect(stage).toHaveAttribute("data-orbital-layout", "scene-07");
  expect(firstPath.getAttribute("d")).toBe(orbitalPaths[0].d);
});
```

- [ ] **Step 2: Run the stage test and confirm failure**

Run: `pnpm test src/components/home/orbital-thread-scenes-03-07.test.tsx`

Expected: FAIL because the stage currently routes only Hero, Scene 01, and Scene 02.

- [ ] **Step 3: Add typed config sections and Leva controls**

Add `scene03`, `scene04`, `scene05`, `scene06`, and `scene07` to `OrbitalThreadConfig`. Each section must expose `layerSpacing`, `restStrokeWidth`, `inhaleStrokeWidth`, and its scene-specific values:

```ts
scene03: { layerSpacing: 2.8, railSpread: 34, restStrokeWidth: 2.8, inhaleStrokeWidth: 4.2 },
scene04: { bracketInset: 22, layerSpacing: 2.6, restStrokeWidth: 3.4, inhaleStrokeWidth: 5.4 },
scene05: { layerSpacing: 2.4, sealRadiusX: 30, sealRadiusY: 24, restStrokeWidth: 4.2, inhaleStrokeWidth: 6.8 },
scene06: { layerSpacing: 2.2, spineX: 24, restStrokeWidth: 2.2, inhaleStrokeWidth: 3.8 },
scene07: { layerSpacing: 1.8, ringScale: 1, restStrokeWidth: 5.5, inhaleStrokeWidth: 8.5 },
```

Create one collapsed Leva folder per scene and wire every value through `setOrbitalThreadConfig()`.

- [ ] **Step 4: Route remaining scene ids through the stage**

For Scene 03–06, keep the stage fullscreen. For Scene 07, interpolate the stage rectangle from fullscreen to a centered square using transforms/sizing already owned by `syncStageToHero`. Feed the previous scene endpoint into the next resolver so reverse scroll reconstructs the same path.

Use:

```ts
const remainingScene = isRemainingEditorialScene(snapshot.base) ? snapshot.base : null;
const geometry = remainingScene
  ? resolveRemainingSceneGeometry({
      config: sceneGeometryConfig(config, remainingScene.id, topicFocus),
      layerIndex: index,
      progress: remainingScene.progress,
      sceneId: remainingScene.id,
      source: previousScenePoints,
    })
  : null;
```

Serialize `geometry.points` with `serializeCubicPath(points, { closed: geometry.closed })`.

- [ ] **Step 5: Run stage and existing orbital tests**

Run: `pnpm test src/components/home/orbital-thread-scenes-03-07.test.tsx src/components/home/orbital-thread-scene-01.test.tsx src/components/home/orbital-thread-scene-02.test.tsx src/components/orbital/orbital-thread-geometry.test.ts`

Expected: PASS with one stage, open middle scenes, exact final loop, and unchanged earlier geometries.

- [ ] **Step 6: Commit config and stage routing**

```bash
git add src/components/orbital/orbital-thread-config.ts src/components/orbital/orbital-thread-controls.tsx src/components/home/orbital-thread-stage.tsx src/components/home/orbital-thread-scenes-03-07.test.tsx
git -c commit.gpgsign=false commit -m "feat: carry orbital stage through remaining scenes"
```

---

### Task 3: ScrollTrigger Ownership for Scenes 03–07

**Files:**
- Modify: `src/components/home/home-motion.tsx` (Scene 03–07 timelines)
- Create: `src/components/home/scene-03-07-orbital-motion.test.tsx`
- Modify conditionally: `src/components/home/home-motion.test.tsx` (only expected trigger ownership/count)

**Interfaces:**
- Consumes: `setOrbitalBaseState({ id, kind: "scene", progress })`.
- Produces: normalized progress for Scene 03–07 and deterministic handoff to previous/next scenes.

- [ ] **Step 1: Write failing motion contract tests**

```tsx
it.each([
  ["03", '[data-pin="03"]'],
  ["04", '[data-pin="04"]'],
  ["05", '[data-pin="05"]'],
  ["07", '[data-pin="07"]'],
] as const)("pins Scene %s and publishes progress", async (id, pin) => {
  const timeline = findTimeline(id);
  expect(timeline.scrollTrigger.pin).toBe(pin);
  timeline.scrollTrigger.onUpdate?.({ progress: 0.63 });
  expect(getOrbitalThreadSnapshot().base).toEqual({ id, kind: "scene", progress: 0.63 });
});

it("publishes Scene 06 progress without pinning its long journal list", () => {
  const trigger = findStandaloneTrigger("scene-06-orbital");
  trigger.onUpdate?.({ progress: 0.5 });
  expect(getOrbitalThreadSnapshot().base).toEqual({ id: "06", kind: "scene", progress: 0.5 });
});
```

- [ ] **Step 2: Run the motion test and confirm failure**

Run: `pnpm test src/components/home/scene-03-07-orbital-motion.test.tsx`

Expected: FAIL because Scene 03, 05, and 07 are not pinned and none of Scene 03–07 publish orbital progress.

- [ ] **Step 3: Implement top-to-bottom scene timelines**

Use these desktop ranges:

```ts
const remainingSceneRanges = {
  "03": "+=220%",
  "04": "+=180%",
  "05": "+=160%",
  "07": "+=140%",
} as const;
```

Each timeline must:

- use `ease: "none"` and numeric scrub between `0.55` and `0.8`;
- pin the scene's viewport child, never the animated content itself;
- publish scene progress in `onUpdate` only when `canPin` is true;
- set the previous scene to progress `1` on `onLeaveBack`;
- set the next scene to progress `0` on `onLeave`.

Scene 06 remains a long native scroll section. Add one standalone `ScrollTrigger.create()` with id `scene-06-orbital`, `start: "top top"`, `end: "bottom bottom"`, and normalized `onUpdate`.

- [ ] **Step 4: Add scoped typography transforms**

Query rendered nodes inside `scope` before creating tweens. Animate only `autoAlpha`, `x`, `y`, `scale`, or `yPercent`. Do not target the persistent SVG from GSAP.

- [ ] **Step 5: Run motion and cleanup tests**

Run: `pnpm test src/components/home/scene-03-07-orbital-motion.test.tsx src/components/home/home-motion.test.tsx src/components/home/scene-01-orbital-motion.test.tsx src/components/home/scene-02-orbital-motion.test.tsx`

Expected: PASS with document-order ownership, no missing selector targets, and context cleanup on unmount.

- [ ] **Step 6: Commit motion ownership**

```bash
git add src/components/home/home-motion.tsx src/components/home/scene-03-07-orbital-motion.test.tsx
git add -p src/components/home/home-motion.test.tsx
git -c commit.gpgsign=false commit -m "feat: orchestrate remaining editorial scenes"
```

Stage only this plan's hunk from `home-motion.test.tsx`; leave the existing unrelated working-tree hunk unstaged.

---

### Task 4: Scene 03 Question Atlas

**Files:**
- Modify: `src/components/home/home-experience.tsx` (Scene 03 block)
- Modify: `src/components/home/home.module.css` (`.atlas*`, `.topicAtlas*`)
- Modify: `src/content/orbital-home.ts` (Scene 03 annotation labels)
- Create: `src/components/home/scene-03-layout.test.tsx`

**Interfaces:**
- Consumes: five existing `topicAtlas` entries and `data-scene="03"` progress.
- Produces: `data-scene-role="question-atlas"`, `data-pin="03"`, five `data-motion="atlas-topic"` entries, and one `data-atlas-index` annotation.

- [ ] **Step 1: Write the failing Scene 03 layout test**

```tsx
const scene = container.querySelector('[data-scene="03"]')!;
expect(scene).toHaveAttribute("data-scene-role", "question-atlas");
expect(scene.querySelector('[data-pin="03"]')).not.toBeNull();
expect(scene.querySelectorAll('[data-motion="atlas-topic"]')).toHaveLength(5);
expect(scene.querySelector('[data-atlas-index]')).not.toBeNull();
```

- [ ] **Step 2: Run the layout test and confirm failure**

Run: `pnpm test src/components/home/scene-03-layout.test.tsx`

Expected: FAIL because Scene 03 has no pinned viewport or atlas-specific hooks.

- [ ] **Step 3: Implement semantic Scene 03 markup**

Wrap the existing scene inner element in `atlasViewport` with `data-pin="03"`. Add the decorative index `CALORYTHM / QUESTION ATLAS 003` and `SORU → DOSYA`. Rename the item motion hook from `topic-atlas-item` to `atlas-topic`. Preserve the ordered list and all five Turkish titles/notes.

- [ ] **Step 4: Implement desktop and mobile art direction**

Desktop:

- ivory full-viewport pinned field;
- title in the upper-left editorial quadrant;
- five topic rows crossing the vertical rails;
- active row large, adjacent rows quieter;
- no rounded cards, shadows, or bento grid.

Mobile:

- no pin;
- one-column ordered list;
- static thin colored rail on the left;
- all notes visible.

- [ ] **Step 5: Run layout and content tests**

Run: `pnpm test src/components/home/scene-03-layout.test.tsx src/components/home/home-experience.test.tsx src/content/orbital-home.test.ts`

Expected: PASS with five semantic topic entries and unchanged reading copy.

- [ ] **Step 6: Commit Scene 03**

```bash
git add src/components/home/home-experience.tsx src/components/home/home.module.css src/content/orbital-home.ts src/components/home/scene-03-layout.test.tsx
git -c commit.gpgsign=false commit -m "feat: build the question atlas scene"
```

---

### Task 5: Scene 04 Understanding Frame and Scene 05 Dossier Seal

**Files:**
- Modify: `src/components/home/home-experience.tsx` (Scene 04 and Scene 05 blocks)
- Modify: `src/components/home/home.module.css` (`.thought*`, `.flagship*`)
- Modify: `src/content/orbital-home.ts` (evidence annotations and dossier metadata)
- Create: `src/components/home/scene-04-05-layout.test.tsx`

**Interfaces:**
- Produces Scene 04 hooks: `data-scene-role="understand-explain"`, `data-pin="04"`, `data-motion="evidence-fragment"`, `data-motion="thought-resolution"`.
- Produces Scene 05 hooks: `data-scene-role="dossier-seal"`, `data-pin="05"`, `data-motion="dossier-number"`, `data-motion="dossier-copy"`.

- [ ] **Step 1: Write failing semantic composition tests**

```tsx
expect(scene04).toHaveAttribute("data-scene-role", "understand-explain");
expect(scene04.querySelectorAll('[data-motion="evidence-fragment"]')).toHaveLength(4);
expect(scene04.querySelector('[data-motion="thought-resolution"]')).not.toBeNull();
expect(scene05).toHaveAttribute("data-scene-role", "dossier-seal");
expect(scene05.querySelector('[data-motion="dossier-number"]')).toHaveTextContent("001");
expect(scene05.querySelector('[aria-disabled="true"]')).toHaveTextContent("İlk dosya yakında");
```

- [ ] **Step 2: Run the tests and confirm failure**

Run: `pnpm test src/components/home/scene-04-05-layout.test.tsx`

Expected: FAIL because the evidence fragments, dossier number hook, and Scene 05 pin do not exist.

- [ ] **Step 3: Implement Scene 04 markup and styling**

Add four decorative evidence fragments: `KAYNAK`, `YÖNTEM`, `SINIR`, `BAĞLAM`. Keep the existing heading, body, and two-line emphasis. Use an ink background, ivory type, and orange final emphasis. The persistent paths supply the brackets; CSS must not draw duplicate bracket graphics.

- [ ] **Step 4: Implement Scene 05 markup and styling**

Add a large accessible-hidden decorative `001`, preserve the heading `İlk dosya hazırlanıyor.`, and keep the CTA disabled. Use coral as the ground with ink text. Keep `SORU · MEKANİZMA · KANIT · BAĞLAM` as the only process annotation.

- [ ] **Step 5: Run Scene 04–05 and accessibility regressions**

Run: `pnpm test src/components/home/scene-04-05-layout.test.tsx src/components/home/home-experience.test.tsx src/components/scenes/responsive-contract.test.ts`

Expected: PASS with correct headings, one disabled destination, and complete static reading content.

- [ ] **Step 6: Commit Scenes 04 and 05**

```bash
git add src/components/home/home-experience.tsx src/components/home/home.module.css src/content/orbital-home.ts src/components/home/scene-04-05-layout.test.tsx
git -c commit.gpgsign=false commit -m "feat: compose understanding and dossier scenes"
```

---

### Task 6: Scene 06 Journal Spine and Scene 07 Final Resolution

**Files:**
- Modify: `src/components/home/home-experience.tsx` (Scene 06 and Scene 07 blocks)
- Modify: `src/components/home/home-motion.tsx` (active topic index publication and final reveal targets)
- Modify: `src/components/home/home.module.css` (`.journal*`, `.finale*`)
- Create: `src/components/home/scene-06-07-layout.test.tsx`

**Interfaces:**
- Produces Scene 06 hooks: `data-scene-role="journal-spine"`, `data-journal-spine`, eight `data-motion="journal-topic"` items, and `data-topic-index` values `0` through `7`.
- Produces Scene 07 hooks: `data-scene-role="brand-resolution"`, `data-pin="07"`, `data-motion="finale-copy"`, and `data-motion="finale-footer"`.

- [ ] **Step 1: Write failing Journal and Final layout tests**

```tsx
expect(scene06).toHaveAttribute("data-scene-role", "journal-spine");
expect(scene06.querySelector('[data-journal-spine]')).not.toBeNull();
expect(scene06.querySelectorAll('[data-topic-index]')).toHaveLength(8);
expect(scene07).toHaveAttribute("data-scene-role", "brand-resolution");
expect(scene07.querySelector('[data-pin="07"]')).not.toBeNull();
expect(scene07.querySelector('[data-motion="finale-footer"]')).not.toBeNull();
```

- [ ] **Step 2: Run the layout test and confirm failure**

Run: `pnpm test src/components/home/scene-06-07-layout.test.tsx`

Expected: FAIL because the spine, final pin, and final reveal hooks do not exist.

- [ ] **Step 3: Implement Journal spine markup and active-topic contract**

Keep the sticky lead and semantic ordered list. Add `data-topic-index={index}`. When a topic becomes active, update its existing `data-active` attribute and publish topic focus as `index / 7` through the Scene 06 base progress resolver. Do not create per-topic orbital SVGs.

- [ ] **Step 4: Implement Journal and Final art direction**

Journal:

- ivory background;
- thin vertical four-thread spine behind the list;
- active topic grows and adopts its path tone;
- inactive topics retain sufficient contrast.

Final:

- centered ring stage on ivory;
- large contribution message behind/within the ring composition;
- official wordmark and footer reveal after ring closure;
- CTA remains an ordinary valid anchor to `#journal`.

- [ ] **Step 5: Run Scene 06–07 and navigation tests**

Run: `pnpm test src/components/home/scene-06-07-layout.test.tsx src/components/home/home-experience.test.tsx src/components/home/home-motion.test.tsx`

Expected: PASS with eight topics, one valid final CTA, one official stage, and no missing animation targets.

- [ ] **Step 6: Commit Scenes 06 and 07**

```bash
git add src/components/home/home-experience.tsx src/components/home/home-motion.tsx src/components/home/home.module.css src/components/home/scene-06-07-layout.test.tsx
git -c commit.gpgsign=false commit -m "feat: finish journal spine and brand resolution"
```

---

### Task 7: Responsive, Reduced Motion, and Final Verification

**Files:**
- Modify: `src/components/home/home.module.css` (responsive and reduced-motion blocks)
- Modify only if required by a failing regression: `src/components/home/orbital-thread-stage.tsx`
- Test: all files under `src/**/*.test.ts` and `src/**/*.test.tsx`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a complete desktop prototype with readable mobile/reduced-motion fallbacks and a verified production build.

- [ ] **Step 1: Add failing responsive contract assertions**

Extend `src/components/scenes/responsive-contract.test.ts` only if its current assertions do not cover the new scene hooks. Assert that mobile CSS disables pin-dependent positioning and makes topic/proof/evidence structures linear.

```ts
expect(mobileRules).toContain(".atlasViewport");
expect(mobileRules).toContain(".journalTopics");
expect(mobileRules).toContain(".finaleViewport");
```

- [ ] **Step 2: Run responsive and reduced-motion tests**

Run: `pnpm test src/components/scenes/responsive-contract.test.ts src/components/motion/motion-profile.test.ts src/components/home/home-motion.test.tsx`

Expected: FAIL only for missing new mobile rules; existing reduced-motion runtime tests remain green.

- [ ] **Step 3: Complete mobile and reduced-motion CSS**

At `max-width: 47.9375rem`:

- set remaining viewport wrappers to `min-height: auto`;
- convert all absolute editorial stops and annotations into document-flow blocks;
- hide decorative mono labels that collide with reading content;
- retain visible section numbers, headings, bodies, lists, and CTAs;
- use static borders/rails only where the persistent stage does not animate.

Inside `@media (prefers-reduced-motion: reduce)`, disable continuous CSS animation and transitions for new scene elements.

- [ ] **Step 4: Run the complete test suite**

Run: `pnpm test`

Expected: all test files and tests pass with zero failures.

- [ ] **Step 5: Run lint, production build, and diff checks**

Run:

```bash
pnpm lint
pnpm build
git diff --check
```

Expected: all commands exit `0`; Next.js statically generates `/` and `/_not-found`.

- [ ] **Step 6: Inspect staged scope and preserve unrelated files**

Run:

```bash
git status --short
git diff --cached --stat
```

Confirm that `next.config.ts`, the existing unrelated hunk in `home-motion.test.tsx`, `src/components/three/rhythm-geometry.test.ts`, `vitest.setup.ts`, generated artifacts, assets, and user documents remain unstaged unless a preceding task explicitly required a small plan-owned hunk.

- [ ] **Step 7: Commit final responsive changes and push**

```bash
git add src/components/home/home.module.css src/components/scenes/responsive-contract.test.ts
git -c commit.gpgsign=false commit -m "refine remaining scenes across responsive profiles"
git push origin feat/home-scenes-01-03
```

- [ ] **Step 8: Report verification evidence**

Report the exact test count, lint result, build result, final commit hash, pushed branch, and `http://localhost:3000` preview URL. Do not claim visual approval; the user will review each section afterward.
