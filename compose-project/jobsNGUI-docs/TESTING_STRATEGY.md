# Testing Strategy
# jobsNGUI - Quality Assurance & Testing Plan

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Overview

This document defines the testing strategy for jobsNGUI, including testing types, tools, coverage targets, and implementation guidelines.

---

## 2. Testing Pyramid

```
                    ┌───────────┐
                    │   E2E     │  ~10%
                    │  Tests    │  (Critical flows)
                    ├───────────┤
                    │Integration│  ~20%
                    │  Tests    │  (API + Components)
                    ├───────────┤
                    │   Unit    │  ~70%
                    │  Tests    │  (Functions + Components)
                    └───────────┘
```

| Type | Coverage | Focus |
|------|----------|-------|
| Unit | 70% | Individual functions, hooks, components |
| Integration | 20% | Component interactions, API calls |
| E2E | 10% | Critical user flows |

---

## 3. Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Test runner | 1.x |
| **Testing Library** | Component testing | 14.x |
| **MSW** | API mocking | 2.x |
| **jest-axe** | Accessibility testing | 8.x |
| **Playwright** | E2E testing | 1.x |

---

## 4. Configuration

### 4.1 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 4.2 Test Setup

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### 4.3 MSW Handlers

```typescript
// src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockJobs, mockCategories, mockRegions, mockJobDetail } from './data';

export const handlers = [
  // Jobs list
  http.get('/api/v1/jobs', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 30;

    let filteredJobs = [...mockJobs];

    // Apply filters
    if (q) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title_en.toLowerCase().includes(q.toLowerCase()) ||
          job.title_ge.includes(q)
      );
    }

    if (category) {
      filteredJobs = filteredJobs.filter((job) => job.category_slug === category);
    }

    // Paginate
    const start = (page - 1) * pageSize;
    const items = filteredJobs.slice(start, start + pageSize);

    return HttpResponse.json({
      items,
      total: filteredJobs.length,
      pages: Math.ceil(filteredJobs.length / pageSize),
      page,
      page_size: pageSize,
    });
  }),

  // Single job
  http.get('/api/v1/jobs/:id', ({ params }) => {
    const job = mockJobDetail[Number(params.id)];
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  // Categories
  http.get('/api/v1/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // Regions
  http.get('/api/v1/regions', () => {
    return HttpResponse.json(mockRegions);
  }),

  // Analytics (always succeeds)
  http.post('/api/v1/analytics/track', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
```

### 4.4 MSW Server

```typescript
// src/__tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 4.5 Mock Data

```typescript
// src/__tests__/mocks/data.ts
import type { Job, JobDetail, Category, Region } from '@/types';

export const mockJobs: Job[] = [
  {
    id: 1,
    title_ge: 'პროგრამისტი',
    title_en: 'Software Developer',
    company_name: 'TechCorp',
    location: 'Batumi',
    category_slug: 'it-programming',
    category_name_ge: 'IT / პროგრამირება',
    category_name_en: 'IT / Programming',
    region_slug: 'adjara',
    region_name_ge: 'აჭარა',
    region_name_en: 'Adjara',
    salary_min: 2000,
    salary_max: 3500,
    has_salary: true,
    is_vip: false,
    is_remote: false,
    published_at: '2026-01-20T10:00:00Z',
    deadline: '2026-02-15T23:59:59Z',
    source_name: 'jobs.ge',
    source_url: 'https://jobs.ge/job/1',
    created_at: '2026-01-20T10:05:00Z',
    updated_at: '2026-01-20T10:05:00Z',
  },
  {
    id: 2,
    title_ge: 'დიზაინერი',
    title_en: 'UI Designer',
    company_name: 'DesignHub',
    location: 'Tbilisi',
    category_slug: 'design',
    category_name_ge: 'დიზაინი',
    category_name_en: 'Design',
    region_slug: 'tbilisi',
    region_name_ge: 'თბილისი',
    region_name_en: 'Tbilisi',
    salary_min: null,
    salary_max: null,
    has_salary: false,
    is_vip: true,
    is_remote: true,
    published_at: '2026-01-19T09:00:00Z',
    deadline: null,
    source_name: 'jobs.ge',
    source_url: 'https://jobs.ge/job/2',
    created_at: '2026-01-19T09:05:00Z',
    updated_at: '2026-01-19T09:05:00Z',
  },
];

export const mockJobDetail: Record<number, JobDetail> = {
  1: {
    ...mockJobs[0],
    body_ge: '<p>აღწერა ქართულად</p>',
    body_en: '<p>Job description in English</p>',
    external_id: 'ext-1',
    views_count: 150,
  },
};

export const mockCategories: Category[] = [
  { id: 1, slug: 'it-programming', name_ge: 'IT / პროგრამირება', name_en: 'IT / Programming', jobsge_cid: 6, job_count: 128 },
  { id: 2, slug: 'design', name_ge: 'დიზაინი', name_en: 'Design', jobsge_cid: 7, job_count: 45 },
];

export const mockRegions: Region[] = [
  { id: 1, slug: 'tbilisi', name_ge: 'თბილისი', name_en: 'Tbilisi', jobsge_lid: 1, job_count: 856 },
  { id: 2, slug: 'adjara', name_ge: 'აჭარა', name_en: 'Adjara', jobsge_lid: 14, job_count: 234 },
];
```

---

## 5. Test Utilities

### 5.1 Render with Providers

```typescript
// src/__tests__/utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/ge'],
    queryClient = createTestQueryClient(),
    ...options
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
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

export * from '@testing-library/react';
export { renderWithProviders as render };
```

---

## 6. Unit Tests

### 6.1 Utility Function Tests

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, formatSalary, formatRelativeDate } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatSalary', () => {
  it('formats salary range', () => {
    expect(formatSalary(2000, 3500)).toBe('₾2,000 - ₾3,500');
  });

  it('formats single salary', () => {
    expect(formatSalary(2000, null)).toBe('₾2,000+');
    expect(formatSalary(null, 3500)).toBe('Up to ₾3,500');
  });

  it('returns null for no salary', () => {
    expect(formatSalary(null, null)).toBeNull();
  });
});

describe('formatRelativeDate', () => {
  it('formats recent dates', () => {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(formatRelativeDate(hourAgo.toISOString())).toBe('1 hour ago');
  });
});
```

### 6.2 Hook Tests

```typescript
// src/hooks/__tests__/useFilters.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useFilters } from '../useFilters';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/?q=developer&category=it']}>
    {children}
  </MemoryRouter>
);

describe('useFilters', () => {
  it('parses filters from URL', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    expect(result.current.filters.q).toBe('developer');
    expect(result.current.filters.category).toBe('it');
  });

  it('updates URL when filters change', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.setFilters({ region: 'adjara' });
    });

    expect(result.current.filters.region).toBe('adjara');
  });

  it('resets page when filters change', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/?page=5']}>
          {children}
        </MemoryRouter>
      ),
    });

    expect(result.current.filters.page).toBe(5);

    act(() => {
      result.current.setFilters({ q: 'test' });
    });

    expect(result.current.filters.page).toBe(1);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.q).toBeUndefined();
    expect(result.current.filters.category).toBeUndefined();
  });
});
```

### 6.3 Store Tests

```typescript
// src/stores/__tests__/savedJobsStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSavedJobsStore } from '../savedJobsStore';
import { mockJobs } from '@/__tests__/mocks/data';

describe('savedJobsStore', () => {
  beforeEach(() => {
    useSavedJobsStore.getState().clearAll();
  });

  it('saves a job', () => {
    const { saveJob, savedIds, isSaved } = useSavedJobsStore.getState();

    saveJob(mockJobs[0]);

    expect(useSavedJobsStore.getState().savedIds).toContain(mockJobs[0].id);
    expect(useSavedJobsStore.getState().isSaved(mockJobs[0].id)).toBe(true);
  });

  it('unsaves a job', () => {
    const { saveJob, unsaveJob } = useSavedJobsStore.getState();

    saveJob(mockJobs[0]);
    unsaveJob(mockJobs[0].id);

    expect(useSavedJobsStore.getState().savedIds).not.toContain(mockJobs[0].id);
  });

  it('toggles save state', () => {
    const { toggleSave, isSaved } = useSavedJobsStore.getState();

    toggleSave(mockJobs[0]);
    expect(useSavedJobsStore.getState().isSaved(mockJobs[0].id)).toBe(true);

    toggleSave(mockJobs[0]);
    expect(useSavedJobsStore.getState().isSaved(mockJobs[0].id)).toBe(false);
  });

  it('prevents duplicate saves', () => {
    const { saveJob } = useSavedJobsStore.getState();

    saveJob(mockJobs[0]);
    saveJob(mockJobs[0]);

    expect(useSavedJobsStore.getState().savedIds.length).toBe(1);
  });
});
```

---

## 7. Component Tests

### 7.1 Button Component

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick} disabled>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('supports keyboard activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Press Enter</Button>);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### 7.2 JobCard Component

```typescript
// src/components/job/__tests__/JobCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/render';
import userEvent from '@testing-library/user-event';
import { JobCard } from '../JobCard';
import { mockJobs } from '@/__tests__/mocks/data';

describe('JobCard', () => {
  const job = mockJobs[0];

  it('renders job title in current language', () => {
    render(<JobCard job={job} />, { initialEntries: ['/en'] });
    expect(screen.getByText(job.title_en)).toBeInTheDocument();
  });

  it('displays company name', () => {
    render(<JobCard job={job} />);
    expect(screen.getByText(job.company_name)).toBeInTheDocument();
  });

  it('shows salary badge when has_salary is true', () => {
    render(<JobCard job={job} />);
    expect(screen.getByText(/₾2,000/)).toBeInTheDocument();
  });

  it('shows VIP badge when is_vip is true', () => {
    const vipJob = { ...job, is_vip: true };
    render(<JobCard job={vipJob} />);
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('shows remote badge when is_remote is true', () => {
    const remoteJob = { ...job, is_remote: true };
    render(<JobCard job={remoteJob} />);
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<JobCard job={job} onSave={onSave} showSaveButton />);
    await user.click(screen.getByLabelText(/save/i));

    expect(onSave).toHaveBeenCalledWith(job.id);
  });

  it('shows filled heart when saved', () => {
    render(<JobCard job={job} isSaved showSaveButton />);
    expect(screen.getByLabelText(/unsave/i)).toBeInTheDocument();
  });

  it('links to job detail page', () => {
    render(<JobCard job={job} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining(`/job/${job.id}`));
  });
});
```

### 7.3 SearchBar Component

```typescript
// src/components/search/__tests__/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/render';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders input with placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} onSearch={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchBar value="" onChange={onChange} onSearch={vi.fn()} />);
    await user.type(screen.getByRole('searchbox'), 'developer');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSearch when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar value="test" onChange={vi.fn()} onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox'), '{Enter}');

    expect(onSearch).toHaveBeenCalled();
  });

  it('shows clear button when has value', () => {
    render(<SearchBar value="test" onChange={vi.fn()} onSearch={vi.fn()} clearable />);
    expect(screen.getByLabelText(/clear/i)).toBeInTheDocument();
  });

  it('clears input when clear button clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchBar value="test" onChange={onChange} onSearch={vi.fn()} clearable />);
    await user.click(screen.getByLabelText(/clear/i));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
```

---

## 8. Integration Tests

### 8.1 Job Listing Flow

```typescript
// src/pages/__tests__/HomePage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/render';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../HomePage';

describe('HomePage', () => {
  it('loads and displays jobs', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons initially', () => {
    render(<HomePage />);
    expect(screen.getAllByTestId('job-skeleton')).toHaveLength(6);
  });

  it('filters jobs by search query', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
    });

    await user.type(screen.getByRole('searchbox'), 'designer');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.queryByText('Software Developer')).not.toBeInTheDocument();
      expect(screen.getByText('UI Designer')).toBeInTheDocument();
    });
  });

  it('filters jobs by category', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/category/i));
    await user.click(screen.getByText('IT / Programming'));

    await waitFor(() => {
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.queryByText('UI Designer')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no results', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(screen.getByRole('searchbox'), 'nonexistentjob12345');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
    });
  });
});
```

### 8.2 Job Detail Flow

```typescript
// src/pages/__tests__/JobDetailPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/render';
import { JobDetailPage } from '../JobDetailPage';

describe('JobDetailPage', () => {
  it('loads and displays job details', async () => {
    render(<JobDetailPage />, { initialEntries: ['/en/job/1'] });

    await waitFor(() => {
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByText(/job description in english/i)).toBeInTheDocument();
    });
  });

  it('shows 404 for non-existent job', async () => {
    render(<JobDetailPage />, { initialEntries: ['/en/job/99999'] });

    await waitFor(() => {
      expect(screen.getByText(/job not found/i)).toBeInTheDocument();
    });
  });

  it('displays share buttons', async () => {
    render(<JobDetailPage />, { initialEntries: ['/en/job/1'] });

    await waitFor(() => {
      expect(screen.getByLabelText(/share on facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/share on telegram/i)).toBeInTheDocument();
    });
  });
});
```

---

## 9. Accessibility Tests

### 9.1 Component Accessibility

```typescript
// src/components/ui/__tests__/Button.a11y.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations with icon', async () => {
    const { container } = render(
      <Button leftIcon={<span>icon</span>}>With Icon</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 9.2 Page Accessibility

```typescript
// src/pages/__tests__/HomePage.a11y.test.tsx
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@/__tests__/utils/render';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HomePage } from '../HomePage';

expect.extend(toHaveNoViolations);

describe('HomePage accessibility', () => {
  it('has no accessibility violations when loaded', async () => {
    const { container } = render(<HomePage />);

    // Wait for content to load
    await waitFor(() => {
      expect(container.querySelector('[data-testid="job-list"]')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 10. E2E Tests (Playwright)

### 10.1 Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 10.2 Job Search E2E

```typescript
// e2e/job-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Search', () => {
  test('user can search for jobs', async ({ page }) => {
    await page.goto('/ge');

    // Wait for jobs to load
    await expect(page.getByRole('article')).toHaveCount.greaterThan(0);

    // Search for a job
    await page.getByRole('searchbox').fill('developer');
    await page.getByRole('button', { name: /search/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/q=developer/);

    // Verify results filtered
    await expect(page.getByText('developer', { exact: false })).toBeVisible();
  });

  test('user can filter by category', async ({ page }) => {
    await page.goto('/ge');

    // Open category dropdown
    await page.getByLabel(/category/i).click();
    await page.getByText('IT / Programming').click();

    // Verify URL updated
    await expect(page).toHaveURL(/category=it-programming/);
  });

  test('user can paginate results', async ({ page }) => {
    await page.goto('/ge');

    // Click next page
    await page.getByRole('button', { name: /next/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/page=2/);
  });
});
```

### 10.3 Job Detail E2E

```typescript
// e2e/job-detail.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Detail', () => {
  test('user can view job details', async ({ page }) => {
    await page.goto('/ge');

    // Click first job
    await page.getByRole('article').first().click();

    // Verify on detail page
    await expect(page).toHaveURL(/\/job\/\d+/);

    // Verify job content visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible();
  });

  test('user can share job', async ({ page }) => {
    await page.goto('/ge/job/1');

    // Click share button
    await page.getByRole('button', { name: /share/i }).click();

    // Verify share options visible
    await expect(page.getByLabel(/facebook/i)).toBeVisible();
    await expect(page.getByLabel(/telegram/i)).toBeVisible();
  });

  test('user can save job', async ({ page }) => {
    await page.goto('/ge/job/1');

    // Click save button
    await page.getByRole('button', { name: /save/i }).click();

    // Verify saved state
    await expect(page.getByRole('button', { name: /unsave/i })).toBeVisible();
  });
});
```

---

## 11. Coverage Requirements

| Area | Minimum Coverage |
|------|-----------------|
| Statements | 70% |
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |

### Critical Paths (Must be 100%)

- API client error handling
- Search query building
- Filter state management
- Saved jobs persistence

---

## 12. CI Integration

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

*Testing strategy maintained by QA & Engineering Teams*
*Last updated: January 23, 2026*
