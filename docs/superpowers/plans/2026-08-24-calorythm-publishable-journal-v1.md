# CALORYTHM Publishable Journal V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship CALORYTHM as a complete Turkish independent nutrition-science journal with a seven-scene landing, browsable editorial routes, and one fully sourced scroll-driven flagship protein visual essay.

**Architecture:** Keep `CalorythmMeasureHero` as a focused client island and server-render all publication content around it. Content lives in typed modules with pure selectors; routes consume those modules; small scene-local client wrappers enhance motion without owning copy. The dormant orbital and Three.js prototypes remain unmounted.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, CSS Modules, GSAP ScrollTrigger where scroll orchestration materially improves comprehension, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-24-calorythm-publishable-journal-design.md`

## Global Constraints

- All public UI and editorial copy is Turkish.
- V1 includes no authentication, subscription, payment, CMS, search, comments, appointments, diet planning, calorie tracking, WebGL, or contributor dashboard.
- Motion must be deterministic in both scroll directions and must not carry information unavailable in semantic HTML.
- `prefers-reduced-motion` removes pinning, scrubbed typography, camera moves, and continuous oscillation.
- The hero and article must remain functional at `1920×1080`, `1440×900`, `1024×768`, `768×1024`, `390×844`, `667×375`, and `320×568`.
- No dead primary CTA, disabled article card, or “yakında” publication item ships.
- Protein reference values are contextualized; `0.83 g/kg/day` is never presented as a personal target, optimum, or upper limit.
- Content modules never import animation or browser code.
- No raw pointer or scroll handler interleaves repeated layout reads and writes.

---

### Task 1: Typed publication content and selectors

**Files:**
- Create: `src/content/articles.ts`
- Create: `src/content/topics.ts`
- Create: `src/lib/content-selectors.ts`
- Test: `src/lib/content-selectors.test.ts`

**Interfaces:**
- Produces: `ArticleRecord`, `ArticleReference`, `TopicRecord`, `articles`, `topics`
- Produces: `getPublishedArticles(): readonly ArticleRecord[]`
- Produces: `getArticleBySlug(slug: string): ArticleRecord | undefined`
- Produces: `getTopicBySlug(slug: string): TopicRecord | undefined`
- Produces: `getArticlesForTopic(topicSlug: string): readonly ArticleRecord[]`
- Produces: `getRelatedArticles(article: ArticleRecord, limit?: number): readonly ArticleRecord[]`

- [ ] **Step 1: Write failing selector tests**

```ts
expect(getPublishedArticles().map(({ slug }) => slug)).toEqual([
  "protein-sadece-kas-icin-degildir",
  "protein-kalitesi-ne-demek",
  "referans-hedef-ust-sinir",
]);
expect(getArticleBySlug("protein-sadece-kas-icin-degildir")?.references.length)
  .toBeGreaterThanOrEqual(7);
expect(getArticlesForTopic("protein")).toHaveLength(3);
expect(getRelatedArticles(getArticleBySlug("protein-sadece-kas-icin-degildir")!))
  .toHaveLength(2);
```

- [ ] **Step 2: Run the selector test and verify RED**

Run: `pnpm test src/lib/content-selectors.test.ts`

Expected: FAIL because the modules and functions do not exist.

- [ ] **Step 3: Implement the article and topic types**

```ts
export type ArticleRecord = Readonly<{
  author: "CALORYTHM Editorya";
  body: readonly Readonly<{ heading: string; paragraphs: readonly string[] }>[];
  deck: string;
  eyebrow: string;
  publishedAt: string;
  readingMinutes: number;
  references: readonly ArticleReference[];
  relatedSlugs: readonly string[];
  slug: string;
  status: "published";
  title: string;
  topics: readonly string[];
  type: "visual-essay" | "editorial-note";
}>;
```

Create the flagship record and two concise published notes. Create all eight topic records with a slug, Turkish title, definition, and tone.

- [ ] **Step 4: Implement pure selectors without mutation**

Selectors preserve source order, return only `status: "published"`, and resolve relations by explicit slug.

- [ ] **Step 5: Run focused and full tests**

Run: `pnpm test src/lib/content-selectors.test.ts`

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/articles.ts src/content/topics.ts src/lib/content-selectors.ts src/lib/content-selectors.test.ts
git commit -m "feat: add publication content model"
```

---

### Task 2: Global publication shell

**Files:**
- Create: `src/components/layout/publication-header.tsx`
- Create: `src/components/layout/publication-footer.tsx`
- Create: `src/components/layout/publication-shell.module.css`
- Test: `src/components/layout/publication-shell.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `BrandWordmark`
- Produces: `<PublicationHeader />`, `<PublicationFooter />`

- [ ] **Step 1: Write failing landmark and navigation tests**

```tsx
render(<PublicationHeader />);
expect(screen.getByRole("navigation", { name: "Ana navigasyon" })).toBeVisible();
expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/journal");
expect(screen.getByRole("link", { name: "Yazar olarak katıl" }))
  .toHaveAttribute("href", "/about#katki");
```

Also assert one visible wordmark, a 44px mobile menu target, keyboard-operable menu state, and footer links.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/components/layout/publication-shell.test.tsx`

- [ ] **Step 3: Implement server-rendered header/footer and one small mobile-menu client island**

The header is transparent over the cover and solid on internal routes through a `tone` prop. The mobile menu uses a real button with `aria-expanded`, closes on navigation and Escape, and restores body scroll.

- [ ] **Step 4: Add the shell to root layout**

Keep the existing skip link. Use a metadata title template:

```ts
title: { default: "CALORYTHM", template: "%s | CALORYTHM" }
```

- [ ] **Step 5: Verify shell tests, keyboard behavior, lint, and types**

Run: `pnpm test src/components/layout/publication-shell.test.tsx src/app/layout.test.tsx`

Run: `pnpm lint`

Run: `pnpm exec tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/components/layout src/app/layout.tsx src/app/layout.test.tsx
git commit -m "feat: add publication navigation shell"
```

---

### Task 3: Complete landing composition and authored scene transitions

**Files:**
- Create: `src/components/home/publication-home.tsx`
- Create: `src/components/home/publication-home.module.css`
- Create: `src/components/home/publication-home-motion.tsx`
- Create: `src/content/publication-home.ts`
- Test: `src/components/home/publication-home.test.tsx`
- Test: `src/components/home/publication-home-motion.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `<CalorythmMeasureHero />`, `getPublishedArticles`, `topics`
- Produces: `<PublicationHome />`
- Produces DOM hooks: `data-home-scene="noise|method|flagship|journal|topics|contribution"`
- Produces motion profile: `data-motion-profile="full|reduced|static"`

- [ ] **Step 1: Replace the one-hero page contract with a failing publication contract**

```tsx
render(<Home />);
expect(screen.getByRole("heading", { level: 1, name: /Beslenmenin bir ritmi var/i })).toBeVisible();
expect(screen.getByRole("link", { name: "Hikâyeyi oku" }))
  .toHaveAttribute("href", "/journal/protein-sadece-kas-icin-degildir");
expect(screen.getByRole("heading", { name: "Konu atlası" })).toBeVisible();
expect(screen.getByRole("link", { name: "Katkı sürecini gör" }))
  .toHaveAttribute("href", "/about#katki");
```

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/app/page.test.tsx src/components/home/publication-home.test.tsx`

- [ ] **Step 3: Implement six server-rendered scenes below the cover**

Create semantic sections for noise, method, flagship, Journal river, topic atlas, and contribution/final. Use asymmetrical editorial compositions; do not mount dormant `HomeExperience`, `OrbitalThreadStage`, or Three.js components.

- [ ] **Step 4: Add one transition vocabulary per scene**

The client wrapper loads GSAP only for full motion on sufficiently tall desktop screens. It implements:

- hero bands exit right
- noise shutter reveal
- method masks expose three evidence slices
- flagship fiber paths separate
- Journal baselines reveal
- topic cursor follows focus/hover
- final bands converge into the ring

Only hero, noise, and method can pin. The remaining scenes use native scroll.

- [ ] **Step 5: Write and pass motion tests**

Test that reduced motion never imports the GSAP runtime, short landscape uses static/native flow, reverse updates deterministic attributes, and no scene creates an offscreen animation loop.

Run: `pnpm test src/components/home/publication-home-motion.test.tsx`

- [ ] **Step 6: Browser-check scene boundaries**

Inspect at `1920×1080`, `390×844`, and `667×375`. Verify no complete outgoing and incoming headline share the same readable plane, all CTAs are clickable, and the final scene has native document flow.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx src/components/home/publication-home* src/content/publication-home.ts
git commit -m "feat: build publication landing narrative"
```

---

### Task 4: Journal, Topics, and About routes

**Files:**
- Create: `src/app/journal/page.tsx`
- Create: `src/app/journal/journal.module.css`
- Create: `src/app/journal/[slug]/page.tsx`
- Create: `src/app/topics/page.tsx`
- Create: `src/app/topics/[slug]/page.tsx`
- Create: `src/app/topics/topics.module.css`
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/about.module.css`
- Create: `src/components/editorial/editorial-note.tsx`
- Create: `src/components/editorial/editorial.module.css`
- Test: `src/app/publication-routes.test.tsx`

**Interfaces:**
- Consumes: publication selectors from Task 1
- Produces: `generateStaticParams()` for article and topic slugs
- Produces: generic `<EditorialNote article={article} />`

- [ ] **Step 1: Write failing route tests**

Assert Journal shows exactly three published items, notes link to functioning routes, Topics exposes all eight topics, unknown slugs call `notFound`, About contains `id="katki"`, editorial method, founder note, and contribution criteria.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/app/publication-routes.test.tsx`

- [ ] **Step 3: Implement the Journal river and generic editorial-note route**

The flagship receives the largest treatment. Notes render their complete short body and references; no card is disabled.

- [ ] **Step 4: Implement Topics routes**

Each topic page includes its definition and related published articles. Empty topics clearly state that the archive is growing and always link back to the complete Journal; they are not presented as published stories.

- [ ] **Step 5: Implement About and contribution principles**

The contribution section explains accepted subject matter, source expectations, editorial review, and conflicts-of-interest disclosure. The contact CTA reads a required public URL from `NEXT_PUBLIC_EDITORIAL_CONTACT_URL`; when absent, it links to `#iletisim-bilgisi` and explains that the owner must configure the production contact destination before release.

- [ ] **Step 6: Pass route tests and build**

Run: `pnpm test src/app/publication-routes.test.tsx`

Run: `pnpm build`

- [ ] **Step 7: Commit**

```bash
git add src/app/journal src/app/topics src/app/about src/components/editorial src/app/publication-routes.test.tsx
git commit -m "feat: add journal topics and about routes"
```

---

### Task 5: Semantic flagship protein visual essay

**Files:**
- Create: `src/components/articles/protein/protein-visual-essay.tsx`
- Create: `src/components/articles/protein/protein-visual-essay.module.css`
- Create: `src/components/articles/protein/protein-evidence.ts`
- Test: `src/components/articles/protein/protein-visual-essay.test.tsx`
- Modify: `src/app/journal/[slug]/page.tsx`

**Interfaces:**
- Consumes: flagship `ArticleRecord`
- Produces: `<ProteinVisualEssay article={article} />`
- Produces hooks: `data-protein-scene="frame|roles|turnover|digestion|reference|pattern|resolution"`

- [ ] **Step 1: Write failing semantic and safety tests**

```tsx
expect(screen.getByRole("heading", { level: 1, name: "Protein Sadece Kas İçin Değildir" })).toBeVisible();
expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
expect(screen.getByText(/Referans ≠ hedef ≠ üst sınır/)).toBeVisible();
expect(screen.getByText(/kişisel beslenme veya tedavi önerisi değildir/)).toBeVisible();
expect(screen.getAllByRole("link", { name: /kaynağı aç/i }).length).toBeGreaterThanOrEqual(7);
```

Also assert `0,83 g/kg/gün` appears beside `nüfus referansı`, never beside `kişisel hedef`, and each quantitative visual has an HTML table and summary.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/components/articles/protein/protein-visual-essay.test.tsx`

- [ ] **Step 3: Implement the seven semantic sections**

Use the exact editorial arc in the spec. Keep every claim, evidence status, table, source note, and disclaimer in server-rendered HTML. The component does not own scroll calculations.

- [ ] **Step 4: Add accessible role score and reference rails**

The five protein roles are both SVG-labelled and repeated as a semantic list. Reference rails use labels and patterns as well as color. The 0.83 value is introduced with EFSA context.

- [ ] **Step 5: Pass focused tests and inspect heading/landmark order**

Run: `pnpm test src/components/articles/protein/protein-visual-essay.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/articles/protein src/app/journal/[slug]/page.tsx
git commit -m "feat: publish flagship protein essay"
```

---

### Task 6: Protein article visual system and scroll choreography

**Files:**
- Create: `src/components/articles/protein/protein-story-motion.tsx`
- Create: `src/components/articles/protein/protein-story-motion.test.tsx`
- Modify: `src/components/articles/protein/protein-visual-essay.tsx`
- Modify: `src/components/articles/protein/protein-visual-essay.module.css`

**Interfaces:**
- Consumes: seven `data-protein-scene` sections
- Produces: `data-protein-motion="full|reduced|static"`
- Produces CSS progress variables scoped per scene

- [ ] **Step 1: Write failing motion-profile tests**

Assert full desktop creates at most three pinned ScrollTriggers, reduced motion does not load GSAP, short landscape does not pin, reverse restores the opening frame, and cleanup removes all listeners/triggers.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/components/articles/protein/protein-story-motion.test.tsx`

- [ ] **Step 3: Implement scene-local choreography**

- Frame: `KAS` crop widens into five roles.
- Roles: the score activates one semantic line at a time.
- Turnover: build/work/dismantle layers expose in sequence.
- Digestion: SVG fibers separate into neutral amino-acid marks and recombine without organ-routing claims.
- Reference: three rails enter with evidence labels.
- Pattern: food-source chords align without ranking badges.
- Resolution: motion decelerates and hands off to native sources/related reading.

- [ ] **Step 4: Add static reduced-motion keyframes as authored stills**

The digestion sequence renders three labelled still panels. All copy and sources stay visible. No `position: sticky` remains active under reduced motion.

- [ ] **Step 5: Browser-check forward, reverse, focus, touch, and reduced motion**

Use desktop, portrait mobile, and short landscape. Confirm article completion does not depend on hovering or scrubbing.

- [ ] **Step 6: Pass tests and commit**

Run: `pnpm test src/components/articles/protein/protein-story-motion.test.tsx`

```bash
git add src/components/articles/protein
git commit -m "feat: animate protein visual essay"
```

---

### Task 7: Metadata, structured data, and publication discovery

**Files:**
- Create: `src/lib/metadata.ts`
- Create: `src/lib/metadata.test.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/not-found.tsx`
- Create: `src/app/not-found.module.css`
- Create: `src/app/opengraph-image.tsx`
- Modify: route `page.tsx` files to export metadata
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `SITE_URL`
- Produces: `buildPageMetadata(input): Metadata`
- Produces: `buildArticleJsonLd(article): Record<string, unknown>`

- [ ] **Step 1: Write failing metadata tests**

Assert Turkish locale, canonical URLs, metadata template, flagship OG fields, `Article` JSON-LD, sitemap inclusion for all static published routes, robots sitemap URL, and branded 404.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/lib/metadata.test.ts src/app/layout.test.tsx`

- [ ] **Step 3: Implement metadata helpers and per-route metadata**

Use `NEXT_PUBLIC_SITE_URL` with `http://localhost:3000` only outside production. Throw during a production release validation command when the canonical origin is missing.

- [ ] **Step 4: Implement article JSON-LD, sitemap, robots, OG image, and not-found state**

The OG image uses CALORYTHM typography, carbon/ivory, and coral fiber paths; no athlete, shaker, molecule icon, or clinical imagery.

- [ ] **Step 5: Pass tests and production build**

Run: `pnpm test src/lib/metadata.test.ts src/app/layout.test.tsx`

Run: `pnpm build`

- [ ] **Step 6: Commit**

```bash
git add src/lib/metadata* src/app/sitemap.ts src/app/robots.ts src/app/not-found* src/app/opengraph-image.tsx src/app/layout.tsx src/app/**/page.tsx
git commit -m "feat: add publication metadata and discovery"
```

---

### Task 8: Hero resilience, interaction semantics, and media budget

**Files:**
- Modify: `src/components/home/calorythm-measure-hero.tsx`
- Modify: `src/components/home/calorythm-measure-hero.module.css`
- Modify: `src/components/home/calorythm-measure-hero.test.tsx`
- Modify: `src/components/home/calorythm-measure-hero-css.test.ts`

**Interfaces:**
- Preserves: existing `data-home-scene="hero"` and copy-zone hooks
- Produces: correct native-flow state for short landscape and dynamic motion-preference changes

- [ ] **Step 1: Add RED tests for short landscape and preference changes**

Assert 667×375 uses native-flow/static composition with no heading/caption/seal overlap contract, and runtime `matchMedia` change toggles inspection/animation behavior without remount.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/components/home/calorythm-measure-hero.test.tsx src/components/home/calorythm-measure-hero-css.test.ts`

- [ ] **Step 3: Fix height-aware responsive composition**

At `max-height: 520px`, remove sticky chapter geometry, reduce figure dominance, keep the ring/caption in native flow, and preserve all three chapter texts.

- [ ] **Step 4: Correct anatomy inspection semantics**

Use a real toggle button with `aria-pressed` and textual description, or make the inspection purely decorative and remove the tab stop. Choose the toggle because the interaction is already discoverable and meaningful.

- [ ] **Step 5: Defer anatomy media**

Load one dominant stone frame immediately. Request adjacent conductor frames after first paint and skeleton frames only on idle or inspection intent. Keep the initial hero media request target under 500 KB.

- [ ] **Step 6: Pass focused/full tests and commit**

Run: `pnpm test src/components/home/calorythm-measure-hero.test.tsx src/components/home/calorythm-measure-hero-css.test.ts`

Run: `pnpm test`

```bash
git add src/components/home/calorythm-measure-hero*
git commit -m "fix: harden hero across motion and viewport profiles"
```

---

### Task 9: Release verification and origin delivery

**Files:**
- Create: `scripts/validate-release.mjs`
- Modify: `package.json`
- Create: `docs/release/calorythm-v1-checklist.md`
- Test: `scripts/validate-release.test.ts`

**Interfaces:**
- Produces: `pnpm validate:release`

- [ ] **Step 1: Write a failing release-validator test**

The validator must fail for missing production site URL, missing editorial contact URL, broken internal links, missing flagship references, missing sitemap routes, deployable source PNG masters, or console/asset errors reported by the browser smoke manifest.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test scripts/validate-release.test.ts`

- [ ] **Step 3: Implement the validator and release checklist**

Add `validate:release` to `package.json`. The command prints every external configuration still required; it never reports release-ready while canonical or editorial contact is absent.

- [ ] **Step 4: Run complete automated verification**

Run: `pnpm test`

Run: `pnpm lint`

Run: `pnpm exec tsc --noEmit`

Run: `pnpm build`

Run: `pnpm validate:release`

- [ ] **Step 5: Run browser release matrix**

Verify home start/mid/exit, every landing scene, Journal, all article states, Topics, About, 404, keyboard, mobile menu, touch/coarse pointer, reduced motion, and console at the required viewport matrix. Record evidence in the release checklist.

- [ ] **Step 6: Review repository changes and commit release hardening**

```bash
git add scripts package.json docs/release
git commit -m "chore: add v1 release validation"
```

- [ ] **Step 7: Configure and push origin after all gates pass**

Verify `origin` is `git@github.com:hakanurtimur/calorythm.git`, push the current feature branch, and report the exact two external release values still required if the owner has not supplied them:

- canonical production URL
- editorial contact URL

