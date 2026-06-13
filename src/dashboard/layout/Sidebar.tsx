import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Clock,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Appointments', icon: CalendarCheck, href: '/dashboard/consultations' },
  { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
  { label: 'Leads & Pipeline', icon: Users, href: '/dashboard/leads' },
  { label: 'Availability', icon: Clock, href: '/dashboard/availability' },
  { label: 'Email Templates', icon: FileText, href: '/dashboard/email-templates' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-outline/30 bg-surface flex flex-col z-40">
      <div className="px-5 py-5 border-b border-outline/30">
        <NavLink to="/dashboard" className="font-display-xl text-base font-semibold text-on-surface tracking-tight">
          RL Dashboard
        </NavLink>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-outline/30 space-y-0.5">
        <a
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200"
        >
          <ExternalLink size={16} />
          Portfolio Site
        </a>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-error transition-all duration-200"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
