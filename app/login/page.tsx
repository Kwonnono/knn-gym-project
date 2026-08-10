import { loginAction } from '@/app/actions';
import { getLocale, getDictionary } from '@/lib/i18n';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <h1 className="font-display text-3xl tracking-wide">{t.login.title}</h1>
      {message && (
        <p className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900">
          {message}
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      <form action={loginAction} className="space-y-3">
        <input name="email" type="email" placeholder={t.login.email} required className={inputClass} />
        <input name="password" type="password" placeholder={t.login.password} required className={inputClass} />
        <button
          type="submit"
          className="w-full rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {t.login.submit}
        </button>
      </form>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {t.login.noAccount} <a href="/signup" className="underline">{t.login.signupLink}</a>
      </p>
    </div>
  );
}
