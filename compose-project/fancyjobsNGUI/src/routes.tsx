import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomePage, JobDetailPage, SavedJobsPage, NotFoundPage } from '@/pages';

/**
 * Application routes configuration
 *
 * Route structure:
 * - / -> Redirects to /ge (Georgian default)
 * - /:lang -> Layout with language parameter
 *   - / -> HomePage (job listings)
 *   - /job/:id -> JobDetailPage (single job view)
 *   - /saved -> SavedJobsPage (bookmarked jobs)
 *   - * -> NotFoundPage
 */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/ge" replace />,
    },
    {
      path: '/:lang',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'job/:id',
          element: <JobDetailPage />,
        },
        {
          path: 'saved',
          element: <SavedJobsPage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    basename: '/v3',
  }
);

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = ['ge', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Check if a language code is supported
 */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}
