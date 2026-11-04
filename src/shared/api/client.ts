import createClient, { type Middleware } from "openapi-fetch";
import { apiBaseUrl, getAccessToken, refreshAccessToken } from "./auth-token";
import type { paths } from "./schema";

/**
 * API 호출은 이 클라이언트로만 한다. 경로, 파라미터, 응답 타입은 openapi.yaml에서 생성한 타입으로 검사된다.
 *
 * - 모든 요청에 X-Request-Id를 붙이고, 브라우저에서는 access 토큰을 붙인다.
 * - 401을 받으면 재발급을 한 번 하고 원래 요청을 다시 보낸다.
 */
const originals = new Map<string, Request>();

export const authMiddleware: Middleware = {
  onRequest({ request, id }) {
    if (!request.headers.has("X-Request-Id")) {
      request.headers.set("X-Request-Id", crypto.randomUUID());
    }
    const token = getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    originals.set(id, request.clone());
    return request;
  },
  async onResponse({ response, id, options }) {
    const original = originals.get(id);
    originals.delete(id);
    if (response.status !== 401 || !original || typeof window === "undefined") {
      return response;
    }
    const token = await refreshAccessToken(options.fetch);
    if (!token) {
      return response;
    }
    const retry = new Request(original);
    retry.headers.set("Authorization", `Bearer ${token}`);
    return options.fetch(retry);
  },
  onError({ id }) {
    originals.delete(id);
  },
};

export const api = createClient<paths>({
  baseUrl: `${apiBaseUrl()}/api/v1`,
  credentials: "include",
});

api.use(authMiddleware);
