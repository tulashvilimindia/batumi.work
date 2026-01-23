/**
 * FilterBar Component - Cyberpunk Neon Edition
 * Glassmorphic filter panel with neon accents and glowing effects
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
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
 * FilterBar - Cyberpunk styled filter panel
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
        'relative overflow-hidden',
        'rounded-2xl',
        'p-6 md:p-8',
        className
      )}
      style={{
        background: 'rgba(10, 10, 20, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 245, 255, 0.15)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(0, 245, 255, 0.02)',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-[2px] bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
      <div className="absolute top-0 left-0 w-[2px] h-12 bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
      <div className="absolute top-0 right-0 w-16 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
      <div className="absolute top-0 right-0 w-[2px] h-12 bg-neon-pink" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
      <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-neon-purple" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
      <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-neon-purple" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
      <div className="absolute bottom-0 right-0 w-16 h-[2px] bg-neon-green" style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }} />
      <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-neon-green" style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }} />

      {/* Title Section */}
      <div className="text-center mb-8 relative">
        {/* Decorative sparkle */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <Sparkles
            size={20}
            className="text-neon-yellow animate-pulse"
            style={{ filter: 'drop-shadow(0 0 10px #FFE600)' }}
          />
        </div>

        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(135deg, #00F5FF, #FF006E, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(0, 245, 255, 0.3)',
          }}
        >
          {t.title}
        </h1>
        <p
          className="text-sm tracking-[0.2em] uppercase"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#A0A0B0',
            textShadow: '0 0 10px rgba(160, 160, 176, 0.3)',
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
              'text-sm font-semibold tracking-wider uppercase',
              'rounded-lg',
              'transition-all duration-300'
            )}
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              background: 'rgba(255, 0, 110, 0.1)',
              border: '1px solid rgba(255, 0, 110, 0.3)',
              color: '#FF006E',
              textShadow: '0 0 10px rgba(255, 0, 110, 0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 110, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 110, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 110, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <X size={16} />
            <span className="hidden sm:inline">{t.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), rgba(255, 0, 110, 0.5), transparent)',
        }}
      />
    </div>
  );
}

export default FilterBar;
