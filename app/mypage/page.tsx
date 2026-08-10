import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';

function toDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function computeStreakDays(dietDates: { date: string }[], workoutDates: { date: string }[]): number {
  const activeDays = new Set<string>();
  for (const row of dietDates) activeDays.add(toDateKey(row.date));
  for (const row of workoutDates) activeDays.add(toDateKey(row.date));

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  const { data: dietDates } = await supabase.from('diet_logs').select('date').eq('user_id', user.id);
  const { data: workoutDates } = await supabase.from('workout_logs').select('date').eq('user_id', user.id);
  const streakDays = computeStreakDays(dietDates ?? [], workoutDates ?? []);
  const displayName = (user.user_metadata?.name as string | undefined) ?? user.email;
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t.mypage.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{displayName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="font-display text-3xl tracking-wide">{streakDays}</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.mypage.streakDays}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium dark:bg-neutral-900">
            {t.mypage.freePlan}
          </span>
          <button
            type="button"
            disabled
            className="mt-2 block w-full cursor-not-allowed rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-600"
          >
            {t.mypage.proComingSoon}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-display text-lg tracking-wide">{t.mypage.accountInfo}</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">{t.mypage.nameLabel}</dt>
            <dd>{displayName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">{t.mypage.emailLabel}</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
        <a href="/settings" className="mt-3 inline-block text-sm underline">
          {t.mypage.editProfile}
        </a>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-display text-lg tracking-wide">{t.mypage.currentGoal}</h2>
        {goal ? (
          <>
            <p className="mt-2 text-sm">
              <span className="font-medium">{t.goalLabels[goal.goal_type as keyof typeof t.goalLabels] ?? goal.goal_type}</span>
              {' · '}{t.mypage.targetCalories} {goal.target_calories}kcal
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              BMR {goal.bmr}kcal · TDEE {goal.tdee}kcal
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{t.mypage.noGoal}</p>
        )}
        <a href="/profile" className="mt-3 inline-block text-sm underline">
          {t.mypage.resetGoal}
        </a>
      </section>

      <a href="/dashboard" className="inline-block text-sm underline">
        {t.mypage.backHome}
      </a>
    </div>
  );
}
