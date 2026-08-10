import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary, type Dictionary } from '@/lib/i18n';
import { EXERCISE_PRESETS } from '@/lib/exercises';
import { WorkoutForm } from '@/components/WorkoutForm';

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getCategories(t: Dictionary): { value: string; label: string }[] {
  return [
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
  searchParams: Promise<{ error?: string; category?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const locale = await getLocale();
  const t = getDictionary(locale);
  const CATEGORIES = getCategories(t);

  const { error, category: rawCategory } = await searchParams;
  const category = CATEGORIES.some((c) => c.value === rawCategory) ? rawCategory! : 'chest';
  const isCardio = category === 'cardio';

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .gte('date', startOfToday())
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl tracking-wide">{t.workout.title}</h1>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        {CATEGORIES.map((c) => (
          <a
            key={c.value}
            href={`/workout?category=${c.value}`}
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

      <WorkoutForm
        category={category}
        isCardio={isCardio}
        exercisePresets={EXERCISE_PRESETS[category] ?? []}
        labels={{
          exerciseName: t.workout.exerciseName,
          selectExercise: t.workout.selectExercise,
          customExercise: t.workout.customExercise,
          durationMin: t.workout.durationMin,
          distanceKm: t.workout.distanceKm,
          sets: t.workout.sets,
          reps: t.workout.reps,
          weightKg: t.workout.weightKg,
          submit: t.workout.submit
        }}
      />

      <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            {isCardio ? (
              <tr>
                <th className="px-4 py-2 font-medium">{t.workout.colExercise}</th>
                <th className="px-4 py-2 font-medium">{t.workout.colDuration}</th>
                <th className="px-4 py-2 font-medium">{t.workout.colDistance}</th>
              </tr>
            ) : (
              <tr>
                <th className="px-4 py-2 font-medium">{t.workout.colExercise}</th>
                <th className="px-4 py-2 font-medium">{t.workout.colSets}</th>
                <th className="px-4 py-2 font-medium">{t.workout.colReps}</th>
                <th className="px-4 py-2 font-medium">{t.workout.colWeight}</th>
              </tr>
            )}
          </thead>
          <tbody>
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={isCardio ? 3 : 4} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                  {t.workout.noLogs}
                </td>
              </tr>
            )}
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-2 font-medium">{log.exercise}</td>
                {isCardio ? (
                  <>
                    <td className="px-4 py-2">{log.duration_min}{locale === 'ko' ? '분' : 'min'}</td>
                    <td className="px-4 py-2">{log.distance_km ? `${log.distance_km}km` : '-'}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{log.sets}{locale === 'ko' ? '세트' : ''}</td>
                    <td className="px-4 py-2">{log.reps}{locale === 'ko' ? '회' : ''}</td>
                    <td className="px-4 py-2">{log.weight_kg}kg</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
