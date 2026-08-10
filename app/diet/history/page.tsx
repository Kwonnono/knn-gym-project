import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';
import { Calendar } from '@/components/Calendar';
import { DietLogTable } from '@/components/DietLogTable';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default async function DietHistoryPage({
  searchParams
}: {
  searchParams: Promise<{ year?: string; month?: string; date?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await searchParams;
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const todayDate = `${todayYear}-${pad(todayMonth)}-${pad(now.getDate())}`;

  const year = Number(params.year) || todayYear;
  const month = Number(params.month) || todayMonth;
  const isValidDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date);
  const selectedDate = isValidDate
    ? params.date!
    : year === todayYear && month === todayMonth
      ? todayDate
      : `${year}-${pad(month)}-01`;

  const locale = await getLocale();
  const t = getDictionary(locale);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const dayStart = new Date(`${selectedDate}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data: monthLogs } = await supabase
    .from('diet_logs')
    .select('date')
    .eq('user_id', user.id)
    .gte('date', monthStart.toISOString())
    .lt('date', monthEnd.toISOString());

  const activeDates = new Set((monthLogs ?? []).map((l) => new Date(l.date).toISOString().slice(0, 10)));

  const { data: dayLogs } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', dayStart.toISOString())
    .lt('date', dayEnd.toISOString())
    .order('created_at', { ascending: false });

  const redirectTo = `/diet/history?year=${year}&month=${month}&date=${selectedDate}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">{t.diet.viewCalendar}</h1>
        <a href="/diet" className="text-sm underline">
          {t.diet.title}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
        <Calendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          activeDates={activeDates}
          basePath="/diet/history"
          weekdayLabels={t.diet.calendarWeekdays}
        />
        <div className="space-y-3">
          <h2 className="font-display text-xl tracking-wide">{selectedDate}</h2>
          <DietLogTable
            logs={dayLogs ?? []}
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
              confirmDelete: t.diet.confirmDelete
            }}
          />
        </div>
      </div>
    </div>
  );
}
