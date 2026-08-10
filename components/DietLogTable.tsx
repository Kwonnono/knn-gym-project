'use client';

import { Fragment, useEffect, useState } from 'react';
import { updateDietLogAction, deleteDietLogAction } from '@/app/actions';
import { groupDietLogsByMeal } from '@/lib/mealGroups';

interface DietLog {
  id: string;
  meal_name: string;
  meal_number: number | null;
  calories: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
}

interface Labels {
  colFood: string;
  colCalories: string;
  colProtein: string;
  colCarb: string;
  colFat: string;
  noLogs: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  confirmDelete: string;
  mealNumberLabel: string;
  mealNumbers: string[];
  unclassifiedMeal: string;
}

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

function mealGroupLabel(mealNumber: number | null, labels: Labels): string {
  if (mealNumber === null) return labels.unclassifiedMeal;
  return labels.mealNumbers[mealNumber - 1] ?? labels.unclassifiedMeal;
}

export function DietLogTable({
  logs,
  redirectTo,
  labels
}: {
  logs: DietLog[];
  redirectTo: string;
  labels: Labels;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setEditingId(null);
  }, [logs]);

  const groups = groupDietLogsByMeal(logs);

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="px-4 py-2 font-medium">{labels.colFood}</th>
            <th className="px-4 py-2 font-medium">{labels.colCalories}</th>
            <th className="px-4 py-2 font-medium">{labels.colProtein}</th>
            <th className="px-4 py-2 font-medium">{labels.colCarb}</th>
            <th className="px-4 py-2 font-medium">{labels.colFat}</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                {labels.noLogs}
              </td>
            </tr>
          )}
          {groups.map((group) => (
            <Fragment key={`group-${group.mealNumber ?? 'none'}`}>
              <tr className="border-t border-neutral-100 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-900">
                <td colSpan={6} className="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {mealGroupLabel(group.mealNumber, labels)}
                </td>
              </tr>
              {group.logs.map((log) =>
                editingId === log.id ? (
                  <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-900">
                    <td colSpan={6} className="px-4 py-3">
                      <form action={updateDietLogAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={log.id} />
                        <input type="hidden" name="redirectTo" value={redirectTo} />
                        <select
                          name="mealNumber"
                          required
                          defaultValue={log.meal_number ?? 1}
                          aria-label={labels.mealNumberLabel}
                          className={inputClass}
                        >
                          {labels.mealNumbers.map((label, i) => (
                            <option key={i} value={i + 1}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <input name="mealName" defaultValue={log.meal_name} required className={`${inputClass} w-40`} />
                        <input name="calories" type="number" defaultValue={log.calories} required className={`${inputClass} w-24`} />
                        <input name="proteinG" type="number" defaultValue={log.protein_g} className={`${inputClass} w-20`} />
                        <input name="carbG" type="number" defaultValue={log.carb_g} className={`${inputClass} w-20`} />
                        <input name="fatG" type="number" defaultValue={log.fat_g} className={`${inputClass} w-20`} />
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
                    <td className="px-4 py-2 font-medium">{log.meal_name}</td>
                    <td className="px-4 py-2">{log.calories}kcal</td>
                    <td className="px-4 py-2">{log.protein_g}g</td>
                    <td className="px-4 py-2">{log.carb_g}g</td>
                    <td className="px-4 py-2">{log.fat_g}g</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button type="button" onClick={() => setEditingId(log.id)} className="text-xs underline">
                        {labels.edit}
                      </button>
                      <form
                        action={deleteDietLogAction}
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm(labels.confirmDelete)) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={log.id} />
                        <input type="hidden" name="redirectTo" value={redirectTo} />
                        <button type="submit" className="ml-2 text-xs text-red-600 underline dark:text-red-400">
                          {labels.delete}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
