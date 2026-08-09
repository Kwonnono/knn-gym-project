import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { logoutAction } from '@/app/actions';
import './globals.css';

export const metadata: Metadata = {
  title: 'KNN Fit',
  description: '개인 맞춤형 식단/루틴 관리 플랫폼'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="ko">
      <body>
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <a href="/" className="text-lg font-bold">KNN Fit</a>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <a href="/dashboard" className="hover:underline">대시보드</a>
                <a href="/profile" className="hover:underline">목표 설정</a>
                <a href="/diet" className="hover:underline">식단 기록</a>
                <a href="/workout" className="hover:underline">운동 기록</a>
                <span className="text-neutral-500">{user.name}님</span>
                <form action={logoutAction}>
                  <button type="submit" className="text-neutral-500 hover:underline">로그아웃</button>
                </form>
              </>
            ) : (
              <>
                <a href="/login" className="hover:underline">로그인</a>
                <a href="/signup" className="rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700">회원가입</a>
              </>
            )}
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
