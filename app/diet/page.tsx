import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';
import { DietForm } from '@/components/DietForm';
import { DietLogTable } from '@/components/DietLogTable';
import { QuickAddFoods } from '@/components/QuickAddFoods';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function DietPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; date?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error, date: rawDate } = await searchParams;
  const todayDateKey = dateKey(new Date());
  const selectedDateKey = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayDateKey;
  const isToday = selectedDateKey === todayDateKey;
  const dayStart = new Date(`${selectedDateKey}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data: logs } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', dayStart.toISOString())
    .lt('date', dayEnd.toISOString())
    .order('created_at', { ascending: false });

  const { data: recentLogs } = await supabase
    .from('diet_logs')
    .select('meal_name, calories, protein_g, carb_g, fat_g')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60);

  const seen = new Set<string>();
  const quickAddFoods = (recentLogs ?? [])
    .filter((log) => {
      if (seen.has(log.meal_name)) return false;
      seen.add(log.meal_name);
      return true;
    })
    .slice(0, 6)
    .map((log) => ({
      mealName: log.meal_name,
      calories: log.calories,
      proteinG: log.protein_g,
      carbG: log.carb_g,
      fatG: log.fat_g
    }));

  const locale = await getLocale();
  const t = getDictionary(locale);
  const redirectTo = `/diet?date=${selectedDateKey}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">
          {t.diet.title}
          {!isToday && <span className="ml-2 text-base font-normal text-neutral-400">({selectedDateKey})</span>}
        </h1>
        <a href="/diet/history" className="text-sm underline">
          {t.diet.viewCalendar}
        </a>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <QuickAddFoods foods={quickAddFoods} date={selectedDateKey} redirectTo={redirectTo} title={t.diet.quickAddTitle} />

      <DietForm
        date={selectedDateKey}
        redirectTo={redirectTo}
        logCount={(logs ?? []).length}
        labels={{
          mealName: t.diet.mealName,
          mealNumberLabel: t.diet.mealNumberLabel,
          mealNumbers: t.diet.mealNumbers,
          gramsLabel: t.diet.gramsLabel,
          calories: t.diet.calories,
          protein: t.diet.protein,
          carb: t.diet.carb,
          fat: t.diet.fat,
          submit: t.diet.submit
        }}
      />

      <DietLogTable
        logs={logs ?? []}
        redirectTo={redirectTo}
        labels={{
          colFood: t.diet.colFood,
          colCalories: t.diet.colCalories,
          colProtein: t.diet.colProtein,
          colCarb: t.diet.colCarb,
          colFat: t.diet.colFat,
          noLogs: t.diet.noLogs,
          edit: t.diet.edit,
          delete: t.diet.delete,
          save: t.diet.save,
          cancel: t.diet.cancel,
          confirmDelete: t.diet.confirmDelete,
          mealNumberLabel: t.diet.mealNumberLabel,
          mealNumbers: t.diet.mealNumbers,
          unclassifiedMeal: t.diet.unclassifiedMeal
        }}
      />
    </div>
  );
}
