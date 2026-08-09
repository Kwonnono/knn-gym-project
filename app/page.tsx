import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl leading-none tracking-wide">
        BULK &amp; CUT
      </h1>
      <p className="max-w-xl text-neutral-600 dark:text-neutral-400">
        신체 정보를 입력하면 목표(벌크업/커팅/유지)에 맞는 칼로리와 탄단지 목표치를 자동 계산해드립니다.
        일일 식단과 운동을 기록하고 목표 대비 진행 상황을 확인하세요.
      </p>
      <div className="flex gap-3">
        <a
          href="/signup"
          className="rounded-lg bg-black px-5 py-2.5 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          무료로 회원가입
        </a>
        <a
          href="/login"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          로그인
        </a>
      </div>
    </div>
  );
}
