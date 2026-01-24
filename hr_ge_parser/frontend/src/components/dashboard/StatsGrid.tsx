import { Briefcase, Building2, DollarSign, Home, GraduationCap, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { Skeleton } from '@/components/ui';
import type { DashboardStats } from '@/types';

// ============================================================
// TYPES
// ============================================================

interface StatsGridProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={120} className="rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total Jobs"
        value={stats.total_jobs}
        icon={<Briefcase className="h-6 w-6" />}
      />
      <StatCard
        title="Active Jobs"
        value={stats.active_jobs}
        icon={<TrendingUp className="h-6 w-6" />}
      />
      <StatCard
        title="Companies"
        value={stats.total_companies}
        icon={<Building2 className="h-6 w-6" />}
      />
      <StatCard
        title="Jobs with Salary"
        value={stats.jobs_with_salary}
        icon={<DollarSign className="h-6 w-6" />}
      />
      <StatCard
        title="Remote Jobs"
        value={stats.remote_jobs}
        icon={<Home className="h-6 w-6" />}
      />
      <StatCard
        title="Student Jobs"
        value={stats.student_jobs}
        icon={<GraduationCap className="h-6 w-6" />}
      />
    </div>
  );
}
