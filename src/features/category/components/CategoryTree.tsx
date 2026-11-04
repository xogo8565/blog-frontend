import Link from "next/link";
import { categoryTone } from "@/shared/lib/category-tone";
import type { CategoryNode } from "../api/categories";

function Count({ value }: { value: number }) {
  return (
    <span className="category-tree__count">
      {value}
      <span className="sr-only">개의 글</span>
    </span>
  );
}

/** 상위·하위 카테고리 링크 트리. 현재 카테고리는 aria-current로 표시한다. */
export function CategoryTree({
  tree,
  currentSlug = null,
  headingId,
}: {
  tree: CategoryNode[];
  currentSlug?: string | null;
  headingId: string;
}) {
  const current = (slug: string) => (slug === currentSlug ? "page" : undefined);

  return (
    <nav aria-labelledby={headingId} className="category-tree">
      <h2 id={headingId}>카테고리</h2>
      <ul>
        {tree.map((group) => (
          <li data-tone={categoryTone(group.slug)} key={group.id}>
            <Link
              aria-current={current(group.slug)}
              className="category-tree__group"
              href={`/categories/${group.slug}`}
            >
              <span aria-hidden="true" className="tone-swatch" />
              <span className="category-tree__name">{group.name}</span>
              <Count value={group.articleCount} />
            </Link>
            {group.children.length > 0 && (
              <ul>
                {group.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      aria-current={current(child.slug)}
                      className="category-tree__child"
                      href={`/categories/${child.slug}`}
                    >
                      <span className="category-tree__name">{child.name}</span>
                      <Count value={child.articleCount} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
