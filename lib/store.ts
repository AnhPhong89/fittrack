import { UserProfile, WeightEntry, MealEntry, ExerciseEntry, PlanState } from './types';

const KEYS = {
  profile: 'fittrack_profile',
  weights: 'fittrack_weights',
  meals: 'fittrack_meals',
  exercises: 'fittrack_exercises',
  plan: 'fittrack_plan',
};

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

// ---- Profile ----
export function getProfile(): UserProfile | null {
  return getItem<UserProfile>(KEYS.profile);
}

export function saveProfile(profile: UserProfile): void {
  setItem(KEYS.profile, profile);
}

// ---- Weight Entries ----
export function getWeightEntries(): WeightEntry[] {
  return getItem<WeightEntry[]>(KEYS.weights) ?? [];
}

export function addWeightEntry(entry: WeightEntry): void {
  const entries = getWeightEntries();
  entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  setItem(KEYS.weights, entries);
}

export function deleteWeightEntry(id: string): void {
  const entries = getWeightEntries().filter((e) => e.id !== id);
  setItem(KEYS.weights, entries);
}

// ---- Meal Entries ----
export function getMealEntries(): MealEntry[] {
  return getItem<MealEntry[]>(KEYS.meals) ?? [];
}

export function getMealsByDate(date: string): MealEntry[] {
  return getMealEntries().filter((e) => e.date === date);
}

export function addMealEntry(entry: MealEntry): void {
  const entries = getMealEntries();
  entries.push(entry);
  setItem(KEYS.meals, entries);
}

export function deleteMealEntry(id: string): void {
  const entries = getMealEntries().filter((e) => e.id !== id);
  setItem(KEYS.meals, entries);
}

// ---- Exercise Entries ----
export function getExerciseEntries(): ExerciseEntry[] {
  return getItem<ExerciseEntry[]>(KEYS.exercises) ?? [];
}

export function getExercisesByDate(date: string): ExerciseEntry[] {
  return getExerciseEntries().filter((e) => e.date === date);
}

export function addExerciseEntry(entry: ExerciseEntry): void {
  const entries = getExerciseEntries();
  entries.push(entry);
  setItem(KEYS.exercises, entries);
}

export function deleteExerciseEntry(id: string): void {
  const entries = getExerciseEntries().filter((e) => e.id !== id);
  setItem(KEYS.exercises, entries);
}

// ---- Weekly Plan ----
export function getPlanState(): PlanState | null {
  return getItem<PlanState>(KEYS.plan);
}

export function savePlanState(plan: PlanState): void {
  setItem(KEYS.plan, plan);
}
