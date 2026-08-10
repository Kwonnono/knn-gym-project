import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addDietLogAction } from '@/app/actions';
import { getLocale, getDictionary } from '@/lib/i18n';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function DietPage({
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
    .from('diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startOfToday())
    .order('created_at', { ascending: false });

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide">{t.diet.title}</h1>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <form
        action={addDietLogAction}
        className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <input name="mealName" placeholder={t.diet.mealName} required className={`col-span-2 ${inputClass}`} />
        <input name="calories" type="number" placeholder={t.diet.calories} required className={inputClass} />
        <input name="proteinG" type="number" placeholder={t.diet.protein} className={inputClass} />
        <input name="carbG" type="number" placeholder={t.diet.carb} className={inputClass} />
        <input name="fatG" type="number" placeholder={t.diet.fat} className={inputClass} />
        <button
          type="submit"
          className="col-span-2 rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {t.diet.submit}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-2 font-medium">{t.diet.colFood}</th>
              <th className="px-4 py-2 font-medium">{t.diet.colCalories}</th>
              <th className="px-4 py-2 font-medium">{t.diet.colProtein}</th>
              <th className="px-4 py-2 font-medium">{t.diet.colCarb}</th>
              <th className="px-4 py-2 font-medium">{t.diet.colFat}</th>
            </tr>
          </thead>
          <tbody>
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                  {t.diet.noLogs}
                </td>
              </tr>
            )}
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-2 font-medium">{log.meal_name}</td>
                <td className="px-4 py-2">{log.calories}kcal</td>
                <td className="px-4 py-2">{log.protein_g}g</td>
                <td className="px-4 py-2">{log.carb_g}g</td>
                <td className="px-4 py-2">{log.fat_g}g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
