'use client';

import { useState } from 'react';
import { addWorkoutLogAction } from '@/app/actions';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

const CUSTOM_VALUE = '__custom__';

interface SetRow {
  reps: string;
  weightKg: string;
}

export function WorkoutForm({
  category,
  date,
  isCardio,
  exercisePresets,
  lastPerformance,
  labels
}: {
  category: string;
  date?: string;
  isCardio: boolean;
  exercisePresets: string[];
  lastPerformance?: Record<string, { reps: number; weightKg: number }[]>;
  labels: {
    exerciseName: string;
    selectExercise: string;
    customExercise: string;
    durationMin: string;
    distanceKm: string;
    reps: string;
    weightKg: string;
    addSet: string;
    submit: string;
  };
}) {
  const [selected, setSelected] = useState('');
  const [sets, setSets] = useState<SetRow[]>([{ reps: '', weightKg: '' }]);
  const isCustom = selected === CUSTOM_VALUE;

  function updateSet(index: number, field: keyof SetRow, value: string) {
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
    <form
      action={addWorkoutLogAction}
      className="grid grid-cols-3 gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <input type="hidden" name="category" value={category} />
      {date && <input type="hidden" name="date" value={date} />}
      <select
        value={selected}
        onChange={(e) => {
          const value = e.target.value;
          setSelected(value);
          const last = lastPerformance?.[value];
          if (last && last.length > 0) {
            setSets(last.map((s) => ({ reps: String(s.reps), weightKg: String(s.weightKg) })));
          } else if (value !== CUSTOM_VALUE) {
            setSets([{ reps: '', weightKg: '' }]);
          }
        }}
        className={`col-span-3 ${inputClass}`}
      >
        <option value="" disabled>
          {labels.selectExercise}
        </option>
        {exercisePresets.map((ex) => (
          <option key={ex} value={ex}>
            {ex}
          </option>
        ))}
        <option value={CUSTOM_VALUE}>{labels.customExercise}</option>
      </select>
      {isCustom ? (
        <input name="exercise" placeholder={labels.exerciseName} required className={`col-span-3 ${inputClass}`} />
      ) : (
        <input type="hidden" name="exercise" value={selected} />
      )}
      {isCardio ? (
        <>
          <input name="durationMin" type="number" placeholder={labels.durationMin} required className={inputClass} />
          <input name="distanceKm" type="number" step="0.1" placeholder={labels.distanceKm} className={`col-span-2 ${inputClass}`} />
        </>
      ) : (
        <div className="col-span-3 space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-neutral-500 dark:text-neutral-400">{i + 1}</span>
              <input
                type="number"
                placeholder={labels.reps}
                value={s.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <input
                type="number"
                step="0.5"
                placeholder={labels.weightKg}
                value={s.weightKg}
                onChange={(e) => updateSet(i, 'weightKg', e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSetRow(i)}
                  className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSetRow} className="text-sm underline">
            {labels.addSet}
          </button>
          <input type="hidden" name="setsData" value={setsDataJson} />
        </div>
      )}
      <button
        type="submit"
        className="col-span-3 rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {labels.submit}
      </button>
    </form>
  );
}
