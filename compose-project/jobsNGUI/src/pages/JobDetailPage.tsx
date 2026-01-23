/**
 * JobDetailPage
 * Page for displaying full job details
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib';
import { LoadingState, ErrorState } from '@/components/ui';
import { JobDetail } from '@/components/job';
import { useJob } from '@/hooks';
import { useSavedJobsStore } from '@/stores';
import type { Language } from '@/components/ui';

// Translations
const translations = {
  ge: {
    loading: 'იტვირთება...',
    notFoundTitle: 'ვაკანსია ვერ მოიძებნა',
    notFoundDescription: 'ვაკანსია არ არსებობს ან წაიშალა',
    errorTitle: 'შეცდომა',
    errorDescription: 'ვაკანსიის ჩატვირთვა ვერ მოხერხდა',
    retry: 'ხელახლა ცდა',
    backToJobs: 'უკან სიაში',
  },
  en: {
    loading: 'Loading...',
    notFoundTitle: 'Job Not Found',
    notFoundDescription: 'This job listing does not exist or has been removed',
    errorTitle: 'Error',
    errorDescription: 'Could not load job details',
    retry: 'Try Again',
    backToJobs: 'Back to Jobs',
  },
};

export function JobDetailPage() {
  const { lang = 'ge', id } = useParams<{ lang: Language; id: string }>();
  const navigate = useNavigate();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Parse job ID from URL
  const jobId = id ? parseInt(id, 10) : undefined;

  // Fetch job data
  const {
    data: job,
    isLoading,
    isError,
    isNotFound,
  } = useJob(jobId);

  // Saved jobs store
  const { isSaved, toggleSave } = useSavedJobsStore();

  // Handle save button click
  const handleSave = () => {
    if (job) {
      toggleSave(job);
    }
  };

  // Handle share button click
  const handleShare = async () => {
    if (!job) return;

    const shareUrl = window.location.href;
    const shareTitle = lang === 'en' ? job.title_en : job.title_ge;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} - ${job.company_name}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Could show a toast here
      console.log('Link copied to clipboard');
    } catch {
      console.error('Failed to copy link');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/${lang}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <LoadingState message={t.loading} />
      </div>
    );
  }

  // Not found state
  if (isNotFound || (!isLoading && !job)) {
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorState
          title={t.notFoundTitle}
          description={t.notFoundDescription}
          retry={handleBack}
        />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorState
          title={t.errorTitle}
          description={t.errorDescription}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Job detail
  if (!job) {
    return null;
  }

  return (
    <div className={cn('max-w-3xl mx-auto')}>
      <JobDetail
        job={job}
        isSaved={isSaved(job.id)}
        onSave={handleSave}
        onShare={handleShare}
      />
    </div>
  );
}

export default JobDetailPage;
