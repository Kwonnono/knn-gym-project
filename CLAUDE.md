# Bulk & Cut — 프로젝트 컨텍스트

개인 맞춤형 벌크업/커팅 식단·운동 관리 웹앱. 1인 개발 개인 프로젝트(프로토타입 규모).

## 스택

- **Next.js 14 (App Router)** + TypeScript + Tailwind CSS
- **Supabase** — Auth(이메일/비밀번호) + Postgres DB + RLS. 별도 백엔드 서버 없음.
- 배포: 아직 없음. 로컬 `npm run dev`로만 실행 중 (Vercel 등 미배포).
- GitHub: [Kwonnono/knn-gym-project](https://github.com/Kwonnono/knn-gym-project) (private, `master` 브랜치, 지금까지 전부 push 완료)

## 핵심 기능

- 회원가입/로그인/로그아웃 (Supabase Auth). 회원가입(`/signup`)엔 **이용약관/개인정보 수집·이용 동의 체크박스 2개**(둘 다 필수, `required` + `signupAction` 서버단 이중 검증)가 있고 각각 새로 만든 정적 페이지 `/terms`·`/privacy`로 연결됨(새 탭).
- 목표 설정(`/profile`): 키/몸무게/나이/성별/활동량*(필수, 라벨 옆 빨간 `*`) + 목표(커팅·벌크업·유지·미니컷·미니벌크, 목표 바로 아래에 목표 기간(주)) + 감량/증량 속도(느림/보통/빠름)·목표 체지방률·**현재/목표 골격근량(분리됨)**·현재 체지방률(전부 선택) 입력 → BMR/목표 칼로리·탄단지 자동 계산 (`lib/calc.ts`). **보디빌딩급으로 상향됨**: 체지방률을 입력하면 Katch-McArdle 공식(`BMR = 370 + 21.6 × 제지방량`, 제지방량=체중×(1−체지방률/100))을 쓰고, 입력 안 하면 기존 Mifflin-St Jeor로 폴백. 단백질은 goalType별로 세분화된 고단백 배수(커팅·미니컷 2.6g/kg, 벌크업·미니벌크·유지 2.3g/kg — 예전엔 전부 고정 2.0g/kg)를 목표 골격근량(입력 시 우선) 또는 체중에 곱해서 계산. 지방은 총 칼로리의 20%(예전 25%)로 낮추고 나머지는 탄수화물에 전량 배분. `saveGoalAction`(`app/actions.ts`)이 폼의 `bodyFatPercent`를 `calculateTargets`에 실제로 전달함(전에는 읽기만 하고 계산엔 안 넘기던 버그가 있었는데 이번에 연결함). 목표 기간을 입력하면 TDEE→최종 목표 칼로리로 선형 보간되는 주차별 커리큘럼(`calculateWeeklyCurriculum`)도 계산됨(현재 대시보드에는 미노출).
- 홈(`/dashboard`): 2열 그리드 레이아웃(좌 60%/우 40%, 우측 컬럼 하단이 좌측과 정확히 맞도록 `flex flex-col` + `flex-1`/`overflow-hidden` 조정됨). 상단 타이틀 "Dashboard" 옆에 **날짜 이동 컨트롤**(`components/DateNav.tsx`, ‹ 날짜피커 › + 오늘이면 "(오늘)" 표시)이 있어 **과거뿐 아니라 미래 날짜**로도 이동해 식단/운동을 미리 등록할 수 있음(`max` 제한 제거, 다음 화살표가 오늘이어도 항상 노출 — 예전엔 오늘일 때 다음 화살표를 숨겼었음). 타이틀 아래 목표 요약은 `목표: [타입] · BMR(기초대사량) [n]kcal` 한 줄로 **단순화**됨(예전엔 목표칼로리·단백질·탄수·지방까지 다 나열했으나 정보 과다라 축소, `t.dashboard.goalLine(goalLabel, bmr)`은 이제 2-인자). 이 BMR/칼로리/탄단지 목표치는 **DB에 저장된 값이 아니라 매 요청마다 `calculateTargets`로 즉석 재계산**됨(대시보드+마이페이지 공통) — `lib/calc.ts` 공식이 바뀌어도 사용자가 `/profile`에서 재저장할 필요 없이 즉시 반영되도록 하기 위함(예전엔 저장 시점 값을 그대로 읽어서, 공식이 바뀌어도 재저장 전까진 옛날 계산값이 계속 보이는 문제가 있었음). 그 옆에 **"사용법" 버튼**(`components/HelpModal.tsx`, 오버레이 모달로 핵심 기능 5가지 팁 표시, 외부 라이브러리 없이 직접 구현)과 "목표 설정" 링크가 나란히 배치. 헤더에는 **아바타+닉네임**(`components/Avatar.tsx`)이 `/mypage`로 링크되어 있음(`app/layout.tsx`) — 프로필 사진 업로드 기능이 `/mypage`에 있어서 아바타 클릭 목적지도 그쪽으로 맞춤(이전엔 `/profile`(목표 설정 페이지)로 잘못 연결돼 있었음, 2026-08-11 수정). Avatar는 `avatarUrl`이 있으면 이미지를, 없으면 **보편적인 사람 실루엣 아이콘**(`UserIcon`, 회색 원형 배경)을 보여줌(예전의 이니셜+색상 배지 디자인은 제거됨). 목표 요약 아래엔 첫 방문 유저를 위한 **온보딩 배너**(`components/OnboardingBanner.tsx`, "Bulk & Cut 100% 활용 가이드", `localStorage` 키 `onboarding-banner-dismissed`로 닫힘 상태 영구 기억, 닫기 전까진 새로고침해도 계속 노출, 닫기 X 버튼은 `items-start`로 우측 상단 정렬)가 그리드 위에 표시됨. 남은 칼로리 강조 표시 + 색상별 매크로 프로그레스 바(단백질 rose/탄수 emerald/지방 amber) — **오늘 섭취량이 목표를 초과하면 해당 바와 남은칼로리 텍스트가 자동으로 red로 바뀜**(`ProgressBar`가 `value > target`이면 내부적으로 색을 덮어씀). 프로그레스 바 아래엔 **남은 단백질 가이드 팁**(예: "단백질 142g 필요 · 팁: 닭가슴살 4.6팩" — 목표-섭취 잔여량이 5g 넘을 때만 노출, 기준식품 100g당 31g 단백질/1팩=100g으로 계산, 대시보드 인라인 로직이라 별도 lib 없음)이 `components/DismissibleTip.tsx`로 감싸져 있어 **날짜별로 스코프된 localStorage 키**(`protein-tip-dismissed-{date}`)로 개별 닫기 가능(내일은 다시 보임). 오늘 목표 달성 배지, 선택한 날짜의 식단(회차별 그룹 헤더)·운동 기록(총 세트+대표 세트 한 줄 + **수정/삭제 버튼**, 총 볼륨 텍스트는 뺌) 미리보기, 체중 변화 SVG 라인 차트(`components/WeightChart.tsx`, 라이브러리 없이 직접 구현, 포인트마다 날짜/무게 라벨을 예전보다 큰 폰트로 표시, 카드 높이는 고정이 아니라 `min-h-[200px] max-h-[280px]`로 반응형 클램프), 오늘 체중 기록이 없으면 카드 안에 바로 입력할 수 있는 간이 폼 노출. 예전에 있던 "+ 식단/운동 기록" 큰 버튼 패널은 삭제됨(내비 메뉴로 대체).
- 식단 기록(`/diet`): 음식 이름 입력란이 **커스텀 검색 콤보박스**(`DietForm.tsx`, 예전엔 네이티브 `<datalist>`였는데 브라우저별로 선택 후에도 인식이 안 되는 버그가 있어 교체됨) — 타이핑하면 `lib/foodPresets.ts` 매칭 목록이 클릭 가능한 드롭다운으로 뜨고(`onMouseDown`+`preventDefault`로 blur보다 먼저 선택 처리), 클릭하면 그램 입력란이 나타나며 칼로리/탄단지가 비례 자동 환산됨(프리셋 미매칭이어도 칼로리/탄단지 필드는 항상 수동 입력 가능). **식단을 추가하면 폼 전체(음식명/그램/칼로리/탄단지)가 자동 초기화**됨(`logCount` prop이 바뀔 때마다 `useEffect`로 리셋 — 서버 액션 소프트 네비게이션 후에도 이전 입력이 남아있던 버그 수정, 2026-08-11). 폼 위에 **"최근 먹은 음식 1초 추가"** 칩 목록(`components/QuickAddFoods.tsx`) — 최근 `diet_logs` 60건을 `meal_name` 기준 중복제거해 상위 6개를 `⚡ 이름 · 칼로리kcal` 버튼으로 노출, 클릭 즉시(리뷰 없이) 그 값 그대로 1회차로 저장됨. **1~5회차(끼니) 선택 드롭다운**(기본값 1회차) 추가돼 있고, 목록은 회차별로 그룹 헤더(예: "1ST MEAL")로 묶여서 표시됨(`lib/mealGroups.ts`). 등록된 기록 수정/삭제(인라인) 가능. `?date=` 쿼리로 다른 날짜 조회/등록 가능(대시보드 날짜 이동에서 연결됨, 타이틀 옆에 날짜가 괄호로 붙음). `/diet/history`에서 월별 캘린더로 과거 날짜 기록 조회(같은 수정/삭제 UI 재사용, 단 이 페이지엔 신규 등록 폼은 없음 — 조회+수정+삭제만. `/diet?date=`쪽은 등록도 됨).
- 운동 기록(`/workout`): 카테고리 탭 맨 앞에 **'전체' 탭**(기본 선택) 추가 — 전체 탭은 부위별 그룹 헤더 + 운동명 + 한 줄 요약만 보여주는 읽기 전용 뷰(근력/유산소가 섞여 있어 인라인 수정 폼은 없음, "수정" 링크를 누르면 해당 부위 탭으로 이동해서 수정 + **"삭제" 버튼**으로 즉시 삭제도 가능, 삭제 후엔 `redirectTo=/workout?category=all&date=...`로 전체 탭에 그대로 머무름). 개별 부위 탭(가슴/등/어깨/팔/하체/코어) + 유산소 탭(별도 필드: 시간/거리)은 기존처럼 등록+수정+삭제 전부 가능. 부위별 기본 종목 드롭다운(`lib/exercises.ts`) + "직접 입력"으로 커스텀 종목 가능. **종목을 선택하면 그 종목의 지난 수행 기록(무게/횟수)이 자동으로 채워짐** — 서버에서 해당 카테고리의 최근 `workout_logs`(최대 100건)를 조회해 `운동명 → 마지막 세트[]` 맵(`lastPerformance`)을 만들어 `WorkoutForm`에 넘기고, select `onChange`가 그 값으로 세트 입력 행을 초기화함(기록 없으면 기존처럼 빈 값 1행). 근력 운동은 "+ 세트 추가"로 세트별 무게/횟수를 동적으로 입력(`sets_data` jsonb 컬럼), 총 세트수·총 볼륨 자동 계산(`lib/workoutVolume.ts`, 대표 세트 상세는 `getFirstSetDetail`). `?date=` 쿼리로 다른 날짜 조회/등록 가능(대시보드 날짜 이동에서 연결됨). `deleteWorkoutLogAction`은 이제 `redirectTo` hidden 필드를 선택적으로 받음(없으면 예전처럼 `/workout?category=X&date=Y`로 리다이렉트) — 대시보드 요약 테이블에서 삭제하면 `/dashboard?date=...`로 되돌아옴.
- 체중 기록(`/weight`): 체중(kg) 입력 폼 + 목록(수정/삭제). `weight_logs` 테이블, 대시보드 차트가 최근 30일치를 조회해서 그림.
- 헤더 내비게이션: 개별 아이콘 나열 대신 **햄버거 아이콘 드롭다운 메뉴**(`components/NavMenu.tsx`)로 통합됨 (Dashboard/Goal/Diet/Workout/Weight/Profile/Settings/Log out), 그 옆에 아바타+닉네임 링크(위 대시보드 항목 참고). **내비게이션 라벨과 대시보드 타이틀은 언어 토글과 무관하게 항상 영문**으로 통일(`lib/i18n.ts`의 `dictionary.ko.nav.*`/`dashboard.title` 값 자체를 영문 문자열로 넣어둠 — 토글 자체는 살아있지만 이 두 곳만 두 로케일이 같은 값).
- 마이페이지(`/mypage`): **프로필 사진 업로드**(`components/AvatarUploader.tsx`, "사진 변경" 버튼 → 파일 선택 → Supabase Storage `avatars` 버킷의 `{user.id}/avatar.{ext}` 경로에 업로드 → `supabase.auth.updateUser({data:{avatar_url}}))`로 user_metadata에 저장 → `router.refresh()`로 헤더 아바타까지 즉시 갱신, 캐시 무효화용 `?t=timestamp` 쿼리 포함) + 계정 요약(이름/이메일/현재 목표) + 연속 기록일수(스트릭, 식단·운동 기록 날짜 기반 계산) + Free Plan 배지(Pro는 결제 연동 없는 순수 UI placeholder). Storage 버킷/RLS는 `supabase/009_avatar_storage.sql`로 정의돼 있고 **아직 Supabase SQL Editor에서 실행 안 됨** — 실행 전까지 업로드 시도하면 "bucket not found" 에러가 남.
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
  terms/, privacy/     # 정적 이용약관/개인정보처리방침 페이지 (회원가입 동의 체크박스에서 링크)
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
  calc.ts             # BMR(Katch-McArdle/Mifflin-St Jeor 폴백)/매크로 계산(goalType별 단백질 배수, 지방 20%) + 주차별 커리큘럼(calculateWeeklyCurriculum). 단백질은 항상 총 체중 기준(목표 골격근량 기준으로 계산하면 101g처럼 터무니없이 낮게 나오는 버그가 있어서 2026-08-11에 제거함 — targetSkeletalMuscleMassKg는 더 이상 TargetInput/계산에 쓰이지 않음, DB엔 여전히 저장/표시됨)
  workoutVolume.ts    # 세트별 총 세트수/총 볼륨/대표 세트 상세(getFirstSetDetail) 계산 (sets_data 우선, 없으면 레거시 sets*reps*weight_kg)
  mealGroups.ts        # 식단 로그를 meal_number 기준으로 그룹핑하는 공용 헬퍼 (대시보드+/diet+/diet/history 공용)
  exercises.ts        # 부위별 기본 운동 종목 프리셋
  foodPresets.ts       # 자주 먹는 음식 100g당 영양성분 프리셋 (로컬 하드코딩, 외부 API 없음)
  passwordPolicy.ts   # 비밀번호 검증
  i18n.ts, i18n-constants.ts   # 다국어 사전 (i18n.ts는 서버 전용 — next/headers 사용, 클라이언트 컴포넌트는 반드시 i18n-constants.ts에서 import). nav.*와 dashboard.title은 ko/en 값이 동일(항상 영문).
components/
  icons.tsx, ThemeToggle.tsx, LanguageToggle.tsx, NavMenu.tsx(헤더 드롭다운 메뉴), DateNav.tsx(대시보드 날짜 이동 ‹ › + date input, 미래 제한 없음)
  Avatar.tsx            # avatarUrl 있으면 이미지, 없으면 UserIcon 실루엣 원형 배지 (size: 'sm'(헤더)/'lg'(마이페이지))
  AvatarUploader.tsx     # 마이페이지 프로필 사진 업로드 (클라이언트, Supabase Storage 직접 업로드)
  OnboardingBanner.tsx   # 대시보드 상단 온보딩 배너, localStorage로 닫힘 상태 기억
  DismissibleTip.tsx      # 날짜별 localStorage 키로 닫히는 범용 팁 배너 (대시보드 단백질 가이드 팁에 사용)
  DeleteButton.tsx        # confirm() 확인 후 서버 액션 삭제 폼을 제출하는 범용 삭제 버튼 (workout all탭 + 대시보드 요약에 재사용)
  HelpModal.tsx          # "사용법" 버튼 → 핵심 기능 팁 오버레이 모달 (외부 라이브러리 없음)
  QuickAddFoods.tsx      # 식단 페이지 "최근 먹은 음식 1초 추가" 칩 버튼들 (각자 독립 form으로 클릭 즉시 제출)
  ProgressBar.tsx      # 색상 있는 매크로 프로그레스 바 (대시보드) — value>target이면 자동으로 red 경고색
  DietForm.tsx, DietLogTable.tsx       # 식단 입력 폼(커스텀 검색 콤보박스+자동환산+회차선택+추가후 리셋) / 목록+회차그룹+인라인 수정·삭제 (클라이언트)
  WorkoutForm.tsx, WorkoutLogTable.tsx  # 운동 입력 폼(종목선택+세트동적입력+지난 기록 자동채움) / 목록+인라인 수정·삭제 (클라이언트)
  WeightLogTable.tsx, WeightChart.tsx   # 체중 목록(수정/삭제) / SVG 라인 차트 (라이브러리 없이 직접 구현, 균일 스케일 preserveAspectRatio, 포인트-라벨 겹침 방지 padding 확보됨)
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
  009_avatar_storage.sql           # 프로필 사진용 Storage 버킷(avatars, public) + 본인 폴더 한정 RLS 정책 4개 — 아직 미실행, 실행 전까진 사진 업로드 안 됨
  → 002~008 전부 Supabase SQL Editor에서 실행 완료 확인됨 (002~005는 2026-08-10 오전, 006~008은 2026-08-10 오후에 확인). 009는 2026-08-11에 추가됐고 아직 미실행.
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
- **대시보드 날짜 이동 ↔ /diet, /workout 연동 패턴**: 대시보드/`/diet`/`/workout` 모두 `?date=YYYY-MM-DD` 검색 파라미터를 받아 그 날짜의 하루 범위(`gte`+`lt`)로 조회함(기본값은 오늘, 미래 날짜도 그대로 받아들임 — `max` 제한은 UI(`DateNav`)에서만 있었고 이번에 제거됨, 백엔드는 원래부터 임의 날짜 허용). `DietForm`/`WorkoutForm`은 `date` prop을 받으면 hidden input으로 폼에 실어 보내고, `addDietLogAction`/`addWorkoutLogAction`(`app/actions.ts`)이 `dateKeyToIso()` 헬퍼로 `YYYY-MM-DD`를 정오 타임스탬프로 변환해 insert의 `date` 컬럼에 반영함(폼에 date가 없으면 기존처럼 DB default `now()`). 수정/삭제 액션들도 `redirectTo`/`category`+`date` 조합으로 저장 후 같은 날짜 화면에 그대로 머무르게 되어 있음. 새 날짜별 페이지를 추가할 땐 이 패턴(쿼리파라미터 → 하루 범위 조회 → hidden date 필드 → 액션에서 dateKeyToIso)을 그대로 재사용하면 됨.
- **영양 계산 상향(Katch-McArdle + goalType별 고단백)**: `calculateBMR`(`lib/calc.ts`)는 `bodyFatPercent`가 유효값(0 초과 100 미만)이면 제지방량 기반 Katch-McArdle을, 없으면 기존 Mifflin-St Jeor를 씀. 단백질은 `PROTEIN_G_PER_KG` 맵(cutting/mini_cut: 2.6, 나머지: 2.3)을 목표 골격근량(있으면 우선) 또는 체중에 곱함. 지방은 `FAT_CALORIE_RATIO = 0.2`로 총 칼로리의 20%, 나머지 전량이 탄수화물. `goals` 테이블엔 여전히 저장 시점의 `bmr`/`target_*` 컬럼이 남아있지만(하위호환/참고용), **대시보드(`app/dashboard/page.tsx`)와 마이페이지(`app/mypage/page.tsx`)는 이 저장값을 읽지 않고 매 요청마다 `goal`의 원본 입력값(키/몸무게/체지방률 등)으로 `calculateTargets`를 다시 호출**함 — 예전엔 저장된 컬럼을 그대로 읽어서, `lib/calc.ts` 공식이 바뀌어도 유저가 `/profile`에서 재저장하기 전까진 화면에 옛날 계산값이 계속 보이는 문제가 있었음(2026-08-11 수정). `saveGoalAction`이 insert하는 `bmr`/`target_*` 컬럼 자체는 그대로 유지(스키마 변경 없음).
- **최근 항목 기반 "1초 추가" 패턴**(식단 QuickAddFoods / 운동 lastPerformance): 둘 다 새 테이블 없이 기존 `diet_logs`/`workout_logs`를 읽기 시점에 조회해서 만듦. 식단은 `app/diet/page.tsx`가 최근 60건을 `meal_name` 기준 중복제거해 상위 6개를 클라이언트로 넘기고, 각 항목이 자체 `<form action={addDietLogAction}>`(hidden 필드만, 리뷰 UI 없음)이라 클릭=즉시 제출. 운동은 `app/workout/page.tsx`가 카테고리별 최근 100건에서 운동명별 가장 최근 세트를 `Record<운동명, 세트[]>`로 만들어 `WorkoutForm`에 넘기고, select `onChange`가 그 값으로 폼 state를 초기화(제출까진 안 함, 사용자가 확인 후 눌러야 저장됨 — 식단 쪽과 달리 리뷰 단계가 남아있음).
- **다크모드 초기화 스크립트 하이드레이션 경고**: `app/layout.tsx`의 `THEME_INIT_SCRIPT`(인라인 `<script>`)가 하이드레이션 전에 `document.documentElement`에 `dark` 클래스를 직접 붙이는데, 서버 렌더 시점엔 이 클래스가 없어서 React가 모든 페이지에서 `Prop 'className' did not match` 콘솔 에러를 냈음(기능상 깨지진 않지만 dev 모드에서 항상 노출됨) — `<html>`에 `suppressHydrationWarning`을 추가해 해결(2026-08-11).
- **온보딩 배너 초기 렌더 깜빡임 방지**: `OnboardingBanner`는 `useState(true)`(기본 숨김)로 시작해서 `useEffect` 안에서만 `localStorage`를 읽어 `false`로 뒤집음 — 서버 렌더/최초 클라이언트 렌더 시점엔 `localStorage`에 접근할 수 없어서 기본값을 "보임"으로 하면 이미 닫은 유저에게도 배너가 잠깐 보였다 사라지는 깜빡임이 생기기 때문에, 반대로 기본 숨김에서 필요할 때만 보이는 쪽으로 설계함.

## 미완료/보류 항목

1. **배포 안 됨** — 로컬 개발 서버로만 확인 가능. 실서비스로 쓰려면 Vercel 등에 배포 + 환경변수 설정 필요.
2. **에러 메시지 다국어**: 서버 액션에서 발생하는 에러는 대부분 번역됐지만, Supabase가 직접 반환하는 에러 메시지(`error.message`, 예: 이메일 중복 등)는 Supabase 자체 언어(영어)로 나올 수 있음 — 번역 레이어를 안 씌움.
3. **`supabase/009_avatar_storage.sql` 미실행**: 프로필 사진 업로드 기능(`/mypage`)이 코드상으론 완성됐지만, Storage 버킷/RLS 마이그레이션을 Supabase SQL Editor에서 아직 실행 안 함 — 실행 전까진 "사진 변경" 시 버킷을 찾을 수 없다는 에러가 남. 다음 세션에서 실행 여부 확인할 것.

**확인 완료(2026-08-11, 8건 일괄 수정)**: 회원가입 약관 동의 체크박스, 식단 폼(검색 콤보박스+자동환산+제출후 리셋), 헤더 아바타(/mypage 연결+사진 업로드+실루엣 기본값), 팁/배너 닫기 버튼, 체중차트 점/라벨 겹침, 헤더 z-index 방어, 운동 요약 삭제 버튼(전체탭+대시보드), 단백질 계산(체중 기준으로 고정) — 전부 브라우저로 직접 클릭해서 검증하고 테스트 데이터는 삭제함. 유일한 잔여 작업은 위 3번(Storage 마이그레이션 실행).

**확인 완료(2026-08-11)**: 운동 지난 기록 자동채움 브라우저 E2E 검증 — `/workout?category=chest`에서 벤치프레스로 세트(8회/77.5kg) 등록 후, 다른 종목으로 바꿨다가 다시 벤치프레스를 선택하면 입력 필드가 8/77.5로 자동 채워짐을 확인. 페이지 완전 새로고침 후에도 동일하게 동작함. 테스트로 등록한 로그는 확인 후 삭제함.

**결정**: Supabase 이메일 확인(Confirm email)은 그대로 유지하기로 함 (2026-08-10, 사용자 확인).

## 작업 스타일 메모

- 새 기능/변경 후 항상 `npx tsc --noEmit`으로 타입체크, 그 다음 브라우저(`mcp__Claude_Browser__*` 도구)로 실제 동작 확인하는 순서로 진행했음.
- git commit은 의미 단위로 자주 하고, push 전에는 항상 사용자에게 확인받음.
- 브라우저 자동화에서 `computer` 클릭/타이핑이 가끔 씹혀서(렌더링 안 잡힘) `javascript_tool`로 폼 필드를 직접 채우고 `form.requestSubmit()`으로 제출하는 방식이 더 안정적이었음. React 컨트롤드 인풋에 값을 강제로 넣을 땐 네이티브 setter로 값 설정 후 `dispatchEvent(new Event('input', {bubbles:true}))`(또는 select는 'change')를 날려야 React state가 갱신됨.
- 로컬 dev 서버 여러 개가 같은 프로젝트 폴더를 동시에 쓰면(`.next` 캐시 공유) `Unexpected end of JSON input` 같은 webpack 매니페스트 손상 에러가 날 수 있음 — 서버 재시작하면 보통 해소됨. `.claude/launch.json`에 `"autoPort": true` 추가해두면 포트 충돌 시 자동으로 다른 포트를 씀.
- 인증이 필요한 페이지를 브라우저로 검증할 때, 로그인 비밀번호는 절대 대신 입력하지 않음(정책상 예외 없음) — 사용자가 직접 로그인해야 함. 단, 브라우저 쿠키가 도메인 단위(localhost)로 공유되기 때문에 사용자가 다른 포트에서 이미 로그인해뒀다면 그 세션으로 인증된 페이지를 읽기 테스트할 수 있음.
