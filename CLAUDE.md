# 개인 블로그 프론트엔드

<!-- 프론트 레포의 프로젝트 지침. 200줄 이하로 유지. 같은 지적을 두 번 하게 되면 한 줄 추가. -->

## Next.js 버전 규칙

@AGENTS.md

위 규칙은 `next dev`가 관리하는 AGENTS.md를 가져온 것이다. 이 레포의 Next.js는 학습 데이터와 API가 다를 수 있으므로, 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 확인한다.

개인 블로그의 화면이다. 공개 화면(목록, 상세, 태그, 검색)은 서버에서 렌더링하고 ISR로 캐시한다.
관리자 화면(글 목록, 에디터)은 같은 앱 안에서 클라이언트 렌더링한다. 배포는 Vercel이다.
백엔드는 별도 git 레포이며, 로컬에서는 옆 폴더 `../backend`에 있다.

- 스택: Next.js(App Router), TypeScript(`strict`), Tailwind CSS, TanStack Query, openapi-fetch, CodeMirror 6
- 패키지 관리: pnpm. Node 버전은 `.nvmrc`를 따른다
- 설계 문서: `docs/design/frontend.md`(라우트별 렌더링·캐시 표, 인증 흐름, 에디터 동작), `docs/design/api-spec.md`(API 규약, 에러 코드)

## 명령어

- 개발 서버: `pnpm dev` (백엔드는 `../backend`에서 `docker compose up -d mysql` 후 bootRun)
- 린트: `pnpm lint` / 타입 검사: `pnpm typecheck`
- 테스트: `pnpm test` (Vitest) / e2e: `pnpm test:e2e` (Playwright, 로컬 백엔드 필요)
- 빌드: `pnpm build`
- 포맷: `pnpm format` / 검사: `pnpm format:check`
- API 스펙 동기화: `pnpm sync:api` (`../backend/docs/api/openapi.yaml` → `openapi/openapi.yaml`)
- API 타입 생성: `pnpm gen:api` (`openapi/openapi.yaml` → `src/shared/api/schema.d.ts`)

## 구조와 의존 규칙

- `src/app/`: 라우트 파일만 둔다(page, layout, route handler, metadata). 비즈니스 로직을 넣지 않는다
- `src/features/{article,category,comment,auth,editor,media}/`: 기능별 API 호출, 컴포넌트, 훅
- `src/shared/{api,ui,lib}/`: API 클라이언트, 공통 UI, 마크다운 렌더러·날짜 포맷
- 의존 방향은 `app` → `features` → `shared` 하나뿐이다. feature끼리 import하지 않는다. 같이 쓸 코드는 `shared`로 내린다
- 경계 규칙은 ESLint가 검사한다. 규칙을 끄거나 예외를 추가해서 통과시키지 않는다

## 렌더링

- 컴포넌트는 기본이 Server Component다. 상태나 이벤트가 필요할 때만 파일 첫 줄에 `'use client'`를 둔다
- Cache Components를 쓴다(`next.config.ts`의 `cacheComponents: true`). 라우트별 캐시 시간은 설계 문서의 표를 따르되, route segment의 `revalidate`·`dynamic` 대신 `'use cache'`와 `cacheLife`로 구현한다. 표와 다르게 바꿀 때는 먼저 묻는다
- 공개 화면의 클라이언트 컴포넌트는 댓글과 "더 보기" 정도로 제한한다
- 발행·발행 취소·삭제·복구가 성공하면 관리자 화면이 재검증 Server Action을 호출한다. Server Action은 access 토큰으로 `/me`를 호출해 ADMIN을 확인한 뒤에만 실행한다

## API와 인증

- API 호출은 `src/shared/api/client.ts`(openapi-fetch)로만 한다. 컴포넌트에서 `fetch`로 API를 직접 부르지 않는다
- 응답·요청 타입을 손으로 정의하지 않는다. `schema.d.ts`는 생성 파일이라 직접 고치지 않는다
- `openapi/openapi.yaml`은 백엔드 정본의 사본이다. 직접 고치지 않고 `pnpm sync:api`로만 갱신하며, 커밋 메시지에 백엔드 커밋 SHA를 적는다
- API 스펙이 바뀌어야 하면 프론트에서 우회하지 말고 먼저 보고한다 (백엔드 레포의 `openapi.yaml`부터 고친다)
- access 토큰은 `src/shared/api/auth-token.ts`의 메모리에만 둔다. localStorage, sessionStorage, 쿠키에 저장하지 않는다. 서버에서는 토큰을 쓰지 않는다
- 401을 받으면 재발급을 한 번 하고 원래 요청을 다시 보낸다. 동시에 여러 요청이 401을 받아도 재발급 요청은 하나만 보낸다
- 에러는 Problem 응답의 `code`로 분기한다. 사용자에게 보여줄 문구는 `src/shared/api/errors.ts` 매핑표에서만 가져온다
- `/admin` 가드는 화면 편의용이다. 권한 판단은 API가 한다고 가정하고, 화면에서 권한 검사를 생략하지도 않는다
- API 사용 경로·요청값·응답/오류 처리가 바뀌면 `docs/design/api-spec.md`를 구현과 함께 갱신한다. OpenAPI 사본 동기화 후 생성 타입을 다시 만들고, 사본과 타입을 직접 편집하지 않는다

## 설계 산출물 동기화

- 라우트, 화면 흐름, 빈 상태·오류·로딩 상태, 반응형 동작, 접근성, 캐시·SEO 정책이 바뀌면 `docs/design/frontend.md`를 같은 작업에서 갱신한다.
- UI 변경에 맞춰 API 소비 방식이 변하면 `docs/design/api-spec.md`도 갱신한다. 실제 화면과 설계 문서가 다르면 구현을 기준으로 문서를 고치거나, 문서가 요구사항이면 구현을 맞춘다.
- API 계약은 백엔드 정본 `../backend/docs/api/openapi.yaml`을 따른다. 타입을 위한 임시 필드나 요청/응답 모양을 코드에 따로 만들지 않는다.
- API·화면 설계에 영향이 없으면 산출물을 수정하지 않은 이유를 작업 결과에 적는다.

## 마크다운

- 공개 화면과 에디터 미리보기는 같은 렌더러(`src/shared/lib/markdown`)를 쓴다
- raw HTML을 렌더링하지 않는다. `rehype-raw`를 쓰지 않고, `dangerouslySetInnerHTML`은 JSON-LD 스크립트에만 쓴다

## UI 컨벤션

- 컴포넌트 파일은 `PascalCase.tsx`, 훅은 `useXxx.ts`. named export를 쓴다 (Next.js가 요구하는 page, layout 등의 default export는 예외)
- 스타일은 Tailwind 유틸리티로 작성한다. 전역 CSS는 `globals.css` 하나만 둔다
- 날짜는 `src/shared/lib/date`로 KST 형식으로 보여준다. API 값(UTC)을 직접 포맷하지 않는다
- 이미지는 `next/image`에 크기를 지정해서 쓰고, 원격 이미지는 이미지 도메인만 허용한다
- 버튼, 입력, 다이얼로그는 키보드로 조작할 수 있어야 하고 접근 가능한 이름이 있어야 한다

## 테스트

- 단위·컴포넌트: Vitest + Testing Library. API는 MSW로 모킹하고, 핸들러는 생성된 타입으로 작성한다
- e2e: Playwright 시나리오 3개(목록 → 상세, 로그인 → 댓글, 관리자 작성 → 발행)를 유지한다
- 작업을 마치면 아래 "작업 후 커밋 순서"의 검사를 모두 통과시킨 뒤 보고한다

## 작업 방식

- 두 개 이상의 기능 폴더를 건드리는 변경은 먼저 계획을 보여주고 승인을 받은 뒤 구현한다
- 작업을 마치면 아래 "작업 후 커밋 순서"를 따른다
- 버그를 고칠 때는 실패하는 테스트를 먼저 작성한다
- 의존성을 추가하기 전에 이유를 설명한다
- 확실하지 않은 라이브러리 API나 버전은 추측하지 말고 확인이 필요하다고 말한다

## 브랜치와 커밋

### 브랜치

- 작업을 시작하면 먼저 최신 main에서 브랜치를 만든다: `git switch main && git pull --ff-only && git switch -c feat/editor-image-paste`
- main에서 직접 커밋하거나 push하지 않는다
- 이름은 `{type}/{scope}-{설명}`(영어 kebab-case)이다. 예: `feat/editor-image-paste`, `fix/comment-reply-form`, `chore/api-sync`
- 브랜치 하나에는 P3 체크리스트 항목 하나만 담는다. 범위 밖의 수정이 필요해지면 멈추고 보고한다

### 작업 후 커밋 순서

1. `pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build`가 통과하는지 확인한다. 실패하면 커밋하지 않고 원인과 함께 보고한다
2. `git status`와 `git diff`로 의도하지 않은 변경(디버그 출력, 임시 파일, `.env*.local`, 주석 처리한 코드)이 없는지 확인한다
3. 파일을 지정해서 stage한다. `git add -A`, `git add .`은 쓰지 않는다
4. 논리 단위로 나눠 커밋한다(예: API 사본 동기화 → 공용 컴포넌트 → 화면). 커밋마다 빌드가 통과하는 상태여야 한다
5. `git log --oneline main..HEAD`로 만든 커밋 목록을 보여주고 멈춘다. push와 PR 생성은 내가 요청할 때만 한다

### 커밋 메시지

- 형식은 `type(scope): 요약`이다. 요약은 한국어 50자 이내이고 끝에 마침표를 찍지 않는다. 예: `feat(editor): 이미지 붙여넣기 업로드`
- 본문에는 무엇을 왜 바꿨는지 쓴다. 어떻게 바꿨는지는 코드가 보여준다
- type: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, `perf`
- scope: `article`, `category`, `comment`, `auth`, `editor`, `media`, `shared`, `api`, `build`
- API 사본 동기화는 단독 커밋으로 한다: `chore(api): openapi 사본 동기화`, 본문에 `backend: <커밋 SHA>`

### PR과 머지

- PR 제목은 커밋 메시지 형식으로 쓰고, 화면 변경이 있으면 스크린샷을 첨부한다
- main이 앞서 있으면 `git rebase main`으로 맞춘다. 이미 push한 브랜치는 `git push --force-with-lease`로만 갱신한다
- main에는 squash merge로 합치고, 머지한 브랜치는 지운다
- 금지: `--no-verify`로 훅 건너뛰기, `git push --force`, 이미 push한 커밋 amend, 묻지 않고 `git reset --hard`·`git clean` 실행

## 하지 말 것

- `NEXT_PUBLIC_` 환경 변수에 비밀 값 넣기 (브라우저에 그대로 노출된다)
- 시크릿이나 `.env*.local` 파일을 커밋하기
- 백엔드 레포(`../backend`)의 파일을 수정하기
- 상태 관리, UI 컴포넌트, 마크다운 관련 라이브러리를 묻지 않고 추가하기
