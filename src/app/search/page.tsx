import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleCollection } from "@/features/article/components/ArticleCollection";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { ArticleSearchForm } from "@/features/article/components/ArticleSearchForm";
import { searchPublishedArticles } from "@/features/article/api/articles";
import { toUserMessage } from "@/shared/api/errors";

export const metadata: Metadata = {
  title: "글 검색",
  description: "제목과 본문에서 관심 있는 주제를 찾아보세요.",
};

type SearchParams = Promise<{
  q?: string | string[];
  cursor?: string | string[];
}>;

function firstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = firstValue(params.q)?.trim() ?? "";
  const cursor = firstValue(params.cursor);

  let page = null;
  let message: string | null = null;

  if (query.length > 0 && (query.length < 2 || query.length > 50)) {
    message = toUserMessage({ code: "INVALID_SEARCH_QUERY" });
  } else if (query.length >= 2) {
    const result = await searchPublishedArticles(query, cursor);
    page = result.page;
    message = result.message;
  }

  const queryString = new URLSearchParams({ q: query });
  const nextHref = page?.nextCursor
    ? `/search?${new URLSearchParams({ q: query, cursor: page.nextCursor }).toString()}`
    : null;

  return (
    <main className="page-shell" id="main-content">
      <div className="page-heading">
        <p className="eyebrow">SEARCH THE ARCHIVE</p>
        <h1>글 검색</h1>
        <p>제목과 본문에서 읽고 싶은 주제를 찾아보세요.</p>
      </div>
      <div className="search-page-form">
        <ArticleSearchForm defaultValue={query} />
      </div>
      {query && <p className="search-summary">“{query}” 검색 결과</p>}
      <ArticleCollection
        emptyDescription={
          query ? "검색어를 바꾸거나 태그를 둘러보세요." : "검색어를 입력해 글을 찾아보세요."
        }
        emptyTitle={query ? "검색 결과가 없습니다" : "찾고 싶은 주제를 입력해 주세요"}
        message={message}
        nextHref={nextHref}
        page={page}
        retryHref={query ? `/search?${queryString.toString()}` : "/search"}
      />
    </main>
  );
}

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}
