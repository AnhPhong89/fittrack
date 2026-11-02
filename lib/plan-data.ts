// Shared weekly-plan data: used by /plan and the dashboard's daily check-in.

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Meal {
  name: string; calories: number; protein: number; carbs: number; fat: number; note?: string;
  portion: string; // how much to eat, measured by hand / bowl / pieces (no kitchen scale needed)
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

// ─── Portion guide (no scale) ────────────────────────────────────────────────
// Hand sizes scale with the person, so these stay roughly right for anyone.
export const PORTION_GUIDE = [
  { measure: '1 lòng bàn tay', means: 'Thịt / cá / đậu hũ dày bằng lòng bàn tay (không tính ngón)', approx: '≈ 100 g ≈ 25 g đạm' },
  { measure: '1 chén cơm', means: 'Chén (bát) ăn cơm ở nhà, xới ngang miệng chén, không nén', approx: '≈ 150 g ≈ 200 kcal' },
  { measure: '1 nắm tay', means: 'Khoai, trái cây, bún/mì đã nấu to bằng nắm tay', approx: '≈ 150 g' },
  { measure: '2 bàn tay khum', means: 'Rau xanh luộc / sống — ăn bao nhiêu cũng được', approx: '≈ 30–50 kcal' },
  { measure: '1 đốt ngón cái', means: 'Dầu ăn, mỡ, bơ đậu phộng, nước sốt béo', approx: '≈ 1 thìa ≈ 45–90 kcal' },
  { measure: 'Tô nhỏ', means: 'Gọi “tô nhỏ / ít bánh” ở quán; bỏ bớt nước béo và không ăn hết nước', approx: '≈ 350 kcal' },
];

// ─── Meal databases ──────────────────────────────────────────────────────────
// Index = weekday rotation (see getDayMeals). Calories are estimates for the portion described.
export type MealDB = { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[]; snack: Meal[] };

// NORMAL: Món Việt quen thuộc nhẹ nhàng
export const MEALS_NORMAL: MealDB = {
  breakfast: [
    { name: 'Phở gà tô nhỏ + thêm rau giá', calories: 370, protein: 24, carbs: 50, fat: 7, note: 'Xin bớt nước béo', portion: 'Gọi tô nhỏ · ăn hết rau giá · bỏ lại ⅓ nước dùng' },
    { name: 'Bánh mì trứng ốp la + rau sống', calories: 360, protein: 16, carbs: 38, fat: 14, note: 'Bớt bơ/pa tê', portion: '1 ổ bánh mì · 1 trứng ốp · không bơ, không pa tê' },
    { name: 'Xôi gà xé', calories: 390, protein: 22, carbs: 58, fat: 8, portion: 'Xôi bằng 1 nắm tay · gà 1 lòng bàn tay · bỏ mỡ hành' },
    { name: 'Cháo trắng + trứng vịt muối + hành ngò', calories: 340, protein: 14, carbs: 52, fat: 8, portion: '1 tô cháo vừa · 1 quả trứng muối' },
    { name: 'Bún bò Huế nửa tô + rau sống thêm', calories: 360, protein: 20, carbs: 50, fat: 8, portion: 'Gọi ít bún · không ăn mỡ nổi · uống ít nước dùng' },
    { name: 'Bánh cuốn thịt heo + rau sống', calories: 350, protein: 18, carbs: 46, fat: 10, portion: '4 cuốn · nước chấm vừa phải · bỏ hành phi' },
    { name: 'Hủ tiếu Nam Vang ít mì + giá + cải', calories: 380, protein: 22, carbs: 50, fat: 9, portion: 'Gọi ít hủ tiếu · thêm giá cải · bỏ tóp mỡ' },
  ],
  lunch: [
    { name: 'Cơm nhà: cá kho tộ + canh rau ngót + rau muống', calories: 460, protein: 28, carbs: 55, fat: 12, portion: '1 chén cơm · cá 1 lòng bàn tay · rau 2 bàn tay khum' },
    { name: 'Bún chả Hà Nội + rau sống thêm', calories: 480, protein: 26, carbs: 55, fat: 14, portion: 'Bún 1 nắm tay · 4–5 miếng chả · rau thoải mái' },
    { name: 'Cơm tấm sườn nướng + dưa leo + cà chua', calories: 490, protein: 28, carbs: 56, fat: 13, portion: '1 chén cơm tấm · 1 miếng sườn cỡ lòng bàn tay · bỏ mỡ hành' },
    { name: 'Bún thịt nướng + rau sống + đậu phộng', calories: 470, protein: 24, carbs: 58, fat: 14, portion: 'Bún 1 nắm tay · thịt 1 lòng bàn tay · đậu phộng 1 nhúm nhỏ' },
    { name: 'Bún riêu cua tô vừa + rau muống + giá', calories: 420, protein: 22, carbs: 54, fat: 10, portion: '1 tô vừa · ăn nhiều rau · bỏ bớt dầu điều' },
    { name: 'Cơm nhà: gà kho gừng + canh bí đỏ + rau cải', calories: 440, protein: 30, carbs: 50, fat: 10, portion: '1 chén cơm · gà 1 lòng bàn tay (bỏ da) · rau 2 bàn tay khum' },
    { name: 'Mì Quảng gà + rau thơm + đậu phộng', calories: 460, protein: 24, carbs: 58, fat: 12, portion: '1 tô vừa · mì 1 nắm tay · bánh tráng ½ miếng' },
  ],
  dinner: [
    { name: 'Cháo gà xé + hành ngò + tiêu', calories: 320, protein: 22, carbs: 42, fat: 7, note: 'Dễ tiêu buổi tối', portion: '1 tô nhỏ · gà 1 lòng bàn tay' },
    { name: 'Cơm nhà ít cơm: gà luộc + rau muống + canh bầu', calories: 360, protein: 26, carbs: 38, fat: 9, portion: '½ chén cơm · gà 1 lòng bàn tay (bỏ da) · rau 2 bàn tay khum' },
    { name: 'Bún gà luộc ít bún + rau sống + sả ớt', calories: 340, protein: 26, carbs: 38, fat: 6, portion: 'Bún ½ nắm tay · gà 1 lòng bàn tay' },
    { name: 'Canh chua cá lóc + cơm nửa chén + rau sống', calories: 350, protein: 26, carbs: 38, fat: 8, portion: '½ chén cơm · cá 1 lòng bàn tay · canh 1 tô' },
    { name: 'Phở bò tái tô nhỏ + nhiều giá + chanh', calories: 360, protein: 24, carbs: 46, fat: 7, portion: 'Gọi tô nhỏ · bỏ lại ⅓ nước dùng' },
    { name: 'Cơm ít: trứng hấp thịt băm + dưa leo', calories: 370, protein: 22, carbs: 42, fat: 11, portion: '½ chén cơm · trứng hấp 1 chén nhỏ · dưa leo thoải mái' },
    { name: 'Cơm nhà: đậu hũ nhồi thịt sốt cà chua + canh', calories: 380, protein: 20, carbs: 44, fat: 12, portion: '½ chén cơm · 2–3 miếng đậu hũ · canh rau 1 tô' },
  ],
  snack: [
    { name: 'Trái cây: ổi + dưa hấu', calories: 120, protein: 2, carbs: 28, fat: 1, portion: '½ quả ổi + 1 miếng dưa hấu tam giác cỡ bàn tay' },
    { name: 'Khoai lang luộc', calories: 130, protein: 2, carbs: 30, fat: 0, portion: '1 củ to bằng nắm tay' },
    { name: 'Sữa đậu nành không đường', calories: 100, protein: 8, carbs: 12, fat: 4, portion: '1 ly / 1 hộp ~ 250 ml' },
    { name: 'Chuối tiêu + sữa chua không đường', calories: 170, protein: 6, carbs: 32, fat: 2, portion: '1 quả chuối · 1 hộp sữa chua' },
    { name: 'Ngô luộc', calories: 140, protein: 4, carbs: 30, fat: 2, portion: '1 trái vừa' },
    { name: 'Chè đậu xanh ít đường', calories: 160, protein: 6, carbs: 30, fat: 2, portion: '1 chén nhỏ (chén nước chấm lớn)' },
    { name: 'Đu đủ + thanh long', calories: 110, protein: 2, carbs: 26, fat: 1, portion: 'Tổng 1 nắm tay to' },
  ],
};

// STRICT: Siết calo — đạm cao, ít mỡ, ít carbs
export const MEALS_STRICT: MealDB = {
  breakfast: [
    { name: '3 trứng luộc + 1 chuối tiêu nhỏ', calories: 260, protein: 20, carbs: 18, fat: 14, note: '🔥 Siết — đạm cao, ít carbs', portion: '3 quả trứng · 1 quả chuối nhỏ' },
    { name: 'Ức gà luộc + 1 trứng + rau sống', calories: 230, protein: 28, carbs: 6, fat: 8, note: '🔥 Ít calo nhất', portion: 'Ức gà 1 lòng bàn tay · 1 quả trứng · rau thoải mái' },
    { name: 'Cháo trắng ít gạo + 2 trứng luộc', calories: 280, protein: 16, carbs: 32, fat: 9, portion: '1 chén cháo nhỏ · 2 quả trứng' },
    { name: '2 trứng luộc + khoai lang + dưa leo', calories: 270, protein: 15, carbs: 28, fat: 9, portion: '2 quả trứng · khoai ½ nắm tay · dưa leo 1 quả' },
    { name: 'Ức gà xé luộc + cơm trắng ít', calories: 300, protein: 30, carbs: 28, fat: 5, note: '🔥 Thịt gà thuần', portion: 'Gà hơn 1 lòng bàn tay · ½ chén cơm' },
    { name: 'Sữa đậu nành không đường + 3 trứng luộc', calories: 250, protein: 22, carbs: 10, fat: 14, portion: '1 ly sữa ~ 250 ml · 3 quả trứng' },
    { name: 'Cháo gà xé không mỡ + hành ngò', calories: 270, protein: 20, carbs: 32, fat: 4, portion: '1 tô nhỏ · gà 1 lòng bàn tay · không da' },
  ],
  lunch: [
    { name: 'Ức gà luộc + khoai lang luộc + rau luộc nhiều', calories: 380, protein: 42, carbs: 32, fat: 5, note: '🔥 Bữa chuẩn siết', portion: 'Ức gà 2 lòng bàn tay · khoai 1 nắm tay · rau 2 bàn tay khum' },
    { name: 'Cơm trắng + gà luộc + rau muống luộc', calories: 370, protein: 36, carbs: 36, fat: 5, portion: '½ chén cơm · gà gần 2 lòng bàn tay (bỏ da) · rau thoải mái' },
    { name: 'Ức gà hấp sả + bông cải luộc + cà chua', calories: 310, protein: 38, carbs: 12, fat: 6, note: '🔥 Rất sạch', portion: 'Ức gà gần 2 lòng bàn tay · bông cải 2 bàn tay khum' },
    { name: 'Cơm gạo lứt + gà luộc + canh rau ngót', calories: 360, protein: 34, carbs: 38, fat: 5, portion: '½ chén cơm lứt · gà 1,5 lòng bàn tay · canh 1 tô' },
    { name: '4 trứng luộc + khoai lang + dưa leo + cà chua', calories: 340, protein: 26, carbs: 32, fat: 17, portion: '4 quả trứng (có thể bỏ 1–2 lòng đỏ) · khoai 1 nắm tay' },
    { name: 'Cá hấp gừng hành + cơm + rau luộc', calories: 360, protein: 38, carbs: 30, fat: 6, portion: 'Cá 2 lòng bàn tay · ½ chén cơm · rau 2 bàn tay khum' },
    { name: 'Tôm hấp sả + khoai lang + rau xanh luộc', calories: 330, protein: 36, carbs: 28, fat: 4, portion: 'Tôm khoảng 10–12 con vừa · khoai 1 nắm tay · rau thoải mái' },
  ],
  dinner: [
    { name: 'Ức gà luộc + rau xanh luộc nhiều + dưa leo', calories: 220, protein: 32, carbs: 8, fat: 5, note: '🔥 Nhẹ nhất buổi tối', portion: 'Ức gà 1,5 lòng bàn tay · rau 2 bàn tay khum · không cơm' },
    { name: '3 trứng luộc + salad rau sống + cà chua', calories: 230, protein: 20, carbs: 8, fat: 14, portion: '3 quả trứng · rau trộn chanh muối, không sốt mayonnaise' },
    { name: 'Cá phi lê hấp hành + rau muống luộc', calories: 240, protein: 30, carbs: 6, fat: 7, portion: 'Cá 1,5 lòng bàn tay · rau 2 bàn tay khum · không cơm' },
    { name: 'Ức gà hấp + bắp cải luộc + cà rốt luộc', calories: 230, protein: 32, carbs: 10, fat: 4, portion: 'Ức gà 1,5 lòng bàn tay · rau củ 2 bàn tay khum' },
    { name: 'Canh chua tôm + rau sống (ít hoặc không cơm)', calories: 260, protein: 26, carbs: 14, fat: 6, portion: '1 tô canh · tôm 8–10 con · tối đa 2 thìa cơm' },
    { name: 'Đậu hũ luộc + gừng + tương ít muối + rau xanh', calories: 210, protein: 20, carbs: 6, fat: 12, note: '🌱 Thực vật', portion: 'Đậu hũ 2 lòng bàn tay (~1 bìa rưỡi) · rau thoải mái' },
    { name: 'Trứng hấp thịt nạc băm + rau luộc', calories: 250, protein: 24, carbs: 6, fat: 14, portion: '1 chén trứng hấp (2 trứng + 1 nhúm thịt) · rau 2 bàn tay khum' },
  ],
  snack: [
    { name: '2 trứng luộc + dưa leo', calories: 155, protein: 13, carbs: 4, fat: 10, portion: '2 quả trứng · 1 quả dưa leo' },
    { name: 'Khoai lang luộc nhỏ', calories: 90, protein: 2, carbs: 20, fat: 0, note: '🔥 Ít calo nhất', portion: '1 củ nhỏ bằng ½ nắm tay' },
    { name: 'Ổi tươi', calories: 100, protein: 3, carbs: 22, fat: 1, portion: '1 quả vừa (cỡ nắm tay)' },
    { name: 'Sữa đậu nành không đường', calories: 100, protein: 8, carbs: 12, fat: 4, portion: '1 ly / 1 hộp ~ 250 ml' },
    { name: 'Chuối tiêu nhỏ', calories: 90, protein: 1, carbs: 22, fat: 0, portion: '1 quả nhỏ' },
    { name: '1 trứng luộc + cà chua + muối tiêu', calories: 80, protein: 7, carbs: 4, fat: 5, note: '🔥 Ít nhất 80 kcal', portion: '1 quả trứng · 1 quả cà chua' },
    { name: 'Dưa hấu', calories: 90, protein: 2, carbs: 22, fat: 0, portion: '2 miếng tam giác cỡ bàn tay' },
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

export type MealSlot = keyof MealDB;

// Each slot is shifted so the same weekday doesn't get dishes from the same row.
const SLOT_SHIFT: Record<MealSlot, number> = { breakfast: 0, lunch: 2, dinner: 4, snack: 1 };

// Meal for one slot on a weekday (0 = Monday); `offset` lets the user swap to another dish.
export function getSlotMeal(mode: DietMode, seed: number, dayIdx: number, slot: MealSlot, offset = 0): Meal {
  return pick(getMealDB(mode)[slot], seed + offset, dayIdx + SLOT_SHIFT[slot]);
}

export function getDayMeals(mode: DietMode, seed: number, dayIdx: number): Record<MealSlot, Meal> {
  return {
    breakfast: getSlotMeal(mode, seed, dayIdx, 'breakfast'),
    lunch: getSlotMeal(mode, seed, dayIdx, 'lunch'),
    dinner: getSlotMeal(mode, seed, dayIdx, 'dinner'),
    snack: getSlotMeal(mode, seed, dayIdx, 'snack'),
  };
}

// 0 = Monday … 6 = Sunday
export function getWeekdayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

export function findMeal(name: string): Meal | undefined {
  for (const db of [MEALS_NORMAL, MEALS_STRICT]) {
    for (const list of Object.values(db)) {
      const m = list.find((x) => x.name === name);
      if (m) return m;
    }
  }
  return undefined;
}
