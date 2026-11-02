'use client';
import { useMemo } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useWeight } from '@/hooks/use-weight';
import { useNutrition } from '@/hooks/use-nutrition';
import { useExercise } from '@/hooks/use-exercise';
import { usePlan } from '@/hooks/use-plan';
import {
  calculateBMI, getBMICategory, calculateBMR, getBaseBurn, getTodayISO, formatDate,
} from '@/lib/calculations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Scale, Zap, TrendingDown, ArrowRight, Plus, User, Target, Bot, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { CalorieBalance } from '@/components/dashboard/calorie-balance';
import { TodayCheckin } from '@/components/dashboard/today-checkin';

export default function DashboardPage() {
  const { profile } = useProfile();
  const { entries: weightEntries } = useWeight();
  const { plan } = usePlan();
  const today = useMemo(() => getTodayISO(), []);
  const nutrition = useNutrition(today);
  const exercise = useExercise(today);

  const currentWeight = weightEntries.length > 0
    ? weightEntries[weightEntries.length - 1].weight
    : profile?.currentWeight ?? 0;

  const stats = useMemo(() => {
    if (!profile) return null;
    const bmi = calculateBMI(currentWeight, profile.height);
    const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
    return { bmi, bmiCategory: getBMICategory(bmi), baseBurn: getBaseBurn(bmr) };
  }, [profile, currentWeight]);

  const chartData = useMemo(() => {
    const last30 = weightEntries.slice(-30);
    return last30.map((e) => ({
      date: formatDate(e.date).slice(0, 5),
      weight: e.weight,
    }));
  }, [weightEntries]);

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

  if (!profile || !stats) {
    return (
      <div className="empty-hero">
        <div className="empty-hero-icon">
          <User size={36} color="var(--primary)" aria-hidden />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Chào mừng đến FitTrack!</h1>
          <p style={{ color: 'var(--muted-foreground)', maxWidth: 400 }}>
            Bắt đầu bằng cách thiết lập hồ sơ cá nhân để chúng tôi tính toán mục tiêu phù hợp cho bạn.
          </p>
        </div>
        <Link href="/profile" className="btn btn-primary btn-lg">
          Tạo hồ sơ ngay <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    );
  }

  const toGo = Math.max(0, currentWeight - profile.targetWeight);
  const goalPct = profile.currentWeight > profile.targetWeight
    ? Math.min(100, Math.max(0, (totalLost / (profile.currentWeight - profile.targetWeight)) * 100))
    : 100;

  return (
    <div className="animate-in">
      {/* Header */}
      <header className="dash-header">
        <div>
          <p className="eyebrow">{new Date(`${today}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="page-title">Xin chào, {profile.name}!</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/weight" className="btn btn-primary btn-sm"><Plus size={14} aria-hidden /> Nhập cân</Link>
          <Link href="/plan" className="btn btn-secondary btn-sm"><CalendarDays size={14} aria-hidden /> Kế hoạch</Link>
        </div>
      </header>

      {/* Balance + quick stats */}
      <div className="dash-top">
        <CalorieBalance
          consumed={nutrition.totals.calories}
          baseBurn={stats.baseBurn}
          exerciseBurn={exercise.totalCaloriesBurned}
        />

        <div className="mini-stats">
          <MiniStat Icon={Scale} color="var(--primary)" bg="var(--primary-light)" label="Cân nặng" value={`${currentWeight}`} unit="kg"
            sub={toGo > 0 ? `Còn ${toGo.toFixed(1)} kg tới ${profile.targetWeight} kg` : 'Đã đạt mục tiêu!'}>
            <div className="progress-bar" style={{ marginTop: 10, height: 6 }}>
              <div className="progress-fill" style={{ width: `${goalPct}%` }} />
            </div>
          </MiniStat>
          <MiniStat Icon={Target} color="var(--secondary)" bg="var(--secondary-light)" label="BMI" value={stats.bmi.toFixed(1)} sub={stats.bmiCategory} />
          <MiniStat Icon={Zap} color="var(--energy)" bg="var(--energy-light)" label="Streak nhập cân" value={`${streak}`} unit="ngày"
            sub={totalLost > 0 ? `Đã giảm ${totalLost.toFixed(1)} kg` : 'Cân mỗi sáng để giữ streak'} />
        </div>
      </div>

      {/* Daily check-in */}
      <div style={{ marginBottom: 24 }}>
        <TodayCheckin
          date={today}
          weightKg={currentWeight}
          plan={plan}
          meals={nutrition.entries}
          exercises={exercise.entries}
          addMeal={nutrition.addEntry}
          deleteMeal={nutrition.deleteEntry}
          addExercise={exercise.addEntry}
          deleteExercise={exercise.deleteEntry}
        />
      </div>

      {/* Weight chart + macros */}
      <div className="dash-bottom">
        <div className="card">
          <h2 className="section-title">
            <TrendingDown size={18} color="var(--primary)" aria-hidden />
            Tiến trình cân nặng (30 ngày)
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  formatter={(value) => [`${value ?? ''} kg`, 'Cân nặng']}
                />
                <ReferenceLine y={profile.targetWeight} stroke="var(--destructive)" strokeDasharray="6 3" label={{ value: 'Mục tiêu', fill: 'var(--destructive)', fontSize: 11 }} />
                <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <Scale size={40} strokeWidth={1} aria-hidden />
              <p style={{ fontSize: 14 }}>Chưa có dữ liệu — hãy nhập cân nặng đầu tiên!</p>
              <Link href="/weight" className="btn btn-primary btn-sm"><Plus size={14} aria-hidden /> Nhập cân</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Dinh dưỡng hôm nay</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <MacroRow label="Protein (đạm)" value={nutrition.totals.protein} goal={Math.round(currentWeight * 1.6)} color="var(--secondary)" />
            <MacroRow label="Carbs (tinh bột)" value={nutrition.totals.carbs} goal={200} color="var(--accent)" />
            <MacroRow label="Fat (chất béo)" value={nutrition.totals.fat} goal={60} color="var(--destructive)" />
          </div>
          <Link href="/ai-coach" className="btn btn-secondary" style={{ width: '100%', marginTop: 20 }}>
            <Bot size={16} aria-hidden /> Hỏi AI Coach
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ Icon, color, bg, label, value, unit, sub, children }: {
  Icon: typeof Scale; color: string; bg: string; label: string; value: string;
  unit?: string; sub: string; children?: React.ReactNode;
}) {
  return (
    <div className="card mini-stat">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="mini-stat-icon" style={{ background: bg }}>
          <Icon size={20} color={color} aria-hidden />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>{label}</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color }}>
            {value}{unit && <span style={{ fontSize: 15, marginLeft: 3 }}>{unit}</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function MacroRow({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
        <span className="num" style={{ fontWeight: 700, fontSize: 15 }}>
          <span style={{ color }}>{value}</span>
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}> / {goal}g</span>
        </span>
      </div>
      <div className="progress-bar" style={{ height: 6 }}>
        <div style={{ height: '100%', borderRadius: 100, width: `${Math.min(100, (value / goal) * 100)}%`, background: color, transition: 'width .4s ease' }} />
      </div>
    </div>
  );
}
