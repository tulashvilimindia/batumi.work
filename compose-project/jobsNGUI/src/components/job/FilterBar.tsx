/**
 * FilterBar Component
 * Combines SearchBar, CategoryFilter, RegionFilter, and SalaryToggle
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { RegionFilter } from './RegionFilter';
import { SalaryToggle } from './SalaryToggle';
import type { JobFilters, Category, Region } from '@/types';
import type { Language } from '@/components/ui';

export interface FilterBarProps {
  /** Current filters */
  filters: JobFilters;
  /** Change handler */
  onChange: (filters: Partial<JobFilters>) => void;
  /** Clear filters handler */
  onClear: () => void;
  /** Categories data */
  categories: Category[];
  /** Regions data */
  regions: Region[];
  /** Loading state for categories/regions */
  isLoading?: boolean;
  /** Whether there are active filters */
  hasActiveFilters?: boolean;
  /** Additional className */
  className?: string;
}

// Translations
const translations = {
  ge: {
    title: 'ვაკანსიები საქართველოში',
    subtitle: 'იპოვე შენი შემდეგი შესაძლებლობა',
    clearFilters: 'ფილტრების გასუფთავება',
  },
  en: {
    title: 'Jobs in Georgia',
    subtitle: 'Find your next opportunity',
    clearFilters: 'Clear Filters',
  },
};

/**
 * FilterBar combines all filter components in a responsive layout
 */
export function FilterBar({
  filters,
  onChange,
  onClear,
  categories,
  regions,
  isLoading = false,
  hasActiveFilters = false,
  className,
}: FilterBarProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  const handleSearchChange = (q: string) => {
    onChange({ q: q || undefined });
  };

  const handleCategoryChange = (category: string) => {
    onChange({ category: category || undefined });
  };

  const handleRegionChange = (region: string) => {
    onChange({ region: region || undefined });
  };

  const handleSalaryChange = (has_salary: boolean) => {
    onChange({ has_salary: has_salary || undefined });
  };

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)]',
        'border border-[var(--color-border)]',
        'rounded-lg',
        'p-4 md:p-6',
        className
      )}
    >
      {/* Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mb-1">
          {t.title}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t.subtitle}
        </p>
      </div>

      {/* Search Input - Full Width */}
      <div className="mb-4">
        <SearchBar
          value={filters.q || ''}
          onChange={handleSearchChange}
          debounceMs={300}
        />
      </div>

      {/* Filter Controls - Responsive Grid */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          value={filters.category || ''}
          onChange={handleCategoryChange}
          isLoading={isLoading}
        />

        {/* Region Filter */}
        <RegionFilter
          regions={regions}
          value={filters.region || ''}
          onChange={handleRegionChange}
          isLoading={isLoading}
        />

        {/* Salary Toggle */}
        <SalaryToggle
          checked={filters.has_salary || false}
          onChange={handleSalaryChange}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            leftIcon={<X size={16} />}
            className="ml-auto"
          >
            {t.clearFilters}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
