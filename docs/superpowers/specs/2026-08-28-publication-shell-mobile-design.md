# CALORYTHM Publication Shell and Mobile Art Direction

**Date:** 28 August 2026

**Status:** Approved

**Scope:** Global header, global footer, and the landing page at mobile/tablet widths. Editorial route content and desktop scene art direction remain intact.

## Selected direction

Use a **surface-aware editorial shell**. The fixed header reads an explicit `data-header-tone` contract from the surface directly beneath it instead of relying on hard-coded scroll distances or `mix-blend-mode`.

- Light surfaces use an ivory header, ink navigation, and the primary CALORYTHM wordmark.
- Dark surfaces use an ink header, ivory navigation, and a purpose-built inverse CALORYTHM wordmark whose four-color rhythm ring stays unchanged.
- Tone and compact-state transitions are restrained, deterministic, and based on opacity, color, and transform only.
- The header remains visible; it does not hide on scroll or jitter across pinned scenes.
- Mobile navigation is a full-screen editorial panel with focus containment, Escape support, focus return, safe-area padding, and scrollable overflow.

The rejected alternatives are `mix-blend-mode`, which corrupts the wordmark colors and produces uncertain contrast, and scene-specific fixed ScrollTrigger offsets, which are brittle across viewport changes and route content.

## Header vocabulary

- Yazılar → `/journal`
- Konu Atlası → `/topics`
- Yayın → `/about`
- Fikir gönder ↗ → `/about#katki`

`Journal` remains the masthead name of the editorial index, not the global navigation label.

## Footer composition

The footer is a near-black editorial colophon, not a generic site footer.

1. A large real inverse CALORYTHM wordmark and the promise: “Beslenme bilimini kaynakları, sınırları ve gündelik karşılığıyla anlatan bağımsız dijital dergi.”
2. Three borderless information columns: Oku, Yayın, Katkı.
3. A bottom rail containing © 2026 CALORYTHM, “Bağımsız yayın”, and “İçerikler kişisel sağlık önerisi değildir.”

The four brand lines enter as a quiet baseline accent. Footer content is visible without JavaScript; an IntersectionObserver only adds a progressive reveal class.

## Mobile landing rules

- Test art direction at 390×844, 430×932, and 768×1024; confirm desktop at 1280×720 and 1440×900.
- Mobile hero uses one poster frame and one clear cover message. Desktop-only conductor frames, masks, and skeleton assets are not mounted until the full-motion profile is active.
- Editorial copy never sits under the fixed header. Hash targets account for the header height.
- Noise apostrophe remains behind the copy and never reduces body contrast.
- The folio becomes the visual anchor of the method scene, without 116vw root overflow.
- Flagship media height uses a viewport-aware clamp instead of a 32rem hard minimum.
- Journal’s four lines become a compact opener on mobile, followed by readable rows.
- Topic rows preserve 44px touch targets and definitions.
- Contribution art returns inside the frame with an honest responsive `sizes` value and copy-first contrast.
- Small mono metadata never drops below 0.72rem on mobile.
- Safe-area insets are applied to header, menu, page gutters, and footer.
- `prefers-reduced-motion` removes reveal delays and all scroll-linked shell movement.

## Accessibility and performance

- Semantic landmarks, one `h1`, heading order, meaningful alt text, visible focus, and keyboard navigation remain intact.
- Header tone changes are decorative; content meaning never depends on them.
- Motion uses transforms/opacity and requestAnimationFrame batching. No GSAP runtime is added to the global shell.
- Mobile first-load must not reference the two inactive conductor poses, three skeletons, or three masks.
- The footer and header are fully legible before hydration.
