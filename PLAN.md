# English Exam Solver - Product Plan

## Overview

SSAT/ACT 영어 시험 대비 SaaS 플랫폼.
문제 풀이, 성적 분석, 학습 관리를 하나의 플랫폼에서 제공한다.

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
- 섹션별 타이머
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

---

## 3. User Flow

```
Landing Page
  └─> Sign Up / Login
        └─> Dashboard (홈)
              ├─> Practice Mode
              │     ├─> Exam 선택 (SSAT / ACT)
              │     ├─> Section 선택
              │     ├─> 문제 풀이 화면
              │     └─> 결과 + 해설
              ├─> Mock Exam
              │     ├─> Exam 선택
              │     ├─> 시험 시작 (타이머)
              │     └─> 성적표
              ├─> Analytics
              │     ├─> 성적 추이
              │     └─> 약점 분석
              └─> Question Bank
                    ├─> 북마크 문제
                    └─> 오답 노트
```

---

## 4. Page Structure

```
/                       → Landing page
/login                  → 로그인
/signup                 → 회원가입
/dashboard              → 메인 대시보드
/practice               → 연습 모드 홈
/practice/[exam]        → 섹션 선택 (ssat / act)
/practice/[exam]/[section]/solve  → 문제 풀이
/practice/[exam]/[section]/result → 결과 + 해설
/mock-exam              → 모의시험 목록
/mock-exam/[id]         → 모의시험 진행
/mock-exam/[id]/result  → 성적표
/analytics              → 분석 대시보드
/question-bank          → 문제 은행 (북마크 + 오답)
/settings               → 설정 (프로필, 구독)
```

---

## 5. Design System

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

**Typography:**
- Font: `Inter` (본문) + `JetBrains Mono` (숫자, 코드)
- 큰 제목은 bold, 본문은 regular
- 여백 넉넉하게, 밀도 낮게

**Components Style:**
- 카드: `border` + `rounded-xl` + `shadow-none` (플랫)
- 버튼: 흑/백 solid, ghost variant
- 선택지: 라디오 카드 형태, 선택 시 border 강조
- 프로그레스: 미니멀 bar
- 전반적으로 그림자 없이, 선과 여백으로 구분

---

## 6. Tech Stack

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

## 7. Data Model (PocketBase Collections)

```
users (Auth collection - PocketBase 내장)
  ├─ id, email, name, avatar
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
```

---

## 8. MVP Scope (Phase 1)

**포함:**
- [x] Landing page
- [x] Auth (PocketBase - Email/Google)
- [x] Dashboard
- [x] Practice mode (SSAT Verbal, ACT English)
- [x] 문제 풀이 UI (선택지 클릭 → 정답 확인 → 해설)
- [x] 기본 Analytics (정답률, 최근 활동)
- [x] 북마크
- [x] Dark/Light mode

**제외 (Phase 2):**
- [ ] Mock Exam (타이머 포함 전체 모의시험)
- [ ] 오답 패턴 AI 분석
- [ ] Study Plan 자동 생성
- [ ] 결제 / 구독
- [ ] 모바일 앱

---

## 9. Implementation Order

| Step | Task | Est. |
|------|------|------|
| 1 | Next.js + shadcn 프로젝트 초기화, 테마 설정 | - |
| 2 | Docker Compose 세팅 (Next.js + PocketBase) | - |
| 3 | PocketBase 컬렉션 스키마 + seed data | - |
| 4 | Landing page | - |
| 5 | Auth (PocketBase Email/Google) | - |
| 6 | Dashboard 레이아웃 | - |
| 7 | Practice mode - 섹션 선택 화면 | - |
| 8 | Practice mode - 문제 풀이 UI | - |
| 9 | Practice mode - 결과 + 해설 | - |
| 10 | Analytics 대시보드 | - |
| 11 | Question Bank (북마크) | - |
| 12 | Dark mode + 마무리 | - |
