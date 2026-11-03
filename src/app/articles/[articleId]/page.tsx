import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { ArticleOutline } from "@/features/article/components/ArticleOutline";
import { ArticleShareButton } from "@/features/article/components/ArticleShareButton";
import { RelatedArticles } from "@/features/article/components/RelatedArticles";
import { getPublishedArticle } from "@/features/article/api/articles";
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

  return (
    <main className="page-shell page-shell--article" id="main-content">
      <Link className="back-link" href="/">
        <span aria-hidden="true">←</span> 글 모음
      </Link>
      <div className="article-layout">
        <article className="article-detail">
          <header className="article-detail__header">
            <p className="eyebrow">FIELD NOTE / 개발 기록</p>
            <h1>{article.title}</h1>
            <div className="article-detail__meta">
              <time dateTime={article.publishedAt}>{formatKstDate(article.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>약 {estimateReadingMinutes(article.contents)}분 읽기</span>
              {article.updatedAt !== article.publishedAt && (
                <span>업데이트 {formatKstDate(article.updatedAt)}</span>
              )}
              <ArticleShareButton />
            </div>
            {article.tags.length > 0 && (
              <ul className="tag-list article-detail__tags" aria-label="글 태그">
                {article.tags.map((tag) => (
                  <li key={tag.id}>
                    <Link className="tag-pill" href={`/tags/${encodeURIComponent(tag.name)}`}>
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </header>
          <ArticleOutline className="article-outline--mobile" headings={headings} />
          <div className="article-detail__body">
            <MarkdownRenderer content={article.contents} />
          </div>
        </article>
        <aside aria-label="글 탐색 도구" className="article-rail">
          <ArticleOutline className="article-outline--desktop" headings={headings} />
          <div className="article-rail__note">
            <span aria-hidden="true">✳</span>
            <p>필요한 부분을 다시 찾기 쉽도록 목차를 곁에 두었습니다.</p>
          </div>
        </aside>
      </div>
      <RelatedArticles articleId={article.id} tag={article.tags[0]?.name} />
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
