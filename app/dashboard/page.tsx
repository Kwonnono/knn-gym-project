import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TargetIcon, UtensilsIcon, DumbbellIcon } from '@/components/icons';
import { getLocale, getDictionary, type Dictionary } from '@/lib/i18n';

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

function categoryLabel(t: Dictionary, category: string): string {
  const map: Record<string, string> = {
    chest: t.workout.categoryChest,
    back: t.workout.categoryBack,
    shoulders: t.workout.categoryShoulders,
    arms: t.workout.categoryArms,
    legs: t.workout.categoryLegs,
    core: t.workout.categoryCore,
    cardio: t.workout.categoryCardio
  };
  return map[category] ?? category;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  if (!goal) redirect('/profile');

  const locale = await getLocale();
  const t = getDictionary(locale);

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

  const goalLabel = t.goalLabels[goal.goal_type as keyof typeof t.goalLabels] ?? goal.goal_type;
  const recentDietLogs = (dietLogs ?? []).slice(0, 5);
  const recentWorkoutLogs = (workoutLogs ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-wide">{t.dashboard.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t.dashboard.goalLine(goalLabel, goal.bmr, goal.tdee, goal.target_calories)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NavCard href="/profile" icon={<TargetIcon />} title={t.dashboard.navGoalTitle} description={t.dashboard.navGoalDesc} />
        <NavCard href="/diet" icon={<UtensilsIcon />} title={t.dashboard.navDietTitle} description={t.dashboard.navDietDesc} />
        <NavCard href="/workout" icon={<DumbbellIcon />} title={t.dashboard.navWorkoutTitle} description={t.dashboard.navWorkoutDesc} />
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-display text-xl tracking-wide">{t.dashboard.todayIntake}</h2>
        <Stat label={t.dashboard.calories} value={consumed.calories} target={goal.target_calories} unit="kcal" />
        <Stat label={t.dashboard.protein} value={consumed.proteinG} target={goal.target_protein_g} unit="g" />
        <Stat label={t.dashboard.carb} value={consumed.carbG} target={goal.target_carb_g} unit="g" />
        <Stat label={t.dashboard.fat} value={consumed.fatG} target={goal.target_fat_g} unit="g" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide">{t.dashboard.todayDietLog}</h2>
          <a href="/diet" className="text-sm underline">{t.dashboard.viewAll}</a>
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">{t.dashboard.food}</th>
                <th className="px-4 py-2 font-medium">{t.dashboard.calories}</th>
                <th className="px-4 py-2 font-medium">{t.dashboard.protein}</th>
              </tr>
            </thead>
            <tbody>
              {recentDietLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                    {t.dashboard.noLogsYet}
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
          <h2 className="font-display text-xl tracking-wide">{t.dashboard.todayWorkoutLog}</h2>
          <a href="/workout" className="text-sm underline">{t.dashboard.viewAll}</a>
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">{t.dashboard.part}</th>
                <th className="px-4 py-2 font-medium">{t.dashboard.exercise}</th>
                <th className="px-4 py-2 font-medium">{t.dashboard.content}</th>
              </tr>
            </thead>
            <tbody>
              {recentWorkoutLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                    {t.dashboard.noLogsYet}
                  </td>
                </tr>
              )}
              {recentWorkoutLogs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                  <td className="px-4 py-2">{categoryLabel(t, log.category)}</td>
                  <td className="px-4 py-2 font-medium">{log.exercise}</td>
                  <td className="px-4 py-2">
                    {log.category === 'cardio'
                      ? t.dashboard.cardioContent(log.duration_min, log.distance_km)
                      : t.dashboard.strengthContent(log.sets, log.reps, log.weight_kg)}
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
