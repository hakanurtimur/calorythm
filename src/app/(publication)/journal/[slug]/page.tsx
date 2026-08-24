import { notFound } from "next/navigation";
import { EditorialNote } from "@/components/editorial/editorial-note";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content-selectors";

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

  return (
    <main id="ana-icerik" tabIndex={-1}>
      <EditorialNote article={article} />
    </main>
  );
}
