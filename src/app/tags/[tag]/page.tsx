import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleCollection } from "@/features/article/components/ArticleCollection";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { listPublishedArticles } from "@/features/article/api/articles";

type Params = Promise<{ tag: string }>;
type SearchParams = Promise<{ cursor?: string | string[] }>;

function firstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `#${tag} 태그가 붙은 발행 글을 모았습니다.`,
  };
}

async function TagPageContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ tag }, query] = await Promise.all([params, searchParams]);
  const normalizedTag = tag.trim();
  if (!normalizedTag) notFound();

  const cursor = firstValue(query.cursor);
  const result = await listPublishedArticles(cursor, normalizedTag);
  const nextHref = result.page?.nextCursor
    ? `/tags/${encodeURIComponent(normalizedTag)}?cursor=${encodeURIComponent(result.page.nextCursor)}`
    : null;

  return (
    <main className="page-shell" id="main-content">
      <Link className="back-link" href="/">
        <span aria-hidden="true">←</span> 모든 글
      </Link>
      <div className="page-heading page-heading--tag">
        <p className="eyebrow">TAG ARCHIVE</p>
        <h1>#{normalizedTag}</h1>
        <p>이 태그가 붙은 발행 글을 모았습니다.</p>
      </div>
      <ArticleCollection
        emptyDescription="다른 태그나 최신 글을 둘러보세요."
        emptyTitle="이 태그의 글이 없습니다"
        message={result.message}
        nextHref={nextHref}
        page={result.page}
        retryHref={
          cursor
            ? `/tags/${encodeURIComponent(normalizedTag)}?cursor=${encodeURIComponent(cursor)}`
            : `/tags/${encodeURIComponent(normalizedTag)}`
        }
      />
    </main>
  );
}

export default function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <TagPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
