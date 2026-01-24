/**
 * CategoryFilter Component
 * Dropdown filter for job categories using Select component
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Select, type SelectOption } from '@/components/ui';
import type { Category } from '@/types';
import type { Language } from '@/components/ui';

export interface CategoryFilterProps {
  /** Array of categories */
  categories: Category[];
  /** Currently selected category slug */
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
    allCategories: 'ყველა კატეგორია',
    selectCategory: 'აირჩიეთ კატეგორია',
  },
  en: {
    allCategories: 'All Categories',
    selectCategory: 'Select Category',
  },
};

/**
 * CategoryFilter renders a dropdown for filtering jobs by category
 * Uses the Select component from UI library
 */
export function CategoryFilter({
  categories,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  className,
}: CategoryFilterProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Build options array
  const options: SelectOption[] = [
    { value: '', label: t.allCategories },
    ...categories.map((category) => ({
      value: category.slug,
      label: lang === 'en'
        ? category.name_en
        : category.name_ge,
    })),
  ];

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={t.selectCategory}
      disabled={disabled || isLoading}
      className={cn('min-w-[180px]', className)}
      aria-label={t.selectCategory}
    />
  );
}

export default CategoryFilter;
