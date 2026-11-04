import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { categoryTone } from "@/shared/lib/category-tone";
import { formatKstDate } from "@/shared/lib/date";
import type { ArticleSummary } from "../api/articles";
import { ArticleCover } from "./ArticleCover";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 검색어와 일치하는 부분을 <mark>로 감싼다. 대소문자는 구분하지 않는다. */
function highlightText(text: string, term: string | undefined): ReactNode {
  if (!term) return text;
  const pattern = new RegExp(`(${escapeRegExp(term)})`, "gi");
  const lowerTerm = term.toLocaleLowerCase();

  return text
    .split(pattern)
    .filter(Boolean)
    .map((part, index) =>
      part.toLocaleLowerCase() === lowerTerm ? (
        <mark className="search-mark" key={index}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
}

export function ArticleCard({
  article,
  highlight,
  titleLevel = 2,
}: {
  article: ArticleSummary;
  highlight?: string;
  titleLevel?: 2 | 3;
}) {
  const Title = `h${titleLevel}` as ElementType;
  const { category } = article;
  // 카테고리가 있으면 라벨은 카테고리, 태그는 모두 아래에 둔다. 미분류면 첫 태그가 라벨이 된다.
  const [leadTag, ...otherTags] = article.tags;
  const listedTags = category ? article.tags : otherTags;

  return (
    <article className="article-card">
      <div className="article-card__body">
        <div className="article-card__meta">
          {category ? (
            <Link
              className="article-card__topic"
              data-tone={categoryTone(category.parent?.slug ?? category.slug)}
              href={`/categories/${category.slug}`}
            >
              {category.parent && <span>{category.parent.name} ›</span>} {category.name}
            </Link>
          ) : (
            leadTag && (
              <Link
                className="article-card__topic"
                href={`/tags/${encodeURIComponent(leadTag.name)}`}
              >
                {leadTag.name}
              </Link>
            )
          )}
          <time dateTime={article.publishedAt}>{formatKstDate(article.publishedAt)}</time>
        </div>
        <Title className="article-card__title">
          <Link href={`/articles/${article.id}`}>{highlightText(article.title, highlight)}</Link>
        </Title>
        <p className="article-card__summary">{highlightText(article.summary, highlight)}</p>
        {listedTags.length > 0 && (
          <ul className="tag-list article-card__tags" aria-label={`${article.title} 태그`}>
            {listedTags.map((tag) => (
              <li key={tag.id}>
                <Link className="tag-pill" href={`/tags/${encodeURIComponent(tag.name)}`}>
                  #{tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ArticleCover article={article} />
    </article>
  );
}
