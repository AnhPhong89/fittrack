'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Check, Sun, Moon, Coffee, Soup, Utensils, Apple, Footprints, Bike, Waves,
  Dumbbell, Zap, Flower2, Flame, Timer, Plus, Shuffle, Hand, type LucideIcon,
} from 'lucide-react';
import { ExerciseEntry, MealEntry, PlanState } from '@/lib/types';
import {
  WORKOUTS, getSlotMeal, getWeekdayIndex, findMeal, DAYS, PORTION_GUIDE, type MealSlot,
} from '@/lib/plan-data';
import { caloriesFromMET } from '@/lib/calculations';

const MEAL_SLOTS: { slot: MealSlot; label: string; Icon: LucideIcon }[] = [
  { slot: 'breakfast', label: 'Bữa sáng', Icon: Coffee },
  { slot: 'lunch', label: 'Bữa trưa', Icon: Soup },
  { slot: 'dinner', label: 'Bữa tối', Icon: Utensils },
  { slot: 'snack', label: 'Ăn vặt', Icon: Apple },
];

// MET values from the Compendium of Physical Activities (approximate)
const QUICK_ACTIVITIES: { key: string; name: string; met: number; type: ExerciseEntry['type']; Icon: LucideIcon }[] = [
  { key: 'run', name: 'Chạy bộ', met: 8.3, type: 'cardio', Icon: Footprints },
  { key: 'walk', name: 'Đi bộ nhanh', met: 4.3, type: 'cardio', Icon: Footprints },
  { key: 'bike', name: 'Đạp xe', met: 7.5, type: 'cardio', Icon: Bike },
  { key: 'swim', name: 'Bơi lội', met: 7, type: 'cardio', Icon: Waves },
  { key: 'gym', name: 'Tập gym', met: 5, type: 'strength', Icon: Dumbbell },
  { key: 'hiit', name: 'HIIT / Nhảy dây', met: 10, type: 'cardio', Icon: Zap },
  { key: 'yoga', name: 'Yoga / Giãn cơ', met: 2.5, type: 'flexibility', Icon: Flower2 },
];

const DURATIONS = [15, 30, 45, 60];

const WORKOUT_TYPE: Record<string, ExerciseEntry['type']> = {
  'Cardio': 'cardio', 'Cardio HIIT': 'cardio', 'HIIT': 'cardio',
  'Sức mạnh': 'strength', 'Thể trọng': 'strength', 'Phục hồi': 'flexibility',
};

interface Props {
  date: string;
  weightKg: number;
  plan: PlanState;
  meals: MealEntry[];
  exercises: ExerciseEntry[];
  addMeal: (e: MealEntry) => void;
  deleteMeal: (id: string) => void;
  addExercise: (e: ExerciseEntry) => void;
  deleteExercise: (id: string) => void;
  onDietModeChange: (mode: PlanState['dietMode']) => void;
}

export function TodayCheckin({
  date, weightKg, plan, meals, exercises, addMeal, deleteMeal, addExercise, deleteExercise, onDietModeChange,
}: Props) {
  const dayIdx = getWeekdayIndex(new Date(`${date}T00:00:00`));
  const session = plan.schedule[dayIdx];
  // "Món khác" swaps, per diet mode + slot; not persisted (the ticked dish is what gets saved)
  const [swaps, setSwaps] = useState<Record<string, number>>({});
  const swapKey = (slot: MealSlot) => `${plan.dietMode}-${slot}`;
  const mealFor = (slot: MealSlot) => getSlotMeal(plan.dietMode, plan.seed, dayIdx, slot, swaps[swapKey(slot)] ?? 0);

  // Checked items are stored as regular entries with deterministic ids,
  // so they also show up on the Nutrition / Exercise pages.
  const mealId = (slot: MealSlot) => `plan-${date}-meal-${slot}`;
  const sessionId = (slot: 'morning' | 'evening') => `plan-${date}-${slot}`;
  const quickId = (key: string) => `quick-${date}-${key}`;

  const mealById = new Map(meals.map((m) => [m.id, m]));
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  const toggleMeal = (slot: MealSlot) => {
    const id = mealId(slot);
    if (mealById.has(id)) return deleteMeal(id);
    const m = mealFor(slot);
    addMeal({ id, date, mealType: slot, name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat });
  };

  const toggleSession = (slot: 'morning' | 'evening') => {
    const id = sessionId(slot);
    if (exerciseById.has(id)) return deleteExercise(id);
    const w = WORKOUTS[session[slot]];
    addExercise({ id, date, name: w.label, duration: w.duration, caloriesBurned: w.calories, type: WORKOUT_TYPE[w.type] ?? 'other' });
  };

  const setQuick = (a: (typeof QUICK_ACTIVITIES)[number], minutes: number | null) => {
    const id = quickId(a.key);
    if (exerciseById.has(id)) deleteExercise(id);
    if (minutes) {
      addExercise({ id, date, name: a.name, duration: minutes, caloriesBurned: caloriesFromMET(a.met, weightKg, minutes), type: a.type });
    }
  };

  const plannedSessions = (['morning', 'evening'] as const).filter((slot) => session[slot] !== 'rest');
  const managedIds = new Set([
    ...MEAL_SLOTS.map((m) => mealId(m.slot)),
    ...(['morning', 'evening'] as const).map(sessionId),
    ...QUICK_ACTIVITIES.map((a) => quickId(a.key)),
  ]);
  const otherMeals = meals.filter((m) => !managedIds.has(m.id));
  const otherExercises = exercises.filter((e) => !managedIds.has(e.id));

  return (
    <section className="card" aria-labelledby="checkin-title">
      <div className="checkin-header">
        <div>
          <h2 id="checkin-title" className="section-title" style={{ marginBottom: 2 }}>Hôm nay bạn đã làm gì?</h2>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            Tick vào những gì đã ăn và đã tập — calo được cộng trừ ngay lập tức.
          </p>
        </div>
        <span className="badge badge-green">{DAYS[dayIdx]}</span>
      </div>

      <div className="diet-toggle" role="radiogroup" aria-label="Chế độ ăn hôm nay">
        {([
          { mode: 'normal', label: 'Bình thường', hint: 'Món Việt quen thuộc' },
          { mode: 'strict', label: 'Siết calo', hint: 'Đạm cao, ít tinh bột' },
        ] as const).map((o) => (
          <button
            key={o.mode}
            type="button"
            role="radio"
            aria-checked={plan.dietMode === o.mode}
            className={`diet-option ${o.mode} ${plan.dietMode === o.mode ? 'active' : ''}`}
            onClick={() => onDietModeChange(o.mode)}
          >
            <span style={{ fontWeight: 700 }}>{o.label}</span>
            <span style={{ fontSize: 12, opacity: 0.8 }}>{o.hint}</span>
          </button>
        ))}
      </div>

      <div className="checkin-grid">
        {/* Meals */}
        <div>
          <h3 className="checkin-group-title"><Utensils size={15} aria-hidden /> Bữa ăn theo thực đơn <span>+ calo</span></h3>
          <div className="check-list">
            {MEAL_SLOTS.map(({ slot, label, Icon }) => {
              // Once ticked, show what was actually logged, even if the mode or swap changed since.
              const logged = mealById.get(mealId(slot));
              const meal = logged
                ? { name: logged.name, calories: logged.calories, portion: findMeal(logged.name)?.portion }
                : mealFor(slot);
              return (
                <div key={slot} className={`check-item amber meal ${logged ? 'checked' : ''}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={!!logged}
                    className="check-main"
                    onClick={() => toggleMeal(slot)}
                  >
                    <span className="check-box" aria-hidden>{logged && <Check size={14} strokeWidth={3} />}</span>
                    <Icon size={18} aria-hidden className="check-icon" />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="check-overline">{label}</span>
                      <span className="check-title wrap">{meal.name}</span>
                      {meal.portion && <span className="check-portion"><Hand size={12} aria-hidden /> {meal.portion}</span>}
                    </span>
                    <span className="check-value num">+{meal.calories}</span>
                  </button>
                  {!logged && (
                    <button
                      type="button"
                      className="swap-btn"
                      onClick={() => setSwaps((p) => ({ ...p, [swapKey(slot)]: (p[swapKey(slot)] ?? 0) + 1 }))}
                      aria-label={`Đổi món khác cho ${label.toLowerCase()}`}
                    >
                      <Shuffle size={14} aria-hidden /> Món khác
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <details className="portion-guide">
            <summary><Hand size={14} aria-hidden /> Không có cân? Cách ước lượng khẩu phần</summary>
            <ul>
              {PORTION_GUIDE.map((g) => (
                <li key={g.measure}>
                  <strong>{g.measure}</strong>
                  <span>{g.means}</span>
                  <em className="num">{g.approx}</em>
                </li>
              ))}
            </ul>
          </details>
          {otherMeals.length > 0 && (
            <p className="checkin-extra">
              + {otherMeals.length} món ghi thêm ({otherMeals.reduce((s, m) => s + m.calories, 0)} kcal)
            </p>
          )}
          <Link href="/nutrition" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
            <Plus size={14} aria-hidden /> Ăn món khác? Ghi thủ công
          </Link>
        </div>

        {/* Workouts */}
        <div>
          <h3 className="checkin-group-title"><Flame size={15} aria-hidden /> Tập luyện <span>− calo</span></h3>

          {plannedSessions.length > 0 ? (
            <div className="check-list" style={{ marginBottom: 16 }}>
              {plannedSessions.map((slot) => {
                const w = WORKOUTS[session[slot]];
                return (
                  <CheckItem
                    key={slot}
                    checked={exerciseById.has(sessionId(slot))}
                    onToggle={() => toggleSession(slot)}
                    Icon={slot === 'morning' ? Sun : Moon}
                    overline={`Kế hoạch · ${slot === 'morning' ? 'Buổi sáng' : 'Buổi tối'}`}
                    title={w.label}
                    value={`−${w.calories}`}
                    tone="blue"
                  />
                );
              })}
            </div>
          ) : (
            <p className="checkin-extra" style={{ marginBottom: 12 }}>
              Hôm nay là ngày nghỉ theo <Link href="/plan" style={{ color: 'var(--primary)' }}>kế hoạch</Link>. Có vận động thêm thì tick bên dưới.
            </p>
          )}

          <div className="checkin-subtitle">Hoạt động khác (tính theo cân nặng {weightKg} kg)</div>
          <div className="check-list">
            {QUICK_ACTIVITIES.map((a) => {
              const entry = exerciseById.get(quickId(a.key));
              const minutes = entry?.duration ?? 30;
              return (
                <div key={a.key} className={`check-item quick ${entry ? 'checked' : ''}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={!!entry}
                    className="check-main"
                    onClick={() => setQuick(a, entry ? null : minutes)}
                  >
                    <span className="check-box" aria-hidden>{entry && <Check size={14} strokeWidth={3} />}</span>
                    <a.Icon size={18} aria-hidden className="check-icon" />
                    <span className="check-title">{a.name}</span>
                  </button>
                  <div className="duration-group" role="group" aria-label={`Thời gian ${a.name}`}>
                    <Timer size={13} aria-hidden style={{ color: 'var(--muted-foreground)' }} />
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={!!entry && entry.duration === d}
                        className={`duration-chip ${entry && entry.duration === d ? 'active' : ''}`}
                        onClick={() => setQuick(a, d)}
                      >
                        {d}&apos;
                      </button>
                    ))}
                  </div>
                  <span className="check-value num" style={{ color: entry ? 'var(--secondary)' : 'var(--muted-foreground)' }}>
                    −{entry ? entry.caloriesBurned : caloriesFromMET(a.met, weightKg, minutes)}
                  </span>
                </div>
              );
            })}
          </div>
          {otherExercises.length > 0 && (
            <p className="checkin-extra">
              + {otherExercises.length} bài ghi thêm ({otherExercises.reduce((s, e) => s + e.caloriesBurned, 0)} kcal)
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function CheckItem({ checked, onToggle, Icon, overline, title, value, tone }: {
  checked: boolean; onToggle: () => void; Icon: LucideIcon;
  overline: string; title: string; value: string; tone: 'amber' | 'blue';
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`check-item ${tone} ${checked ? 'checked' : ''}`}
    >
      <span className="check-box" aria-hidden>{checked && <Check size={14} strokeWidth={3} />}</span>
      <Icon size={18} aria-hidden className="check-icon" />
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span className="check-overline">{overline}</span>
        <span className="check-title">{title}</span>
      </span>
      <span className="check-value num">{value}</span>
    </button>
  );
}
