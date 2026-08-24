import { notFound } from "next/navigation";
import { ProteinVisualEssay } from "@/components/articles/protein/protein-visual-essay";
import { EditorialNote } from "@/components/editorial/editorial-note";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content-selectors";

const flagshipSlug = "protein-sadece-kas-icin-degildir";

type ArticlePageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return getPublishedArticles().map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const isProteinVisualEssay =
    article.slug === flagshipSlug && article.type === "visual-essay";

  return (
    <main id="ana-icerik" tabIndex={-1}>
      {isProteinVisualEssay ? (
        <ProteinVisualEssay article={article} />
      ) : (
        <EditorialNote article={article} />
      )}
    </main>
  );
}
