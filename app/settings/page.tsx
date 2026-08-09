import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateProfileAction, logoutAction } from '@/app/actions';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error, message } = await searchParams;
  const displayName = (user.user_metadata?.name as string | undefined) ?? '';

  return (
    <div className="mx-auto max-w-md space-y-8">
      <h1 className="font-display text-3xl tracking-wide">설정</h1>

      {message && (
        <p className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900">
          {message}
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <section className="space-y-3">
        <h2 className="font-display text-xl tracking-wide">프로필</h2>
        <form action={updateProfileAction} className="space-y-3">
          <label className="block text-sm">
            이름 또는 닉네임
            <input name="name" defaultValue={displayName} required className={`mt-1 ${inputClass}`} />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            저장
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl tracking-wide">계정</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">이메일: {user.email}</p>
      </section>

      <section className="space-y-2 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-neutral-500 underline hover:text-black dark:text-neutral-400 dark:hover:text-white">
            로그아웃
          </button>
        </form>
      </section>
    </div>
  );
}
