import { Fragment } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary, type Dictionary } from '@/lib/i18n';
import { EXERCISE_PRESETS } from '@/lib/exercises';
import { WorkoutForm } from '@/components/WorkoutForm';
import { WorkoutLogTable } from '@/components/WorkoutLogTable';
import { getSetCount, getFirstSetDetail } from '@/lib/workoutVolume';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getCategories(t: Dictionary): { value: string; label: string }[] {
  return [
    { value: 'all', label: t.workout.categoryAll },
    { value: 'chest', label: t.workout.categoryChest },
    { value: 'back', label: t.workout.categoryBack },
    { value: 'shoulders', label: t.workout.categoryShoulders },
    { value: 'arms', label: t.workout.categoryArms },
    { value: 'legs', label: t.workout.categoryLegs },
    { value: 'core', label: t.workout.categoryCore },
    { value: 'cardio', label: t.workout.categoryCardio }
  ];
}

export default async function WorkoutPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; category?: string; date?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const locale = await getLocale();
  const t = getDictionary(locale);
  const CATEGORIES = getCategories(t);

  const { error, category: rawCategory, date: rawDate } = await searchParams;
  const category = CATEGORIES.some((c) => c.value === rawCategory) ? rawCategory! : 'all';
  const isAll = category === 'all';
  const isCardio = category === 'cardio';

  const todayDateKey = dateKey(new Date());
  const selectedDateKey = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayDateKey;
  const isToday = selectedDateKey === todayDateKey;
  const dayStart = new Date(`${selectedDateKey}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', dayStart.toISOString())
    .lt('date', dayEnd.toISOString());
  if (!isAll) query = query.eq('category', category);
  const { data: logs } = await query.order('created_at', { ascending: false });

  const dateSuffix = `&date=${selectedDateKey}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl tracking-wide">
        {t.workout.title}
        {!isToday && <span className="ml-2 text-base font-normal text-neutral-400">({selectedDateKey})</span>}
      </h1>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        {CATEGORIES.map((c) => (
          <a
            key={c.value}
            href={`/workout?category=${c.value}${dateSuffix}`}
            className={
              c.value === category
                ? 'rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-black'
                : 'rounded-full border border-neutral-300 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900'
            }
          >
            {c.label}
          </a>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {isAll ? (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">{t.workout.colExercise}</th>
                <th className="px-4 py-2 font-medium">{t.dashboard.content}</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                    {t.workout.noLogs}
                  </td>
                </tr>
              )}
              {CATEGORIES.filter((c) => c.value !== 'all').map((c) => {
                const catLogs = (logs ?? []).filter((log) => log.category === c.value);
                if (catLogs.length === 0) return null;
                return (
                  <Fragment key={c.value}>
                    <tr className="border-t border-neutral-100 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-900">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                      >
                        {c.label}
                      </td>
                    </tr>
                    {catLogs.map((log) => {
                      const detail = log.category === 'cardio' ? null : getFirstSetDetail(log);
                      return (
                        <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                          <td className="px-4 py-2 font-medium">{log.exercise}</td>
                          <td className="px-4 py-2">
                            {log.category === 'cardio'
                              ? t.dashboard.cardioContent(log.duration_min, log.distance_km)
                              : detail && t.dashboard.strengthContent(getSetCount(log), detail.weightKg, detail.reps)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <a href={`/workout?category=${log.category}${dateSuffix}`} className="text-xs underline">
                              {t.workout.edit}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <WorkoutForm
            category={category}
            date={selectedDateKey}
            isCardio={isCardio}
            exercisePresets={EXERCISE_PRESETS[category] ?? []}
            labels={{
              exerciseName: t.workout.exerciseName,
              selectExercise: t.workout.selectExercise,
              customExercise: t.workout.customExercise,
              durationMin: t.workout.durationMin,
              distanceKm: t.workout.distanceKm,
              reps: t.workout.reps,
              weightKg: t.workout.weightKg,
              addSet: t.workout.addSet,
              submit: t.workout.submit
            }}
          />

          <WorkoutLogTable
            logs={logs ?? []}
            category={category}
            date={selectedDateKey}
            isCardio={isCardio}
            locale={locale}
            labels={{
              colExercise: t.workout.colExercise,
              colDuration: t.workout.colDuration,
              colDistance: t.workout.colDistance,
              colTotalSets: t.workout.colTotalSets,
              colTotalVolume: t.workout.colTotalVolume,
              noLogs: t.workout.noLogs,
              edit: t.workout.edit,
              delete: t.workout.delete,
              save: t.workout.save,
              cancel: t.workout.cancel,
              confirmDelete: t.workout.confirmDelete,
              reps: t.workout.reps,
              weightKg: t.workout.weightKg,
              addSet: t.workout.addSet,
              durationMin: t.workout.durationMin,
              distanceKm: t.workout.distanceKm
            }}
          />
        </>
      )}
    </div>
  );
}
