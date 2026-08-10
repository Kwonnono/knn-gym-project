# Bulk & Cut — 프로젝트 컨텍스트

개인 맞춤형 벌크업/커팅 식단·운동 관리 웹앱. 1인 개발 개인 프로젝트(프로토타입 규모).

## 스택

- **Next.js 14 (App Router)** + TypeScript + Tailwind CSS
- **Supabase** — Auth(이메일/비밀번호) + Postgres DB + RLS. 별도 백엔드 서버 없음.
- 배포: 아직 없음. 로컬 `npm run dev`로만 실행 중 (Vercel 등 미배포).
- GitHub: [Kwonnono/knn-gym-project](https://github.com/Kwonnono/knn-gym-project) (private, `master` 브랜치, 지금까지 전부 push 완료)

## 핵심 기능

- 회원가입/로그인/로그아웃 (Supabase Auth)
- 목표 설정(`/profile`): 키/몸무게/나이/성별/활동량/목표(커팅·벌크업·유지·미니컷·미니벌크) 입력 → BMR/TDEE/목표 칼로리·탄단지 자동 계산 (`lib/calc.ts`, Mifflin-St Jeor 공식)
- 홈(`/dashboard`): 목표 요약, 오늘 섭취 진행률, 최근 식단/운동 기록 미리보기 + 메뉴 카드
- 식단 기록(`/diet`): 음식/칼로리/단백질/탄수화물/지방 직접 입력, 표 형식으로 표시
- 운동 기록(`/workout`): 부위별 탭(가슴/등/어깨/팔/하체/코어) + 유산소 탭(별도 필드: 시간/거리). 탭마다 표시되는 폼/표 컬럼이 다름
- 마이페이지(`/mypage`): 계정 요약(이름/이메일/현재 목표)
- 설정(`/settings`): 이름/닉네임 수정
- 다크/라이트 모드 토글 (localStorage, `components/ThemeToggle.tsx`)
- 한국어/영어 다국어 전환 (쿠키 기반, 기본 한국어, `components/LanguageToggle.tsx` + `lib/i18n.ts`)
- 비밀번호 정책: NIST SP 800-63B 기반 (강제 조합 규칙 없음, 8~64자, 흔한 취약 비밀번호 블록) — `lib/passwordPolicy.ts`

## 폐기된 기능

- **AI 식단 자동 계산**: `claude-opus-5` API로 음식/그램 입력 시 영양성분 자동 추정하는 기능을 만들었다가, Anthropic API가 유료(크레딧 필요)라서 **완전히 제거함**. `@anthropic-ai/sdk`, `zod` 의존성도 제거됨. 다시 추가하려면 사용자가 Anthropic 콘솔에서 크레딧을 충전해야 함.

## 브랜딩/디자인

- 이름: **Bulk & Cut**. 로고: 바벨 아이콘(세로로 텍스트 위에 배치) + "BULK & CUT" 워드마크
- 폰트: 라틴 헤딩 Bebas Neue, 한글 헤딩 폴백 Black Han Sans / 본문 라틴 Inter, 한글 폴백 Noto Sans KR (Bebas Neue는 한글 미지원이라 폴백 체인으로 처리, `app/layout.tsx` 참고)
- 톤: 블랙&화이트 모노톤, 카드형 UI(rounded-xl, shadow-sm), Supabase 스타일 참고해서 소프트닝(둥근 모서리, 포커스 상태, hover 배경) 적용됨
- 네비게이션: 홈/목표/식단/운동은 아이콘만 표시 (`components/icons.tsx`), 설정⚙/마이페이지👤도 아이콘

## 디렉터리 구조 요점

```
app/
  layout.tsx        # 헤더/네비(아이콘), 폰트, 테마 초기화 스크립트, i18n
  page.tsx           # 랜딩 페이지
  login/, signup/     # 인증
  profile/            # 목표 설정
  dashboard/          # 홈
  diet/, workout/      # 기록 페이지
  mypage/, settings/   # 계정 관련
  actions.ts          # 전체 서버 액션 (회원가입/로그인/목표저장/기록추가/프로필수정)
lib/
  supabase/server.ts, client.ts, middleware.ts   # Supabase SSR 클라이언트
  calc.ts             # BMR/TDEE/매크로 계산
  passwordPolicy.ts   # 비밀번호 검증
  i18n.ts, i18n-constants.ts   # 다국어 사전 (i18n.ts는 서버 전용 — next/headers 사용, 클라이언트 컴포넌트는 반드시 i18n-constants.ts에서 import)
components/
  icons.tsx, ThemeToggle.tsx, LanguageToggle.tsx
middleware.ts          # Supabase 세션 갱신
supabase/
  schema.sql              # 최초 테이블(goals, diet_logs, workout_logs) + RLS
  002_workout_categories.sql  # 운동 부위(category)/유산소 필드 추가 마이그레이션
  003_goal_types.sql          # goal_type에 미니컷/미니벌크 추가 마이그레이션
.claude/launch.json     # 미리보기용 dev 서버 설정 (npm run dev, port 3000)
.env                    # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (git에는 없음, .gitignore 처리됨)
```

## 알아둘 것 (설계 이유)

- **인증/세션**: Supabase Auth + `@supabase/ssr`. 커스텀 세션 로직(HMAC 쿠키) → 전부 삭제하고 Supabase로 완전히 마이그레이션했음. `lib/supabase/server.ts`의 `getCurrentUser()`/`createClient()`를 모든 서버 컴포넌트/액션에서 사용.
- **DB**: Prisma+SQLite로 시작했다가 Supabase Postgres로 전환. Prisma 관련 파일은 전부 삭제됨. 현재 ORM 없이 Supabase JS 클라이언트로 직접 쿼리.
- **다국어(i18n)**: `lib/i18n.ts`는 `next/headers`의 `cookies()`를 쓰므로 서버 컴포넌트/서버 액션 전용. 클라이언트 컴포넌트(`'use client'`)에서 `Locale` 타입이나 `LOCALE_COOKIE` 상수가 필요하면 반드시 `lib/i18n-constants.ts`에서 import할 것 — `lib/i18n.ts`에서 가져오면 빌드 에러남(서버 전용 모듈이 클라이언트 번들에 섞임).
- **운동 기록**: `workout_logs` 테이블은 근력 운동(sets/reps/weight_kg)과 유산소(duration_min/distance_km)를 한 테이블에서 `category` 컬럼으로 구분. sets/reps/weight_kg는 nullable로 마이그레이션됨 (002 참고).

## 미완료/보류 항목

1. **SQL 마이그레이션 실행 여부 재확인 필요** — `supabase/002_workout_categories.sql`, `supabase/003_goal_types.sql`을 Supabase SQL Editor에서 실행했는지 사용자에게 확인 안 됨. 실행 안 했다면 미니컷/미니벌크 저장, 운동 부위별 탭 저장이 실패함.
2. **배포 안 됨** — 로컬 개발 서버로만 확인 가능. 실서비스로 쓰려면 Vercel 등에 배포 + 환경변수 설정 필요.
3. **에러 메시지 다국어**: 서버 액션에서 발생하는 에러는 대부분 번역됐지만, Supabase가 직접 반환하는 에러 메시지(`error.message`, 예: 이메일 중복 등)는 Supabase 자체 언어(영어)로 나올 수 있음 — 번역 레이어를 안 씌움.

**결정**: Supabase 이메일 확인(Confirm email)은 그대로 유지하기로 함 (2026-08-10, 사용자 확인).

## 작업 스타일 메모

- 새 기능/변경 후 항상 `npx tsc --noEmit`으로 타입체크, 그 다음 브라우저(`mcp__Claude_Browser__*` 도구)로 실제 동작 확인하는 순서로 진행했음.
- git commit은 의미 단위로 자주 하고, push 전에는 항상 사용자에게 확인받음.
- 브라우저 자동화에서 `computer` 클릭/타이핑이 가끔 씹혀서(렌더링 안 잡힘) `javascript_tool`로 폼 필드를 직접 채우고 `form.requestSubmit()`으로 제출하는 방식이 더 안정적이었음.
