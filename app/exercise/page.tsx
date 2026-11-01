'use client';
import { useState } from 'react';
import { useExercise } from '@/hooks/use-exercise';
import { ExerciseEntry } from '@/lib/types';
import { generateId, getTodayISO, formatDate } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dumbbell, Plus, Trash2, Flame, Clock, Heart, Zap } from 'lucide-react';

const EXERCISE_TYPES = [
  { value: 'cardio', label: 'Cardio', color: '#F43F5E', bg: '#FFE4E6' },
  { value: 'strength', label: 'Sức mạnh', color: '#6366F1', bg: '#EEF2FF' },
  { value: 'flexibility', label: 'Linh hoạt', color: '#10B981', bg: '#D1FAE5' },
  { value: 'other', label: 'Khác', color: '#F59E0B', bg: '#FEF3C7' },
] as const;

const POPULAR_EXERCISES = [
  { name: 'Chạy bộ', type: 'cardio', calPerMin: 10 },
  { name: 'Đi bộ nhanh', type: 'cardio', calPerMin: 5 },
  { name: 'Đạp xe', type: 'cardio', calPerMin: 8 },
  { name: 'Bơi lội', type: 'cardio', calPerMin: 9 },
  { name: 'Nhảy dây', type: 'cardio', calPerMin: 12 },
  { name: 'Squat', type: 'strength', calPerMin: 6 },
  { name: 'Push-up', type: 'strength', calPerMin: 5 },
  { name: 'Plank', type: 'strength', calPerMin: 4 },
  { name: 'Yoga', type: 'flexibility', calPerMin: 3 },
  { name: 'Giãn cơ', type: 'flexibility', calPerMin: 2 },
] as const;

type ExType = 'cardio' | 'strength' | 'flexibility' | 'other';

function getTypeInfo(type: ExType) {
  return EXERCISE_TYPES.find((t) => t.value === type) ?? EXERCISE_TYPES[3];
}

export default function ExercisePage() {
  const { entries, allEntries, addEntry, deleteEntry, totalCaloriesBurned } = useExercise();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => ({
    name: '', duration: '', caloriesBurned: '', type: 'cardio' as ExType, date: getTodayISO(),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      id: generateId(),
      date: form.date,
      name: form.name,
      duration: +form.duration,
      caloriesBurned: +form.caloriesBurned,
      type: form.type,
    });
    setForm({ name: '', duration: '', caloriesBurned: '', type: 'cardio', date: getTodayISO() });
    setShowForm(false);
  };

  const fillPopular = (ex: typeof POPULAR_EXERCISES[0]) => {
    const duration = form.duration ? +form.duration : 30;
    setForm((prev) => ({
      ...prev,
      name: ex.name,
      type: ex.type as ExType,
      caloriesBurned: (duration * ex.calPerMin).toString(),
      duration: duration.toString(),
    }));
  };

  // Weekly chart: last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = allEntries.filter((e) => e.date === dateStr);
    return {
      date: formatDate(dateStr).slice(0, 5),
      calories: dayEntries.reduce((s, e) => s + e.caloriesBurned, 0),
      minutes: dayEntries.reduce((s, e) => s + e.duration, 0),
    };
  });

  const totalMinutes = entries.reduce((s, e) => s + e.duration, 0);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Theo dõi tập luyện</h1>
            <p className="page-subtitle">Ghi lại bài tập và calories đốt cháy mỗi ngày</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Thêm bài tập
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-cols-3" style={{ marginBottom: 24 }}>
        <div className="stat-card rose">
          <div className="form-label">Calories đốt hôm nay</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--destructive)' }}>{totalCaloriesBurned} <span style={{ fontSize: 16 }}>kcal</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--muted-foreground)', fontSize: 13 }}>
            <Flame size={14} /> {entries.length} bài tập
          </div>
        </div>
        <div className="stat-card blue">
          <div className="form-label">Thời gian luyện tập</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--secondary)' }}>{totalMinutes} <span style={{ fontSize: 16 }}>phút</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--muted-foreground)', fontSize: 13 }}>
            <Clock size={14} /> {(totalMinutes / 60).toFixed(1)} giờ hôm nay
          </div>
        </div>
        <div className="stat-card green">
          <div className="form-label">Tuần này</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
            {last7Days.reduce((s, d) => s + d.calories, 0)} <span style={{ fontSize: 16 }}>kcal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--muted-foreground)', fontSize: 13 }}>
            <Zap size={14} /> {last7Days.reduce((s, d) => s + d.minutes, 0)} phút/tuần
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="section-title"><Dumbbell size={18} color="var(--primary)" /> Thêm bài tập</div>

          {/* Popular suggestions */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Gợi ý bài tập phổ biến</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {POPULAR_EXERCISES.map((ex) => {
                const t = getTypeInfo(ex.type as ExType);
                return (
                  <button key={ex.name} type="button"
                    onClick={() => fillPopular(ex)}
                    style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: t.bg, color: t.color, border: 'none', cursor: 'pointer',
                      transition: 'all 0.15s ease' }}>
                    {ex.name}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label className="form-label">Tên bài tập</label>
                <input className="form-input" placeholder="VD: Chạy bộ buổi sáng" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Loại</label>
                <select className="form-input" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ExType })}>
                  {EXERCISE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Thời gian (phút)</label>
                <input className="form-input" type="number" min="1" max="600" placeholder="30" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Calories đốt</label>
                <input className="form-input" type="number" min="0" placeholder="kcal" value={form.caloriesBurned}
                  onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Ngày</label>
                <input className="form-input" type="date" value={form.date} max={getTodayISO()}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary"><Dumbbell size={15} /> Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Weekly chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title"><Flame size={18} color="var(--destructive)" /> Calories đốt - 7 ngày qua</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v} kcal`, 'Calories đốt']}
            />
            <Bar dataKey="calories" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's list */}
      <div className="card">
        <div className="section-title"><Dumbbell size={18} color="var(--primary)" /> Hôm nay ({entries.length} bài)</div>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted-foreground)' }}>
            <Dumbbell size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ marginBottom: 16, fontSize: 14 }}>Chưa có bài tập nào hôm nay</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Thêm bài tập đầu tiên
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map((entry) => {
              const t = getTypeInfo(entry.type);
              return (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 16px', background: 'var(--muted)', borderRadius: 10,
                }}>
                  <div style={{ width: 44, height: 44, background: t.bg, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Heart size={20} color={t.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{entry.name}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted-foreground)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {entry.duration} phút
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.color, fontWeight: 600 }}>
                        <Flame size={12} /> {entry.caloriesBurned} kcal
                      </span>
                      <span style={{ background: t.bg, color: t.color, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
                        {t.label}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
