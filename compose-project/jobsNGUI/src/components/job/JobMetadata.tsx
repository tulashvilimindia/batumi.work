/**
 * JobMetadata Component
 * Grid display of job metadata items (company, location, category, salary, dates)
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  FolderOpen,
  Calendar,
  Clock,
  Banknote,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';
import type { Job, JobDetail } from '@/types';
import type { Language } from '@/components/ui';

export interface JobMetadataProps {
  /** Job data */
  job: Job | JobDetail;
  /** Show deadline */
  showDeadline?: boolean;
  /** Show source information */
  showSource?: boolean;
  /** Additional className */
  className?: string;
}

// Translations
const translations = {
  ge: {
    company: 'კომპანია',
    location: 'მდებარეობა',
    category: 'კატეგორია',
    salary: 'ხელფასი',
    published: 'გამოქვეყნდა',
    deadline: 'ბოლო ვადა',
    source: 'წყარო',
    noDeadline: 'მითითებული არ არის',
  },
  en: {
    company: 'Company',
    location: 'Location',
    category: 'Category',
    salary: 'Salary',
    published: 'Published',
    deadline: 'Deadline',
    source: 'Source',
    noDeadline: 'Not specified',
  },
};

/**
 * Format salary range
 */
function formatSalary(min: number | null, max: number | null, locale: 'ge' | 'en'): string {
  if (!min && !max) return '-';

  const currency = locale === 'ge' ? '₾' : 'GEL';

  if (min && max) {
    if (min === max) {
      return `${min.toLocaleString()} ${currency}`;
    }
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  }

  if (min) {
    return `${locale === 'ge' ? 'დან' : 'From'} ${min.toLocaleString()} ${currency}`;
  }

  if (max) {
    return `${locale === 'ge' ? 'მდე' : 'Up to'} ${max.toLocaleString()} ${currency}`;
  }

  return '-';
}

interface MetadataItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

/**
 * Single metadata item with icon, label, and value
 */
function MetadataItem({ icon, label, value, className }: MetadataItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10',
          'rounded-lg',
          'bg-[var(--color-surface-alt)]',
          'text-[var(--color-text-tertiary)]'
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">{label}</p>
        <p className="text-sm text-[var(--color-text-primary)] font-medium truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * JobMetadata displays job information in a grid layout
 * Shows company, location, category, salary (if available), and dates
 */
export function JobMetadata({
  job,
  showDeadline = true,
  showSource = false,
  className,
}: JobMetadataProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Get localized values - handle both flat and nested category/region
  const categoryName = job.category
    ? (lang === 'en' ? job.category.name_en : job.category.name_ge)
    : (lang === 'en' ? job.category_name_en : job.category_name_ge) || '-';
  const regionName = job.region
    ? (lang === 'en' ? job.region.name_en : job.region.name_ge)
    : (lang === 'en' ? job.region_name_en : job.region_name_ge);

  // Format dates
  const publishedDate = formatDate(job.published_at, locale);
  const deadlineDate = job.deadline_at ? formatDate(job.deadline_at, locale) : t.noDeadline;

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {/* Company */}
      <MetadataItem
        icon={<Building2 size={20} />}
        label={t.company}
        value={job.company_name}
      />

      {/* Location */}
      <MetadataItem
        icon={<MapPin size={20} />}
        label={t.location}
        value={regionName || job.location}
      />

      {/* Category */}
      <MetadataItem
        icon={<FolderOpen size={20} />}
        label={t.category}
        value={categoryName}
      />

      {/* Salary (only if available) */}
      {job.has_salary && (
        <MetadataItem
          icon={<Banknote size={20} />}
          label={t.salary}
          value={formatSalary(job.salary_min, job.salary_max, locale)}
        />
      )}

      {/* Published Date */}
      <MetadataItem
        icon={<Calendar size={20} />}
        label={t.published}
        value={publishedDate}
      />

      {/* Deadline */}
      {showDeadline && (
        <MetadataItem
          icon={<Clock size={20} />}
          label={t.deadline}
          value={deadlineDate}
        />
      )}

      {/* Source */}
      {showSource && job.source_name && (
        <MetadataItem
          icon={<Globe size={20} />}
          label={t.source}
          value={job.source_name}
        />
      )}
    </div>
  );
}

export default JobMetadata;
