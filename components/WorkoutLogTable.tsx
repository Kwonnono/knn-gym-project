'use client';

import { useState } from 'react';
import { updateWorkoutLogAction, deleteWorkoutLogAction } from '@/app/actions';

interface WorkoutLog {
  id: string;
  exercise: string;
  duration_min: number | null;
  distance_km: number | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
}

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export function WorkoutLogTable({
  logs,
  category,
  isCardio,
  locale,
  labels
}: {
  logs: WorkoutLog[];
  category: string;
  isCardio: boolean;
  locale: 'ko' | 'en';
  labels: {
    colExercise: string;
    colDuration: string;
    colDistance: string;
    colSets: string;
    colReps: string;
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
  const colSpan = isCardio ? 4 : 5;

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          {isCardio ? (
            <tr>
              <th className="px-4 py-2 font-medium">{labels.colExercise}</th>
              <th className="px-4 py-2 font-medium">{labels.colDuration}</th>
              <th className="px-4 py-2 font-medium">{labels.colDistance}</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          ) : (
            <tr>
              <th className="px-4 py-2 font-medium">{labels.colExercise}</th>
              <th className="px-4 py-2 font-medium">{labels.colSets}</th>
              <th className="px-4 py-2 font-medium">{labels.colReps}</th>
              <th className="px-4 py-2 font-medium">{labels.colWeight}</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          )}
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                {labels.noLogs}
              </td>
            </tr>
          )}
          {logs.map((log) =>
            editingId === log.id ? (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                <td colSpan={colSpan} className="px-4 py-3">
                  <form action={updateWorkoutLogAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={log.id} />
                    <input type="hidden" name="category" value={category} />
                    <input name="exercise" defaultValue={log.exercise} required className={`${inputClass} w-40`} />
                    {isCardio ? (
                      <>
                        <input
                          name="durationMin"
                          type="number"
                          defaultValue={log.duration_min ?? ''}
                          required
                          className={`${inputClass} w-20`}
                        />
                        <input
                          name="distanceKm"
                          type="number"
                          step="0.1"
                          defaultValue={log.distance_km ?? ''}
                          className={`${inputClass} w-20`}
                        />
                      </>
                    ) : (
                      <>
                        <input name="sets" type="number" defaultValue={log.sets ?? ''} required className={`${inputClass} w-16`} />
                        <input name="reps" type="number" defaultValue={log.reps ?? ''} required className={`${inputClass} w-16`} />
                        <input
                          name="weightKg"
                          type="number"
                          step="0.5"
                          defaultValue={log.weight_kg ?? ''}
                          className={`${inputClass} w-20`}
                        />
                      </>
                    )}
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
                <td className="px-4 py-2 font-medium">{log.exercise}</td>
                {isCardio ? (
                  <>
                    <td className="px-4 py-2">
                      {log.duration_min}
                      {locale === 'ko' ? '분' : 'min'}
                    </td>
                    <td className="px-4 py-2">{log.distance_km ? `${log.distance_km}km` : '-'}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">
                      {log.sets}
                      {locale === 'ko' ? '세트' : ''}
                    </td>
                    <td className="px-4 py-2">
                      {log.reps}
                      {locale === 'ko' ? '회' : ''}
                    </td>
                    <td className="px-4 py-2">{log.weight_kg}kg</td>
                  </>
                )}
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <button type="button" onClick={() => setEditingId(log.id)} className="text-xs underline">
                    {labels.edit}
                  </button>
                  <form
                    action={deleteWorkoutLogAction}
                    className="inline"
                    onSubmit={(e) => {
                      if (!confirm(labels.confirmDelete)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={log.id} />
                    <input type="hidden" name="category" value={category} />
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
