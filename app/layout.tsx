import type { Metadata } from 'next';
import { Bebas_Neue, Black_Han_Sans, Inter, Noto_Sans_KR } from 'next/font/google';
import { getCurrentUser } from '@/lib/supabase/server';
import { logoutAction } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HomeIcon, TargetIcon, UtensilsIcon, DumbbellIcon, UserIcon, SettingsIcon } from '@/components/icons';
import './globals.css';

// Bebas Neue/Inter는 라틴 문자만 지원하므로, 같은 톤의 한글 전용 폰트를 폴백으로 묶어 씁니다.
const displayFont = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const displayFontKr = Black_Han_Sans({ subsets: ['latin'], weight: '400', variable: '--font-display-kr' });
const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body' });
const bodyFontKr = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body-kr' });

export const metadata: Metadata = {
  title: 'Bulk & Cut',
  description: '개인 맞춤형 식단/루틴 관리 플랫폼'
};

const THEME_INIT_SCRIPT = `
(function () {
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email;

  return (
    <html lang="ko" className={`${displayFont.variable} ${displayFontKr.variable} ${bodyFont.variable} ${bodyFontKr.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-black">
          <a href={user ? '/dashboard' : '/'} className="flex flex-col items-center gap-0.5 leading-none">
            <svg width="30" height="14" viewBox="0 0 34 16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <rect x="1" y="5" width="3" height="6" />
              <rect x="6" y="3" width="2.5" height="10" />
              <line x1="9" y1="8" x2="25" y2="8" />
              <rect x="25.5" y="3" width="2.5" height="10" />
              <rect x="30" y="5" width="3" height="6" />
            </svg>
            <span className="font-display text-xl tracking-wide">BULK &amp; CUT</span>
          </a>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <a href="/dashboard" title="홈" aria-label="홈" className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <HomeIcon />
                </a>
                <a href="/profile" title="목표 설정" aria-label="목표 설정" className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <TargetIcon />
                </a>
                <a href="/diet" title="식단 기록" aria-label="식단 기록" className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <UtensilsIcon />
                </a>
                <a href="/workout" title="운동 기록" aria-label="운동 기록" className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <DumbbellIcon />
                </a>
                <span className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
                <a href="/mypage" title={`마이페이지 (${displayName})`} aria-label="마이페이지" className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <UserIcon />
                </a>
                <a href="/settings" title="설정" aria-label="설정" className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <SettingsIcon />
                </a>
                <form action={logoutAction}>
                  <button type="submit" className="text-neutral-500 hover:underline dark:text-neutral-400">로그아웃</button>
                </form>
              </>
            ) : (
              <>
                <a href="/login" className="hover:underline">로그인</a>
                <a
                  href="/signup"
                  className="rounded bg-black px-3 py-1.5 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  회원가입
                </a>
              </>
            )}
            <ThemeToggle />
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
