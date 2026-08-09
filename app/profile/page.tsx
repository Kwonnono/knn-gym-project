import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { saveGoalAction } from '@/app/actions';

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const { error } = await searchParams;
  const goal = await prisma.goal.findUnique({ where: { userId } });

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">목표 설정</h1>
      <p className="text-sm text-neutral-500">
        신체 정보와 목표를 입력하면 일일 칼로리 및 탄단지 목표치를 자동 계산합니다.
      </p>
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={saveGoalAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            키 (cm)
            <input name="heightCm" type="number" step="0.1" required defaultValue={goal?.heightCm} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            몸무게 (kg)
            <input name="weightKg" type="number" step="0.1" required defaultValue={goal?.weightKg} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            나이
            <input name="age" type="number" required defaultValue={goal?.age} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            성별
            <select name="sex" required defaultValue={goal?.sex ?? ''} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2">
              <option value="" disabled>선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          활동량
          <select name="activityLevel" required defaultValue={goal?.activityLevel ?? ''} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2">
            <option value="" disabled>선택</option>
            <option value="sedentary">거의 안 움직임 (사무직, 운동 안 함)</option>
            <option value="light">가벼운 활동 (주 1-3회 운동)</option>
            <option value="moderate">보통 활동 (주 3-5회 운동)</option>
            <option value="active">활발한 활동 (주 6-7회 운동)</option>
            <option value="very_active">매우 활발 (매일 강도 높은 운동/육체노동)</option>
          </select>
        </label>
        <label className="block text-sm">
          목표
          <select name="goalType" required defaultValue={goal?.goalType ?? ''} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2">
            <option value="" disabled>선택</option>
            <option value="cutting">커팅 (체지방 감량)</option>
            <option value="bulking">벌크업 (근육량 증가)</option>
            <option value="maintenance">유지</option>
          </select>
        </label>
        <button type="submit" className="w-full rounded bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700">
          목표 계산하기
        </button>
      </form>
    </div>
  );
}
