import Link from "next/link";
import { Suspense } from "react";
import { formatKstDate } from "@/shared/lib/date";
import { listPublishedArticles } from "../api/articles";

async function RelatedArticleList({ articleId, tag }: { articleId: number; tag: string }) {
  const result = await listPublishedArticles(null, tag);
  const articles =
    result.page?.items.filter((article) => article.id !== articleId).slice(0, 3) ?? [];

  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-title" className="related-articles">
      <div className="section-heading">
        <div>
          <p className="eyebrow">KEEP EXPLORING</p>
          <h2 id="related-title">같은 주제의 글</h2>
        </div>
        <Link className="text-link" href={`/tags/${encodeURIComponent(tag)}`}>
          #{tag} 모두 보기
        </Link>
      </div>
      <ul className="related-articles__list">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.id}`}>
              <span className="related-articles__date">{formatKstDate(article.publishedAt)}</span>
              <span className="related-articles__title">{article.title}</span>
              <span aria-hidden="true" className="related-articles__arrow">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedArticles({
  articleId,
  tag,
}: {
  articleId: number;
  tag: string | undefined;
}) {
  if (!tag) return null;

  return (
    <Suspense fallback={null}>
      <RelatedArticleList articleId={articleId} tag={tag} />
    </Suspense>
  );
}
