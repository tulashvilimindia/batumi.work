import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/ui';
import { formatRelativeTime, formatSalary } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { buildUrl } from '@/utils/helpers';
import type { Job } from '@/types';

// ============================================================
// TYPES
// ============================================================

interface RecentActivityProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function RecentActivity({ jobs, isLoading }: RecentActivityProps) {
  return (
    <Card
      title="Recent Jobs"
      actions={
        <Link
          to={ROUTES.JOBS}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 dark:text-primary-400"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton height={16} width="60%" className="mb-1" />
                <Skeleton height={14} width="40%" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs?.map((job) => (
            <Link
              key={job.id}
              to={buildUrl(ROUTES.JOB_DETAIL, { id: job.id })}
              className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/50"
            >
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  {job.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {job.company?.name || 'Unknown Company'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {job.salary_from || job.salary_to ? (
                    <Badge variant="success" size="sm">
                      {formatSalary(job.salary_from, job.salary_to, job.salary_currency)}
                    </Badge>
                  ) : null}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatRelativeTime(job.publish_date)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
