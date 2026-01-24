import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Table, Badge } from '@/components/ui';
import { useParserHistory } from '@/hooks/useParser';
import { formatDateTime } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_VARIANTS = {
  completed: 'success',
  running: 'warning',
  failed: 'danger',
} as const;

const COLUMNS = [
  {
    key: 'id',
    label: 'Run ID',
    width: '80px',
  },
  {
    key: 'started_at',
    label: 'Started',
    render: (value: unknown) => formatDateTime(value as string),
  },
  {
    key: 'finished_at',
    label: 'Finished',
    render: (value: unknown) => value ? formatDateTime(value as string) : '-',
  },
  {
    key: 'run_type',
    label: 'Type',
    render: (value: unknown) => (
      <Badge variant="default" size="sm">
        {value === 'full' ? 'Full Scrape' : 'Quick Scan'}
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
    render: (value: unknown) => (
      <span className="text-green-600 dark:text-green-400">{value as number}</span>
    ),
  },
  {
    key: 'jobs_updated',
    label: 'Updated',
    render: (value: unknown) => (
      <span className="text-blue-600 dark:text-blue-400">{value as number}</span>
    ),
  },
  {
    key: 'jobs_failed',
    label: 'Failed',
    render: (value: unknown) => (
      <span className={value ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}>
        {value as number}
      </span>
    ),
  },
];

// ============================================================
// COMPONENT
// ============================================================

export function ParserHistory() {
  const { data, isLoading } = useParserHistory(1);

  return (
    <div>
      <Link to={ROUTES.PARSER} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Parser
      </Link>

      <PageHeader
        title="Parser History"
        description={`${(data || []).length} runs`}
      />

      <Card padding="none">
        <Table
          columns={COLUMNS}
          data={data || []}
          loading={isLoading}
          emptyMessage="No parser runs yet"
        />
      </Card>
    </div>
  );
}
