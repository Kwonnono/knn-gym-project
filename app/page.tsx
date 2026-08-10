import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-5xl leading-none tracking-wide">
        BULK &amp; CUT
      </h1>
      <p className="max-w-xl text-neutral-600 dark:text-neutral-400">{t.landing.description}</p>
      <div className="flex gap-3">
        <a
          href="/signup"
          className="rounded-lg bg-black px-5 py-2.5 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {t.landing.ctaSignup}
        </a>
        <a
          href="/login"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {t.landing.ctaLogin}
        </a>
      </div>
    </div>
  );
}
