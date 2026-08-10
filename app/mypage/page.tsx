import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  const displayName = (user.user_metadata?.name as string | undefined) ?? user.email;
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t.mypage.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{displayName}</p>
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
