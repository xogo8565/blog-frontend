import { defineConfig, devices } from "@playwright/test";

/** e2e는 로컬 백엔드를 띄운 상태에서 릴리스 전에 실행한다. 브라우저 설치: pnpm exec playwright install */
export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
