import Link from "next/link";
import type { ArticlePageResult, TagCount } from "../api/articles";
import { ArticleCard } from "./ArticleCard";

type Props = ArticlePageResult & {
  emptyTitle: string;
  emptyDescription: string;
  /** 빈 결과에서 다음 행동으로 보여줄 주제. 비어 있으면 생략한다. */
  emptySuggestions?: Pick<TagCount, "id" | "name">[];
  /** 커서로 이동한 페이지에서 첫 페이지로 돌아가는 주소. 첫 페이지면 null이다. */
  firstHref?: string | null;
  highlight?: string;
  nextHref: string | null;
  retryHref: string;
  titleLevel?: 2 | 3;
};

export function ArticleCollection({
  page,
  message,
  emptyTitle,
  emptyDescription,
  emptySuggestions = [],
  firstHref = null,
  highlight,
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
        {emptySuggestions.length > 0 && (
          <div className="empty-state__suggestions">
            <p id="empty-suggestions-title">이런 주제는 어때요?</p>
            <ul aria-labelledby="empty-suggestions-title" className="tag-list">
              {emptySuggestions.map((tag) => (
                <li key={tag.id}>
                  <Link className="tag-pill" href={`/tags/${encodeURIComponent(tag.name)}`}>
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="article-list">
        {page.items.map((article) => (
          <ArticleCard
            article={article}
            highlight={highlight}
            key={article.id}
            titleLevel={titleLevel}
          />
        ))}
      </div>
      {(nextHref || firstHref) && (
        <nav className="pagination" aria-label="글 페이지 이동">
          {firstHref && (
            <Link className="button button--ghost" href={firstHref}>
              <span aria-hidden="true">↑</span> 처음으로
            </Link>
          )}
          {nextHref && (
            <Link className="button button--secondary" href={nextHref} rel="next">
              다음 글 보기 <span aria-hidden="true">↓</span>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
