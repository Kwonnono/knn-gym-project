import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary, type Dictionary } from '@/lib/i18n';
import { EXERCISE_PRESETS } from '@/lib/exercises';
import { WorkoutForm } from '@/components/WorkoutForm';
import { WorkoutLogTable } from '@/components/WorkoutLogTable';

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
          reps: t.workout.reps,
          weightKg: t.workout.weightKg,
          addSet: t.workout.addSet,
          submit: t.workout.submit
        }}
      />

      <WorkoutLogTable
        logs={logs ?? []}
        category={category}
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
    </div>
  );
}
