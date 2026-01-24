import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/layout';
import { Card, Skeleton } from '@/components/ui';
import { useDashboardStats, useLocationStats, useSalaryStats } from '@/hooks/useStats';
import { formatNumber, formatPercentage, formatCurrency } from '@/utils/formatters';

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

// ============================================================
// COMPONENT
// ============================================================

export function Analytics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: locationStats, isLoading: locationLoading } = useLocationStats();
  const { data: salaryData, isLoading: salaryLoading } = useSalaryStats();

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Job market insights and statistics"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Salary Statistics">
          {salaryLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton height={200} width="100%" />
            </div>
          ) : salaryData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Salary (From)</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {salaryData.avg_salary_from ? formatCurrency(salaryData.avg_salary_from) : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Salary (To)</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {salaryData.avg_salary_to ? formatCurrency(salaryData.avg_salary_to) : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Min Salary</p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                    {salaryData.min_salary ? formatCurrency(salaryData.min_salary) : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max Salary</p>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {salaryData.max_salary ? formatCurrency(salaryData.max_salary) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Jobs with Salary Info</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(salaryData.jobs_with_salary)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No salary data available</p>
          )}
        </Card>

        <Card title="Jobs by Location">
          {locationLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton variant="circular" width={200} height={200} />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(locationStats || []).slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="location"
                    label={({ location, percentage }) => `${location}: ${formatPercentage(percentage || 0)}`}
                  >
                    {(locationStats || []).slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Jobs']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Job Statistics" className="lg:col-span-2">
          {statsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={60} />
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.total_jobs)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatNumber(stats.active_jobs)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">With Salary</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(stats.jobs_with_salary)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Remote Jobs</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(stats.remote_jobs)}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
