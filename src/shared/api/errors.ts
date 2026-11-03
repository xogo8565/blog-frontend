import type { components } from "./schema";

export type ErrorCode = components["schemas"]["ErrorCode"];
export type Problem = components["schemas"]["Problem"];

/** 사용자에게 보여줄 문구. 에러 코드가 추가되면 타입 오류로 드러난다. */
const MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: "입력한 내용을 다시 확인해 주세요.",
  INVALID_CURSOR: "목록을 처음부터 다시 불러와 주세요.",
  INVALID_SEARCH_QUERY: "검색어는 2~50자로 입력해 주세요.",
  UNSUPPORTED_MEDIA_TYPE: "PNG, JPEG, GIF, WebP 이미지만 올릴 수 있습니다.",
  MEDIA_TOO_LARGE: "이미지는 10MB 이하만 올릴 수 있습니다.",
  UNAUTHENTICATED: "로그인이 필요합니다.",
  REFRESH_TOKEN_INVALID: "다시 로그인해 주세요.",
  REFRESH_TOKEN_REUSED: "보안을 위해 다시 로그인해 주세요.",
  FORBIDDEN: "이 작업을 할 권한이 없습니다.",
  COMMENT_FORBIDDEN: "다른 사람의 댓글은 삭제할 수 없습니다.",
  ARTICLE_NOT_FOUND: "글을 찾을 수 없습니다.",
  COMMENT_NOT_FOUND: "댓글을 찾을 수 없습니다.",
  MEDIA_NOT_FOUND: "이미지를 찾을 수 없습니다.",
  ARTICLE_NOT_PUBLISHABLE: "제목과 본문을 입력해야 발행할 수 있습니다.",
  INVALID_STATE_TRANSITION: "지금 상태에서는 할 수 없는 작업입니다.",
  ARTICLE_VERSION_CONFLICT: "다른 곳에서 먼저 저장된 초안이 있습니다.",
  ARTICLE_DELETED: "삭제된 글은 수정할 수 없습니다.",
  COMMENT_DEPTH_EXCEEDED: "답글에는 다시 답글을 달 수 없습니다.",
  MEDIA_NOT_UPLOADED: "이미지 업로드가 끝나지 않았습니다. 다시 올려 주세요.",
  RATE_LIMITED: "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
  INTERNAL_ERROR: "잠시 후 다시 시도해 주세요.",
};

function isProblem(value: unknown): value is Problem {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as { code: unknown }).code === "string"
  );
}

/** API 에러를 사용자 문구로 바꾼다. 알 수 없는 에러는 요청 ID와 함께 안내한다. */
export function toUserMessage(error: unknown): string {
  if (isProblem(error) && error.code in MESSAGES) {
    return MESSAGES[error.code];
  }
  const requestId = isProblem(error) ? error.requestId : undefined;
  return requestId
    ? `잠시 후 다시 시도해 주세요. (요청 ID: ${requestId})`
    : "잠시 후 다시 시도해 주세요.";
}
