'use client';
import { useState } from 'react';
import { useWeight } from '@/hooks/use-weight';
import { useProfile } from '@/hooks/use-profile';
import { WeightEntry } from '@/lib/types';
import { generateId, getTodayISO, formatDate } from '@/lib/calculations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Target } from 'lucide-react';

export default function WeightPage() {
  const { entries, addEntry, deleteEntry } = useWeight();
  const { profile } = useProfile();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => getTodayISO());
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    addEntry({
      id: generateId(),
      date,
      weight: parseFloat(weight),
      note: note || undefined,
    });
    setWeight('');
    setNote('');
    setDate(getTodayISO());
    setShowForm(false);
  };

  const chartData = entries.slice(-60).map((e) => ({
    date: formatDate(e.date).slice(0, 5),
    weight: e.weight,
    fullDate: e.date,
  }));

  const current = entries.length ? entries[entries.length - 1].weight : profile?.currentWeight ?? 0;
  const start = entries.length ? entries[0].weight : profile?.currentWeight ?? 0;
  const lost = start - current;
  const toGo = profile ? current - profile.targetWeight : 0;
  const pct = profile && lost > 0 ? Math.min(100, (lost / (start - profile.targetWeight)) * 100) : 0;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Theo dõi cân nặng</h1>
            <p className="page-subtitle">Ghi lại hành trình giảm cân của bạn mỗi ngày</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Nhập cân nặng
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="section-title"><Scale size={18} color="var(--primary)" /> Nhập cân nặng mới</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Cân nặng (kg)</label>
                <input className="form-input" type="number" step="0.1" min="30" max="300"
                  placeholder="VD: 68.5" value={weight}
                  onChange={(e) => setWeight(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="form-label">Ngày</label>
                <input className="form-input" type="date" value={date} max={getTodayISO()}
                  onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Ghi chú (tuỳ chọn)</label>
                <input className="form-input" placeholder="VD: Sau khi tập, buổi sáng..."
                  value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary"><Scale size={15} /> Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom: 24 }}>
        <StatCard label="Cân nặng bắt đầu" value={`${start} kg`} color="var(--muted-foreground)" icon={<Scale size={18} />} />
        <StatCard label="Hiện tại" value={`${current} kg`} color="var(--primary)" icon={<TrendingDown size={18} />} />
        <StatCard label="Đã giảm" value={`${lost >= 0 ? '-' : '+'}${Math.abs(lost).toFixed(1)} kg`}
          color={lost >= 0 ? 'var(--success)' : 'var(--destructive)'} icon={<TrendingDown size={18} />} />
        <StatCard label="Còn lại" value={`${toGo > 0 ? toGo.toFixed(1) : '0'} kg`}
          color="var(--accent)" icon={<Target size={18} />} />
      </div>

      {/* Progress */}
      {pct > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Tiến độ đạt mục tiêu</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{pct.toFixed(1)}%</span>
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted-foreground)' }}>
            <span>Bắt đầu: {start} kg</span>
            <span>Mục tiêu: {profile?.targetWeight} kg</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title"><TrendingDown size={18} color="var(--primary)" /> Biểu đồ cân nặng</div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(value) => [`${value ?? ''} kg`, 'Cân nặng']}
              />
              {profile?.targetWeight && (
                <ReferenceLine y={profile.targetWeight} stroke="var(--destructive)" strokeDasharray="6 3"
                  label={{ value: `Mục tiêu ${profile.targetWeight}kg`, fill: 'var(--destructive)', fontSize: 11 }} />
              )}
              <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5}
                fill="url(#weightGrad)" dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState msg="Cần ít nhất 2 lần nhập để hiện biểu đồ" />
        )}
      </div>

      {/* History Table */}
      <div className="card">
        <div className="section-title"><Scale size={18} color="var(--secondary)" /> Lịch sử ({entries.length} lần)</div>
        {entries.length === 0 ? (
          <EmptyState msg="Chưa có dữ liệu cân nặng" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Cân nặng</th>
                  <th>Thay đổi</th>
                  <th>Ghi chú</th>
                  <th style={{ width: 48 }}></th>
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((entry, idx, arr) => {
                  const prev = arr[idx + 1];
                  const diff = prev ? entry.weight - prev.weight : 0;
                  return (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td style={{ fontWeight: 700 }}>{entry.weight} kg</td>
                      <td>
                        {prev ? (
                          <span style={{ color: diff < 0 ? 'var(--success)' : diff > 0 ? 'var(--destructive)' : 'var(--muted-foreground)', fontWeight: 600, fontSize: 13 }}>
                            {diff < 0 ? '↓' : diff > 0 ? '↑' : '—'} {Math.abs(diff).toFixed(1)} kg
                          </span>
                        ) : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{entry.note || '—'}</td>
                      <td>
                        <button onClick={() => deleteEntry(entry.id)} className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--muted-foreground)' }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted-foreground)' }}>
      <Scale size={36} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
      <p style={{ fontSize: 14 }}>{msg}</p>
    </div>
  );
}
