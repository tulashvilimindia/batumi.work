/**
 * Custom Render Utility
 * Wraps components with all necessary providers for testing
 */

import React, { ReactElement, Suspense } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial URL entries for the router */
  initialEntries?: string[];
  /** Custom QueryClient instance */
  queryClient?: QueryClient;
  /** Initial language */
  language?: 'ge' | 'en';
}

/**
 * Creates a fresh QueryClient for testing
 * Disables retries for deterministic tests
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Renders a component with all providers
 * Use this instead of the default render for components that need:
 * - React Query
 * - React Router
 * - i18n translations
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/ge'],
    queryClient = createTestQueryClient(),
    language = 'ge',
    ...options
  }: CustomRenderOptions = {}
) {
  // Set the language before rendering
  i18n.changeLanguage(language);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={initialEntries}>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </MemoryRouter>
        </I18nextProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Export custom render as default render
export { renderWithProviders as render };
