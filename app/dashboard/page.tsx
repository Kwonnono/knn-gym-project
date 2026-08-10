import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TargetIcon } from '@/components/icons';
import { ProgressBar } from '@/components/ProgressBar';
import { getLocale, getDictionary, type Dictionary } from '@/lib/i18n';
import { getSetCount, getTotalVolume } from '@/lib/workoutVolume';
import { calculateWeeklyCurriculum, type WeightChangeSpeed } from '@/lib/calc';

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
  const recentDietLogs = (dietLogs ?? []).slice(0, 5);
  const recentWorkoutLogs = (workoutLogs ?? []).slice(0, 5);

  const withinTolerance = (value: number, target: number) => target > 0 && value / target >= 0.95 && value / target <= 1.1;
  const goalAchieved =
    (dietLogs ?? []).length > 0 &&
    withinTolerance(consumed.calories, goal.target_calories) &&
    withinTolerance(consumed.proteinG, goal.target_protein_g) &&
    withinTolerance(consumed.carbG, goal.target_carb_g) &&
    withinTolerance(consumed.fatG, goal.target_fat_g);

  const weeklyTarget = (() => {
    if (!goal.duration_weeks) return null;
    const curriculum = calculateWeeklyCurriculum(
      {
        heightCm: goal.height_cm,
        weightKg: goal.weight_kg,
        age: goal.age,
        sex: goal.sex,
        activityLevel: goal.activity_level,
        goalType: goal.goal_type,
        weightChangeSpeed: (goal.weight_change_speed as WeightChangeSpeed) ?? 'normal'
      },
      goal.duration_weeks
    );
    const daysSinceStart = Math.floor((Date.now() - new Date(goal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(goal.duration_weeks, Math.max(1, Math.floor(daysSinceStart / 7) + 1));
    return curriculum.find((c) => c.week === currentWeek) ?? null;
  })();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-4xl tracking-wide">{t.dashboard.title}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t.dashboard.goalLine(goalLabel, goal.bmr, goal.target_calories)}
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
                  {recentDietLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                        {t.dashboard.noLogsYet}
                      </td>
                    </tr>
                  )}
                  {recentDietLogs.map((log) => (
                    <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                      <td className="px-4 py-2 font-medium">{log.meal_name}</td>
                      <td className="px-4 py-2">{log.calories}kcal</td>
                      <td className="px-4 py-2">{log.protein_g}g</td>
                      <td className="px-4 py-2">{log.carb_g}g</td>
                      <td className="px-4 py-2">{log.fat_g}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 우측 컬럼 (40%) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/diet"
              className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-neutral-300 hover:shadow dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
            >
              <p className="font-display text-2xl tracking-wide">+</p>
              <p className="mt-1 text-sm font-medium">{t.dashboard.navDietTitle}</p>
            </a>
            <a
              href="/workout"
              className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-neutral-300 hover:shadow dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
            >
              <p className="font-display text-2xl tracking-wide">+</p>
              <p className="mt-1 text-sm font-medium">{t.dashboard.navWorkoutTitle}</p>
            </a>
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
                          : t.dashboard.strengthContent(getSetCount(log), getTotalVolume(log))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {weeklyTarget && (
            <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <h2 className="font-display text-lg tracking-wide">{t.dashboard.weeklyCurriculumTitle(weeklyTarget.week)}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t.dashboard.calories} {weeklyTarget.targetCalories}kcal · {t.dashboard.protein} {weeklyTarget.targetProteinG}g ·{' '}
                {t.dashboard.carb} {weeklyTarget.targetCarbG}g · {t.dashboard.fat} {weeklyTarget.targetFatG}g
              </p>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            {t.dashboard.weightGraphComingSoon}
          </div>
        </div>
      </div>
    </div>
  );
}
