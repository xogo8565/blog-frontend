import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ArticleSummary } from "../api/articles";
import { ArticleCard } from "./ArticleCard";

const base: ArticleSummary = {
  id: 9000,
  title: "Next.js 캐시 전략 정리",
  summary: "use cache와 cacheLife로 캐시를 구성했습니다.",
  thumbnailUrl: null,
  tags: [
    { id: 1, name: "nextjs" },
    { id: 2, name: "cache" },
  ],
  category: {
    id: 10,
    name: "Next.js",
    slug: "nextjs",
    parent: { id: 11, name: "프론트엔드", slug: "frontend" },
  },
  publishedAt: "2026-11-02T05:30:00Z",
};

describe("ArticleCard", () => {
  it("카테고리 경로를 라벨로 보여주고 카테고리 페이지로 연결한다", () => {
    render(<ArticleCard article={base} />);

    const label = screen.getByRole("link", { name: "프론트엔드 › Next.js" });
    expect(label).toHaveAttribute("href", "/categories/nextjs");
    expect(screen.getByRole("link", { name: "#nextjs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "#cache" })).toBeInTheDocument();
  });

  it("미분류 글은 첫 태그를 라벨로 쓴다", () => {
    render(<ArticleCard article={{ ...base, category: null }} />);

    expect(screen.getByRole("link", { name: "nextjs" })).toHaveAttribute("href", "/tags/nextjs");
    expect(screen.queryByRole("link", { name: "#nextjs" })).not.toBeInTheDocument();
  });

  it("검색어와 일치하는 부분을 대소문자 구분 없이 강조한다", () => {
    const { container } = render(<ArticleCard article={base} highlight="CACHE" />);

    const marks = [...container.querySelectorAll("mark")].map((mark) => mark.textContent);
    expect(marks).toEqual(["cache", "cache"]);
  });

  it("커버는 장식이라 보조 기술에서 숨긴다", () => {
    const { container } = render(<ArticleCard article={base} />);

    expect(container.querySelector(".article-cover")).toHaveAttribute("aria-hidden", "true");
  });
});
