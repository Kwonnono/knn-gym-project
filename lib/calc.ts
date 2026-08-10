export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'cutting' | 'bulking' | 'maintenance' | 'mini_cut' | 'mini_bulk';
export type WeightChangeSpeed = 'slow' | 'normal' | 'fast';

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

// 목표 조정폭에 곱해지는 속도 배수 (천천히/보통/빠르게)
const WEIGHT_CHANGE_SPEED_MULTIPLIER: Record<WeightChangeSpeed, number> = {
  slow: 0.6,
  normal: 1.0,
  fast: 1.4
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
  weightChangeSpeed?: WeightChangeSpeed;
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

function macrosFromCalories(targetCalories: number, weightKg: number) {
  const targetProteinG = Math.round(weightKg * PROTEIN_G_PER_KG);
  const targetFatG = Math.round((targetCalories * FAT_CALORIE_RATIO) / 9);
  const remainingCalories = targetCalories - targetProteinG * 4 - targetFatG * 9;
  const targetCarbG = Math.max(0, Math.round(remainingCalories / 4));
  return { targetProteinG, targetCarbG, targetFatG };
}

export function calculateTargets(input: TargetInput): TargetOutput {
  const bmr = calculateBMR(input);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[input.activityLevel]);
  const speedMultiplier = WEIGHT_CHANGE_SPEED_MULTIPLIER[input.weightChangeSpeed ?? 'normal'];
  const targetCalories = Math.max(1200, tdee + Math.round(GOAL_CALORIE_ADJUSTMENT[input.goalType] * speedMultiplier));
  const macros = macrosFromCalories(targetCalories, input.weightKg);

  return { bmr, tdee, targetCalories, ...macros };
}

export interface WeeklyCurriculumEntry {
  week: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
}

// TDEE(유지 칼로리)에서 시작해 목표 기간에 걸쳐 최종 목표 칼로리까지 선형으로 이어지는 주차별 커리큘럼.
export function calculateWeeklyCurriculum(input: TargetInput, durationWeeks: number): WeeklyCurriculumEntry[] {
  if (durationWeeks <= 0) return [];

  const bmr = calculateBMR(input);
  const startCalories = Math.round(bmr * ACTIVITY_MULTIPLIER[input.activityLevel]);
  const finalTargets = calculateTargets(input);

  const entries: WeeklyCurriculumEntry[] = [];
  for (let week = 1; week <= durationWeeks; week += 1) {
    const progress = durationWeeks === 1 ? 1 : (week - 1) / (durationWeeks - 1);
    const targetCalories = Math.round(startCalories + (finalTargets.targetCalories - startCalories) * progress);
    const macros = macrosFromCalories(targetCalories, input.weightKg);
    entries.push({ week, targetCalories, ...macros });
  }
  return entries;
}
