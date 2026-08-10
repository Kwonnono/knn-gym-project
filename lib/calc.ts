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

// 보디빌딩 기준 고단백 목표: 커팅류는 근손실 방지를 위해 더 높게, 그 외는 표준 상한값.
const PROTEIN_G_PER_KG: Record<GoalType, number> = {
  cutting: 2.6,
  mini_cut: 2.6,
  bulking: 2.3,
  mini_bulk: 2.3,
  maintenance: 2.3
};

const FAT_CALORIE_RATIO = 0.2;

export interface TargetInput {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  weightChangeSpeed?: WeightChangeSpeed;
  bodyFatPercent?: number;
}

export interface TargetOutput {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
}

// 체지방률이 있으면 Katch-McArdle(제지방량 기반, 보디빌더에게 더 정확), 없으면 Mifflin-St Jeor로 폴백.
export function calculateBMR({
  heightCm,
  weightKg,
  age,
  sex,
  bodyFatPercent
}: Pick<TargetInput, 'heightCm' | 'weightKg' | 'age' | 'sex' | 'bodyFatPercent'>): number {
  if (bodyFatPercent && bodyFatPercent > 0 && bodyFatPercent < 100) {
    const leanMassKg = weightKg * (1 - bodyFatPercent / 100);
    return Math.round(370 + 21.6 * leanMassKg);
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

// 단백질 필요량은 항상 총 체중 기준(보디빌딩 표준)으로 계산합니다.
// 목표 골격근량은 체중보다 훨씬 작은 값이라, 예전처럼 그걸 기준으로 삼으면
// 단백질 목표치가 터무니없이 낮게(예: 101g) 나오는 버그가 있었습니다.
function macrosFromCalories(targetCalories: number, weightKg: number, goalType: GoalType) {
  const targetProteinG = Math.round(weightKg * PROTEIN_G_PER_KG[goalType]);
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
  const macros = macrosFromCalories(targetCalories, input.weightKg, input.goalType);

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
    const macros = macrosFromCalories(targetCalories, input.weightKg, input.goalType);
    entries.push({ week, targetCalories, ...macros });
  }
  return entries;
}
