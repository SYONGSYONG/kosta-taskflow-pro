# 05 — Conventions

## 명명 규칙

| 범위 | 스타일 | 예시 |
|------|--------|------|
| 백엔드 변수·함수·파일명 | `snake_case` | `task_id`, `get_task_list`, `crud.py` |
| 프론트 변수·함수 | `camelCase` | `taskId`, `getTaskList`, `renderCard` |
| 프론트 컴포넌트 함수 | `PascalCase` | `TaskCard`, `ModalDialog`, `StatusBadge` |
| CSS 클래스 | Tailwind 유틸리티 그대로 사용 | `rounded-xl`, `dark:bg-gray-900` |
| 환경 변수 | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `SECRET_KEY` |

> **식별자는 모두 영어**로 작성한다. 주석과 커밋 메시지 본문만 한국어를 허용한다.

---

## 금지 목록

| 금지 | 이유 | 대안 |
|------|------|------|
| `print()` 디버깅 | 운영 환경에서 노이즈 발생, 민감 정보 노출 위험 | `logging` 모듈 (`logger.debug`, `logger.info`) |
| `bare except` (`except:`) | 모든 예외를 삼켜 디버깅 불가, 종료 신호도 차단 | `except SpecificError as e:` 로 명시적 처리 |
| 비밀번호·토큰 하드코딩 | 소스 코드 노출 시 즉시 보안 사고 | `.env` 파일 + `os.getenv('KEY')` |
| TypeScript `any` 타입 | 타입 안전성 의미 상실, IDE 자동완성 무력화 | 명시적 타입 또는 `unknown` 후 타입 가드 |
| CSS `!important` | 우선순위 연쇄 꼬임, 디버깅 비용 급증 | 셀렉터 구체성 높이거나 Tailwind 유틸리티 순서 조정 |

---

## 테스트 규칙

- **도구**: `pytest` (백엔드), 브라우저 수동 확인 (프론트 MVP)
- **위치**: `backend/tests/test_*.py`
- **커버리지 최소 기준**: 각 엔드포인트마다 아래 3개 케이스 필수

| 케이스 | 설명 |
|--------|------|
| 정상 (Happy path) | 올바른 입력 → 기대 상태 코드·응답 확인 |
| 404 | 존재하지 않는 `id` 요청 → 404 반환 확인 |
| 400 | 필수 필드 누락 또는 형식 위반 → 400 반환 확인 |

```python
# 예시
def test_create_task_success(client):
    res = client.post("/api/tasks", json={"title": "테스트"})
    assert res.status_code == 201

def test_get_task_not_found(client):
    res = client.get("/api/tasks/9999")
    assert res.status_code == 404

def test_create_task_missing_title(client):
    res = client.post("/api/tasks", json={})
    assert res.status_code == 400
```

---

## Git 커밋 규칙

### 커밋 메시지 형식

```
<type>: <한국어 요약>
```

### 타입 목록

| 타입 | 사용 시점 | 예시 |
|------|----------|------|
| `feat` | 새 기능 추가 | `feat: 태스크 삭제 API 구현` |
| `fix` | 버그 수정 | `fix: due_at 시간대 변환 오류 수정` |
| `docs` | 문서 작성·수정 | `docs: 02-specs.md API 명세 업데이트` |
| `refactor` | 동작 변화 없는 코드 개선 | `refactor: crud.py 중복 쿼리 제거` |
| `test` | 테스트 추가·수정 | `test: 태스크 생성 400 케이스 추가` |
| `chore` | 빌드·설정·의존성 | `chore: requirements.txt SQLAlchemy 추가` |

### 브랜치 전략

```
main          — 항상 동작하는 상태 유지
└─ feat/...   — 기능 단위 브랜치 (예: feat/task-crud-api)
└─ fix/...    — 버그 수정 브랜치
```

- `main`에 직접 push는 Phase 1(설계) 단계만 허용
- Phase 2·3부터는 브랜치 생성 → PR → merge 흐름 준수
- PR 제목은 커밋 타입 규칙과 동일 형식 사용
