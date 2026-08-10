-- 근력 운동 세트별(무게/횟수) 동적 입력을 위한 컬럼 추가
alter table public.workout_logs
  add column if not exists sets_data jsonb;
