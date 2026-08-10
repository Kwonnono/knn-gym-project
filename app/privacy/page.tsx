import { getLocale, getDictionary } from '@/lib/i18n';

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-display text-3xl tracking-wide">{t.privacy.title}</h1>
      <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
        {t.privacy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <a href="/signup" className="inline-block text-sm underline">
        {t.legal.back}
      </a>
    </div>
  );
}
