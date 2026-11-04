# 설계 문서

`frontend.md`는 프론트엔드 UX·기술 설계 기준이고, `api-spec.md`는 프론트엔드 API 연동 규칙이다. 기존에 안내된 Claude Doc 원본은 이 작업공간에서 확인할 수 없어, 두 문서는 현재 저장소에서 확인한 지침과 계약을 기준으로 작성했다.

API 요청·응답의 정본은 `../../backend/docs/api/openapi.yaml`이다. API 계약을 바꿀 때는 백엔드 정본을 수정하고 프론트엔드 타입과 문서를 동기화한다.

화면·라우트·상태·접근성·캐시 변경은 `frontend.md`에, API 소비 방식 변경은 `api-spec.md`에 구현과 같은 작업에서 반영한다. 전체 산출물 갱신 절차는 작업공간 루트 `AGENTS.md`와 `frontend/CLAUDE.md`를 따른다.
