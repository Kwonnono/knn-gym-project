import { signupAction } from '@/app/actions';
import { getLocale, getDictionary } from '@/lib/i18n';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <h1 className="font-display text-3xl tracking-wide">{t.signup.title}</h1>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      <form action={signupAction} className="space-y-3">
        <input name="name" placeholder={t.signup.name} required className={inputClass} />
        <input name="email" type="email" placeholder={t.signup.email} required className={inputClass} />
        <div>
          <input
            name="password"
            type="password"
            placeholder={t.signup.password}
            required
            minLength={8}
            maxLength={64}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t.signup.passwordHint}</p>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {t.signup.submit}
        </button>
      </form>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {t.signup.haveAccount} <a href="/login" className="underline">{t.signup.loginLink}</a>
      </p>
    </div>
  );
}
