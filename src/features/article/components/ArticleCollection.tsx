import Link from "next/link";
import type { ArticlePageResult } from "../api/articles";
import { ArticleCard } from "./ArticleCard";

type Props = ArticlePageResult & {
  emptyTitle: string;
  emptyDescription: string;
  nextHref: string | null;
  retryHref: string;
  titleLevel?: 2 | 3;
};

export function ArticleCollection({
  page,
  message,
  emptyTitle,
  emptyDescription,
  nextHref,
  retryHref,
  titleLevel = 2,
}: Props) {
  if (message) {
    return (
      <div className="notice notice--error" role="alert">
        <p>{message}</p>
        <Link className="text-link" href={retryHref}>
          다시 시도
        </Link>
      </div>
    );
  }

  if (!page || page.items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon" aria-hidden="true">
          ✳
        </span>
        <h2>{emptyTitle}</h2>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div className="article-list">
        {page.items.map((article) => (
          <ArticleCard article={article} key={article.id} titleLevel={titleLevel} />
        ))}
      </div>
      {nextHref && (
        <nav className="pagination" aria-label="글 페이지 이동">
          <Link className="button button--secondary" href={nextHref} rel="next">
            다음 글 보기 <span aria-hidden="true">↓</span>
          </Link>
        </nav>
      )}
    </>
  );
}
