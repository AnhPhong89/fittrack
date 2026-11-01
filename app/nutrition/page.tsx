'use client';
import { useState } from 'react';
import { useNutrition } from '@/hooks/use-nutrition';
import { useProfile } from '@/hooks/use-profile';
import { MealEntry } from '@/lib/types';
import { generateId, getTodayISO, formatDate, calculateBMR, calculateTDEE, getDailyCalorieTarget } from '@/lib/calculations';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Utensils, Plus, Trash2, Coffee, Sun, Moon, Apple } from 'lucide-react';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Bữa sáng', icon: Coffee, color: '#F59E0B' },
  { value: 'lunch', label: 'Bữa trưa', icon: Sun, color: '#10B981' },
  { value: 'dinner', label: 'Bữa tối', icon: Moon, color: '#6366F1' },
  { value: 'snack', label: 'Ăn vặt', icon: Apple, color: '#EC4899' },
] as const;

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(() => getTodayISO());
  const { entries, addEntry, deleteEntry, totals } = useNutrition(selectedDate);
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const tdee = profile
    ? calculateTDEE(calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender), profile.activityLevel)
    : 2000;
  const calorieTarget = getDailyCalorieTarget(tdee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      id: generateId(),
      date: selectedDate,
      mealType,
      name: form.name,
      calories: +form.calories,
      protein: +form.protein,
      carbs: +form.carbs,
      fat: +form.fat,
    });
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowForm(false);
  };

  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#0EA5E9' },
    { name: 'Carbs', value: totals.carbs, color: '#F59E0B' },
    { name: 'Fat', value: totals.fat, color: '#F43F5E' },
  ].filter((d) => d.value > 0);

  const calPct = Math.min(100, (totals.calories / calorieTarget) * 100);
  const over = totals.calories > calorieTarget;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Nhật ký dinh dưỡng</h1>
            <p className="page-subtitle">Theo dõi calories và dưỡng chất mỗi ngày</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input className="form-input" type="date" value={selectedDate} max={getTodayISO()}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 160 }} />
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <Plus size={16} /> Thêm món
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="section-title"><Utensils size={18} color="var(--primary)" /> Thêm món ăn</div>

          {/* Meal type tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {MEAL_TYPES.map(({ value, label, icon: Icon, color }) => (
              <button key={value} type="button"
                onClick={() => setMealType(value)}
                className={`btn ${mealType === value ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 13, padding: '8px 14px',
                  ...(mealType === value ? { background: color, boxShadow: `0 2px 8px ${color}50` } : {}) }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Tên món ăn</label>
              <input className="form-input" placeholder="VD: Cơm gà, Phở bò..." value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
              <div>
                <label className="form-label">Calories</label>
                <input className="form-input" type="number" min="0" placeholder="kcal" value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Protein (g)</label>
                <input className="form-input" type="number" min="0" step="0.1" placeholder="g" value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Carbs (g)</label>
                <input className="form-input" type="number" min="0" step="0.1" placeholder="g" value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Fat (g)</label>
                <input className="form-input" type="number" min="0" step="0.1" placeholder="g" value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary"><Utensils size={15} /> Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Huỷ</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Daily summary progress */}
        <div className="card">
          <div className="section-title"><Utensils size={18} color="var(--primary)" /> Tổng kết ngày {formatDate(selectedDate)}</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Calories nạp vào</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: over ? 'var(--destructive)' : 'var(--primary)' }}>
                {totals.calories} / {calorieTarget.toFixed(0)} kcal
              </span>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div className={`progress-fill ${over ? 'over' : ''}`} style={{ width: `${calPct}%` }} />
            </div>
            {over && <p style={{ fontSize: 12, color: 'var(--destructive)', marginTop: 6, fontWeight: 600 }}>
              ⚠️ Vượt {(totals.calories - calorieTarget).toFixed(0)} kcal so với mục tiêu
            </p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <MacroCard label="Protein" value={totals.protein} unit="g" color="#0EA5E9" bg="#E0F2FE" />
            <MacroCard label="Carbs" value={totals.carbs} unit="g" color="#F59E0B" bg="#FEF3C7" />
            <MacroCard label="Fat" value={totals.fat} unit="g" color="#F43F5E" bg="#FFE4E6" />
          </div>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="section-title">Tỷ lệ Macro</div>
          {macroData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [`${v}g`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Meal lists by type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MEAL_TYPES.map(({ value, label, icon: Icon, color }) => {
          const meals = entries.filter((e) => e.mealType === value);
          if (meals.length === 0) return null;
          return (
            <div key={value} className="card">
              <div className="section-title" style={{ color }}>
                <Icon size={18} /> {label}
                <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color }}>
                  {meals.reduce((s, m) => s + m.calories, 0)} kcal
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Món ăn</th>
                    <th>Calo</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fat</th>
                    <th style={{ width: 48 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--accent)' }}>{m.calories}</span> kcal</td>
                      <td>{m.protein}g</td>
                      <td>{m.carbs}g</td>
                      <td>{m.fat}g</td>
                      <td>
                        <button onClick={() => deleteEntry(m.id)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Utensils size={40} strokeWidth={1} color="var(--muted-foreground)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'var(--muted-foreground)', marginBottom: 16 }}>Chưa có bữa ăn nào hôm nay</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Thêm bữa ăn đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}

function MacroCard({ label, value, unit, color, bg }: { label: string; value: number; unit: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}<span style={{ fontSize: 13 }}>{unit}</span></div>
      <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}
