'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Scale, Utensils, Dumbbell, CalendarDays } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/weight', label: 'Cân nặng', icon: Scale },
  { href: '/plan', label: 'Kế hoạch', icon: CalendarDays },
  { href: '/nutrition', label: 'Dinh dưỡng', icon: Utensils },
  { href: '/exercise', label: 'Tập luyện', icon: Dumbbell },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
