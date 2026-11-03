import { describe, expect, it } from "vitest";
import { findCategory, popularCategories, type CategoryNode } from "./categories";

function node(
  id: number,
  slug: string,
  articleCount: number,
  children: CategoryNode[] = [],
): CategoryNode {
  return { id, name: slug.toUpperCase(), slug, description: null, articleCount, children };
}

const tree: CategoryNode[] = [
  node(1, "backend", 5, [node(2, "spring", 2), node(3, "architecture", 3)]),
  node(4, "frontend", 1, [node(5, "nextjs", 1), node(6, "typescript", 0)]),
  node(7, "retrospective", 4),
];

describe("findCategory", () => {
  it("상위 카테고리는 부모 없이 찾는다", () => {
    expect(findCategory(tree, "backend")).toEqual({ category: tree[0], parent: null });
  });

  it("하위 카테고리는 상위 카테고리와 함께 찾는다", () => {
    const match = findCategory(tree, "nextjs");
    expect(match?.category.id).toBe(5);
    expect(match?.parent?.slug).toBe("frontend");
  });

  it("없는 슬러그면 null이다", () => {
    expect(findCategory(tree, "missing")).toBeNull();
  });
});

describe("popularCategories", () => {
  it("하위가 있으면 하위를, 없으면 상위를 글 수 순으로 고른다", () => {
    expect(popularCategories(tree, 3).map((category) => category.slug)).toEqual([
      "retrospective",
      "architecture",
      "spring",
    ]);
  });

  it("글이 없는 카테고리는 빼고 상위 정보를 함께 준다", () => {
    const result = popularCategories(tree, 10);
    expect(result.map((category) => category.slug)).not.toContain("typescript");
    expect(result.find((category) => category.slug === "nextjs")?.parent).toEqual({
      name: "FRONTEND",
      slug: "frontend",
    });
  });
});
