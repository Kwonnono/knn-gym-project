'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'onboarding-banner-dismissed';

export function OnboardingBanner({
  title,
  description,
  dismissLabel
}: {
  title: string;
  description: string;
  dismissLabel: string;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  if (dismissed) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-900 dark:bg-blue-950">
      <div>
        <p className="font-medium text-blue-800 dark:text-blue-200">{title}</p>
        <p className="mt-0.5 text-blue-700 dark:text-blue-300">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, '1');
          setDismissed(true);
        }}
        aria-label={dismissLabel}
        className="shrink-0 rounded-lg px-2 py-1 text-blue-500 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
      >
        ✕
      </button>
    </div>
  );
}
