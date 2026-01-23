# State Management
# jobsNGUI - State Architecture & Patterns

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Overview

This document defines the state management architecture for jobsNGUI, including where different types of state live, how they interact, and implementation patterns.

---

## 2. State Categories

| Category | Technology | Persistence | Examples |
|----------|------------|-------------|----------|
| **Server State** | TanStack Query | Cache (memory) | Jobs, categories, regions |
| **URL State** | React Router | Browser history | Filters, pagination, language |
| **Client State** | Zustand | localStorage | Theme, saved jobs |
| **Component State** | useState/useReducer | None | Form inputs, open/close |

---

## 3. State Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Application                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   TanStack      │    │   React Router  │    │    Zustand      │ │
│  │     Query       │    │  (URL State)    │    │   (Stores)      │ │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤ │
│  │ • Jobs cache    │    │ • Filters       │    │ • Theme         │ │
│  │ • Categories    │    │ • Page number   │    │ • Saved jobs    │ │
│  │ • Regions       │    │ • Language      │    │                 │ │
│  │ • Stale/fresh   │    │ • Job ID        │    │                 │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘ │
│           │                      │                      │          │
│           └──────────────────────┼──────────────────────┘          │
│                                  │                                  │
│                          ┌───────▼───────┐                         │
│                          │   Components  │                         │
│                          │  (Local State)│                         │
│                          └───────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Server State (TanStack Query)

### 4.1 Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

### 4.2 Provider Setup

```typescript
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 4.3 Query Key Convention

```typescript
// src/api/queryKeys.ts
export const queryKeys = {
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.all, 'list', filters] as const,
    detail: (id: number) => [...queryKeys.jobs.all, 'detail', id] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },

  // Regions
  regions: {
    all: ['regions'] as const,
    list: () => [...queryKeys.regions.all, 'list'] as const,
  },
};
```

### 4.4 Jobs Query Hook

```typescript
// src/hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { JobFilters, JobListResponse } from '@/types';

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => api.jobs.list(filters),
    placeholderData: (previousData) => previousData, // Keep old data while loading
  });
}
```

### 4.5 Single Job Query Hook

```typescript
// src/hooks/useJob.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { JobDetail } from '@/types';

export function useJob(id: number) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => api.jobs.get(id),
    enabled: !!id && id > 0,
  });
}
```

### 4.6 Categories Query Hook

```typescript
// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Category } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: api.categories.list,
    staleTime: 60 * 60 * 1000, // 1 hour - categories rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
```

### 4.7 Prefetching

```typescript
// Prefetch job detail on hover
function JobCard({ job }: { job: Job }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.detail(job.id),
      queryFn: () => api.jobs.get(job.id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <Card onMouseEnter={handleMouseEnter}>
      {/* ... */}
    </Card>
  );
}
```

### 4.8 Cache Invalidation

```typescript
// After analytics track (if needed)
function useInvalidateJobs() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.jobs.all,
    });
  };
}
```

---

## 5. URL State (React Router)

### 5.1 Filter State Hook

```typescript
// src/hooks/useFilters.ts
import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import type { JobFilters } from '@/types';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current filters from URL
  const filters: JobFilters = useMemo(() => ({
    q: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    region: searchParams.get('region') || undefined,
    has_salary: searchParams.get('has_salary') === 'true' ? true : undefined,
    page: Number(searchParams.get('page')) || 1,
    page_size: Number(searchParams.get('page_size')) || 30,
    sort: searchParams.get('sort') || '-published_at',
  }), [searchParams]);

  // Update filters in URL
  const setFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setSearchParams((params) => {
      // Merge new filters
      const merged = { ...filters, ...newFilters };

      // Reset page when filters change (except page itself)
      if (!('page' in newFilters)) {
        merged.page = 1;
      }

      // Update URL params
      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) {
          // Don't include defaults
          if (key === 'page' && value === 1) {
            params.delete(key);
          } else if (key === 'page_size' && value === 30) {
            params.delete(key);
          } else if (key === 'sort' && value === '-published_at') {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        } else {
          params.delete(key);
        }
      });

      return params;
    }, { replace: true }); // Use replace to avoid filling history
  }, [filters, setSearchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(filters.q || filters.category || filters.region || filters.has_salary);
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
  };
}
```

### 5.2 Language from URL

```typescript
// src/hooks/useLanguage.ts
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { lang } = useParams<{ lang: 'ge' | 'en' }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const language = lang || 'ge';

  // Sync i18n with URL
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Change language (update URL)
  const setLanguage = useCallback((newLang: 'ge' | 'en') => {
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    navigate(newPath + location.search, { replace: true });
  }, [language, location, navigate]);

  return {
    language,
    setLanguage,
  };
}
```

### 5.3 Route Configuration

```typescript
// src/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomePage, JobDetailPage, SavedJobsPage, NotFoundPage } from '@/pages';

export const router = createBrowserRouter([
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
]);
```

---

## 6. Client State (Zustand)

### 6.1 Theme Store

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),

      setTheme: (theme) => {
        const resolvedTheme = resolveTheme(theme);
        set({ theme, resolvedTheme });

        // Apply to DOM
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedTheme);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme, not resolvedTheme
      onRehydrateStorage: () => (state) => {
        // Re-resolve theme on hydration
        if (state) {
          state.resolvedTheme = resolveTheme(state.theme);
          document.documentElement.setAttribute('data-theme', state.resolvedTheme);
          document.documentElement.classList.add(state.resolvedTheme);
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, setTheme } = useThemeStore.getState();
    if (theme === 'system') {
      setTheme('system'); // Re-resolve
    }
  });
}
```

### 6.2 Saved Jobs Store

```typescript
// src/stores/savedJobsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '@/types';

interface SavedJobsState {
  savedIds: number[];
  savedJobs: Record<number, Job>; // Cache job data for offline

  // Actions
  saveJob: (job: Job) => void;
  unsaveJob: (id: number) => void;
  toggleSave: (job: Job) => void;
  isSaved: (id: number) => boolean;
  clearAll: () => void;
}

const MAX_SAVED_JOBS = 100;

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedJobs: {},

      saveJob: (job) => {
        const { savedIds, savedJobs } = get();

        // Prevent duplicates
        if (savedIds.includes(job.id)) return;

        // Enforce limit (remove oldest)
        let newIds = [...savedIds, job.id];
        let newJobs = { ...savedJobs, [job.id]: job };

        if (newIds.length > MAX_SAVED_JOBS) {
          const removedId = newIds.shift()!;
          delete newJobs[removedId];
        }

        set({
          savedIds: newIds,
          savedJobs: newJobs,
        });
      },

      unsaveJob: (id) => {
        const { savedIds, savedJobs } = get();

        set({
          savedIds: savedIds.filter((savedId) => savedId !== id),
          savedJobs: Object.fromEntries(
            Object.entries(savedJobs).filter(([key]) => Number(key) !== id)
          ),
        });
      },

      toggleSave: (job) => {
        const { savedIds, saveJob, unsaveJob } = get();
        if (savedIds.includes(job.id)) {
          unsaveJob(job.id);
        } else {
          saveJob(job);
        }
      },

      isSaved: (id) => {
        return get().savedIds.includes(id);
      },

      clearAll: () => {
        set({ savedIds: [], savedJobs: {} });
      },
    }),
    {
      name: 'saved-jobs-storage',
      version: 1,
    }
  )
);
```

### 6.3 Using Stores in Components

```typescript
// ThemeToggle.tsx
import { useThemeStore } from '@/stores/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <button onClick={cycleTheme} aria-label="Toggle theme">
      <Icon size={20} />
    </button>
  );
}

// SaveButton.tsx
import { useSavedJobsStore } from '@/stores/savedJobsStore';
import { Heart } from 'lucide-react';

export function SaveButton({ job }: { job: Job }) {
  const { isSaved, toggleSave } = useSavedJobsStore();
  const saved = isSaved(job.id);

  return (
    <button
      onClick={() => toggleSave(job)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save job'}
    >
      <Heart fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
```

---

## 7. Component State

### 7.1 Form Input State

```typescript
// SearchBar.tsx
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [inputValue, setInputValue] = useState('');

  // Debounce the search
  useDebounce(
    () => {
      onSearch(inputValue);
    },
    300,
    [inputValue]
  );

  return (
    <input
      type="search"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Search jobs..."
    />
  );
}
```

### 7.2 UI State (Modal, Dropdown)

```typescript
// ShareModal.tsx
import { useState } from 'react';

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Share</button>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <ShareButtons url={url} title={title} />
        </Modal>
      )}
    </>
  );
}
```

### 7.3 Derived State

```typescript
// FilterBar.tsx
function FilterBar() {
  const { filters, hasActiveFilters } = useFilters();

  // Derived state - no need to store
  const activeFilterCount = [
    filters.q,
    filters.category,
    filters.region,
    filters.has_salary,
  ].filter(Boolean).length;

  return (
    <div>
      {hasActiveFilters && (
        <Badge>{activeFilterCount} active</Badge>
      )}
    </div>
  );
}
```

---

## 8. State Flow Examples

### 8.1 Job Search Flow

```
User types in search bar
        │
        ▼
┌─────────────────────┐
│ Component State     │  inputValue = "developer"
│ (useState)          │
└─────────────────────┘
        │
        │ debounce 300ms
        ▼
┌─────────────────────┐
│ URL State           │  ?q=developer
│ (useFilters)        │
└─────────────────────┘
        │
        │ triggers refetch
        ▼
┌─────────────────────┐
│ Server State        │  queryKey: ['jobs', 'list', { q: 'developer' }]
│ (TanStack Query)    │
└─────────────────────┘
        │
        │ updates cache
        ▼
┌─────────────────────┐
│ UI Updates          │  JobList re-renders with new data
└─────────────────────┘
```

### 8.2 Save Job Flow

```
User clicks save button
        │
        ▼
┌─────────────────────┐
│ Client State        │  savedIds = [..., jobId]
│ (Zustand Store)     │  savedJobs = {..., [jobId]: job}
└─────────────────────┘
        │
        │ persist middleware
        ▼
┌─────────────────────┐
│ localStorage        │  saved-jobs-storage
└─────────────────────┘
        │
        │ triggers re-render
        ▼
┌─────────────────────┐
│ UI Updates          │  Heart icon fills
│                     │  SavedJobsPage shows job
└─────────────────────┘
```

### 8.3 Language Change Flow

```
User clicks language switch
        │
        ▼
┌─────────────────────┐
│ URL State           │  /ge/... → /en/...
│ (React Router)      │
└─────────────────────┘
        │
        │ triggers useLanguage effect
        ▼
┌─────────────────────┐
│ i18n State          │  i18n.language = 'en'
│ (i18next)           │
└─────────────────────┘
        │
        │ triggers re-render
        ▼
┌─────────────────────┐
│ UI Updates          │  All translated text updates
│                     │  Job titles use title_en
└─────────────────────┘
```

---

## 9. Best Practices

### 9.1 State Colocation

Keep state as close to where it's used as possible:

```typescript
// Good: Local state for dropdown
function CategoryFilter() {
  const [isOpen, setIsOpen] = useState(false); // Local UI state
  const { filters, setFilters } = useFilters(); // URL state for selection

  return (/* ... */);
}

// Bad: Global state for dropdown
// Don't put isOpen in Zustand store
```

### 9.2 Single Source of Truth

```typescript
// Good: Derive from URL
function ActiveFilters() {
  const { filters } = useFilters();

  return (
    <div>
      {filters.category && <Tag>{filters.category}</Tag>}
    </div>
  );
}

// Bad: Duplicate state
function ActiveFilters() {
  const [category, setCategory] = useState(''); // Don't duplicate URL state!
  // ...
}
```

### 9.3 Optimistic Updates

```typescript
// For future features with mutations
function useSaveJobOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.jobs.save,
    onMutate: async (jobId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(jobId) });

      // Optimistically update
      const previousJob = queryClient.getQueryData(queryKeys.jobs.detail(jobId));
      queryClient.setQueryData(queryKeys.jobs.detail(jobId), (old) => ({
        ...old,
        isSaved: true,
      }));

      return { previousJob };
    },
    onError: (err, jobId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.jobs.detail(jobId),
        context.previousJob
      );
    },
  });
}
```

---

## 10. Debugging

### 10.1 React Query Devtools

```typescript
// In development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 10.2 Zustand Devtools

```typescript
import { devtools } from 'zustand/middleware';

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({/* ... */}),
      { name: 'theme-storage' }
    ),
    { name: 'ThemeStore' }
  )
);
```

### 10.3 URL State Inspection

The URL is inherently visible and inspectable. Use browser devtools Network tab to see how filters affect API requests.

---

*State management documentation maintained by Engineering Team*
*Last updated: January 23, 2026*
