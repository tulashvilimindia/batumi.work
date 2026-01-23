/**
 * JobMetadata Component - Cyberpunk Neon Edition
 * Grid display of job metadata with neon icons and glowing effects
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

// Icon color configurations for cyberpunk theme
const iconColors = {
  company: { color: '#00F5FF', glow: 'rgba(0, 245, 255, 0.5)' },
  location: { color: '#FF006E', glow: 'rgba(255, 0, 110, 0.5)' },
  category: { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)' },
  salary: { color: '#39FF14', glow: 'rgba(57, 255, 20, 0.5)' },
  published: { color: '#00F5FF', glow: 'rgba(0, 245, 255, 0.5)' },
  deadline: { color: '#FF6B35', glow: 'rgba(255, 107, 53, 0.5)' },
  source: { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)' },
};

interface MetadataItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorKey: keyof typeof iconColors;
  className?: string;
}

/**
 * Single metadata item with cyberpunk styling
 */
function MetadataItem({ icon, label, value, colorKey, className }: MetadataItemProps) {
  const colors = iconColors[colorKey];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-all duration-300',
        'hover:bg-white/[0.02]',
        className
      )}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg"
        style={{
          background: `${colors.color}10`,
          border: `1px solid ${colors.color}30`,
          boxShadow: `0 0 15px ${colors.glow}`,
        }}
        aria-hidden="true"
      >
        <div
          style={{
            color: colors.color,
            filter: `drop-shadow(0 0 5px ${colors.glow})`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] tracking-[0.2em] uppercase mb-1"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#A0A0B0',
          }}
        >
          {label}
        </p>
        <p
          className="text-sm font-medium truncate"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#E0E0E8',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * JobMetadata - Cyberpunk styled metadata grid
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

  // Get localized values
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
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
        className
      )}
    >
      {/* Company */}
      <MetadataItem
        icon={<Building2 size={18} />}
        label={t.company}
        value={job.company_name}
        colorKey="company"
      />

      {/* Location */}
      <MetadataItem
        icon={<MapPin size={18} />}
        label={t.location}
        value={regionName || job.location}
        colorKey="location"
      />

      {/* Category */}
      <MetadataItem
        icon={<FolderOpen size={18} />}
        label={t.category}
        value={categoryName}
        colorKey="category"
      />

      {/* Salary (only if available) */}
      {job.has_salary && (
        <MetadataItem
          icon={<Banknote size={18} />}
          label={t.salary}
          value={formatSalary(job.salary_min, job.salary_max, locale)}
          colorKey="salary"
        />
      )}

      {/* Published Date */}
      <MetadataItem
        icon={<Calendar size={18} />}
        label={t.published}
        value={publishedDate}
        colorKey="published"
      />

      {/* Deadline */}
      {showDeadline && (
        <MetadataItem
          icon={<Clock size={18} />}
          label={t.deadline}
          value={deadlineDate}
          colorKey="deadline"
        />
      )}

      {/* Source */}
      {showSource && job.source_name && (
        <MetadataItem
          icon={<Globe size={18} />}
          label={t.source}
          value={job.source_name}
          colorKey="source"
        />
      )}
    </div>
  );
}

export default JobMetadata;
