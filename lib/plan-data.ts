// Shared weekly-plan data: used by /plan and the dashboard's daily check-in.

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Meal {
  name: string; calories: number; protein: number; carbs: number; fat: number; note?: string;
}
export interface WorkoutDef {
  key: string; label: string; shortLabel: string;
  duration: number; calories: number; type: string;
  intensity: 'Nhẹ' | 'Vừa' | 'Cao'; color: string; bg: string; icon: string;
  exercises: string[];
}
export type DietMode = 'normal' | 'strict';
export type DaySession = { morning: string; evening: string };

export const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// ─── Meal databases ──────────────────────────────────────────────────────────

// Meal database type
export type MealDB = { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[]; snack: Meal[] };

// NORMAL: Món Việt quen thuộc nhẹ nhàng
export const MEALS_NORMAL: MealDB = {
  breakfast: [
    { name: 'Phở gà (tô nhỏ) + thêm rau giá', calories: 370, protein: 24, carbs: 50, fat: 7, note: 'Xin bớt nước béo' },
    { name: 'Bánh mì trứng ốp la + rau sống', calories: 360, protein: 16, carbs: 38, fat: 14, note: 'Bớt bơ/pa tê' },
    { name: 'Xôi gà xé (nhỏ)', calories: 390, protein: 22, carbs: 58, fat: 8 },
    { name: 'Cháo trắng + trứng vịt muối + hành ngò', calories: 340, protein: 14, carbs: 52, fat: 8 },
    { name: 'Bún bò Huế (nửa tô) + rau sống thêm', calories: 360, protein: 20, carbs: 50, fat: 8 },
    { name: 'Bánh cuốn thịt heo (4 cuốn) + rau sống', calories: 350, protein: 18, carbs: 46, fat: 10 },
    { name: 'Hủ tiếu nam vang (ít mì) + giá + cải', calories: 380, protein: 22, carbs: 50, fat: 9 },
  ],
  lunch: [
    { name: 'Cơm nhà: cá kho tộ + canh rau ngót + rau muống', calories: 460, protein: 28, carbs: 55, fat: 12 },
    { name: 'Bún chả Hà Nội (1 suất) + rau sống thêm', calories: 480, protein: 26, carbs: 55, fat: 14 },
    { name: 'Cơm tấm sườn nướng + dưa leo + cà chua', calories: 490, protein: 28, carbs: 56, fat: 13 },
    { name: 'Bún thịt nướng + rau sống + đậu phộng', calories: 470, protein: 24, carbs: 58, fat: 14 },
    { name: 'Bún riêu cua (tô vừa) + rau muống + giá', calories: 420, protein: 22, carbs: 54, fat: 10 },
    { name: 'Cơm nhà: gà kho gừng + canh bí đỏ + rau cải', calories: 440, protein: 30, carbs: 50, fat: 10 },
    { name: 'Mì Quảng gà (1 tô) + rau thơm + đậu phộng', calories: 460, protein: 24, carbs: 58, fat: 12 },
  ],
  dinner: [
    { name: 'Cháo gà xé (nhỏ) + hành ngò + tiêu', calories: 320, protein: 22, carbs: 42, fat: 7, note: 'Dễ tiêu buổi tối' },
    { name: 'Cơm nhà (ít cơm): gà luộc + rau muống + canh bầu', calories: 360, protein: 26, carbs: 38, fat: 9 },
    { name: 'Bún gà luộc (ít bún) + rau sống + sả ớt', calories: 340, protein: 26, carbs: 38, fat: 6 },
    { name: 'Canh chua cá lóc + cơm (nửa chén) + rau sống', calories: 350, protein: 26, carbs: 38, fat: 8 },
    { name: 'Phở bò tái (tô nhỏ) + nhiều giá + chanh', calories: 360, protein: 24, carbs: 46, fat: 7 },
    { name: 'Cơm (ít): trứng hấp thịt băm + dưa leo', calories: 370, protein: 22, carbs: 42, fat: 11 },
    { name: 'Cơm nhà: đậu hũ nhồi thịt sốt cà chua + canh', calories: 380, protein: 20, carbs: 44, fat: 12 },
  ],
  snack: [
    { name: 'Trái cây: ổi + dưa hấu (200g)', calories: 120, protein: 2, carbs: 28, fat: 1 },
    { name: 'Khoai lang luộc (1 củ vừa)', calories: 130, protein: 2, carbs: 30, fat: 0 },
    { name: 'Sữa đậu nành không đường (1 ly)', calories: 100, protein: 8, carbs: 12, fat: 4 },
    { name: 'Chuối tiêu (1 quả) + sữa chua không đường', calories: 170, protein: 6, carbs: 32, fat: 2 },
    { name: 'Ngô luộc (1 trái)', calories: 140, protein: 4, carbs: 30, fat: 2 },
    { name: 'Chè đậu xanh ít đường (1 chén nhỏ)', calories: 160, protein: 6, carbs: 30, fat: 2 },
    { name: 'Đu đủ + thanh long (200g hỗn hợp)', calories: 110, protein: 2, carbs: 26, fat: 1 },
  ],
};

// STRICT: Siết calo — đạm cao, ít mỡ, ít carbs
export const MEALS_STRICT: MealDB = {
  breakfast: [
    { name: '3 trứng luộc + 1 chuối tiêu nhỏ', calories: 260, protein: 20, carbs: 18, fat: 14, note: '🔥 Siết — đạm cao, ít carbs' },
    { name: 'Ức gà luộc (100g) + 1 trứng + rau sống', calories: 230, protein: 28, carbs: 6, fat: 8, note: '🔥 Ít calo nhất' },
    { name: 'Cháo trắng ít gạo (1 chén nhỏ) + 2 trứng luộc', calories: 280, protein: 16, carbs: 32, fat: 9 },
    { name: '2 trứng luộc + khoai lang luộc nhỏ + dưa leo', calories: 270, protein: 15, carbs: 28, fat: 9 },
    { name: 'Ức gà xé luộc (120g) + cơm trắng ít (nửa chén)', calories: 300, protein: 30, carbs: 28, fat: 5, note: '🔥 Thịt gà thuần' },
    { name: 'Sữa đậu nành không đường + 3 trứng luộc', calories: 250, protein: 22, carbs: 10, fat: 14 },
    { name: 'Cháo gà xé không mỡ (nhỏ) + hành ngò', calories: 270, protein: 20, carbs: 32, fat: 4 },
  ],
  lunch: [
    { name: 'Ức gà luộc (200g) + khoai lang luộc (1 củ) + rau luộc nhiều', calories: 380, protein: 42, carbs: 32, fat: 5, note: '🔥 Bữa chuẩn siết' },
    { name: 'Cơm trắng (nửa chén) + gà luộc (180g) + rau muống luộc', calories: 370, protein: 36, carbs: 36, fat: 5 },
    { name: 'Ức gà hấp sả (180g) + bông cải luộc + cà chua', calories: 310, protein: 38, carbs: 12, fat: 6, note: '🔥 Rất sạch' },
    { name: 'Cơm gạo lứt (nửa chén) + gà luộc + canh rau ngót', calories: 360, protein: 34, carbs: 38, fat: 5 },
    { name: '4 trứng luộc + khoai lang (1 củ) + dưa leo + cà chua', calories: 340, protein: 26, carbs: 32, fat: 17 },
    { name: 'Cá hấp gừng hành (200g) + cơm (nửa chén) + rau luộc', calories: 360, protein: 38, carbs: 30, fat: 6 },
    { name: 'Tôm hấp sả (200g) + khoai lang (1 củ) + rau xanh luộc', calories: 330, protein: 36, carbs: 28, fat: 4 },
  ],
  dinner: [
    { name: 'Ức gà luộc (150g) + rau xanh luộc nhiều + dưa leo', calories: 220, protein: 32, carbs: 8, fat: 5, note: '🔥 Nhẹ nhất buổi tối' },
    { name: '3 trứng luộc + salad rau sống + cà chua', calories: 230, protein: 20, carbs: 8, fat: 14 },
    { name: 'Cá fillet hấp hành (150g) + rau muống luộc', calories: 240, protein: 30, carbs: 6, fat: 7 },
    { name: 'Ức gà hấp (150g) + bắp cải luộc + cà rốt luộc', calories: 230, protein: 32, carbs: 10, fat: 4 },
    { name: 'Canh chua tôm (ít cơm hoặc không cơm) + rau sống', calories: 260, protein: 26, carbs: 14, fat: 6 },
    { name: 'Đậu hũ luộc (200g) + gừng + tương ít muối + rau xanh', calories: 210, protein: 20, carbs: 6, fat: 12, note: '🌱 Thực vật' },
    { name: 'Trứng hấp thịt nạc băm (ít) + rau luộc', calories: 250, protein: 24, carbs: 6, fat: 14 },
  ],
  snack: [
    { name: '2 trứng luộc + dưa leo', calories: 155, protein: 13, carbs: 4, fat: 10 },
    { name: 'Khoai lang luộc nhỏ (1 củ)', calories: 90, protein: 2, carbs: 20, fat: 0, note: '🔥 Ít calo nhất' },
    { name: 'Ổi tươi (200g)', calories: 100, protein: 3, carbs: 22, fat: 1 },
    { name: 'Sữa đậu nành không đường (1 ly)', calories: 100, protein: 8, carbs: 12, fat: 4 },
    { name: 'Chuối tiêu (1 quả nhỏ)', calories: 90, protein: 1, carbs: 22, fat: 0 },
    { name: '1 trứng luộc + cà chua + muối tiêu', calories: 80, protein: 7, carbs: 4, fat: 5, note: '🔥 Ít nhất 80 kcal' },
    { name: 'Dưa hấu (300g)', calories: 90, protein: 2, carbs: 22, fat: 0 },
  ],
};

// ─── Workout definitions ─────────────────────────────────────────────────────
export const WORKOUTS: Record<string, WorkoutDef> = {
  rest: {
    key: 'rest', label: 'Nghỉ hoàn toàn', shortLabel: 'Nghỉ',
    duration: 0, calories: 0, type: 'Nghỉ', intensity: 'Nhẹ',
    color: '#94A3B8', bg: '#F1F5F9', icon: '😴',
    exercises: ['Nghỉ ngơi, ngủ đủ giấc', 'Có thể đi bộ nhẹ 15-20 phút nếu muốn'],
  },
  run_easy: {
    key: 'run_easy', label: 'Chạy nhẹ (30 phút)', shortLabel: 'Chạy nhẹ',
    duration: 30, calories: 240, type: 'Cardio', intensity: 'Nhẹ',
    color: '#10B981', bg: '#D1FAE5', icon: '🏃',
    exercises: ['Khởi động đi bộ 5 phút', 'Chạy 5-6km/h × 20 phút', 'Hạ nhiệt đi bộ 5 phút'],
  },
  run_moderate: {
    key: 'run_moderate', label: 'Chạy vừa (45 phút)', shortLabel: 'Chạy vừa',
    duration: 45, calories: 330, type: 'Cardio', intensity: 'Vừa',
    color: '#10B981', bg: '#D1FAE5', icon: '🏃',
    exercises: ['Khởi động 5 phút', 'Chạy đều 6-7km/h × 35 phút', 'Hạ nhiệt + giãn cơ 5 phút'],
  },
  run_hiit: {
    key: 'run_hiit', label: 'Chạy HIIT (35 phút)', shortLabel: 'Chạy HIIT',
    duration: 35, calories: 380, type: 'Cardio HIIT', intensity: 'Cao',
    color: '#F43F5E', bg: '#FFE4E6', icon: '⚡',
    exercises: ['Khởi động 5 phút', 'Chạy nhanh 9km/h × 1 phút → đi bộ × 1 phút (lặp 10 lần)', 'Hạ nhiệt 5 phút'],
  },
  gym_push: {
    key: 'gym_push', label: 'Gym: Push Day', shortLabel: 'Push Day',
    duration: 55, calories: 320, type: 'Sức mạnh', intensity: 'Vừa',
    color: '#6366F1', bg: '#EEF2FF', icon: '🏋️',
    exercises: ['Bench Press 4×10', 'Incline Dumbbell Press 3×12', 'Cable Flyes 3×15', 'Shoulder Press 3×12', 'Lateral Raises 3×15', 'Tricep Pushdown 3×15'],
  },
  gym_pull: {
    key: 'gym_pull', label: 'Gym: Pull Day', shortLabel: 'Pull Day',
    duration: 55, calories: 310, type: 'Sức mạnh', intensity: 'Vừa',
    color: '#6366F1', bg: '#EEF2FF', icon: '🏋️',
    exercises: ['Lat Pulldown 4×12', 'Seated Cable Row 3×12', 'Face Pull 3×15', 'Barbell Curl 3×12', 'Hammer Curl 3×12', 'Rear Delt Fly 3×15'],
  },
  gym_legs: {
    key: 'gym_legs', label: 'Gym: Leg Day', shortLabel: 'Leg Day',
    duration: 60, calories: 380, type: 'Sức mạnh', intensity: 'Cao',
    color: '#6366F1', bg: '#EEF2FF', icon: '🏋️',
    exercises: ['Squat 4×10', 'Romanian Deadlift 3×12', 'Leg Press 3×15', 'Leg Curl 3×15', 'Calf Raises 4×20', 'Walking Lunges 3×12'],
  },
  calis_upper: {
    key: 'calis_upper', label: 'Calis: Upper Body', shortLabel: 'Calis Upper',
    duration: 40, calories: 270, type: 'Thể trọng', intensity: 'Vừa',
    color: '#F59E0B', bg: '#FEF3C7', icon: '💪',
    exercises: ['Push-up 4×15', 'Pike Push-up 3×12', 'Diamond Push-up 3×10', 'Dips (ghế) 3×15', 'Shoulder Tap Plank 3×20'],
  },
  calis_lower: {
    key: 'calis_lower', label: 'Calis: Legs & Core', shortLabel: 'Calis Legs',
    duration: 40, calories: 290, type: 'Thể trọng', intensity: 'Vừa',
    color: '#F59E0B', bg: '#FEF3C7', icon: '💪',
    exercises: ['Squat 4×20', 'Jump Squat 3×15', 'Reverse Lunge 3×12/bên', 'Glute Bridge 3×20', 'Plank 3×60s', 'Mountain Climber 3×30s'],
  },
  calis_full: {
    key: 'calis_full', label: 'Calis: Full Body HIIT', shortLabel: 'Calis HIIT',
    duration: 30, calories: 340, type: 'HIIT', intensity: 'Cao',
    color: '#EC4899', bg: '#FCE7F3', icon: '🔥',
    exercises: ['Burpee 4×10', 'Jump Squat 3×15', 'Push-up 3×15', 'High Knees 3×30s', 'Mountain Climber 3×30s', 'Jumping Jack 3×30s'],
  },
  yoga: {
    key: 'yoga', label: 'Yoga / Giãn cơ', shortLabel: 'Yoga',
    duration: 30, calories: 100, type: 'Phục hồi', intensity: 'Nhẹ',
    color: '#0EA5E9', bg: '#E0F2FE', icon: '🧘',
    exercises: ['Sun Salutation 3 lần', 'Warrior Pose 2 phút/bên', 'Pigeon Pose', 'Child Pose 2 phút', 'Seated Forward Fold'],
  },
};

export const SESSION_OPTIONS = [
  { key: 'rest', label: 'Nghỉ', icon: '😴' },
  { key: 'run_easy', label: 'Chạy nhẹ', icon: '🏃' },
  { key: 'run_moderate', label: 'Chạy vừa', icon: '🏃' },
  { key: 'run_hiit', label: 'Chạy HIIT', icon: '⚡' },
  { key: 'gym_push', label: 'Push Day', icon: '🏋️' },
  { key: 'gym_pull', label: 'Pull Day', icon: '🏋️' },
  { key: 'gym_legs', label: 'Leg Day', icon: '🏋️' },
  { key: 'calis_upper', label: 'Calis Upper', icon: '💪' },
  { key: 'calis_lower', label: 'Calis Legs', icon: '💪' },
  { key: 'calis_full', label: 'Calis HIIT', icon: '🔥' },
  { key: 'yoga', label: 'Yoga', icon: '🧘' },
];

export const DEFAULT_SCHEDULE: DaySession[] = [
  { morning: 'run_easy',    evening: 'rest' },
  { morning: 'gym_push',    evening: 'rest' },
  { morning: 'rest',        evening: 'rest' },
  { morning: 'gym_pull',    evening: 'run_easy' },
  { morning: 'calis_full',  evening: 'rest' },
  { morning: 'gym_legs',    evening: 'rest' },
  { morning: 'yoga',        evening: 'rest' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function pick<T>(arr: T[], seed: number, idx: number): T {
  return arr[(seed + idx) % arr.length];
}

export function getMealDB(mode: DietMode): MealDB {
  return mode === 'strict' ? MEALS_STRICT : MEALS_NORMAL;
}

// Meals for a given weekday (0 = Monday), same picking as the plan page.
export function getDayMeals(mode: DietMode, seed: number, dayIdx: number) {
  const db = getMealDB(mode);
  return {
    breakfast: pick(db.breakfast, seed, dayIdx),
    lunch: pick(db.lunch, seed, dayIdx + 2),
    dinner: pick(db.dinner, seed, dayIdx + 4),
    snack: pick(db.snack, seed, dayIdx + 1),
  };
}

// 0 = Monday … 6 = Sunday
export function getWeekdayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}
