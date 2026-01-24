import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  BarChart3,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

// ============================================================
// TYPES
// ============================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.JOBS, label: 'Jobs', icon: Briefcase },
  { path: ROUTES.COMPANIES, label: 'Companies', icon: Building2 },
  { path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { path: ROUTES.PARSER, label: 'Parser', icon: RefreshCw },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

// ============================================================
// COMPONENT
// ============================================================

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 dark:bg-gray-800 dark:border-gray-700 lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">HR Parser</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
