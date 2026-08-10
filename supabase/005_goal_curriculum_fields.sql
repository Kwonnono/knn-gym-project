-- 목표 기간/체지방 기반 칼로리 커리큘럼을 위한 컬럼 추가 (전부 선택 입력)
alter table public.goals
  add column if not exists duration_weeks integer,
  add column if not exists target_body_fat_percent numeric,
  add column if not exists weight_change_speed text
    check (weight_change_speed in ('slow', 'normal', 'fast')),
  add column if not exists skeletal_muscle_mass_kg numeric,
  add column if not exists body_fat_percent numeric;
