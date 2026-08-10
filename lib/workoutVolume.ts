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

export interface FirstSetDetail {
  weightKg: number;
  reps: number;
  remaining: number;
}

// 대표 세트(첫 세트) 무게/횟수와 나머지 세트 수를 반환 — 대시보드 서브 텍스트용.
export function getFirstSetDetail(log: WorkoutVolumeLog): FirstSetDetail | null {
  if (log.sets_data && log.sets_data.length > 0) {
    const [first, ...rest] = log.sets_data;
    return { weightKg: first.weightKg, reps: first.reps, remaining: rest.length };
  }
  if (log.reps != null && log.weight_kg != null) {
    return { weightKg: log.weight_kg, reps: log.reps, remaining: Math.max(0, (log.sets ?? 1) - 1) };
  }
  return null;
}
