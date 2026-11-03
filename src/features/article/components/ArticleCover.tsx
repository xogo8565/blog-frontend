import { categoryTone } from "@/shared/lib/category-tone";
import type { ArticleSummary } from "../api/articles";

/**
 * 썸네일 대신 쓰는 장식용 커버. 이미지 호스트가 정해지기 전까지 카테고리 색조와 이름으로 만든다.
 * 미분류 글은 첫 태그로, 태그도 없으면 중립색으로 표시한다.
 */
export function ArticleCover({ article }: { article: Pick<ArticleSummary, "category" | "tags"> }) {
  const { category } = article;
  const leadTag = article.tags[0]?.name;
  const tone = category ? categoryTone(category.parent?.slug ?? category.slug) : 0;
  const path = category ? `/${category.slug}` : leadTag ? `#${leadTag}` : "/notes";
  const name = category?.name ?? leadTag ?? "기록";

  return (
    <span aria-hidden="true" className="article-cover" data-tone={tone}>
      <span className="article-cover__path">{path}</span>
      <span className="article-cover__name">{name}</span>
    </span>
  );
}
