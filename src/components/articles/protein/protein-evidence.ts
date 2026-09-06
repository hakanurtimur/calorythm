import type { ArticleRecord, ArticleReference } from "@/content/articles";

export const proteinRoles = [
  {
    key: "structure",
    label: "Yapı",
    example: "Kolajen",
    explanation: "Bağ dokularının yapısal örgüsüne katılır.",
  },
  {
    key: "catalysis",
    label: "Kataliz",
    example: "Enzim",
    explanation: "Biyokimyasal tepkimelerin ilerlemesini kolaylaştırır.",
  },
  {
    key: "transport",
    label: "Taşıma",
    example: "Hemoglobin",
    explanation: "Oksijeni kanda taşır.",
  },
  {
    key: "signalling",
    label: "Sinyal",
    example: "İnsülin",
    explanation: "Kan şekeri düzenlenmesinde hücrelere sinyal iletir.",
  },
  {
    key: "defence",
    label: "Savunma",
    example: "Antikor",
    explanation: "Belirli antijenleri tanır ve onlara bağlanır.",
  },
] as const;

export const proteinSourceRegistry = [
  {
    key: "efsa-adult-pri",
    href: "https://www.efsa.europa.eu/en/press/news/120209",
  },
  {
    key: "who-protein-requirements",
    href: "https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf",
  },
  {
    key: "fao-protein-quality",
    href: "https://www.fao.org/4/i3124e/i3124e.pdf",
  },
  {
    key: "ncbi-protein-roles",
    href: "https://www.ncbi.nlm.nih.gov/books/NBK9879/",
  },
  {
    key: "waterlow-turnover",
    href: "https://pubmed.ncbi.nlm.nih.gov/8527232/",
  },
  {
    key: "sport-position",
    href: "https://pubmed.ncbi.nlm.nih.gov/26891166/",
  },
  {
    key: "kdigo-ckd",
    href: "https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf",
  },
] as const;

export type ProteinSourceKey = (typeof proteinSourceRegistry)[number]["key"];

export type ProteinSource = Readonly<{
  id: string;
  key: ProteinSourceKey;
  reference: ArticleReference;
}>;

export const proteinEvidenceStatuses = [
  {
    key: "established",
    label: "Temel ilke",
    statement:
      "Protein değerlendirmesinde amino asit bileşimi ve sindirilebilirlik birlikte önem taşır.",
  },
  {
    key: "contextual",
    label: "Yorumlama",
    statement:
      "Amino asit örüntüsü, öğündeki diğer protein kaynakları ve günün genel beslenme düzeniyle birlikte yorumlanır.",
  },
  {
    key: "researching",
    label: "Veri sınırı · 2013",
    statement:
      "FAO'nun 2013 değerlendirmesinde, insan besinleri için gerçek ileal amino asit sindirilebilirliği verileri o tarihte yetersizdi.",
  },
] as const;

export function getProteinSources(article: ArticleRecord): readonly ProteinSource[] {
  return proteinSourceRegistry.map(({ href, key }) => {
    const reference = article.references.find((entry) => entry.href === href);

    if (!reference) {
      throw new Error(`Protein source registry entry is missing from article: ${key}`);
    }

    return {
      id: `protein-source-${key}`,
      key,
      reference,
    };
  });
}
