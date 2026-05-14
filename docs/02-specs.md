# 02 — Specs

## 데이터 모델

### Task

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | INTEGER | PK, AUTO INCREMENT | 고유 식별자 |
| `title` | VARCHAR(200) | NOT NULL | 태스크 제목 |
| `description` | TEXT | NULL 허용 | 상세 설명 |
| `status` | ENUM | NOT NULL, 기본값 `todo` | `todo` / `in_progress` / `done` |
| `due_at` | DATETIME | NULL 허용, UTC 저장 | 마감 시각 |
| `created_at` | DATETIME | NOT NULL, 자동 생성 | 생성 시각 (UTC) |
| `updated_at` | DATETIME | NOT NULL, 자동 갱신 | 최종 수정 시각 (UTC) |

> `*` 표시 필드는 필수값

---

## 유효성 검증

| 조건 | HTTP 상태 | 설명 |
|------|-----------|------|
| `title` 누락 또는 빈 문자열 | 400 | 필수 필드 |
| `title` 200자 초과 | 400 | 최대 길이 초과 |
| `status` 허용값 외 문자열 | 400 | `todo` / `in_progress` / `done` 중 하나여야 함 |
| `due_at` ISO 8601 형식 위반 | 400 | 예: `2026-05-12T18:00:00Z` 또는 `2026-05-12T18:00:00+09:00` |
| 존재하지 않는 `id` 조회/수정/삭제 | 404 | 리소스 없음 |

---

## REST API

### 엔드포인트 목록

| 메서드 | 경로 | 상태 코드 | 설명 |
|--------|------|-----------|------|
| `POST` | `/api/tasks` | 201 | 태스크 생성 |
| `GET` | `/api/tasks` | 200 | 태스크 목록 조회 |
| `GET` | `/api/tasks/:id` | 200 | 태스크 단건 조회 |
| `PUT` | `/api/tasks/:id` | 200 | 태스크 수정 (부분 수정 허용) |
| `DELETE` | `/api/tasks/:id` | 204 | 태스크 삭제 |

---

### POST `/api/tasks` — 태스크 생성

**Request Body**
```json
{
  "title": "기획서 초안 작성",
  "description": "1차 초안, 팀장 검토 전",
  "status": "todo",
  "due_at": "2026-05-20T18:00:00Z"
}
```

**Response 201**
```json
{
  "id": 1,
  "title": "기획서 초안 작성",
  "description": "1차 초안, 팀장 검토 전",
  "status": "todo",
  "due_at": "2026-05-20T18:00:00Z",
  "created_at": "2026-05-14T09:00:00Z",
  "updated_at": "2026-05-14T09:00:00Z"
}
```

---

### GET `/api/tasks` — 목록 조회

> `description` 필드 **제외** (목록 렌더링 성능 최적화)

**Response 200**
```json
[
  {
    "id": 1,
    "title": "기획서 초안 작성",
    "status": "todo",
    "due_at": "2026-05-20T18:00:00Z",
    "created_at": "2026-05-14T09:00:00Z",
    "updated_at": "2026-05-14T09:00:00Z"
  }
]
```

---

### GET `/api/tasks/:id` — 단건 조회

> `description` 필드 **포함**

**Response 200**
```json
{
  "id": 1,
  "title": "기획서 초안 작성",
  "description": "1차 초안, 팀장 검토 전",
  "status": "todo",
  "due_at": "2026-05-20T18:00:00Z",
  "created_at": "2026-05-14T09:00:00Z",
  "updated_at": "2026-05-14T09:00:00Z"
}
```

---

### PUT `/api/tasks/:id` — 태스크 수정

> 전송한 필드만 업데이트 (부분 수정). 미전송 필드는 기존값 유지.

**Request Body** (변경할 필드만 전송)
```json
{
  "status": "in_progress",
  "due_at": "2026-05-21T12:00:00Z"
}
```

**Response 200** — 수정된 전체 태스크 반환 (`description` 포함)
```json
{
  "id": 1,
  "title": "기획서 초안 작성",
  "description": "1차 초안, 팀장 검토 전",
  "status": "in_progress",
  "due_at": "2026-05-21T12:00:00Z",
  "created_at": "2026-05-14T09:00:00Z",
  "updated_at": "2026-05-14T10:30:00Z"
}
```

---

### DELETE `/api/tasks/:id` — 태스크 삭제

**Response 204** — 본문 없음

---

## 화면 명세

### 1. 태스크 추가 — 폼

| 필드 | UI 요소 | 비고 |
|------|---------|------|
| `title` | text input | 필수, placeholder: "태스크 제목을 입력하세요" |
| `due_at` | datetime-local input | 선택, 로컬 타임존 입력 → UTC 변환 후 전송 |
| `status` | select | `todo` / `in_progress` / `done`, 기본값 `todo` |

- 제출 버튼 클릭 → `POST /api/tasks` → 성공 시 목록 갱신
- `title` 미입력 상태에서 제출 → 인라인 에러 메시지 표시

---

### 2. 태스크 목록 — 카드

각 태스크를 카드 형태로 렌더링:

```
┌─────────────────────────────────────┐
│  [todo]  기획서 초안 작성           🗑 │
│          D-6  18:00                  │
└─────────────────────────────────────┘
```

| 요소 | 표시 방식 |
|------|----------|
| 상태 배지 | `todo` → 회색 / `in_progress` → 파랑 / `done` → 초록 |
| 마감 시각 | `D-N HH:MM` 형식 (당일: `D-0 HH:MM`, 초과: `D+N HH:MM` 빨강) |
| 삭제 버튼 | 카드 우측 휴지통 아이콘 🗑 |

---

### 3. 태스크 수정 — 모달

- 카드 클릭(삭제 버튼 제외) → 수정 모달 오픈
- 모달 내 필드: `title` / `description` / `status` / `due_at`
- 저장 버튼 → `PUT /api/tasks/:id` → 성공 시 모달 닫힘 + 카드 갱신
- 취소 또는 모달 외부 클릭 → 변경 사항 버림

---

### 4. 태스크 삭제 — 확인 흐름

```
휴지통 클릭 → 확인 다이얼로그("정말 삭제하시겠습니까?")
              ├─ 확인 → DELETE /api/tasks/:id → 카드 제거
              └─ 취소 → 다이얼로그 닫힘
```
