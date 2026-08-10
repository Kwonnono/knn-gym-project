'use client';

import { useState } from 'react';
import { addDietLogAction } from '@/app/actions';
import { FOOD_PRESETS } from '@/lib/foodPresets';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export function DietForm({
  date,
  redirectTo,
  labels
}: {
  date?: string;
  redirectTo?: string;
  labels: {
    mealName: string;
    mealNumberLabel: string;
    mealNumbers: string[];
    gramsLabel: string;
    calories: string;
    protein: string;
    carb: string;
    fat: string;
    submit: string;
  };
}) {
  const [mealName, setMealName] = useState('');
  const [grams, setGrams] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbG, setCarbG] = useState('');
  const [fatG, setFatG] = useState('');

  const preset = FOOD_PRESETS.find((f) => f.name === mealName);

  function applyPreset(name: string, gramsValue: string) {
    const matched = FOOD_PRESETS.find((f) => f.name === name);
    const g = Number(gramsValue);
    if (matched && g > 0) {
      setCalories(String(Math.round((matched.caloriesPer100g * g) / 100)));
      setProteinG(String(Math.round((matched.proteinPer100g * g) / 100)));
      setCarbG(String(Math.round((matched.carbPer100g * g) / 100)));
      setFatG(String(Math.round((matched.fatPer100g * g) / 100)));
    }
  }

  return (
    <form
      action={addDietLogAction}
      className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      {date && <input type="hidden" name="date" value={date} />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <input
        name="mealName"
        list="food-presets"
        value={mealName}
        onChange={(e) => {
          setMealName(e.target.value);
          applyPreset(e.target.value, grams);
        }}
        placeholder={labels.mealName}
        required
        autoComplete="off"
        className={`col-span-2 ${inputClass}`}
      />
      <datalist id="food-presets">
        {FOOD_PRESETS.map((f) => (
          <option key={f.name} value={f.name} />
        ))}
      </datalist>
      <select name="mealNumber" required defaultValue="1" className={`col-span-2 ${inputClass}`} aria-label={labels.mealNumberLabel}>
        {labels.mealNumbers.map((label, i) => (
          <option key={i} value={i + 1}>
            {label}
          </option>
        ))}
      </select>
      {preset && (
        <input
          type="number"
          value={grams}
          onChange={(e) => {
            setGrams(e.target.value);
            applyPreset(mealName, e.target.value);
          }}
          placeholder={labels.gramsLabel}
          className={`col-span-2 ${inputClass}`}
        />
      )}
      <input
        name="calories"
        type="number"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        placeholder={labels.calories}
        required
        className={inputClass}
      />
      <input
        name="proteinG"
        type="number"
        value={proteinG}
        onChange={(e) => setProteinG(e.target.value)}
        placeholder={labels.protein}
        className={inputClass}
      />
      <input
        name="carbG"
        type="number"
        value={carbG}
        onChange={(e) => setCarbG(e.target.value)}
        placeholder={labels.carb}
        className={inputClass}
      />
      <input
        name="fatG"
        type="number"
        value={fatG}
        onChange={(e) => setFatG(e.target.value)}
        placeholder={labels.fat}
        className={inputClass}
      />
      <button
        type="submit"
        className="col-span-2 rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {labels.submit}
      </button>
    </form>
  );
}
