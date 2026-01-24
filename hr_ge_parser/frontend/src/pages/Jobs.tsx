import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, Table, Pagination, SearchInput, Select, Badge } from '@/components/ui';
import { useJobs } from '@/hooks/useJobs';
import { formatDate, formatSalary } from '@/utils/formatters';
import { ROUTES, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { buildUrl } from '@/utils/helpers';
import type { Job, JobFilters } from '@/types';

// ============================================================
// CONSTANTS
// ============================================================

const COLUMNS = [
  {
    key: 'title',
    label: 'Title',
    render: (_value: unknown, item: Job) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{item.company?.name || 'Unknown'}</p>
      </div>
    ),
  },
  {
    key: 'salary',
    label: 'Salary',
    render: (_: unknown, item: Job) => (
      item.salary_from || item.salary_to ? (
        <Badge variant="success" size="sm">
          {formatSalary(item.salary_from, item.salary_to, item.salary_currency)}
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      )
    ),
  },
  {
    key: 'location',
    label: 'Location',
    render: (_: unknown, item: Job) => (
      <span>{item.addresses?.[0] || '-'}</span>
    ),
  },
  {
    key: 'publish_date',
    label: 'Published',
    render: (value: unknown) => formatDate(value as string),
  },
  {
    key: 'status',
    label: 'Status',
    render: (_: unknown, item: Job) => (
      <Badge variant={item.is_expired ? 'danger' : 'success'} size="sm">
        {item.is_expired ? 'Expired' : 'Active'}
      </Badge>
    ),
  },
];

const FILTER_OPTIONS = [
  { value: '', label: 'All Jobs' },
  { value: 'active', label: 'Active Only' },
  { value: 'expired', label: 'Expired Only' },
];

// ============================================================
// COMPONENT
// ============================================================

export function Jobs() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    per_page: DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading } = useJobs(filters);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (value: string) => {
    const isExpired = value === 'expired' ? true : value === 'active' ? false : undefined;
    setFilters((prev) => ({ ...prev, is_expired: isExpired, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRowClick = (job: Job) => {
    navigate(buildUrl(ROUTES.JOB_DETAIL, { id: job.id }));
  };

  return (
    <div>
      <PageHeader
        title="Jobs"
        description={`${data?.meta.total || 0} jobs in database`}
      />

      <Card padding="none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={filters.search || ''}
              onChange={handleSearch}
              placeholder="Search jobs..."
              className="sm:w-64"
            />
            <Select
              options={FILTER_OPTIONS}
              value={filters.is_expired === true ? 'expired' : filters.is_expired === false ? 'active' : ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="sm:w-40"
            />
          </div>
        </div>

        <Table
          columns={COLUMNS}
          data={data?.data || []}
          loading={isLoading}
          onRowClick={handleRowClick}
          emptyMessage="No jobs found"
        />

        {data && data.meta.total_pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
