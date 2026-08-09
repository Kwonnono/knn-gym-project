'use client';

import { useState, useTransition } from 'react';
import { addDietLogAction, estimateNutritionAction } from '@/app/actions';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export function DietLogForm() {
  const [mealName, setMealName] = useState('');
  const [grams, setGrams] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbG, setCarbG] = useState('');
  const [fatG, setFatG] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAiCalc() {
    setAiError(null);
    startTransition(async () => {
      const result = await estimateNutritionAction(mealName, Number(grams));
      if ('error' in result) {
        setAiError(result.error);
        return;
      }
      setCalories(String(Math.round(result.calories)));
      setProteinG(String(Math.round(result.proteinG)));
      setCarbG(String(Math.round(result.carbG)));
      setFatG(String(Math.round(result.fatG)));
    });
  }

  return (
    <form
      action={addDietLogAction}
      className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <input
        name="mealName"
        placeholder="음식 이름 (예: 닭가슴살 샐러드)"
        required
        value={mealName}
        onChange={(e) => setMealName(e.target.value)}
        className={`col-span-2 ${inputClass}`}
      />
      <div className="col-span-2 flex gap-2">
        <input
          type="number"
          placeholder="양 (g)"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="button"
          onClick={handleAiCalc}
          disabled={isPending || !mealName || !grams}
          className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {isPending ? '계산 중...' : 'AI로 계산하기'}
        </button>
      </div>
      {aiError && <p className="col-span-2 text-sm text-red-600 dark:text-red-400">{aiError}</p>}
      <input
        name="calories"
        type="number"
        placeholder="칼로리 (kcal)"
        required
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        className={inputClass}
      />
      <input
        name="proteinG"
        type="number"
        placeholder="단백질 (g)"
        value={proteinG}
        onChange={(e) => setProteinG(e.target.value)}
        className={inputClass}
      />
      <input
        name="carbG"
        type="number"
        placeholder="탄수화물 (g)"
        value={carbG}
        onChange={(e) => setCarbG(e.target.value)}
        className={inputClass}
      />
      <input
        name="fatG"
        type="number"
        placeholder="지방 (g)"
        value={fatG}
        onChange={(e) => setFatG(e.target.value)}
        className={inputClass}
      />
      <button
        type="submit"
        className="col-span-2 rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        추가하기
      </button>
    </form>
  );
}
