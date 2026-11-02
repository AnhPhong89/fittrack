'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Scale,
  Utensils,
  Dumbbell,
  Bot,
  User,
  Activity,
  CalendarDays,
  Sun,
  Moon,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plan', label: 'Kế hoạch tuần', icon: CalendarDays },
  { href: '/weight', label: 'Cân nặng', icon: Scale },
  { href: '/nutrition', label: 'Dinh dưỡng', icon: Utensils },
  { href: '/exercise', label: 'Tập luyện', icon: Dumbbell },
  { href: '/ai-coach', label: 'AI Coach', icon: Bot },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

export function Sidebar({ onToggleDark, isDark }: { onToggleDark: () => void; isDark: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--primary), #059669)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>FitTrack</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Theo dõi sức khỏe</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '0 12px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', padding: '8px 4px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Menu chính
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div style={{ padding: '16px 12px 24px' }}>
        <button
          onClick={onToggleDark}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', gap: 10, padding: '10px 14px' }}
        >
          {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
          <span style={{ fontSize: 13 }}>{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>
        </button>
      </div>
    </aside>
  );
}
