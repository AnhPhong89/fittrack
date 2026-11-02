'use client';
import { useState, useMemo } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { usePlan } from '@/hooks/use-plan';
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

import {
  Meal, DAYS, WORKOUTS, SESSION_OPTIONS, getDayMeals, getWeekdayIndex,
} from '@/lib/plan-data';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlanPage() {
  const { profile } = useProfile();
  const { entries: weightEntries } = useWeight();

  const { plan, updatePlan } = usePlan();
  const { dietMode, schedule, seed } = plan;
  const [expandedDay, setExpandedDay] = useState<number | null>(() => getWeekdayIndex());

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

  const setDaySession = (dayIdx: number, slot: 'morning' | 'evening', key: string) => {
    updatePlan({ schedule: schedule.map((d, i) => i === dayIdx ? { ...d, [slot]: key } : d) });
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
          <button className="btn btn-secondary" onClick={() => updatePlan({ seed: seed + 7 })}>
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
          <button onClick={() => updatePlan({ dietMode: 'normal' })} style={{
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
          <button onClick={() => updatePlan({ dietMode: 'strict' })} style={{
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

          const { breakfast, lunch, dinner, snack } = getDayMeals(dietMode, seed, i);
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
