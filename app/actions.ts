'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, clearSessionCookie, getCurrentUserId } from '@/lib/session';
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect('/signup?error=' + encodeURIComponent('이미 가입된 이메일입니다.'));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  await setSessionCookie(user.id);
  redirect('/profile');
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    redirect('/login?error=' + encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다.'));
  }

  await setSessionCookie(user!.id);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/');
}

export async function saveGoalAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

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

  await prisma.goal.upsert({
    where: { userId: userId! },
    create: { userId: userId!, heightCm, weightKg, age, sex, activityLevel, goalType, ...targets },
    update: { heightCm, weightKg, age, sex, activityLevel, goalType, ...targets }
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function addDietLogAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const mealName = String(formData.get('mealName') ?? '').trim();
  const calories = Number(formData.get('calories'));
  const proteinG = Number(formData.get('proteinG') ?? 0);
  const carbG = Number(formData.get('carbG') ?? 0);
  const fatG = Number(formData.get('fatG') ?? 0);

  if (!mealName || !calories) {
    redirect('/diet?error=' + encodeURIComponent('음식 이름과 칼로리는 필수입니다.'));
  }

  await prisma.dietLog.create({
    data: { userId: userId!, mealName, calories, proteinG, carbG, fatG }
  });

  revalidatePath('/diet');
  revalidatePath('/dashboard');
  redirect('/diet');
}

export async function addWorkoutLogAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const exercise = String(formData.get('exercise') ?? '').trim();
  const sets = Number(formData.get('sets'));
  const reps = Number(formData.get('reps'));
  const weightKg = Number(formData.get('weightKg'));

  if (!exercise || !sets || !reps) {
    redirect('/workout?error=' + encodeURIComponent('운동 이름, 세트, 횟수는 필수입니다.'));
  }

  await prisma.workoutLog.create({
    data: { userId: userId!, exercise, sets, reps, weightKg: weightKg || 0 }
  });

  revalidatePath('/workout');
  redirect('/workout');
}
