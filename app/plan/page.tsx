'use client';
import { useState, useMemo } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useWeight } from '@/hooks/use-weight';
import {
  calculateBMI, calculateBMR, calculateTDEE, getDailyCalorieTarget, getBMICategory,
} from '@/lib/calculations';
import {
  CalendarDays, Dumbbell, Flame, Timer, CheckCircle,
  ChevronDown, ChevronUp, RefreshCw, ArrowRight, User,
  Coffee, Sun, Moon, Apple, Salad, Zap,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Meal {
  name: string; calories: number; protein: number; carbs: number; fat: number; note?: string;
}
interface WorkoutDef {
  key: string; label: string; shortLabel: string;
  duration: number; calories: number; type: string;
  intensity: 'Nhẹ' | 'Vừa' | 'Cao'; color: string; bg: string; icon: string;
  exercises: string[];
}
type DietMode = 'normal' | 'strict';
type DaySession = { morning: string; evening: string };

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// ─── Meal databases ──────────────────────────────────────────────────────────

// Meal database type
type MealDB = { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[]; snack: Meal[] };

// NORMAL: Món Việt quen thuộc nhẹ nhàng
const MEALS_NORMAL: MealDB = {
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
const MEALS_STRICT: MealDB = {
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
const WORKOUTS: Record<string, WorkoutDef> = {
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

const SESSION_OPTIONS = [
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

const DEFAULT_SCHEDULE: DaySession[] = [
  { morning: 'run_easy',    evening: 'rest' },
  { morning: 'gym_push',    evening: 'rest' },
  { morning: 'rest',        evening: 'rest' },
  { morning: 'gym_pull',    evening: 'run_easy' },
  { morning: 'calis_full',  evening: 'rest' },
  { morning: 'gym_legs',    evening: 'rest' },
  { morning: 'yoga',        evening: 'rest' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pick<T>(arr: T[], seed: number, idx: number): T {
  return arr[(seed + idx) % arr.length];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlanPage() {
  const { profile } = useProfile();
  const { entries: weightEntries } = useWeight();

  const [dietMode, setDietMode] = useState<DietMode>('normal');
  const [schedule, setSchedule] = useState<DaySession[]>(DEFAULT_SCHEDULE);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [seed, setSeed] = useState(0);

  const stats = useMemo(() => {
    if (!profile) return null;
    const currentWeight = weightEntries.length
      ? weightEntries[weightEntries.length - 1].weight
      : profile.currentWeight;
    const bmi = calculateBMI(currentWeight, profile.height);
    const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const calorieTarget = getDailyCalorieTarget(tdee);
    return { bmi, bmiCategory: getBMICategory(bmi), tdee, calorieTarget, currentWeight };
  }, [profile, weightEntries]);

  const meals = dietMode === 'strict' ? MEALS_STRICT : MEALS_NORMAL;

  const setDaySession = (dayIdx: number, slot: 'morning' | 'evening', key: string) => {
    setSchedule((prev) => prev.map((d, i) => i === dayIdx ? { ...d, [slot]: key } : d));
  };

  const totalCalsBurned = schedule.reduce((sum, s) => {
    return sum + (WORKOUTS[s.morning]?.calories ?? 0) + (s.evening !== 'rest' ? (WORKOUTS[s.evening]?.calories ?? 0) : 0);
  }, 0);

  const totalWorkouts = schedule.reduce((n, s) => {
    return n + (s.morning !== 'rest' ? 1 : 0) + (s.evening !== 'rest' ? 1 : 0);
  }, 0);

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Cần hồ sơ cá nhân</h2>
        <p style={{ color: 'var(--muted-foreground)', maxWidth: 360 }}>Điền hồ sơ trước để chúng tôi tính calo mục tiêu cho bạn.</p>
        <Link href="/profile" className="btn btn-primary" style={{ padding: '12px 28px' }}>Tạo hồ sơ <ArrowRight size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Kế hoạch 7 ngày</h1>
            <p className="page-subtitle">Tự chọn lịch tập từng buổi — thực đơn tự động theo chế độ</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setSeed((s) => s + 7)}>
            <RefreshCw size={15} /> Đổi thực đơn
          </button>
        </div>
      </div>

      {/* Stats banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24,
        background: 'linear-gradient(135deg,var(--primary),#059669)', borderRadius: 16, padding: '20px 24px',
      }}>
        {[
          { label: 'Cân nặng', value: `${stats?.currentWeight} kg` },
          { label: 'BMI', value: `${stats?.bmi.toFixed(1)} — ${stats?.bmiCategory}` },
          { label: 'Mục tiêu calo/ngày', value: `${stats?.calorieTarget.toFixed(0)} kcal` },
          { label: 'Tổng buổi tập', value: `${totalWorkouts} buổi/tuần` },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Diet mode toggle */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>
          <Salad size={18} color="var(--primary)" /> Chế độ ăn uống
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Normal */}
          <button onClick={() => setDietMode('normal')} style={{
            padding: '18px 20px', borderRadius: 12, border: `2px solid ${dietMode === 'normal' ? 'var(--primary)' : 'var(--border)'}`,
            background: dietMode === 'normal' ? 'var(--primary-light)' : 'var(--card)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🍚</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: dietMode === 'normal' ? 'var(--primary)' : 'var(--foreground)' }}>Bình thường</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.5 }}>
              Món Việt quen thuộc nhẹ: phở, bún, cơm nhà, cháo. Đủ chất, giảm cân vừa phải.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
              ~{((stats?.calorieTarget ?? 1600)).toFixed(0)} kcal/ngày
            </div>
          </button>

          {/* Strict */}
          <button onClick={() => setDietMode('strict')} style={{
            padding: '18px 20px', borderRadius: 12, border: `2px solid ${dietMode === 'strict' ? '#F43F5E' : 'var(--border)'}`,
            background: dietMode === 'strict' ? '#FFF1F2' : 'var(--card)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🥚</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: dietMode === 'strict' ? '#F43F5E' : 'var(--foreground)' }}>Siết calo 🔥</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.5 }}>
              Trứng luộc, ức gà luộc, rau luộc, ít mỡ — giảm nhanh, sạch, nhiều đạm.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: '#F43F5E' }}>
              ~{Math.round((stats?.calorieTarget ?? 1600) * 0.7)} kcal/ngày (thâm hụt sâu)
            </div>
          </button>
        </div>

        {dietMode === 'strict' && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#FFF7ED', border: '1px solid #FED7AA', fontSize: 13, color: '#C2410C' }}>
            ⚠️ <strong>Chế độ siết:</strong> Chỉ ăn ức gà luộc, trứng luộc, rau luộc, cá hấp. Rất ít mỡ — tập trung giảm nhanh trong 1–4 tuần. Nên uống đủ 2–3L nước/ngày.
          </div>
        )}
      </div>

      {/* Weekly workout planner */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          <CalendarDays size={18} color="var(--secondary)" /> Lịch tập 7 ngày — Tự chọn từng buổi
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DAYS.map((day, i) => {
            const s = schedule[i];
            const mW = WORKOUTS[s.morning];
            const eW = s.evening !== 'rest' ? WORKOUTS[s.evening] : null;
            const dayCalsBurned = (mW?.calories ?? 0) + (eW?.calories ?? 0);

            return (
              <div key={day} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto',
                gap: 12, alignItems: 'center', padding: '12px 16px',
                borderRadius: 12, background: 'var(--muted)',
              }}>
                {/* Day label */}
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{day}</div>

                {/* Morning session */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>☀️ Buổi sáng</div>
                  <SessionSelector
                    value={s.morning}
                    onChange={(v) => setDaySession(i, 'morning', v)}
                  />
                </div>

                {/* Evening session */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🌙 Buổi tối</div>
                  <SessionSelector
                    value={s.evening}
                    onChange={(v) => setDaySession(i, 'evening', v)}
                  />
                </div>

                {/* Calories burned */}
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  {dayCalsBurned > 0 ? (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--destructive)' }}>~{dayCalsBurned}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>kcal đốt</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>😴 Nghỉ</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week summary */}
        <div style={{ marginTop: 16, display: 'flex', gap: 20, padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
            Tổng tuần: {totalWorkouts} buổi tập — ~{totalCalsBurned} kcal đốt
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            Ngày nghỉ hoàn toàn: {schedule.filter((s) => s.morning === 'rest' && s.evening === 'rest').length} ngày
          </div>
        </div>
      </div>

      {/* Daily detail cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DAYS.map((day, i) => {
          const s = schedule[i];
          const mW = WORKOUTS[s.morning];
          const eW = s.evening !== 'rest' ? WORKOUTS[s.evening] : null;
          const isExpanded = expandedDay === i;

          const breakfast = pick(meals.breakfast, seed, i);
          const lunch = pick(meals.lunch, seed, i + 2);
          const dinner = pick(meals.dinner, seed, i + 4);
          const snack = pick(meals.snack, seed, i + 1);
          const dayTotal = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
          const dayCalsBurned = (mW?.calories ?? 0) + (eW?.calories ?? 0);
          const netCal = dayTotal - dayCalsBurned;

          return (
            <div key={day} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header row */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ fontSize: 24 }}>{mW.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{day}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    ☀️ {mW.shortLabel}
                    {eW && <> · 🌙 {eW.shortLabel}</>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{dayTotal} kcal</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                    ăn vào · net {netCal} kcal
                    {dayCalsBurned > 0 && <span style={{ color: 'var(--destructive)' }}> · đốt {dayCalsBurned}</span>}
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={18} color="var(--muted-foreground)" /> : <ChevronDown size={18} color="var(--muted-foreground)" />}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>
                  {/* Meals */}
                  <div>
                    <div className="section-title" style={{ marginBottom: 14 }}>
                      <span style={{ fontSize: 16 }}>🍽</span> Thực đơn {dietMode === 'strict' ? '(Siết 🔥)' : ''}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {([
                        { label: 'Sáng', meal: breakfast, icon: '☀️', color: '#F59E0B', bg: '#FEF9C3' },
                        { label: 'Trưa', meal: lunch, icon: '🌤', color: '#10B981', bg: '#DCFCE7' },
                        { label: 'Tối', meal: dinner, icon: '🌙', color: '#6366F1', bg: '#EEF2FF' },
                        { label: 'Ăn vặt', meal: snack, icon: '🍎', color: '#EC4899', bg: '#FDF2F8' },
                      ] as { label: string; meal: Meal; icon: string; color: string; bg: string }[]).map(({ label, meal, icon, color, bg }) => (
                        <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: bg }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                                {icon} {label}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, lineHeight: 1.4 }}>{meal.name}</div>
                              {meal.note && <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{meal.note}</div>}
                              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3 }}>
                                🥩 Đạm {meal.protein}g · 🌾 Tinh bột {meal.carbs}g · 🫒 Béo {meal.fat}g
                              </div>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 800, color, flexShrink: 0, marginLeft: 10 }}>
                              {meal.calories} kcal
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Daily total */}
                    <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Tổng thực phẩm</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{dayTotal} kcal</span>
                    </div>
                  </div>

                  {/* Workouts */}
                  <div>
                    <div className="section-title" style={{ marginBottom: 14 }}>
                      <Dumbbell size={16} color="var(--secondary)" /> Lịch tập hôm nay
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[{ slot: '☀️ Buổi sáng', w: mW }, ...(eW ? [{ slot: '🌙 Buổi tối', w: eW }] : [])].map(({ slot, w }) => (
                        <div key={slot} style={{ background: w.bg, borderRadius: 12, padding: '14px 16px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: w.color, marginBottom: 6 }}>{slot}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 14 }}>{w.icon} {w.label}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{w.type}</div>
                            </div>
                            <span style={{
                              padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                              background: w.intensity === 'Cao' ? '#FFE4E6' : w.intensity === 'Vừa' ? '#FEF3C7' : '#F1F5F9',
                              color: w.intensity === 'Cao' ? '#F43F5E' : w.intensity === 'Vừa' ? '#D97706' : '#64748B',
                            }}>{w.intensity}</span>
                          </div>
                          {w.duration > 0 && (
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: 10 }}>
                              <span style={{ color: w.color, fontWeight: 600 }}><Timer size={12} style={{ display: 'inline' }} /> {w.duration} phút</span>
                              <span style={{ color: '#F43F5E', fontWeight: 600 }}><Flame size={12} style={{ display: 'inline' }} /> ~{w.calories} kcal</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {w.exercises.map((ex, ei) => (
                              <div key={ei} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--foreground)' }}>
                                <CheckCircle size={13} color={w.color} style={{ flexShrink: 0, marginTop: 1 }} />
                                {ex}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Net calories */}
                      {dayCalsBurned > 0 && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FFF1F2', border: '1px solid #FFE4E6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Ăn vào</span>
                            <span style={{ fontWeight: 700 }}>{dayTotal} kcal</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#F43F5E' }}>Đốt tập luyện</span>
                            <span style={{ fontWeight: 700, color: '#F43F5E' }}>- {dayCalsBurned} kcal</span>
                          </div>
                          <div className="divider" style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span style={{ fontWeight: 700 }}>Net calories</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{netCal} kcal</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      <div className="card" style={{ marginTop: 12, background: 'linear-gradient(135deg,#0F172A,#1E293B)', border: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, textAlign: 'center' }}>
          {[
            { label: 'Tổng buổi tập', val: `${totalWorkouts} buổi` },
            { label: 'Calo đốt tập', val: `~${totalCalsBurned} kcal` },
            { label: 'Ngày nghỉ hoàn toàn', val: `${schedule.filter((s) => s.morning === 'rest' && s.evening === 'rest').length} ngày` },
            { label: 'Giảm ~', val: `${(totalCalsBurned / 7700).toFixed(2)} kg/tuần` },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SessionSelector dropdown ──────────────────────────────────────────────
function SessionSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const w = WORKOUTS[value];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 10px',
        borderRadius: 8,
        border: `1.5px solid ${value === 'rest' ? 'var(--border)' : w.color}`,
        backgroundColor: w.bg,
        color: value === 'rest' ? 'var(--muted-foreground)' : w.color,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        paddingRight: '28px',
      }}
    >
      {SESSION_OPTIONS.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.icon} {opt.label}
        </option>
      ))}
    </select>
  );
}
