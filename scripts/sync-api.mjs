// 백엔드 레포의 openapi.yaml(정본)을 이 레포의 openapi/로 복사한다.
// 사용: pnpm sync:api  →  pnpm gen:api  →  커밋 메시지에 출력된 백엔드 SHA를 적는다.
import { copyFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const backendDir = resolve(process.env.BACKEND_DIR ?? "../backend");
const source = resolve(backendDir, "docs/api/openapi.yaml");
const target = resolve("openapi/openapi.yaml");

if (!existsSync(source)) {
  console.error(`백엔드 스펙을 찾을 수 없습니다: ${source}`);
  console.error("작업 폴더에 backend 레포가 옆에 있는지, 또는 BACKEND_DIR 환경 변수를 확인하세요.");
  process.exit(1);
}

copyFileSync(source, target);

let sha = "unknown";
try {
  sha = execFileSync("git", ["-C", backendDir, "rev-parse", "--short", "HEAD"]).toString().trim();
} catch {
  // 백엔드 폴더가 git 레포가 아니면 SHA 없이 진행한다.
}

console.log(`openapi.yaml을 동기화했습니다. (backend: ${sha})`);
console.log("다음 단계: pnpm gen:api");
console.log(`커밋 예시: chore(api): openapi 사본 동기화  /  본문: backend: ${sha}`);
