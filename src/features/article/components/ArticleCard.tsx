import Link from "next/link";
import type { ElementType } from "react";
import { formatKstDate } from "@/shared/lib/date";
import type { ArticleSummary } from "../api/articles";

export function ArticleCard({
  article,
  titleLevel = 2,
}: {
  article: ArticleSummary;
  titleLevel?: 2 | 3;
}) {
  const Title = `h${titleLevel}` as ElementType;
  const leadTag = article.tags[0]?.name;

  return (
    <article className="article-card">
      <div className="article-card__meta">
        {leadTag && (
          <Link className="article-card__topic" href={`/tags/${encodeURIComponent(leadTag)}`}>
            {leadTag}
          </Link>
        )}
        <time dateTime={article.publishedAt}>{formatKstDate(article.publishedAt)}</time>
      </div>
      <Title className="article-card__title">
        <Link href={`/articles/${article.id}`}>{article.title}</Link>
      </Title>
      <p className="article-card__summary">{article.summary}</p>
      <div className="article-card__footer">
        {article.tags.length > 1 && (
          <ul className="tag-list" aria-label={`${article.title} 태그`}>
            {article.tags.slice(1).map((tag) => (
              <li key={tag.id}>
                <Link className="tag-pill" href={`/tags/${encodeURIComponent(tag.name)}`}>
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          aria-label={`${article.title} 읽기`}
          className="article-card__read-link"
          href={`/articles/${article.id}`}
        >
          읽기 <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
