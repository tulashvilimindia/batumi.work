import { Link } from 'react-router-dom';
import { RefreshCw, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Badge, Button, Table, Spinner } from '@/components/ui';
import { useParserStatus, useParserHistory, useTriggerParser } from '@/hooks/useParser';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import type { RunType } from '@/types';

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_VARIANTS = {
  completed: 'success',
  running: 'warning',
  failed: 'danger',
} as const;

const HISTORY_COLUMNS = [
  {
    key: 'started_at',
    label: 'Started',
    render: (value: unknown) => formatDateTime(value as string),
  },
  {
    key: 'run_type',
    label: 'Type',
    render: (value: unknown) => (
      <Badge variant="default" size="sm">
        {value === 'full' ? 'Full' : 'Quick'}
      </Badge>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: unknown) => (
      <Badge variant={STATUS_VARIANTS[value as keyof typeof STATUS_VARIANTS]} size="sm">
        {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
      </Badge>
    ),
  },
  {
    key: 'jobs_found',
    label: 'Found',
  },
  {
    key: 'jobs_created',
    label: 'Created',
  },
  {
    key: 'jobs_updated',
    label: 'Updated',
  },
];

// ============================================================
// COMPONENT
// ============================================================

export function Parser() {
  const { data: status, isLoading: statusLoading } = useParserStatus();
  const { data: history, isLoading: historyLoading } = useParserHistory(1);
  const triggerParser = useTriggerParser();

  const handleTrigger = (runType: RunType) => {
    triggerParser.mutate(runType);
  };

  const lastRun = status?.last_run;
  const isRunning = lastRun?.status === 'running';
  const isSchedulerRunning = status?.scheduler_running;

  return (
    <div>
      <PageHeader
        title="Parser Control"
        description="Manage and monitor the job parser"
        actions={
          <Link to={ROUTES.PARSER_HISTORY}>
            <Button variant="secondary" size="sm">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Current Status" className="lg:col-span-2">
          {statusLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-3 rounded-xl',
                  isRunning
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                )}>
                  <RefreshCw className={cn('h-8 w-8', isRunning && 'animate-spin')} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isRunning ? 'Parser Running' : isSchedulerRunning ? 'Scheduler Active' : 'Parser Idle'}
                  </h3>
                  {lastRun && isRunning && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Started {formatRelativeTime(lastRun.started_at)} - {lastRun.run_type === 'full' ? 'Full Scrape' : 'Quick Scan'}
                    </p>
                  )}
                </div>
              </div>

              {isRunning && lastRun && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Found</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {lastRun.jobs_found}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {lastRun.jobs_created}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {lastRun.jobs_updated}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                      {lastRun.jobs_failed}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => handleTrigger('incremental')}
                  disabled={isRunning || triggerParser.isPending}
                  loading={triggerParser.isPending}
                  variant="secondary"
                >
                  Quick Scan
                </Button>
                <Button
                  onClick={() => handleTrigger('full')}
                  disabled={isRunning || triggerParser.isPending}
                  loading={triggerParser.isPending}
                >
                  Full Scrape
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Last Run">
          {lastRun ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {lastRun.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : lastRun.status === 'failed' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
                )}
                <Badge variant={STATUS_VARIANTS[lastRun.status as keyof typeof STATUS_VARIANTS]}>
                  {lastRun.status.charAt(0).toUpperCase() + lastRun.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type</span>
                  <span className="text-gray-900 dark:text-white">
                    {lastRun.run_type === 'full' ? 'Full Scrape' : 'Quick Scan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Started</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatRelativeTime(lastRun.started_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Jobs Found</span>
                  <span className="text-gray-900 dark:text-white">{lastRun.jobs_found}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created</span>
                  <span className="text-green-600 dark:text-green-400">{lastRun.jobs_created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Updated</span>
                  <span className="text-blue-600 dark:text-blue-400">{lastRun.jobs_updated}</span>
                </div>
              </div>

              {lastRun.error_message && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                  {lastRun.error_message}
                </div>
              )}

              {status?.next_run_time && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Next run: {formatDateTime(status.next_run_time)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No previous runs</p>
          )}
        </Card>
      </div>

      <Card title="Recent Runs" className="mt-6" padding="none">
        <Table
          columns={HISTORY_COLUMNS}
          data={(history || []).slice(0, 5)}
          loading={historyLoading}
          emptyMessage="No parser runs yet"
        />
      </Card>
    </div>
  );
}
