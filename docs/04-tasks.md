# 04 — Tasks

## 진행 규칙

> 1. **순서대로만 진행한다.** 이전 단계의 검증이 통과되지 않으면 다음 단계로 넘어가지 않는다.
> 2. **병렬 작업 금지.** 두 단계를 동시에 진행하지 않는다.
> 3. **단계별 검증 필수.** 각 단계의 "검증 방법" 항목을 모두 통과해야 완료로 표시한다.
> 4. **확장 단계 제외.** JWT 로그인·팀·Kanban 등 확장 기능은 이 문서에 포함하지 않는다.

---

## Phase 1 — 설계 ✅ 완료

> CLAUDE.md 및 docs/ 6개 문서 작성

| # | 작업 | 검증 방법 | 상태 |
|---|------|----------|------|
| 1-01 | `CLAUDE.md` 작성 (역할·규칙·모호한 요청 처리) | 파일 존재, 5개 절대 규칙 포함 확인 | ✅ |
| 1-02 | `docs/00-overview.md` 작성 (문서 지도, 분리 원칙) | 6개 파일 매핑표·읽는 순서 포함 확인 | ✅ |
| 1-03 | `docs/01-product.md` 작성 (목표·페르소나·MVP) | 성공 기준 5항목·범위 외 명시 확인 | ✅ |
| 1-04 | `docs/02-specs.md` 작성 (모델·API·화면 명세) | Task 7필드·5개 엔드포인트·CRUD UI 흐름 확인 | ✅ |
| 1-05 | `docs/03-design.md` 작성 (8개 기술 결정) | 선택·대안·근거·트레이드오프 8행 확인 | ✅ |
| 1-06 | `docs/04-tasks.md` 작성 (이 문서) | Phase 1~3 체크리스트·검증 방법 포함 확인 | ✅ |
| 1-07 | `docs/05-conventions.md` 작성 (컨벤션·Git 전략) | 네이밍·커밋·브랜치 규칙 포함 확인 | ✅ |
| 1-08 | 전체 docs/ 교차 검토 (내부 참조 일관성) | 파일명·용어가 6개 문서에서 통일되었는지 확인 | ✅ |
| 1-09 | `.gitignore` 생성 (`.env`, `__pycache__`, `*.db` 등 제외) | `git status`에서 제외 대상 파일 미노출 확인 | ✅ |
| 1-10 | Phase 1 전체 git commit & push | GitHub에서 `docs/` 6개 + `CLAUDE.md` + `.gitignore` 확인 | ✅ |

---

## Phase 2 — 백엔드

> FastAPI로 CRUD API 5개 구현, Swagger UI에서 전 엔드포인트 동작 확인

| # | 작업 | 검증 방법 | 상태 |
|---|------|----------|------|
| 2-01 | `backend/` 폴더 생성, `requirements.txt` 작성 (FastAPI·Uvicorn·SQLAlchemy) | `pip install -r requirements.txt` 오류 없음 | ✅ |
| 2-02 | `backend/database.py` — SQLite 연결, SQLAlchemy 세션 팩토리 | Python에서 `import database` 오류 없음 | ✅ |
| 2-03 | `backend/models.py` — Task ORM 모델 (7개 필드) | `Base.metadata.create_all()` 실행 후 `tasks.db` 생성 확인 | ✅ |
| 2-04 | `backend/schemas.py` — Pydantic 요청/응답 스키마 분리 (`TaskCreate`, `TaskUpdate`, `TaskResponse`, `TaskListItem`) | `from schemas import TaskCreate` 오류 없음 | ✅ |
| 2-05 | `backend/crud.py` — DB 조작 함수 (create·list·get·update·delete) | 단위 테스트 5개 통과 (각 함수 1개씩) | ✅ |
| 2-06 | `backend/main.py` — FastAPI 앱, CORS 설정, 라우터 등록 | `uvicorn main:app --reload` 기동, `GET /` → 200 | ✅ |
| 2-07 | `POST /api/tasks` 구현 및 검증 로직 (400·422 처리) | Swagger에서 정상 생성 201, title 누락 시 400 확인 | ✅ |
| 2-08 | `GET /api/tasks`, `GET /api/tasks/{id}` 구현 | 목록 `description` 제외, 단건 포함 Swagger 확인 | ✅ |
| 2-09 | `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}` 구현 | PUT 부분 수정 200, 없는 id 404, DELETE 204 Swagger 확인 | ✅ |
| 2-10 | Phase 2 전체 git commit & push | `http://localhost:8000/docs` 5개 엔드포인트 전부 초록 확인 | ✅ |

---

## Phase 3 — 프론트엔드

> HTML + Vanilla JS + Tailwind CDN으로 UI 구현, 백엔드 API 연결

| # | 작업 | 검증 방법 | 상태 |
|---|------|----------|------|
| 3-01 | `frontend/` 폴더 생성, `index.html` 기본 구조 (Tailwind CDN, 시스템 폰트, `dark:` 설정) | 브라우저 오픈, 빈 페이지 정상 로드·콘솔 에러 없음 | ✅ |
| 3-02 | 라이트/다크 테마 토글 구현 (`localStorage`, `prefers-color-scheme` 초기값) | 토글 클릭 시 전환, 새로고침 후 상태 유지 확인 | ✅ |
| 3-03 | 태스크 추가 폼 UI (title·due_at·status 필드, macOS 디자인 토큰 적용) | 360px 뷰포트에서 레이아웃 깨짐 없음 | ✅ |
| 3-04 | 태스크 카드 목록 렌더링 (상태 배지, `D-N HH:MM` 마감 표시) | 더미 데이터로 카드 3장 이상 렌더링, 배지 색상 3종 확인 | ✅ |
| 3-05 | `POST /api/tasks` 연결 — 폼 제출 → API 호출 → 목록 갱신 | 실제 추가 후 새로고침해도 목록 유지 확인 | ✅ |
| 3-06 | `GET /api/tasks` 폴링 연결 (3초 간격) + 수정 모달 (`PUT /api/tasks/{id}`) | 다른 탭에서 수정 시 3초 내 화면 반영 확인 | ✅ |
| 3-07 | 삭제 흐름 구현 (휴지통 클릭 → 확인 다이얼로그 → `DELETE /api/tasks/{id}`) | 확인 후 카드 제거, 취소 시 유지 확인 | ✅ |
| 3-08 | 성공 기준 5항목 최종 점검 후 git commit & push | 체크리스트 참고 (`docs/01-product.md` 성공 기준 항목 전부 통과) | ✅ |

---

## 성공 기준 최종 체크 (Phase 3 완료 조건)

> `docs/01-product.md` 에 정의된 기준을 그대로 사용한다.

| 항목 | 기준 | 확인 |
|------|------|------|
| 데이터 유지 | 새로고침 후 태스크 목록 유지 | ✅ |
| 반응형 | 360px 뷰포트에서 레이아웃 깨짐 없음 | ✅ |
| API 응답 | 모든 CRUD 엔드포인트 200ms 이하 | ✅ 4ms |
| CRUD 동작 | 추가·목록·수정·삭제 4종 화면에서 오류 없이 동작 | ✅ |
| 테마 토글 | 라이트 ↔ 다크 전환 및 새로고침 후 상태 유지 | ✅ |
