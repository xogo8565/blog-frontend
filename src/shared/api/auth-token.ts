/**
 * access 토큰 보관과 재발급.
 *
 * - 토큰은 이 모듈의 메모리에만 둔다. localStorage, sessionStorage, 쿠키에 저장하지 않는다.
 * - 서버(Server Component)에서는 토큰을 쓰지 않는다. 서버는 공개 API만 호출한다.
 * - 동시에 여러 요청이 401을 받아도 재발급 요청은 하나만 보낸다.
 */
type TokenResponse = { accessToken: string; tokenType: "Bearer"; expiresIn: number };

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

/** refresh 쿠키로 access 토큰을 다시 받는다. 실패하면 null을 돌려주고 토큰을 지운다. */
export function refreshAccessToken(fetchFn: typeof fetch = fetch): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetchFn(`${apiBaseUrl()}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          setAccessToken(null);
          return null;
        }
        const body = (await response.json()) as TokenResponse;
        setAccessToken(body.accessToken);
        return body.accessToken;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}
