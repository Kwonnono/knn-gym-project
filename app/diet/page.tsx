import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addDietLogAction } from '@/app/actions';

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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">오늘의 식단 기록</h1>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form action={addDietLogAction} className="grid grid-cols-2 gap-3 rounded border border-neutral-200 bg-white p-4">
        <input name="mealName" placeholder="음식 이름" required className="col-span-2 rounded border border-neutral-300 px-3 py-2" />
        <input name="calories" type="number" placeholder="칼로리 (kcal)" required className="rounded border border-neutral-300 px-3 py-2" />
        <input name="proteinG" type="number" placeholder="단백질 (g)" className="rounded border border-neutral-300 px-3 py-2" />
        <input name="carbG" type="number" placeholder="탄수화물 (g)" className="rounded border border-neutral-300 px-3 py-2" />
        <input name="fatG" type="number" placeholder="지방 (g)" className="rounded border border-neutral-300 px-3 py-2" />
        <button type="submit" className="col-span-2 rounded bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700">
          추가하기
        </button>
      </form>

      <div className="space-y-2">
        {(!logs || logs.length === 0) && <p className="text-sm text-neutral-500">오늘 기록된 식단이 없습니다.</p>}
        {(logs ?? []).map((log) => (
          <div key={log.id} className="flex justify-between rounded border border-neutral-200 bg-white px-4 py-3 text-sm">
            <span className="font-medium">{log.meal_name}</span>
            <span className="text-neutral-500">
              {log.calories}kcal · 단 {log.protein_g}g · 탄 {log.carb_g}g · 지 {log.fat_g}g
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
