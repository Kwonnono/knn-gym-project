-- KNN Fit: Supabase Postgres 스키마
-- Supabase 프로젝트의 SQL Editor에서 실행하세요.
-- 사용자 테이블은 별도로 만들지 않고 Supabase가 제공하는 auth.users를 그대로 참조합니다.

create extension if not exists "pgcrypto";

-- 목표 (신체 정보 + 계산된 매크로 타겟)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  height_cm numeric not null,
  weight_kg numeric not null,
  age integer not null,
  sex text not null check (sex in ('male', 'female')),
  activity_level text not null check (
    activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  goal_type text not null check (goal_type in ('cutting', 'bulking', 'maintenance')),
  bmr integer not null,
  tdee integer not null,
  target_calories integer not null,
  target_protein_g integer not null,
  target_carb_g integer not null,
  target_fat_g integer not null,
  updated_at timestamptz not null default now()
);

-- 일일 식단 기록
create table if not exists public.diet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date timestamptz not null default now(),
  meal_name text not null,
  calories integer not null,
  protein_g integer not null default 0,
  carb_g integer not null default 0,
  fat_g integer not null default 0,
  created_at timestamptz not null default now()
);

-- 일일 운동 기록
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date timestamptz not null default now(),
  exercise text not null,
  sets integer not null,
  reps integer not null,
  weight_kg numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists diet_logs_user_id_date_idx on public.diet_logs (user_id, date);
create index if not exists workout_logs_user_id_date_idx on public.workout_logs (user_id, date);

-- Row Level Security: 본인 데이터만 조회/수정 가능
alter table public.goals enable row level security;
alter table public.diet_logs enable row level security;
alter table public.workout_logs enable row level security;

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);
drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);
drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id);
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

drop policy if exists "diet_logs_select_own" on public.diet_logs;
create policy "diet_logs_select_own" on public.diet_logs
  for select using (auth.uid() = user_id);
drop policy if exists "diet_logs_insert_own" on public.diet_logs;
create policy "diet_logs_insert_own" on public.diet_logs
  for insert with check (auth.uid() = user_id);
drop policy if exists "diet_logs_update_own" on public.diet_logs;
create policy "diet_logs_update_own" on public.diet_logs
  for update using (auth.uid() = user_id);
drop policy if exists "diet_logs_delete_own" on public.diet_logs;
create policy "diet_logs_delete_own" on public.diet_logs
  for delete using (auth.uid() = user_id);

drop policy if exists "workout_logs_select_own" on public.workout_logs;
create policy "workout_logs_select_own" on public.workout_logs
  for select using (auth.uid() = user_id);
drop policy if exists "workout_logs_insert_own" on public.workout_logs;
create policy "workout_logs_insert_own" on public.workout_logs
  for insert with check (auth.uid() = user_id);
drop policy if exists "workout_logs_update_own" on public.workout_logs;
create policy "workout_logs_update_own" on public.workout_logs
  for update using (auth.uid() = user_id);
drop policy if exists "workout_logs_delete_own" on public.workout_logs;
create policy "workout_logs_delete_own" on public.workout_logs
  for delete using (auth.uid() = user_id);
