import { PageHeader } from '@/components/layout';
import {
  StatsGrid,
  ParserStatusCard,
  QuickActions,
  RecentActivity,
  LocationChart,
} from '@/components/dashboard';
import { useDashboardStats, useLocationStats } from '@/hooks/useStats';
import { useParserStatus, useTriggerParser } from '@/hooks/useParser';
import { useLatestJobs } from '@/hooks/useJobs';
import type { RunType } from '@/types';

// ============================================================
// COMPONENT
// ============================================================

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: parserStatus } = useParserStatus();
  const { data: locationStats, isLoading: locationLoading } = useLocationStats();
  const { data: latestJobs, isLoading: jobsLoading } = useLatestJobs(5);

  const triggerParser = useTriggerParser();

  const handleTriggerParser = (runType: RunType) => {
    triggerParser.mutate(runType);
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your HR.GE job parser"
      />

      <div className="space-y-6">
        <StatsGrid stats={stats} isLoading={statsLoading} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LocationChart data={locationStats} isLoading={locationLoading} />
          </div>
          <div>
            <ParserStatusCard
              status={parserStatus}
              onTrigger={handleTriggerParser}
              isTriggerPending={triggerParser.isPending}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity jobs={latestJobs} isLoading={jobsLoading} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
