import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach } from "vitest";
import { server } from "./src/shared/api/test/server";

// 테스트 파일이 API 클라이언트를 불러오기 전에 fetch를 가로채야 하므로 최상위에서 시작한다.
server.listen({ onUnhandledFrame: "error" });
// vitest globals를 켜지 않아 Testing Library 자동 정리가 동작하지 않으므로 직접 정리한다.
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
