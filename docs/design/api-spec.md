# 프론트엔드 API 연동 설계

## 기준과 생성 흐름

- API 계약의 정본은 `../../backend/docs/api/openapi.yaml`이다.
- `openapi/openapi.yaml`은 백엔드 정본의 프론트엔드 사본이다. 사본을 직접 수정하지 않는다.
- 백엔드 계약 변경 후 다음 순서로 동기화한다.

```bash
pnpm sync:api
pnpm gen:api
```

- 요청·응답 타입은 `src/shared/api/schema.d.ts`에서 가져온다. 생성 파일을 직접 고치지 않는다.
- 모든 브라우저·서버 API 호출은 `src/shared/api/client.ts`의 `api` 인스턴스를 사용한다.

## 공통 규칙

- 기본 주소는 `NEXT_PUBLIC_API_BASE_URL`이며, 비어 있으면 로컬 개발용 `http://localhost:8080`을 사용한다.
- API 경로는 `/api/v1` 아래에 둔다. 모든 요청에 `X-Request-Id`를 전달하고, 응답의 같은 헤더는 장애 문의에 활용한다.
- JSON 필드는 camelCase다. ID는 JSON number, 일시는 UTC ISO 8601 문자열이다. 날짜 표시는 `src/shared/lib/date.ts`의 `formatKstDate()`를 사용한다.
- 값이 없는 필드는 API에서 `null`로 보낸다. 빈 컬렉션은 빈 배열이다.
- 실패 응답은 RFC 9457 Problem Details이며, 화면 문구는 `src/shared/api/errors.ts`의 `toUserMessage()`만 사용한다.
- 요청 또는 응답 타입을 컴포넌트 안에서 별도로 선언하거나 `any`로 우회하지 않는다.

## 공개 콘텐츠 API

| 사용자 동작   | 메서드·경로                          | 주요 규칙                                                                                                                                                      |
| ------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 최신 글 목록  | `GET /articles`                      | PUBLISHED만 반환, `publishedAt` 내림차순, 기본 크기 10, 커서 기반                                                                                              |
| 태그별 글     | `GET /articles?tag=...`              | 목록 API의 태그 필터를 사용                                                                                                                                    |
| 카테고리 글   | `GET /articles?category=...`         | 카테고리 슬러그 필터. 상위 슬러그면 하위 카테고리 글을 포함한다. 카테고리 페이지와 상세의 이어 읽기에서 사용                                                   |
| 카테고리 트리 | `GET /categories`                    | 공개 카테고리 2단계 트리와 발행 글 수. 루트 레이아웃(헤더·푸터), 홈 주제 카드·레일, 카테고리 페이지, 상세 이동 경로에서 사용. 실패하면 빈 배열로 영역을 생략   |
| 글 검색       | `GET /articles/search?q=...`         | 제목·본문 검색, 검색어 2~50자, 발행일 내림차순                                                                                                                 |
| 글 상세       | `GET /articles/{articleId}`          | DRAFT·DELETED를 포함해 공개되지 않은 글은 404                                                                                                                  |
| 인기 태그     | `GET /tags/top?n=...`                | 홈에서 상위 8개를 요청한다. 비거나 실패하면 현재 글 페이지의 태그로 대체한다. 검색·태그 결과가 비면 상위 6개를 추천 주제로 요청하고, 실패하면 추천을 생략한다. |
| 댓글 목록     | `GET /articles/{articleId}/comments` | 공개 가능한 댓글만 반환. 댓글 UX 단계에서 연결                                                                                                                 |

목록 응답은 `ArticleSummaryPage`를 사용한다. `items`에는 제목, 요약, 선택적 썸네일 URL, 태그, 카테고리 경로(`CategoryPath`, 미분류면 `null`), 발행 일시가 포함되고, `nextCursor`는 다음 페이지가 없으면 `null`이다. 커서는 내용을 해석하지 않고 다음 요청에 그대로 보낸다.

상세 응답은 `ArticleDetail`을 사용한다. 본문은 Markdown 문자열이다. raw HTML을 실행하지 않고, 화면의 지원 문법은 `frontend.md` 및 구현된 공용 Markdown 렌더러와 일치시킨다.

## 관리자 카테고리 API

| 사용자 동작 | 메서드·경로                                      | 화면 처리                                                                                           |
| ----------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 권한 확인   | `GET /me`                                        | 401이면 로그인 안내, `role`이 ADMIN이 아니면 권한 안내 (`AdminGuard`)                               |
| 목록        | `GET /admin/categories`                          | 숨김 포함 평면 목록. 상위 뒤에 하위를 묶어 표로 보여준다                                            |
| 추가·수정   | `POST /admin/categories`, `PUT .../{categoryId}` | `CATEGORY_SLUG_DUPLICATED`는 슬러그 필드 오류로, 그 밖의 오류는 상태 문구로 보여준다                |
| 순서 변경   | `PUT /admin/categories/order`                    | 같은 부모의 형제 ID 전체를 바뀐 순서로 보낸다                                                       |
| 삭제        | `DELETE /admin/categories/{categoryId}`          | 하위가 있으면 화면에서 막고, 글이 있으면 `moveTo`를 함께 보낸다. `CATEGORY_NOT_EMPTY`는 문구로 안내 |

- 요청은 `src/features/category/api/adminCategories.ts`의 TanStack Query 훅으로만 보낸다. 실패 응답은 Problem 객체를 그대로 던지고 화면은 `toUserMessage()`로 문구를 만든다.
- 변경에 성공하면 목록 쿼리를 무효화하고 `revalidateCategoryPages(accessToken)` Server Action을 호출한다. Server Action은 그 토큰으로 `/me`를 호출해 ADMIN일 때만 `updateTag('categories')`, `updateTag('articles')`를 실행한다.
- 글의 카테고리 지정(`PUT /admin/articles/{articleId}/category`)은 계약만 있고, 편집기 단계에서 연결한다.

## 인증 API와 토큰 취급

- 공개 글 목록·검색·상세는 인증 없이 호출한다.
- access token은 `src/shared/api/auth-token.ts` 모듈 메모리에만 보관한다. localStorage, sessionStorage, URL, HTML에 저장하지 않는다.
- refresh token은 서버 쿠키로만 다룬다. access token 재발급은 `POST /auth/refresh`를 사용하며, 성공 시 이전 refresh token은 교체된다.
- 클라이언트 요청이 401이면 재발급을 한 번 시도하고 원래 요청을 재시도한다. 동시에 여러 401이 발생하면 재발급 요청을 합친다.
- Server Component는 공개 API만 호출하고 브라우저 access token을 사용하지 않는다.
- `/admin` 경로 가드는 편의 기능이다. 권한 판단은 항상 API가 수행한다.

## 커서와 캐시

- 커서와 검색어는 URL 쿼리에서 읽고 캐시 함수의 인자로 전달한다. 캐시 함수 안에서 `searchParams`, cookies, headers를 직접 읽지 않는다.
- 공개 목록·검색·태그·카테고리·상세 캐시는 `frontend.md`의 `cacheLife('minutes')` 정책과 `articles` 태그를 따른다. 카테고리 트리와 글 목록에는 `categories` 태그를 함께 단다.
- 상세 글은 추가로 `article:{id}` 태그를 사용한다. 발행·발행 취소·삭제·복구 Server Action을 만들 때 관련 태그를 재검증한다.
- 사용자별 정보, 인증 응답, 초안, 관리자 목록은 공개 캐시에 넣지 않는다.

## 에러 처리

- `INVALID_CURSOR`: 기존 커서를 버리고 목록 첫 페이지로 다시 이동할 수 있게 안내한다.
- `INVALID_SEARCH_QUERY`: 검색어 길이와 입력을 다시 확인하도록 안내한다.
- `ARTICLE_NOT_FOUND`: 글 상세에서는 Next.js 404 화면으로 표시한다.
- `RATE_LIMITED`, `INTERNAL_ERROR`, 네트워크 장애: 원시 서버 메시지를 숨기고 공통 재시도 안내를 보여준다.
- 에러 코드를 추가하거나 바꾸려면 백엔드 OpenAPI와 `src/shared/api/errors.ts`의 타입·문구를 함께 갱신한다.
- 네트워크 예외는 `toUserMessage()`로 공통 재시도 문구에 바꾸며, 홈 주제 목록 조회 예외는 현재 글 목록에서 추출한 태그로 대체한다.

## 콘텐츠 보안과 미디어

- Markdown의 raw HTML은 렌더링하지 않는다. `rehype-raw`와 `dangerouslySetInnerHTML`을 추가하지 않는다.
- 링크는 `http`, `https`, `mailto` 프로토콜만 허용한다. 허용되지 않는 프로토콜은 링크로 만들지 않는다.
- 외부 이미지 도메인은 실제 미디어 호스트가 확정된 후 `next.config.ts`에 명시적으로 등록한다. 모든 호스트를 허용하는 와일드카드 설정은 사용하지 않는다.
- `thumbnailUrl`과 본문 이미지 렌더링은 미디어 호스트와 접근성 대체 문구 정책이 정해진 뒤 구현한다.
