import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, Skeleton } from '@/components/ui';
import type { LocationStatsResponse } from '@/types';

// ============================================================
// TYPES
// ============================================================

interface LocationChartProps {
  data: LocationStatsResponse | undefined;
  isLoading: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
];

// ============================================================
// COMPONENT
// ============================================================

export function LocationChart({ data, isLoading }: LocationChartProps) {
  if (isLoading) {
    return (
      <Card title="Jobs by Location">
        <div className="h-64 flex items-center justify-center">
          <Skeleton variant="circular" width={200} height={200} />
        </div>
      </Card>
    );
  }

  const chartData = (data || []).slice(0, 8).map((item) => ({
    name: item.location,
    value: item.count,
  }));

  return (
    <Card title="Jobs by Location">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
