'use client';

import { useState } from 'react';
import { addWorkoutLogAction } from '@/app/actions';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

const CUSTOM_VALUE = '__custom__';

export function WorkoutForm({
  category,
  isCardio,
  exercisePresets,
  labels
}: {
  category: string;
  isCardio: boolean;
  exercisePresets: string[];
  labels: {
    exerciseName: string;
    selectExercise: string;
    customExercise: string;
    durationMin: string;
    distanceKm: string;
    sets: string;
    reps: string;
    weightKg: string;
    submit: string;
  };
}) {
  const [selected, setSelected] = useState('');
  const isCustom = selected === CUSTOM_VALUE;

  return (
    <form
      action={addWorkoutLogAction}
      className="grid grid-cols-3 gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <input type="hidden" name="category" value={category} />
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className={`col-span-3 ${inputClass}`}>
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
        <>
          <input name="sets" type="number" placeholder={labels.sets} required className={inputClass} />
          <input name="reps" type="number" placeholder={labels.reps} required className={inputClass} />
          <input name="weightKg" type="number" step="0.5" placeholder={labels.weightKg} className={inputClass} />
        </>
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
