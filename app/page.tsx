import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">벌크업/커팅 식단 & 루틴 관리</h1>
      <p className="text-neutral-600">
        신체 정보를 입력하면 목표(벌크업/커팅/유지)에 맞는 칼로리와 탄단지 목표치를 자동 계산해드립니다.
        일일 식단과 운동을 기록하고 목표 대비 진행 상황을 확인하세요.
      </p>
      <div className="flex gap-3">
        <a href="/signup" className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700">
          무료로 시작하기
        </a>
        <a href="/login" className="rounded border border-neutral-300 px-4 py-2 hover:bg-neutral-100">
          로그인
        </a>
      </div>
    </div>
  );
}
