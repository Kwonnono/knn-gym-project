export interface WorkoutSetEntry {
  reps: number;
  weightKg: number;
}

export interface WorkoutVolumeLog {
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  sets_data: WorkoutSetEntry[] | null;
}

export function getSetCount(log: WorkoutVolumeLog): number {
  if (log.sets_data && log.sets_data.length > 0) return log.sets_data.length;
  return log.sets ?? 0;
}

export function getTotalVolume(log: WorkoutVolumeLog): number {
  if (log.sets_data && log.sets_data.length > 0) {
    return log.sets_data.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
  }
  return (log.sets ?? 0) * (log.reps ?? 0) * (log.weight_kg ?? 0);
}
