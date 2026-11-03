import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleCollection } from "@/features/article/components/ArticleCollection";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { ArticleSearchForm } from "@/features/article/components/ArticleSearchForm";
import { listPublishedArticles, listTopTags, type TagCount } from "@/features/article/api/articles";
import {
  listCategoryTree,
  popularCategories,
  type CategoryNode,
} from "@/features/category/api/categories";
import { CategoryIndex } from "@/features/category/components/CategoryIndex";
import { CategoryTree } from "@/features/category/components/CategoryTree";

export const metadata: Metadata = {
  title: "블로그",
  description: "설계와 구현 사이에서 배운 개발 경험을 기록합니다.",
};

type SearchParams = Promise<{ cursor?: string | string[] }>;
type TopicLink = Pick<TagCount, "id" | "name"> & { articleCount?: number };

function firstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function HomeRail({ tree, topics }: { tree: CategoryNode[]; topics: TopicLink[] }) {
  return (
    <aside aria-label="글 탐색" className="home-rail">
      {tree.length > 0 && (
        <div className="home-rail__panel">
          <CategoryTree headingId="rail-categories" tree={tree} />
        </div>
      )}
      <section aria-labelledby="tags-title" className="home-rail__panel home-topics" id="tags">
        <h2 id="tags-title">태그</h2>
        {topics.length > 0 ? (
          <ul className="topic-list">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link href={`/tags/${encodeURIComponent(topic.name)}`}>
                  <span>#{topic.name}</span>
                  {typeof topic.articleCount === "number" && (
                    <span className="topic-list__count">
                      {topic.articleCount}
                      <span className="sr-only">개의 글</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="home-topics__empty">글이 쌓이면 태그별로 모아 보여드릴게요.</p>
        )}
      </section>
    </aside>
  );
}

function LatestHeading() {
  return (
    <div className="home-section-heading">
      <h2 id="latest-title">최신 글</h2>
      <span>최근 발행 순</span>
    </div>
  );
}

async function LatestArticles({ searchParams }: { searchParams: SearchParams }) {
  const { cursor } = await searchParams;
  const currentCursor = firstValue(cursor);
  const [result, topTags, tree] = await Promise.all([
    listPublishedArticles(currentCursor),
    listTopTags(8),
    listCategoryTree(),
  ]);
  const items = result.page?.items ?? [];
  const fallbackTopics = new Map<number, TopicLink>();

  for (const article of items) {
    for (const tag of article.tags) {
      fallbackTopics.set(tag.id, { id: tag.id, name: tag.name });
    }
  }

  const topics: TopicLink[] =
    topTags.length > 0
      ? topTags.map(({ id, name, articleCount }) => ({ id, name, articleCount }))
      : [...fallbackTopics.values()].slice(0, 8);
  const nextCursor = result.page?.nextCursor;
  const nextHref = nextCursor ? `/?cursor=${encodeURIComponent(nextCursor)}#latest` : null;

  return (
    <>
      {!currentCursor && <CategoryIndex categories={popularCategories(tree, 4)} />}
      <div className="home-content-grid">
        <section aria-labelledby="latest-title" className="home-main-column" id="latest">
          <LatestHeading />
          <ArticleCollection
            emptyDescription="새 글이 공개되면 이곳에서 가장 먼저 확인할 수 있습니다."
            emptyTitle="아직 공개된 글이 없습니다"
            firstHref={currentCursor ? "/" : null}
            message={result.message}
            nextHref={nextHref}
            page={result.page}
            retryHref={currentCursor ? `/?cursor=${encodeURIComponent(currentCursor)}` : "/"}
            titleLevel={3}
          />
        </section>
        <HomeRail topics={topics} tree={tree} />
      </div>
    </>
  );
}

export default function HomePage({ searchParams }: { searchParams?: SearchParams } = {}) {
  const articles = searchParams ? (
    <Suspense fallback={<ArticleLoading />}>
      <LatestArticles searchParams={searchParams} />
    </Suspense>
  ) : (
    <div className="home-content-grid">
      <section aria-labelledby="latest-title" className="home-main-column" id="latest">
        <LatestHeading />
        <ArticleCollection
          emptyDescription="새 글이 공개되면 이곳에서 가장 먼저 확인할 수 있습니다."
          emptyTitle="아직 공개된 글이 없습니다"
          message={null}
          nextHref={null}
          page={null}
          retryHref="/"
          titleLevel={3}
        />
      </section>
      <HomeRail topics={[]} tree={[]} />
    </div>
  );

  return (
    <main className="home-shell" id="main-content">
      <section aria-labelledby="home-title" className="home-hero">
        <div>
          <p className="eyebrow">ENGINEERING JOURNAL</p>
          <h1 id="home-title">개발 노트</h1>
          <p className="home-hero__description">
            만들고, 배우고 기록합니다. 설계와 구현 사이에서 마주친 선택과 작은 실험을 주제별로
            남깁니다.
          </p>
        </div>
        <div className="home-hero__search">
          <ArticleSearchForm />
        </div>
      </section>

      {articles}
    </main>
  );
}
