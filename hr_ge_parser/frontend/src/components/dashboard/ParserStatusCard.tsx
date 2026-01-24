import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatRelativeTime, formatDateTime } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import type { ParserStatusResponse } from '@/types';

// ============================================================
// TYPES
// ============================================================

interface ParserStatusCardProps {
  status: ParserStatusResponse | undefined;
  onTrigger: (type: 'full' | 'incremental') => void;
  isTriggerPending: boolean;
}

type ParserRunStatus = 'completed' | 'running' | 'failed';

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_CONFIG: Record<ParserRunStatus, { icon: typeof CheckCircle; variant: 'success' | 'warning' | 'danger'; label: string }> = {
  completed: { icon: CheckCircle, variant: 'success', label: 'Completed' },
  running: { icon: RefreshCw, variant: 'warning', label: 'Running' },
  failed: { icon: XCircle, variant: 'danger', label: 'Failed' },
};

// ============================================================
// COMPONENT
// ============================================================

export function ParserStatusCard({
  status,
  onTrigger,
  isTriggerPending,
}: ParserStatusCardProps) {
  const lastRun = status?.last_run;
  const isSchedulerRunning = status?.scheduler_running;
  const isRunning = lastRun?.status === 'running';

  const statusConfig = lastRun ? STATUS_CONFIG[lastRun.status as ParserRunStatus] : null;

  return (
    <Card title="Parser Status" className="h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            isRunning ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          )}>
            <RefreshCw className={cn('h-5 w-5', isRunning && 'animate-spin')} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isRunning ? 'Parser Running' : isSchedulerRunning ? 'Scheduler Active' : 'Parser Idle'}
            </p>
            {lastRun && statusConfig && (
              <Badge variant={statusConfig.variant} size="sm" className="mt-1">
                {statusConfig.label}
              </Badge>
            )}
          </div>
        </div>

        {lastRun && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Last Run</span>
              <span className="text-gray-900 dark:text-white">
                {formatRelativeTime(lastRun.started_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Jobs Found</span>
              <span className="text-gray-900 dark:text-white">{lastRun.jobs_found}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Created / Updated</span>
              <span className="text-gray-900 dark:text-white">
                {lastRun.jobs_created} / {lastRun.jobs_updated}
              </span>
            </div>
          </div>
        )}

        {status?.next_run_time && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Next run: {formatDateTime(status.next_run_time)}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onTrigger('incremental')}
            disabled={isRunning || isTriggerPending}
            loading={isTriggerPending}
          >
            Quick Scan
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onTrigger('full')}
            disabled={isRunning || isTriggerPending}
            loading={isTriggerPending}
          >
            Full Scrape
          </Button>
        </div>
      </div>
    </Card>
  );
}
