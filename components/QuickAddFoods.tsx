import { addDietLogAction } from '@/app/actions';

interface QuickAddFood {
  mealName: string;
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export function QuickAddFoods({
  foods,
  date,
  redirectTo,
  title
}: {
  foods: QuickAddFood[];
  date: string;
  redirectTo: string;
  title: string;
}) {
  if (foods.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
      <div className="flex flex-wrap gap-2">
        {foods.map((food, i) => (
          <form key={i} action={addDietLogAction}>
            <input type="hidden" name="mealName" value={food.mealName} />
            <input type="hidden" name="calories" value={food.calories} />
            <input type="hidden" name="proteinG" value={food.proteinG} />
            <input type="hidden" name="carbG" value={food.carbG} />
            <input type="hidden" name="fatG" value={food.fatG} />
            <input type="hidden" name="mealNumber" value="1" />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              ⚡ {food.mealName} · {food.calories}kcal
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
