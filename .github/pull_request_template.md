## 변경 내용

<!-- 무엇을 왜 바꿨는지 적는다. 관련 P3 체크리스트 항목도 적는다. -->

## 스크린샷

<!-- 화면이 바뀌었으면 전후 스크린샷을 붙인다. -->

## 체크리스트

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`가 통과한다
- [ ] API 사본을 바꿨다면 단독 커밋(`chore(api): openapi 사본 동기화`)에 백엔드 SHA를 적었다
- [ ] 새 에러 코드가 있다면 `src/shared/api/errors.ts`에 문구를 추가했다
- [ ] feature끼리 import하지 않았다 (ESLint 경계 규칙 통과)
- [ ] 키보드로 조작할 수 있고, 버튼과 입력에 접근 가능한 이름이 있다
- [ ] 라우트/UI/상태/접근성/캐시 정책 변경을 `docs/design/frontend.md`에 반영했다
- [ ] API 소비 방식 변경을 `docs/design/api-spec.md`에 반영했다
- [ ] 산출물 변경이 없으면 PR 설명에 영향이 없는 이유를 적었다
