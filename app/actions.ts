'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { calculateTargets, type ActivityLevel, type GoalType, type Sex, type WeightChangeSpeed } from '@/lib/calc';
import { validatePassword } from '@/lib/passwordPolicy';
import { getLocale, getDictionary } from '@/lib/i18n';

export async function signupAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) {
    redirect('/signup?error=' + encodeURIComponent(t.signup.errorRequired));
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
    redirect('/login?message=' + encodeURIComponent(t.signup.confirmEmailSent));
  }

  redirect('/profile');
}

export async function loginAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(t.login.errorInvalid));
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    redirect('/settings?error=' + encodeURIComponent(t.settings.errorNameRequired));
  }

  const { error } = await supabase.auth.updateUser({ data: { name } });
  if (error) {
    redirect('/settings?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/mypage');
  revalidatePath('/settings');
  redirect('/settings?message=' + encodeURIComponent(t.settings.saved));
}

export async function saveGoalAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
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
  const weightChangeSpeed = (String(formData.get('weightChangeSpeed') ?? 'normal') || 'normal') as WeightChangeSpeed;
  const durationWeeks = formData.get('durationWeeks') ? Number(formData.get('durationWeeks')) : null;
  const targetBodyFatPercent = formData.get('targetBodyFatPercent') ? Number(formData.get('targetBodyFatPercent')) : null;
  const currentSkeletalMuscleMassKg = formData.get('currentSkeletalMuscleMassKg')
    ? Number(formData.get('currentSkeletalMuscleMassKg'))
    : null;
  const targetSkeletalMuscleMassKg = formData.get('targetSkeletalMuscleMassKg')
    ? Number(formData.get('targetSkeletalMuscleMassKg'))
    : null;
  const bodyFatPercent = formData.get('bodyFatPercent') ? Number(formData.get('bodyFatPercent')) : null;

  if (!heightCm || !weightKg || !age || !sex || !activityLevel || !goalType) {
    redirect('/profile?error=' + encodeURIComponent(t.profile.errorRequired));
  }

  const targets = calculateTargets({
    heightCm,
    weightKg,
    age,
    sex,
    activityLevel,
    goalType,
    weightChangeSpeed,
    targetSkeletalMuscleMassKg: targetSkeletalMuscleMassKg ?? undefined
  });

  const { error } = await supabase.from('goals').upsert(
    {
      user_id: user!.id,
      height_cm: heightCm,
      weight_kg: weightKg,
      age,
      sex,
      activity_level: activityLevel,
      goal_type: goalType,
      weight_change_speed: weightChangeSpeed,
      duration_weeks: durationWeeks,
      target_body_fat_percent: targetBodyFatPercent,
      current_skeletal_muscle_mass_kg: currentSkeletalMuscleMassKg,
      target_skeletal_muscle_mass_kg: targetSkeletalMuscleMassKg,
      body_fat_percent: bodyFatPercent,
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
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const mealName = String(formData.get('mealName') ?? '').trim();
  const mealNumber = formData.get('mealNumber') ? Number(formData.get('mealNumber')) : null;
  const calories = Number(formData.get('calories'));
  const proteinG = Number(formData.get('proteinG') ?? 0);
  const carbG = Number(formData.get('carbG') ?? 0);
  const fatG = Number(formData.get('fatG') ?? 0);

  if (!mealName || !calories) {
    redirect('/diet?error=' + encodeURIComponent(t.diet.errorFoodRequired));
  }

  const { error } = await supabase.from('diet_logs').insert({
    user_id: user!.id,
    meal_name: mealName,
    meal_number: mealNumber,
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

export async function updateDietLogAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/diet');
  const mealName = String(formData.get('mealName') ?? '').trim();
  const mealNumber = formData.get('mealNumber') ? Number(formData.get('mealNumber')) : null;
  const calories = Number(formData.get('calories'));
  const proteinG = Number(formData.get('proteinG') ?? 0);
  const carbG = Number(formData.get('carbG') ?? 0);
  const fatG = Number(formData.get('fatG') ?? 0);

  if (!id || !mealName || !calories) {
    redirect(`${redirectTo}?error=` + encodeURIComponent(t.diet.errorFoodRequired));
  }

  const { error } = await supabase
    .from('diet_logs')
    .update({ meal_name: mealName, meal_number: mealNumber, calories, protein_g: proteinG, carb_g: carbG, fat_g: fatG })
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) {
    redirect(`${redirectTo}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/diet');
  revalidatePath('/diet/history');
  revalidatePath('/dashboard');
  redirect(redirectTo);
}

export async function deleteDietLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/diet');
  if (id) {
    await supabase.from('diet_logs').delete().eq('id', id).eq('user_id', user.id);
  }

  revalidatePath('/diet');
  revalidatePath('/diet/history');
  revalidatePath('/dashboard');
  redirect(redirectTo);
}

export async function addWeightLogAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const weightKg = Number(formData.get('weightKg'));
  if (!weightKg) {
    redirect('/weight?error=' + encodeURIComponent(t.weight.errorWeightRequired));
  }

  const { error } = await supabase.from('weight_logs').insert({
    user_id: user!.id,
    weight_kg: weightKg
  });

  if (error) {
    redirect('/weight?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/weight');
  revalidatePath('/dashboard');
  redirect('/weight');
}

export async function updateWeightLogAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const weightKg = Number(formData.get('weightKg'));

  if (!id || !weightKg) {
    redirect('/weight?error=' + encodeURIComponent(t.weight.errorWeightRequired));
  }

  const { error } = await supabase
    .from('weight_logs')
    .update({ weight_kg: weightKg })
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) {
    redirect('/weight?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/weight');
  revalidatePath('/dashboard');
  redirect('/weight');
}

export async function deleteWeightLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  if (id) {
    await supabase.from('weight_logs').delete().eq('id', id).eq('user_id', user.id);
  }

  revalidatePath('/weight');
  revalidatePath('/dashboard');
  redirect('/weight');
}

const WORKOUT_CATEGORIES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'] as const;
export type WorkoutCategory = (typeof WORKOUT_CATEGORIES)[number];

interface ParsedWorkoutSet {
  reps: number;
  weightKg: number;
}

function parseSetsData(formData: FormData): ParsedWorkoutSet[] {
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get('setsData') ?? '[]'));
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => ({ reps: Number((s as ParsedWorkoutSet).reps), weightKg: Number((s as ParsedWorkoutSet).weightKg) }))
    .filter((s) => Number.isFinite(s.reps) && s.reps > 0 && Number.isFinite(s.weightKg) && s.weightKg >= 0);
}

export async function addWorkoutLogAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const category = String(formData.get('category') ?? '') as WorkoutCategory;
  if (!WORKOUT_CATEGORIES.includes(category)) {
    redirect('/workout?error=' + encodeURIComponent(t.workout.errorCategory));
  }

  const exercise = String(formData.get('exercise') ?? '').trim();
  if (!exercise) {
    redirect(`/workout?category=${category}&error=` + encodeURIComponent(t.workout.errorExercise));
  }

  if (category === 'cardio') {
    const durationMin = Number(formData.get('durationMin'));
    const distanceKm = formData.get('distanceKm') ? Number(formData.get('distanceKm')) : null;

    if (!durationMin) {
      redirect(`/workout?category=cardio&error=` + encodeURIComponent(t.workout.errorDuration));
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
    const setsData = parseSetsData(formData);

    if (setsData.length === 0) {
      redirect(`/workout?category=${category}&error=` + encodeURIComponent(t.workout.errorSetsReps));
    }

    const { error } = await supabase.from('workout_logs').insert({
      user_id: user!.id,
      category,
      exercise,
      sets: setsData.length,
      reps: setsData[0].reps,
      weight_kg: setsData[0].weightKg,
      sets_data: setsData
    });

    if (error) {
      redirect(`/workout?category=${category}&error=` + encodeURIComponent(error.message));
    }
  }

  revalidatePath('/workout');
  revalidatePath('/dashboard');
  redirect(`/workout?category=${category}`);
}

export async function updateWorkoutLogAction(formData: FormData): Promise<void> {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const category = String(formData.get('category') ?? '') as WorkoutCategory;
  if (!WORKOUT_CATEGORIES.includes(category)) {
    redirect('/workout?error=' + encodeURIComponent(t.workout.errorCategory));
  }
  const redirectTo = `/workout?category=${category}`;

  const exercise = String(formData.get('exercise') ?? '').trim();
  if (!id || !exercise) {
    redirect(`${redirectTo}&error=` + encodeURIComponent(t.workout.errorExercise));
  }

  if (category === 'cardio') {
    const durationMin = Number(formData.get('durationMin'));
    const distanceKm = formData.get('distanceKm') ? Number(formData.get('distanceKm')) : null;

    if (!durationMin) {
      redirect(`${redirectTo}&error=` + encodeURIComponent(t.workout.errorDuration));
    }

    const { error } = await supabase
      .from('workout_logs')
      .update({ exercise, duration_min: durationMin, distance_km: distanceKm })
      .eq('id', id)
      .eq('user_id', user!.id);

    if (error) {
      redirect(`${redirectTo}&error=` + encodeURIComponent(error.message));
    }
  } else {
    const setsData = parseSetsData(formData);

    if (setsData.length === 0) {
      redirect(`${redirectTo}&error=` + encodeURIComponent(t.workout.errorSetsReps));
    }

    const { error } = await supabase
      .from('workout_logs')
      .update({
        exercise,
        sets: setsData.length,
        reps: setsData[0].reps,
        weight_kg: setsData[0].weightKg,
        sets_data: setsData
      })
      .eq('id', id)
      .eq('user_id', user!.id);

    if (error) {
      redirect(`${redirectTo}&error=` + encodeURIComponent(error.message));
    }
  }

  revalidatePath('/workout');
  revalidatePath('/dashboard');
  redirect(redirectTo);
}

export async function deleteWorkoutLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const category = String(formData.get('category') ?? 'chest');
  if (id) {
    await supabase.from('workout_logs').delete().eq('id', id).eq('user_id', user.id);
  }

  revalidatePath('/workout');
  revalidatePath('/dashboard');
  redirect(`/workout?category=${category}`);
}
