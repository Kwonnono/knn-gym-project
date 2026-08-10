'use client';

import { useEffect, useState } from 'react';

export function DismissibleTip({
  storageKey,
  message,
  closeLabel,
  className
}: {
  storageKey: string;
  message: string;
  closeLabel: string;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === '1');
  }, [storageKey]);

  if (dismissed) return null;

  return (
    <div className={`flex items-start justify-between gap-2 ${className ?? ''}`}>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(storageKey, '1');
          setDismissed(true);
        }}
        aria-label={closeLabel}
        className="shrink-0 rounded-lg px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10"
      >
        ✕
      </button>
    </div>
  );
}
