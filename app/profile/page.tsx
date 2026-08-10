import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveGoalAction } from '@/app/actions';
import { getLocale, getDictionary } from '@/lib/i18n';

const inputClass =
  'mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 transition-colors focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500';

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await searchParams;
  const { data: goal } = await supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle();
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <h1 className="font-display text-3xl tracking-wide">{t.profile.title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.profile.description}</p>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      <form action={saveGoalAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            {t.profile.heightCm} <span className="text-red-500">*</span>
            <input name="heightCm" type="number" step="0.1" required defaultValue={goal?.height_cm} className={inputClass} />
          </label>
          <label className="text-sm">
            {t.profile.weightKg} <span className="text-red-500">*</span>
            <input name="weightKg" type="number" step="0.1" required defaultValue={goal?.weight_kg} className={inputClass} />
          </label>
          <label className="text-sm">
            {t.profile.age} <span className="text-red-500">*</span>
            <input name="age" type="number" required defaultValue={goal?.age} className={inputClass} />
          </label>
          <label className="text-sm">
            {t.profile.sex} <span className="text-red-500">*</span>
            <select name="sex" required defaultValue={goal?.sex ?? ''} className={inputClass}>
              <option value="" disabled>{t.profile.select}</option>
              <option value="male">{t.profile.sexMale}</option>
              <option value="female">{t.profile.sexFemale}</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          {t.profile.activityLevel} <span className="text-red-500">*</span>
          <select name="activityLevel" required defaultValue={goal?.activity_level ?? ''} className={inputClass}>
            <option value="" disabled>{t.profile.select}</option>
            <option value="sedentary">{t.profile.activitySedentary}</option>
            <option value="light">{t.profile.activityLight}</option>
            <option value="moderate">{t.profile.activityModerate}</option>
            <option value="active">{t.profile.activityActive}</option>
            <option value="very_active">{t.profile.activityVeryActive}</option>
          </select>
        </label>
        <label className="block text-sm">
          {t.profile.goalType} <span className="text-red-500">*</span>
          <select name="goalType" required defaultValue={goal?.goal_type ?? ''} className={inputClass}>
            <option value="" disabled>{t.profile.select}</option>
            <option value="cutting">{t.profile.goalCutting}</option>
            <option value="bulking">{t.profile.goalBulking}</option>
            <option value="maintenance">{t.profile.goalMaintenance}</option>
            <option value="mini_cut">{t.profile.goalMiniCut}</option>
            <option value="mini_bulk">{t.profile.goalMiniBulk}</option>
          </select>
        </label>
        <label className="block text-sm">
          {t.profile.durationWeeks}
          <input name="durationWeeks" type="number" min="1" defaultValue={goal?.duration_weeks ?? ''} className={inputClass} />
        </label>
        <label className="block text-sm">
          {t.profile.weightChangeSpeed}
          <select name="weightChangeSpeed" defaultValue={goal?.weight_change_speed ?? 'normal'} className={inputClass}>
            <option value="slow">{t.profile.speedSlow}</option>
            <option value="normal">{t.profile.speedNormal}</option>
            <option value="fast">{t.profile.speedFast}</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            {t.profile.targetBodyFatPercent}
            <input
              name="targetBodyFatPercent"
              type="number"
              step="0.1"
              defaultValue={goal?.target_body_fat_percent ?? ''}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            {t.profile.bodyFatPercent}
            <input name="bodyFatPercent" type="number" step="0.1" defaultValue={goal?.body_fat_percent ?? ''} className={inputClass} />
          </label>
          <label className="text-sm">
            {t.profile.currentSkeletalMuscleMassKg}
            <input
              name="currentSkeletalMuscleMassKg"
              type="number"
              step="0.1"
              defaultValue={goal?.current_skeletal_muscle_mass_kg ?? ''}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            {t.profile.targetSkeletalMuscleMassKg}
            <input
              name="targetSkeletalMuscleMassKg"
              type="number"
              step="0.1"
              defaultValue={goal?.target_skeletal_muscle_mass_kg ?? ''}
              className={inputClass}
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-black px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {t.profile.submit}
        </button>
      </form>
    </div>
  );
}
