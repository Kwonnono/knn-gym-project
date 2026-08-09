export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'cutting' | 'bulking' | 'maintenance' | 'mini_cut' | 'mini_bulk';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

// 미니컷/미니벌크는 2~4주 단기간에 걸쳐 더 공격적으로 밀어붙이는 변형입니다.
const GOAL_CALORIE_ADJUSTMENT: Record<GoalType, number> = {
  cutting: -400,
  bulking: 300,
  maintenance: 0,
  mini_cut: -650,
  mini_bulk: 500
};

const PROTEIN_G_PER_KG = 2.0;
const FAT_CALORIE_RATIO = 0.25;

export interface TargetInput {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
}

export interface TargetOutput {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
}

// Mifflin-St Jeor
export function calculateBMR({ heightCm, weightKg, age, sex }: Pick<TargetInput, 'heightCm' | 'weightKg' | 'age' | 'sex'>): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function calculateTargets(input: TargetInput): TargetOutput {
  const bmr = calculateBMR(input);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[input.activityLevel]);
  const targetCalories = Math.max(1200, tdee + GOAL_CALORIE_ADJUSTMENT[input.goalType]);

  const targetProteinG = Math.round(input.weightKg * PROTEIN_G_PER_KG);
  const targetFatG = Math.round((targetCalories * FAT_CALORIE_RATIO) / 9);
  const remainingCalories = targetCalories - targetProteinG * 4 - targetFatG * 9;
  const targetCarbG = Math.max(0, Math.round(remainingCalories / 4));

  return { bmr, tdee, targetCalories, targetProteinG, targetCarbG, targetFatG };
}
