-- 식단 기록에 1~5회차 식사 구분 추가 (과거 데이터 호환을 위해 nullable)
alter table public.diet_logs
  add column if not exists meal_number smallint check (meal_number between 1 and 5);
