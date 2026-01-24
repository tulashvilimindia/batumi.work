import { Link } from 'react-router-dom';
import { Briefcase, Building2, BarChart3, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui';
import { ROUTES } from '@/utils/constants';

// ============================================================
// CONSTANTS
// ============================================================

const ACTIONS = [
  {
    label: 'View Jobs',
    description: 'Browse all job listings',
    icon: Briefcase,
    path: ROUTES.JOBS,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    label: 'Companies',
    description: 'Explore companies',
    icon: Building2,
    path: ROUTES.COMPANIES,
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    label: 'Analytics',
    description: 'View statistics',
    icon: BarChart3,
    path: ROUTES.ANALYTICS,
    color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    label: 'Parser',
    description: 'Manage parser',
    icon: RefreshCw,
    path: ROUTES.PARSER,
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
];

// ============================================================
// COMPONENT
// ============================================================

export function QuickActions() {
  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700/50"
          >
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
