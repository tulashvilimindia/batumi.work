/**
 * SavedJobsPage
 * Page for displaying saved/bookmarked jobs
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { cn } from '@/lib';
import { Button, EmptyState } from '@/components/ui';
import { JobTable } from '@/components/job';
import { useSavedJobsStore } from '@/stores';
import type { Language } from '@/components/ui';

// Translations
const translations = {
  ge: {
    title: 'შენახული ვაკანსიები',
    subtitle: 'თქვენი შენახული ვაკანსიების სია',
    jobsCount: 'შენახული ვაკანსია',
    clearAll: 'ყველას წაშლა',
    confirmClear: 'დარწმუნებული ხართ?',
    emptyTitle: 'შენახული ვაკანსიები არ არის',
    emptyDescription: 'შეინახეთ ვაკანსიები მოგვიანებით სანახავად',
    browseJobs: 'ვაკანსიების ნახვა',
  },
  en: {
    title: 'Saved Jobs',
    subtitle: 'Your bookmarked job listings',
    jobsCount: 'saved jobs',
    clearAll: 'Clear All',
    confirmClear: 'Are you sure?',
    emptyTitle: 'No Saved Jobs',
    emptyDescription: 'Save jobs to view them later',
    browseJobs: 'Browse Jobs',
  },
};

export function SavedJobsPage() {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Saved jobs store
  const { savedJobs, clearAll } = useSavedJobsStore();

  // Confirm before clearing all
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleClearClick = () => {
    if (showConfirm) {
      clearAll();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-reset confirm after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const jobCount = savedJobs.length;

  return (
    <div className={cn('space-y-6')}>
      {/* Header */}
      <div
        className={cn(
          'bg-[var(--color-surface)]',
          'border border-[var(--color-border)]',
          'rounded-lg',
          'p-4 md:p-6'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Bookmark size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
              {t.title}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {t.subtitle}
            </p>
          </div>

          {/* Clear All Button */}
          {jobCount > 0 && (
            <Button
              variant={showConfirm ? 'danger' : 'outline'}
              size="sm"
              onClick={handleClearClick}
              leftIcon={<Trash2 size={16} />}
            >
              {showConfirm ? t.confirmClear : t.clearAll}
            </Button>
          )}
        </div>
      </div>

      {/* Jobs Count */}
      {jobCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {jobCount} {t.jobsCount}
          </p>
        </div>
      )}

      {/* Saved Jobs Table or Empty State */}
      {jobCount > 0 ? (
        <JobTable jobs={savedJobs} />
      ) : (
        <EmptyState
          icon={<Bookmark size={32} />}
          title={t.emptyTitle}
          description={t.emptyDescription}
          action={{
            label: t.browseJobs,
            onClick: () => {},
          }}
          secondaryAction={undefined}
        />
      )}

      {/* Empty State Link - Replace EmptyState action with proper link */}
      {jobCount === 0 && (
        <div className="text-center -mt-4">
          <Link
            to={`/${lang}`}
            className={cn(
              'inline-flex items-center justify-center',
              'px-4 py-2',
              'text-sm font-medium',
              'text-white',
              'bg-[var(--color-primary)]',
              'hover:bg-[var(--color-primary-hover)]',
              'rounded',
              'transition-colors duration-150'
            )}
          >
            {t.browseJobs}
          </Link>
        </div>
      )}
    </div>
  );
}

export default SavedJobsPage;
