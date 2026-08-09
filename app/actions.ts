'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { calculateTargets, type ActivityLevel, type GoalType, type Sex } from '@/lib/calc';

export async function signupAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) {
    redirect('/signup?error=' + encodeURIComponent('모든 항목을 입력해주세요.'));
  }
  if (password.length < 8) {
    redirect('/signup?error=' + encodeURIComponent('비밀번호는 8자 이상이어야 합니다.'));
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

export async function addWorkoutLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const exercise = String(formData.get('exercise') ?? '').trim();
  const sets = Number(formData.get('sets'));
  const reps = Number(formData.get('reps'));
  const weightKg = Number(formData.get('weightKg'));

  if (!exercise || !sets || !reps) {
    redirect('/workout?error=' + encodeURIComponent('운동 이름, 세트, 횟수는 필수입니다.'));
  }

  const { error } = await supabase.from('workout_logs').insert({
    user_id: user!.id,
    exercise,
    sets,
    reps,
    weight_kg: weightKg || 0
  });

  if (error) {
    redirect('/workout?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/workout');
  redirect('/workout');
}
