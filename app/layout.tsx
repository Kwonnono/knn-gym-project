import type { Metadata } from 'next';
import { Bebas_Neue, Black_Han_Sans, Inter, Noto_Sans_KR } from 'next/font/google';
import { getCurrentUser } from '@/lib/supabase/server';
import { logoutAction } from '@/app/actions';
import { getLocale, getDictionary } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { NavMenu } from '@/components/NavMenu';
import { Avatar } from '@/components/Avatar';
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
  const locale = await getLocale();
  const t = getDictionary(locale);
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? '';

  return (
    <html
      lang={locale}
      className={`${displayFont.variable} ${displayFontKr.variable} ${bodyFont.variable} ${bodyFontKr.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-black">
          <div aria-hidden="true" />
          <a href={user ? '/dashboard' : '/'} className="flex flex-col items-center justify-self-center gap-1 leading-none">
            <svg width="42" height="20" viewBox="0 0 34 16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <rect x="1" y="5" width="3" height="6" />
              <rect x="6" y="3" width="2.5" height="10" />
              <line x1="9" y1="8" x2="25" y2="8" />
              <rect x="25.5" y="3" width="2.5" height="10" />
              <rect x="30" y="5" width="3" height="6" />
            </svg>
            <span className="font-display text-2xl tracking-wide">BULK &amp; CUT</span>
          </a>
          <nav className="flex items-center justify-self-end gap-4 text-sm">
            {user ? (
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <Avatar name={displayName} />
                <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
              </a>
            ) : null}
            {user ? (
              <NavMenu
                items={[
                  { href: '/dashboard', label: t.nav.home },
                  { href: '/profile', label: t.nav.goal },
                  { href: '/diet', label: t.nav.diet },
                  { href: '/workout', label: t.nav.workout },
                  { href: '/weight', label: t.nav.weight },
                  { href: '/mypage', label: t.nav.mypage },
                  { href: '/settings', label: t.nav.settings }
                ]}
                logoutLabel={t.nav.logout}
                logoutAction={logoutAction}
              />
            ) : (
              <>
                <a href="/login" className="hover:underline">{t.nav.login}</a>
                <a
                  href="/signup"
                  className="rounded-lg bg-black px-3 py-1.5 text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  {t.nav.signup}
                </a>
              </>
            )}
            <LanguageToggle locale={locale} koreanLabel={t.language.korean} englishLabel={t.language.english} />
            <ThemeToggle />
          </nav>
        </header>
        <main className="px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
