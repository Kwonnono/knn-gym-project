-- 골격근량을 현재/목표로 분리 (기존 값은 "현재"로 이관)
alter table public.goals rename column skeletal_muscle_mass_kg to current_skeletal_muscle_mass_kg;
alter table public.goals add column if not exists target_skeletal_muscle_mass_kg numeric;
