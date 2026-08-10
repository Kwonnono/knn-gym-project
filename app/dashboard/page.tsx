import { Fragment } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TargetIcon } from '@/components/icons';
import { ProgressBar } from '@/components/ProgressBar';
import { getLocale, getDictionary, type Dictionary } from '@/lib/i18n';
import { getSetCount, getFirstSetDetail } from '@/lib/workoutVolume';
import { WeightChart } from '@/components/WeightChart';
import { groupDietLogsByMeal } from '@/lib/mealGroups';

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString())
    .order('date', { ascending: true });
  const weightPoints = (weightLogs ?? []).map((log) => ({ date: log.date, weightKg: log.weight_kg }));

  const consumed = (dietLogs ?? []).reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      proteinG: acc.proteinG + log.protein_g,
      carbG: acc.carbG + log.carb_g,
      fatG: acc.fatG + log.fat_g
    }),
    { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }
  );

  const remainingCalories = goal.target_calories - consumed.calories;
  const goalLabel = t.goalLabels[goal.goal_type as keyof typeof t.goalLabels] ?? goal.goal_type;
  const dietMealGroups = groupDietLogsByMeal(dietLogs ?? []);
  const recentWorkoutLogs = (workoutLogs ?? []).slice(0, 5);

  const withinTolerance = (value: number, target: number) => target > 0 && value / target >= 0.95 && value / target <= 1.1;
  const goalAchieved =
    (dietLogs ?? []).length > 0 &&
    withinTolerance(consumed.calories, goal.target_calories) &&
    withinTolerance(consumed.proteinG, goal.target_protein_g) &&
    withinTolerance(consumed.carbG, goal.target_carb_g) &&
    withinTolerance(consumed.fatG, goal.target_fat_g);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-4xl tracking-wide">{t.dashboard.title}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t.dashboard.goalLine(
              goalLabel,
              goal.bmr,
              goal.target_calories,
              goal.target_protein_g,
              goal.target_carb_g,
              goal.target_fat_g
            )}
          </p>
        </div>
        <a
          href="/profile"
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          <TargetIcon className="h-4 w-4" />
          {t.dashboard.navGoalTitle}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 좌측 컬럼 (60%) */}
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide">{t.dashboard.todayIntake}</h2>
              {goalAchieved && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {t.dashboard.goalAchieved}
                </span>
              )}
            </div>

            <div className="rounded-lg bg-neutral-50 py-5 text-center dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.dashboard.remainingCalories}</p>
              <p className="font-display text-5xl tracking-wide text-blue-600 dark:text-blue-400">
                {remainingCalories}
                <span className="ml-1 text-xl">kcal</span>
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {consumed.calories}kcal / {goal.target_calories}kcal
              </p>
            </div>

            <div className="space-y-3">
              <ProgressBar label={t.dashboard.protein} value={consumed.proteinG} target={goal.target_protein_g} unit="g" color="rose" />
              <ProgressBar label={t.dashboard.carb} value={consumed.carbG} target={goal.target_carb_g} unit="g" color="emerald" />
              <ProgressBar label={t.dashboard.fat} value={consumed.fatG} target={goal.target_fat_g} unit="g" color="amber" />
            </div>
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
                    <th className="px-4 py-2 font-medium">{t.dashboard.carb}</th>
                    <th className="px-4 py-2 font-medium">{t.dashboard.fat}</th>
                  </tr>
                </thead>
                <tbody>
                  {(dietLogs ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                        {t.dashboard.noLogsYet}
                      </td>
                    </tr>
                  )}
                  {dietMealGroups.map((group) => (
                    <Fragment key={`group-${group.mealNumber ?? 'none'}`}>
                      <tr className="border-t border-neutral-100 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-900">
                        <td
                          colSpan={5}
                          className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                        >
                          {group.mealNumber === null
                            ? t.diet.unclassifiedMeal
                            : t.diet.mealNumbers[group.mealNumber - 1] ?? t.diet.unclassifiedMeal}
                        </td>
                      </tr>
                      {group.logs.map((log) => (
                        <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                          <td className="px-4 py-2 font-medium">{log.meal_name}</td>
                          <td className="px-4 py-2">{log.calories}kcal</td>
                          <td className="px-4 py-2">{log.protein_g}g</td>
                          <td className="px-4 py-2">{log.carb_g}g</td>
                          <td className="px-4 py-2">{log.fat_g}g</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 우측 컬럼 (40%) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
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
                  {recentWorkoutLogs.map((log) => {
                    const setDetail = log.category === 'cardio' ? null : getFirstSetDetail(log);
                    return (
                      <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                        <td className="px-4 py-2">{categoryLabel(t, log.category)}</td>
                        <td className="px-4 py-2 font-medium">{log.exercise}</td>
                        <td className="px-4 py-2">
                          {log.category === 'cardio'
                            ? t.dashboard.cardioContent(log.duration_min, log.distance_km)
                            : setDetail && t.dashboard.strengthContent(getSetCount(log), setDetail.weightKg, setDetail.reps)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="font-display text-lg tracking-wide">{t.dashboard.weightChartTitle}</h2>
              <a href="/weight" className="text-sm underline">{t.dashboard.viewAll}</a>
            </div>
            <div className="mt-2 flex min-h-0 flex-1 flex-col items-center justify-center px-0.5 pb-0.5">
              {weightPoints.length > 0 ? (
                <WeightChart points={weightPoints} locale={locale} />
              ) : (
                <p className="flex h-full min-h-[100px] items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  {t.dashboard.noWeightLogs}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
