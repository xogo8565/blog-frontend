import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { ArticleOutline } from "@/features/article/components/ArticleOutline";
import { ArticleShareButton } from "@/features/article/components/ArticleShareButton";
import { RelatedArticles } from "@/features/article/components/RelatedArticles";
import { getPublishedArticle } from "@/features/article/api/articles";
import { findCategory, listCategoryTree } from "@/features/category/api/categories";
import { categoryTone } from "@/shared/lib/category-tone";
import { getMarkdownHeadings, MarkdownRenderer } from "@/shared/lib/markdown/MarkdownRenderer";
import { formatKstDate } from "@/shared/lib/date";

type Params = Promise<{ articleId: string }>;

function parseArticleId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const articleId = Number(value);
  return Number.isSafeInteger(articleId) && articleId > 0 ? articleId : null;
}

function estimateReadingMinutes(contents: string): number {
  const wordCount = contents.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { articleId: rawArticleId } = await params;
  const articleId = parseArticleId(rawArticleId);
  if (articleId === null) return { title: "글을 찾을 수 없습니다" };

  const result = await getPublishedArticle(articleId);
  if (!result.article) return { title: "글을 찾을 수 없습니다" };

  return {
    title: result.article.title,
    description: result.article.contents.slice(0, 160),
    openGraph: { type: "article", title: result.article.title },
  };
}

async function ArticlePageContent({ params }: { params: Params }) {
  const { articleId: rawArticleId } = await params;
  const articleId = parseArticleId(rawArticleId);
  if (articleId === null) notFound();

  const result = await getPublishedArticle(articleId);
  if (result.notFound) notFound();

  if (!result.article) {
    return (
      <main className="page-shell page-shell--reading" id="main-content">
        <div className="notice notice--error" role="alert">
          <p>{result.message}</p>
          <Link className="text-link" href="/">
            최신 글로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const article = result.article;
  const headings = getMarkdownHeadings(article.contents);
  const { category } = article;
  const tree = category ? await listCategoryTree() : [];
  // 숨김 카테고리는 공개 트리에 없으므로 링크 대신 이름만 보여준다.
  const isPublic = (slug: string) => findCategory(tree, slug) !== null;
  const categoryNode = category ? (findCategory(tree, category.slug)?.category ?? null) : null;
  const crumbs = category ? [...(category.parent ? [category.parent] : []), category] : [];

  return (
    <main className="page-shell page-shell--article" id="main-content">
      {category ? (
        <nav aria-label="이동 경로" className="breadcrumb">
          <ol>
            <li>
              <Link href="/">홈</Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.id}>
                {isPublic(crumb.slug) ? (
                  <Link href={`/categories/${crumb.slug}`}>{crumb.name}</Link>
                ) : (
                  <span>{crumb.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        <Link className="back-link" href="/">
          <span aria-hidden="true">←</span> 글 모음
        </Link>
      )}
      <div className="article-layout">
        <article className="article-detail">
          <header className="article-detail__header">
            <h1>{article.title}</h1>
            <div className="article-detail__meta">
              <time dateTime={article.publishedAt}>{formatKstDate(article.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>약 {estimateReadingMinutes(article.contents)}분 읽기</span>
              {article.updatedAt !== article.publishedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    <time dateTime={article.updatedAt}>{formatKstDate(article.updatedAt)}</time>{" "}
                    수정
                  </span>
                </>
              )}
              <ArticleShareButton />
            </div>
            {article.tags.length > 0 && (
              <ul className="tag-list article-detail__tags" aria-label="글 태그">
                {article.tags.map((tag) => (
                  <li key={tag.id}>
                    <Link className="tag-pill" href={`/tags/${encodeURIComponent(tag.name)}`}>
                      #{tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </header>
          <ArticleOutline headings={headings} variant="inline" />
          <div className="article-detail__body">
            <MarkdownRenderer content={article.contents} />
          </div>
        </article>
        {(headings.length >= 2 || categoryNode) && (
          <aside aria-label="글 탐색 도구" className="article-rail">
            <ArticleOutline headings={headings} variant="rail" />
            {category && categoryNode && (
              <section
                aria-labelledby="article-category-title"
                className="article-category-card"
                data-tone={categoryTone(category.parent?.slug ?? category.slug)}
              >
                <p className="article-category-card__label">
                  <span aria-hidden="true" className="tone-swatch" />이 글의 카테고리
                </p>
                <h2 id="article-category-title">
                  {category.parent && <span>{category.parent.name} ›</span>} {category.name}
                </h2>
                {categoryNode.description && <p>{categoryNode.description}</p>}
                <Link className="text-link" href={`/categories/${category.slug}`}>
                  글 {categoryNode.articleCount}개 모두 보기 <span aria-hidden="true">→</span>
                </Link>
              </section>
            )}
          </aside>
        )}
      </div>
      <RelatedArticles
        articleId={article.id}
        category={categoryNode ? category : null}
        tag={article.tags[0]?.name}
      />
    </main>
  );
}

export default function ArticlePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <ArticlePageContent params={params} />
    </Suspense>
  );
}
