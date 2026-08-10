-- 체중 기록 테이블 (대시보드 체중 변화 그래프용)
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date timestamptz not null default now(),
  weight_kg numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists weight_logs_user_id_date_idx on public.weight_logs (user_id, date);

alter table public.weight_logs enable row level security;

drop policy if exists "weight_logs_select_own" on public.weight_logs;
create policy "weight_logs_select_own" on public.weight_logs
  for select using (auth.uid() = user_id);
drop policy if exists "weight_logs_insert_own" on public.weight_logs;
create policy "weight_logs_insert_own" on public.weight_logs
  for insert with check (auth.uid() = user_id);
drop policy if exists "weight_logs_update_own" on public.weight_logs;
create policy "weight_logs_update_own" on public.weight_logs
  for update using (auth.uid() = user_id);
drop policy if exists "weight_logs_delete_own" on public.weight_logs;
create policy "weight_logs_delete_own" on public.weight_logs
  for delete using (auth.uid() = user_id);
