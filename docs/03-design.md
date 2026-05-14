# 03 — Design Decisions

## 의존성 추가 정책

> **이 문서에 사유가 기록되지 않은 패키지는 도입 불가.**
> 새 의존성이 필요하면 이 표에 항목을 추가하고 사용자 승인을 받은 뒤 `package.json` / `requirements.txt`를 수정한다.

---

## 기술 결정 8선

### 1. 백엔드 프레임워크

| 항목 | 내용 |
|------|------|
| **선택** | FastAPI |
| **대안** | Django, Express (Node.js) |
| **근거** | 타입 힌트 기반 자동 문서화(OpenAPI), 비동기 지원, 학습 곡선이 낮음. Django는 ORM·Admin 등 불필요한 기능이 과다하고, Express는 프론트와 동일 언어지만 타입 안전성이 낮음 |
| **트레이드오프** | Django의 Admin·Auth 내장 기능 없음 → JWT 인증은 확장 단계에서 직접 구현 필요 |

---

### 2. 프론트엔드

| 항목 | 내용 |
|------|------|
| **선택** | Vanilla JS + Tailwind CDN |
| **대안** | React, Vue |
| **근거** | MVP 규모(단일 페이지, CRUD)에서 프레임워크 도입은 빌드 파이프라인·번들러·상태 라이브러리 복잡도를 수반함. Tailwind CDN으로 빌드 단계 없이 즉시 스타일 적용 가능 |
| **트레이드오프** | 컴포넌트 재사용·가상 DOM 최적화 없음 → Kanban·팀 기능 확장 시 React 마이그레이션 검토 필요 |

---

### 3. 데이터베이스

| 항목 | 내용 |
|------|------|
| **선택** | SQLite (MVP) → PostgreSQL (확장), ORM: SQLAlchemy |
| **대안** | MySQL, MongoDB |
| **근거** | SQLite는 파일 기반으로 로컬 개발·배포 설정이 없음. SQLAlchemy로 추상화하면 PostgreSQL 전환 시 모델 코드 변경 최소화. MongoDB는 관계형 데이터(태스크-유저-팀)에 부적합 |
| **트레이드오프** | SQLite는 동시 쓰기 성능 한계 → 팀 기능 도입 전 PostgreSQL 마이그레이션 필수 |

---

### 4. CSS 방법론

| 항목 | 내용 |
|------|------|
| **선택** | Tailwind CSS 단독 사용 |
| **대안** | styled-components, CSS Modules, plain CSS |
| **근거** | 유틸리티 클래스로 디자인 토큰을 HTML에서 직접 확인 가능. styled-components는 JS 런타임 의존성과 빌드 도구 필요. plain CSS는 네이밍 충돌 위험 |
| **트레이드오프** | 클래스명이 길어져 HTML 가독성 저하 가능. `styled-components` 등 CSS-in-JS는 **이 프로젝트에서 금지** |

---

### 5. 실시간 동기화

| 항목 | 내용 |
|------|------|
| **선택** | 폴링 3초 간격 (MVP) |
| **대안** | WebSocket, SSE (Server-Sent Events) |
| **근거** | MVP는 단일 사용자 시나리오. 폴링으로 구현 복잡도 없이 "새로고침 후 데이터 유지" 성공 기준 충족. WebSocket은 팀 기능(다중 사용자 동시 편집) 확장 단계에서 도입 |
| **트레이드오프** | 불필요한 네트워크 요청 발생. 팀 규모 확장 시 WebSocket으로 교체 필요 |

---

### 6. 프론트 상태 관리

| 항목 | 내용 |
|------|------|
| **선택** | 모듈 변수 + DOM 직접 갱신 |
| **대안** | Redux, Zustand, MobX |
| **근거** | CRUD 단일 엔티티(Task)에서 상태 라이브러리 도입은 과설계. `tasks` 배열을 모듈 스코프 변수로 관리하고 변경 시 DOM을 직접 렌더링 |
| **트레이드오프** | 엔티티 증가(팀·유저) 시 상태 동기화 복잡도 급증 → 확장 단계에서 React + 상태 라이브러리 전환 검토 |

---

### 7. 디자인 시스템

| 항목 | 내용 |
|------|------|
| **선택** | macOS UI 톤 커스텀 |
| **대안** | Material Design (MUI), Ant Design |
| **근거** | 페르소나(스타트업 팀 리더, 30~40대 Mac 사용자)에게 친숙한 톤. 외부 컴포넌트 라이브러리는 번들 크기·커스터마이징 제한 문제 있음 |
| **트레이드오프** | 컴포넌트를 직접 구현해야 함 → 접근성(ARIA) 처리 수동 필요 |

**디자인 토큰 (Tailwind 클래스 기준)**

| 토큰 | 클래스 | 설명 |
|------|--------|------|
| 모서리 | `rounded-xl` | 둥근 모서리 |
| 그림자 | `shadow-lg` | 부드러운 깊이감 |
| 반투명 | `backdrop-blur-sm bg-white/80` | 유리 느낌 카드 |
| 폰트 | `font-sans` (시스템 폰트 스택) | SF Pro / Segoe UI / system-ui |
| 터치 타깃 | `min-h-[44px] min-w-[44px]` | 모바일 접근성 기준 |

---

### 8. 테마 (라이트 / 다크)

| 항목 | 내용 |
|------|------|
| **선택** | Tailwind `dark:` 변형 + `localStorage('theme')` |
| **대안** | CSS 변수 전환, 별도 CSS 파일 분기 |
| **근거** | Tailwind의 `darkMode: 'class'` 설정으로 `<html class="dark">` 토글만으로 전체 테마 전환. localStorage에 선택값 저장해 새로고침 후 유지 |
| **트레이드오프** | 클래스 기반이므로 서버 사이드 렌더링 없이 초기 로드 시 깜빡임(FOUC) 가능 → `<head>` 인라인 스크립트로 선처리 |

**초기값 결정 로직**

```js
const saved = localStorage.getItem('theme');
const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const theme = saved ?? preferred;
document.documentElement.classList.toggle('dark', theme === 'dark');
```

우선순위: `localStorage` 저장값 → 시스템 `prefers-color-scheme` → 기본값 `light`
