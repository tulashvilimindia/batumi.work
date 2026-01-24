/**
 * JobDetail Component - Adjarian Folk Edition
 * Full job detail view with warm traditional styling
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Share2, Star } from 'lucide-react';
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
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * JobDetail - Adjarian folk styled job detail view
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

  const title = lang === 'en' ? job.title_en : job.title_ge;
  const description = lang === 'en' ? job.body_en : job.body_ge;
  const sanitizedDescription = sanitizeHtml(description);

  return (
    <article className={cn('space-y-6', className)}>
      {/* Back Button */}
      <Link
        to={`/${lang}`}
        className={cn(
          'inline-flex items-center gap-2',
          'text-sm tracking-wider',
          'transition-all duration-300',
          'group'
        )}
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          color: '#8B6B4B',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#8B2635';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#8B6B4B';
        }}
      >
        <ArrowLeft
          size={18}
          className="transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        {t.backToJobs}
      </Link>

      {/* Main Content Card */}
      <div
        className="relative overflow-hidden rounded-lg p-6 md:p-8"
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

        {/* VIP indicator */}
        {job.is_vip && (
          <div
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-md"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.3), rgba(232, 184, 109, 0.3))',
              border: '2px solid #D4A574',
              boxShadow: '2px 2px 0 #3D2914',
            }}
          >
            <Star size={14} style={{ color: '#6B4423', fill: '#D4A574' }} />
            <span
              className="text-xs font-bold tracking-wider"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: '#6B4423',
              }}
            >
              VIP
            </span>
          </div>
        )}

        {/* Header Section */}
        <header className="space-y-4 mb-6">
          {/* Badges */}
          <JobBadges job={job} size="md" />

          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#3D2914',
            }}
          >
            {title}
          </h1>

          {/* Company */}
          <p
            className="text-lg tracking-wide"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#8B2635',
            }}
          >
            {job.company_name}
          </p>
        </header>

        {/* Warm Divider */}
        <div
          className="h-[2px] mb-6"
          style={{
            background: 'linear-gradient(90deg, transparent, #D4A574, #8B2635, #2D5A3D, transparent)',
          }}
        />

        {/* Metadata Grid */}
        <JobMetadata job={job} showDeadline showSource />

        {/* Warm Divider */}
        <div
          className="h-[2px] my-6"
          style={{
            background: 'linear-gradient(90deg, transparent, #2D5A3D, #D4A574, transparent)',
          }}
        />

        {/* Description Section */}
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#8B2635',
            }}
          >
            <span
              className="w-1 h-6 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #8B2635, #D4A574)',
              }}
            />
            {t.jobDescription}
          </h2>
          <div
            className={cn(
              'prose prose-sm max-w-none',
              '[&_a]:text-[#8B2635] [&_a]:no-underline',
              '[&_a:hover]:text-[#2D5A3D] [&_a:hover]:underline',
              '[&_ul]:list-disc [&_ul]:pl-6',
              '[&_ol]:list-decimal [&_ol]:pl-6',
              '[&_li]:mb-1',
              '[&_p]:mb-4',
              '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2',
              '[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2',
              '[&_strong]:font-semibold',
              '[&_br]:block [&_br]:content-[""] [&_br]:mt-2'
            )}
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#6B4423',
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </section>

        {/* Warm Divider */}
        <div
          className="h-[2px] my-6"
          style={{
            background: 'linear-gradient(90deg, transparent, #D4A574, #2D5A3D, transparent)',
          }}
        />

        {/* Source and Actions */}
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Source Link */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm tracking-wide"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: '#8B6B4B',
              }}
            >
              {t.source}: {job.source_name}
            </span>
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm tracking-wide transition-all duration-300"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: '#2D5A3D',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#8B2635';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#2D5A3D';
              }}
            >
              {t.viewOriginal}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {onSave && (
              <Button
                variant={isSaved ? 'folk-red' : 'outline'}
                size="sm"
                onClick={onSave}
                leftIcon={<Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />}
              >
                {isSaved ? t.saved : t.save}
              </Button>
            )}
            {onShare && (
              <Button
                variant="folk-green"
                size="sm"
                onClick={onShare}
                leftIcon={<Share2 size={16} />}
              >
                {t.share}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}

export default JobDetail;
