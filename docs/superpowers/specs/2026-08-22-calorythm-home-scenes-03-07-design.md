# CALORYTHM Homepage Scenes 03–07 Design

**Date:** 2026-08-22
**Status:** Approved direction, pending implementation-plan approval

## Objective

Complete the remaining CALORYTHM homepage narrative as one continuous editorial experience. Scenes 03–07 must extend the established four-thread orbital identity without introducing cloned rings, unrelated decorative motifs, generic cards, or section-local animation systems.

The result should make the homepage feel like a nutrition publication with a coherent visual argument:

1. identify noisy information;
2. evaluate claims;
3. choose a question;
4. understand and explain it;
5. prepare a dossier;
6. grow an editorial archive;
7. return to the CALORYTHM identity.

## Scope

This phase includes:

- Scene 03 — topic atlas and question selection;
- Scene 04 — understanding and explaining;
- Scene 05 — first-dossier preview;
- Scene 06 — journal and topic archive;
- Scene 07 — final brand resolution;
- persistent orbital geometry and transitions for Scenes 03–07;
- scene-specific Leva controls;
- desktop scroll choreography;
- simplified mobile and reduced-motion presentations;
- automated geometry, layout, motion, and regression coverage.

This phase does not include:

- a finished flagship article;
- naming a first article before the editorial topic is selected;
- Journal, Topics, About, authentication, payment, or CMS routes;
- Three.js, WebGL, video, or new raster assets;
- copy changes outside minor labels required by the compositions.

## Chosen Approach

Use the existing four-path SVG as a single persistent visual narrator across the entire homepage.

Rejected alternatives:

- **Section-local SVG motifs:** faster to compose, but breaks continuity and duplicates the brand mark.
- **Hybrid continuity:** keeps the threads only in selected scenes, but makes the middle and end of the page feel like unrelated landing-page sections.

The persistent approach requires more geometry work, but best serves the brand promise and the user's direction that the same threads should continue throughout the site.

## Visual System

Existing tokens remain authoritative:

- Ivory: `#F6F1E8`
- Ink: `#20211E`
- Orange: `#F3A65A`
- Coral: `#EA735D`
- Ochre: `#C79A45`
- Olive: `#A7BE89`

Typography remains:

- Bodoni Moda Variable for editorial display text;
- Manrope Variable for reading copy;
- IBM Plex Mono for indices, evidence labels, and annotations.

The four colored paths remain independently configurable and never merge into a single gradient stroke. Their spacing, width, route depth, and transition pacing remain adjustable through Leva.

## Scene Architecture

### Scene 03 — Question Atlas

**Editorial idea:** A dossier begins by choosing one clear question.

The Scene 02 proof route rotates and opens into a full-height scanning field. The four paths become parallel vertical rails. The five topic entries — Metabolizma, Enerji Dengesi, Lif, Hidrasyon, and Mikro Besinler — pass through the field as an editorial index rather than a card grid.

Desktop behavior:

- pin for approximately `220%` viewport scroll;
- activate one topic at a time;
- move a small cross-rail marker to the active topic;
- enlarge the active topic while adjacent topics remain readable but quieter;
- publish normalized Scene 03 progress to the orbital store.

The scene uses an ivory ground. The rails sit behind the type with multiply blending and controlled glow.

### Scene 04 — Understand, Then Explain

**Editorial idea:** Accurate information deserves deliberate explanation.

The vertical rails fold inward on an ink background and become two large open editorial brackets. Scattered evidence annotations align into the sentence pair:

> Önce doğru anla.
> Sonra iyi anlat.

Desktop behavior:

- pin for approximately `180%` viewport scroll;
- background transitions from ivory to ink at the scene boundary;
- title and body resolve first;
- evidence fragments align second;
- the orange resolution line lands last;
- publish normalized Scene 04 progress.

The brackets remain open paths so the shape reads as editorial framing rather than another logo reveal.

### Scene 05 — Dossier 001

**Editorial idea:** The first CALORYTHM dossier is being prepared, but its subject is not fabricated before selection.

The brackets curl into a large asymmetric dossier seal on a coral ground. `001` is the primary visual anchor. The four paths orbit the number at slightly different radii and then settle into an editorial registration mark.

Desktop behavior:

- pin for approximately `160%` viewport scroll;
- reveal `001`, the dossier label, and the preparation note in sequence;
- keep the unavailable CTA semantically disabled;
- show the editorial sequence `SORU · MEKANİZMA · KANIT · BAĞLAM` as a restrained annotation;
- publish normalized Scene 05 progress.

No article title or publication date is invented.

### Scene 06 — Journal Spine

**Editorial idea:** CALORYTHM grows as an archive of carefully edited nutrition topics.

The dossier seal opens into a vertical journal spine. The topic list remains typographic and avoids cards. As each topic becomes active, one colored path reaches from the spine to that row and acts as a reading cursor.

Desktop behavior:

- preserve the sticky editorial lead and long scrolling topic list;
- publish Scene 06 progress from the list's overall scroll range;
- map active list rows to a normalized topic index;
- move the thread endpoint and tone emphasis to the active row;
- keep all eight topics accessible as ordinary list content without JavaScript.

The ground returns to ivory. The orbital paths use multiply blending and thinner widths than the hero.

### Scene 07 — Brand Resolution

**Editorial idea:** Curiosity returns to the core CALORYTHM rhythm.

The journal spine bends toward the center and resolves into the original four-loop CALORYTHM ring. Unlike the opening splash, this is not another curtain or wordmark animation. It is a calm closing state that confirms the visual journey.

Desktop behavior:

- pin for approximately `140%` viewport scroll;
- move the spine into a centered square stage;
- close the open paths into the authored ring geometry;
- reveal the contribution message and CTA;
- settle the official wordmark and footer after the ring resolves;
- publish normalized Scene 07 progress.

The final state uses an ivory ground and preserves standard keyboard navigation and focus styling.

## Geometry Architecture

The existing persistent `OrbitalThreadStage` remains the only rendered orbital stage.

Geometry responsibilities will be separated from layout and content:

- each scene geometry accepts the previous scene's 13-point geometry, scene progress, path index, and scene-specific config;
- all interpolation values are clamped and finite;
- open paths use the existing four-cubic serializer without `Z`;
- the final scene interpolates back to the authored closed loop and restores `Z` only when closure is visually stable;
- every transition preserves four distinct path layers and deterministic reverse scrolling.

The orbital store remains the shared source of scene id and normalized progress. `HomeMotion` owns ScrollTrigger lifecycles and publishes progress. `OrbitalThreadStage` reads the store and resolves geometry; content components do not manipulate SVG paths.

## Motion Rules

- Use GSAP ScrollTrigger for desktop pinning and normalized scroll progress.
- Animate typography with transforms and opacity only.
- Update path geometry inside the existing requestAnimationFrame loop.
- Do not create new timelines during pointer or scroll updates.
- Keep ScrollTriggers in document order and inside the scoped GSAP context.
- Reverse scrolling must reconstruct the preceding geometry without a clone or crossfade.
- Pointer input may affect local tension only; it never drags the entire composition.

## Responsive and Reduced Motion

Desktop art direction targets viewports wider than `1024px` with sufficient height.

On mobile and reduced-motion profiles:

- do not pin scenes;
- retain every heading, paragraph, topic, and CTA in document order;
- use static editorial rails, brackets, seal, spine, and final ring as CSS/SVG fallback states;
- avoid pointer reactions and continuous requestAnimationFrame geometry;
- reduce oversized display type and convert absolute topic layouts into linear reading structures.

## Accessibility

- Preserve semantic sections, heading order, ordered lists, labels, and disabled-state semantics.
- Decorative orbital geometry remains `aria-hidden` and non-interactive.
- Maintain visible focus states and existing contrast tokens.
- Motion does not carry information unavailable in text.
- Scene labels and annotations marked decorative remain excluded from the accessibility tree.

## Performance

- Retain one SVG stage and four paths.
- No new images, video, WebGL, or third-party runtime dependencies.
- Keep animation updates to path `d`, stroke width, transforms, and opacity.
- Avoid reading layout inside per-path loops; measure scene or topic anchors once per frame or on invalidation.
- Stop continuous orbital work for reduced-motion, coarse-pointer, or hidden-document states.

## Testing Strategy

Implementation follows red-green-refactor cycles.

Coverage must include:

- finite and reversible geometry for Scenes 03–07;
- open/closed path continuity and final authored-loop equality;
- one persistent SVG across every scene;
- normalized store progress for each pinned desktop scene;
- required editorial structures and labels in each scene;
- mobile and reduced-motion content availability;
- existing splash, hero, CTA, Scene 01, and Scene 02 regressions;
- full test, lint, TypeScript production build, and diff checks before completion.

## Acceptance Criteria

- Scenes 03–07 no longer read as generic prebuilt landing-page sections.
- The same four colored paths remain visually continuous from splash to final.
- Every scene expresses one editorial idea and one intentional path transformation.
- The first dossier remains honest about its unselected subject.
- Desktop motion is scroll-driven, reversible, and controlled.
- Mobile and reduced-motion experiences remain complete and readable.
- Leva exposes scene-specific orbital values for future tuning.
- No unrelated working-tree changes are included in commits.
