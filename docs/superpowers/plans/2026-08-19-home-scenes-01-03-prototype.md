# CALORYTHM Homepage Scenes 01–03 Visual Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Awwwards-level, production-shaped visual prototype of CALORYTHM homepage Scenes 01–03 without implementing the rest of V1.

**Architecture:** Render the Turkish editorial content as semantic server components, then progressively enhance it with three isolated client systems: one persistent React Three Fiber brand canvas, one GSAP/ScrollTrigger scene orchestrator, and one lightweight Canvas response field. Typed content, pure graphics-quality decisions, and a tiny scene-state store keep copy and visual behavior independent while preserving a clean path to the complete V1.

**Tech Stack:** Next.js App Router, TypeScript strict mode, Tailwind CSS, CSS Modules, React Three Fiber / Three.js, GSAP ScrollTrigger, Vitest, Testing Library, self-hosted Fontsource packages.

**Spec:** `docs/superpowers/specs/2026-08-19-calorythm-v1-design.md`

## Global Constraints

- Implement only homepage Scenes 01–03: Uyanış, Madde, and Cevap.
- Do not implement Journal, Topics, About, the flagship article, authentication, payments, subscriptions, appointments, dashboards, or calorie tracking.
- All visible copy is Turkish.
- Palette tokens are exactly Carbon `#11110F`, Bone `#ECE7DC`, Mineral `#98968E`, Protein Coral `#F05A42`, Carbohydrate Solar `#D8F34A`, and Fat Ultramarine `#5367E8`.
- Typography is Bodoni Moda Variable for editorial display, Manrope Variable for body/UI/wordmark, and IBM Plex Mono for scientific annotations.
- Native scrolling remains in V1; do not add Lenis.
- Server Components are the default. Only the canvas, timeline orchestrator, quality detection, and active interaction layers may be Client Components.
- WebGL and motion are progressive enhancement. Text, images, links, and narrative order must remain complete without them.
- `prefers-reduced-motion` removes pinning, kinetic typography, continuous camera motion, and particle animation.
- Desktop direction is composed at 1440px and validated from 1024px upward; mobile is independently composed from 320px upward.
- Avoid clinic, wellness, fitness-influencer, generic SaaS, glassmorphism, bento, neon-orb, heartbeat, molecule-icon, DNA-helix, and decorative-blob aesthetics.
- The current workspace does not permit creation of `.git`; execute documented commit checkpoints only if a writable Git repository becomes available.

## File Structure

```text
package.json                         Project scripts and dependencies
next.config.ts                      Next image/build configuration
tsconfig.json                       Strict TypeScript configuration
eslint.config.mjs                   Next lint configuration
postcss.config.mjs                  Tailwind PostCSS integration
vitest.config.ts                    Unit/component test environment
vitest.setup.ts                     DOM matchers and browser API shims
public/images/matter-source.webp    Original Scene 02 macro editorial image
src/app/layout.tsx                  Fonts, metadata, global document shell
src/app/page.tsx                    Server-rendered homepage composition
src/app/globals.css                 Tokens, reset, type scale, global states
src/content/home.ts                 Typed Turkish content for Scenes 01–03
src/content/home.test.ts            Content-contract tests
src/lib/graphics-quality.ts         Pure WebGL/particle quality selection
src/lib/graphics-quality.test.ts    Quality-tier tests
src/components/layout/site-header.tsx
src/components/scenes/scene-01-hero.tsx
src/components/scenes/scene-02-matter.tsx
src/components/scenes/scene-03-response.tsx
src/components/scenes/home-scenes.module.css
src/components/scenes/scenes.test.tsx
src/components/motion/motion-profile.ts
src/components/motion/motion-profile.test.ts
src/components/motion/scene-state-store.ts
src/components/motion/scene-state-store.test.ts
src/components/motion/home-scene-orchestrator.tsx
src/components/three/rhythm-geometry.ts
src/components/three/rhythm-geometry.test.ts
src/components/three/living-rhythm.tsx
src/components/three/rhythm-stage.tsx
src/components/response/response-model.ts
src/components/response/response-model.test.ts
src/components/response/response-field.tsx
```

---

### Task 1: Bootstrap the production-shaped Next.js and test foundation

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `src/lib/graphics-quality.test.ts`
- Create: `src/lib/graphics-quality.ts`

**Interfaces:**
- Consumes: none; this is the project foundation.
- Produces: `GraphicsQuality`, `GraphicsProfileInput`, and `deriveGraphicsQuality(input)` for canvas and particle clients.

- [ ] **Step 1: Create the dependency manifest and install locked dependencies**

Create `package.json` with scripts before installation:

```json
{
  "name": "calorythm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Install runtime dependencies:

```bash
pnpm add next@latest react@latest react-dom@latest three @react-three/fiber @react-three/drei gsap @fontsource-variable/bodoni-moda @fontsource-variable/manrope @fontsource/ibm-plex-mono
```

Install development dependencies:

```bash
pnpm add -D typescript @types/node @types/react @types/react-dom @types/three tailwindcss @tailwindcss/postcss eslint eslint-config-next vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add strict framework and test configuration**

Configure `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`, the `@/* -> ./src/*` alias, Next plugins, and no emit. Configure Tailwind through `@tailwindcss/postcss`. Configure Vitest with jsdom, the React plugin, the same `@` alias, and `vitest.setup.ts`.

`vitest.setup.ts` must contain:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write the failing graphics quality tests**

```ts
import { describe, expect, it } from "vitest";
import { deriveGraphicsQuality } from "./graphics-quality";

describe("deriveGraphicsQuality", () => {
  it("returns static for reduced motion or data saving", () => {
    expect(deriveGraphicsQuality({ width: 1440, dpr: 2, reducedMotion: true, saveData: false, deviceMemory: 8 })).toBe("static");
    expect(deriveGraphicsQuality({ width: 1440, dpr: 2, reducedMotion: false, saveData: true, deviceMemory: 8 })).toBe("static");
  });

  it("returns low for narrow or constrained devices", () => {
    expect(deriveGraphicsQuality({ width: 390, dpr: 3, reducedMotion: false, saveData: false, deviceMemory: 8 })).toBe("low");
    expect(deriveGraphicsQuality({ width: 1280, dpr: 2, reducedMotion: false, saveData: false, deviceMemory: 2 })).toBe("low");
  });

  it("returns high for capable desktop profiles", () => {
    expect(deriveGraphicsQuality({ width: 1440, dpr: 2, reducedMotion: false, saveData: false, deviceMemory: 8 })).toBe("high");
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test -- src/lib/graphics-quality.test.ts`  
Expected: FAIL because `graphics-quality.ts` does not exist.

- [ ] **Step 5: Implement the pure quality contract**

```ts
export type GraphicsQuality = "static" | "low" | "high";

export type GraphicsProfileInput = {
  width: number;
  dpr: number;
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory?: number;
};

export function deriveGraphicsQuality(input: GraphicsProfileInput): GraphicsQuality {
  if (input.reducedMotion || input.saveData) return "static";
  if (input.width < 768 || (input.deviceMemory !== undefined && input.deviceMemory <= 4)) return "low";
  return "high";
}
```

- [ ] **Step 6: Add the minimal application shell**

`layout.tsx` imports the Fontsource CSS, declares Turkish metadata, sets `<html lang="tr">`, adds a skip link, and renders the body. `page.tsx` temporarily renders `<main id="ana-icerik"><h1>CALORYTHM</h1></main>`. `globals.css` imports Tailwind and defines the six exact palette variables.

- [ ] **Step 7: Verify the foundation**

Run: `pnpm test && pnpm lint && pnpm build`  
Expected: all commands pass; production output contains the root route.

- [ ] **Step 8: Commit the foundation if version control is writable**

```bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json eslint.config.mjs postcss.config.mjs vitest.config.ts vitest.setup.ts src/app src/lib
git commit -m "chore: establish calorythm prototype foundation"
```

---

### Task 2: Establish typed Turkish content and semantic scene markup

**Files:**
- Create: `src/content/home.ts`
- Test: `src/content/home.test.ts`
- Create: `src/components/layout/site-header.tsx`
- Create: `src/components/scenes/scene-01-hero.tsx`
- Create: `src/components/scenes/scene-02-matter.tsx`
- Create: `src/components/scenes/scene-03-response.tsx`
- Create: `src/components/scenes/home-scenes.module.css`
- Test: `src/components/scenes/scenes.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: global font and colour variables from Task 1.
- Produces: `homeContent`, three semantic scene components, stable `data-scene="01|02|03"` hooks, and `data-motion` hooks for later orchestration.

- [ ] **Step 1: Write the failing content contract test**

```ts
import { describe, expect, it } from "vitest";
import { homeContent } from "./home";

describe("homeContent", () => {
  it("contains the approved Turkish narrative in scene order", () => {
    expect(homeContent.hero.title).toBe("Beslenmenin bir ritmi var.");
    expect(homeContent.matter.title).toBe("Yediğin şey, bir sayıdan fazlası.");
    expect(homeContent.response.title).toBe("Beden sadece almaz. Cevap verir.");
    expect(homeContent.response.concepts).toEqual([
      "Enerji", "Sindirim", "Emilim", "Depolama", "Hareket", "Toparlanma",
    ]);
  });
});
```

- [ ] **Step 2: Run the content test and confirm failure**

Run: `pnpm test -- src/content/home.test.ts`  
Expected: FAIL because the content module does not exist.

- [ ] **Step 3: Implement the typed content record**

```ts
export const homeContent = {
  hero: {
    eyebrow: "Bağımsız beslenme yayını · İstanbul",
    title: "Beslenmenin bir ritmi var.",
    description: "Beslenme, metabolizma ve insan bedenini farklı bir şekilde keşfet.",
    cta: "Keşfet",
  },
  matter: {
    index: "Sahne 02 · Madde",
    title: "Yediğin şey, bir sayıdan fazlası.",
    body: "Bir etiket miktarı söyler. Beden ise yapıyı, zamanı, bağlamı ve ihtiyacı birlikte okur.",
    annotations: ["247 kcal", "12,4 g protein", "38,1 g karbonhidrat"],
  },
  response: {
    index: "Sahne 03 · Cevap",
    title: "Beden sadece almaz. Cevap verir.",
    body: "Her lokma, tek yönlü bir giriş değil; dönüştürülen, paylaştırılan ve yeniden dengelenen bir sinyaldir.",
    concepts: ["Enerji", "Sindirim", "Emilim", "Depolama", "Hareket", "Toparlanma"],
  },
} as const;
```

- [ ] **Step 4: Write failing semantic scene tests**

Render each scene with Testing Library. Assert one page H1 across the composition, Scene 02 and 03 H2 headings, an anchor with accessible name “Keşfet” targeting `#madde`, an `aria-label` for each scene, and all six response concepts present as text.

- [ ] **Step 5: Implement server-rendered scenes and header**

The header contains the wordmark and non-functional prototype labels “Journal”, “Konular”, and “Hakkında” marked `aria-disabled="true"` so the prototype does not link to unbuilt routes. The three scene components use semantic `<section>` elements, stable IDs `uyanış`, `madde`, `cevap`, and only presentational `data-motion` attributes. The response title must be authored as two visual lines while retaining one accessible sentence.

- [ ] **Step 6: Compose the page and pass the semantic tests**

`page.tsx` renders the header, all scenes in order, and no V1 route outside scope. Run:

```bash
pnpm test -- src/content/home.test.ts src/components/scenes/scenes.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the semantic slice if version control is writable**

```bash
git add src/content src/components/layout src/components/scenes src/app/page.tsx
git commit -m "feat: add semantic homepage prototype scenes"
```

---

### Task 3: Create the Scene 02 editorial matter asset and visual foundation

**Files:**
- Create: `public/images/matter-source.webp`
- Modify: `src/components/scenes/scene-02-matter.tsx`
- Modify: `src/components/scenes/home-scenes.module.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Scene 02 copy and stable motion hooks from Task 2.
- Produces: one original responsive editorial image used through multiple CSS crops; no extra stock library.

- [ ] **Step 1: Load and follow the `imagegen` skill**

Use the image generation tool for the original asset. Do not author an SVG illustration and do not use a generic healthy-food stock photograph.

- [ ] **Step 2: Generate exactly one primary Scene 02 composition**

Use this prompt:

```text
Create one premium editorial food macro photograph for CALORYTHM, a Turkish independent nutrition-science publication. Extreme close-up physical still life where torn dark sourdough crumb, translucent ruby citrus pulp, and a thin glossy olive-oil membrane meet as one continuous tactile landscape. It must feel materially real, sophisticated, slightly strange, and scientific without showing laboratory equipment. Hard directional side light, deep charcoal negative space, restrained warm highlights, visible fibres, pores, translucency and surface tension. Landscape 4:3 composition with useful crop zones on left, center and right. No plate, no salad, no avocado, no cutlery, no hands, no text, no logos, no supplements, no fitness imagery, no clinical imagery, no gradient orb, no decorative blob.
```

- [ ] **Step 3: Inspect and validate the result**

View the generated image at full frame. Reject and retry once only if it contains invented text, a visible plate/hand, wellness styling, physically broken food forms, or lacks usable crop zones. Save the accepted source as `public/images/matter-source.webp` with a minimum long edge of 1800px.

- [ ] **Step 4: Build the static editorial composition**

Use `next/image` once as the source image and reveal it through three sharply bounded crop windows driven by CSS custom properties. Place numeric annotations in IBM Plex Mono outside the image, with thin rules and baseline alignment. Do not place copy inside rounded cards.

- [ ] **Step 5: Add the static first visual direction**

In `globals.css` and the CSS module, implement:

- fluid headline scale with `clamp()`;
- Carbon/Bone scene fields;
- a 12-column desktop composition;
- sharp image crops;
- subtle print-like grain using a small CSS background pattern, not a downloaded texture;
- visible focus styling;
- a mobile composition that stacks text and crops without horizontal overflow.

- [ ] **Step 6: Validate the first meaningful preview**

Run the development server, request `/`, and confirm a successful compile. Open the local preview only after the hero typography, Scene 02 image composition, and Scene 03 static narrative are all recognizable as CALORYTHM.

- [ ] **Step 7: Commit the art-direction foundation if version control is writable**

```bash
git add public/images src/components/scenes src/app/globals.css
git commit -m "feat: establish calorythm editorial art direction"
```

---

### Task 4: Build the persistent woven living-rhythm WebGL motif

**Files:**
- Test: `src/components/three/rhythm-geometry.test.ts`
- Create: `src/components/three/rhythm-geometry.ts`
- Create: `src/components/three/living-rhythm.tsx`
- Create: `src/components/three/rhythm-stage.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/scenes/home-scenes.module.css`

**Interfaces:**
- Consumes: `GraphicsQuality` from Task 1.
- Produces: `createRhythmCurves(options)`, `LivingRhythm({ scene, progress, quality })`, and a dynamically loaded `RhythmStage` with a 2D fallback. Task 4 renders the default Scene 01 state; Task 5 connects the live scene store.

- [ ] **Step 1: Write the failing deterministic geometry test**

```ts
import { describe, expect, it } from "vitest";
import { createRhythmCurves } from "./rhythm-geometry";

describe("createRhythmCurves", () => {
  it("creates closed, offset strands without invalid coordinates", () => {
    const curves = createRhythmCurves({ strands: 7, segments: 96 });
    expect(curves).toHaveLength(7);
    for (const curve of curves) {
      expect(curve.closed).toBe(true);
      expect(curve.getPoints(12).every((point) => Number.isFinite(point.length()))).toBe(true);
    }
    expect(curves[0]?.getPoint(0).equals(curves[1]!.getPoint(0))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the geometry test and confirm failure**

Run: `pnpm test -- src/components/three/rhythm-geometry.test.ts`  
Expected: FAIL because the geometry module does not exist.

- [ ] **Step 3: Implement woven closed curves**

Create seven `THREE.CatmullRomCurve3` strands. Sample each around a closed `0..2π` loop, offset by strand phase, and combine an elliptical orbit with two- and three-frequency vertical/depth oscillation. Use deterministic math only—no runtime randomness—so the form is stable during hydration and testing.

The exported signature is:

```ts
export type RhythmCurveOptions = { strands: number; segments: number };
export function createRhythmCurves(options: RhythmCurveOptions): THREE.CatmullRomCurve3[];
```

- [ ] **Step 4: Implement the living form**

`LivingRhythm` accepts `scene: 1 | 2 | 3`, `progress: number`, and `quality: GraphicsQuality`, then maps each curve to a `tubeGeometry`. High quality uses 96 tubular segments, low quality uses 48; both use a restrained radial segment count. Alternate Bone, Protein Coral, and desaturated Mineral materials with physical roughness and no glass/transmission effect. `useFrame` applies a slow asymmetric breathing scale and fractional rotation; it must never resemble a music visualizer. Task 4 calls it with `scene={1}` and `progress={0}`.

- [ ] **Step 5: Implement the persistent stage and fallback**

`RhythmStage`:

- derives quality from viewport, motion preference, Save Data, and optional device memory;
- renders an accessible decorative wrapper with `aria-hidden="true"`;
- uses one fixed canvas across all three scenes;
- caps DPR at 1.5 high / 1 low;
- pauses rendering while the page is hidden;
- renders a CSS still made of intersecting fibrous bands when quality is `static` or WebGL initialization fails.

Its initial public props are optional `scene` and `progress` values defaulting to `1` and `0`, so the visual is independently usable before the Task 5 store connection.

- [ ] **Step 6: Add the stage behind the server-rendered scenes**

Dynamically import the stage with SSR disabled from a small client boundary. Keep the server-rendered heading and CTA above it in the stacking order.

- [ ] **Step 7: Verify unit and production behavior**

Run: `pnpm test -- src/components/three/rhythm-geometry.test.ts && pnpm build`  
Expected: PASS with no server-side `window` or WebGL errors.

- [ ] **Step 8: Commit the brand motif if version control is writable**

```bash
git add src/components/three src/app/page.tsx src/components/scenes/home-scenes.module.css
git commit -m "feat: add living rhythm brand motif"
```

---

### Task 5: Implement the scene-state contract and GSAP narrative choreography

**Files:**
- Test: `src/components/motion/scene-state-store.test.ts`
- Create: `src/components/motion/scene-state-store.ts`
- Test: `src/components/motion/motion-profile.test.ts`
- Create: `src/components/motion/motion-profile.ts`
- Create: `src/components/motion/home-scene-orchestrator.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/three/living-rhythm.tsx`
- Modify: `src/components/scenes/home-scenes.module.css`

**Interfaces:**
- Consumes: stable `data-scene` and `data-motion` attributes from Task 2.
- Produces: `SceneState`, `getSceneState()`, `setSceneState(next)`, `subscribeSceneState(listener)`, `readMotionProfile()`, and the orchestration client.

- [ ] **Step 1: Write the failing external-store test**

```ts
import { describe, expect, it, vi } from "vitest";
import { getSceneState, setSceneState, subscribeSceneState } from "./scene-state-store";

describe("scene state store", () => {
  it("publishes clamped scene progress only when state changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSceneState(listener);
    setSceneState({ scene: 2, progress: 1.4 });
    expect(getSceneState()).toEqual({ scene: 2, progress: 1 });
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
```

- [ ] **Step 2: Implement and test the scene store**

Use a module-local state object and `Set<() => void>`. Accept only scene `1 | 2 | 3`, clamp progress to `0..1`, avoid notifications for equal state, and expose the three exact functions in the Interfaces block.

- [ ] **Step 3: Write and implement motion-profile tests**

Test that reduced-motion and Save Data produce a profile with `animate: false` and `pin: false`; desktop default produces `animate: true`, `pin: true`; mobile produces `animate: true`, `pin: false`. Keep environment reading in one injectable function so the decision remains unit testable.

- [ ] **Step 4: Implement GSAP orchestration**

In one client component:

- dynamically import GSAP and ScrollTrigger inside `useEffect`;
- scope all selectors with `gsap.context()`;
- use `gsap.matchMedia()` for desktop, mobile, and reduced-motion branches;
- Scene 01 reveals wordmark, title, description, CTA, then opens the woven form;
- Scene 02 uses one controlled pin only on desktop, moves image crop boundaries, and separates numeric labels from the food surface;
- Scene 03 dissolves the image edge into the response field and reveals concepts in a paced sequence;
- update the scene store from ScrollTrigger callbacks;
- clean up context, matchMedia, triggers, and listeners on unmount.

- [ ] **Step 5: Connect the WebGL form to scene state**

Use `useSyncExternalStore` in `LivingRhythm`. Scene 01 breathes as one woven organism; Scene 02 moves slightly behind the image plane and separates its strands; Scene 03 stretches strands toward directed flow. Interpolate material colours and transforms in `useFrame`; do not remount geometry.

- [ ] **Step 6: Add reduced-motion authored states**

When motion is reduced, do not create ScrollTriggers. Set all copy and concepts visible, show one static Scene 02 crop, and keep the CSS fibrous still in place of continuous WebGL.

- [ ] **Step 7: Run motion tests and build**

Run: `pnpm test -- src/components/motion && pnpm build`  
Expected: PASS; no leaked browser globals in server modules.

- [ ] **Step 8: Commit choreography if version control is writable**

```bash
git add src/components/motion src/components/three src/components/scenes src/app/page.tsx
git commit -m "feat: choreograph homepage prototype narrative"
```

---

### Task 6: Build the lightweight Scene 03 response field

**Files:**
- Test: `src/components/response/response-model.test.ts`
- Create: `src/components/response/response-model.ts`
- Create: `src/components/response/response-field.tsx`
- Modify: `src/components/scenes/scene-03-response.tsx`
- Modify: `src/components/scenes/home-scenes.module.css`

**Interfaces:**
- Consumes: `GraphicsQuality`, Scene 03 progress, and the six DOM concept labels.
- Produces: `createResponseParticles(options)`, `advanceResponseParticle(particle, time, intensity)`, and `ResponseField`.

- [ ] **Step 1: Write the failing deterministic particle-model test**

```ts
import { describe, expect, it } from "vitest";
import { advanceResponseParticle, createResponseParticles } from "./response-model";

describe("response particle model", () => {
  it("creates a deterministic bounded field", () => {
    const first = createResponseParticles({ count: 12, seed: 42 });
    const second = createResponseParticles({ count: 12, seed: 42 });
    expect(first).toEqual(second);
    expect(first.every((particle) => particle.x >= 0 && particle.x <= 1)).toBe(true);
  });

  it("does not move when intensity is zero", () => {
    const particle = createResponseParticles({ count: 1, seed: 7 })[0]!;
    expect(advanceResponseParticle(particle, 2, 0)).toEqual(particle);
  });
});
```

- [ ] **Step 2: Implement the pure response model**

Use a small seeded linear-congruential generator. A particle contains normalized `x`, `y`, `phase`, `speed`, `radius`, and one palette index. `advanceResponseParticle` applies horizontal transfer and a low-amplitude sine path, wrapping normalized coordinates without allocation-heavy object graphs.

- [ ] **Step 3: Implement the Canvas renderer**

`ResponseField` uses `ResizeObserver`, `IntersectionObserver`, and one requestAnimationFrame loop. It renders 64 particles high, 28 low, and no canvas for static quality. It caps canvas DPR, pauses while off-screen or the document is hidden, and reads Scene 03 intensity from the external store without forcing the server scene to become a client component.

- [ ] **Step 4: Compose labels with the field**

Keep concepts as real DOM text positioned around the field. Use fine connector rules and mono indices, not icons. The canvas is decorative and receives `aria-hidden="true"`; the section copy carries all meaning.

- [ ] **Step 5: Pass model, component, and build checks**

Run: `pnpm test -- src/components/response src/components/scenes/scenes.test.tsx && pnpm build`  
Expected: PASS.

- [ ] **Step 6: Commit Scene 03 if version control is writable**

```bash
git add src/components/response src/components/scenes
git commit -m "feat: add responsive body response field"
```

---

### Task 7: Independently art-direct mobile, reduced motion, and accessibility

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/scenes/home-scenes.module.css`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/components/motion/home-scene-orchestrator.tsx`
- Modify: `src/components/three/rhythm-stage.tsx`
- Modify: `src/components/response/response-field.tsx`
- Test: `src/components/scenes/scenes.test.tsx`

**Interfaces:**
- Consumes: all completed prototype systems.
- Produces: final responsive and accessibility behavior for the first three scenes.

- [ ] **Step 1: Extend accessibility tests before styling fixes**

Add assertions for:

- `<html lang="tr">` through layout metadata inspection;
- one main landmark and one H1;
- a working skip-link target;
- descriptive Scene 02 alt text;
- decorative canvas wrappers hidden from assistive technology;
- no active links to unbuilt routes;
- all six concepts present without canvas execution.

- [ ] **Step 2: Implement the 320–767px mobile composition**

- Use `100svh` only where it cannot crop content; otherwise use content-driven minimum heights.
- Keep the hero wordmark readable without splitting `CALORYTHM`.
- Move the living form behind and below the headline rather than shrinking the desktop center composition.
- Turn Scene 02's three crops into one tall crop with two offset detail windows.
- Keep Scene 03 concepts in a two-column textual rhythm with the field behind them.
- Remove desktop pins and hover dependencies.

- [ ] **Step 3: Implement the tablet and desktop composition**

Validate deliberate layout states at 1024px, 1280px, and 1440px. Cap the main reading measure, preserve the 12-column alignment, and ensure that oversized Bodoni headlines never hide required words.

- [ ] **Step 4: Implement reduced-motion CSS and runtime behavior**

Add a `@media (prefers-reduced-motion: reduce)` layer that removes transition/animation duration where motion is non-essential, disables smooth scrolling, shows final content opacity/transforms, and preserves visible focus. Runtime systems must use the same preference to avoid canvas loops and ScrollTrigger setup.

- [ ] **Step 5: Verify focus and contrast manually**

Tab from the skip link through the hero CTA and header labels. Confirm a visible Bone/Solar focus treatment against Carbon. Check that Mineral is not used for small essential copy where contrast is insufficient; promote such copy to Bone.

- [ ] **Step 6: Run all automated checks**

Run: `pnpm test && pnpm lint && pnpm build`  
Expected: PASS.

- [ ] **Step 7: Commit responsive/accessibility polish if version control is writable**

```bash
git add src/app src/components
git commit -m "feat: refine prototype across motion and device profiles"
```

---

### Task 8: Perform browser-led art-direction and performance verification

**Files:**
- Modify only when a verified visual, accessibility, runtime, or performance defect is found.

**Interfaces:**
- Consumes: the complete Scene 01–03 prototype.
- Produces: a verified local visual prototype with documented checks and no known blocking defects.

- [ ] **Step 1: Load and follow the `playwright` skill**

Use the real browser workflow for inspection. Reuse one local server and one browser session; do not repeatedly open new tabs or servers.

- [ ] **Step 2: Inspect the desktop narrative at 1440×1000**

Verify:

- the first viewport reads as an independent editorial publication;
- the woven form is clearly fibrous and not a blob/orb;
- title, form, CTA, and annotation hierarchy is legible;
- the Scene 01→02 handoff introduces real food matter;
- Scene 02 crop motion explains “number versus matter”;
- Scene 03 concepts enter as part of one response system;
- no animation obscures copy or creates abrupt scroll jumps.

Capture one full-page and one hero screenshot for review.

- [ ] **Step 3: Inspect mobile at 390×844 and narrow mobile at 320×700**

Verify no horizontal overflow, clipped Turkish words, hover-only information, excessive pinned distance, overlapping concept labels, or illegible image crops. Capture one representative mobile screenshot.

- [ ] **Step 4: Inspect reduced motion and fallback behavior**

Emulate `prefers-reduced-motion: reduce` and confirm the narrative is complete with no pinning or continuous canvas animation. Disable WebGL or force static quality and confirm the CSS fibrous fallback occupies the intended composition without console errors.

- [ ] **Step 5: Inspect runtime and loading behavior**

Confirm:

- no console errors or hydration warnings;
- initial text renders before WebGL enhancement;
- Scene 02 image reserves dimensions and loads responsively;
- continuous canvas work pauses off-screen or on hidden tabs;
- first-load assets do not include a model, video, or unused image library.

- [ ] **Step 6: Fix only evidence-backed defects and rerun affected checks**

For every fix, record the observed defect, change the smallest responsible component, rerun its unit test, and repeat the exact browser state that exposed it. Do not add Scene 04 or new product features during polish.

- [ ] **Step 7: Run the final verification set**

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all pass after browser inspection.

- [ ] **Step 8: Commit final prototype verification fixes if version control is writable**

```bash
git add src public package.json pnpm-lock.yaml
git commit -m "fix: complete homepage visual prototype verification"
```
