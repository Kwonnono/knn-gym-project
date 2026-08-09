import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { addWorkoutLogAction } from '@/app/actions';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function WorkoutPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const { error } = await searchParams;
  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: startOfToday() } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">오늘의 운동 기록</h1>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form action={addWorkoutLogAction} className="grid grid-cols-3 gap-3 rounded border border-neutral-200 bg-white p-4">
        <input name="exercise" placeholder="운동 이름" required className="col-span-3 rounded border border-neutral-300 px-3 py-2" />
        <input name="sets" type="number" placeholder="세트" required className="rounded border border-neutral-300 px-3 py-2" />
        <input name="reps" type="number" placeholder="횟수" required className="rounded border border-neutral-300 px-3 py-2" />
        <input name="weightKg" type="number" step="0.5" placeholder="무게 (kg)" className="rounded border border-neutral-300 px-3 py-2" />
        <button type="submit" className="col-span-3 rounded bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700">
          추가하기
        </button>
      </form>

      <div className="space-y-2">
        {logs.length === 0 && <p className="text-sm text-neutral-500">오늘 기록된 운동이 없습니다.</p>}
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between rounded border border-neutral-200 bg-white px-4 py-3 text-sm">
            <span className="font-medium">{log.exercise}</span>
            <span className="text-neutral-500">
              {log.sets}세트 × {log.reps}회 × {log.weightKg}kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
