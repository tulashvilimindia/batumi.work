/**
 * JobDetail Component
 * Full job detail view with title, metadata, description, and actions
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';
import { JobBadges } from './JobBadges';
import { JobMetadata } from './JobMetadata';
import type { JobDetail as JobDetailType } from '@/types';
import type { Language } from '@/components/ui';

export interface JobDetailProps {
  /** Job detail data */
  job: JobDetailType;
  /** Whether job is saved */
  isSaved?: boolean;
  /** Callback when save button clicked */
  onSave?: () => void;
  /** Callback when share button clicked */
  onShare?: () => void;
  /** Additional className */
  className?: string;
}

// Translations
const translations = {
  ge: {
    backToJobs: 'უკან',
    jobDescription: 'სამუშაოს აღწერა',
    viewOriginal: 'ორიგინალის ნახვა',
    save: 'შენახვა',
    saved: 'შენახულია',
    share: 'გაზიარება',
    source: 'წყარო',
  },
  en: {
    backToJobs: 'Back',
    jobDescription: 'Job Description',
    viewOriginal: 'View Original',
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    source: 'Source',
  },
};

/**
 * Sanitize HTML content
 * Basic sanitization - in production, use DOMPurify
 */
function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * JobDetail displays the full job information
 * Includes title, badges, metadata grid, description, and action buttons
 */
export function JobDetail({
  job,
  isSaved = false,
  onSave,
  onShare,
  className,
}: JobDetailProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Get localized content
  const title = lang === 'en' ? job.title_en : job.title_ge;
  const description = lang === 'en' ? job.body_en : job.body_ge;

  // Sanitize description HTML
  const sanitizedDescription = sanitizeHtml(description);

  return (
    <article className={cn('space-y-6', className)}>
      {/* Back Button */}
      <Link
        to={`/${lang}`}
        className={cn(
          'inline-flex items-center gap-2',
          'text-sm text-[var(--color-text-secondary)]',
          'hover:text-[var(--color-text-primary)]',
          'transition-colors duration-150'
        )}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        {t.backToJobs}
      </Link>

      {/* Header Section */}
      <header className="space-y-3">
        {/* Badges */}
        <JobBadges job={job} size="md" />

        {/* Title */}
        <h1
          className={cn(
            'text-2xl font-bold',
            'text-[var(--color-text-primary)]',
            job.is_vip && 'text-[var(--color-vip)]'
          )}
        >
          {title}
        </h1>

        {/* Company */}
        <p className="text-lg text-[var(--color-text-secondary)]">
          {job.company_name}
        </p>
      </header>

      {/* Divider */}
      <hr className="border-[var(--color-border)]" />

      {/* Metadata Grid */}
      <JobMetadata job={job} showDeadline showSource />

      {/* Divider */}
      <hr className="border-[var(--color-border)]" />

      {/* Description Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {t.jobDescription}
        </h2>
        <div
          className={cn(
            'prose prose-sm max-w-none',
            'text-[var(--color-text-primary)]',
            // Prose styling overrides
            '[&_a]:text-[var(--color-link)]',
            '[&_a:hover]:text-[var(--color-link-hover)]',
            '[&_ul]:list-disc [&_ul]:pl-6',
            '[&_ol]:list-decimal [&_ol]:pl-6',
            '[&_li]:mb-1',
            '[&_p]:mb-4',
            '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2',
            '[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2',
            '[&_strong]:font-semibold',
            '[&_br]:block [&_br]:content-[""] [&_br]:mt-2'
          )}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </section>

      {/* Divider */}
      <hr className="border-[var(--color-border)]" />

      {/* Source and Actions */}
      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Source Link */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-tertiary)]">
            {t.source}: {job.source_name}
          </span>
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1',
              'text-sm text-[var(--color-link)]',
              'hover:text-[var(--color-link-hover)]',
              'hover:underline'
            )}
          >
            {t.viewOriginal}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onSave && (
            <Button
              variant={isSaved ? 'primary' : 'outline'}
              size="sm"
              onClick={onSave}
              leftIcon={<Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />}
            >
              {isSaved ? t.saved : t.save}
            </Button>
          )}
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              leftIcon={<Share2 size={16} />}
            >
              {t.share}
            </Button>
          )}
        </div>
      </footer>
    </article>
  );
}

export default JobDetail;
