import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const GOAL_LABEL: Record<string, string> = {
  cutting: '커팅',
  bulking: '벌크업',
  maintenance: '유지',
  mini_cut: '미니컷',
  mini_bulk: '미니벌크'
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  const displayName = (user.user_metadata?.name as string | undefined) ?? user.email;

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">마이페이지</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{displayName}님</p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-display text-lg tracking-wide">계정 정보</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">이름 / 닉네임</dt>
            <dd>{displayName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">이메일</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
        <a href="/settings" className="mt-3 inline-block text-sm underline">
          프로필 수정하기
        </a>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-display text-lg tracking-wide">현재 목표</h2>
        {goal ? (
          <>
            <p className="mt-2 text-sm">
              <span className="font-medium">{GOAL_LABEL[goal.goal_type as string] ?? goal.goal_type}</span>
              {' · '}목표 칼로리 {goal.target_calories}kcal
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              BMR {goal.bmr}kcal · TDEE {goal.tdee}kcal
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">아직 목표가 설정되지 않았습니다.</p>
        )}
        <a href="/profile" className="mt-3 inline-block text-sm underline">
          목표 다시 설정하기
        </a>
      </section>

      <a href="/dashboard" className="inline-block text-sm underline">
        홈으로 돌아가기
      </a>
    </div>
  );
}
