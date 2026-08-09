-- workout_logs에 부위(category) 및 유산소 전용 필드 추가
alter table public.workout_logs
  add column if not exists category text not null default 'chest'
    check (category in ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio')),
  add column if not exists duration_min integer,
  add column if not exists distance_km numeric;

alter table public.workout_logs alter column sets drop not null;
alter table public.workout_logs alter column reps drop not null;
alter table public.workout_logs alter column weight_kg drop not null;
alter table public.workout_logs alter column weight_kg drop default;

create index if not exists workout_logs_user_id_category_idx on public.workout_logs (user_id, category);
