import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addWeightLogAction } from '@/app/actions';
import { getLocale, getDictionary } from '@/lib/i18n';
import { WeightLogTable } from '@/components/WeightLogTable';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export default async function WeightPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await searchParams;
  const { data: logs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl tracking-wide">{t.weight.title}</h1>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <form
        action={addWeightLogAction}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <input name="weightKg" type="number" step="0.1" placeholder={t.weight.weightLabel} required className={inputClass} />
        <button
          type="submit"
          className="rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {t.weight.submit}
        </button>
      </form>

      <WeightLogTable
        logs={logs ?? []}
        locale={locale}
        labels={{
          colDate: t.weight.colDate,
          colWeight: t.weight.colWeight,
          noLogs: t.weight.noLogs,
          edit: t.weight.edit,
          delete: t.weight.delete,
          save: t.weight.save,
          cancel: t.weight.cancel,
          confirmDelete: t.weight.confirmDelete
        }}
      />
    </div>
  );
}
