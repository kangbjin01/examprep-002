# English Exam Solver - Product Plan

## Overview

SSAT/ACT 영어 시험 대비 SaaS 플랫폼.
Bluebook 앱의 시험 응시 UX를 차용하되, Threads 스타일의 모노크롬 디자인으로 구현한다.
**학생**은 문제 풀이, 성적 분석, 학습 관리를,
**교사**는 클래스 관리, 학생 모니터링, 과제 출제를 하나의 플랫폼에서 수행한다.

---

## 1. Target Exams

### SSAT (Secondary School Admission Test)
| Section | Content | Question Type |
|---------|---------|---------------|
| Verbal - Synonyms | 어휘력 측정 | 단어의 동의어 선택 |
| Verbal - Analogies | 단어 관계 파악 | A:B = C:? 형태 |
| Reading Comprehension | 지문 독해 | 지문 읽고 질문 응답 |

### ACT (American College Testing)
| Section | Content | Question Type |
|---------|---------|---------------|
| English | 문법, 구두점, 문장 구조, 수사법 | 지문 속 밑줄 부분 교정 |
| Reading | 산문, 사회과학, 인문, 자연과학 | 지문 읽고 질문 응답 |

---

## 2. Core Features

### 2.1 Practice Mode (연습 모드)
- 섹션별/유형별 문제 풀기
- 난이도 필터 (Easy / Medium / Hard)
- 즉시 정답 확인 + 해설 제공
- 북마크 (틀린 문제, 다시 풀고 싶은 문제)

### 2.2 Mock Exam (모의시험)
- 실제 시험과 동일한 시간 제한
- 섹션별 타이머 (숨김 가능, 5분 전 자동 알림)
- 시험 종료 후 자동 채점
- 성적표 (점수, 백분위, 섹션별 분석)

### 2.3 Review & Analytics (분석 대시보드)
- 전체 정답률 추이 그래프
- 섹션별 / 유형별 강점-약점 분석
- 오답 패턴 분석 (자주 틀리는 유형)
- 최근 활동 타임라인

### 2.4 Question Bank (문제 은행)
- 북마크한 문제 모아보기
- 오답 노트 자동 생성
- 태그 기반 필터링
- 문제별 난이도 + 정답률 표시

### 2.5 Study Plan (학습 플랜) - v2
- 시험 날짜 기반 학습 스케줄 생성
- 약점 영역 집중 추천
- 일일 학습 목표

### 2.6 Teacher Dashboard (교사 관리)

#### 2.6.1 User Roles
| Role | Description | 가입 방식 |
|------|-------------|----------|
| **Student** | 문제 풀이, 개인 분석 | 일반 가입 or 교사 초대 |
| **Teacher** | 클래스 관리, 학생 모니터링, 과제 출제 | 교사 가입 (코드/승인) |

#### 2.6.2 Class Management (클래스 관리)
- 클래스 생성 (이름, 시험 유형, 설명)
- **초대 코드** 생성 → 학생이 코드 입력하여 클래스 참여
- 학생 목록 조회 (이름, 가입일, 최근 활동)
- 학생 제거
- 교사 1인이 여러 클래스 운영 가능

#### 2.6.3 Assignment (과제 출제)
- 교사가 섹션/난이도/문제 수를 선택하여 과제 생성
- 마감일 설정
- 과제 상태: `assigned` → `in_progress` → `completed` → `overdue`
- 학생별 과제 완료 여부 + 점수 확인
- 과제 목록 (진행 중 / 완료 / 기한 초과)

#### 2.6.4 Student Monitoring (학생 모니터링)

**클래스 전체 뷰:**
- 클래스 평균 정답률
- 섹션별 평균 성적 비교 차트
- 가장 많이 틀리는 문제 유형 Top 5
- 최근 활동 피드 (누가 언제 무엇을 풀었는지)
- 학생별 진행률 순위표

**개별 학생 뷰:**
- 학생의 전체 Analytics와 동일한 데이터 (정답률, 섹션별 분석, 난이도별)
- 풀이 이력 타임라인
- 과제 완료 이력
- 약점 영역 요약
- 최근 활동 일자

#### 2.6.5 Teacher User Flow

```
교사 가입 / 로그인
  └─> Teacher Dashboard (홈)
        ├─> My Classes
        │     ├─> 클래스 생성
        │     ├─> 클래스 목록
        │     └─> 클래스 상세
        │           ├─> 학생 목록 (초대 코드 공유)
        │           ├─> 클래스 Analytics (전체 현황)
        │           ├─> 과제 관리
        │           │     ├─> 과제 생성 (섹션/난이도/문제 수/마감일)
        │           │     ├─> 과제 목록
        │           │     └─> 과제 상세 (학생별 완료 현황)
        │           └─> 개별 학생 상세
        │                 ├─> 성적 분석
        │                 ├─> 풀이 이력
        │                 └─> 약점 요약
        └─> Settings
              └─> 프로필, 비밀번호 변경
```

---

## 3. Test-Taking UI (Bluebook 참고)

### 3.1 화면 3단 구조

```
┌─────────────────────────────────────────────────────────┐
│ [Top Bar]                                               │
│  좌: Directions 버튼                                     │
│  중: 섹션명 + 타이머 (숨김/표시 토글)                        │
│  우: 도구 모음 (Highlight, Annotate, Line Reader 등)       │
├───────────────────────┬─────────────────────────────────┤
│ [Left Pane]           │ [Right Pane]                    │
│                       │                                 │
│  지문 (Passage)        │  문제 (Question)                 │
│  - 스크롤 독립         │  - 문제 텍스트                    │
│  - 하이라이트 가능      │  - 선택지 A/B/C/D (세로 카드)      │
│  - 메모 추가 가능       │  - Option Eliminator 지원        │
│                       │  - Mark for Review 아이콘         │
│                       │                                 │
│   ◄── 드래그 리사이저 ──►                                  │
├─────────────────────────────────────────────────────────┤
│ [Bottom Bar]                                            │
│  좌: ← Back                                             │
│  중: [Question Navigator] (현재 번호 표시, 클릭시 그리드)    │
│  우: Next →                                             │
└─────────────────────────────────────────────────────────┘
```

**지문 없는 문제 (Verbal Synonyms/Analogies):**
- Split pane 없이 단일 컬럼으로 문제 + 선택지 표시

### 3.2 시험 도구 (Toolbar)

| Tool | Description | 위치 |
|------|-------------|------|
| **Timer** | 모듈별 카운트다운, 숨김 가능, 5분 전 자동 팝업 | Top Bar 중앙 |
| **Question Navigator** | 번호 그리드 오버레이 (답변/미답변/플래그 상태 표시) | Bottom Bar 중앙 |
| **Mark for Review** | 문제별 북마크 아이콘, Navigator에서 플래그 표시 | 문제 옆 |
| **Highlight** | 지문 텍스트 드래그 → 3가지 색상 하이라이트 | 텍스트 선택 시 팝업 |
| **Annotate** | 하이라이트 위에 메모 추가 | 하이라이트 팝업 |
| **Option Eliminator** | 선택지별 취소선 토글 (숨기지 않고 줄 긋기) | 선택지 옆 |
| **Line Reader** | 읽기 집중 오버레이 바 (위아래 마스킹) | Top Bar 도구 |
| **Zoom** | Ctrl/Cmd +/- 키보드 단축키 | 네이티브 |

### 3.3 Question Navigator 그리드

```
┌─────────────────────────────┐
│  Question Navigator          │
│                              │
│  [1●] [2●] [3○] [4○] [5🔖]  │
│  [6●] [7○] [8○] [9●] [10○] │
│  ...                         │
│                              │
│  ● 답변 완료 (filled)         │
│  ○ 미답변 (empty)             │
│  🔖 검토 표시 (flagged)       │
└─────────────────────────────┘
```

- 번호 클릭 시 해당 문제로 즉시 이동
- 모의시험 제출 전 Review Screen으로도 사용

### 3.4 시험 플로우

```
섹션 선택
  └─> Directions 화면 (섹션 안내)
        └─> 문제 풀이 시작 (타이머 시작)
              ├─> Back / Next로 순차 이동
              ├─> Navigator로 자유 이동
              ├─> Mark for Review로 플래그
              └─> 마지막 문제 Next 클릭
                    └─> Review Screen (전체 문제 상태 요약)
                          ├─> 미답변/플래그 문제 클릭 → 돌아가서 수정
                          └─> Submit 확인
                                └─> 결과 화면 (채점 + 해설)
```

### 3.5 Practice vs Mock Exam 차이

| Feature | Practice Mode | Mock Exam |
|---------|--------------|-----------|
| 타이머 | 없음 (무제한) | 있음 (실제 시험 시간) |
| 정답 확인 | 문제마다 즉시 확인 가능 | 전체 제출 후 일괄 확인 |
| 해설 | 즉시 표시 | 제출 후 표시 |
| 하이라이트/메모 | 사용 가능 | 사용 가능 |
| Option Eliminator | 사용 가능 | 사용 가능 |
| Mark for Review | 사용 가능 | 사용 가능 |
| Question Navigator | 사용 가능 | 사용 가능 |
| 결과 | 문제별 즉시 피드백 | 성적표 (점수, 분석) |

---

## 4. User Flow

### 4.1 Student Flow
```
Landing Page
  └─> Sign Up / Login (Student)
        └─> Student Dashboard (홈)
              ├─> Practice Mode
              │     ├─> Exam 선택 (SSAT / ACT)
              │     ├─> Section 선택 + 난이도/개수 설정
              │     ├─> Directions
              │     ├─> 문제 풀이 (Bluebook UI)
              │     ├─> 문제별 즉시 정답 + 해설
              │     └─> 세션 요약
              ├─> Mock Exam
              │     ├─> Exam 선택
              │     ├─> Directions
              │     ├─> 시험 진행 (타이머 + Bluebook UI)
              │     ├─> Review Screen
              │     ├─> Submit
              │     └─> 성적표
              ├─> Assignments (교사 과제)
              │     ├─> 과제 목록 (진행 중 / 완료)
              │     └─> 과제 풀이 → Bluebook UI
              ├─> Analytics
              │     ├─> 성적 추이
              │     └─> 약점 분석
              └─> Question Bank
                    ├─> 북마크 문제
                    └─> 오답 노트
```

### 4.2 Teacher Flow
```
Landing Page
  └─> Sign Up / Login (Teacher)
        └─> Teacher Dashboard (홈)
              ├─> My Classes
              │     ├─> 클래스 생성 (이름, 시험 유형)
              │     └─> 클래스 상세
              │           ├─> 학생 목록 + 초대 코드
              │           ├─> 클래스 Analytics
              │           ├─> Assignments
              │           │     ├─> 과제 생성
              │           │     └─> 과제 상세 (학생별 현황)
              │           └─> 개별 학생 상세
              │                 ├─> 성적 분석
              │                 └─> 풀이 이력
              └─> Settings
```

---

## 5. Page Structure

### 5.1 공통 + Student 페이지
```
/                       → Landing page
/login                  → 로그인
/signup                 → 회원가입 (role 선택: student / teacher)
/join                   → 클래스 참여 (초대 코드 입력)
/dashboard              → 메인 대시보드 (role에 따라 분기)
/practice               → 연습 모드 홈
/practice/[exam]        → 섹션 선택 (ssat / act)
/practice/[exam]/[section]/solve  → 문제 풀이 (Bluebook UI)
/practice/[exam]/[section]/result → 세션 결과 요약
/mock-exam              → 모의시험 목록
/mock-exam/[id]         → 모의시험 진행 (Bluebook UI)
/mock-exam/[id]/review  → 제출 전 Review Screen
/mock-exam/[id]/result  → 성적표
/assignments            → 내 과제 목록 (학생용)
/assignments/[id]/solve → 과제 풀이
/analytics              → 분석 대시보드
/question-bank          → 문제 은행 (북마크 + 오답)
/settings               → 설정 (프로필, 구독)
```

### 5.2 Teacher 페이지
```
/t/dashboard            → 교사 대시보드 (클래스 요약)
/t/classes              → 클래스 목록
/t/classes/new          → 클래스 생성
/t/classes/[id]         → 클래스 상세 (학생 목록 + 초대 코드)
/t/classes/[id]/analytics → 클래스 전체 분석
/t/classes/[id]/assignments          → 과제 목록
/t/classes/[id]/assignments/new      → 과제 생성
/t/classes/[id]/assignments/[aId]    → 과제 상세 (학생별 현황)
/t/classes/[id]/students/[sId]       → 개별 학생 상세 (성적 + 이력)
/t/settings             → 교사 설정
```

---

## 6. Design System

### Theme: "Threads-inspired Monochrome"

**Color Palette:**
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `background` | `#FFFFFF` | `#101010` | 배경 |
| `foreground` | `#000000` | `#F5F5F5` | 텍스트 |
| `muted` | `#F5F5F5` | `#1A1A1A` | 카드, 서브 배경 |
| `muted-foreground` | `#737373` | `#A3A3A3` | 보조 텍스트 |
| `border` | `#E5E5E5` | `#262626` | 구분선, 테두리 |
| `accent` | `#000000` | `#FFFFFF` | 버튼, 강조 |
| `correct` | `#22C55E` | `#22C55E` | 정답 |
| `incorrect` | `#EF4444` | `#EF4444` | 오답 |
| `highlight-1` | `#FEF08A` | `#854D0E` | 하이라이트 노랑 |
| `highlight-2` | `#BBF7D0` | `#166534` | 하이라이트 초록 |
| `highlight-3` | `#BFDBFE` | `#1E40AF` | 하이라이트 파랑 |
| `flagged` | `#F97316` | `#F97316` | Mark for Review |

**Typography:**
- Font: `Inter` (본문) + `JetBrains Mono` (숫자, 타이머)
- 큰 제목은 bold, 본문은 regular
- 여백 넉넉하게, 밀도 낮게

**Components Style:**
- 카드: `border` + `rounded-xl` + `shadow-none` (플랫)
- 버튼: 흑/백 solid, ghost variant
- 선택지: 라디오 카드 형태, 선택 시 border 강조, 취소선 토글 지원
- 프로그레스: 미니멀 bar
- Navigator 그리드: 원형 번호 + 상태 아이콘
- 전반적으로 그림자 없이, 선과 여백으로 구분

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS 4 |
| Backend/DB/Auth | PocketBase (SQLite 기반, Docker) |
| State | Zustand |
| Charts | Recharts |
| Container | Docker Compose (Next.js + PocketBase) |
| Deployment | Docker 기반 (VPS / Fly.io 등) |

### Why PocketBase?
- **올인원**: DB + Auth + REST API + Realtime + Admin UI 내장
- **Docker 친화적**: 단일 바이너리, `docker-compose`로 Next.js와 묶어서 실행
- **ORM 불필요**: REST API / JS SDK로 직접 CRUD
- **Auth 내장**: Email/Password, OAuth (Google 등) 기본 제공
- **Admin Dashboard**: `//_/` 경로에서 DB 관리 UI 바로 사용

---

## 8. Data Model (PocketBase Collections)

### 8.1 기존 컬렉션

```
users (Auth collection - PocketBase 내장)
  ├─ id, email, name, avatar
  ├─ role (student / teacher)
  └─ subscription (free / pro)

questions
  ├─ id, exam (SSAT/ACT), section, type
  ├─ difficulty (easy/medium/hard)
  ├─ passage (지문, nullable)
  ├─ question (문제 텍스트)
  ├─ choices (JSON: ["A", "B", "C", "D"])
  ├─ answer (정답 인덱스)
  ├─ explanation (해설)
  └─ tags (JSON: ["grammar", "vocabulary", ...])

attempts (문제 풀이 기록)
  ├─ id, user (relation → users)
  ├─ question (relation → questions)
  ├─ assignment (relation → assignments, nullable)
  ├─ selectedAnswer, isCorrect
  ├─ timeSpent (seconds)
  └─ created (자동)

mock_exams
  ├─ id, user (relation → users)
  ├─ exam (SSAT/ACT)
  ├─ status (in_progress / completed)
  ├─ score, startedAt, completedAt
  └─ attempts (relation → attempts, 다대다)

bookmarks
  ├─ id, user (relation → users)
  ├─ question (relation → questions)
  └─ note (메모)

highlights (지문 하이라이트 - Practice/Mock 공용)
  ├─ id, user (relation → users)
  ├─ question (relation → questions)
  ├─ color (1/2/3)
  ├─ startOffset, endOffset (텍스트 범위)
  └─ note (메모, nullable)
```

### 8.2 교사 관련 컬렉션

```
classes (클래스)
  ├─ id
  ├─ teacher (relation → users, role=teacher)
  ├─ name (클래스명, 예: "SAT Prep - Spring 2026")
  ├─ exam (SSAT / ACT / both)
  ├─ description
  ├─ inviteCode (유니크 6자리, 자동 생성)
  ├─ isActive (boolean)
  └─ created (자동)

class_members (클래스 멤버 = 학생)
  ├─ id
  ├─ class (relation → classes)
  ├─ student (relation → users, role=student)
  ├─ joinedAt
  └─ status (active / removed)

assignments (과제)
  ├─ id
  ├─ class (relation → classes)
  ├─ teacher (relation → users)
  ├─ title (과제명)
  ├─ exam (SSAT / ACT)
  ├─ section (verbal-synonyms / english / reading 등)
  ├─ difficulty (easy / medium / hard / mixed)
  ├─ questionCount (문제 수)
  ├─ questions (relation → questions, 다대다, 선택된 문제들)
  ├─ dueDate (마감일)
  ├─ status (draft / assigned / closed)
  └─ created (자동)

assignment_submissions (학생 과제 제출)
  ├─ id
  ├─ assignment (relation → assignments)
  ├─ student (relation → users)
  ├─ status (not_started / in_progress / completed)
  ├─ score (정답률 %)
  ├─ correctCount
  ├─ totalCount
  ├─ startedAt
  ├─ completedAt
  └─ attempts (relation → attempts, 다대다)
```

### 8.3 관계도

```
Teacher ──┬── classes ──┬── class_members ── Student
          │             │
          │             └── assignments ── assignment_submissions ── Student
          │                      │
          │                      └── questions (다대다)
          │
          └── attempts (학생 풀이 기록 조회)
```

---

## 9. MVP Scope (Phase 1)

**포함:**
- [x] Landing page
- [x] Auth (PocketBase - Email/Google)
- [x] Dashboard
- [x] Practice mode (SSAT Verbal, ACT English)
- [x] Bluebook 스타일 문제 풀이 UI
  - [x] Split pane (지문 | 문제) + 드래그 리사이저
  - [x] 선택지 라디오 카드 + Option Eliminator
  - [x] Question Navigator 그리드
  - [x] Back / Next 네비게이션
  - [x] Mark for Review
- [x] 문제별 즉시 정답 확인 + 해설 (Practice)
- [x] 기본 Analytics (정답률, 최근 활동)
- [x] 북마크
- [x] Dark/Light mode

**제외 (Phase 2 - 학생 고급 기능):**
- [ ] Mock Exam (타이머 + Review Screen + 성적표)
- [ ] Highlight & Annotate (지문 하이라이트 + 메모)
- [ ] Line Reader
- [ ] 오답 패턴 AI 분석
- [ ] Study Plan 자동 생성

**제외 (Phase 3 - 교사 대시보드):**
- [ ] 교사/학생 Role 분기 (가입 시 선택)
- [ ] 클래스 생성 + 초대 코드
- [ ] 학생 클래스 참여 (/join)
- [ ] 클래스 학생 목록
- [ ] 과제 생성 (섹션/난이도/문제 수/마감일)
- [ ] 학생 과제 풀이 + 제출
- [ ] 과제 현황 (학생별 완료/점수)
- [ ] 클래스 전체 Analytics (평균 정답률, 약점 유형)
- [ ] 개별 학생 상세 (교사가 학생 성적 조회)
- [ ] 학생 활동 피드

**제외 (Phase 4 - 비즈니스):**
- [ ] 결제 / 구독
- [ ] 모바일 앱

---

## 10. Implementation Order

### Phase 1 - Student MVP ✅

| Step | Task | Status |
|------|------|--------|
| 1 | Next.js + shadcn 프로젝트 초기화, 테마 설정 | ✅ |
| 2 | Docker Compose 세팅 (Next.js + PocketBase) | ✅ |
| 3 | PocketBase 컬렉션 스키마 + seed data | ✅ |
| 4 | Landing page | ✅ |
| 5 | Auth (PocketBase Email/Google) | ✅ |
| 6 | Dashboard 레이아웃 | ✅ |
| 7 | Practice - 섹션 선택 화면 | ✅ |
| 8 | Practice - Bluebook 문제 풀이 UI | ✅ |
| 9 | Practice - 선택지 UI + Option Eliminator | ✅ |
| 10 | Practice - Mark for Review + Navigator | ✅ |
| 11 | Practice - 즉시 정답 확인 + 해설 | ✅ |
| 12 | Analytics 대시보드 | ✅ |
| 13 | Question Bank (북마크) | ✅ |
| 14 | Dark mode + 마무리 | ✅ |

### Phase 2 - 학생 고급 기능

| Step | Task |
|------|------|
| 15 | Mock Exam - 타이머 + 시간 제한 |
| 16 | Mock Exam - Review Screen + 제출 |
| 17 | Mock Exam - 성적표 |
| 18 | Highlight & Annotate (지문 하이라이트 3색 + 메모) |
| 19 | Line Reader (읽기 집중 오버레이) |

### Phase 3 - 교사 대시보드

| Step | Task |
|------|------|
| 20 | users에 role 필드 추가 + 가입 시 역할 선택 UI |
| 21 | 교사/학생 Role 기반 라우팅 분기 |
| 22 | PocketBase 컬렉션 추가 (classes, class_members, assignments, assignment_submissions) |
| 23 | 교사 대시보드 레이아웃 (/t/dashboard) |
| 24 | 클래스 생성 + 초대 코드 자동 생성 |
| 25 | 학생 클래스 참여 (/join - 초대 코드 입력) |
| 26 | 클래스 상세 - 학생 목록 + 초대 코드 공유 |
| 27 | 과제 생성 (섹션/난이도/문제 수/마감일 선택) |
| 28 | 학생 과제 목록 + 과제 풀이 (Bluebook UI 재활용) |
| 29 | 과제 현황 - 학생별 완료/점수 테이블 |
| 30 | 클래스 Analytics (평균 정답률, 약점 유형, 활동 피드) |
| 31 | 개별 학생 상세 (교사가 학생 성적/이력 조회) |

### Phase 4 - 비즈니스

| Step | Task |
|------|------|
| 32 | 결제 / 구독 (Free → Pro) |
| 33 | 모바일 앱 |
