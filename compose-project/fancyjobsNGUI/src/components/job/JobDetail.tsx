/**
 * JobDetail Component - Cyberpunk Neon Edition
 * Full job detail view with neon effects and glassmorphism
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Share2, Zap } from 'lucide-react';
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
 * JobDetail - Cyberpunk styled job detail view
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
          fontFamily: 'Rajdhani, sans-serif',
          color: '#A0A0B0',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#00F5FF';
          e.currentTarget.style.textShadow = '0 0 10px rgba(0, 245, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#A0A0B0';
          e.currentTarget.style.textShadow = 'none';
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
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: 'rgba(10, 10, 20, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 245, 255, 0.15)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(0, 245, 255, 0.02)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-[2px] bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
        <div className="absolute top-0 left-0 w-[2px] h-16 bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
        <div className="absolute top-0 right-0 w-20 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
        <div className="absolute top-0 right-0 w-[2px] h-16 bg-neon-pink" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
        <div className="absolute bottom-0 left-0 w-20 h-[2px] bg-neon-purple" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
        <div className="absolute bottom-0 left-0 w-[2px] h-16 bg-neon-purple" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
        <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-neon-green" style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }} />
        <div className="absolute bottom-0 right-0 w-[2px] h-16 bg-neon-green" style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }} />

        {/* VIP indicator */}
        {job.is_vip && (
          <div
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 230, 0, 0.2), rgba(255, 0, 110, 0.2))',
              border: '1px solid rgba(255, 230, 0, 0.5)',
              boxShadow: '0 0 20px rgba(255, 230, 0, 0.4)',
            }}
          >
            <Zap size={14} className="text-neon-yellow" style={{ filter: 'drop-shadow(0 0 5px #FFE600)' }} />
            <span
              className="text-xs font-bold tracking-wider text-neon-yellow"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                textShadow: '0 0 10px rgba(255, 230, 0, 0.5)',
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
              fontFamily: 'Orbitron, sans-serif',
              background: job.is_vip
                ? 'linear-gradient(135deg, #FFE600, #FF006E)'
                : 'linear-gradient(135deg, #00F5FF, #FF006E, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h1>

          {/* Company */}
          <p
            className="text-lg tracking-wider"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#00F5FF',
              textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
            }}
          >
            {job.company_name}
          </p>
        </header>

        {/* Neon Divider */}
        <div
          className="h-[1px] mb-6"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), rgba(255, 0, 110, 0.5), transparent)',
          }}
        />

        {/* Metadata Grid */}
        <JobMetadata job={job} showDeadline showSource />

        {/* Neon Divider */}
        <div
          className="h-[1px] my-6"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(0, 245, 255, 0.5), transparent)',
          }}
        />

        {/* Description Section */}
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#FF006E',
              textShadow: '0 0 10px rgba(255, 0, 110, 0.5)',
            }}
          >
            <span
              className="w-1 h-6 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #FF006E, #8B5CF6)',
                boxShadow: '0 0 10px rgba(255, 0, 110, 0.5)',
              }}
            />
            {t.jobDescription}
          </h2>
          <div
            className={cn(
              'prose prose-sm max-w-none',
              'text-text-primary',
              '[&_a]:text-neon-cyan [&_a]:no-underline',
              '[&_a:hover]:text-neon-pink [&_a:hover]:underline',
              '[&_ul]:list-disc [&_ul]:pl-6',
              '[&_ol]:list-decimal [&_ol]:pl-6',
              '[&_li]:mb-1 [&_li]:text-text-secondary',
              '[&_p]:mb-4 [&_p]:text-text-secondary',
              '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-neon-cyan',
              '[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-neon-purple',
              '[&_strong]:font-semibold [&_strong]:text-text-primary',
              '[&_br]:block [&_br]:content-[""] [&_br]:mt-2'
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </section>

        {/* Neon Divider */}
        <div
          className="h-[1px] my-6"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.5), rgba(139, 92, 246, 0.5), transparent)',
          }}
        />

        {/* Source and Actions */}
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Source Link */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm tracking-wider"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: '#A0A0B0',
              }}
            >
              {t.source}: {job.source_name}
            </span>
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm tracking-wider transition-all duration-300"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: '#8B5CF6',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00F5FF';
                e.currentTarget.style.textShadow = '0 0 10px rgba(0, 245, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8B5CF6';
                e.currentTarget.style.textShadow = 'none';
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
                variant={isSaved ? 'neon-pink' : 'outline'}
                size="sm"
                onClick={onSave}
                leftIcon={<Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />}
              >
                {isSaved ? t.saved : t.save}
              </Button>
            )}
            {onShare && (
              <Button
                variant="neon-cyan"
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
