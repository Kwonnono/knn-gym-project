import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { addDietLogAction } from '@/app/actions';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DietPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const { error } = await searchParams;
  const logs = await prisma.dietLog.findMany({
    where: { userId, date: { gte: startOfToday() } },
    orderBy: { createdAt: 'desc' }
  });

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
        {logs.length === 0 && <p className="text-sm text-neutral-500">오늘 기록된 식단이 없습니다.</p>}
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between rounded border border-neutral-200 bg-white px-4 py-3 text-sm">
            <span className="font-medium">{log.mealName}</span>
            <span className="text-neutral-500">
              {log.calories}kcal · 단 {log.proteinG}g · 탄 {log.carbG}g · 지 {log.fatG}g
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
