/**
 * FilterBar Component - V5 Enhanced Folk Edition
 * Mobile-first responsive filter panel with search autocomplete
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { X, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchAutocomplete } from './SearchAutocomplete';
import { CategoryFilter } from './CategoryFilter';
import { RegionFilter } from './RegionFilter';
import { SalaryToggle } from './SalaryToggle';
import { useRecentSearchesStore } from '@/stores';
import type { JobFilters, Category, Region } from '@/types';
import type { Language } from '@/components/ui';

export interface FilterBarProps {
  filters: JobFilters;
  onChange: (filters: Partial<JobFilters>) => void;
  onClear: () => void;
  categories: Category[];
  regions: Region[];
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  className?: string;
}

// Translations
const translations = {
  ge: {
    title: 'აჭარული სამუშაოები',
    subtitle: 'იპოვე შენი შემდეგი შესაძლებლობა',
    clearFilters: 'გასუფთავება',
  },
  en: {
    title: 'Adjarian Jobs',
    subtitle: 'Find your next opportunity',
    clearFilters: 'Clear',
  },
};

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

  // V5: Recent searches store for tracking
  const { addSearch } = useRecentSearchesStore();

  const handleSearchChange = (q: string) => {
    onChange({ q: q || undefined });
  };

  const handleSearchSubmit = (q: string) => {
    if (q.trim()) {
      addSearch(q.trim());
    }
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
        'relative',
        'rounded-lg',
        'p-4 md:p-6 lg:p-8', // Smaller padding on mobile
        className
      )}
      style={{
        background: '#FFFAF5',
        border: '2px solid #D4A574',
        boxShadow: '4px 4px 0 #3D2914',
      }}
    >
      {/* Corner decorations - hidden on mobile, smaller on tablet */}
      <div className="hidden md:block absolute top-0 left-0 w-8 lg:w-12 h-8 lg:h-12">
        <div className="absolute top-0 left-0 w-6 lg:w-10 h-[2px] bg-[#8B2635]" />
        <div className="absolute top-0 left-0 w-[2px] h-6 lg:h-10 bg-[#8B2635]" />
        <div className="absolute top-2 lg:top-4 left-2 lg:left-4 w-1.5 lg:w-2 h-1.5 lg:h-2 rotate-45 bg-[#D4A574]" />
      </div>
      <div className="hidden md:block absolute top-0 right-0 w-8 lg:w-12 h-8 lg:h-12">
        <div className="absolute top-0 right-0 w-6 lg:w-10 h-[2px] bg-[#2D5A3D]" />
        <div className="absolute top-0 right-0 w-[2px] h-6 lg:h-10 bg-[#2D5A3D]" />
        <div className="absolute top-2 lg:top-4 right-2 lg:right-4 w-1.5 lg:w-2 h-1.5 lg:h-2 rotate-45 bg-[#D4A574]" />
      </div>
      <div className="hidden md:block absolute bottom-0 left-0 w-8 lg:w-12 h-8 lg:h-12">
        <div className="absolute bottom-0 left-0 w-6 lg:w-10 h-[2px] bg-[#2D5A3D]" />
        <div className="absolute bottom-0 left-0 w-[2px] h-6 lg:h-10 bg-[#2D5A3D]" />
        <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 w-1.5 lg:w-2 h-1.5 lg:h-2 rotate-45 bg-[#D4A574]" />
      </div>
      <div className="hidden md:block absolute bottom-0 right-0 w-8 lg:w-12 h-8 lg:h-12">
        <div className="absolute bottom-0 right-0 w-6 lg:w-10 h-[2px] bg-[#8B2635]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-6 lg:h-10 bg-[#8B2635]" />
        <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 w-1.5 lg:w-2 h-1.5 lg:h-2 rotate-45 bg-[#D4A574]" />
      </div>

      {/* Title Section - Compact on mobile */}
      <div className="text-center mb-4 md:mb-6 lg:mb-8 relative">
        {/* Decorative sun icon - hidden on mobile */}
        <div className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2">
          <Sun size={20} style={{ color: '#D4A574' }} />
        </div>

        <h1
          className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#3D2914',
          }}
        >
          {t.title}
        </h1>
        <p
          className="text-xs md:text-sm tracking-wide"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#8B6B4B',
          }}
        >
          {t.subtitle}
        </p>
      </div>

      {/* V5: Enhanced Search with Autocomplete */}
      <div className="mb-4 md:mb-6">
        <SearchAutocomplete
          value={filters.q || ''}
          onChange={handleSearchChange}
          onSearch={handleSearchSubmit}
          debounceMs={300}
        />
      </div>

      {/* Filter Controls - Stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
        {/* Category & Region - Full width on mobile, flex on larger screens */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 flex-1">
          {/* Category Filter */}
          <div className="flex-1 min-w-0 sm:min-w-[140px] md:min-w-[160px]">
            <CategoryFilter
              categories={categories}
              value={filters.category || ''}
              onChange={handleCategoryChange}
              isLoading={isLoading}
            />
          </div>

          {/* Region Filter */}
          <div className="flex-1 min-w-0 sm:min-w-[120px] md:min-w-[140px]">
            <RegionFilter
              regions={regions}
              value={filters.region || ''}
              onChange={handleRegionChange}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Salary Toggle & Clear - Row on mobile */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <SalaryToggle
            checked={filters.has_salary || false}
            onChange={handleSalaryChange}
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className={cn(
                'flex items-center gap-1.5 md:gap-2',
                'px-3 md:px-4 py-2',
                'text-xs md:text-sm font-semibold tracking-wide',
                'rounded-lg',
                'transition-all duration-200',
                'shrink-0'
              )}
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                background: 'rgba(139, 38, 53, 0.1)',
                border: '1px solid rgba(139, 38, 53, 0.3)',
                color: '#8B2635',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 38, 53, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 38, 53, 0.1)';
              }}
            >
              <X size={14} />
              <span>{t.clearFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom accent line - hidden on mobile */}
      <div
        className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4A574, #8B2635, #2D5A3D, transparent)',
        }}
      />
    </div>
  );
}

export default FilterBar;
