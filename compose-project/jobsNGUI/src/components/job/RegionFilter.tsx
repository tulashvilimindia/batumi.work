/**
 * RegionFilter Component
 * Dropdown filter for job regions/locations using Select component
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Select, type SelectOption } from '@/components/ui';
import type { Region } from '@/types';
import type { Language } from '@/components/ui';

export interface RegionFilterProps {
  /** Array of regions */
  regions: Region[];
  /** Currently selected region slug */
  value: string;
  /** Change handler */
  onChange: (slug: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

// Translations
const translations = {
  ge: {
    allRegions: 'ყველა რეგიონი',
    selectRegion: 'აირჩიეთ რეგიონი',
  },
  en: {
    allRegions: 'All Regions',
    selectRegion: 'Select Region',
  },
};

/**
 * RegionFilter renders a dropdown for filtering jobs by region
 * Uses the Select component from UI library
 */
export function RegionFilter({
  regions,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  className,
}: RegionFilterProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Build options array
  const options: SelectOption[] = [
    { value: '', label: t.allRegions },
    ...regions.map((region) => ({
      value: region.slug,
      label: lang === 'en'
        ? region.name_en
        : region.name_ge,
    })),
  ];

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={t.selectRegion}
      disabled={disabled || isLoading}
      className={cn('min-w-[160px]', className)}
      aria-label={t.selectRegion}
    />
  );
}

export default RegionFilter;
