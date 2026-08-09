import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TargetIcon, UtensilsIcon, DumbbellIcon } from '@/components/icons';

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
        <span className="text-neutral-500 dark:text-neutral-400">
          {value}{unit} / {target}{unit}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div className="h-2 rounded-full bg-black dark:bg-white" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function NavCard({ href, icon, title, description }: { href: string; icon: ReactNode; title: string; description: string }) {
  return (
    <a
      href={href}
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-neutral-300 hover:shadow dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
    >
      <div className="text-neutral-700 dark:text-neutral-300">{icon}</div>
      <p className="mt-2 font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
    </a>
  );
}

const CATEGORY_LABEL: Record<string, string> = {
  chest: '가슴',
  back: '등',
  shoulders: '어깨',
  arms: '팔',
  legs: '하체',
  core: '코어',
  cardio: '유산소'
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  if (!goal) redirect('/profile');

  const todayStart = startOfToday();

  const { data: dietLogs } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', todayStart)
    .order('created_at', { ascending: false });

  const { data: workoutLogs } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', todayStart)
    .order('created_at', { ascending: false });

  const consumed = (dietLogs ?? []).reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      proteinG: acc.proteinG + log.protein_g,
      carbG: acc.carbG + log.carb_g,
      fatG: acc.fatG + log.fat_g
    }),
    { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }
  );

  const goalLabel =
    { cutting: '커팅', bulking: '벌크업', maintenance: '유지', mini_cut: '미니컷', mini_bulk: '미니벌크' }[
      goal.goal_type as string
    ] ?? goal.goal_type;
  const recentDietLogs = (dietLogs ?? []).slice(0, 5);
  const recentWorkoutLogs = (workoutLogs ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-wide">홈</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          목표: <span className="font-medium text-black dark:text-white">{goalLabel}</span> · BMR {goal.bmr}kcal · TDEE {goal.tdee}kcal · 목표 칼로리 {goal.target_calories}kcal
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NavCard href="/profile" icon={<TargetIcon />} title="목표 설정" description="신체 정보 및 목표 재계산" />
        <NavCard href="/diet" icon={<UtensilsIcon />} title="식단 기록" description="오늘 먹은 것 기록하기" />
        <NavCard href="/workout" icon={<DumbbellIcon />} title="운동 기록" description="부위별 운동 기록하기" />
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-display text-xl tracking-wide">오늘 섭취</h2>
        <Stat label="칼로리" value={consumed.calories} target={goal.target_calories} unit="kcal" />
        <Stat label="단백질" value={consumed.proteinG} target={goal.target_protein_g} unit="g" />
        <Stat label="탄수화물" value={consumed.carbG} target={goal.target_carb_g} unit="g" />
        <Stat label="지방" value={consumed.fatG} target={goal.target_fat_g} unit="g" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide">오늘 식단 기록</h2>
          <a href="/diet" className="text-sm underline">전체보기</a>
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">음식</th>
                <th className="px-4 py-2 font-medium">칼로리</th>
                <th className="px-4 py-2 font-medium">단백질</th>
              </tr>
            </thead>
            <tbody>
              {recentDietLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                    아직 기록이 없습니다.
                  </td>
                </tr>
              )}
              {recentDietLogs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                  <td className="px-4 py-2 font-medium">{log.meal_name}</td>
                  <td className="px-4 py-2">{log.calories}kcal</td>
                  <td className="px-4 py-2">{log.protein_g}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide">오늘 운동 기록</h2>
          <a href="/workout" className="text-sm underline">전체보기</a>
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">부위</th>
                <th className="px-4 py-2 font-medium">운동</th>
                <th className="px-4 py-2 font-medium">내용</th>
              </tr>
            </thead>
            <tbody>
              {recentWorkoutLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                    아직 기록이 없습니다.
                  </td>
                </tr>
              )}
              {recentWorkoutLogs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                  <td className="px-4 py-2">{CATEGORY_LABEL[log.category] ?? log.category}</td>
                  <td className="px-4 py-2 font-medium">{log.exercise}</td>
                  <td className="px-4 py-2">
                    {log.category === 'cardio'
                      ? `${log.duration_min}분${log.distance_km ? ` · ${log.distance_km}km` : ''}`
                      : `${log.sets}세트 × ${log.reps}회 × ${log.weight_kg}kg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
