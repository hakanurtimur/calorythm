# CALORYTHM Publishable Journal V1 — Design Specification

**Date:** 24 August 2026

**Status:** Approved creative direction

**Language:** Turkish

**Release objective:** Turn the current conductor cover prototype into a publishable independent nutrition-science journal with one complete flagship visual essay.

## 1. Product definition

CALORYTHM is an independent digital publication that explains nutrition science through evidence-led editorial stories. It is not a dietitian corporate website, a calorie tracker, a wellness landing page, or a visual-effects demo.

The first release must let a visitor understand three things without interpretation:

1. CALORYTHM publishes nutrition science.
2. Its editorial method separates claims, evidence, context, and explanation.
3. At least one substantial story is available to read now.

The launch experience should feel like a premium journal cover opening into a real publication. Motion supports comprehension and pacing; it is never the product promise.

## 2. Selected approach

The selected model is **Cover to Publication**.

The conductor hero remains the opening cover. After it, the site changes visual grammar scene by scene instead of forcing the same character or four bands to morph through the entire page. The four colored bands are the connective brand material: subsequent scenes use them as rules, masks, crop boundaries, evidence leaders, or a reading cursor, but never as one persistent object.

Two alternatives were rejected:

- **Continuous conductor:** keeping the figure across the full landing would become repetitive, compete with the writing, and increase media cost.
- **Pure magazine index:** a mostly static typographic index would ship faster but would undersell CALORYTHM's experiential editorial proposition.

## 3. V1 information architecture

### Required routes

- `/` — publication landing
- `/journal` — editorial index
- `/journal/protein-sadece-kas-icin-degildir` — flagship visual essay
- `/topics` — eight-topic index
- `/topics/[slug]` — topic introduction and related work
- `/about` — manifesto, editorial method, founder note, contribution principles
- `app/not-found.tsx` — branded not-found state for unknown routes
- `/sitemap.xml` and `/robots.txt`

### Public vocabulary

Use **Journal** as the named publication section and **Yazılar** in explanatory Turkish copy when clarity is more important than branding. Avoid mixing `dosya`, `makale`, and `hikâye` for the same object in one interface. The flagship is introduced as a **görsel dosya** and linked from Journal as a published story.

### Global navigation

Desktop and mobile navigation contain:

- Journal
- Konular
- Hakkında
- Yazar olarak katıl → `/about#katki`

The wordmark links to `/`. Navigation and footer are server-rendered, keyboard accessible, and usable without motion runtime.

## 4. Landing storyboard

The landing follows the rhythm `conduct → filter → examine → publish → browse → choose → join/settle`.

### Scene 00 — Orkestra / Cover

Keep the approved Renaissance conductor, apple, baton, anatomical inspection, separated headline/caption zones, real CALORYTHM wordmark, rhythm-ring seal, and four colored bands.

The three scroll chapters remain:

1. **Beslenmenin bir ritmi var.**

   CALORYTHM, beslenme bilimini görsel hikâyelerle anlatan bağımsız bir dijital yayın.

2. **Yediğimiz şey, yalnızca bir sayı değil.**

   Bir besini yalnızca kalorisiyle değil, bedenin onunla ne yaptığıyla birlikte ele alıyoruz.

3. **Beden sadece almaz. Cevap verir.**

   Sindirim, enerji, hareket, uyku ve toparlanma; aynı sistemin birbirini etkileyen parçalarıdır.

The hero ends with an authored exit: the figure settles, copy clears, and the four bands travel out through the right edge. The next scene enters independently. No cross-scene shape morph is used.

### Scene 01 — Gürültüden ölçüye

**Purpose:** Name the information problem CALORYTHM edits against.

**Headline:** Beslenme hakkında çok fazla kesin cümle var.

**Body:** Her gün yeni bir iddia dolaşıma giriyor. CALORYTHM, bu gürültünün içinde kaynağı, kanıtı ve bağlamı görünür hâle getirir.

Claims enter out of phase as typographic fragments. A horizontal shutter and editorial annotations align them into a single resolved statement. The four bands appear only as annotation leaders. The section does not use cards or icons.

### Scene 02 — Kanıt masası

**Purpose:** Explain the publication method and establish trust.

**Headline:** Bir iddiayı yayımlamadan önce, nereden geldiğine bakarız.

**Method:** Kaynak → Kanıtın gücü → Bağlam → Anlatım.

The existing macro material image is used as the evidence surface. Three masks expose its layers with restrained stagger. The explanatory text is always visible in the DOM and remains understandable without interaction.

### Scene 03 — Dosya 001

**Purpose:** Prove the publication exists by presenting a real flagship story.

**Title:** Protein Sadece Kas İçin Değildir

**Dek:** Kas, proteinin en görünür hikâyesi. Oysa proteinler aynı anda yapı kurar, tepkimeleri hızlandırır, molekül taşır, sinyal iletir ve savunmaya katılır.

**Metadata:** CALORYTHM Editorya · 9 dakika · Protein

**CTA:** Hikâyeyi oku

This is a full-width editorial cover, not a blog card. Protein-coral fibers separate into multiple functional paths, then pause. The CTA is a standard accessible link to the published article.

### Scene 04 — Journal river

**Purpose:** Make the landing behave like a publication index.

The flagship is followed by two published editorial notes, each concise and honest about its scope. Initial note titles:

- Bir proteini “kaliteli” yapan ne?
- Referans değer, hedef ve üst sınır aynı şey değildir

The layout is an asymmetrical magazine river: one lead story, two notes, and visible metadata. Equal card grids and disabled “yakında” cards are prohibited.

### Scene 05 — Konu atlası

**Purpose:** Support non-linear discovery.

The eight topics are:

- Protein
- Karbonhidrat
- Yağlar
- Enerji
- Metabolizma
- Lif
- Hidrasyon
- Mikro Besinler

Large typographic rows include permanent one-sentence definitions. Hover and focus may move one colored band as a reading cursor, but color is never the only indicator.

### Scene 06 — Açık masa / Final

**Purpose:** Explain contribution and close the publication loop.

**Headline:** İyi bilgi, iyi editörlükle büyür.

**Body:** CALORYTHM; beslenme bilimini özenle ele alan uzmanların, araştırmacıların ve yazarların katkılarına açıktır. Her metin kaynak, kapsam ve anlatım açısından editoryal süreçten geçer.

**CTA:** Katkı sürecini gör

The four bands converge into the rhythm-ring only here. The footer exposes Journal, Konular, Hakkında, editorial principles, copyright, and contact destination.

## 5. Landing motion language

Each scene receives one primary transition:

- Cover: conductor beat and bands exiting right
- Noise: horizontal shutter
- Method: evidence-mask exposure
- Flagship: material separation
- Journal: baseline reveal
- Topics: reading-cursor movement
- Final: band convergence into the ring

Rules:

- Pin only the cover and at most the first two explanatory scenes on desktop.
- Journal, topics, contribution, and footer use native scrolling.
- Do not stack simultaneous blur, scale, clip, opacity, and parallax effects.
- Do not use elastic or bounce easing.
- Reverse scroll restores deterministic scene state.
- No offscreen animation loop may remain active.
- Short landscape viewports use native flow instead of the desktop upper/lower pinned composition.
- Full-motion copy transitions must prevent two complete headlines or captions from occupying the same readable plane.

## 6. Flagship article

### Editorial package

- **Route:** `/journal/protein-sadece-kas-icin-degildir`
- **H1:** Protein Sadece Kas İçin Değildir
- **Eyebrow:** Bedenin bakım dili
- **Deck:** Kas, proteinin en görünür hikâyesi. Oysa proteinler aynı anda yapı kurar, tepkimeleri hızlandırır, molekül taşır, sinyal iletir ve savunmaya katılır.
- **Author:** CALORYTHM Editorya
- **Reading time:** 9 dakika
- **SEO title:** Protein Sadece Kas İçin Değildir | CALORYTHM
- **Meta description:** Protein, kasın ötesinde enzimleri, taşıma sistemlerini, bağışıklığı ve dokuların sürekli yenilenmesini nasıl kurar?
- **OG title:** Protein, bedenin bakım dilidir.

### Central thesis

Dietary protein is not a finished product that travels directly to muscle. Digestion breaks it into peptides and amino acids; the body uses those materials across continuously changing needs for structure, repair, transport, signalling, catalysis, and defence. “Enough protein” is a contextual question, not one universal personal target.

The article explains healthy-adult physiology. It does not prescribe an intake for children, pregnancy, disease treatment, weight loss, frail older adults, or elite athletes.

### Seven-scene article arc

#### 1. Kas, hikâyenin tamamı değil

The word **KAS** initially fills the viewport. Scroll widens the frame and reveals `enzim / taşıma / sinyal / savunma / yapı`. The scene corrects the cultural frame without denying muscle's genuine relationship to protein.

#### 2. Görünmeyen işler

An accessible SVG role score activates five lines: structure, catalysis, transport, signalling, and defence. Each line has one concrete example. A semantic list presents the same information.

#### 3. Beden bitmiş bir yapı değildir

A macro fiber surface shows three states: being built, working, and being dismantled. The article explains protein turnover and amino-acid reuse without using a sensational daily gram figure.

#### 4. Bir lokma, aynı biçimde kalmaz

Food-like fibers separate into peptides and amino-acid marks, then recombine into different patterns. The visual must not suggest that one amino acid follows a predetermined route to one organ.

#### 5. “Yeterli” tek bir sayı değildir

Three context rails distinguish:

- Population reference — EFSA `0.83 g/kg/day` for healthy adults
- Sport/training guidance — a context-dependent expert range
- Age/disease context — requires separate assessment

A permanent label states: **Referans ≠ hedef ≠ üst sınır.** No calculator is provided.

#### 6. Miktarın yanında örüntü var

Abstract food crops form an “amino-acid chord.” The scene explains indispensable amino-acid composition and digestibility while rejecting simplistic complete/incomplete and good/bad badges. Evidence labels distinguish `yerleşik`, `bağlama bağlı`, and `araştırılıyor`.

#### 7. Bakım dili

The motion slows and resolves into an open arrangement rather than a single perfect object. The conclusion asks not only “How many grams?” but “In which context, within which dietary pattern, and for what purpose?” Sources, editorial method, disclaimer, and related reading follow in native document flow.

## 7. Scientific safeguards

- `0.83 g/kg/day` is presented as a population reference, not a personal target, optimum, or upper limit.
- Acute muscle-protein synthesis is not substituted for long-term muscle gain or health outcomes.
- The publication does not claim that everyone needs more protein or that most people are protein deficient.
- Plant foods are not dismissed through a complete/incomplete binary.
- Protein powder is not presented as necessary.
- Healthy adults and chronic kidney disease are not placed under one safety statement.
- Observational associations between protein sources and health are not attributed to protein alone.
- Every quantitative visual includes an HTML table and a short “Bu grafik ne söylüyor?” explanation.
- Article footer: “Bu yazı genel bilimsel açıklamadır; kişisel beslenme veya tedavi önerisi değildir.”

### Core sources

- EFSA population reference intakes: https://www.efsa.europa.eu/en/press/news/120209
- WHO/FAO/UNU protein requirements: https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf
- FAO protein-quality evaluation: https://www.fao.org/4/i3124e/i3124e.pdf
- NCBI Bookshelf, cellular protein roles: https://www.ncbi.nlm.nih.gov/books/NBK9879/
- Waterlow, whole-body protein turnover: https://pubmed.ncbi.nlm.nih.gov/8527232/
- Nutrition and Athletic Performance joint position: https://pubmed.ncbi.nlm.nih.gov/26891166/
- KDIGO 2024 CKD guideline: https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf

## 8. Article motion and accessibility

- Text, headings, source notes, and data tables remain in logical DOM order.
- Decorative rhythm/conductor lines are hidden from assistive technology.
- Canvas or SVG is never the sole carrier of information.
- Hover, focus, keyboard, and touch have equivalent access to disclosed content.
- `prefers-reduced-motion` removes pinning, scrubbed typography, camera moves, and continuous oscillation.
- Reduced motion replaces the fiber-separation sequence with three labelled static frames.
- Mobile retains the full argument but reduces travel distance, render density, and pin duration.
- Evidence status always includes text and pattern, not color alone.

## 9. Content architecture

Content is independent from animation code.

### Article model

Each article record includes:

- slug
- title
- eyebrow
- deck
- author
- published date
- updated date when applicable
- reading time
- topic slugs
- cover metadata and alt text
- article type (`visual-essay` or `editorial-note`)
- publication status
- references
- related article slugs

### Modules

- `src/content/articles.ts`
- `src/content/topics.ts`
- `src/lib/content-selectors.ts`
- `src/lib/metadata.ts`
- `src/components/layout/`
- `src/components/editorial/`
- `src/components/scenes/home/`
- `src/components/articles/protein/`

The current `CalorythmMeasureHero` remains a focused client island. Below-fold landing markup is server-rendered and receives scene-local motion enhancement. The old global orbital store, the unused Three.js system, and the current conductor implementation are not mounted together.

## 10. Performance requirements

- First-load hero media target: at most 500 KB before user intent; defer anatomy frames until interaction or idle time.
- Initial route JavaScript target: at most 150 KB gzip excluding framework runtime.
- Mobile LCP target: ≤ 2.5 s on a representative throttled profile.
- CLS target: < 0.1.
- INP target: < 200 ms.
- Responsive images use explicit sizes and modern formats.
- Large source PNG masters are moved outside deployable `public/` output.
- Offscreen scene code and media are dynamically loaded only when useful.
- No animation handler performs repeated layout reads and writes in the same raw pointer or scroll event.

## 11. SEO and publication shell

Required before release:

- Turkish metadata template and canonical origin
- Per-route title, description, canonical, Open Graph, and Twitter metadata
- Article JSON-LD for the flagship
- Favicon and application icons
- `sitemap.ts`, `robots.ts`, and branded `not-found.tsx`
- Meaningful OG image and alt copy
- One H1 per route and correct heading hierarchy
- No broken, disabled, or “yakında” primary story CTA

## 12. Testing and release gates

### Automated

- Unit tests for published-article selectors and related-story logic
- Component tests for landmarks, heading order, metadata, sources, disclaimer, and links
- Motion tests for deterministic start, forward, reverse, exit, and reduced-motion states
- Browser bounding-box checks at `1920×1080`, `1440×900`, `1024×768`, `768×1024`, `390×844`, `667×375`, and `320×568`
- Navigation tests for desktop/mobile menu, every CTA, back navigation, unknown article/topic, and contribution path
- SEO tests for canonical, OG, Article JSON-LD, sitemap, robots, and 404
- Image-failure and JavaScript-disabled smoke checks

### Manual release gate

- Keyboard-only pass
- Coarse pointer/touch pass
- Full and reduced-motion visual pass
- Chrome, WebKit/Safari, and Firefox smoke pass
- Production build with no console errors or asset 404s
- Real canonical site origin supplied
- Real editorial contact destination supplied for `/about#katki`

## 13. V1 scope boundaries

V1 includes the landing, Journal index, one flagship visual essay, two short editorial notes, Topics index and topic pages, About/editorial method/contribution page, global shell, metadata, and release verification.

V1 does not include authentication, subscriptions, payments, CMS, search, comments, appointments, diet plans, calorie tracking, WebGL, or a contributor dashboard.

## 14. Definition of done

The release is complete when a first-time visitor can:

1. Understand CALORYTHM's editorial promise from the cover.
2. Understand how claims become published explanations.
3. Open and complete the flagship protein visual essay.
4. Inspect its sources and evidence boundaries.
5. Browse Journal and Topics without encountering dead ends.
6. Understand contribution principles and reach the configured contact destination.
7. Use every route on desktop, mobile, keyboard, touch, and reduced motion.

At that point the site may truthfully be described as a published independent digital nutrition journal rather than a visual prototype.
