import Link from "next/link";
import { Suspense } from "react";
import { formatKstDate } from "@/shared/lib/date";
import { listPublishedArticles, type CategoryPath } from "../api/articles";

type RelatedTopic = { kind: "category"; category: CategoryPath } | { kind: "tag"; tag: string };

async function RelatedArticleList({
  articleId,
  topic,
}: {
  articleId: number;
  topic: RelatedTopic;
}) {
  const result = await listPublishedArticles(
    null,
    topic.kind === "category" ? { category: topic.category.slug } : { tag: topic.tag },
  );
  const articles =
    result.page?.items.filter((article) => article.id !== articleId).slice(0, 3) ?? [];

  if (articles.length === 0) return null;

  const moreHref =
    topic.kind === "category"
      ? `/categories/${topic.category.slug}`
      : `/tags/${encodeURIComponent(topic.tag)}`;
  const moreLabel = topic.kind === "category" ? topic.category.name : `#${topic.tag}`;

  return (
    <section aria-labelledby="related-title" className="related-articles">
      <div className="section-heading">
        <div>
          <p className="eyebrow">KEEP EXPLORING</p>
          <h2 id="related-title">
            {topic.kind === "category" ? "같은 카테고리의 글" : "같은 주제의 글"}
          </h2>
        </div>
        <Link className="text-link" href={moreHref}>
          {moreLabel} 모두 보기
        </Link>
      </div>
      <ul className="related-articles__list">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.id}`}>
              <span className="related-articles__date">{formatKstDate(article.publishedAt)}</span>
              <span className="related-articles__title">{article.title}</span>
              <span aria-hidden="true" className="related-articles__arrow">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 같은 카테고리의 다른 글을 보여준다. 공개 카테고리가 없으면 첫 태그를 기준으로 한다. */
export function RelatedArticles({
  articleId,
  category,
  tag,
}: {
  articleId: number;
  category: CategoryPath | null;
  tag: string | undefined;
}) {
  const topic: RelatedTopic | null = category
    ? { kind: "category", category }
    : tag
      ? { kind: "tag", tag }
      : null;
  if (!topic) return null;

  return (
    <Suspense fallback={null}>
      <RelatedArticleList articleId={articleId} topic={topic} />
    </Suspense>
  );
}
