'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n-constants';

export function LanguageToggle({ locale, koreanLabel, englishLabel }: { locale: Locale; koreanLabel: string; englishLabel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function selectLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="language"
        className="rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
      >
        {locale === 'ko' ? 'KO' : 'EN'}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => selectLocale('ko')}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              locale === 'ko' ? 'font-medium' : ''
            }`}
          >
            {koreanLabel}
          </button>
          <button
            type="button"
            onClick={() => selectLocale('en')}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              locale === 'en' ? 'font-medium' : ''
            }`}
          >
            {englishLabel}
          </button>
        </div>
      )}
    </div>
  );
}
