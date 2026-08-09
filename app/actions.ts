'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { calculateTargets, type ActivityLevel, type GoalType, type Sex } from '@/lib/calc';
import { validatePassword } from '@/lib/passwordPolicy';

const anthropic = new Anthropic();

const NutritionSchema = z.object({
  calories: z.number().describe('총 칼로리 (kcal)'),
  proteinG: z.number().describe('단백질 (g)'),
  carbG: z.number().describe('탄수화물 (g)'),
  fatG: z.number().describe('지방 (g)')
});

export async function estimateNutritionAction(
  foodName: string,
  grams: number
): Promise<{ calories: number; proteinG: number; carbG: number; fatG: number } | { error: string }> {
  if (!foodName.trim() || !grams) {
    return { error: '음식 이름과 그램(g) 수를 입력해주세요.' };
  }

  try {
    const response = await anthropic.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 1024,
      output_config: {
        effort: 'low',
        format: zodOutputFormat(NutritionSchema)
      },
      messages: [
        {
          role: 'user',
          content: `"${foodName}" ${grams}g의 예상 영양 성분을 일반적인 음식 영양 데이터베이스 기준으로 추정해줘.`
        }
      ]
    });

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return { error: 'AI가 계산하지 못했습니다. 직접 입력해주세요.' };
    }

    return response.parsed_output;
  } catch {
    return { error: 'AI 계산 중 문제가 발생했습니다. 직접 입력해주세요.' };
  }
}

export async function signupAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) {
    redirect('/signup?error=' + encodeURIComponent('모든 항목을 입력해주세요.'));
  }
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    redirect('/signup?error=' + encodeURIComponent(passwordCheck.error));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  if (!data.session) {
    redirect('/login?message=' + encodeURIComponent('가입 확인 이메일을 보냈습니다. 이메일을 확인한 뒤 로그인해주세요.'));
  }

  redirect('/profile');
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=' + encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다.'));
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    redirect('/settings?error=' + encodeURIComponent('이름 또는 닉네임을 입력해주세요.'));
  }

  const { error } = await supabase.auth.updateUser({ data: { name } });
  if (error) {
    redirect('/settings?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/mypage');
  revalidatePath('/settings');
  redirect('/settings?message=' + encodeURIComponent('저장했습니다.'));
}

export async function saveGoalAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const heightCm = Number(formData.get('heightCm'));
  const weightKg = Number(formData.get('weightKg'));
  const age = Number(formData.get('age'));
  const sex = String(formData.get('sex')) as Sex;
  const activityLevel = String(formData.get('activityLevel')) as ActivityLevel;
  const goalType = String(formData.get('goalType')) as GoalType;

  if (!heightCm || !weightKg || !age || !sex || !activityLevel || !goalType) {
    redirect('/profile?error=' + encodeURIComponent('모든 항목을 입력해주세요.'));
  }

  const targets = calculateTargets({ heightCm, weightKg, age, sex, activityLevel, goalType });

  const { error } = await supabase.from('goals').upsert(
    {
      user_id: user!.id,
      height_cm: heightCm,
      weight_kg: weightKg,
      age,
      sex,
      activity_level: activityLevel,
      goal_type: goalType,
      bmr: targets.bmr,
      tdee: targets.tdee,
      target_calories: targets.targetCalories,
      target_protein_g: targets.targetProteinG,
      target_carb_g: targets.targetCarbG,
      target_fat_g: targets.targetFatG,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    redirect('/profile?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function addDietLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const mealName = String(formData.get('mealName') ?? '').trim();
  const calories = Number(formData.get('calories'));
  const proteinG = Number(formData.get('proteinG') ?? 0);
  const carbG = Number(formData.get('carbG') ?? 0);
  const fatG = Number(formData.get('fatG') ?? 0);

  if (!mealName || !calories) {
    redirect('/diet?error=' + encodeURIComponent('음식 이름과 칼로리는 필수입니다.'));
  }

  const { error } = await supabase.from('diet_logs').insert({
    user_id: user!.id,
    meal_name: mealName,
    calories,
    protein_g: proteinG,
    carb_g: carbG,
    fat_g: fatG
  });

  if (error) {
    redirect('/diet?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/diet');
  revalidatePath('/dashboard');
  redirect('/diet');
}

const WORKOUT_CATEGORIES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'] as const;
export type WorkoutCategory = (typeof WORKOUT_CATEGORIES)[number];

export async function addWorkoutLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const category = String(formData.get('category') ?? '') as WorkoutCategory;
  if (!WORKOUT_CATEGORIES.includes(category)) {
    redirect('/workout?error=' + encodeURIComponent('잘못된 운동 부위입니다.'));
  }

  const exercise = String(formData.get('exercise') ?? '').trim();
  if (!exercise) {
    redirect(`/workout?category=${category}&error=` + encodeURIComponent('운동 이름을 입력해주세요.'));
  }

  if (category === 'cardio') {
    const durationMin = Number(formData.get('durationMin'));
    const distanceKm = formData.get('distanceKm') ? Number(formData.get('distanceKm')) : null;

    if (!durationMin) {
      redirect(`/workout?category=cardio&error=` + encodeURIComponent('운동 시간(분)을 입력해주세요.'));
    }

    const { error } = await supabase.from('workout_logs').insert({
      user_id: user!.id,
      category,
      exercise,
      duration_min: durationMin,
      distance_km: distanceKm
    });

    if (error) {
      redirect(`/workout?category=cardio&error=` + encodeURIComponent(error.message));
    }
  } else {
    const sets = Number(formData.get('sets'));
    const reps = Number(formData.get('reps'));
    const weightKg = formData.get('weightKg') ? Number(formData.get('weightKg')) : 0;

    if (!sets || !reps) {
      redirect(`/workout?category=${category}&error=` + encodeURIComponent('세트, 횟수는 필수입니다.'));
    }

    const { error } = await supabase.from('workout_logs').insert({
      user_id: user!.id,
      category,
      exercise,
      sets,
      reps,
      weight_kg: weightKg
    });

    if (error) {
      redirect(`/workout?category=${category}&error=` + encodeURIComponent(error.message));
    }
  }

  revalidatePath('/workout');
  revalidatePath('/dashboard');
  redirect(`/workout?category=${category}`);
}
