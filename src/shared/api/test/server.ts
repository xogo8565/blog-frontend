import { setupServer } from "msw/node";
import { apiBaseUrl } from "../auth-token";

/** 테스트용 API 주소. 핸들러는 테스트마다 server.use()로 붙인다. */
export function apiUrl(path: string): string {
  return `${apiBaseUrl()}/api/v1${path}`;
}

/**
 * openapi-fetch는 클라이언트를 만들 때 fetch를 붙잡으므로, 이 서버는 테스트 파일이
 * client.ts를 불러오기 전에 vitest.setup.ts에서 listen()해야 한다.
 */
export const server = setupServer();
