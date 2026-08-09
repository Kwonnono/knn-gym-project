import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function Stat({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-neutral-500">
          {value}{unit} / {target}{unit}
        </span>
      </div>
      <div className="mt-1 h-2 rounded bg-neutral-200">
        <div className="h-2 rounded bg-neutral-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  if (!goal) redirect('/profile');

  const todayStart = startOfToday();

  const { data: todayLogs } = await supabase
    .from('diet_logs')
    .select('calories, protein_g, carb_g, fat_g')
    .eq('user_id', user.id)
    .gte('date', todayStart);

  const { count: todayWorkouts } = await supabase
    .from('workout_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('date', todayStart);

  const consumed = (todayLogs ?? []).reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      proteinG: acc.proteinG + log.protein_g,
      carbG: acc.carbG + log.carb_g,
      fatG: acc.fatG + log.fat_g
    }),
    { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }
  );

  const goalLabel = { cutting: '커팅', bulking: '벌크업', maintenance: '유지' }[goal.goal_type as string] ?? goal.goal_type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">오늘의 대시보드</h1>
        <a href="/profile" className="text-sm text-neutral-500 underline">목표 다시 설정</a>
      </div>

      <div className="rounded border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        <p>현재 목표: <span className="font-medium text-neutral-900">{goalLabel}</span></p>
        <p>BMR {goal.bmr}kcal · TDEE {goal.tdee}kcal · 목표 칼로리 {goal.target_calories}kcal</p>
      </div>

      <div className="space-y-4 rounded border border-neutral-200 bg-white p-4">
        <h2 className="font-semibold">오늘 섭취</h2>
        <Stat label="칼로리" value={consumed.calories} target={goal.target_calories} unit="kcal" />
        <Stat label="단백질" value={consumed.proteinG} target={goal.target_protein_g} unit="g" />
        <Stat label="탄수화물" value={consumed.carbG} target={goal.target_carb_g} unit="g" />
        <Stat label="지방" value={consumed.fatG} target={goal.target_fat_g} unit="g" />
        <a href="/diet" className="inline-block text-sm underline">식단 기록하러 가기</a>
      </div>

      <div className="rounded border border-neutral-200 bg-white p-4">
        <h2 className="font-semibold">오늘 운동</h2>
        <p className="mt-1 text-sm text-neutral-600">{todayWorkouts ?? 0}개 세트 그룹 기록됨</p>
        <a href="/workout" className="mt-2 inline-block text-sm underline">운동 기록하러 가기</a>
      </div>
    </div>
  );
}
