import { describe, expect, it } from "vitest";
import { toUserMessage } from "./errors";

describe("toUserMessage", () => {
  it("에러 코드에 맞는 문구를 돌려준다", () => {
    expect(
      toUserMessage({
        type: "https://api.example.com/problems/article-version-conflict",
        title: "Article version conflict",
        status: 409,
        detail: "요청 version 7, 현재 version 8",
        instance: "/api/v1/admin/articles/1/draft",
        code: "ARTICLE_VERSION_CONFLICT",
        requestId: "01JC8V2T6Q9N",
      }),
    ).toBe("다른 곳에서 먼저 저장된 초안이 있습니다.");
  });

  it("카테고리 오류 코드도 문구로 바꾼다", () => {
    expect(toUserMessage({ code: "CATEGORY_NOT_EMPTY", requestId: "abc" })).toBe(
      "하위 카테고리나 글이 남아 있어 삭제할 수 없습니다.",
    );
  });

  it("모르는 코드는 요청 ID와 함께 안내한다", () => {
    expect(toUserMessage({ code: "SOMETHING_NEW", requestId: "abc" })).toBe(
      "잠시 후 다시 시도해 주세요. (요청 ID: abc)",
    );
  });

  it("Problem 형식이 아니면 기본 문구를 돌려준다", () => {
    expect(toUserMessage(new Error("network"))).toBe("잠시 후 다시 시도해 주세요.");
  });
});
