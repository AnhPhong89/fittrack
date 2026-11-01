'use client';
import { useMemo } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useWeight } from '@/hooks/use-weight';
import { useNutrition } from '@/hooks/use-nutrition';
import { useExercise } from '@/hooks/use-exercise';
import {
  calculateBMI, getBMICategory, calculateBMR, calculateTDEE,
  getDailyCalorieTarget, getTodayISO, formatDate,
} from '@/lib/calculations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Scale, Flame, Zap, TrendingDown, TrendingUp, ArrowRight, Plus, User, Target } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useProfile();
  const { entries: weightEntries } = useWeight();
  const today = useMemo(() => getTodayISO(), []);
  const { totals: nutritionTotals } = useNutrition(today);
  const { totalCaloriesBurned } = useExercise(today);

  const stats = useMemo(() => {
    if (!profile) return null;
    const bmi = calculateBMI(profile.currentWeight, profile.height);
    const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const target = getDailyCalorieTarget(tdee);
    return { bmi, bmiCategory: getBMICategory(bmi), tdee, target };
  }, [profile]);

  const chartData = useMemo(() => {
    const last30 = weightEntries.slice(-30);
    return last30.map((e) => ({
      date: formatDate(e.date).slice(0, 5),
      weight: e.weight,
    }));
  }, [weightEntries]);

  const currentWeight = weightEntries.length > 0
    ? weightEntries[weightEntries.length - 1].weight
    : profile?.currentWeight ?? 0;

  const totalLost = profile
    ? profile.currentWeight - currentWeight
    : 0;

  const streak = useMemo(() => {
    if (!weightEntries.length) return 0;
    let count = 0;
    const sorted = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
    let prev = new Date(today);
    for (const e of sorted) {
      const d = new Date(e.date);
      const diff = Math.round((prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) { count++; prev = d; } else break;
    }
    return count;
  }, [weightEntries, today]);

  const calorieBalance = nutritionTotals.calories - totalCaloriesBurned;

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={36} color="var(--primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Chào mừng đến FitTrack!</h2>
          <p style={{ color: 'var(--muted-foreground)', maxWidth: 400 }}>
            Bắt đầu bằng cách thiết lập hồ sơ cá nhân để chúng tôi tính toán mục tiêu phù hợp cho bạn.
          </p>
        </div>
        <Link href="/profile" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
          Tạo hồ sơ ngay <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Xin chào, {profile.name}! 👋</h1>
            <p className="page-subtitle">Hôm nay là {formatDate(today)} — Hãy tiếp tục hành trình của bạn!</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/weight" className="btn btn-primary btn-sm"><Plus size={14} /> Nhập cân</Link>
            <Link href="/nutrition" className="btn btn-secondary btn-sm"><Plus size={14} /> Ghi bữa ăn</Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-cols-4" style={{ marginBottom: 28 }}>
        <div className="stat-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="form-label">Cân nặng hiện tại</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{currentWeight}<span style={{ fontSize: 14 }}> kg</span></div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
                Mục tiêu: {profile.targetWeight} kg
              </div>
            </div>
            <div style={{ background: 'var(--primary-light)', padding: 10, borderRadius: 10 }}>
              <Scale size={22} color="var(--primary)" />
            </div>
          </div>
          {totalLost > 0 && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingDown size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Đã giảm {totalLost.toFixed(1)} kg</span>
            </div>
          )}
        </div>

        <div className="stat-card blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="form-label">Chỉ số BMI</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--secondary)' }}>{stats?.bmi.toFixed(1)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>{stats?.bmiCategory}</div>
            </div>
            <div style={{ background: 'var(--secondary-light)', padding: 10, borderRadius: 10 }}>
              <Target size={22} color="var(--secondary)" />
            </div>
          </div>
        </div>

        <div className="stat-card amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="form-label">Calories hôm nay</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{nutritionTotals.calories}<span style={{ fontSize: 14 }}> kcal</span></div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Mục tiêu: {stats?.target.toFixed(0)} kcal</div>
            </div>
            <div style={{ background: 'var(--accent-light)', padding: 10, borderRadius: 10 }}>
              <Flame size={22} color="var(--accent)" />
            </div>
          </div>
          {stats && (
            <div style={{ marginTop: 10 }}>
              <div className="progress-bar">
                <div className={`progress-fill amber ${nutritionTotals.calories > stats.target ? 'over' : ''}`}
                  style={{ width: `${Math.min(100, (nutritionTotals.calories / stats.target) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="stat-card rose">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="form-label">Streak</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--destructive)' }}>{streak}<span style={{ fontSize: 14 }}> ngày</span></div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Liên tiếp nhập cân</div>
            </div>
            <div style={{ background: 'var(--destructive-light)', padding: 10, borderRadius: 10 }}>
              <Zap size={22} color="var(--destructive)" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Weight Chart */}
        <div className="card">
          <div className="section-title">
            <TrendingDown size={18} color="var(--primary)" />
            Tiến trình cân nặng (30 ngày)
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v} kg`, 'Cân nặng']}
                />
                {profile?.targetWeight && (
                  <ReferenceLine y={profile.targetWeight} stroke="var(--destructive)" strokeDasharray="6 3" label={{ value: 'Mục tiêu', fill: 'var(--destructive)', fontSize: 11 }} />
                )}
                <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--muted-foreground)' }}>
              <Scale size={40} strokeWidth={1} />
              <p style={{ fontSize: 14 }}>Chưa có dữ liệu — hãy nhập cân nặng đầu tiên!</p>
              <Link href="/weight" className="btn btn-primary btn-sm"><Plus size={14} /> Nhập cân</Link>
            </div>
          )}
        </div>

        {/* Today overview */}
        <div className="card">
          <div className="section-title">
            <Flame size={18} color="var(--accent)" />
            Tổng kết hôm nay
          </div>
          <CalorieRing
            consumed={nutritionTotals.calories}
            burned={totalCaloriesBurned}
            target={stats?.target ?? 2000}
          />
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MacroRow label="Protein" value={nutritionTotals.protein} unit="g" color="var(--secondary)" />
            <MacroRow label="Carbs" value={nutritionTotals.carbs} unit="g" color="var(--accent)" />
            <MacroRow label="Fat" value={nutritionTotals.fat} unit="g" color="var(--destructive)" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="section-title"><Zap size={18} color="var(--accent)" /> Thao tác nhanh</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/weight" className="btn btn-secondary" style={{ flex: 1, minWidth: 140 }}>
            <Scale size={16} /> Nhập cân nặng
          </Link>
          <Link href="/nutrition" className="btn btn-secondary" style={{ flex: 1, minWidth: 140 }}>
            <Flame size={16} /> Ghi bữa ăn
          </Link>
          <Link href="/exercise" className="btn btn-secondary" style={{ flex: 1, minWidth: 140 }}>
            <Zap size={16} /> Ghi bài tập
          </Link>
          <Link href="/ai-coach" className="btn btn-secondary" style={{ flex: 1, minWidth: 140 }}>
            <TrendingUp size={16} /> Hỏi AI Coach
          </Link>
        </div>
      </div>
    </div>
  );
}

function CalorieRing({ consumed, burned, target }: { consumed: number; burned: number; target: number }) {
  const net = consumed - burned;
  const pct = Math.min(100, (net / target) * 100);
  const over = net > target;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={over ? 'var(--destructive)' : 'var(--primary)'}
          strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x="70" y="64" textAnchor="middle" fill="var(--foreground)" fontSize="20" fontWeight="800">{net}</text>
        <text x="70" y="80" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">kcal net</text>
        <text x="70" y="94" textAnchor="middle" fill={over ? 'var(--destructive)' : 'var(--primary)'} fontSize="10" fontWeight="600">
          {over ? `+${net - target} vượt` : `còn ${target - net}`}
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted-foreground)' }}>
        <span>🍽 {consumed} nạp</span>
        <span>🔥 {burned} đốt</span>
      </div>
    </div>
  );
}

function MacroRow({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}{unit}</span>
    </div>
  );
}
