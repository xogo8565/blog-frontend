import Link from "next/link";
import { categoryTone } from "@/shared/lib/category-tone";
import type { PopularCategory } from "../api/categories";

/** 홈의 "주제 둘러보기". 글이 많은 카테고리를 설명과 함께 보여준다. */
export function CategoryIndex({ categories }: { categories: PopularCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="topics-title" className="category-index" id="topics">
      <div className="home-section-heading">
        <h2 id="topics-title">주제 둘러보기</h2>
        <span>글이 많은 주제부터</span>
      </div>
      <ul className="category-index__list">
        {categories.map((category) => (
          <li data-tone={categoryTone(category.parent?.slug ?? category.slug)} key={category.id}>
            <Link className="category-index__card" href={`/categories/${category.slug}`}>
              <span className="category-index__path">
                <span aria-hidden="true" className="tone-swatch" />
                {category.parent ? category.parent.name : "카테고리"}
              </span>
              <span className="category-index__name">{category.name}</span>
              {category.description && (
                <span className="category-index__description">{category.description}</span>
              )}
              <span className="category-index__count">글 {category.articleCount}개</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
