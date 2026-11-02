import { UserProfile } from './types';

// BMI Calculation
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi < 25) return 'Bình thường';
  if (bmi < 30) return 'Thừa cân';
  return 'Béo phì';
}

// BMR - Harris-Benedict Formula
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
}

// Activity multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(
  bmr: number,
  activityLevel: UserProfile['activityLevel']
): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function getDailyCalorieTarget(tdee: number): number {
  return tdee - 500; // Safe deficit ~0.5kg/week
}

export function calculateDaysToGoal(
  currentWeight: number,
  targetWeight: number,
  weeklyLoss: number = 0.5
): number {
  const totalLoss = currentWeight - targetWeight;
  if (totalLoss <= 0) return 0;
  const weeks = totalLoss / weeklyLoss;
  return Math.ceil(weeks * 7);
}

export function getActivityLabel(level: UserProfile['activityLevel']): string {
  const labels = {
    sedentary: 'Ít vận động (ngồi nhiều)',
    light: 'Nhẹ (tập 1-3 ngày/tuần)',
    moderate: 'Vừa phải (tập 3-5 ngày/tuần)',
    active: 'Năng động (tập 6-7 ngày/tuần)',
    very_active: 'Rất năng động (tập nặng)',
  };
  return labels[level];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Local-date ISO (YYYY-MM-DD). toISOString() is UTC, which in Vietnam (UTC+7)
// would still report yesterday until 7am.
export function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayISO(): string {
  return toLocalISO(new Date());
}

export const KCAL_PER_KG = 7700;

// Calories burned by daily living without workouts. Workouts are counted from
// logged exercises, so the profile's activity multiplier would double count them.
export function getBaseBurn(bmr: number): number {
  return bmr * ACTIVITY_MULTIPLIERS.sedentary;
}

// kcal = MET × body weight (kg) × hours
export function caloriesFromMET(met: number, weightKg: number, minutes: number): number {
  return Math.round(met * weightKg * (minutes / 60));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
