import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addWorkoutLogAction } from '@/app/actions';

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'chest', label: '가슴' },
  { value: 'back', label: '등' },
  { value: 'shoulders', label: '어깨' },
  { value: 'arms', label: '팔' },
  { value: 'legs', label: '하체' },
  { value: 'core', label: '코어' },
  { value: 'cardio', label: '유산소' }
];

const inputClass =
  'rounded border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900';

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
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide">오늘의 운동 기록</h1>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        {CATEGORIES.map((c) => (
          <a
            key={c.value}
            href={`/workout?category=${c.value}`}
            className={
              c.value === category
                ? 'rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black'
                : 'rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900'
            }
          >
            {c.label}
          </a>
        ))}
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <form
        action={addWorkoutLogAction}
        className="grid grid-cols-3 gap-3 rounded border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <input type="hidden" name="category" value={category} />
        <input name="exercise" placeholder="운동 이름" required className={`col-span-3 ${inputClass}`} />
        {isCardio ? (
          <>
            <input name="durationMin" type="number" placeholder="시간 (분)" required className={inputClass} />
            <input name="distanceKm" type="number" step="0.1" placeholder="거리 (km, 선택)" className={`col-span-2 ${inputClass}`} />
          </>
        ) : (
          <>
            <input name="sets" type="number" placeholder="세트" required className={inputClass} />
            <input name="reps" type="number" placeholder="횟수" required className={inputClass} />
            <input name="weightKg" type="number" step="0.5" placeholder="무게 (kg)" className={inputClass} />
          </>
        )}
        <button
          type="submit"
          className="col-span-3 rounded bg-black px-3 py-2 font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          추가하기
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            {isCardio ? (
              <tr>
                <th className="px-4 py-2 font-medium">운동</th>
                <th className="px-4 py-2 font-medium">시간</th>
                <th className="px-4 py-2 font-medium">거리</th>
              </tr>
            ) : (
              <tr>
                <th className="px-4 py-2 font-medium">운동</th>
                <th className="px-4 py-2 font-medium">세트</th>
                <th className="px-4 py-2 font-medium">횟수</th>
                <th className="px-4 py-2 font-medium">무게</th>
              </tr>
            )}
          </thead>
          <tbody>
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={isCardio ? 3 : 4} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                  오늘 기록된 운동이 없습니다.
                </td>
              </tr>
            )}
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-2 font-medium">{log.exercise}</td>
                {isCardio ? (
                  <>
                    <td className="px-4 py-2">{log.duration_min}분</td>
                    <td className="px-4 py-2">{log.distance_km ? `${log.distance_km}km` : '-'}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{log.sets}세트</td>
                    <td className="px-4 py-2">{log.reps}회</td>
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
