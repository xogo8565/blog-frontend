import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleCollection } from "@/features/article/components/ArticleCollection";
import { ArticleLoading } from "@/features/article/components/ArticleLoading";
import { ArticleSearchForm } from "@/features/article/components/ArticleSearchForm";
import { listPublishedArticles, listTopTags, type TagCount } from "@/features/article/api/articles";

export const metadata: Metadata = {
  title: "블로그",
  description: "설계와 구현 사이에서 배운 개발 경험을 기록합니다.",
};

type SearchParams = Promise<{ cursor?: string | string[] }>;
type TopicLink = Pick<TagCount, "id" | "name"> & { articleCount?: number };

function firstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function HomeDiscoveryRail({ topics }: { topics: TopicLink[] }) {
  return (
    <aside aria-label="글 탐색" className="home-rail">
      <section aria-labelledby="search-title" className="home-rail__panel home-search-panel">
        <p className="eyebrow">SEARCH THE ARCHIVE</p>
        <h2 id="search-title">찾는 주제가 있나요?</h2>
        <p>제목과 본문에서 키워드로 찾아보세요.</p>
        <ArticleSearchForm compact />
      </section>

      <section aria-labelledby="topics-title" className="home-rail__panel home-topics" id="topics">
        <div className="home-rail__heading">
          <div>
            <p className="eyebrow">TOPICS</p>
            <h2 id="topics-title">주제별로 찾기</h2>
          </div>
          <span aria-hidden="true">↘</span>
        </div>
        {topics.length > 0 ? (
          <ul className="topic-list">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link href={`/tags/${encodeURIComponent(topic.name)}`}>
                  <span>#{topic.name}</span>
                  {typeof topic.articleCount === "number" && (
                    <span className="topic-list__count">{topic.articleCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="home-topics__empty">글이 쌓이면 주제별로 모아 보여드릴게요.</p>
        )}
      </section>
    </aside>
  );
}

async function LatestArticles({ searchParams }: { searchParams: SearchParams }) {
  const { cursor } = await searchParams;
  const currentCursor = firstValue(cursor);
  const [result, topTags] = await Promise.all([
    listPublishedArticles(currentCursor, null),
    listTopTags(8),
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
  const nextHref = nextCursor ? `/?cursor=${encodeURIComponent(nextCursor)}` : null;

  return (
    <div className="home-content-grid">
      <section aria-labelledby="latest-title" className="home-main-column" id="latest">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">THE JOURNAL</p>
            <h2 id="latest-title">최신 글</h2>
          </div>
          <span>최근 발행 순</span>
        </div>

        <ArticleCollection
          emptyDescription="새 글이 공개되면 이곳에서 가장 먼저 확인할 수 있습니다."
          emptyTitle="아직 공개된 글이 없습니다"
          message={result.message}
          nextHref={nextHref}
          page={result.page}
          retryHref={currentCursor ? `/?cursor=${encodeURIComponent(currentCursor)}` : "/"}
          titleLevel={3}
        />
      </section>
      <HomeDiscoveryRail topics={topics} />
    </div>
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
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">THE JOURNAL</p>
            <h2 id="latest-title">최신 글</h2>
          </div>
          <span>최근 발행 순</span>
        </div>
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
      <HomeDiscoveryRail topics={[]} />
    </div>
  );

  return (
    <main className="home-shell" id="main-content">
      <section aria-labelledby="home-title" className="home-hero">
        <p className="eyebrow">ENGINEERING JOURNAL</p>
        <div className="home-hero__content">
          <h1 id="home-title">
            <span className="home-hero__title-line">만들고, 배우고</span>
            <span className="home-hero__title-line">기록합니다.</span>
          </h1>
          <div className="home-hero__intro">
            <p className="home-hero__description">
              설계와 구현 사이에서 마주친 선택과 작은 실험을 기록합니다. 다음 시도에 도움이 되는
              경험을 나눕니다.
            </p>
            <div className="home-hero__actions">
              <Link className="button button--primary" href="#latest">
                최신 글 보기 <span aria-hidden="true">↓</span>
              </Link>
              <Link className="home-hero__secondary-link" href="#topics">
                주제별로 찾기 <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {articles}
    </main>
  );
}
