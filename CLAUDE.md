# Bulk & Cut — 프로젝트 컨텍스트

개인 맞춤형 벌크업/커팅 식단·운동 관리 웹앱. 1인 개발 개인 프로젝트(프로토타입 규모).

## 스택

- **Next.js 14 (App Router)** + TypeScript + Tailwind CSS
- **Supabase** — Auth(이메일/비밀번호) + Postgres DB + RLS. 별도 백엔드 서버 없음.
- 배포: 아직 없음. 로컬 `npm run dev`로만 실행 중 (Vercel 등 미배포).
- GitHub: [Kwonnono/knn-gym-project](https://github.com/Kwonnono/knn-gym-project) (private, `master` 브랜치, 지금까지 전부 push 완료)

## 핵심 기능

- 회원가입/로그인/로그아웃 (Supabase Auth)
- 목표 설정(`/profile`): 키/몸무게/나이/성별/활동량*(필수, 라벨 옆 빨간 `*`) + 목표(커팅·벌크업·유지·미니컷·미니벌크, 목표 바로 아래에 목표 기간(주)) + 감량/증량 속도(느림/보통/빠름)·목표 체지방률·**현재/목표 골격근량(분리됨)**·현재 체지방률(전부 선택) 입력 → BMR/목표 칼로리·탄단지 자동 계산 (`lib/calc.ts`, Mifflin-St Jeor 공식). **목표 골격근량이 입력되면 단백질 목표는 체중이 아니라 목표 골격근량 기준(×2g)으로 계산됨** (근육량이 있으면 그걸 우선). 목표 기간을 입력하면 TDEE→최종 목표 칼로리로 선형 보간되는 주차별 커리큘럼(`calculateWeeklyCurriculum`)도 계산됨(현재 대시보드에는 미노출, 아래 진행중 항목 참고).
- 홈(`/dashboard`): 2열 그리드 레이아웃(좌 60%/우 40%, 우측 컬럼 하단이 좌측과 정확히 맞도록 `flex flex-col` + `flex-1`/`overflow-hidden` 조정됨). 상단 타이틀 "Dashboard" 옆에 **날짜 이동 컨트롤**(`components/DateNav.tsx`, ‹ 날짜피커 › + 오늘이면 "(Today)" 표시, 오늘이 아니면 다음 화살표 숨김)이 있어 과거 날짜의 식단/운동을 조회·등록 가능. 타이틀 아래 목표 요약 한 줄에 목표타입/BMR/목표칼로리/단백질·탄수·지방 목표까지 전부 포함(주간 커리큘럼 카드는 정보 중복이라 제거함). 남은 칼로리 강조 표시 + 색상별 매크로 프로그레스 바(단백질 rose/탄수 emerald/지방 amber) — **오늘 섭취량이 목표를 초과하면 해당 바와 남은칼로리 텍스트가 자동으로 red로 바뀜**(`ProgressBar`가 `value > target`이면 내부적으로 색을 덮어씀, 대시보드가 따로 계산 안 해도 됨). 오늘 목표 달성 배지, 선택한 날짜의 식단(회차별 그룹 헤더)·운동 기록(총 세트+대표 세트 한 줄, 총 볼륨 텍스트는 뺌) 미리보기, 체중 변화 SVG 라인 차트(`components/WeightChart.tsx`, 라이브러리 없이 직접 구현, 포인트마다 날짜/무게 라벨 표시, 고정 130px 높이라 카드가 과도하게 늘어나지 않음, 오늘 체중 기록이 없으면 카드 안에 바로 입력할 수 있는 간이 폼 노출). 예전에 있던 "+ 식단/운동 기록" 큰 버튼 패널은 삭제됨(내비 메뉴로 대체).
- 식단 기록(`/diet`): 음식 이름 입력 시 로컬 프리셋(`lib/foodPresets.ts`, 자주 먹는 음식 ~35개)과 매칭되면 그램 수 입력으로 칼로리/탄단지 자동 환산. **1~5회차(끼니) 선택 드롭다운**(기본값 1회차) 추가돼 있고, 목록은 회차별로 그룹 헤더(예: "1ST MEAL")로 묶여서 표시됨(`lib/mealGroups.ts`). 등록된 기록 수정/삭제(인라인) 가능. `?date=` 쿼리로 다른 날짜 조회/등록 가능(대시보드 날짜 이동에서 연결됨, 타이틀 옆에 날짜가 괄호로 붙음). `/diet/history`에서 월별 캘린더로 과거 날짜 기록 조회(같은 수정/삭제 UI 재사용, 단 이 페이지엔 신규 등록 폼은 없음 — 조회+수정+삭제만. `/diet?date=`쪽은 등록도 됨).
- 운동 기록(`/workout`): 카테고리 탭 맨 앞에 **'전체' 탭**(기본 선택) 추가 — 전체 탭은 부위별 그룹 헤더 + 운동명 + 한 줄 요약만 보여주는 읽기 전용 뷰(근력/유산소가 섞여 있어 인라인 수정 폼은 없음, "수정" 링크를 누르면 해당 부위 탭으로 이동해서 수정). 개별 부위 탭(가슴/등/어깨/팔/하체/코어) + 유산소 탭(별도 필드: 시간/거리)은 기존처럼 등록+수정+삭제 전부 가능. 부위별 기본 종목 드롭다운(`lib/exercises.ts`) + "직접 입력"으로 커스텀 종목 가능. 근력 운동은 "+ 세트 추가"로 세트별 무게/횟수를 동적으로 입력(`sets_data` jsonb 컬럼), 총 세트수·총 볼륨 자동 계산(`lib/workoutVolume.ts`, 대표 세트 상세는 `getFirstSetDetail`). `?date=` 쿼리로 다른 날짜 조회/등록 가능(대시보드 날짜 이동에서 연결됨).
- 체중 기록(`/weight`, 신규): 체중(kg) 입력 폼 + 목록(수정/삭제). `weight_logs` 테이블, 대시보드 차트가 최근 30일치를 조회해서 그림.
- 헤더 내비게이션: 개별 아이콘 나열 대신 **햄버거 아이콘 드롭다운 메뉴**(`components/NavMenu.tsx`)로 통합됨 (Dashboard/Goal/Diet/Workout/Weight/Profile/Settings/Log out). **내비게이션 라벨과 대시보드 타이틀은 언어 토글과 무관하게 항상 영문**으로 통일(`lib/i18n.ts`의 `dictionary.ko.nav.*`/`dashboard.title` 값 자체를 영문 문자열로 넣어둠 — 토글 자체는 살아있지만 이 두 곳만 두 로케일이 같은 값).
- 마이페이지(`/mypage`): 계정 요약(이름/이메일/현재 목표) + 연속 기록일수(스트릭, 식단·운동 기록 날짜 기반 계산) + Free Plan 배지(Pro는 결제 연동 없는 순수 UI placeholder)
- 설정(`/settings`): 이름/닉네임 수정
- 다크/라이트 모드 토글 (localStorage, `components/ThemeToggle.tsx`)
- 한국어/영어 다국어 전환 (쿠키 기반, 기본 한국어, `components/LanguageToggle.tsx` + `lib/i18n.ts`) — 단 위에 적은 대로 헤더 nav/대시보드 타이틀은 예외적으로 항상 영문.
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
  layout.tsx        # 헤더(그리드로 로고 중앙 정렬 + NavMenu 드롭다운), 폰트, 테마 초기화 스크립트, i18n. <main>엔 더 이상 max-w 없음 — 각 페이지가 자체적으로 mx-auto max-w-* 래퍼를 가짐(대시보드만 max-w-6xl, 나머지는 max-w-4xl 이하)
  page.tsx           # 랜딩 페이지
  login/, signup/     # 인증
  profile/            # 목표 설정 (필수 * 표시, 기간/체지방/속도/현재·목표 골격근량 등 커리큘럼 필드 포함)
  dashboard/          # 홈 (2열 그리드) — 진행 중인 대규모 개편 있음, 아래 참고
  diet/               # 오늘 식단 기록 (회차 선택 + 그룹 표시)
  diet/history/        # 캘린더로 과거 날짜 식단 조회(등록 폼 없음, 조회+수정+삭제만)
  workout/            # 운동 기록 (부위별 탭 + 세트별 동적 입력)
  weight/             # 체중 기록 (신규)
  mypage/, settings/   # 계정 관련
  actions.ts          # 전체 서버 액션 (회원가입/로그인/목표저장/식단·운동·체중 CRUD/프로필수정)
lib/
  supabase/server.ts, client.ts, middleware.ts   # Supabase SSR 클라이언트
  calc.ts             # BMR/매크로 계산 + 주차별 커리큘럼(calculateWeeklyCurriculum) — targetSkeletalMuscleMassKg 있으면 단백질 계산 기준으로 사용
  workoutVolume.ts    # 세트별 총 세트수/총 볼륨/대표 세트 상세(getFirstSetDetail) 계산 (sets_data 우선, 없으면 레거시 sets*reps*weight_kg)
  mealGroups.ts        # 식단 로그를 meal_number 기준으로 그룹핑하는 공용 헬퍼 (대시보드+/diet+/diet/history 공용)
  exercises.ts        # 부위별 기본 운동 종목 프리셋
  foodPresets.ts       # 자주 먹는 음식 100g당 영양성분 프리셋 (로컬 하드코딩, 외부 API 없음)
  passwordPolicy.ts   # 비밀번호 검증
  i18n.ts, i18n-constants.ts   # 다국어 사전 (i18n.ts는 서버 전용 — next/headers 사용, 클라이언트 컴포넌트는 반드시 i18n-constants.ts에서 import). nav.*와 dashboard.title은 ko/en 값이 동일(항상 영문).
components/
  icons.tsx, ThemeToggle.tsx, LanguageToggle.tsx, NavMenu.tsx(헤더 드롭다운 메뉴), DateNav.tsx(대시보드 날짜 이동 ‹ › + date input)
  ProgressBar.tsx      # 색상 있는 매크로 프로그레스 바 (대시보드) — value>target이면 자동으로 red 경고색
  DietForm.tsx, DietLogTable.tsx       # 식단 입력 폼(자동환산+회차선택) / 목록+회차그룹+인라인 수정·삭제 (클라이언트)
  WorkoutForm.tsx, WorkoutLogTable.tsx  # 운동 입력 폼(종목선택+세트동적입력) / 목록+인라인 수정·삭제 (클라이언트)
  WeightLogTable.tsx, WeightChart.tsx   # 체중 목록(수정/삭제) / SVG 라인 차트 (라이브러리 없이 직접 구현)
  Calendar.tsx          # 네이티브 Date 기반 월 캘린더 그리드 (식단 히스토리용)
middleware.ts          # Supabase 세션 갱신
supabase/
  schema.sql                       # 최초 테이블(goals, diet_logs, workout_logs) + RLS
  002_workout_categories.sql       # 운동 부위(category)/유산소 필드 추가
  003_goal_types.sql               # goal_type에 미니컷/미니벌크 추가
  004_workout_sets_data.sql        # workout_logs에 sets_data jsonb 추가 (세트별 동적 입력)
  005_goal_curriculum_fields.sql   # goals에 duration_weeks/target_body_fat_percent/weight_change_speed/skeletal_muscle_mass_kg/body_fat_percent 추가
  006_weight_logs.sql              # weight_logs 테이블 신설 (diet_logs/workout_logs와 동일한 RLS 패턴)
  007_diet_meal_number.sql         # diet_logs에 meal_number smallint(1~5, nullable) 추가
  008_goal_skeletal_muscle_target.sql  # goals.skeletal_muscle_mass_kg → current_skeletal_muscle_mass_kg로 rename + target_skeletal_muscle_mass_kg 컬럼 추가
  → 002~008 전부 Supabase SQL Editor에서 실행 완료 확인됨 (002~005는 2026-08-10 오전, 006~008은 2026-08-10 오후에 확인)
.claude/launch.json     # 미리보기용 dev 서버 설정 (npm run dev, autoPort:true — 다른 세션이 3000 점유 시 자동으로 다른 포트 사용)
.env                    # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (git에는 없음, .gitignore 처리됨)
```

## 알아둘 것 (설계 이유)

- **인증/세션**: Supabase Auth + `@supabase/ssr`. 커스텀 세션 로직(HMAC 쿠키) → 전부 삭제하고 Supabase로 완전히 마이그레이션했음. `lib/supabase/server.ts`의 `getCurrentUser()`/`createClient()`를 모든 서버 컴포넌트/액션에서 사용.
- **DB**: Prisma+SQLite로 시작했다가 Supabase Postgres로 전환. Prisma 관련 파일은 전부 삭제됨. 현재 ORM 없이 Supabase JS 클라이언트로 직접 쿼리.
- **다국어(i18n)**: `lib/i18n.ts`는 `next/headers`의 `cookies()`를 쓰므로 서버 컴포넌트/서버 액션 전용. 클라이언트 컴포넌트(`'use client'`)에서 `Locale` 타입이나 `LOCALE_COOKIE` 상수가 필요하면 반드시 `lib/i18n-constants.ts`에서 import할 것 — `lib/i18n.ts`에서 가져오면 빌드 에러남(서버 전용 모듈이 클라이언트 번들에 섞임).
- **운동 기록**: `workout_logs` 테이블은 근력 운동(sets/reps/weight_kg, 레거시 단일세트 호환용)과 유산소(duration_min/distance_km)를 한 테이블에서 `category` 컬럼으로 구분. 세트별 동적 입력은 `sets_data jsonb`(배열, `{reps, weightKg}[]`)에 저장하고 `sets`/`reps`/`weight_kg`엔 세트수/첫세트 값을 함께 채워 하위 호환 유지. 총 세트수/총 볼륨은 `lib/workoutVolume.ts`가 `sets_data` 있으면 그걸로, 없으면 레거시 필드로 계산.
- **목표 커리큘럼**: `goals`는 사용자당 1행이라 주차별 계획을 DB에 저장하지 않고 `calculateWeeklyCurriculum`으로 매번 계산. "이번 주차"는 `goal.updated_at`(마지막 목표 저장 시점)을 시작일로 역산 — 목표를 다시 저장하면 주차 카운트가 리셋됨(의도된 단순화, 프로토타입 수준).
- **클라이언트 테이블의 수정 상태 초기화**: `DietLogTable`/`WorkoutLogTable`은 Next.js 서버 액션 폼 제출 후 소프트 네비게이션으로 컴포넌트가 리마운트되지 않을 수 있어, `useEffect(() => setEditingId(null), [logs])`로 `logs` prop이 갱신될 때마다 편집 상태를 강제 초기화함 — 이게 없으면 저장 후에도 수정 폼이 계속 열려있는 채로 보임(실제 데이터는 저장되지만 UI가 안 닫힘).
- **대시보드 날짜 이동 ↔ /diet, /workout 연동 패턴**: 대시보드/`/diet`/`/workout` 모두 `?date=YYYY-MM-DD` 검색 파라미터를 받아 그 날짜의 하루 범위(`gte`+`lt`)로 조회함(기본값은 오늘). `DietForm`/`WorkoutForm`은 `date` prop을 받으면 hidden input으로 폼에 실어 보내고, `addDietLogAction`/`addWorkoutLogAction`(`app/actions.ts`)이 `dateKeyToIso()` 헬퍼로 `YYYY-MM-DD`를 정오 타임스탬프로 변환해 insert의 `date` 컬럼에 반영함(폼에 date가 없으면 기존처럼 DB default `now()`). 수정/삭제 액션들도 `redirectTo`/`category`+`date` 조합으로 저장 후 같은 날짜 화면에 그대로 머무르게 되어 있음. 새 날짜별 페이지를 추가할 땐 이 패턴(쿼리파라미터 → 하루 범위 조회 → hidden date 필드 → 액션에서 dateKeyToIso)을 그대로 재사용하면 됨.

## 미완료/보류 항목

1. **배포 안 됨** — 로컬 개발 서버로만 확인 가능. 실서비스로 쓰려면 Vercel 등에 배포 + 환경변수 설정 필요.
2. **에러 메시지 다국어**: 서버 액션에서 발생하는 에러는 대부분 번역됐지만, Supabase가 직접 반환하는 에러 메시지(`error.message`, 예: 이메일 중복 등)는 Supabase 자체 언어(영어)로 나올 수 있음 — 번역 레이어를 안 씌움.

**결정**: Supabase 이메일 확인(Confirm email)은 그대로 유지하기로 함 (2026-08-10, 사용자 확인).

## 작업 스타일 메모

- 새 기능/변경 후 항상 `npx tsc --noEmit`으로 타입체크, 그 다음 브라우저(`mcp__Claude_Browser__*` 도구)로 실제 동작 확인하는 순서로 진행했음.
- git commit은 의미 단위로 자주 하고, push 전에는 항상 사용자에게 확인받음.
- 브라우저 자동화에서 `computer` 클릭/타이핑이 가끔 씹혀서(렌더링 안 잡힘) `javascript_tool`로 폼 필드를 직접 채우고 `form.requestSubmit()`으로 제출하는 방식이 더 안정적이었음. React 컨트롤드 인풋에 값을 강제로 넣을 땐 네이티브 setter로 값 설정 후 `dispatchEvent(new Event('input', {bubbles:true}))`(또는 select는 'change')를 날려야 React state가 갱신됨.
- 로컬 dev 서버 여러 개가 같은 프로젝트 폴더를 동시에 쓰면(`.next` 캐시 공유) `Unexpected end of JSON input` 같은 webpack 매니페스트 손상 에러가 날 수 있음 — 서버 재시작하면 보통 해소됨. `.claude/launch.json`에 `"autoPort": true` 추가해두면 포트 충돌 시 자동으로 다른 포트를 씀.
- 인증이 필요한 페이지를 브라우저로 검증할 때, 로그인 비밀번호는 절대 대신 입력하지 않음(정책상 예외 없음) — 사용자가 직접 로그인해야 함. 단, 브라우저 쿠키가 도메인 단위(localhost)로 공유되기 때문에 사용자가 다른 포트에서 이미 로그인해뒀다면 그 세션으로 인증된 페이지를 읽기 테스트할 수 있음.
