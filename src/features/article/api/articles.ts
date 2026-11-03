import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/shared/api/client";
import { toUserMessage } from "@/shared/api/errors";
import type { components } from "@/shared/api/schema";

export type ArticleSummaryPage = components["schemas"]["ArticleSummaryPage"];
export type ArticleSummary = components["schemas"]["ArticleSummary"];
export type ArticleDetail = components["schemas"]["ArticleDetail"];
export type TagCount = components["schemas"]["TagCount"];
export type CategoryPath = components["schemas"]["CategoryPath"];

export type ArticlePageResult = {
  page: ArticleSummaryPage | null;
  message: string | null;
};

export type ArticleFilter = {
  tag?: string;
  /** 카테고리 슬러그. 상위 카테고리면 하위 카테고리 글을 포함한다. */
  category?: string;
};

export async function listPublishedArticles(cursor: string | null, filter: ArticleFilter = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "categories");

  try {
    const { data, error } = await api.GET("/articles", {
      params: {
        query: {
          cursor: cursor ?? undefined,
          size: 10,
          tag: filter.tag,
          category: filter.category,
        },
      },
    });

    return {
      page: data ?? null,
      message: data ? null : toUserMessage(error),
    } satisfies ArticlePageResult;
  } catch (error) {
    return { page: null, message: toUserMessage(error) } satisfies ArticlePageResult;
  }
}

export async function listTopTags(limit: number): Promise<TagCount[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "tags");

  try {
    const { data } = await api.GET("/tags/top", {
      params: { query: { n: limit } },
    });

    return data ?? [];
  } catch {
    return [];
  }
}

export async function searchPublishedArticles(query: string, cursor: string | null) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  try {
    const { data, error } = await api.GET("/articles/search", {
      params: { query: { q: query, cursor: cursor ?? undefined, size: 10 } },
    });

    return {
      page: data ?? null,
      message: data ? null : toUserMessage(error),
    } satisfies ArticlePageResult;
  } catch (error) {
    return { page: null, message: toUserMessage(error) } satisfies ArticlePageResult;
  }
}

export type ArticleDetailResult = {
  article: ArticleDetail | null;
  message: string | null;
  notFound: boolean;
};

export async function getPublishedArticle(articleId: number): Promise<ArticleDetailResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", `article:${articleId}`);

  try {
    const { data, error } = await api.GET("/articles/{articleId}", {
      params: { path: { articleId } },
    });

    const notFound =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ARTICLE_NOT_FOUND";

    return {
      article: data ?? null,
      message: data || notFound ? null : toUserMessage(error),
      notFound,
    };
  } catch (error) {
    return {
      article: null,
      message: toUserMessage(error),
      notFound: false,
    };
  }
}
