import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { listPublishedArticles } from "@/features/article/api/articles";
import { ArticleCollection } from "@/features/article/components/ArticleCollection";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { findCategory, listCategoryTree } from "@/features/category/api/categories";
import { CategoryTree } from "@/features/category/components/CategoryTree";
import { categoryTone } from "@/shared/lib/category-tone";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ cursor?: string | string[] }>;

function firstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const match = findCategory(await listCategoryTree(), slug);
  if (!match) return { title: "카테고리를 찾을 수 없습니다" };

  return {
    title: match.category.name,
    description:
      match.category.description ?? `${match.category.name} 카테고리의 발행 글을 모았습니다.`,
  };
}

async function CategoryPageContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const tree = await listCategoryTree();
  const match = findCategory(tree, slug);
  if (!match) notFound();

  const { category, parent } = match;
  const cursor = firstValue(query.cursor);
  const result = await listPublishedArticles(cursor, { category: slug });
  const categoryHref = `/categories/${slug}`;
  const nextHref = result.page?.nextCursor
    ? `${categoryHref}?cursor=${encodeURIComponent(result.page.nextCursor)}`
    : null;

  return (
    <main className="page-shell" id="main-content">
      <nav aria-label="이동 경로" className="breadcrumb">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          {parent && (
            <li>
              <Link href={`/categories/${parent.slug}`}>{parent.name}</Link>
            </li>
          )}
          <li aria-current="page">{category.name}</li>
        </ol>
      </nav>
      <div className="category-layout">
        <div className="category-main">
          <header
            className="page-heading category-heading"
            data-tone={categoryTone(parent?.slug ?? category.slug)}
          >
            <p className="eyebrow">
              <span aria-hidden="true" className="tone-swatch" />
              {parent ? parent.name : "CATEGORY"}
            </p>
            <h1>{category.name}</h1>
            {category.description && <p>{category.description}</p>}
            <p className="category-heading__count">발행 글 {category.articleCount}개</p>
            {category.children.length > 0 && (
              <ul aria-label="하위 카테고리" className="tag-list">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link className="tag-pill" href={`/categories/${child.slug}`}>
                      {child.name} <span className="tag-pill__count">{child.articleCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </header>
          <ArticleCollection
            emptyDescription="다른 카테고리나 최신 글을 둘러보세요."
            emptyTitle="이 카테고리에는 아직 글이 없습니다"
            firstHref={cursor ? categoryHref : null}
            message={result.message}
            nextHref={nextHref}
            page={result.page}
            retryHref={
              cursor ? `${categoryHref}?cursor=${encodeURIComponent(cursor)}` : categoryHref
            }
          />
        </div>
        <aside aria-label="카테고리 탐색" className="category-rail">
          <div className="home-rail__panel">
            <CategoryTree currentSlug={slug} headingId="rail-categories" tree={tree} />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <CategoryPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
