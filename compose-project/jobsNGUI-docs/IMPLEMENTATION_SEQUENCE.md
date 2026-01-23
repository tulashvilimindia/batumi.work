# Implementation Sequence
# jobsNGUI - Step-by-Step Feature Implementation with API Mapping

**Version:** 1.0
**Date:** January 23, 2026
**Total Steps:** 65 implementation steps
**Total Features:** 65 features (52 existing + 13 new)

---

## Table of Contents

1. [API Strategy for Development](#1-api-strategy-for-development)
2. [Implementation Sequence Overview](#2-implementation-sequence-overview)
3. [Detailed Step-by-Step Plan](#3-detailed-step-by-step-plan)
4. [API Usage Matrix](#4-api-usage-matrix)
5. [Testing Strategy per Phase](#5-testing-strategy-per-phase)

---

## 1. API Strategy for Development

### 1.1 Available APIs

| Environment | Base URL | Purpose |
|-------------|----------|---------|
| **Production API** | `https://batumi.work/api/v1` | Real data, production use |
| **Local API** | `http://localhost:8000/api/v1` | FastAPI running locally |
| **Docker API** | `http://localhost:8102/api/v1` | API via Docker container |
| **Mock API (MSW)** | In-memory | Testing, offline development |

### 1.2 Recommended Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT PHASE API STRATEGY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 0-1: Project Setup & Foundation                                      │
│  └── API: None (UI scaffolding only)                                        │
│                                                                             │
│  Phase 2: Component Library                                                 │
│  └── API: Mock Data (hardcoded props)                                       │
│                                                                             │
│  Phase 3: Core Features                                                     │
│  └── API: Production API (https://batumi.work/api/v1)                       │
│      Reason: Real data structure, real categories, real jobs                │
│                                                                             │
│  Phase 4: Enhancements                                                      │
│  └── API: Production API + MSW for analytics                                │
│                                                                             │
│  Phase 5: Testing                                                           │
│  └── API: MSW Mock Server (deterministic tests)                             │
│                                                                             │
│  Phase 6: Deployment                                                        │
│  └── API: Production via nginx proxy                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 API Configuration

```typescript
// src/config/api.ts

const API_CONFIGS = {
  production: 'https://batumi.work/api/v1',
  staging: 'https://staging.batumi.work/api/v1',
  local: 'http://localhost:8000/api/v1',
  docker: 'http://localhost:8102/api/v1',
};

// Use environment variable with fallback
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || API_CONFIGS.production;
```

```bash
# .env.development
VITE_API_URL=https://batumi.work/api/v1

# .env.test
VITE_API_URL=http://localhost:8000/api/v1

# .env.production (Docker will proxy)
VITE_API_URL=/api/v1
```

---

## 2. Implementation Sequence Overview

### 2.1 Phase Summary with Feature Count

| Phase | Name | Features | API Endpoints Used |
|-------|------|----------|-------------------|
| 0 | Project Setup | 0 | None |
| 1 | Foundation | 6 | None |
| 2 | Component Library | 12 | None (mock data) |
| 3 | Core Features | 28 | `/jobs`, `/jobs/{id}`, `/categories`, `/regions` |
| 4 | Enhancements | 12 | `/analytics/track` |
| 5 | Testing | 4 | MSW mocks |
| 6 | Deployment | 3 | All (via proxy) |
| **Total** | | **65** | |

### 2.2 Visual Timeline

```
Week 1          Week 2          Week 3          Week 4          Week 5          Week 6
│               │               │               │               │               │
├── Phase 0 ────┤               │               │               │               │
│   Setup       │               │               │               │               │
│               ├── Phase 1 ────┤               │               │               │
│               │   Foundation  │               │               │               │
│               │               ├── Phase 2 ────┤               │               │
│               │               │   Components  │               │               │
│               │               │               ├── Phase 3 ────┼── Phase 3 ────┤
│               │               │               │   Core Part 1 │   Core Part 2 │
│               │               │               │               │               ├── Phase 4 ──
│               │               │               │               │               │   Enhance
│               │               │               │               │               │
▼               ▼               ▼               ▼               ▼               ▼
```

---

## 3. Detailed Step-by-Step Plan

### Phase 0: Project Setup (Steps 1-10)

**API Required:** None
**Duration:** Day 1-2

| Step | Task | Dependencies | Output |
|------|------|--------------|--------|
| 1 | Create Vite + React + TypeScript project | - | `/jobsNGUI/` |
| 2 | Configure TypeScript strict mode | Step 1 | `tsconfig.json` |
| 3 | Set up path aliases (@/) | Step 2 | `vite.config.ts` |
| 4 | Install Tailwind CSS | Step 1 | `tailwind.config.js` |
| 5 | Configure PostCSS | Step 4 | `postcss.config.js` |
| 6 | Install ESLint + Prettier | Step 1 | `.eslintrc.cjs`, `.prettierrc` |
| 7 | Configure Husky pre-commit hooks | Step 6 | `.husky/` |
| 8 | Create folder structure | Step 1 | `src/` directories |
| 9 | Set up environment variables | Step 1 | `.env.example` |
| 10 | Initialize Git repository | Step 1 | `.gitignore` |

**Verification:**
```bash
npm run dev     # Should start on localhost:5173
npm run build   # Should produce dist/
npm run lint    # Should pass with no errors
```

---

### Phase 1: Foundation (Steps 11-20)

**API Required:** None
**Duration:** Day 3-4

| Step | Task | API | Dependencies | Output |
|------|------|-----|--------------|--------|
| 11 | Install React Router DOM v6 | - | Phase 0 | `package.json` |
| 12 | Create route configuration | - | Step 11 | `src/routes.tsx` |
| 13 | Create Layout component | - | Step 12 | `Layout.tsx` |
| 14 | Create Header component (basic) | - | Step 13 | `Header.tsx` |
| 15 | Create Footer component | - | Step 13 | `Footer.tsx` |
| 16 | Define CSS custom properties | - | Phase 0 | `themes.css` |
| 17 | Install Zustand | - | Phase 0 | `package.json` |
| 18 | Create theme store | - | Step 16, 17 | `themeStore.ts` |
| 19 | Implement ThemeToggle | - | Step 18 | `ThemeToggle.tsx` |
| 20 | Add system theme detection | - | Step 18 | `themeStore.ts` |

**Feature Checklist (6 features):**
- [x] F01: React Router setup
- [x] F02: Layout structure
- [x] F03: Header component
- [x] F04: Footer component
- [x] F05: Theme store (light/dark)
- [x] F06: System theme detection

**Verification:**
```bash
# Navigate to / - should show layout
# Click theme toggle - should switch themes
# Check localStorage - should persist theme
# Check system preference detection
```

---

### Phase 2: Component Library (Steps 21-35)

**API Required:** None (use mock data in Storybook/tests)
**Duration:** Day 5-7

| Step | Task | API | Dependencies | Output |
|------|------|-----|--------------|--------|
| 21 | Create cn() utility function | - | Phase 0 | `utils.ts` |
| 22 | Implement Button component | - | Step 21 | `Button.tsx` |
| 23 | Implement Input component | - | Step 21 | `Input.tsx` |
| 24 | Implement Select component | - | Step 21 | `Select.tsx` |
| 25 | Implement Badge component | - | Step 21 | `Badge.tsx` |
| 26 | Implement Skeleton component | - | Step 21 | `Skeleton.tsx` |
| 27 | Implement Spinner component | - | Step 21 | `Spinner.tsx` |
| 28 | Create Toast system | - | Step 21 | `Toast.tsx`, `useToast.ts` |
| 29 | Create EmptyState component | - | Step 21 | `EmptyState.tsx` |
| 30 | Create ErrorState component | - | Step 21 | `ErrorState.tsx` |
| 31 | Create LoadingState component | - | Step 26, 27 | `LoadingState.tsx` |
| 32 | Create Pagination component | - | Step 22 | `Pagination.tsx` |
| 33 | Create SearchInput component | - | Step 23 | `SearchInput.tsx` |
| 34 | Create LanguageSwitch component | - | Step 22 | `LanguageSwitch.tsx` |
| 35 | Export all from index.ts | - | Steps 22-34 | `ui/index.ts` |

**Feature Checklist (12 features):**
- [x] F07: Button (primary, secondary, ghost, outline)
- [x] F08: Input with focus/error states
- [x] F09: Select dropdown
- [x] F10: Badge (NEW, VIP, Salary)
- [x] F11: Skeleton loading
- [x] F12: Spinner
- [x] F13: Toast notifications
- [x] F14: EmptyState
- [x] F15: ErrorState
- [x] F16: LoadingState
- [x] F17: Pagination
- [x] F18: SearchInput

**Verification:**
```bash
# Each component renders without errors
# Dark/light theme variants work
# Keyboard navigation works
# Screen reader tested
```

---

### Phase 3: Core Features - Part 1 (Steps 36-50)

**API Required:** YES - Production API
**Duration:** Day 8-12

| Step | Task | API Endpoint | Dependencies | Output |
|------|------|--------------|--------------|--------|
| 36 | Install TanStack Query | - | Phase 1 | `package.json` |
| 37 | Create QueryClient provider | - | Step 36 | `queryClient.ts` |
| 38 | Create API client wrapper | - | Step 37 | `api/client.ts` |
| 39 | Create TypeScript types | - | Step 38 | `types/api.ts` |
| 40 | Implement fetchJobs() | `GET /jobs` | Step 38, 39 | `api/jobs.ts` |
| 41 | Implement fetchJob(id) | `GET /jobs/{id}` | Step 38, 39 | `api/jobs.ts` |
| 42 | Implement fetchCategories() | `GET /categories` | Step 38, 39 | `api/categories.ts` |
| 43 | Implement fetchRegions() | `GET /regions` | Step 38, 39 | `api/regions.ts` |
| 44 | Create useJobs() hook | `GET /jobs` | Step 40 | `hooks/useJobs.ts` |
| 45 | Create useJob(id) hook | `GET /jobs/{id}` | Step 41 | `hooks/useJob.ts` |
| 46 | Create useCategories() hook | `GET /categories` | Step 42 | `hooks/useCategories.ts` |
| 47 | Create useRegions() hook | `GET /regions` | Step 43 | `hooks/useRegions.ts` |
| 48 | Create useFilters() hook (URL state) | - | Phase 1 | `hooks/useFilters.ts` |
| 49 | Create useDebounce() hook | - | Phase 0 | `hooks/useDebounce.ts` |
| 50 | Create date formatting utils | - | Phase 0 | `lib/date.ts` |

**API Endpoints Used:**

```typescript
// Step 40: List jobs with all filters
GET /api/v1/jobs?page=1&page_size=30&lid=14&status=active

// Step 41: Get single job
GET /api/v1/jobs/12345

// Step 42: Get categories
GET /api/v1/categories?include_count=true

// Step 43: Get regions
GET /api/v1/regions?include_count=true
```

**Verification:**
```bash
# Open browser dev tools Network tab
# Verify API calls to batumi.work
# Check response data matches types
# Console should have no errors
```

---

### Phase 3: Core Features - Part 2 (Steps 51-63)

**API Required:** YES - Production API
**Duration:** Day 13-17

| Step | Task | API Endpoint | Dependencies | Output |
|------|------|--------------|--------------|--------|
| 51 | Create JobRow component (table) | - | Step 44 | `JobRow.tsx` |
| 52 | Create JobTable component | - | Step 51 | `JobTable.tsx` |
| 53 | Create JobBadges (NEW, VIP, ₾) | - | Step 25 | `JobBadges.tsx` |
| 54 | Create JobDetail component | `GET /jobs/{id}` | Step 45 | `JobDetail.tsx` |
| 55 | Create JobMetadata component | - | Step 54 | `JobMetadata.tsx` |
| 56 | Create SearchBar component | - | Step 48, 33 | `SearchBar.tsx` |
| 57 | Create CategoryFilter dropdown | `GET /categories` | Step 46, 24 | `CategoryFilter.tsx` |
| 58 | Create RegionFilter dropdown | `GET /regions` | Step 47, 24 | `RegionFilter.tsx` |
| 59 | Create SalaryToggle checkbox | - | Step 48 | `SalaryToggle.tsx` |
| 60 | Create FilterBar (combines all) | - | Steps 56-59 | `FilterBar.tsx` |
| 61 | Build HomePage | `GET /jobs` | Steps 52, 60, 32 | `HomePage.tsx` |
| 62 | Build JobDetailPage | `GET /jobs/{id}` | Step 54 | `JobDetailPage.tsx` |
| 63 | Implement Saved Jobs store | - | Step 17 | `savedJobsStore.ts` |

**Feature Checklist (28 features total for Phase 3):**
- [x] F19: API client with error handling
- [x] F20: Jobs list query with caching
- [x] F21: Job detail query
- [x] F22: Categories query
- [x] F23: Regions query
- [x] F24: URL-based filter state
- [x] F25: JobRow table component
- [x] F26: JobTable with header
- [x] F27: NEW badge (< 48 hours)
- [x] F28: VIP highlighting (orange text)
- [x] F29: Salary indicator (₾ badge)
- [x] F30: Job detail view
- [x] F31: HTML body rendering (sanitized)
- [x] F32: Search bar with debounce
- [x] F33: Category filter dropdown
- [x] F34: Region filter dropdown
- [x] F35: Salary filter toggle
- [x] F36: Combined filter bar
- [x] F37: HomePage with table layout
- [x] F38: JobDetailPage
- [x] F39: Pagination (URL state)
- [x] F40: Loading skeletons
- [x] F41: Empty state (no jobs)
- [x] F42: Error state (API fail)
- [x] F43: Saved jobs (localStorage)
- [x] F44: Save/unsave button
- [x] F45: SavedJobsPage
- [x] F46: Job count display

**API Request Examples:**

```typescript
// HomePage initial load
GET /api/v1/jobs?page=1&page_size=30&lid=14&status=active

// Search with query
GET /api/v1/jobs?q=developer&page=1&page_size=30&lid=14

// Filter by category
GET /api/v1/jobs?category=it-programming&page=1&page_size=30&lid=14

// Filter by salary
GET /api/v1/jobs?has_salary=true&page=1&page_size=30&lid=14

// Combined filters
GET /api/v1/jobs?q=developer&category=it-programming&has_salary=true&page=1&lid=14

// Job detail
GET /api/v1/jobs/12345
```

---

### Phase 4: Enhancements (Steps 64-75)

**API Required:** YES - Analytics endpoint
**Duration:** Day 18-22

| Step | Task | API Endpoint | Dependencies | Output |
|------|------|--------------|--------------|--------|
| 64 | Install i18next | - | Phase 0 | `package.json` |
| 65 | Configure i18n | - | Step 64 | `i18n/config.ts` |
| 66 | Create Georgian translations | - | Step 65 | `locales/ge.json` |
| 67 | Create English translations | - | Step 65 | `locales/en.json` |
| 68 | Implement language routing | - | Step 65 | `routes.tsx` |
| 69 | Create ShareButtons component | - | Phase 2 | `ShareButtons.tsx` |
| 70 | Create CopyLinkButton | - | Step 28 | `CopyLinkButton.tsx` |
| 71 | Implement analytics client | `POST /analytics/track` | Phase 3 | `analytics.ts` |
| 72 | Track page views | `POST /analytics/track` | Step 71 | `usePageView.ts` |
| 73 | Track job views | `POST /analytics/track` | Step 71 | `JobDetailPage.tsx` |
| 74 | Create PWA manifest | - | Phase 0 | `manifest.json` |
| 75 | Implement service worker | - | Step 74 | `sw.js` |

**Feature Checklist (12 features):**
- [x] F47: i18n setup (Georgian/English)
- [x] F48: Language switch component
- [x] F49: URL language prefix (/:lang/)
- [x] F50: Share to Facebook
- [x] F51: Share to Telegram
- [x] F52: Share to WhatsApp
- [x] F53: Share to LinkedIn
- [x] F54: Copy link with toast
- [x] F55: Analytics - page views
- [x] F56: Analytics - job views
- [x] F57: PWA installable
- [x] F58: Offline fallback

**Analytics API Usage:**

```typescript
// Track page view
POST /api/v1/analytics/track
{
  "event": "page_view",
  "session_id": "uuid-here",
  "timestamp": "2026-01-23T15:30:00Z",
  "language": "ge",
  "url": "/ge/",
  "data": { "title": "ვაკანსიები | Batumi Jobs" }
}

// Track job view
POST /api/v1/analytics/track
{
  "event": "job_view",
  "session_id": "uuid-here",
  "timestamp": "2026-01-23T15:31:00Z",
  "language": "ge",
  "url": "/ge/job/12345",
  "data": { "job_id": 12345, "category": "it-programming" }
}

// Track search
POST /api/v1/analytics/track
{
  "event": "search",
  "session_id": "uuid-here",
  "timestamp": "2026-01-23T15:32:00Z",
  "data": { "query": "developer", "results_count": 45 }
}

// Track share
POST /api/v1/analytics/track
{
  "event": "share",
  "session_id": "uuid-here",
  "timestamp": "2026-01-23T15:33:00Z",
  "data": { "job_id": 12345, "platform": "telegram", "success": true }
}
```

---

### Phase 5: Testing (Steps 76-82)

**API Required:** MSW Mock Server (not real API)
**Duration:** Day 23-25

| Step | Task | API | Dependencies | Output |
|------|------|-----|--------------|--------|
| 76 | Install Vitest + Testing Library | - | Phase 0 | `vitest.config.ts` |
| 77 | Install MSW | - | Step 76 | `mocks/handlers.ts` |
| 78 | Create mock API handlers | Mock | Step 77 | `mocks/handlers.ts` |
| 79 | Write component tests | Mock | Step 78 | `*.test.tsx` |
| 80 | Write hook tests | Mock | Step 78 | `*.test.ts` |
| 81 | Install Playwright | - | Phase 4 | `playwright.config.ts` |
| 82 | Write E2E tests | Mock/Real | Step 81 | `e2e/*.spec.ts` |

**MSW Mock Handlers:**

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock GET /jobs
  http.get('*/api/v1/jobs', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';

    return HttpResponse.json({
      items: mockJobs.slice(0, 30),
      total: 100,
      page: parseInt(page),
      page_size: 30,
      pages: 4,
    });
  }),

  // Mock GET /jobs/:id
  http.get('*/api/v1/jobs/:id', ({ params }) => {
    const job = mockJobs.find(j => j.id === Number(params.id));
    if (!job) {
      return HttpResponse.json(
        { code: 'JOB_NOT_FOUND', message: 'Not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json(job);
  }),

  // Mock GET /categories
  http.get('*/api/v1/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // Mock GET /regions
  http.get('*/api/v1/regions', () => {
    return HttpResponse.json(mockRegions);
  }),

  // Mock POST /analytics/track
  http.post('*/api/v1/analytics/track', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
```

**Feature Checklist (4 features):**
- [x] F59: Unit tests (70%+ coverage)
- [x] F60: Accessibility tests
- [x] F61: E2E tests (critical flows)
- [x] F62: CI test pipeline

---

### Phase 6: Deployment (Steps 83-90)

**API Required:** All endpoints via nginx proxy
**Duration:** Day 26-30

| Step | Task | API | Dependencies | Output |
|------|------|-----|--------------|--------|
| 83 | Create Dockerfile | - | Phase 4 | `Dockerfile` |
| 84 | Create nginx.conf | Proxy | Step 83 | `nginx.conf` |
| 85 | Update docker-compose.yml | - | Step 83 | `docker-compose.yml` |
| 86 | Configure API proxy | All | Step 84 | `nginx.conf` |
| 87 | Set up health check | - | Step 83 | `Dockerfile` |
| 88 | Create CI workflow | - | Phase 5 | `.github/workflows/ci.yml` |
| 89 | Create deploy workflow | - | Step 88 | `.github/workflows/deploy.yml` |
| 90 | Run Lighthouse audit | - | Step 85 | Performance report |

**Nginx API Proxy Configuration:**

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # API Proxy - forward to backend
    location /api/ {
        proxy_pass http://jobboard-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Feature Checklist (3 features):**
- [x] F63: Docker container
- [x] F64: CI/CD pipeline
- [x] F65: Production deployment

---

## 4. API Usage Matrix

### 4.1 Endpoints by Feature

| Feature | Endpoint | Method | Phase |
|---------|----------|--------|-------|
| Job listing | `/jobs` | GET | 3 |
| Job search | `/jobs?q=...` | GET | 3 |
| Category filter | `/jobs?category=...` | GET | 3 |
| Region filter | `/jobs?lid=...` | GET | 3 |
| Salary filter | `/jobs?has_salary=true` | GET | 3 |
| Pagination | `/jobs?page=...` | GET | 3 |
| Job detail | `/jobs/{id}` | GET | 3 |
| Category list | `/categories` | GET | 3 |
| Region list | `/regions` | GET | 3 |
| Track page view | `/analytics/track` | POST | 4 |
| Track job view | `/analytics/track` | POST | 4 |
| Track search | `/analytics/track` | POST | 4 |
| Track share | `/analytics/track` | POST | 4 |

### 4.2 API Call Frequency

| Endpoint | Frequency | Cache TTL |
|----------|-----------|-----------|
| `GET /categories` | Once per session | 1 hour |
| `GET /regions` | Once per session | 1 hour |
| `GET /jobs` | Every filter change | 5 min |
| `GET /jobs/{id}` | Every job view | 5 min |
| `POST /analytics/track` | Every event | No cache |

### 4.3 Request Examples by Page

**HomePage Load:**
```
1. GET /api/v1/categories?include_count=true
2. GET /api/v1/regions?include_count=true
3. GET /api/v1/jobs?page=1&page_size=30&lid=14&status=active
4. POST /api/v1/analytics/track (page_view)
```

**Search Action:**
```
1. GET /api/v1/jobs?q=developer&page=1&page_size=30&lid=14
2. POST /api/v1/analytics/track (search)
```

**Job Detail Load:**
```
1. GET /api/v1/jobs/12345
2. POST /api/v1/analytics/track (job_view)
```

**Share Action:**
```
1. POST /api/v1/analytics/track (share)
```

---

## 5. Testing Strategy per Phase

### 5.1 Phase 0-2: No API Testing

```typescript
// Component tests use hardcoded props
describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### 5.2 Phase 3-4: Mock API with MSW

```typescript
// Setup MSW before tests
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test with mock API
describe('useJobs', () => {
  it('fetches jobs', async () => {
    const { result } = renderHook(() => useJobs({}));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.items).toHaveLength(30);
  });
});
```

### 5.3 E2E Tests: Can Use Real or Mock

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
});

// e2e/job-listing.spec.ts
test('shows job list', async ({ page }) => {
  await page.goto('/ge/');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('tr')).toHaveCount(31); // header + 30 jobs
});
```

---

## 6. Summary

### Implementation Order

```
1. Project Setup (Steps 1-10)     → No API
2. Foundation (Steps 11-20)       → No API
3. Components (Steps 21-35)       → No API (mock props)
4. API Client (Steps 36-50)       → Production API
5. Features (Steps 51-63)         → Production API
6. i18n + PWA (Steps 64-75)       → Analytics API
7. Testing (Steps 76-82)          → MSW Mock API
8. Deployment (Steps 83-90)       → Proxied API
```

### API Strategy Summary

| Phase | API Source | Reason |
|-------|------------|--------|
| Development | `https://batumi.work/api/v1` | Real data structure |
| Unit Tests | MSW Mock Server | Deterministic |
| E2E Tests | Mock or Real | Configurable |
| Production | `/api/v1` (nginx proxy) | Same domain |

### Key Milestones

| Milestone | Steps | Deliverable |
|-----------|-------|-------------|
| M1: Scaffold | 1-20 | Themed app shell |
| M2: Components | 21-35 | Full UI library |
| M3: MVP | 36-63 | Working job board |
| M4: Complete | 64-75 | i18n, PWA, analytics |
| M5: Production | 76-90 | Tested & deployed |

---

*Implementation Sequence maintained by Architecture Team*
*Last updated: January 23, 2026*
