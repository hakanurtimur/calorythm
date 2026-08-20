# CALORYTHM Orbital Editorial Homepage — Design Specification

**Date:** 2026-08-20  
**Status:** Approved creative direction; pending written-spec review  
**Scope:** Homepage splash, Hero and Sections 01–07 only

## 1. Objective

CALORYTHM's homepage must introduce an independent nutrition-science publication, not a dietitian corporate site, wellness landing page or product interface. The experience should feel like a premium editorial publication whose visual grammar is built from CALORYTHM's four authored rhythm paths.

The homepage promise is understanding: visitors should leave with the impression that familiar nutrition subjects can be explained in a clearer, more memorable way. Motion, interaction and scroll choreography are implementation tools and must not appear in the public-facing copy as product features.

## 2. Core Creative Direction: Orbital Editorial

The four paths from the official CALORYTHM mark are the recurring visual narrator. They remain recognisably the brand mark throughout the homepage and take on different editorial roles:

- opening signature;
- compositional frame;
- section index;
- topic route;
- typographic underline;
- transition aperture;
- closing signature.

The paths are separate SVG elements and can be controlled independently, but their source geometry is immutable. Relative transforms are deliberately constrained so they never drift into an unrelated symbol or appear to pass through one another. Large transitions operate on the complete four-path group. Individual path movement is limited to small colour, opacity, stroke-dash, translation and rotation changes.

The result should be calm and precise. The page does not need a new effect in every section. Repetition, pause and controlled variation establish the rhythm.

## 3. Visual Tokens

### Palette

| Token | Value | Role |
|---|---:|---|
| Ivory | `#F6F1E8` | Primary field and reading surface |
| Ink | `#20211E` | Primary type and inverted scene |
| Orange | `#F3A65A` | Rhythm path 01, energy |
| Coral | `#EA735D` | Rhythm path 02, emphasis and flagship field |
| Ochre | `#C79A45` | Rhythm path 03, annotation and warmth |
| Olive | `#A7BE89` | Rhythm path 04, balance and recovery |
| Muted ink | `color-mix(in srgb, #20211E 58%, transparent)` | Supporting copy |
| Rule ink | `color-mix(in srgb, #20211E 16%, transparent)` | Hairlines and orbital guides |

No additional gradients, neon accents, glass surfaces or wellness greens are introduced.

### Typography

- **Manrope Variable:** navigation, primary headlines, body and controls.
- **Bodoni Moda Variable:** one expressive phrase per major headline, never complete paragraphs.
- **IBM Plex Mono:** indexes, annotations, topic coordinates and compact scientific notes.
- Headline scale uses strong contrast: `clamp(3.5rem, 8vw, 8.5rem)` on desktop and `clamp(2.8rem, 13vw, 4.8rem)` on mobile.
- Body measure remains between 36 and 58 characters.

### CTA language

CTA design is not a generic pill. The reusable orbital link consists of a text label, a hairline track and a 42–48px circular arrow terminal. On hover/focus, the arrow moves by at most 4px and a coloured arc draws around the terminal. The control remains a semantic link where a real destination exists.

## 4. Copy

### Splash

`CALORYTHM`  
`Beslenmenin bir ritmi var.`

### Hero

**Beslenmenin bir ritmi var.**

Beslenme bilimini; görsel hikâyeler ve deneyimlenen anlatılarla yeniden keşfet.

**Keşfet ↓**

### 01

**Bilgiyi okumak kolaydır.**  
**Anlamak zordur.**

CALORYTHM bilgiyi içerik olarak bırakmaz. Her konu, bağlantıları görünür kılan ve adım adım açılan bir hikâyeye dönüşür.

### 02

**Her konu, kendi hikâyesini anlatır.**

Protein yalnızca protein değildir.  
Karbonhidrat yalnızca enerji değildir.  
Yağ yalnızca depolanan kalori değildir.

Her hikâye tek bir fikrin peşinden gider; onu parçalarına ayırır, bağlamına yerleştirir ve yeniden kurar.

### 03

**Karmaşık olanı,**  
**anlaşılır hâle getiriyoruz.**

Metabolizma. Enerji dengesi. Lif. Hidrasyon. Mikro besinler.

Beslenme biliminin en çok yanlış anlaşılan konularını; sade, görsel ve bilimsel bir anlatımla yeniden ele alıyoruz.

### 04

**Bir makale okumuyorsun.**  
**Bir düşüncenin içine giriyorsun.**

Her hikâye kendi anlatım dilini kurar. Büyük fikirler açılır, veriler bağlam kazanır, parçalar birbirine bağlanır.

Amaç yalnızca bilgi vermek değil. Anlaşılmasını sağlamak.

### 05 — İlk hikâye

**Protein Sadece Kas İçin Değildir**

Protein denince aklına ilk kas geliyor olabilir. Oysa beden, proteini bundan çok daha fazlası için kullanır.

Bu hikâye, proteine yeniden bakmanı sağlayacak.

**Hikâyeyi keşfet →**

The article route is outside this homepage slice. Until that route exists, the visual CTA is rendered with an explicit unavailable state rather than as a dead link.

### 06 — Journal index

**Keşfetmeye devam et.**

1. Protein — Yapı, onarım ve çok daha fazlası.
2. Karbonhidrat — Enerjinin en yanlış anlaşılan yüzü.
3. Yağlar — Depolamaktan çok daha fazlası.
4. Metabolizma — Beden enerjiyi nasıl yönetiyor?
5. Enerji Dengesi — Bir sayıdan daha fazlası.
6. Lif — Sindirimin ötesindeki görevleri.
7. Hidrasyon — Su gerçekten ne yapar?
8. Mikro Besinler — Küçük miktarlar, büyük etkiler.

### 07

**Merak iyi bir başlangıçtır.**

Her hafta yeni hikâyeler. Yeni araştırmalar. Yeni bakış açıları.

Beslenme bilimini ezberlerle değil, anlayarak keşfet.

**Journal'ı keşfet →**

The final CTA links to the in-page Journal index until the Journal route is implemented.

## 5. Scene Architecture

### 00 — Splash / Signature

- Full-viewport ivory field.
- Four brand paths draw in with their authored colours, followed by the CALORYTHM wordmark.
- Total duration is 1.6–1.9 seconds and may be skipped with keyboard or pointer input.
- For the prototype it plays on every hard page load so it can be reviewed consistently. Production session suppression can be added later without changing the component contract.
- Reduced motion renders the completed mark instantly and introduces no delay.

### Hero — Proposition

- Ivory field with editorial copy on the left and the four-path mark occupying the right half.
- The header remains sparse: wordmark, Journal, Konular, Hakkımızda and a compact orbital menu control.
- The hero uses a 180svh scroll range on desktop. Its internal viewport is pinned while the mark expands from signature to frame.
- The last quarter of progress lowers supporting-copy opacity and reveals Section 01 through a coral orbital rule, not a full-screen colour wipe.

### 01 — From Information to Understanding

- A broken circular rule surrounds two oversized headline lines.
- Small nutrition fragments begin at the perimeter and settle into three meaningful relationships around the headline.
- This is a normal-flow section with a restrained scrub reveal; it is not pinned.

### 02 — Every Subject Has a Story

- A desktop pinned sequence introduces Protein, Karbonhidrat and Yağ as three distinct routes sharing one centre.
- Each route receives one authored brand colour and one motion character, but no equal-width cards are used.
- Text changes in place while the orbital track remains stable.
- Mobile presents the three routes as a vertical editorial sequence with a small persistent ring index and no pinning.

### 03 — Making Complexity Legible

- An asymmetric typographic atlas for Metabolizma, Enerji Dengesi, Lif, Hidrasyon and Mikro Besinler.
- A thin circular guide connects terms without becoming a dashboard or infographic.
- Active terms receive colour and a short annotation; inactive terms remain muted ink.

### 04 — Entering a Thought

- The only ink-background scene.
- Ivory headline, mono annotations and a coral/olive four-path aperture.
- Desktop pins for approximately 140svh. The aperture opens while headline fragments resolve into the final statement: `Anlaşılmasını sağlamak.`
- No technical implementation vocabulary appears in the public copy.

### 05 — Flagship Story

- Full coral field with an oversized ivory title and a cropped four-path mark acting as a reading portal.
- Small `İLK HİKÂYE / 001` annotation and concise introduction.
- CTA follows the orbital-link design and is explicitly unavailable until the article route exists.

### 06 — Journal Orbit

- Ivory field and a sticky desktop viewport inside a long normal document section.
- Eight topics progress vertically while a central 2D ring index changes colour and active label.
- The layout is editorial, not a card grid. Topic typography varies in scale but follows one reading order.
- Mobile removes sticky behaviour and renders all topics as an accessible vertical index.

### 07 — Finale

- Quiet ivory closing field with generous empty space.
- The four paths recombine into the exact official mark.
- `Merak iyi bir başlangıçtır.` is followed by the Journal CTA and CALORYTHM wordmark.
- No autoplay loop competes with the final reading moment.

## 6. Motion Contract

GSAP and ScrollTrigger drive scroll-linked motion. Native browser scrolling remains in place; Lenis is not introduced in this slice.

- `scrub` values remain between `0.55` and `0.8`.
- Scroll-linked tweens use `ease: "none"`; entry/exit beats may use `power2.out` or `power3.out`.
- Only Hero, Section 02 and Section 04 use explicit pinning on desktop.
- The Journal orbit uses CSS sticky positioning with narrow ScrollTriggers for topic activation.
- Pinned elements themselves are not transformed; only their internal layers animate.
- Transforms and opacity are preferred. Layout-changing animation is avoided.
- Each scene owns its own top-level ScrollTrigger and all triggers are created in document order.
- `gsap.context()` provides cleanup. `ScrollTrigger.refresh()` runs after fonts are ready.
- No motion is attached only for decoration. Every transition either changes hierarchy, reveals a relationship or moves the narrative to the next idea.

### Ring path constraints

- Exactly four authored SVG paths.
- Individual translation: maximum ±6px desktop, ±3px mobile.
- Individual rotation: maximum ±1.5 degrees.
- Individual scale: `0.985–1.015`.
- Stroke width stays between `1.6–2.2` in the 128px source viewBox.
- Large scale/position transitions apply to the parent group, preserving the symbol.

## 7. Interaction Contract

- Orbital CTA targets are at least 44×44px.
- Hover is supplementary; all controls work by keyboard.
- Visible focus uses coral on ivory and ivory on ink/coral fields.
- Splash can be skipped by `Escape`, `Enter`, pointer click or the skip control.
- Navigation links only render as links when a valid destination exists.
- No custom cursor is introduced.

## 8. Responsive Behaviour

### Desktop (`min-width: 1024px`)

- Full art direction, three pinned sequences, sticky Journal orbit.
- Headlines preserve intended two-line compositions when viewport width permits.
- Maximum content width is 1600px; outer gutters use `clamp(2rem, 5vw, 6rem)`.

### Tablet (`768–1023px`)

- Hero pin remains but its scroll range shortens.
- Section 02 becomes normal flow if available height is below 700px.
- Journal orbit remains sticky only in landscape.

### Mobile (`max-width: 767px`)

- No pinned sections and no forced horizontal movement.
- Splash lasts no more than 900ms when motion is allowed.
- Ring art becomes a compositional crop, not a shrunken desktop diagram.
- All topic/story content follows semantic DOM order and remains visible without JavaScript.

### Reduced motion / constrained data

- No splash delay, pinning, scrub, path drawing or continuous loops.
- All sections are static and immediately readable.
- Colour, type scale and spacing preserve hierarchy without motion.

## 9. Component Architecture

- `HomeExperience` — semantic server-rendered page structure.
- `HomeSplash` — accessible opening signature and skip behaviour.
- `OrbitalMark` — reusable four-path SVG with `variant`, `tone` and path-level class hooks.
- `OrbitalLink` — reusable CTA language.
- `HomeSection` — section shell for index, title and supporting copy; variations are explicit rather than generic-card driven.
- `MacroRoutes` — Section 02 route narrative.
- `TopicAtlas` — Section 03 typographic atlas.
- `FlagshipStory` — Section 05 composition.
- `JournalOrbit` — Section 06 topic index.
- `HomeMotion` — single client-side GSAP orchestration boundary.
- `home-content.ts` — Turkish copy and typed topic data.

Content and animation selectors remain separate. Copy lives in typed content data; motion logic targets stable `data-motion` and `data-scene` contracts.

The existing inactive Three.js scene prototype is not mounted by the homepage. No WebGL or Canvas code is introduced into the new homepage.

## 10. Accessibility and Semantics

- One `h1`; Sections 01–07 use ordered `h2` headings.
- Decorative orbital SVGs are `aria-hidden`; essential labels remain in text.
- Semantic lists are used for macros and Journal topics.
- Text contrast meets WCAG AA on ivory, ink and coral fields.
- Focus order follows visual order.
- The experience is fully readable and navigable without GSAP.

## 11. Performance

- The 2D mark is inline SVG; no raster asset is required for the orbital system.
- GSAP and ScrollTrigger load dynamically only for full-motion profiles.
- No WebGL, video, smooth-scroll runtime or continuous requestAnimationFrame loop is added.
- `will-change` is scoped to active motion elements and not applied globally.
- Font loading uses existing local package assets.

## 12. Verification

Implementation is complete only when:

1. all nine public states (Splash, Hero and Sections 01–07) render in semantic order;
2. the brand mark contains exactly four authored paths;
3. no Canvas/WebGL element is present on the homepage;
4. desktop motion follows the stated pin ownership and document order;
5. mobile and reduced-motion profiles expose all content without pinning;
6. keyboard focus and splash skipping work;
7. content tests confirm the approved Turkish headings and topic index;
8. lint, typecheck, targeted tests and production build succeed.
