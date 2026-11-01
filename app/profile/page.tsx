'use client';
import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { UserProfile } from '@/lib/types';
import {
  calculateBMI, getBMICategory, calculateBMR, calculateTDEE,
  getDailyCalorieTarget, calculateDaysToGoal, getActivityLabel, getTodayISO,
} from '@/lib/calculations';
import { User, Save, Calculator, Target, Activity, Calendar } from 'lucide-react';

const defaultForm: Omit<UserProfile, 'createdAt'> = {
  name: '',
  age: 25,
  gender: 'male',
  height: 170,
  currentWeight: 70,
  targetWeight: 65,
  activityLevel: 'moderate',
  targetDate: '',
};

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ ...defaultForm, ...profile });
    }
  }, [profile]);

  const set = (key: keyof typeof form, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ ...form, createdAt: profile?.createdAt ?? new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const bmi = calculateBMI(form.currentWeight, form.height);
  const bmr = calculateBMR(form.currentWeight, form.height, form.age, form.gender);
  const tdee = calculateTDEE(bmr, form.activityLevel as UserProfile['activityLevel']);
  const target = getDailyCalorieTarget(tdee);
  const days = calculateDaysToGoal(form.currentWeight, form.targetWeight);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Hồ sơ cá nhân</h1>
        <p className="page-subtitle">Thông tin của bạn giúp tính toán mục tiêu dinh dưỡng chính xác</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="section-title"><User size={18} color="var(--primary)" /> Thông tin cơ bản</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="form-label">Họ và tên</label>
              <input className="form-input" placeholder="Nhập tên của bạn" value={form.name}
                onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Tuổi</label>
                <input className="form-input" type="number" min={10} max={100} value={form.age}
                  onChange={(e) => set('age', +e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Giới tính</label>
                <select className="form-input" value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Chiều cao (cm)</label>
                <input className="form-input" type="number" min={100} max={250} value={form.height}
                  onChange={(e) => set('height', +e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Cân nặng hiện tại (kg)</label>
                <input className="form-input" type="number" min={30} max={300} step="0.1" value={form.currentWeight}
                  onChange={(e) => set('currentWeight', +e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Cân nặng mục tiêu (kg)</label>
                <input className="form-input" type="number" min={30} max={300} step="0.1" value={form.targetWeight}
                  onChange={(e) => set('targetWeight', +e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Ngày mục tiêu (tuỳ chọn)</label>
                <input className="form-input" type="date" value={form.targetDate ?? ''}
                  min={getTodayISO()}
                  onChange={(e) => set('targetDate', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="form-label">Mức độ vận động</label>
              <select className="form-input" value={form.activityLevel}
                onChange={(e) => set('activityLevel', e.target.value)}>
                <option value="sedentary">Ít vận động (ngồi nhiều)</option>
                <option value="light">Nhẹ (tập 1-3 ngày/tuần)</option>
                <option value="moderate">Vừa phải (tập 3-5 ngày/tuần)</option>
                <option value="active">Năng động (tập 6-7 ngày/tuần)</option>
                <option value="very_active">Rất năng động (tập nặng hàng ngày)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
              {saved ? '✅ Đã lưu thành công!' : <><Save size={16} /> Lưu hồ sơ</>}
            </button>
          </div>
        </form>

        {/* Stats panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* BMI */}
          <div className="card">
            <div className="section-title"><Calculator size={18} color="var(--secondary)" /> Chỉ số sức khoẻ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StatRow label="BMI" value={bmi.toFixed(1)} unit="" color="var(--secondary)" note={getBMICategory(bmi)} />
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill blue" style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-foreground)' }}>
                <span>Thiếu cân &lt;18.5</span>
                <span>Bình thường 18.5-24.9</span>
                <span>Thừa cân &gt;25</span>
              </div>
            </div>
          </div>

          {/* Calories */}
          <div className="card">
            <div className="section-title"><Activity size={18} color="var(--primary)" /> Nhu cầu calo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StatRow label="BMR (nghỉ ngơi)" value={bmr.toFixed(0)} unit="kcal" color="var(--muted-foreground)" />
              <StatRow label="TDEE (duy trì)" value={tdee.toFixed(0)} unit="kcal" color="var(--secondary)" />
              <hr className="divider" />
              <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>🎯 Mục tiêu giảm cân</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{target.toFixed(0)} <span style={{ fontSize: 14 }}>kcal/ngày</span></div>
                <div style={{ fontSize: 12, color: 'var(--primary)', opacity: 0.8 }}>Thâm hụt 500 kcal/ngày ≈ -0.5 kg/tuần</div>
              </div>
            </div>
          </div>

          {/* Goal timeline */}
          <div className="card">
            <div className="section-title"><Target size={18} color="var(--accent)" /> Lộ trình mục tiêu</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StatRow
                label="Cần giảm"
                value={(form.currentWeight - form.targetWeight).toFixed(1)}
                unit="kg"
                color="var(--destructive)"
              />
              <StatRow
                label="Thời gian ước tính"
                value={days.toString()}
                unit="ngày"
                color="var(--accent)"
              />
              <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
                Đạt mục tiêu ~ {getEstimatedDate(days)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, unit, color, note }: { label: string; value: string; unit: string; color: string; note?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{value} {unit}</span>
        {note && <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{note}</div>}
      </div>
    </div>
  );
}

function getEstimatedDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
