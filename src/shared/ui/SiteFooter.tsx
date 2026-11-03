import Link from "next/link";
import type { components } from "@/shared/api/schema";

type CategoryNode = components["schemas"]["CategoryNode"];
type TagCount = components["schemas"]["TagCount"];
type ArticleSummary = components["schemas"]["ArticleSummary"];

type Props = {
  recentArticles: Pick<ArticleSummary, "id" | "title">[];
  categories: CategoryNode[];
  tags: Pick<TagCount, "id" | "name">[];
};

export function SiteFooter({ recentArticles, categories, tags }: Props) {
  return (
    <footer className="site-footer">
      <div className="site-footer__columns">
        <div className="site-footer__about">
          <Link aria-label="개발 노트 홈" className="site-footer__brand" href="/">
            개발 노트
          </Link>
          <p>설계와 구현 사이에서 배운 것을 기록합니다.</p>
        </div>
        {recentArticles.length > 0 && (
          <section aria-labelledby="footer-recent">
            <h2 id="footer-recent">최근 글</h2>
            <ul>
              {recentArticles.map((article) => (
                <li key={article.id}>
                  <Link href={`/articles/${article.id}`}>{article.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {categories.length > 0 && (
          <section aria-labelledby="footer-categories">
            <h2 id="footer-categories">카테고리</h2>
            <ul>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/categories/${category.slug}`}>
                    {category.name}{" "}
                    <span className="site-footer__count">{category.articleCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {tags.length > 0 && (
          <section aria-labelledby="footer-tags">
            <h2 id="footer-tags">태그</h2>
            <ul className="site-footer__tags">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link href={`/tags/${encodeURIComponent(tag.name)}`}>#{tag.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <div className="site-footer__bottom">
        <span>© 개발 노트</span>
        <Link className="site-footer__top" href="#main-content">
          맨 위로 <span aria-hidden="true">↑</span>
        </Link>
      </div>
    </footer>
  );
}
