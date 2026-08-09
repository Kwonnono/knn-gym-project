-- goals.goal_type에 미니컷/미니벌크 추가
alter table public.goals drop constraint if exists goals_goal_type_check;
alter table public.goals add constraint goals_goal_type_check
  check (goal_type in ('cutting', 'bulking', 'maintenance', 'mini_cut', 'mini_bulk'));
