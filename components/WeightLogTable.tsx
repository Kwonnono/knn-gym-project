'use client';

import { useEffect, useState } from 'react';
import { updateWeightLogAction, deleteWeightLogAction } from '@/app/actions';

interface WeightLog {
  id: string;
  date: string;
  weight_kg: number;
}

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export function WeightLogTable({
  logs,
  locale,
  labels
}: {
  logs: WeightLog[];
  locale: 'ko' | 'en';
  labels: {
    colDate: string;
    colWeight: string;
    noLogs: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirmDelete: string;
  };
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setEditingId(null);
  }, [logs]);

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="px-4 py-2 font-medium">{labels.colDate}</th>
            <th className="px-4 py-2 font-medium">{labels.colWeight}</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                {labels.noLogs}
              </td>
            </tr>
          )}
          {logs.map((log) =>
            editingId === log.id ? (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                <td colSpan={3} className="px-4 py-3">
                  <form action={updateWeightLogAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={log.id} />
                    <input name="weightKg" type="number" step="0.1" defaultValue={log.weight_kg} required className={`${inputClass} w-24`} />
                    <button
                      type="submit"
                      className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black"
                    >
                      {labels.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
                    >
                      {labels.cancel}
                    </button>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-2">{new Date(log.date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}</td>
                <td className="px-4 py-2 font-medium">{log.weight_kg}kg</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <button type="button" onClick={() => setEditingId(log.id)} className="text-xs underline">
                    {labels.edit}
                  </button>
                  <form
                    action={deleteWeightLogAction}
                    className="inline"
                    onSubmit={(e) => {
                      if (!confirm(labels.confirmDelete)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={log.id} />
                    <button type="submit" className="ml-2 text-xs text-red-600 underline dark:text-red-400">
                      {labels.delete}
                    </button>
                  </form>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
