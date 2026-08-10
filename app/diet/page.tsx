import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';
import { DietForm } from '@/components/DietForm';
import { DietLogTable } from '@/components/DietLogTable';

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
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl tracking-wide">{t.diet.title}</h1>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <DietForm
        labels={{
          mealName: t.diet.mealName,
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
        redirectTo="/diet"
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
          confirmDelete: t.diet.confirmDelete
        }}
      />
    </div>
  );
}
