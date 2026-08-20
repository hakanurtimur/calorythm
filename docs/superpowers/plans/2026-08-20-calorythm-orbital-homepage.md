# CALORYTHM Orbital Editorial Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete CALORYTHM homepage—Splash, Hero and Sections 01–07—as a premium 2D orbital editorial experience with Turkish copy and restrained scroll-driven motion.

**Architecture:** Render all editorial content as Server Components inside `HomeExperience`; isolate browser-only splash behaviour and GSAP orchestration in two narrow Client Components. Reuse one exact four-path `OrbitalMark` and one `OrbitalLink` across every scene, with scene-specific composition expressed through CSS classes and stable `data-motion` contracts.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, CSS Modules, inline SVG, GSAP 3.15 + ScrollTrigger, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-20-calorythm-orbital-homepage-design.md`

## Global Constraints

- Public content is Turkish and must not sell `scroll`, `animasyon` or `interaktif makale` as product features.
- Use only `#F6F1E8`, `#20211E`, `#F3A65A`, `#EA735D`, `#C79A45`, `#A7BE89` and opacity mixes derived from them.
- The orbital mark contains exactly four official authored SVG paths; never replace them with generated curves.
- No Canvas, WebGL, Three.js, video, Lenis, custom cursor, generic cards, bento layout, gradients or glass surfaces on the homepage.
- One page `h1`; Sections 01–07 use ordered `h2` headings.
- Full content must be readable without GSAP.
- Desktop may pin Hero, Section 02 and Section 04 only. Mobile and constrained-motion profiles never pin.
- Reduced motion and Save Data remove splash delay, scrub, pinning, path drawing and continuous loops.
- Preserve the user's existing unrelated working-tree changes.

---

## File Map

### Create

- `src/content/orbital-home.ts` — typed Turkish homepage content and section/topic identifiers.
- `src/content/orbital-home.test.ts` — copy, topic count and prohibited-language contract.
- `src/components/orbital/orbital-paths.ts` — immutable official path data and colours.
- `src/components/orbital/orbital-mark.tsx` — reusable four-path inline SVG.
- `src/components/orbital/orbital-link.tsx` — semantic link/unavailable CTA primitive.
- `src/components/orbital/orbital.module.css` — mark and CTA visual language.
- `src/components/orbital/orbital.test.tsx` — path identity and CTA semantics.
- `src/components/home/home-splash.tsx` — skippable opening signature.
- `src/components/home/home-splash.test.tsx` — timed, skipped and reduced-motion states.
- `src/components/home/home-experience.tsx` — Server Component page composition.
- `src/components/home/home-experience.test.tsx` — headings, sections, lists and no-Canvas contract.
- `src/components/home/home-motion.tsx` — dynamic GSAP/ScrollTrigger client boundary.
- `src/components/home/home-motion.test.tsx` — motion profiles, trigger order and cleanup.
- `src/components/home/home.module.css` — complete editorial art direction and responsive composition.
- `src/app/layout.test.tsx` — application-shell skip-link ownership and destination.

### Modify

- `src/app/page.tsx` — mount `HomeExperience`.
- `src/app/globals.css` — global overflow, focus, selection and reduced-motion base rules.
- `src/components/motion/motion-profile.ts` — add desktop-height awareness for safe pinning.
- `src/components/motion/motion-profile.test.ts` — cover width/height pin rules.

### Remove after replacement is green

- `src/components/hero/hero-experience.tsx`
- `src/components/hero/hero-experience.test.tsx`
- `src/components/hero/hero-motion.tsx`
- `src/components/hero/hero-rings-stage.tsx`
- `src/components/hero/hero-state-store.ts`
- `src/components/hero/hero-state-store.test.ts`
- `src/components/hero/hero.module.css`

The older committed Scene 01–03/Three.js prototype remains unmounted and untouched in this slice; its removal is a separate repository-cleanup decision.

---

### Task 1: Typed Turkish Content Contract

**Files:**
- Create: `src/content/orbital-home.ts`
- Create: `src/content/orbital-home.test.ts`

**Interfaces:**
- Produces: `orbitalHomeContent`, `JournalTopic`, `MacroRoute`, `OrbitalSectionId`.
- Consumed by: `HomeExperience` in Task 4.

- [ ] **Step 1: Write the failing content test**

```ts
import { describe, expect, it } from "vitest";
import { orbitalHomeContent } from "./orbital-home";

describe("orbitalHomeContent", () => {
  it("defines Hero and Sections 01–07 in Turkish editorial order", () => {
    expect(orbitalHomeContent.hero.title).toBe("Beslenmenin bir ritmi var.");
    expect(orbitalHomeContent.sections.map((section) => section.id)).toEqual([
      "01", "02", "03", "04", "05", "06", "07",
    ]);
    expect(orbitalHomeContent.journalTopics).toHaveLength(8);
    expect(orbitalHomeContent.journalTopics.map((topic) => topic.title)).toEqual([
      "Protein", "Karbonhidrat", "Yağlar", "Metabolizma",
      "Enerji Dengesi", "Lif", "Hidrasyon", "Mikro Besinler",
    ]);
  });

  it("sells understanding rather than implementation features", () => {
    const publicCopy = JSON.stringify(orbitalHomeContent).toLocaleLowerCase("tr");
    expect(publicCopy).not.toMatch(/interaktif makale|scroll|animasyon/);
    expect(publicCopy).toContain("anlaşılmasını sağlamak");
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test src/content/orbital-home.test.ts`  
Expected: FAIL because `./orbital-home` does not exist.

- [ ] **Step 3: Implement the typed content object**

```ts
export type OrbitalSectionId = "01" | "02" | "03" | "04" | "05" | "06" | "07";

export type MacroRoute = {
  id: "protein" | "karbonhidrat" | "yag";
  title: string;
  statement: string;
  tone: "coral" | "orange" | "olive";
};

export type JournalTopic = {
  id: string;
  title: string;
  description: string;
  tone: "orange" | "coral" | "ochre" | "olive";
};

export const orbitalHomeContent = {
  splash: { label: "CALORYTHM", statement: "Beslenmenin bir ritmi var." },
  hero: {
    title: "Beslenmenin bir ritmi var.",
    body: "Beslenme bilimini; görsel hikâyeler ve deneyimlenen anlatılarla yeniden keşfet.",
    cta: "Keşfet",
  },
  sections: [
    {
      id: "01",
      title: ["Bilgiyi okumak kolaydır.", "Anlamak zordur."],
      body: "CALORYTHM bilgiyi içerik olarak bırakmaz. Her konu, bağlantıları görünür kılan ve adım adım açılan bir hikâyeye dönüşür.",
    },
    {
      id: "02",
      title: ["Her konu,", "kendi hikâyesini anlatır."],
      body: "Her hikâye tek bir fikrin peşinden gider; onu parçalarına ayırır, bağlamına yerleştirir ve yeniden kurar.",
    },
    {
      id: "03",
      title: ["Karmaşık olanı,", "anlaşılır hâle getiriyoruz."],
      body: "Beslenme biliminin en çok yanlış anlaşılan konularını; sade, görsel ve bilimsel bir anlatımla yeniden ele alıyoruz.",
    },
    {
      id: "04",
      title: ["Bir makale okumuyorsun.", "Bir düşüncenin içine giriyorsun."],
      body: "Her hikâye kendi anlatım dilini kurar. Büyük fikirler açılır, veriler bağlam kazanır, parçalar birbirine bağlanır.",
      emphasis: "Amaç yalnızca bilgi vermek değil. Anlaşılmasını sağlamak.",
    },
    {
      id: "05",
      title: ["Protein Sadece", "Kas İçin Değildir"],
      body: "Protein denince aklına ilk kas geliyor olabilir. Oysa beden, proteini bundan çok daha fazlası için kullanır.",
      emphasis: "Bu hikâye, proteine yeniden bakmanı sağlayacak.",
    },
    { id: "06", title: ["Keşfetmeye", "devam et."] },
    {
      id: "07",
      title: ["Merak iyi bir", "başlangıçtır."],
      body: "Her hafta yeni hikâyeler. Yeni araştırmalar. Yeni bakış açıları.",
      emphasis: "Beslenme bilimini ezberlerle değil, anlayarak keşfet.",
    },
  ] satisfies ReadonlyArray<{
    id: OrbitalSectionId;
    title: readonly [string, string];
    body?: string;
    emphasis?: string;
  }>,
  topicAtlas: ["Metabolizma", "Enerji Dengesi", "Lif", "Hidrasyon", "Mikro Besinler"],
  macroRoutes: [
    { id: "protein", title: "Protein", statement: "Protein yalnızca protein değildir.", tone: "coral" },
    { id: "karbonhidrat", title: "Karbonhidrat", statement: "Karbonhidrat yalnızca enerji değildir.", tone: "orange" },
    { id: "yag", title: "Yağ", statement: "Yağ yalnızca depolanan kalori değildir.", tone: "olive" },
  ] satisfies readonly MacroRoute[],
  journalTopics: [
    { id: "protein", title: "Protein", description: "Yapı, onarım ve çok daha fazlası.", tone: "coral" },
    { id: "karbonhidrat", title: "Karbonhidrat", description: "Enerjinin en yanlış anlaşılan yüzü.", tone: "orange" },
    { id: "yaglar", title: "Yağlar", description: "Depolamaktan çok daha fazlası.", tone: "olive" },
    { id: "metabolizma", title: "Metabolizma", description: "Beden enerjiyi nasıl yönetiyor?", tone: "ochre" },
    { id: "enerji-dengesi", title: "Enerji Dengesi", description: "Bir sayıdan daha fazlası.", tone: "orange" },
    { id: "lif", title: "Lif", description: "Sindirimin ötesindeki görevleri.", tone: "olive" },
    { id: "hidrasyon", title: "Hidrasyon", description: "Su gerçekten ne yapar?", tone: "coral" },
    { id: "mikro-besinler", title: "Mikro Besinler", description: "Küçük miktarlar, büyük etkiler.", tone: "ochre" },
  ] satisfies readonly JournalTopic[],
} as const;
```

- [ ] **Step 4: Run the content test and verify GREEN**

Run: `pnpm test src/content/orbital-home.test.ts`  
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/content/orbital-home.ts src/content/orbital-home.test.ts
git commit -m "feat: define orbital homepage content"
```

---

### Task 2: Orbital Brand Primitives

**Files:**
- Create: `src/components/orbital/orbital-paths.ts`
- Create: `src/components/orbital/orbital-mark.tsx`
- Create: `src/components/orbital/orbital-link.tsx`
- Create: `src/components/orbital/orbital.module.css`
- Create: `src/components/orbital/orbital.test.tsx`

**Interfaces:**
- Produces: `OrbitalMark({ variant, tone, className })` and `OrbitalLink({ href, unavailable, children })`.
- `variant`: `"signature" | "frame" | "atlas" | "portal" | "finale"`.
- `tone`: `"brand" | "ivory" | "ink"`.
- Consumed by: Splash and all homepage sections.

- [ ] **Step 1: Write the failing primitive tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrbitalLink } from "./orbital-link";
import { OrbitalMark } from "./orbital-mark";

describe("orbital primitives", () => {
  it("renders the four official independently addressable paths", () => {
    const { container } = render(<OrbitalMark tone="brand" variant="signature" />);
    expect(container.querySelectorAll("[data-orbit-path]")).toHaveLength(4);
    expect(Array.from(container.querySelectorAll("[data-orbit-path]"), (path) => path.getAttribute("data-orbit-path"))).toEqual([
      "orange", "coral", "ochre", "olive",
    ]);
  });

  it("never renders a dead link for unavailable destinations", () => {
    render(<OrbitalLink unavailable>Hikâyeyi keşfet</OrbitalLink>);
    expect(screen.getByText("Hikâyeyi keşfet")).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("link", { name: /hikâyeyi keşfet/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the primitive test and verify RED**

Run: `pnpm test src/components/orbital/orbital.test.tsx`  
Expected: FAIL because the components do not exist.

- [ ] **Step 3: Add immutable official path data**

```ts
export const orbitalPaths = [
  { id: "orange", color: "#F3A65A", d: "M50 6C76 5 94 25 93 51C92 78 74 95 48 94C22 93 5 75 7 48C9 22 25 7 50 6Z" },
  { id: "coral", color: "#EA735D", d: "M48 7C72 4 92 23 94 48C96 73 77 92 52 95C27 98 7 78 6 53C5 28 23 10 48 7Z" },
  { id: "ochre", color: "#C79A45", d: "M51 5C77 8 94 27 91 54C88 80 69 96 44 92C19 88 4 68 8 43C12 18 28 3 51 5Z" },
  { id: "olive", color: "#A7BE89", d: "M46 8C71 3 91 18 95 43C99 68 83 90 58 94C33 98 11 83 6 58C1 33 21 13 46 8Z" },
] as const;
```

- [ ] **Step 4: Implement `OrbitalMark` and `OrbitalLink`**

```tsx
export function OrbitalMark({ variant, tone, className }: OrbitalMarkProps) {
  return (
    <svg aria-hidden="true" className={className} data-orbit-mark={variant} data-tone={tone} viewBox="0 0 128 128">
      <g transform="translate(8 8) scale(1.12)">
        {orbitalPaths.map((path) => (
          <path data-orbit-path={path.id} d={path.d} key={path.id} stroke={tone === "brand" ? path.color : "currentColor"} />
        ))}
      </g>
    </svg>
  );
}

export function OrbitalLink({ href, unavailable = false, children }: OrbitalLinkProps) {
  const content = <><span>{children}</span><i aria-hidden="true">→</i></>;
  return unavailable || !href
    ? <span aria-disabled="true" className={styles.orbitalLink}>{content}</span>
    : <a className={styles.orbitalLink} href={href}>{content}</a>;
}
```

In `orbital.module.css`, enforce a 44px minimum target, circular arrow terminal, visible focus and brand-colour arc. Path styles use round caps/joins and preserve the `1.9` source stroke width.

- [ ] **Step 5: Run the primitive test and verify GREEN**

Run: `pnpm test src/components/orbital/orbital.test.tsx`  
Expected: PASS, 2 tests.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/components/orbital
git commit -m "feat: add orbital brand primitives"
```

---

### Task 3: Accessible Splash and Motion Profile

**Files:**
- Create: `src/components/home/home-splash.tsx`
- Create: `src/components/home/home-splash.test.tsx`
- Modify: `src/components/motion/motion-profile.ts`
- Modify: `src/components/motion/motion-profile.test.ts`

**Interfaces:**
- Produces: `HomeSplash({ durationOverride? })` and `MotionProfile { animate: boolean; pin: boolean; splashDuration: number }`.
- Splash exits after `1750ms` desktop/tablet, `900ms` mobile, `0ms` reduced motion or Save Data.

- [ ] **Step 1: Extend the motion-profile test RED**

```ts
expect(readMotionProfile(() => ({ reducedMotion: false, saveData: false, width: 1440, height: 900 }))).toEqual({
  animate: true,
  pin: true,
  splashDuration: 1750,
});
expect(readMotionProfile(() => ({ reducedMotion: false, saveData: false, width: 390, height: 844 }))).toEqual({
  animate: true,
  pin: false,
  splashDuration: 900,
});
expect(readMotionProfile(() => ({ reducedMotion: true, saveData: false, width: 1440, height: 900 }))).toEqual({
  animate: false,
  pin: false,
  splashDuration: 0,
});
```

- [ ] **Step 2: Run the profile test and verify RED**

Run: `pnpm test src/components/motion/motion-profile.test.ts`  
Expected: FAIL because `height` and `splashDuration` are absent.

- [ ] **Step 3: Implement the safe motion profile**

Add `height` to `MotionEnvironment`. Pin only when animation is allowed, width is at least `768`, and height is at least `700`. Return `splashDuration: 0 | 900 | 1750` using the rules above.

- [ ] **Step 4: Write the splash behaviour test RED**

```tsx
it("can be dismissed by the explicit skip control", () => {
  render(<HomeSplash durationOverride={1750} />);
  fireEvent.click(screen.getByRole("button", { name: "İntroyu geç" }));
  expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
});

it("can be dismissed from the full splash surface", () => {
  render(<HomeSplash durationOverride={1750} />);
  fireEvent.pointerDown(screen.getByTestId("home-splash"));
  expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
});

it("dismisses automatically after the selected profile duration", () => {
  vi.useFakeTimers();
  render(<HomeSplash durationOverride={900} />);
  act(() => vi.advanceTimersByTime(900));
  expect(screen.queryByTestId("home-splash")).not.toBeInTheDocument();
  vi.useRealTimers();
});
```

- [ ] **Step 5: Run the splash test and verify RED**

Run: `pnpm test src/components/home/home-splash.test.tsx`  
Expected: FAIL because `HomeSplash` does not exist.

- [ ] **Step 6: Implement `HomeSplash`**

Use a Client Component with one `visible` state, one timeout effect, one `keydown` listener for `Escape`/`Enter`, and an `onPointerDown` dismiss handler on the splash surface. Production calls `readMotionProfile()` inside the Client Component; `durationOverride` exists only for deterministic tests. Render `OrbitalMark`, wordmark text, approved statement and a 44px skip button. When the resolved duration is `0`, return `null` immediately; do not create a timeout.

- [ ] **Step 7: Run both Task 3 test files and verify GREEN**

Run: `pnpm test src/components/motion/motion-profile.test.ts src/components/home/home-splash.test.tsx`  
Expected: PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/components/motion/motion-profile.ts src/components/motion/motion-profile.test.ts src/components/home/home-splash.tsx src/components/home/home-splash.test.tsx
git commit -m "feat: add accessible orbital splash"
```

---

### Task 4: Semantic Homepage Structure and Hero

**Files:**
- Create: `src/components/home/home-experience.tsx`
- Create: `src/components/home/home-experience.test.tsx`
- Create: `src/components/home/home.module.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `orbitalHomeContent`, `OrbitalMark`, `OrbitalLink`, `HomeSplash`.
- Produces: server-rendered `HomeExperience` with stable `data-scene="hero|01|02|03|04|05|06|07"` hooks.

- [ ] **Step 1: Write the failing semantic page test**

```tsx
const { container } = render(<HomeExperience />);
expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
  "Bilgiyi okumak kolaydır. Anlamak zordur.",
  "Her konu, kendi hikâyesini anlatır.",
  "Karmaşık olanı, anlaşılır hâle getiriyoruz.",
  "Bir makale okumuyorsun. Bir düşüncenin içine giriyorsun.",
  "Protein Sadece Kas İçin Değildir",
  "Keşfetmeye devam et.",
  "Merak iyi bir başlangıçtır.",
]);
expect(container.querySelectorAll("[data-scene]")).toHaveLength(8);
expect(container.querySelector("canvas")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the page test and verify RED**

Run: `pnpm test src/components/home/home-experience.test.tsx`  
Expected: FAIL because `HomeExperience` does not exist.

- [ ] **Step 3: Implement the server-rendered page shell**

`HomeExperience` must render in this order:

1. `HomeSplash`.
2. Fixed/sticky semantic header with official wordmark and valid hash links `#journal`, `#konular`, `#hakkinda`.
3. Hero section with one `h1`, approved body, `OrbitalLink href="#section-01"`, `OrbitalMark variant="frame"`.
4. Sections 01–07 using semantic `section`, ordered `h2`, lists for macros and topics, and unique IDs.

Wrap the static Server Component children with `<HomeMotion>` only after Task 6 creates it; until then render the semantic tree directly so Task 4 stays green without GSAP.

- [ ] **Step 4: Add baseline CSS composition**

Create palette variables, 12-column desktop grid, 1600px maximum width, `clamp(2rem, 5vw, 6rem)` gutters, Manrope/Bodoni/IBM Plex roles, section minimum heights and the no-JS visible state. Do not add pin-specific styles yet.

- [ ] **Step 5: Point `src/app/page.tsx` at `HomeExperience`**

```tsx
import { HomeExperience } from "@/components/home/home-experience";

export default function Home() {
  return <main id="ana-icerik" tabIndex={-1}><HomeExperience /></main>;
}
```

- [ ] **Step 6: Run Task 4 test and verify GREEN**

Run: `pnpm test src/components/home/home-experience.test.tsx src/content/orbital-home.test.ts src/components/orbital/orbital.test.tsx`  
Expected: PASS.

- [ ] **Step 7: Commit Task 4**

```bash
git add src/app/page.tsx src/components/home/home-experience.tsx src/components/home/home-experience.test.tsx src/components/home/home.module.css
git commit -m "feat: build orbital homepage structure"
```

---

### Task 5: Authored Editorial Compositions for Sections 01–07

**Files:**
- Modify: `src/components/home/home-experience.tsx`
- Modify: `src/components/home/home-experience.test.tsx`
- Modify: `src/components/home/home.module.css`

**Interfaces:**
- Adds stable motion hooks consumed by Task 6: `hero-mark`, `hero-copy`, `knowledge-fragment`, `macro-route`, `topic-atlas-item`, `thought-aperture`, `flagship-mark`, `journal-topic`, `finale-mark`.

- [ ] **Step 1: Extend the test with the authored editorial contracts RED**

```tsx
expect(screen.getByRole("list", { name: "Makro besin rotaları" }).children).toHaveLength(3);
expect(screen.getByRole("list", { name: "Beslenme konuları" }).children).toHaveLength(5);
expect(screen.getByRole("list", { name: "Journal konuları" }).children).toHaveLength(8);
expect(container.querySelectorAll('[data-motion="journal-topic"]')).toHaveLength(8);
expect(container.querySelectorAll('[data-orbit-mark]')).toHaveLength(7);
expect(screen.getByText("Hikâyeyi keşfet")).toHaveAttribute("aria-disabled", "true");
```

- [ ] **Step 2: Run the page test and verify RED**

Run: `pnpm test src/components/home/home-experience.test.tsx`  
Expected: FAIL on missing list labels, marks and motion hooks.

- [ ] **Step 3: Implement Sections 01–04 compositions**

- Section 01: broken orbital rule, three nutrition fragments, two-line headline.
- Section 02: one stable orbital track and a semantic three-item macro list; each item gets `data-tone` from content.
- Section 03: five-item typographic atlas with mono indexes and short annotations.
- Section 04: ink field, ivory copy and `OrbitalMark tone="ivory" variant="portal"`; render `Anlaşılmasını sağlamak.` as the final emphasis line.

- [ ] **Step 4: Implement Sections 05–07 compositions**

- Section 05: coral field, `İLK HİKÂYE / 001`, flagship title/body and unavailable `OrbitalLink`.
- Section 06: semantic eight-topic ordered list inside `data-journal-orbit`; each topic has index, title, description and `data-tone`.
- Section 07: exact finale mark, approved closing copy and `OrbitalLink href="#journal"`.

- [ ] **Step 5: Complete the authored CSS states**

Use no card containers. Build compositions with grid placement, type scale, hairlines, clipped orbital SVG crops and solid colour fields. Section 04 is the only ink background; Section 05 uses coral; all other reading fields are ivory.

- [ ] **Step 6: Run Task 5 test and verify GREEN**

Run: `pnpm test src/components/home/home-experience.test.tsx`  
Expected: PASS.

- [ ] **Step 7: Commit Task 5**

```bash
git add src/components/home/home-experience.tsx src/components/home/home-experience.test.tsx src/components/home/home.module.css
git commit -m "feat: author complete editorial scene system"
```

---

### Task 6: Scroll-Driven Motion Orchestration

**Files:**
- Create: `src/components/home/home-motion.tsx`
- Create: `src/components/home/home-motion.test.tsx`
- Modify: `src/components/home/home-experience.tsx`
- Modify: `src/components/home/home.module.css`

**Interfaces:**
- Produces: `HomeMotion({ children, loadRuntime? })` with `data-motion-profile="pending|full|reduced"`.
- Runtime interface contains `gsap`, `ScrollTrigger` and supports dependency injection in tests.

- [ ] **Step 1: Write constrained-profile tests RED**

Adapt the existing `home-scene-orchestrator.test.tsx` environment harness and assert:

```tsx
expect(container.firstChild).toHaveAttribute("data-motion-profile", "reduced");
expect(loadRuntime).not.toHaveBeenCalled();
expect(runtime.gsap.registerPlugin).not.toHaveBeenCalled();
```

Cover both `prefers-reduced-motion: reduce` and `navigator.connection.saveData === true`.

- [ ] **Step 2: Write full-profile trigger ownership test RED**

Use an injected fake runtime whose `gsap.timeline` and `ScrollTrigger.create` are `vi.fn()` mocks, whose returned timeline exposes chainable `fromTo`/`to` methods, and whose `matchMedia.add` immediately invokes the desktop callback. Read the real mock calls rather than adding test-only methods to the production runtime:

```ts
const timelineTriggers = runtime.gsap.timeline.mock.calls.map(([config]) => ({
  trigger: config.scrollTrigger.trigger,
  pin: config.scrollTrigger.pin,
}));

expect(timelineTriggers).toEqual([
  { trigger: '[data-scene="hero"]', pin: '[data-pin="hero"]' },
  { trigger: '[data-scene="01"]', pin: undefined },
  { trigger: '[data-scene="02"]', pin: '[data-pin="02"]' },
  { trigger: '[data-scene="03"]', pin: undefined },
  { trigger: '[data-scene="04"]', pin: '[data-pin="04"]' },
  { trigger: '[data-scene="05"]', pin: undefined },
  { trigger: '[data-scene="07"]', pin: undefined },
]);

const topicTriggers = runtime.ScrollTrigger.create.mock.calls.filter(([config]) =>
  String(config.trigger).includes('[data-motion="journal-topic"]'),
);
expect(topicTriggers).toHaveLength(8);
```

- [ ] **Step 3: Run the motion test and verify RED**

Run: `pnpm test src/components/home/home-motion.test.tsx`  
Expected: FAIL because `HomeMotion` does not exist.

- [ ] **Step 4: Implement the client orchestration boundary**

Requirements:

- Dynamically import `gsap` and `gsap/ScrollTrigger` only when `readMotionProfile().animate` is true.
- Register ScrollTrigger once per configured runtime.
- Use `gsap.matchMedia(scope)` and `gsap.context()` cleanup.
- Create triggers in DOM order.
- Use desktop pinning only when `profile.pin` is true.
- Use `scrub` values `0.55–0.8`; scrub timelines use `ease: "none"`.
- Set active Journal topic through `data-active="true"` on the corresponding list item; remove it on leave-back.
- Revert media/context when reduced motion or Save Data changes after load.
- Call `ScrollTrigger.refresh()` after `document.fonts.ready` if the component remains mounted.

- [ ] **Step 5: Encode exact scene beats**

| Scene | Start / End | Main beat |
|---|---|---|
| Hero | `top top` / `+=80%` | mark scale `1 → 1.55`, copy opacity lowers after 75% |
| 01 | `top 82%` / `bottom 30%` | fragments move `y: 24 → 0`, headline resolves |
| 02 | `top top` / `+=160%` desktop | three macro routes activate sequentially |
| 03 | `top 78%` / `bottom 24%` | atlas terms reveal in authored order |
| 04 | `top top` / `+=140%` desktop | aperture scale `0.62 → 1.28`, final line resolves |
| 05 | `top 76%` / `bottom 24%` | flagship title and portal enter |
| 06 | CSS sticky | eight topic activation triggers at `top 58%` |
| 07 | `top 78%` / `bottom 20%` | four finale paths draw and settle |

- [ ] **Step 6: Wrap server children with `HomeMotion`**

In `HomeExperience`, render `<HomeMotion>{staticServerRenderedSections}</HomeMotion>`. Do not import content components into `home-motion.tsx`; pass them as children to preserve the narrow client boundary.

- [ ] **Step 7: Run motion and semantic tests GREEN**

Run: `pnpm test src/components/home/home-motion.test.tsx src/components/home/home-experience.test.tsx src/components/motion/motion-profile.test.ts`  
Expected: PASS.

- [ ] **Step 8: Commit Task 6**

```bash
git add src/components/home/home-motion.tsx src/components/home/home-motion.test.tsx src/components/home/home-experience.tsx src/components/home/home.module.css
git commit -m "feat: choreograph orbital homepage scroll"
```

---

### Task 7: Responsive, Accessibility and Legacy-Hero Cutover

**Files:**
- Modify: `src/components/home/home.module.css`
- Modify: `src/components/orbital/orbital.module.css`
- Modify: `src/app/globals.css`
- Modify: `src/components/home/home-experience.test.tsx`
- Create: `src/app/layout.test.tsx`
- Remove: `src/components/hero/*`

**Interfaces:**
- Preserves all prior public interfaces.
- Final homepage contains no imports from `src/components/hero`, `@react-three/fiber`, `@react-three/drei` or `three`.

- [ ] **Step 1: Add the final accessibility regression assertions RED**

```tsx
expect(screen.getAllByRole("link").every((link) => link.getAttribute("href")?.length)).toBe(true);
expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(1);
expect(container.querySelector("canvas")).not.toBeInTheDocument();
expect(container.querySelector("video")).not.toBeInTheDocument();
```

Add the shell-owned skip-link assertion to `src/app/layout.test.tsx`:

```tsx
const markup = renderToStaticMarkup(<RootLayout><main id="ana-icerik">İçerik</main></RootLayout>);
const document = new DOMParser().parseFromString(markup, "text/html");
const skipLink = document.querySelector('a[href="#ana-icerik"]');
expect(skipLink?.textContent).toBe("Ana içeriğe geç");
```

- [ ] **Step 2: Run the semantic test and verify RED**

Run: `pnpm test src/components/home/home-experience.test.tsx src/app/layout.test.tsx`  
Expected: FAIL on any missing valid destination, skip-link ownership or unavailable state.

- [ ] **Step 3: Implement desktop/tablet/mobile CSS contracts**

- Desktop: `min-width: 64rem`, 12-column layouts, three pin-capable scene viewports, sticky Journal orbit.
- Tablet: `48rem–63.9375rem`, shorter hero composition, normal-flow Section 02 below `700px` viewport height.
- Mobile: `max-width: 47.9375rem`, no sticky/pin layout dependency, all topics as a vertical list, orbital marks used as crops, `1rem` body copy and safe-area gutters.
- All real controls use a minimum `2.75rem` target.
- `@media (prefers-reduced-motion: reduce)` exposes all content and removes loops/transforms.

- [ ] **Step 4: Remove the superseded active hero files**

Before removal, run `rg -n "components/hero|hero-experience|hero-motion" src` and confirm only the old files reference each other. Remove the listed `src/components/hero/*` files with `apply_patch`; do not remove the older Scene 01–03 prototype or Three.js packages in this task.

- [ ] **Step 5: Run technical verification GREEN**

```bash
pnpm test src/content/orbital-home.test.ts src/components/orbital/orbital.test.tsx src/components/home/home-splash.test.tsx src/components/home/home-experience.test.tsx src/components/home/home-motion.test.tsx src/components/motion/motion-profile.test.ts
pnpm test src/app/layout.test.tsx
pnpm exec tsc --noEmit
pnpm lint
```

Expected: every command exits `0`; test output contains no React accessibility or act warnings.

- [ ] **Step 6: Commit Task 7**

```bash
git add src/app/globals.css src/app/layout.test.tsx src/components/home src/components/orbital
git commit -m "fix: harden orbital homepage across motion profiles"
```

The current `src/components/hero` directory is untracked. Remove those files from the filesystem with `apply_patch`, confirm the directory is absent, and do not stage a nonexistent path.

---

### Task 8: Production Build and User Visual Handoff

**Files:**
- Modify only if verification exposes a scoped issue.

**Interfaces:**
- Produces a buildable homepage at `/` and a development preview at `http://localhost:3100/`.

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`  
Expected: all suites pass. If an old unmounted-prototype test fails because its contract was intentionally unchanged, fix the regression rather than deleting the test.

- [ ] **Step 2: Run the production build**

Run: `pnpm build`  
Expected: Next.js exits `0`; `/` is generated successfully.

- [ ] **Step 3: Confirm the route responds without visual judging**

With the existing dev server on port `3100`, request `/` and confirm HTTP `200`. Do not take design screenshots or make subjective visual adjustments; the user performs the visual review.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff --check` and `git status --short`. Confirm no generated Playwright, build, cache or `tsbuildinfo` artifact was added by this plan.

- [ ] **Step 5: Commit verification fixes, if any**

If Task 8 required source changes, stage only those exact files and commit:

```bash
git commit -m "fix: polish orbital homepage delivery"
```

If Task 8 required no source changes, do not create an empty commit.

---

## Final Acceptance Checklist

- [ ] Splash, Hero and Sections 01–07 appear in semantic order.
- [ ] All approved public copy is Turkish and contains no implementation-feature marketing.
- [ ] Every orbital graphic uses the exact four official paths.
- [ ] Homepage has no Canvas, WebGL, video or continuous render loop.
- [ ] Only Hero, Section 02 and Section 04 can pin on eligible desktop viewports.
- [ ] Mobile and constrained profiles render all content in normal flow.
- [ ] Splash is skippable and introduces no constrained-profile delay.
- [ ] Article CTA is explicitly unavailable rather than dead.
- [ ] Journal CTA targets the in-page Journal index.
- [ ] One `h1`, seven ordered `h2` headings, semantic lists and valid focus targets.
- [ ] Targeted tests, full suite, typecheck, lint and production build pass.
- [ ] User receives the running preview for their own visual review.
