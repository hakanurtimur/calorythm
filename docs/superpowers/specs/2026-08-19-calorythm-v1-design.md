# CALORYTHM V1 Design Specification

**Date:** 2026-08-19  
**Status:** Approved creative direction  
**Primary language:** Turkish  
**Creative direction:** Living Metabolism / Yaşayan Metabolizma

## 1. Product Definition

CALORYTHM is an independent digital publication that turns nutrition science into visual, interactive editorial experiences. It is not a dietitian corporate site, a calorie tracker, a conventional health blog, a clinic, or a SaaS landing page.

The V1 objective is to establish a distinctive publication through:

- an Awwwards-level, motion-first homepage;
- a premium editorial journal index;
- topic-led content discovery;
- one fully art-directed flagship visual essay;
- a concise about page that explains the publication's philosophy.

The core promise is: **“Beslenmenin bir ritmi var.”**

The experience must feel editorial, scientific, human, experimental, and premium. Nutrition expertise should become evident through the substance and precision of the content, not through clinical visual codes.

## 2. V1 Scope

### Included

- Homepage
- Journal index
- Topics index
- Topic detail pages
- Flagship article: “Protein Sadece Kas İçin Değildir”
- About page
- Responsive desktop and mobile experiences
- Reduced-motion and WebGL fallback states
- Route-specific metadata for shareable pages

### Excluded

- Authentication and membership
- Payments and subscriptions
- Diet plans and appointment booking
- Client or admin dashboards
- Calorie tracking
- Personal health recommendations
- User-generated content

The codebase must leave clear content and service boundaries so that later CMS, membership, or subscription work can be introduced without coupling those concerns to scene components.

## 3. Information Architecture

| Route | Purpose |
| --- | --- |
| `/` | Eight-scene brand and editorial narrative |
| `/journal` | Premium, asymmetric editorial index |
| `/journal/protein-sadece-kas-icin-degildir` | Flagship visual essay |
| `/topics` | Overview of eight nutrition domains |
| `/topics/[slug]` | Topic introduction and related stories |
| `/about` | Manifesto, method, and editorial principles |

Global navigation contains only **Journal**, **Konular**, and **Hakkında**. The wordmark returns home. The mobile menu is a full-height editorial overlay, not a floating pill or card.

Article and topic records initially live in typed TypeScript content modules. Rendering components consume those records through small selector functions. This creates a future CMS seam without introducing a CMS in V1.

## 4. Homepage Dramaturgy

The homepage is one continuous story rather than a stack of interchangeable marketing sections. Each scene has a narrative job and hands one visual property to the next scene.

### Scene 01 — Uyanış

- Opens on near-black negative space.
- Reveals the CALORYTHM wordmark before the complete visual system appears.
- Introduces the statement “Beslenmenin bir ritmi var.”
- Introduces the living rhythm form through a slow inhale/exhale motion.
- Primary CTA: “Keşfet”. It scrolls to the first content scene and remains a normal keyboard-accessible anchor.

### Scene 02 — Madde

- First appearance of food imagery.
- Uses extreme macro crops and texture rather than plated food.
- Pairs nutritional quantities with tactile food matter without implying that the quantities fully explain the food.
- Headline: “Yediğin şey, bir sayıdan fazlası.”
- Image masks widen, split, and rejoin as the user advances.

### Scene 03 — Cevap

- Food matter resolves into an abstract response system.
- Headline: “Beden sadece almaz. Cevap verir.”
- Energy, digestion, absorption, storage, movement, and recovery appear as spatial labels in the composition, not as an icon row.
- The rhythm form briefly loses its stable silhouette and becomes a directed flow.

### Scene 04 — Üç Karakter

- Protein, carbohydrate, and fat are shown as three behaviors of one system, never as three equal cards.
- Protein: fibrous, splitting, reconnecting, structural.
- Carbohydrate: faster transfer, directional flow, responsive acceleration.
- Fat: slower fluid motion, membrane-like tension, weighted settling.
- Headline: “Protein. Karbonhidrat. Yağ. Üç makro besin. Tek bir sistemin parçaları.”

### Scene 05 — Değişken İnsan

- Begins with a visually simple energy equation.
- Sleep, stress, movement, age, habits, environment, training, and daily life enter as interacting variables.
- Variables influence the central system through proximity, tension, and tempo rather than icons.
- Headline: “Denklem basit olabilir. İnsan değil.”
- Desktop pointer interaction can perturb the system; keyboard focus and touch expose the same relationships through explicit controls.

### Scene 06 — Protein Eşiği

- The central form becomes fibrous and opens into the flagship story.
- Uses a full-viewport editorial composition rather than an article card.
- Headline: “Protein Sadece Kas İçin Değildir”.
- CTA: “Hikâyeyi keşfet”.

### Scene 07 — Journal Akışı

- Introduces five V1 story records at varied scale.
- Stories behave like a magazine sequence, with deliberate overlaps, large typography, and changing image crops.
- No uniform card grid, bento system, or repeated rounded container.
- Story titles:
  - “Karbonhidrat Gerçekten Sorun mu?”
  - “Kilon Neden Bir Gecede Değişir?”
  - “Kalori Dengesi Neden Göründüğünden Daha Karmaşık?”
  - “Lif Neden Sadece Sindirim İçin Değildir?”
  - “Kreatin Hakkında Gerçekten Bilmen Gerekenler”

### Scene 08 — Yeni Ritim

- Returns to the hero motif in a richer, layered state.
- Repeats “Beslenmenin bir ritmi var.” and CALORYTHM.
- Provides minimal continuation links to Journal and Topics.
- Closes the visual loop without trapping the user in a scroll animation.

## 5. Visual System

### Palette

| Token | Hex | Role |
| --- | --- | --- |
| Carbon | `#11110F` | Primary dark field |
| Bone | `#ECE7DC` | Reading field and primary light text |
| Mineral | `#98968E` | Secondary copy and annotation |
| Protein Coral | `#F05A42` | Structure, repair, fibre |
| Carbohydrate Solar | `#D8F34A` | Flow, speed, available energy |
| Fat Ultramarine | `#5367E8` | Fluidity, membrane, storage |

Accent colours are scene states, not simultaneous decoration. Large areas normally contain Carbon, Bone, and one active accent. Gradients exist only to describe depth or material, never as generic glowing orbs.

### Typography

- **Bodoni Moda Variable:** editorial display headlines, manifesto statements, and oversized numerals.
- **Manrope Variable:** body copy, navigation, controls, labels, and the CALORYTHM wordmark base.
- **IBM Plex Mono:** measurements, indices, reading time, references, and scientific annotations.

All selected families include Latin Extended glyphs required by Turkish. The wordmark uses a restrained, wide-set Manrope treatment with optical spacing adjustments; Bodoni Moda supplies the publication voice but is not used as the logo.

### Composition

- An underlying 12-column desktop grid controls alignment without becoming visible chrome.
- Headlines can cross columns or clip at the viewport when the text remains understandable.
- Body copy uses narrow reading measures and generous vertical rhythm.
- Surfaces remain mostly square or naturally cropped.
- There are no decorative dashboard cards, bento layouts, glassmorphism, wellness gradients, clinic icons, or generic health illustrations.
- Every viewport has one dominant focal action.

## 6. Living Rhythm Motif

The recurring brand object is an abstract structure made from tensioned, folded, interconnected fibrous bands. It must read as a living material rather than a blob, molecule, DNA helix, heartbeat line, or music visualizer.

Four verbs define all motion:

1. **Inhale:** space, scale, and surface tension expand.
2. **Separate:** the structure divides into controlled parts.
3. **Transfer:** energy or information travels between layers.
4. **Settle:** parts form a new equilibrium.

Timing uses asymmetric easing, slight delay, and variation. Constant bobbing, random floating objects, and unrelated parallax are prohibited. Motion must either reveal information, establish hierarchy, explain transformation, or connect scenes.

## 7. 2D and 3D Allocation

| Experience | Rendering approach |
| --- | --- |
| Hero | React Three Fiber living form |
| Food / matter | Responsive raster imagery, CSS masks, GSAP crop transitions |
| Body response | Lightweight Canvas particles plus DOM typography |
| Macronutrients | Reuse the living form with three material/motion states |
| Human variables | DOM/SVG relationship field with accessible controls |
| Flagship threshold | 3D-to-2D fibrous transition |
| Journal | CSS layout and restrained GSAP reveals |
| Final | Reused living canvas at lower activity |

The homepage uses one persistent WebGL canvas instead of mounting separate scenes. It renders only while visible and adapts device pixel ratio and geometry density to a quality tier.

Mobile preserves the narrative but shortens pinned distances, reduces particle counts, removes pointer-only effects, and simplifies geometry. A static or lightly animated 2D fallback replaces WebGL when support, device capability, data preference, or motion preference requires it.

## 8. Asset Direction

V1 requires a small, coherent asset family rather than a large stock library:

- three original macro food/material images for protein, carbohydrate, and fat;
- one neutral food-matter image for the “number” scene;
- one flagship cover composition derived from the protein texture;
- small abstract texture crops derived from the same sources for Journal and Topics;
- one CALORYTHM social preview image once the page direction is stable.

Images should emphasize fibre, pores, translucency, fracture, emulsion, and membrane. They must avoid plates, salad arrangements, avocados, hands holding smoothies, gym bodies, white coats, or visible medical devices.

The living form is procedural and should not require a large downloaded 3D model. Raster assets use AVIF/WebP where supported, explicit dimensions, responsive sizes, and lazy loading below the fold.

## 9. Flagship Visual Essay

“Protein Sadece Kas İçin Değildir” has its own scene system inside a shared semantic article shell.

### Editorial arc

1. **Opening misconception:** protein is culturally reduced to muscle and gym imagery.
2. **Continuous renewal:** the body continually builds, repairs, transports, and replaces protein structures.
3. **Many roles:** enzymes, transport proteins, immune function, signalling, and structural tissues are introduced through specific plain-language examples.
4. **Digestion and reuse:** dietary protein is broken into amino acids and reused according to changing needs; the visual structure separates and recombines.
5. **Context changes demand:** age, activity, energy intake, health context, and food pattern affect the practical meaning of “enough”.
6. **Quality and distribution:** the story explains amino-acid composition and meal context without turning into a prescriptive calculator.
7. **Closing idea:** protein is not a muscle product; it is part of the body's ongoing maintenance language.

The article provides genuinely useful explanation while avoiding personalised dosing, diagnosis, treatment, or supplement sales language. Quantitative claims require named sources and visible editorial references. The page ends with a related topic link and the next Journal story rather than a conversion funnel.

### Article interactions

- kinetic opening headline;
- a scroll-led “separate and rebuild” sequence;
- a role map that remains readable without interaction;
- one restrained data visualisation where a number materially helps understanding;
- inline annotations and end references;
- reading progress that is not announced excessively to assistive technology.

## 10. Supporting Pages

### Journal

The Journal opens with an issue-like masthead and featured story. Entries use three editorial scales and a repeating baseline, not a uniform grid. Filtering is limited to topic links in V1; there is no search or complex client-side filter state.

### Topics

Eight topic fields—Protein, Karbonhidrat, Yağlar, Enerji, Metabolizma, Lif, Hidrasyon, Mikro Besinler—form a typographic index. Hover or focus reveals a short definition and related-story count. Mobile uses expanded rows with the same information permanently visible.

### Topic detail

Each detail page has an editorial introduction, one visual motif, and related stories. Empty topics can contain a clearly labelled “hazırlanıyor” editorial note, but every route must still have meaningful explanatory copy.

### About

About is a concise manifesto with three sections: what CALORYTHM is, how it treats evidence, and what it refuses to become. It includes no clinic biography layout, credential-card wall, or sales CTA.

## 11. Content Voice and Editorial Safety

All visible V1 copy is Turkish. The voice is knowledgeable, concise, adult, curious, and calm. It avoids academic density, influencer slang, fear-based claims, moral labels for foods, miracle language, and wellness clichés.

Editorial rules:

- distinguish explanation from personalised advice;
- state uncertainty where evidence is conditional;
- avoid declaring individual foods universally good or bad;
- cite quantitative and health-effect claims;
- never imply that an interaction is a diagnostic or calculation tool;
- use sentence case in Turkish UI labels;
- preserve correct Turkish punctuation and diacritics.

## 12. Technical Architecture

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS for tokens, layout utilities, and responsive composition
- React Three Fiber / Three.js for the persistent living canvas only
- GSAP and ScrollTrigger for intentional scene choreography
- Native scrolling in V1; Lenis is not included unless testing demonstrates a specific need
- Server Components by default
- Small Client Components for canvas, timeline orchestration, menus, and interactive variable controls

Suggested boundaries:

- `app/`: routes, route metadata, and page composition
- `components/layout/`: header, menu, footer, skip link
- `components/editorial/`: reusable article typography and story treatments
- `components/scenes/`: homepage scene markup and scene-local presentation
- `components/motion/`: timeline hooks, motion preference, quality tier, canvas orchestration
- `components/three/`: living form geometry, materials, and state controller
- `content/`: typed article and topic records
- `lib/`: selectors, metadata builders, and non-visual utilities

Content logic must not import GSAP, Three.js, or browser APIs. Scene components receive typed content and motion-state props. The WebGL layer consumes a small scene-state contract rather than knowing page copy.

## 13. Failure and Fallback Behaviour

- If WebGL initialization fails, the page replaces the canvas with the 2D brand motif without hiding text or controls.
- If JavaScript is unavailable, all routes retain headings, article content, images, and links in logical reading order.
- If an image cannot load, its surrounding composition maintains dimensions and meaningful alt text remains available.
- Motion effects are progressive enhancement; navigation and article comprehension never depend on a completed animation.
- Unknown topic and article slugs return the framework's semantic not-found route.

## 14. Responsive Behaviour

Desktop art direction is designed at 1440px and validated from 1024px upward. Mobile is independently composed from 320px upward.

### Desktop

- full-viewport scene staging;
- selective pinning;
- wide typographic crops;
- persistent living canvas;
- pointer-enhanced variable interaction.

### Mobile

- shorter narrative distances;
- fewer pinned scenes;
- headline sizes capped to preserve complete Turkish words;
- tap/focus controls instead of hover dependency;
- simplified canvas and static fallbacks where needed;
- no horizontal page overflow or desktop composition merely scaled down.

## 15. Performance Budgets

- Initial route JavaScript excludes article-only and below-fold heavy scene code where possible.
- The living canvas loads after core hero text and can be dynamically imported.
- WebGL device pixel ratio is capped and quality tiers control geometry and particles.
- Below-fold imagery and article-specific interactions are lazy loaded.
- Font files are self-hosted or framework-optimised, subset to required scripts and weights, and use `font-display: swap`.
- Layout dimensions are reserved for images and canvas to prevent visible layout shift.
- Continuous animation pauses when the document or canvas is not visible.

The first visit must not download a large 3D model, uncompressed video, or a broad image library. Performance decisions are validated with a production build and browser performance inspection before completion.

## 16. Accessibility Requirements

- Semantic landmarks and one logical H1 per route
- Skip link and visible keyboard focus
- Fully keyboard-operable navigation and interactions
- Sufficient text/background contrast in every colour state
- Meaningful alt text for editorial images; empty alt for purely decorative texture
- `prefers-reduced-motion` removes pinning, kinetic text, camera motion, and continuous oscillation
- Canvas has an accessible textual equivalent and is never the sole carrier of information
- Interaction instructions do not assume a mouse
- Touch targets meet a minimum practical size of 44×44 CSS pixels
- Heading hierarchy remains correct even when display type changes visual scale

## 17. Metadata and Sharing

The root layout provides CALORYTHM title, description, and site-wide social image. Journal articles override title, description, Open Graph, and X metadata using the same typed record rendered by the page. Topic details also receive specific titles and descriptions.

The flagship article uses its existing editorial cover as its social image; it does not inherit a generic site image. Canonical URLs and Turkish Open Graph locale are included when a production origin is configured.

## 18. Validation Strategy

### Automated

- unit tests for content selectors, slug resolution, metadata builders, motion preference, and quality-tier decisions;
- component tests for menu keyboard behaviour, topic controls, and fallback rendering;
- route smoke checks for all V1 pages;
- TypeScript, lint, and production build checks.

### Browser validation

- desktop and mobile visual review of every route;
- keyboard-only navigation;
- reduced-motion emulation;
- WebGL-disabled fallback;
- narrow 320px layout and large desktop layout;
- scroll performance and layout-shift inspection;
- verification that route-specific social metadata matches visible content.

## 19. Acceptance Criteria

V1 is complete when:

1. The first viewport immediately communicates an independent editorial brand rather than a clinic, wellness brand, or SaaS product.
2. The homepage forms a coherent eight-scene narrative with purposeful transitions.
3. The living rhythm motif recurs across the homepage without making every section a 3D demo.
4. Journal, Topics, topic detail, About, and the flagship story are complete Turkish routes.
5. “Protein Sadece Kas İçin Değildir” teaches multiple roles of protein through substantive text and understandable visuals.
6. Mobile retains the narrative through a specifically composed lighter experience.
7. Keyboard, reduced-motion, and WebGL fallback experiences remain complete.
8. Production build, automated checks, and representative browser checks pass.
9. No excluded membership, sales, appointment, dashboard, or tracking feature is introduced.
10. No prohibited wellness, clinical, fitness-influencer, generic SaaS, glassmorphism, bento, or decorative-blob aesthetic appears.

