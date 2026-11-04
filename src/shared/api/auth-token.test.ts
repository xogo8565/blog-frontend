import { afterEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, refreshAccessToken, setAccessToken } from "./auth-token";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  setAccessToken(null);
});

describe("refreshAccessToken", () => {
  it("재발급에 성공하면 토큰을 메모리에 둔다", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ accessToken: "new-token", tokenType: "Bearer", expiresIn: 900 }),
    );

    await expect(refreshAccessToken(fetchFn)).resolves.toBe("new-token");
    expect(getAccessToken()).toBe("new-token");
    expect(fetchFn).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/refresh",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("동시에 여러 번 불러도 재발급 요청은 한 번만 보낸다", async () => {
    let resolve: (value: Response) => void = () => {};
    const fetchFn = vi.fn(() => new Promise<Response>((r) => (resolve = r)));

    const first = refreshAccessToken(fetchFn);
    const second = refreshAccessToken(fetchFn);
    resolve(jsonResponse({ accessToken: "shared", tokenType: "Bearer", expiresIn: 900 }));

    await expect(Promise.all([first, second])).resolves.toEqual(["shared", "shared"]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("재발급에 실패하면 null을 돌려주고 토큰을 지운다", async () => {
    setAccessToken("old");
    const fetchFn = vi.fn(async () => jsonResponse({ code: "REFRESH_TOKEN_INVALID" }, 401));

    await expect(refreshAccessToken(fetchFn)).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
