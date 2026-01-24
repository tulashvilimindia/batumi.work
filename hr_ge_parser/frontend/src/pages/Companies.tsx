import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, SearchInput, Pagination, Spinner } from '@/components/ui';
import { useCompanies } from '@/hooks/useCompanies';
import { ROUTES, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { buildUrl } from '@/utils/helpers';
import type { Company, CompanyFilters } from '@/types';

// ============================================================
// COMPONENT
// ============================================================

export function Companies() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CompanyFilters>({
    page: 1,
    per_page: DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading } = useCompanies(filters);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCompanyClick = (company: Company) => {
    navigate(buildUrl(ROUTES.COMPANY_DETAIL, { id: company.id }));
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        description={`${data?.meta.total || 0} companies in database`}
      />

      <Card padding="none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchInput
            value={filters.search || ''}
            onChange={handleSearch}
            placeholder="Search companies..."
            className="max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company)}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700/50"
              >
                <div className="flex-shrink-0">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center dark:bg-gray-700">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate dark:text-white">
                    {company.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {company.job_count || 0} jobs
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

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
