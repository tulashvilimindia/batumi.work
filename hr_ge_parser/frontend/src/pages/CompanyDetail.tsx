import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Table, Pagination, Badge, Spinner } from '@/components/ui';
import { useCompany, useCompanyJobs } from '@/hooks/useCompanies';
import { formatDate, formatSalary } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { buildUrl } from '@/utils/helpers';
import type { Job } from '@/types';

// ============================================================
// CONSTANTS
// ============================================================

const COLUMNS = [
  {
    key: 'title',
    label: 'Title',
    render: (value: unknown) => (
      <span className="font-medium text-gray-900 dark:text-white">{value as string}</span>
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

// ============================================================
// COMPONENT
// ============================================================

export function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: company, isLoading: companyLoading } = useCompany(Number(id));
  const { data: jobs, isLoading: jobsLoading } = useCompanyJobs(Number(id), page);

  const handleRowClick = (job: Job) => {
    navigate(buildUrl(ROUTES.JOB_DETAIL, { id: job.id }));
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Company not found</p>
      </div>
    );
  }

  return (
    <div>
      <Link to={ROUTES.COMPANIES} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Link>

      <div className="flex items-start gap-4 mb-6">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <PageHeader
          title={company.name}
          description={`${jobs?.meta.total || 0} job listings`}
        />
      </div>

      <Card title="Company Jobs" padding="none">
        <Table
          columns={COLUMNS}
          data={jobs?.data || []}
          loading={jobsLoading}
          onRowClick={handleRowClick}
          emptyMessage="No jobs found for this company"
        />

        {jobs && jobs.meta.total_pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              page={jobs.meta.page}
              totalPages={jobs.meta.total_pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
