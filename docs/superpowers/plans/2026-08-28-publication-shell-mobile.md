# CALORYTHM Publication Shell and Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a surface-aware animated publication header, a real-logo editorial footer, and a deliberately art-directed mobile landing without regressing the approved desktop scenes.

**Architecture:** Keep the static shell markup server-rendered and isolate browser behavior in small client controllers. Page surfaces publish an explicit `data-header-tone="light|dark"` contract; a requestAnimationFrame-batched controller samples the element beneath the fixed header. Mobile hero rendering is profile-aware so the server/pending state references one poster only, while the existing complete SVG composition mounts only for the desktop full-motion profile.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, CSS Modules, native IntersectionObserver/requestAnimationFrame, existing GSAP scene runtime, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-28-publication-shell-mobile-design.md`

## Global Constraints

- All public UI and editorial copy is Turkish.
- Existing desktop homepage scene art direction and content hierarchy remain intact.
- Header surface changes use explicit section contracts, never `mix-blend-mode` or hard-coded scroll offsets.
- Header and footer remain readable and usable before JavaScript hydration.
- Mobile hero pending/static/reduced profiles reference only the middle conductor poster; the full profile retains all three poses and anatomical inspection.
- Focus never escapes the open mobile navigation; Escape closes it and focus returns to the menu trigger.
- Shell motion uses transform, opacity, and color only and honors `prefers-reduced-motion`.
- No WebGL, smooth-scroll dependency, authentication, subscription, payment, CMS, or new product surface is added.
- Preserve unrelated dirty-worktree changes and do not delete dormant prototype files.

---

### Task 1: Surface-aware header and accessible navigation

**Files:**
- Create: `src/components/layout/publication-header-surface.tsx`
- Create: `src/components/layout/publication-header-surface.test.ts`
- Modify: `src/components/layout/publication-header.tsx`
- Modify: `src/components/layout/publication-menu.tsx`
- Modify: `src/components/layout/publication-shell.module.css`
- Modify: `src/components/layout/publication-shell.test.tsx`

**Interfaces:**
- Produces: `PublicationSurfaceTone = "light" | "dark"`
- Produces: `resolvePublicationSurfaceTone(elements: readonly Element[], fallback: PublicationSurfaceTone): PublicationSurfaceTone`
- Produces: `<PublicationHeaderSurface headerId fallbackTone />`
- Consumes: page elements carrying `data-header-tone="light|dark"`

- [ ] **Step 1: Write failing behavior tests**

```tsx
expect(resolvePublicationSurfaceTone([darkScene], "light")).toBe("dark");
expect(resolvePublicationSurfaceTone([unmarkedElement], "light")).toBe("light");

render(<PublicationHeader />);
expect(screen.getByRole("link", { name: "Yazılar" })).toHaveAttribute("href", "/journal");
expect(screen.getByRole("link", { name: "Konu Atlası" })).toHaveAttribute("href", "/topics");
expect(screen.getByRole("link", { name: "Yayın" })).toHaveAttribute("href", "/about");
expect(screen.getByRole("link", { name: "Fikir gönder" })).toHaveAttribute("href", "/about#katki");
```

Add a mobile-menu test that opens the menu, verifies focus moves to its first link, loops Tab from the last item to the first, closes on Escape, and restores focus to the button.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `pnpm test src/components/layout/publication-header-surface.test.ts src/components/layout/publication-shell.test.tsx`

Expected: FAIL because the tone resolver/controller, new vocabulary, inverse logo layer, and focus containment do not exist.

- [ ] **Step 3: Implement the minimal shell controller and menu behavior**

The controller samples `document.elementsFromPoint(window.innerWidth / 2, header.getBoundingClientRect().bottom + 1)`, ignores the header subtree, resolves the nearest tone contract, and writes `data-surface` plus `data-compact`. Scroll and resize events schedule one shared requestAnimationFrame; cleanup cancels it and removes listeners.

The menu stores the trigger, focuses the first link on open, contains Tab/Shift+Tab inside the panel, closes on Escape or navigation, restores body overflow, and restores trigger focus.

- [ ] **Step 4: Implement the visual states**

Layer primary and inverse wordmarks in one fixed footprint. Crossfade them with opacity while header background, foreground, border, and height transition over 300–360ms. Mobile navigation uses the dark surface, large Bodoni link rows, safe-area padding, and `overflow-y: auto`.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test src/components/layout/publication-header-surface.test.ts src/components/layout/publication-shell.test.tsx`

Expected: PASS.

---

### Task 2: Real-logo editorial footer

**Files:**
- Create: `public/brand/calorythm-wordmark-inverse.svg`
- Create: `src/components/layout/publication-footer-motion.tsx`
- Modify: `src/components/brand/brand-wordmark.tsx`
- Modify: `src/components/layout/publication-footer.tsx`
- Modify: `src/components/layout/publication-shell.module.css`
- Modify: `src/components/layout/publication-shell.test.tsx`

**Interfaces:**
- Extends: `<BrandWordmark variant="primary|inverse" />`
- Produces: `<PublicationFooterMotion rootId />`
- Footer publishes: `data-header-tone="dark"`

- [ ] **Step 1: Write failing footer tests**

```tsx
render(<PublicationFooter />);
expect(screen.getByRole("link", { name: "CALORYTHM ana sayfa" }))
  .toContainElement(document.querySelector('[data-brand-wordmark="inverse"]'));
expect(screen.getByRole("heading", { name: "Oku" })).toBeVisible();
expect(screen.getByRole("heading", { name: "Yayın" })).toBeVisible();
expect(screen.getByRole("heading", { name: "Katkı" })).toBeVisible();
expect(screen.getByText("İçerikler kişisel sağlık önerisi değildir.")).toBeVisible();
```

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/components/layout/publication-shell.test.tsx`

Expected: FAIL because the inverse wordmark and editorial colophon hierarchy do not exist.

- [ ] **Step 3: Add the inverse asset and typed wordmark variant**

The inverse SVG changes only the CAL/RYTHM fills from `#20211E` to `#F6F1E8`; the four ring strokes remain unchanged. `BrandWordmark` maps variants to explicit asset paths and data attributes.

- [ ] **Step 4: Implement the footer hierarchy and reveal**

Render the real wordmark, promise, three semantic navigation/information groups, four-line baseline, and bottom rail. The client enhancer observes the footer once and sets `data-visible="true"`; default CSS remains visible and reduced motion removes transforms/delays.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test src/components/layout/publication-shell.test.tsx`

Expected: PASS.

---

### Task 3: Mobile landing art direction and asset budget

**Files:**
- Modify: `src/components/home/calorythm-measure-hero.tsx`
- Modify: `src/components/home/calorythm-measure-hero.module.css`
- Modify: `src/components/home/calorythm-measure-hero.test.tsx`
- Modify: `src/components/home/publication-home.tsx`
- Modify: `src/components/home/publication-home.module.css`
- Modify: `src/components/home/publication-home.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Page scenes publish `data-header-tone="light|dark"`.
- Hero publishes `data-hero-visual="poster|full"`.
- Full-motion profile preserves the existing three-pose SVG contract.

- [ ] **Step 1: Write failing mobile behavior tests**

```tsx
vi.stubGlobal("innerWidth", 390);
vi.stubGlobal("innerHeight", 844);
render(<CalorythmMeasureHero />);
await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("data-hero-visual", "poster"));
expect(document.querySelectorAll('[data-conductor-frame]')).toHaveLength(0);
expect(document.querySelectorAll('[data-mask-source="skeleton"]')).toHaveLength(0);
```

Add a homepage test asserting the exact tone sequence: hero light, noise dark, method light, flagship dark, journal light, topics light, contribution dark.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm test src/components/home/calorythm-measure-hero.test.tsx src/components/home/publication-home.test.tsx`

Expected: FAIL because the pending/static poster branch and tone contracts do not exist.

- [ ] **Step 3: Add profile-aware hero rendering**

Pending/static/reduced render one middle-pose poster with the four rhythm paths and one cover chapter. Full profile mounts the existing complete SVG and all three semantic chapters. Preserve a single accessible image name and avoid duplicate eager images.

- [ ] **Step 4: Apply scene-level mobile composition**

At ≤767px: use a single 100svh cover composition; constrain the folio to the local viewport; place the apostrophe behind copy; clamp flagship media to 22–27rem; raise metadata to ≥0.72rem; reduce Journal line field height; preserve 44px topic rows; position contribution art inside the frame and correct its responsive `sizes` value. At 768–1023px, use two-column/tablet decisions only where content stays legible.

Update global `scroll-padding-top` to the shell height and apply safe-area insets without introducing root-level horizontal movement.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test src/components/home/calorythm-measure-hero.test.tsx src/components/home/calorythm-measure-hero-css.test.ts src/components/home/publication-home.test.tsx`

Expected: PASS.

---

### Task 4: Integrated verification and visual QA

**Files:**
- Modify only files required by failures found during verification.

**Interfaces:**
- Consumes the completed header, footer, tone contracts, and mobile layouts.

- [ ] **Step 1: Run automated verification**

Run: `pnpm test`

Run: `pnpm lint`

Run: `pnpm exec tsc --noEmit`

Run: `pnpm build`

Expected: all commands exit 0 without new warnings.

- [ ] **Step 2: Run browser QA**

Inspect `/` at 390×844, 430×932, 768×1024, 1280×720, and 1440×900. Confirm header tone at every scene boundary, no horizontal overflow, no copy occlusion, coherent image crops, reachable mobile navigation/footer links, and correct focus restoration.

- [ ] **Step 3: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm the header/footer are immediately visible, menu interaction remains complete, and no scroll-linked shell motion remains.

- [ ] **Step 4: Review the final diff against the spec**

Verify every Global Constraint and record any intentional ruling before reporting completion.
