# HR.GE Parser Frontend - Coding Standards

## Version: 1.0.0
## Mandatory for: All AI Agents and Developers

---

## 1. File Naming Conventions

### 1.1 Components
```
PascalCase.tsx

Examples:
- Button.tsx
- StatCard.tsx
- JobsTable.tsx
- ParserStatusCard.tsx
```

### 1.2 Hooks
```
camelCase.ts (prefixed with 'use')

Examples:
- useJobs.ts
- useStats.ts
- useParser.ts
```

### 1.3 Types
```
camelCase.ts

Examples:
- job.ts
- company.ts
- parser.ts
```

### 1.4 Utilities
```
camelCase.ts

Examples:
- formatters.ts
- helpers.ts
- constants.ts
```

### 1.5 Pages
```
PascalCase.tsx

Examples:
- Dashboard.tsx
- Jobs.tsx
- JobDetail.tsx
```

---

## 2. Directory Structure Rules

```
src/
├── api/           # API client and endpoint functions ONLY
├── components/    # Reusable components ONLY
│   ├── ui/        # Generic UI components (Button, Card, etc.)
│   ├── layout/    # Layout components (Sidebar, Header)
│   ├── dashboard/ # Dashboard-specific components
│   ├── jobs/      # Jobs-specific components
│   ├── companies/ # Companies-specific components
│   ├── analytics/ # Analytics-specific components
│   ├── parser/    # Parser-specific components
│   └── settings/  # Settings-specific components
├── hooks/         # Custom React hooks ONLY
├── pages/         # Page components ONLY (routed)
├── types/         # TypeScript type definitions ONLY
├── utils/         # Utility functions ONLY
└── contexts/      # React contexts ONLY
```

### Rules:
1. **NO component logic in pages** - Pages import and compose components
2. **NO API calls in components** - Use hooks that use React Query
3. **NO inline styles** - Use Tailwind classes only
4. **NO hardcoded strings** - Use constants

---

## 3. Component Structure

### 3.1 Standard Component Template

```tsx
// components/ui/Button.tsx

import { type ReactNode } from 'react';

// ============================================================
// TYPES
// ============================================================

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const VARIANT_STYLES = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
} as const;

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

// ============================================================
// COMPONENT
// ============================================================

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = VARIANT_STYLES[variant];
  const sizeStyles = SIZE_STYLES[size];
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

### 3.2 Component Rules

1. **Named exports only** - No default exports
2. **Props interface above component** - Always typed
3. **Destructure props** - In function signature
4. **Default values in destructuring** - Not in interface
5. **No anonymous functions in JSX** - Extract to variables
6. **Maximum 150 lines per component** - Split if larger

---

## 4. Hook Structure

### 4.1 Standard Hook Template

```tsx
// hooks/useJobs.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/api/endpoints';
import type { Job, JobsResponse, JobFilters } from '@/types/job';

// ============================================================
// QUERY KEYS
// ============================================================

export const jobsKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobsKeys.lists(), filters] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: number) => [...jobsKeys.details(), id] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: jobsKeys.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: jobsKeys.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: !!id,
  });
}

export function useLatestJobs(limit: number = 10) {
  return useQuery({
    queryKey: [...jobsKeys.all, 'latest', limit],
    queryFn: () => jobsApi.getLatestJobs(limit),
  });
}
```

### 4.2 Hook Rules

1. **Query keys as constants** - Export for cache invalidation
2. **One file per domain** - useJobs, useCompanies, etc.
3. **No side effects** - Pure data fetching/mutations
4. **Always type return values** - Explicit generics

---

## 5. Type Definitions

### 5.1 Standard Type Template

```tsx
// types/job.ts

// ============================================================
// BASE TYPES
// ============================================================

export interface Job {
  id: number;
  external_id: number;
  title: string;
  title_en: string | null;
  description: string | null;
  company: Company | null;
  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string;
  is_work_from_home: boolean;
  is_suitable_for_student: boolean;
  is_expired: boolean;
  addresses: string[] | null;
  languages: string[] | null;
  publish_date: string | null;
  deadline_date: string | null;
  created_at: string | null;
}

// ============================================================
// API TYPES
// ============================================================

export interface JobFilters {
  page?: number;
  per_page?: number;
  search?: string;
  company_id?: number;
  is_expired?: boolean;
  is_work_from_home?: boolean;
  is_suitable_for_student?: boolean;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  sort_by?: 'publish_date' | 'deadline_date' | 'salary_from' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface JobsResponse {
  data: Job[];
  meta: PaginationMeta;
}

// ============================================================
// UI TYPES
// ============================================================

export interface JobTableColumn {
  key: keyof Job;
  label: string;
  sortable?: boolean;
  width?: string;
}
```

### 5.2 Type Rules

1. **Interface for objects** - Not type aliases
2. **Explicit null over undefined** - Match API
3. **Group by purpose** - Base, API, UI
4. **No `any` type** - Use `unknown` if needed

---

## 6. API Layer

### 6.1 Client Template

```tsx
// api/client.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8089';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### 6.2 Endpoints Template

```tsx
// api/endpoints.ts

import { apiClient } from './client';
import type { Job, JobsResponse, JobFilters } from '@/types/job';

// ============================================================
// JOBS API
// ============================================================

export const jobsApi = {
  getJobs: async (filters: JobFilters): Promise<JobsResponse> => {
    const { data } = await apiClient.get('/api/v1/jobs', { params: filters });
    return data;
  },

  getJob: async (id: number): Promise<Job> => {
    const { data } = await apiClient.get(`/api/v1/jobs/${id}`);
    return data;
  },

  getLatestJobs: async (limit: number): Promise<Job[]> => {
    const { data } = await apiClient.get('/api/v1/jobs/latest', { params: { limit } });
    return data;
  },

  searchJobs: async (query: string, page: number = 1): Promise<JobsResponse> => {
    const { data } = await apiClient.get('/api/v1/jobs/search', { params: { q: query, page } });
    return data;
  },
};
```

### 6.3 API Rules

1. **One file for client setup** - api/client.ts
2. **One file for all endpoints** - api/endpoints.ts
3. **Group by domain** - jobsApi, companiesApi, etc.
4. **Always type responses** - Explicit return types
5. **Use params object** - For query parameters

---

## 7. Styling Rules

### 7.1 Tailwind Class Order

```tsx
// Order: Layout → Sizing → Spacing → Typography → Colors → Effects → States

className="
  flex flex-col          // Layout
  w-full h-auto          // Sizing
  p-4 m-2               // Spacing
  text-lg font-medium   // Typography
  bg-white text-gray-900 // Colors
  rounded-lg shadow-md  // Effects
  hover:bg-gray-50      // States
"
```

### 7.2 Component Variants

```tsx
// Use object maps for variants
const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
} as const;

// Use cn() or clsx() for conditional classes
className={cn(
  'base-classes',
  BUTTON_VARIANTS[variant],
  disabled && 'opacity-50',
  className
)}
```

### 7.3 Styling Rules

1. **No inline styles** - Tailwind only
2. **No CSS files** - Except index.css
3. **Use design tokens** - From tailwind.config.js
4. **Mobile-first** - Base styles for mobile, md: for larger
5. **Maximum 10 classes inline** - Extract to constants if more

---

## 8. Import Order

```tsx
// 1. React imports
import { useState, useEffect, type ReactNode } from 'react';

// 2. Third-party imports
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

// 3. Internal absolute imports (@/)
import { Button, Card } from '@/components/ui';
import { useJobs } from '@/hooks/useJobs';
import type { Job } from '@/types/job';

// 4. Relative imports (same module)
import { JobRow } from './JobRow';
import { COLUMN_DEFINITIONS } from './constants';
```

---

## 9. Error Handling

### 9.1 Component Error Boundaries

```tsx
// Every page should be wrapped
<ErrorBoundary fallback={<ErrorFallback />}>
  <Dashboard />
</ErrorBoundary>
```

### 9.2 Query Error Handling

```tsx
const { data, error, isLoading } = useJobs(filters);

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

---

## 10. Performance Rules

1. **Lazy load pages** - `React.lazy()` for routes
2. **Memoize expensive components** - `React.memo()`
3. **Use stable callbacks** - `useCallback` for passed functions
4. **Virtualize long lists** - If > 100 items
5. **Debounce search inputs** - 300ms delay

---

## 11. Code Review Checklist

Before submitting any code, verify:

- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Component follows template structure
- [ ] Props are typed with interface
- [ ] No hardcoded strings (use constants)
- [ ] No inline styles (Tailwind only)
- [ ] Imports are ordered correctly
- [ ] File is in correct directory
- [ ] File name follows convention
- [ ] Maximum 150 lines per file
- [ ] No `any` types used
- [ ] Loading and error states handled

---

## 12. Git Commit Messages

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring
- style: Styling changes
- docs: Documentation
- test: Tests
- chore: Build/config changes

Examples:
- feat(dashboard): add stats cards component
- fix(jobs): correct pagination offset
- refactor(ui): extract button variants to constants
```

---

## 13. Forbidden Practices

1. **NO `any` type** - Use proper types or `unknown`
2. **NO `console.log`** - Use proper logging
3. **NO commented code** - Delete it
4. **NO magic numbers** - Use named constants
5. **NO nested ternaries** - Use if/else or early returns
6. **NO index as key** - Use unique identifiers
7. **NO direct DOM manipulation** - Use React refs
8. **NO default exports** - Named exports only
9. **NO circular imports** - Restructure if needed
10. **NO business logic in components** - Use hooks

---

## Enforcement

These standards are enforced via:
- ESLint configuration
- TypeScript strict mode
- Pre-commit hooks (if configured)
- Code review by lead agent

**Violations will result in task rejection.**
