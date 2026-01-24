/**
 * FilterBar Component - Adjarian Folk Edition
 * Traditional styled filter panel with warm colors
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { X, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { RegionFilter } from './RegionFilter';
import { SalaryToggle } from './SalaryToggle';
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
    subtitle: 'იპოვე შენი შემდეგი შესაძლებლობა ბათუმსა და აჭარაში',
    clearFilters: 'ფილტრების გასუფთავება',
  },
  en: {
    title: 'Adjarian Jobs',
    subtitle: 'Find your next opportunity in Batumi & Adjara',
    clearFilters: 'Clear Filters',
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
        'relative',
        'rounded-lg',
        'p-6 md:p-8',
        className
      )}
      style={{
        background: '#FFFAF5',
        border: '2px solid #D4A574',
        boxShadow: '4px 4px 0 #3D2914',
      }}
    >
      {/* Corner decorations - traditional carpet style */}
      <div className="absolute top-0 left-0 w-12 h-12">
        <div className="absolute top-0 left-0 w-10 h-[2px] bg-[#8B2635]" />
        <div className="absolute top-0 left-0 w-[2px] h-10 bg-[#8B2635]" />
        <div className="absolute top-4 left-4 w-2 h-2 rotate-45 bg-[#D4A574]" />
      </div>
      <div className="absolute top-0 right-0 w-12 h-12">
        <div className="absolute top-0 right-0 w-10 h-[2px] bg-[#2D5A3D]" />
        <div className="absolute top-0 right-0 w-[2px] h-10 bg-[#2D5A3D]" />
        <div className="absolute top-4 right-4 w-2 h-2 rotate-45 bg-[#D4A574]" />
      </div>
      <div className="absolute bottom-0 left-0 w-12 h-12">
        <div className="absolute bottom-0 left-0 w-10 h-[2px] bg-[#2D5A3D]" />
        <div className="absolute bottom-0 left-0 w-[2px] h-10 bg-[#2D5A3D]" />
        <div className="absolute bottom-4 left-4 w-2 h-2 rotate-45 bg-[#D4A574]" />
      </div>
      <div className="absolute bottom-0 right-0 w-12 h-12">
        <div className="absolute bottom-0 right-0 w-10 h-[2px] bg-[#8B2635]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-10 bg-[#8B2635]" />
        <div className="absolute bottom-4 right-4 w-2 h-2 rotate-45 bg-[#D4A574]" />
      </div>

      {/* Title Section */}
      <div className="text-center mb-8 relative">
        {/* Decorative sun icon */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <Sun size={20} style={{ color: '#D4A574' }} />
        </div>

        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#3D2914',
          }}
        >
          {t.title}
        </h1>
        <p
          className="text-sm tracking-wide"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#8B6B4B',
          }}
        >
          {t.subtitle}
        </p>
      </div>

      {/* Search Input - Full Width */}
      <div className="mb-6">
        <SearchBar
          value={filters.q || ''}
          onChange={handleSearchChange}
          debounceMs={300}
        />
      </div>

      {/* Filter Controls - Responsive Grid */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[180px]">
          <CategoryFilter
            categories={categories}
            value={filters.category || ''}
            onChange={handleCategoryChange}
            isLoading={isLoading}
          />
        </div>

        {/* Region Filter */}
        <div className="flex-1 min-w-[160px]">
          <RegionFilter
            regions={regions}
            value={filters.region || ''}
            onChange={handleRegionChange}
            isLoading={isLoading}
          />
        </div>

        {/* Salary Toggle */}
        <SalaryToggle
          checked={filters.has_salary || false}
          onChange={handleSalaryChange}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className={cn(
              'ml-auto flex items-center gap-2',
              'px-4 py-2',
              'text-sm font-semibold tracking-wide',
              'rounded-lg',
              'transition-all duration-200'
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
            <X size={16} />
            <span className="hidden sm:inline">{t.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4A574, #8B2635, #2D5A3D, transparent)',
        }}
      />
    </div>
  );
}

export default FilterBar;
