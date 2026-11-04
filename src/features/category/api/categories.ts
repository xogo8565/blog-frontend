import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

export type CategoryNode = components["schemas"]["CategoryNode"];

export type CategoryMatch = {
  category: CategoryNode;
  /** 하위 카테고리면 그 상위 카테고리, 상위 카테고리면 null */
  parent: CategoryNode | null;
};

export type PopularCategory = CategoryNode & {
  parent: Pick<CategoryNode, "name" | "slug"> | null;
};

/** 공개 카테고리 트리. 조회에 실패하면 빈 배열로 화면을 계속 그린다. */
export async function listCategoryTree(): Promise<CategoryNode[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories", "articles");

  try {
    const { data } = await api.GET("/categories");
    return data ?? [];
  } catch {
    return [];
  }
}

export function findCategory(tree: CategoryNode[], slug: string): CategoryMatch | null {
  for (const category of tree) {
    if (category.slug === slug) return { category, parent: null };
    const child = category.children.find((item) => item.slug === slug);
    if (child) return { category: child, parent: category };
  }
  return null;
}

/** 글이 있는 카테고리를 글 수 순으로 고른다. 하위 카테고리가 있으면 하위를, 없으면 상위를 후보로 둔다. */
export function popularCategories(tree: CategoryNode[], limit: number): PopularCategory[] {
  const candidates = tree.flatMap<PopularCategory>((category) =>
    category.children.length > 0
      ? category.children.map((child) => ({
          ...child,
          parent: { name: category.name, slug: category.slug },
        }))
      : [{ ...category, parent: null }],
  );

  return candidates
    .filter((category) => category.articleCount > 0)
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, limit);
}
