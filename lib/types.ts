export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number;        // cm
  currentWeight: number;  // kg
  targetWeight: number;   // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  targetDate?: string;    // ISO date
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string;          // ISO date
  weight: number;        // kg
  note?: string;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;       // grams
  carbs: number;         // grams
  fat: number;           // grams
}

export interface ExerciseEntry {
  id: string;
  date: string;
  name: string;
  duration: number;      // minutes
  caloriesBurned: number;
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
}

export interface HealthStats {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  weeklyWeightLoss: number;
  daysToGoal: number;
}
