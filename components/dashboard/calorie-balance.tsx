'use client';
import { TrendingDown, TrendingUp, Minus, Info } from 'lucide-react';
import { KCAL_PER_KG } from '@/lib/calculations';

const GOAL_DEFICIT = 500; // matches getDailyCalorieTarget (TDEE - 500)

interface Props {
  consumed: number;
  baseBurn: number;
  exerciseBurn: number;
}

export function CalorieBalance({ consumed, baseBurn, exerciseBurn }: Props) {
  const out = Math.round(baseBurn + exerciseBurn);
  const balance = Math.round(consumed - out);
  const grams = Math.round((Math.abs(balance) / KCAL_PER_KG) * 1000);
  const state = balance < -50 ? 'deficit' : balance > 50 ? 'surplus' : 'even';

  const tone = {
    deficit: { color: 'var(--primary)', bg: 'var(--primary-light)', Icon: TrendingDown, title: 'Đang thâm hụt calo', sub: `Hôm nay bạn đang giảm ~${grams} g` },
    surplus: { color: 'var(--destructive)', bg: 'var(--destructive-light)', Icon: TrendingUp, title: 'Đang dư calo', sub: `Hôm nay bạn đang tăng ~${grams} g` },
    even: { color: 'var(--accent)', bg: 'var(--accent-light)', Icon: Minus, title: 'Cân bằng', sub: 'Giữ nguyên cân nặng' },
  }[state];

  const scale = Math.max(consumed, out, 1);
  const deficitPct = Math.max(0, Math.min(100, (-balance / GOAL_DEFICIT) * 100));

  return (
    <section className="card balance-card" aria-labelledby="balance-title">
      <div className="balance-head">
        <div>
          <h2 id="balance-title" className="eyebrow">Cân bằng calo hôm nay</h2>
          <div className="balance-value num" style={{ color: tone.color }} aria-live="polite">
            {balance > 0 ? '+' : balance < 0 ? '−' : ''}{Math.abs(balance).toLocaleString('vi-VN')}
            <span className="balance-unit">kcal</span>
          </div>
        </div>
        <div className="balance-pill" style={{ background: tone.bg, color: tone.color }}>
          <tone.Icon size={18} aria-hidden />
          <div>
            <div style={{ fontWeight: 700 }}>{tone.title}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{tone.sub}</div>
          </div>
        </div>
      </div>

      {/* Equation: in − base − exercise = balance */}
      <div className="balance-eq">
        <EqItem label="Nạp vào" value={consumed} color="var(--accent)" />
        <span className="eq-op" aria-hidden>−</span>
        <EqItem label="Đốt cơ bản" value={Math.round(baseBurn)} color="var(--muted-foreground)" />
        <span className="eq-op" aria-hidden>−</span>
        <EqItem label="Tập luyện" value={exerciseBurn} color="var(--secondary)" />
        <span className="eq-op" aria-hidden>=</span>
        <EqItem label="Chênh lệch" value={balance} color={tone.color} signed />
      </div>

      {/* In vs out bars on a shared scale */}
      <div className="balance-bars">
        <BarRow label="Vào" segments={[{ value: consumed, color: 'var(--accent)' }]} scale={scale} total={consumed} />
        <BarRow
          label="Ra"
          segments={[
            { value: baseBurn, color: 'var(--muted-foreground)' },
            { value: exerciseBurn, color: 'var(--secondary)' },
          ]}
          scale={scale}
          total={out}
        />
      </div>

      <div className="balance-goal">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span>Mục tiêu thâm hụt {GOAL_DEFICIT} kcal/ngày</span>
          <span className="num" style={{ fontWeight: 700, color: deficitPct >= 100 ? 'var(--primary)' : 'var(--foreground)' }}>
            {Math.round(deficitPct)}%
          </span>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(deficitPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${deficitPct}%` }} />
        </div>
      </div>

      <p className="balance-note">
        <Info size={13} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
        {consumed === 0
          ? 'Bạn chưa tick bữa ăn nào nên con số đang âm nhiều — hãy tick bữa đã ăn để kết quả chính xác.'
          : 'Đốt cơ bản = năng lượng cơ thể tiêu hao cả ngày khi sinh hoạt bình thường (chưa tính tập).'}
      </p>
    </section>
  );
}

function EqItem({ label, value, color, signed }: { label: string; value: number; color: string; signed?: boolean }) {
  const text = signed && value > 0 ? `+${value}` : signed && value < 0 ? `−${Math.abs(value)}` : `${value}`;
  return (
    <div className="eq-item">
      <div className="num" style={{ fontSize: 20, fontWeight: 700, color }}>{text}</div>
      <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  );
}

function BarRow({ label, segments, scale, total }: {
  label: string; segments: { value: number; color: string }[]; scale: number; total: number;
}) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${(s.value / scale) * 100}%`, background: s.color }} />
        ))}
      </div>
      <span className="bar-total num">{total.toLocaleString('vi-VN')}</span>
    </div>
  );
}
