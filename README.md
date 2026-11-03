# 개인 블로그 프론트엔드

Next.js(App Router)와 TypeScript로 만드는 개인 블로그 화면이다. 프로젝트·도구 설정과 공개 글 목록, 검색, 태그별 목록, 글 상세 화면이 들어 있다. 댓글·인증·관리자 화면은 후속 단계다.

설계, 의존 규칙, 커밋 규칙은 `CLAUDE.md`와 `docs/`에 있다. API 스펙의 정본은 백엔드 레포에 있고, 이 레포의 `openapi/openapi.yaml`은 사본이다. 공개 화면의 UI/UX와 캐시 기준은 `docs/design/frontend.md`를 따른다.

## 준비물

- Node.js 24 (`.nvmrc`)
- pnpm (버전은 `package.json`의 `packageManager`. `corepack enable`로 맞출 수 있다)
- 옆 폴더 `../backend` (API 사본 동기화와 로컬 백엔드 실행용)

## 처음 한 번

```bash
git init -b main
git config core.hooksPath githooks   # pre-commit(포맷), pre-push(린트, 테스트)
cp .env.example .env.local
pnpm install
pnpm dev
```

## 자주 쓰는 명령

| 할 일                            | 명령                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| 개발 서버                        | `pnpm dev`                                                  |
| 린트 / 타입 검사 / 테스트 / 빌드 | `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` |
| 포맷 적용                        | `pnpm format`                                               |
| API 사본 동기화 → 타입 생성      | `pnpm sync:api` → `pnpm gen:api`                            |
| e2e (로컬 백엔드 필요)           | `pnpm exec playwright install` 후 `pnpm test:e2e`           |

## 구조

```
frontend/
├─ src/
│  ├─ app/          # 라우트 파일만
│  ├─ features/     # article, category, comment, auth, editor, media (서로 import 금지)
│  └─ shared/       # api(클라이언트, 생성 타입, 에러 문구), ui, lib
├─ openapi/         # 백엔드 openapi.yaml의 사본
├─ tests/e2e/       # Playwright
└─ docs/design/     # 설계 문서 사본
```

## 공급망 보호

`pnpm-workspace.yaml`의 `minimumReleaseAge`로 게시된 지 7일이 안 된 패키지 버전은 설치하지 않는다. 급하게 최신 버전이 필요하면 `minimumReleaseAgeExclude`에 이유와 함께 추가한다.

## 버전

| 항목                               | 버전                |
| ---------------------------------- | ------------------- |
| Next.js                            | 16.4.3 (2026-10-23) |
| React                              | 19.3.0              |
| pnpm                               | 12.16.1             |
| TanStack Query                     | 5.105               |
| openapi-fetch / openapi-typescript | 0.17 / 7.13         |
| Vitest / Playwright                | 5.0 / 1.64          |
