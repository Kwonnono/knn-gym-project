'use client';

import { useEffect, useState } from 'react';
import { addDietLogAction } from '@/app/actions';
import { FOOD_PRESETS, type FoodPreset } from '@/lib/foodPresets';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

const EMPTY_FORM = { query: '', grams: '', calories: '', proteinG: '', carbG: '', fatG: '' };

export function DietForm({
  date,
  redirectTo,
  logCount,
  labels
}: {
  date?: string;
  redirectTo?: string;
  logCount?: number;
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
  const [query, setQuery] = useState(EMPTY_FORM.query);
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [grams, setGrams] = useState(EMPTY_FORM.grams);
  const [calories, setCalories] = useState(EMPTY_FORM.calories);
  const [proteinG, setProteinG] = useState(EMPTY_FORM.proteinG);
  const [carbG, setCarbG] = useState(EMPTY_FORM.carbG);
  const [fatG, setFatG] = useState(EMPTY_FORM.fatG);

  // 식단이 추가되면(logCount 변경) 서버 액션의 소프트 네비게이션으로는
  // 폼 상태가 자동 초기화되지 않으므로 직접 리셋합니다.
  useEffect(() => {
    setQuery(EMPTY_FORM.query);
    setSelectedPreset(null);
    setShowSuggestions(false);
    setGrams(EMPTY_FORM.grams);
    setCalories(EMPTY_FORM.calories);
    setProteinG(EMPTY_FORM.proteinG);
    setCarbG(EMPTY_FORM.carbG);
    setFatG(EMPTY_FORM.fatG);
  }, [logCount]);

  const suggestions =
    query.trim() && !selectedPreset
      ? FOOD_PRESETS.filter((f) => f.name.includes(query.trim())).slice(0, 8)
      : [];

  function applyPreset(preset: FoodPreset, gramsValue: string) {
    const g = Number(gramsValue);
    if (g > 0) {
      setCalories(String(Math.round((preset.caloriesPer100g * g) / 100)));
      setProteinG(String(Math.round((preset.proteinPer100g * g) / 100)));
      setCarbG(String(Math.round((preset.carbPer100g * g) / 100)));
      setFatG(String(Math.round((preset.fatPer100g * g) / 100)));
    }
  }

  function selectPreset(preset: FoodPreset) {
    setSelectedPreset(preset);
    setQuery(preset.name);
    setShowSuggestions(false);
    if (grams) applyPreset(preset, grams);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setShowSuggestions(true);
    if (selectedPreset && value !== selectedPreset.name) setSelectedPreset(null);
  }

  return (
    <form
      action={addDietLogAction}
      className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      {date && <input type="hidden" name="date" value={date} />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <input type="hidden" name="mealName" value={query} />
      <div className="relative col-span-2">
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder={labels.mealName}
          required
          autoComplete="off"
          className={`w-full ${inputClass}`}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            {suggestions.map((f) => (
              <button
                key={f.name}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectPreset(f);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span>{f.name}</span>
                <span className="text-xs text-neutral-400">{f.caloriesPer100g}kcal/100g</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <select name="mealNumber" required defaultValue="1" className={`col-span-2 ${inputClass}`} aria-label={labels.mealNumberLabel}>
        {labels.mealNumbers.map((label, i) => (
          <option key={i} value={i + 1}>
            {label}
          </option>
        ))}
      </select>
      {selectedPreset && (
        <input
          type="number"
          value={grams}
          onChange={(e) => {
            setGrams(e.target.value);
            applyPreset(selectedPreset, e.target.value);
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
