'use client';

import { useEffect, useState } from 'react';
import { updateWorkoutLogAction, deleteWorkoutLogAction } from '@/app/actions';
import { getSetCount, getTotalVolume, type WorkoutSetEntry } from '@/lib/workoutVolume';

interface WorkoutLog {
  id: string;
  exercise: string;
  duration_min: number | null;
  distance_km: number | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  sets_data: WorkoutSetEntry[] | null;
}

interface Labels {
  colExercise: string;
  colDuration: string;
  colDistance: string;
  colTotalSets: string;
  colTotalVolume: string;
  noLogs: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  confirmDelete: string;
  reps: string;
  weightKg: string;
  addSet: string;
  durationMin: string;
  distanceKm: string;
}

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

function StrengthEditForm({
  log,
  category,
  date,
  labels,
  onCancel
}: {
  log: WorkoutLog;
  category: string;
  date?: string;
  labels: Labels;
  onCancel: () => void;
}) {
  const initialSets: { reps: string; weightKg: string }[] =
    log.sets_data && log.sets_data.length > 0
      ? log.sets_data.map((s) => ({ reps: String(s.reps), weightKg: String(s.weightKg) }))
      : [{ reps: log.reps != null ? String(log.reps) : '', weightKg: log.weight_kg != null ? String(log.weight_kg) : '' }];
  const [sets, setSets] = useState(initialSets);
  const [exercise, setExercise] = useState(log.exercise);

  function updateSet(index: number, field: 'reps' | 'weightKg', value: string) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }
  function addSetRow() {
    setSets((prev) => [...prev, { reps: '', weightKg: '' }]);
  }
  function removeSetRow(index: number) {
    setSets((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const setsDataJson = JSON.stringify(
    sets.filter((s) => s.reps !== '' && s.weightKg !== '').map((s) => ({ reps: Number(s.reps), weightKg: Number(s.weightKg) }))
  );

  return (
    <form action={updateWorkoutLogAction} className="space-y-2">
      <input type="hidden" name="id" value={log.id} />
      <input type="hidden" name="category" value={category} />
      {date && <input type="hidden" name="date" value={date} />}
      <input type="hidden" name="setsData" value={setsDataJson} />
      <input
        name="exercise"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        required
        className={`${inputClass} w-40`}
      />
      {sets.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-xs text-neutral-500 dark:text-neutral-400">{i + 1}</span>
          <input
            type="number"
            placeholder={labels.reps}
            value={s.reps}
            onChange={(e) => updateSet(i, 'reps', e.target.value)}
            className={`${inputClass} w-20`}
          />
          <input
            type="number"
            step="0.5"
            placeholder={labels.weightKg}
            value={s.weightKg}
            onChange={(e) => updateSet(i, 'weightKg', e.target.value)}
            className={`${inputClass} w-20`}
          />
          {sets.length > 1 && (
            <button
              type="button"
              onClick={() => removeSetRow(i)}
              className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addSetRow} className="text-xs underline">
        {labels.addSet}
      </button>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black">
          {labels.save}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700">
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}

export function WorkoutLogTable({
  logs,
  category,
  date,
  isCardio,
  locale,
  labels
}: {
  logs: WorkoutLog[];
  category: string;
  date?: string;
  isCardio: boolean;
  locale: 'ko' | 'en';
  labels: Labels;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const colSpan = isCardio ? 4 : 4;

  useEffect(() => {
    setEditingId(null);
  }, [logs]);

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
              <th className="px-4 py-2 font-medium">{labels.colTotalSets}</th>
              <th className="px-4 py-2 font-medium">{labels.colTotalVolume}</th>
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
                  {isCardio ? (
                    <CardioEditForm log={log} category={category} date={date} labels={labels} onCancel={() => setEditingId(null)} />
                  ) : (
                    <StrengthEditForm log={log} category={category} date={date} labels={labels} onCancel={() => setEditingId(null)} />
                  )}
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
                      {getSetCount(log)}
                      {locale === 'ko' ? '세트' : ''}
                    </td>
                    <td className="px-4 py-2">{getTotalVolume(log)}kg</td>
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
                    {date && <input type="hidden" name="date" value={date} />}
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

function CardioEditForm({
  log,
  category,
  date,
  labels,
  onCancel
}: {
  log: WorkoutLog;
  category: string;
  date?: string;
  labels: Labels;
  onCancel: () => void;
}) {
  return (
    <form action={updateWorkoutLogAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={log.id} />
      <input type="hidden" name="category" value={category} />
      {date && <input type="hidden" name="date" value={date} />}
      <input name="exercise" defaultValue={log.exercise} required className={`${inputClass} w-40`} />
      <input name="durationMin" type="number" defaultValue={log.duration_min ?? ''} required className={`${inputClass} w-20`} />
      <input name="distanceKm" type="number" step="0.1" defaultValue={log.distance_km ?? ''} className={`${inputClass} w-20`} />
      <button type="submit" className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black">
        {labels.save}
      </button>
      <button type="button" onClick={onCancel} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700">
        {labels.cancel}
      </button>
    </form>
  );
}
