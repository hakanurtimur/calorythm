export type ArticleReference = Readonly<{
  href: string;
  label: string;
  publisher: string;
  title: string;
}>;

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

const coreProteinReferences = [
  {
    href: "https://www.efsa.europa.eu/en/press/news/120209",
    label: "EFSA protein referansı",
    publisher: "European Food Safety Authority",
    title: "EFSA sets population reference intakes for protein",
  },
  {
    href: "https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf",
    label: "WHO/FAO/UNU raporu",
    publisher: "World Health Organization",
    title: "Protein and Amino Acid Requirements in Human Nutrition",
  },
  {
    href: "https://www.fao.org/4/i3124e/i3124e.pdf",
    label: "FAO protein kalitesi",
    publisher: "Food and Agriculture Organization of the United Nations",
    title: "Dietary Protein Quality Evaluation in Human Nutrition",
  },
  {
    href: "https://www.ncbi.nlm.nih.gov/books/NBK9879/",
    label: "NCBI hücresel roller",
    publisher: "NCBI Bookshelf",
    title: "The Cell: A Molecular Approach",
  },
  {
    href: "https://pubmed.ncbi.nlm.nih.gov/8527232/",
    label: "Waterlow dönüşüm çalışması",
    publisher: "Annual Review of Nutrition",
    title: "Whole-body protein turnover in humans--past, present, and future",
  },
  {
    href: "https://pubmed.ncbi.nlm.nih.gov/26891166/",
    label: "Sporcu beslenmesi bildirimi",
    publisher: "Journal of the Academy of Nutrition and Dietetics",
    title: "Nutrition and Athletic Performance",
  },
  {
    href: "https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf",
    label: "KDIGO böbrek kılavuzu",
    publisher: "Kidney Disease: Improving Global Outcomes",
    title: "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease",
  },
] as const satisfies readonly ArticleReference[];

export const articles = [
  {
    slug: "protein-sadece-kas-icin-degildir",
    title: "Protein Sadece Kas İçin Değildir",
    eyebrow: "Bedenin bakım dili",
    deck: "Kas, proteinin en görünür hikâyesi. Oysa proteinler aynı anda yapı kurar, tepkimeleri hızlandırır, molekül taşır, sinyal iletir ve savunmaya katılır.",
    author: "CALORYTHM Editorya",
    publishedAt: "2026-08-24",
    readingMinutes: 9,
    topics: ["protein"],
    type: "visual-essay",
    status: "published",
    body: [
      {
        heading: "Kas, hikâyenin tamamı değil",
        paragraphs: [
          "Protein ile kas arasındaki ilişki gerçektir; ancak proteinlerin bedendeki işi bununla bitmez. Yapı kurma, onarım, taşıma, sinyal ve savunma aynı bakım dilinin parçalarıdır.",
        ],
      },
      {
        heading: "Görünmeyen işler",
        paragraphs: [
          "Proteinler dokuların yapısına katılır, enzim olarak tepkimeleri hızlandırır, molekülleri taşır, hücreler arası sinyal iletir ve bağışıklık savunmasına katılır.",
        ],
      },
      {
        heading: "Beden bitmiş bir yapı değildir",
        paragraphs: [
          "Vücut proteinleri sürekli sentezlenir, işlev görür ve parçalanır. Açığa çıkan amino asitlerin bir bölümü yeniden kullanılır.",
        ],
      },
      {
        heading: "Bir lokma, aynı biçimde kalmaz",
        paragraphs: [
          "Besinlerdeki protein sindirim sırasında daha küçük peptitlere ve amino asitlere ayrılır. Emilen amino asitler dolaşıma katılır; vücut bunları değişen yapı, onarım, taşıma, sinyal, kataliz ve savunma gereksinimlerinde kullanır.",
        ],
      },
      {
        heading: "“Yeterli” tek bir sayı değildir",
        paragraphs: [
          "EFSA’nın sağlıklı yetişkinler için 0,83 g/kg/gün nüfus referansı, kişisel hedef, optimum ya da üst sınır değildir. Bu yazı sağlıklı yetişkinlerde protein fizyolojisini açıklar; çocuklar, gebeler, hastalık tedavisi görenler, kilo vermeye çalışanlar, kırılganlığı olan ileri yaştaki yetişkinler ve elit sporcular için kişisel protein alımı önermez.",
        ],
      },
      {
        heading: "Miktarın yanında örüntü var",
        paragraphs: [
          "Protein kaynakları değerlendirilirken vazgeçilmez amino asitlerin dağılımı ile proteinin sindirilebilirlik düzeyi birlikte ele alınır. Bu özellikler, bir besini tek başına “iyi” ya da “kötü” ilan etmek için değil, genel beslenme örüntüsündeki yerini anlamak için kullanılır.",
        ],
      },
      {
        heading: "Bakım dili",
        paragraphs: [
          "Hangi bağlamda, hangi beslenme örüntüsü içinde ve ne amaçla? Protein için anlamlı yanıt, bu üç soruyu birlikte düşünmekle başlar.",
        ],
      },
    ],
    references: coreProteinReferences,
    relatedSlugs: ["protein-kalitesi-ne-demek", "referans-hedef-ust-sinir"],
  },
  {
    slug: "protein-kalitesi-ne-demek",
    title: "Bir proteini “kaliteli” yapan ne?",
    eyebrow: "Örüntüyü okumak",
    deck: "Amino asit bileşimi ve sindirilebilirlik önemlidir; ama tek bir rozet, beslenme örüntüsünün tamamını anlatmaz.",
    author: "CALORYTHM Editorya",
    publishedAt: "2026-08-24",
    readingMinutes: 4,
    topics: ["protein"],
    type: "editorial-note",
    status: "published",
    body: [
      {
        heading: "Kalite tek kelimeye sığmaz",
        paragraphs: [
          "Protein kaynaklarını değerlendirirken vazgeçilmez amino asit bileşimi ile sindirilebilirlik birlikte ele alınır. Bu iki özellik, besinleri değişmez biçimde “tam/eksik” ya da “iyi/kötü” diye sınıflandırmaz.",
        ],
      },
      {
        heading: "Bağlam örüntünün parçasıdır",
        paragraphs: [
          "Bir protein kaynağının katkısı, öğündeki diğer kaynaklar ve genel beslenme örüntüsüyle birlikte değerlendirilir. Bu yüzden tek bir ürünün etiketinden çok, farklı kaynakların gün boyunca nasıl bir araya geldiğine bakmak daha açıklayıcıdır.",
        ],
      },
    ],
    references: [coreProteinReferences[1], coreProteinReferences[2]],
    relatedSlugs: ["protein-sadece-kas-icin-degildir", "referans-hedef-ust-sinir"],
  },
  {
    slug: "referans-hedef-ust-sinir",
    title: "Referans değer, hedef ve üst sınır aynı şey değildir",
    eyebrow: "Sayının bağlamı",
    deck: "Bir nüfus referansı, kişisel hedef ve güvenlik sınırı farklı sorulara cevap verir.",
    author: "CALORYTHM Editorya",
    publishedAt: "2026-08-24",
    readingMinutes: 4,
    topics: ["protein"],
    type: "editorial-note",
    status: "published",
    body: [
      {
        heading: "Referans bir başlangıç noktasıdır",
        paragraphs: [
          "EFSA’nın sağlıklı yetişkinler için 0,83 g/kg/gün nüfus referansı, bir kişinin hedefi, optimumu veya üst sınırı anlamına gelmez. Nüfus düzeyindeki bir referans ile kişisel karar aynı şey değildir.",
        ],
      },
      {
        heading: "Hedef ve güvenlik ayrı sorulardır",
        paragraphs: [
          "Antrenman bağlamında kullanılan rehberlik bağlama bağlıdır; yaş ve hastalık durumları ise ayrı değerlendirme gerektirir. Özellikle kronik böbrek hastalığı ile sağlıklı yetişkinler tek bir güvenlik cümlesi altında ele alınamaz.",
        ],
      },
    ],
    references: [coreProteinReferences[0], coreProteinReferences[1], coreProteinReferences[6]],
    relatedSlugs: ["protein-sadece-kas-icin-degildir", "protein-kalitesi-ne-demek"],
  },
] as const satisfies readonly ArticleRecord[];
