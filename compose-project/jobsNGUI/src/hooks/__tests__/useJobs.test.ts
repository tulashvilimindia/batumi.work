/**
 * useJobs Hook Tests
 * Tests API fetching, caching, and filter handling
 */

import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useJobs } from '../useJobs';
import { mockJobs } from '@/__tests__/mocks/data';

// Create a wrapper with QueryClient for testing hooks
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useJobs', () => {
  describe('Initial State', () => {
    it('starts with loading state', () => {
      const { result } = renderHook(() => useJobs({}), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Successful Fetch', () => {
    it('fetches jobs successfully', async () => {
      const { result } = renderHook(() => useJobs({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.items).toHaveLength(mockJobs.length);
      expect(result.current.isError).toBe(false);
    });

    it('returns correct pagination data', async () => {
      const { result } = renderHook(() => useJobs({ page: 1, page_size: 30 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.page).toBe(1);
      expect(result.current.data?.total).toBe(mockJobs.length);
    });
  });

  describe('Filtering', () => {
    it('filters by search query', async () => {
      const { result } = renderHook(() => useJobs({ q: 'Developer' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
      expect(result.current.data?.items.length).toBeGreaterThan(0);
      expect(
        result.current.data?.items.every((job) =>
          job.title_en.toLowerCase().includes('developer')
        )
      ).toBe(true);
    });

    it('filters by category', async () => {
      const { result } = renderHook(
        () => useJobs({ category: 'it-programming' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
      expect(
        result.current.data?.items.every(
          (job) => job.category_slug === 'it-programming'
        )
      ).toBe(true);
    });

    it('filters by has_salary', async () => {
      const { result } = renderHook(() => useJobs({ has_salary: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
      expect(result.current.data?.items.every((job) => job.has_salary)).toBe(
        true
      );
    });

    it('filters by region', async () => {
      const { result } = renderHook(() => useJobs({ region: 'adjara' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
      expect(
        result.current.data?.items.every((job) => job.region_slug === 'adjara')
      ).toBe(true);
    });
  });

  describe('Return Values', () => {
    it('returns isFetching state', async () => {
      const { result } = renderHook(() => useJobs({}), {
        wrapper: createWrapper(),
      });

      // Initially isFetching should be true
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });
    });

    it('returns isPlaceholderData state', async () => {
      const { result } = renderHook(() => useJobs({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPlaceholderData).toBeDefined();
    });

    it('returns null error when successful', async () => {
      const { result } = renderHook(() => useJobs({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Combined Filters', () => {
    it('combines multiple filters', async () => {
      const { result } = renderHook(
        () =>
          useJobs({
            q: 'developer',
            category: 'it-programming',
            has_salary: true,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
      // All returned jobs should match all filters
      result.current.data?.items.forEach((job) => {
        expect(job.title_en.toLowerCase()).toContain('developer');
        expect(job.category_slug).toBe('it-programming');
        expect(job.has_salary).toBe(true);
      });
    });
  });
});
