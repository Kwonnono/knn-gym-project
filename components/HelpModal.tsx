'use client';

import { useState } from 'react';

export function HelpModal({
  buttonLabel,
  title,
  tips,
  closeLabel
}: {
  buttonLabel: string;
  title: string;
  tips: string[];
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-5 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                ✕
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
