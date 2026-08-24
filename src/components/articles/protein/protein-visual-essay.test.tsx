import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getArticleBySlug } from "@/lib/content-selectors";
import { ProteinVisualEssay } from "./protein-visual-essay";

function getFlagshipFixture() {
  const article = getArticleBySlug("protein-sadece-kas-icin-degildir");

  if (!article) {
    throw new Error("Flagship protein article fixture is missing");
  }

  return article;
}

const flagship = getFlagshipFixture();

const expectedScenes = [
  "frame",
  "roles",
  "turnover",
  "digestion",
  "reference",
  "pattern",
  "resolution",
] as const;

const expectedSceneHeadings = [
  "Kas, hikâyenin tamamı değil",
  "Görünmeyen işler",
  "Beden bitmiş bir yapı değildir",
  "Bir lokma, aynı biçimde kalmaz",
  "“Yeterli” tek bir sayı değildir",
  "Miktarın yanında örüntü var",
  "Bakım dili",
] as const;

const expectedSourceIds = [
  "protein-source-efsa-adult-pri",
  "protein-source-who-protein-requirements",
  "protein-source-fao-protein-quality",
  "protein-source-ncbi-protein-roles",
  "protein-source-waterlow-turnover",
  "protein-source-sport-position",
  "protein-source-kdigo-ckd",
] as const;

const essayStyles = readFileSync(
  resolve(
    process.cwd(),
    "src/components/articles/protein/protein-visual-essay.module.css",
  ),
  "utf8",
);

function cssRule(source: string, selector: string, startAt = 0) {
  const selectorIndex = source.indexOf(selector, startAt);
  expect(selectorIndex, `missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const openingBrace = source.indexOf("{", selectorIndex);
  const closingBrace = source.indexOf("}", openingBrace);

  return source
    .slice(openingBrace + 1, closingBrace)
    .replace(/\s+/g, " ")
    .trim();
}

function renderEssay() {
  return render(<ProteinVisualEssay article={flagship} />);
}

afterEach(cleanup);

describe("ProteinVisualEssay", () => {
  it("renders the prologue and seven scenes in the approved reading order", () => {
    renderEssay();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Protein Sadece Kas İçin Değildir",
      }),
    ).toBeVisible();

    const scenes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-protein-scene]"),
    );
    expect(scenes.map((scene) => scene.dataset.proteinScene)).toEqual(expectedScenes);
    expect(
      scenes.map((scene) => within(scene).getByRole("heading", { level: 2 }).textContent),
    ).toEqual(expectedSceneHeadings);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(9);
    expect(screen.getByRole("heading", { level: 2, name: "Kaynaklar" })).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "İlgili okumalar" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Bu yazı sağlıklı yetişkinlerde protein fizyolojisini açıklar; çocuklar, gebeler, hastalık tedavisi görenler, kilo vermeye çalışanlar, kırılganlığı olan ileri yaştaki yetişkinler ve elit sporcular için kişisel protein alımı önermez.",
      ),
    ).toBeVisible();
    expect(screen.getByText("02 / İşlevler")).toBeVisible();
    expect(screen.getByText("05 / Referans değerler")).toBeVisible();
    expect(screen.getByText("07 / Sonuç")).toBeVisible();
  });

  it("makes the five-role score understandable with or without its SVG", () => {
    renderEssay();

    expect(
      screen.getByRole("img", { name: "Proteinlerin bedendeki beş rolü" }),
    ).toBeVisible();
    const list = screen.getByRole("list", { name: "Proteinlerin beş rolü" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
    expect(within(list).getByText(/Yapı/).closest("li")).toHaveTextContent("Kolajen");
    expect(within(list).getByText(/Kataliz/).closest("li")).toHaveTextContent("Enzim");
    expect(within(list).getByText(/Taşıma/).closest("li")).toHaveTextContent(
      "HemoglobinOksijeni kanda taşır.",
    );
    expect(within(list).getByText(/Sinyal/).closest("li")).toHaveTextContent(
      "İnsülinKan şekeri düzenlenmesinde hücrelere sinyal iletir.",
    );
    expect(within(list).getByText(/Savunma/).closest("li")).toHaveTextContent(
      "AntikorBelirli antijenleri tanır ve onlara bağlanır.",
    );
    expect(
      screen.getByRole("img", { name: "Proteinlerin bedendeki beş rolü" }),
    ).toHaveAccessibleDescription(
      "Beş yatay çizgi; proteinlerin yapı, kataliz, taşıma, sinyal ve savunma görevlerini örnekleriyle gösterir.",
    );
    expect(document.querySelectorAll("[data-protein-frame-role]")).toHaveLength(5);
    expect(document.querySelectorAll("[data-protein-role]")).toHaveLength(5);
    expect(cssRule(essayStyles, ".scoreRule {")).toMatch(
      /stroke-dasharray:\s*720(?:px)?(?:;|$)/i,
    );
  });

  it("keeps turnover and digestion legible as three labelled static states", () => {
    renderEssay();

    const turnoverStates = Array.from(
      document.querySelectorAll<HTMLElement>("[data-protein-turnover-state]"),
    );
    const digestionStates = Array.from(
      document.querySelectorAll<HTMLElement>("[data-protein-digestion-state]"),
    );

    expect(turnoverStates.map((state) => state.dataset.proteinTurnoverState)).toEqual([
      "building",
      "working",
      "dismantling",
    ]);
    expect(turnoverStates.map((state) => state.textContent)).toEqual([
      expect.stringContaining("Kuruluyor"),
      expect.stringContaining("İş görüyor"),
      expect.stringContaining("Parçalanıyor"),
    ]);
    expect(
      screen.getByText(
        "Protein dönüşümü şunu gösterir: vücuttaki protein yapıları sabit değildir; sürekli yenilenir.",
      ),
    ).toBeVisible();
    expect(digestionStates.map((state) => state.dataset.proteinDigestionState)).toEqual([
      "food",
      "peptides",
      "amino-acids",
    ]);
    expect(digestionStates.map((state) => state.textContent)).toEqual([
      expect.stringContaining("Besin proteini"),
      expect.stringContaining("PeptitlerSindirim sırasında oluşan daha kısa amino asit zincirleri."),
      expect.stringContaining(
        "Amino asitlerSindirim ve emilimden sonra dolaşımdaki amino asit havuzuna katılır.",
      ),
    ]);

    const turnoverBody = flagship.body.find(
      (section) => section.heading === "Beden bitmiş bir yapı değildir",
    )?.paragraphs[0];
    expect(turnoverBody).toBe(
      "Vücut proteinleri sürekli sentezlenir, işlev görür ve parçalanır. Açığa çıkan amino asitlerin bir bölümü yeniden kullanılır.",
    );

    const digestionBody = flagship.body.find(
      (section) => section.heading === "Bir lokma, aynı biçimde kalmaz",
    )?.paragraphs[0];
    expect(digestionBody).toBe(
      "Besinlerdeki protein sindirim sırasında daha küçük peptitlere ve amino asitlere ayrılır. Emilen amino asitler dolaşıma katılır; vücut bunları değişen yapı, onarım, taşıma, sinyal, kataliz ve savunma gereksinimlerinde kullanır.",
    );
  });

  it("separates population, sport, and assessment contexts without turning them into targets", () => {
    renderEssay();

    const reference = document.querySelector<HTMLElement>(
      '[data-protein-scene="reference"]',
    );
    expect(reference).not.toBeNull();
    expect(reference).toHaveTextContent("Referans ≠ hedef ≠ üst sınır.");

    const rails = Array.from(
      reference!.querySelectorAll<HTMLElement>("[data-protein-reference-rail]"),
    );
    expect(rails.map((rail) => rail.dataset.proteinReferenceRail)).toEqual([
      "population",
      "sport",
      "assessment",
    ]);
    expect(rails[0]).toHaveTextContent(/EFSA/i);
    expect(rails[0]).toHaveTextContent(/sağlıklı yetişkin/i);
    expect(rails[0]).toHaveTextContent("0,83 g/kg/gün");
    expect(rails[0]).toHaveTextContent(/nüfus referansı/i);
    expect(rails[0]).toHaveTextContent(
      /kilogram vücut ağırlığı başına günlük 0,83 gram/i,
    );
    expect(rails[0]).toHaveTextContent(
      /EFSA’nın sağlıklı yetişkinler için belirlediği nüfus referans alımıdır \(PRI\)/i,
    );
    expect(rails[0]).toHaveTextContent(/kişisel hedef|optimum|üst sınır/i);
    expect(rails[1]).toHaveTextContent(/Sporcu beslenmesi bağlamı/i);
    expect(rails[1]).toHaveTextContent(/2016 ortak uzman pozisyonu/i);
    expect(rails[1]).toHaveTextContent("1,2–2,0 g/kg/gün");
    expect(rails[1]).toHaveTextContent(/düzenli ve yapılandırılmış antrenman yapan sporcular/i);
    expect(rails[1]).toHaveTextContent(/CALORYTHM kişisel önerisi değildir/i);
    expect(rails[1]).toHaveTextContent(/antrenman türü ve dönemi, enerji alımı ve hedefler/i);
    expect(rails[2]).toHaveTextContent(
      "Çocukluk, gebelik, kırılgan ileri yaş ve hastalık",
    );
    expect(rails[2]).toHaveTextContent("Bağlama özgü değerler");
    expect(rails[2]).toHaveTextContent(
      "Çocukluk ve gebelik için yaşa veya döneme özgü referanslar vardır. Kırılganlığı olan ileri yaştaki yetişkinlerde ve kronik böbrek hastalığında ise protein alımı bireysel klinik değerlendirme gerektirir.",
    );
    expect(rails[2]).not.toHaveTextContent(/g\/kg|mg|gram/i);
    expect(reference).toHaveTextContent(
      /EFSA’nın sağlıklı yetişkinler için nüfus referansı, sporcu rehberliği ve klinik değerlendirme birbirinin yerine kullanılamaz/i,
    );

    const tableRegion = within(reference!).getByRole("region", {
      name: "Protein referans bağlamları tablosu",
    });
    expect(tableRegion).toHaveAttribute("data-protein-table-scroll");
    expect(within(tableRegion).getByRole("table")).toBeVisible();
    expect(
      within(tableRegion).getByRole("rowheader", {
        name: "Sporcular için 2016 ortak pozisyonu",
      }),
    ).toBeVisible();
    expect(
      within(tableRegion).getByRole("rowheader", {
        name: "Çocukluk, gebelik, kırılgan ileri yaş ve hastalık",
      }),
    ).toBeVisible();
    expect(
      within(tableRegion).getByText(
        "Yaşa veya döneme özgü referans ya da bireysel klinik değerlendirme gerekir.",
      ),
    ).toBeVisible();
    expect(within(reference!).getByText("Bu grafik ne söylüyor?")).toBeVisible();
    expect(reference).not.toHaveTextContent(/hesapla|hesaplayıcı/i);
    expect(
      reference!.querySelector(
        '[data-source-note][href="#protein-source-efsa-adult-pri"]',
      ),
    ).toHaveTextContent("EFSA yetişkin PRI tanımı");
    expect(
      reference!.querySelector(
        '[data-source-note][href="#protein-source-kdigo-ckd"]',
      ),
    ).toHaveTextContent(
      "Kronik böbrek hastalığında protein alımının ayrı klinik değerlendirilmesi",
    );
  });

  it("labels evidence status with visible text and a non-color pattern", () => {
    renderEssay();

    const statuses = Array.from(
      document.querySelectorAll<HTMLElement>("[data-protein-evidence-status]"),
    );
    expect(statuses.map((status) => status.dataset.proteinEvidenceStatus)).toEqual([
      "established",
      "contextual",
      "researching",
    ]);
    expect(statuses.map((status) => status.textContent)).toEqual([
      expect.stringContaining("Yerleşik"),
      expect.stringContaining("Bağlama bağlı"),
      expect.stringContaining("Veri sınırı · 2013"),
    ]);
    expect(statuses[1]).toHaveTextContent(/öğündeki diğer protein kaynakları/i);
    expect(statuses[2]).toHaveTextContent(/FAO.*2013/i);
    expect(statuses[2]).toHaveTextContent(/o tarihte/i);
    expect(statuses[2]).toHaveTextContent(
      /gerçek ileal amino asit sindirilebilirliği verileri/i,
    );
    statuses.forEach((status) => {
      expect(status.querySelector("[data-evidence-pattern]")).not.toBeNull();
    });
  });

  it("traces scene notes to seven stable footer sources with descriptive links", () => {
    renderEssay();

    const sources = screen.getByRole("list", { name: "Kaynaklar" });
    const sourceItems = within(sources).getAllByRole("listitem");
    expect(sourceItems).toHaveLength(7);
    expect(sourceItems.map((item) => item.id)).toEqual(expectedSourceIds);

    expectedSourceIds.forEach((id) => {
      expect(document.querySelector(`[data-source-note][href="#${id}"]`)).not.toBeNull();
    });

    const externalSources = within(sources).getAllByRole("link", {
      name: /^Kaynağı aç:/i,
    });
    expect(externalSources).toHaveLength(7);
    externalSources.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringMatching(/^https:\/\//));
    });
    expect(
      within(sources).getByText(
        "Whole-body protein turnover in humans--past, present, and future",
      ),
    ).toBeVisible();
    expect(within(sources).getByText("Annual Review of Nutrition")).toBeVisible();
  });

  it("finishes in native flow with the exact disclaimer, method, and related order", () => {
    renderEssay();

    expect(
      screen.getByText(
        "Bu yazı genel bilimsel açıklamadır; kişisel beslenme veya tedavi önerisi değildir.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Editoryal yöntem" }),
    ).toHaveAttribute("href", "/about#editorial-method");
    const related = screen.getByRole("list", { name: "İlgili okumalar" });
    expect(within(related).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Bir proteini “kaliteli” yapan ne?",
      "Referans değer, hedef ve üst sınır aynı şey değildir",
    ]);
    expect(document.querySelector("[data-protein-resolution]")).toBeVisible();
  });

  it("limits the client motion boundary to seven scenes and pins only scenes one, four, and six", () => {
    renderEssay();

    const article = screen.getByRole("article");
    const motionRoot = article.querySelector<HTMLElement>("[data-protein-motion]");
    const prologue = article.querySelector("header");
    const footer = article.querySelector("footer");
    expect(motionRoot).not.toBeNull();
    expect(prologue).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(motionRoot).not.toContainElement(prologue);
    expect(motionRoot).not.toContainElement(footer);
    expect(
      Array.from(motionRoot!.querySelectorAll<HTMLElement>("[data-protein-scene]")).map(
        (scene) => scene.dataset.proteinScene,
      ),
    ).toEqual(expectedScenes);

    const pins = Array.from(
      motionRoot!.querySelectorAll<HTMLElement>("[data-protein-pin]"),
    );
    expect(pins.map((pin) => pin.dataset.proteinPin)).toEqual([
      "frame",
      "digestion",
      "pattern",
    ]);
    expect(
      pins.map((pin) => pin.closest<HTMLElement>("[data-protein-scene]")?.dataset.proteinScene),
    ).toEqual(["frame", "digestion", "pattern"]);
    const digestionStills = screen.getByRole("list", {
      name: "Protein sindiriminin üç görünümü",
    });
    const chord = article.querySelector<HTMLElement>('[data-protein-art="pattern"]');
    expect(pins[1]).toContainElement(digestionStills);
    expect(pins[1]).not.toBe(digestionStills);
    expect(pins[2]).toContainElement(chord);
    expect(pins[2]).not.toBe(chord);
    expect(motionRoot!.querySelectorAll("[data-protein-frame-word]")).toHaveLength(1);
    expect(motionRoot!.querySelectorAll("[data-protein-score-rule]")).toHaveLength(5);
    expect(motionRoot!.querySelectorAll("[data-protein-role-copy]")).toHaveLength(5);
    expect(motionRoot!.querySelectorAll("[data-protein-turnover-visual]")).toHaveLength(1);
    expect(motionRoot!.querySelectorAll("[data-protein-digestion-visual]")).toHaveLength(1);
    expect(motionRoot!.querySelectorAll("[data-protein-digestion-focus]")).toHaveLength(1);
    expect(motionRoot!.querySelectorAll("[data-protein-chord-row]")).toHaveLength(3);
    expect(motionRoot!.querySelectorAll("[data-protein-resolution-mark]")).toHaveLength(5);
  });

  it("uses the three responsive lazy protein-story images as the primary scene art", () => {
    renderEssay();

    const art = Array.from(
      document.querySelectorAll<HTMLElement>("[data-protein-art]"),
    );
    expect(art.map((item) => item.dataset.proteinArt)).toEqual([
      "material",
      "digestion",
      "pattern",
    ]);
    const images = art.map((item) => item.querySelector<HTMLImageElement>("img"));
    expect(images.every(Boolean)).toBe(true);
    expect(images.map((image) => decodeURIComponent(image?.getAttribute("src") ?? ""))).toEqual([
      expect.stringContaining("/images/protein-story/protein-material-v1.webp"),
      expect.stringContaining("/images/protein-story/protein-digestion-v1.webp"),
      expect.stringContaining("/images/protein-story/protein-pattern-v1.webp"),
    ]);
    images.forEach((image) => {
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("width", "1586");
      expect(image).toHaveAttribute("height", "992");
      expect(image).toHaveAttribute("sizes", expect.stringMatching(/vw/));
      expect(image).toHaveAttribute("alt", "");
    });
    expect(images.map((image) => image?.getAttribute("sizes"))).toEqual([
      "(min-width: 1024px) calc(100vw - 17rem), 100vw",
      "(min-width: 1024px) calc(100vw - 11rem), 100vw",
      "(min-width: 1024px) calc(100vw - 23rem), 100vw",
    ]);

    expect(art).toHaveLength(3);
    expect(document.querySelectorAll("[data-protein-digestion-focus]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-protein-pattern-slice]")).toHaveLength(3);
    const patternSliceImages = Array.from(
      document.querySelectorAll<HTMLImageElement>("[data-protein-pattern-slice] img"),
    );
    expect(patternSliceImages).toHaveLength(3);
    patternSliceImages.forEach((image) => {
      expect(decodeURIComponent(image.src)).toContain(
        "/images/protein-story/protein-pattern-v1.webp",
      );
      expect(image).toHaveAttribute("alt", "");
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute(
        "sizes",
        "(min-width: 1024px) calc(100vw - 23rem), 100vw",
      );
    });
    expect(screen.getByText(/proteinlerin sürekli kurulmasını.*malzeme akışı/i)).toBeVisible();
    expect(screen.getByText(/sindirimin ölçeği nasıl küçülttüğünü.*moleküler yapı çizimi değildir/i)).toBeVisible();
    expect(screen.getByText(/şeritler farklı bileşim örüntülerini temsil eder/i)).toBeVisible();

    expect(document.querySelector(".fiberBuilding, .fiberWorking, .fiberDismantling")).toBeNull();
    expect(essayStyles).not.toMatch(
      /\.(?:fiberBuilding|fiberWorking|fiberDismantling|foodFiber|peptideMarks|aminoMarks)\s*\{/,
    );
    expect(cssRule(essayStyles, ".materialImage {")).toMatch(/aspect-ratio:\s*16\s*\/\s*9/i);
    expect(cssRule(essayStyles, ".materialImage img {")).toMatch(/object-position:\s*right center/i);
    expect(cssRule(essayStyles, ".patternSlices i {")).not.toMatch(/background-image|url\(/i);
    expect(cssRule(essayStyles, '.evidencePattern[data-evidence-pattern="contextual"] {'))
      .not.toMatch(/repeating-linear-gradient/i);
    expect(cssRule(essayStyles, '.evidencePattern[data-evidence-pattern="contextual"] {'))
      .toMatch(/radial-gradient\(circle, var\(--ink\)/i);
    expect(cssRule(essayStyles, '.evidencePattern[data-evidence-pattern="researching"] {'))
      .toMatch(/radial-gradient\(circle, transparent/i);
    expect(screen.getByText("Kuruluyor")).toBeVisible();
    expect(screen.getByText("İş görüyor")).toBeVisible();
    expect(screen.getByText("Parçalanıyor")).toBeVisible();
    expect(screen.getByText("Besin proteini")).toBeVisible();
    expect(screen.getByText("Peptitler")).toBeVisible();
    expect(screen.getByText("Amino asitler")).toBeVisible();
  });

  it("uses natural Turkish while preserving the scientific safeguards", () => {
    renderEssay();

    const article = screen.getByRole("article");
    expect(article).toHaveTextContent(
      "Proteinler bedende tek bir işle sınırlı değildir; farklı dokularda farklı görevler üstlenir.",
    );
    expect(article).toHaveTextContent(
      "Protein dönüşümü şunu gösterir: vücuttaki protein yapıları sabit değildir; sürekli yenilenir.",
    );
    expect(article).toHaveTextContent(/besinleri “tam” ya da “eksik” diye etiketlemek/i);
    expect(article).toHaveTextContent(
      "Şeritler farklı bileşim örüntülerini temsil eder; renk, uzunluk ve parça sayısı nicel değer ya da sıralama değildir.",
    );
    const conclusion =
      "Hangi bağlamda, hangi beslenme örüntüsü içinde ve ne amaçla? Protein için anlamlı yanıt, bu üç soruyu birlikte düşünmekle başlar.";
    expect(article).toHaveTextContent(conclusion);
    expect(article).not.toHaveTextContent(/protein ailesi|sansasyonel|tamamlanmamış|kusursuz nesne/i);

    const scopeBoundary =
      "Bu yazı sağlıklı yetişkinlerde protein fizyolojisini açıklar; çocuklar, gebeler, hastalık tedavisi görenler, kilo vermeye çalışanlar, kırılganlığı olan ileri yaştaki yetişkinler ve elit sporcular için kişisel protein alımı önermez.";
    expect(
      flagship.body.find(
        (section) => section.heading === "“Yeterli” tek bir sayı değildir",
      )?.paragraphs[0],
    ).toBe(
      `EFSA’nın sağlıklı yetişkinler için 0,83 g/kg/gün nüfus referansı, kişisel hedef, optimum ya da üst sınır değildir. ${scopeBoundary}`,
    );
    expect(
      flagship.body.find((section) => section.heading === "Bakım dili")?.paragraphs[0],
    ).toBe(conclusion);

    const patternBody = flagship.body.find(
      (section) => section.heading === "Miktarın yanında örüntü var",
    )?.paragraphs[0];
    expect(patternBody).toMatch(/vazgeçilmez amino asitlerin dağılımı/i);
    expect(patternBody).toMatch(/sindirilebilirlik/i);
    expect(patternBody).toMatch(/genel beslenme örüntüsü/i);
    expect(patternBody).not.toMatch(/tamamlanmamış|protein tozu|gözlemsel ilişki/i);

    const qualityNote = getArticleBySlug("protein-kalitesi-ne-demek");
    expect(qualityNote?.body.map((section) => section.paragraphs[0])).toEqual([
      "Protein kaynaklarını değerlendirirken vazgeçilmez amino asit bileşimi ile sindirilebilirlik birlikte ele alınır. Bu iki özellik, besinleri değişmez biçimde “tam/eksik” ya da “iyi/kötü” diye sınıflandırmaz.",
      "Bir protein kaynağının katkısı, öğündeki diğer kaynaklar ve genel beslenme örüntüsüyle birlikte değerlendirilir. Bu yüzden tek bir ürünün etiketinden çok, farklı kaynakların gün boyunca nasıl bir araya geldiğine bakmak daha açıklayıcıdır.",
    ]);
  });

  it("does not hide core copy or introduce sticky, pinned, or opacity-gated reading", () => {
    renderEssay();

    const article = screen.getByRole("article");
    expect(article.querySelector("[hidden]")).toBeNull();
    expect(
      article.querySelector(':where(p, h1, h2, h3, li)[aria-hidden="true"]'),
    ).toBeNull();
    expect(article.querySelector('[aria-hidden="true"] :where(p, h1, h2, h3, li)')).toBeNull();
    expect(article.querySelector("form, input, button")).toBeNull();

    expect(essayStyles).not.toMatch(/position\s*:\s*sticky/i);
    expect(essayStyles).not.toMatch(/opacity\s*:\s*(?:0|0\.0+)(?![\d.])/i);
    expect(essayStyles).not.toMatch(/visibility\s*:\s*hidden/i);
    expect(cssRule(essayStyles, ".tableScroll {")).toContain("overflow-x: auto");

    const mobileStart = essayStyles.indexOf("@media (max-width: 640px)");
    expect(mobileStart).toBeGreaterThanOrEqual(0);
    expect(cssRule(essayStyles, ".article {", mobileStart)).toContain(
      "--essay-gutter: clamp(1rem, 5vw, 1.45rem)",
    );
    expect(cssRule(essayStyles, ".roleList li {", mobileStart)).toContain(
      "grid-template-columns: 2.1rem minmax(0, 0.75fr) minmax(0, 1.25fr)",
    );
  });

  it("uses high-contrast text and focus tokens with distinct callout compositions", () => {
    expect(cssRule(essayStyles, ".prologue {")).toContain("overflow: clip");
    expect(cssRule(essayStyles, ".resolutionQuestion {")).toContain("color: var(--ink)");
    expect(cssRule(essayStyles, ".tableScroll:focus-visible {")).toContain(
      "outline: 3px solid var(--ink)",
    );

    expect(cssRule(essayStyles, ".scope {")).toContain("border-left:");
    const turnoverCallout = cssRule(essayStyles, ".turnoverCoda {");
    expect(turnoverCallout).toContain("border-top:");
    expect(turnoverCallout).not.toContain("border-left:");
    const chordCallout = cssRule(essayStyles, ".patternArt {");
    expect(chordCallout).toContain("border-top:");
    expect(chordCallout).not.toContain("border-left:");
  });
});
