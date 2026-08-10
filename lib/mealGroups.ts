interface MealGroupable {
  meal_number: number | null;
}

export interface MealGroup<T> {
  mealNumber: number | null;
  logs: T[];
}

export function groupDietLogsByMeal<T extends MealGroupable>(logs: T[]): MealGroup<T>[] {
  const groups = new Map<number | null, T[]>();
  for (const log of logs) {
    const key = log.meal_number ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    })
    .map(([mealNumber, groupLogs]) => ({ mealNumber, logs: groupLogs }));
}
