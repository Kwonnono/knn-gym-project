import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveGoalAction } from '@/app/actions';

const inputClass =
  'mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export default async function ProfilePage({
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
  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();

  return (
    <div className="mx-auto max-w-md space-y-5">
      <h1 className="font-display text-3xl tracking-wide">목표 설정</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        신체 정보와 목표를 입력하면 일일 칼로리 및 탄단지 목표치를 자동 계산합니다.
      </p>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      <form action={saveGoalAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            키 (cm)
            <input name="heightCm" type="number" step="0.1" required defaultValue={goal?.height_cm} className={inputClass} />
          </label>
          <label className="text-sm">
            몸무게 (kg)
            <input name="weightKg" type="number" step="0.1" required defaultValue={goal?.weight_kg} className={inputClass} />
          </label>
          <label className="text-sm">
            나이
            <input name="age" type="number" required defaultValue={goal?.age} className={inputClass} />
          </label>
          <label className="text-sm">
            성별
            <select name="sex" required defaultValue={goal?.sex ?? ''} className={inputClass}>
              <option value="" disabled>선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          활동량
          <select name="activityLevel" required defaultValue={goal?.activity_level ?? ''} className={inputClass}>
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
          <select name="goalType" required defaultValue={goal?.goal_type ?? ''} className={inputClass}>
            <option value="" disabled>선택</option>
            <option value="cutting">커팅 (체지방 감량)</option>
            <option value="bulking">벌크업 (근육량 증가)</option>
            <option value="maintenance">유지</option>
            <option value="mini_cut">미니컷 (2~4주 단기 강한 커팅)</option>
            <option value="mini_bulk">미니벌크 (2~4주 단기 강한 벌크업)</option>
          </select>
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          목표 계산하기
        </button>
      </form>
    </div>
  );
}
