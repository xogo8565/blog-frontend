import { expect, test } from "@playwright/test";

// P3에서 목록 → 상세, 로그인 → 댓글, 관리자 작성 → 발행 시나리오를 추가한다.
test("홈 화면이 열린다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "개발 노트" })).toBeVisible();
});
