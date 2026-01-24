# HR.GE Parser - Admin Dashboard Frontend Plan

**Version:** 1.0.0
**Date:** January 2026
**Type:** Technical Specification for Frontend Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [User Roles & Access](#3-user-roles--access)
4. [Page Structure](#4-page-structure)
5. [Detailed Page Specifications](#5-detailed-page-specifications)
6. [UI Components](#6-ui-components)
7. [API Integration](#7-api-integration)
8. [Design System](#8-design-system)
9. [Implementation Phases](#9-implementation-phases)
10. [File Structure](#10-file-structure)

---

## 1. Overview

### Purpose

Build an **Admin Dashboard** for the HR.GE Parser system that allows:
- Monitoring parser status and health
- Viewing job/company statistics
- Browsing and searching collected data
- Triggering manual parser runs
- Viewing execution history and logs

### Target Users

| User | Needs |
|------|-------|
| **Administrator** | Full system control, parser management |
| **Analyst** | Data access, reports, statistics |
| **Developer** | Logs, debugging, API status |

### Key Features

1. **Dashboard** - Real-time system overview
2. **Jobs Browser** - Search and view collected jobs
3. **Companies Browser** - View company profiles
4. **Analytics** - Charts and statistics
5. **Parser Control** - Start/stop, history, configuration
6. **System Health** - Logs, errors, performance

---

## 2. Technology Stack

### Recommended Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | React 18+ | Industry standard, great ecosystem |
| **Language** | TypeScript | Type safety, better DX |
| **UI Library** | shadcn/ui + Tailwind CSS | Modern, customizable, fast |
| **State Management** | TanStack Query (React Query) | API caching, sync |
| **Charts** | Recharts or Chart.js | Job/salary visualizations |
| **Routing** | React Router v6 | Standard routing |
| **HTTP Client** | Axios or Fetch | API communication |
| **Build Tool** | Vite | Fast development |
| **Icons** | Lucide React | Consistent iconography |

### Alternative Stack (Simpler)

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **UI** | Tailwind CSS + Headless UI |
| **State** | SWR |

---

## 3. User Roles & Access

### Role Permissions Matrix

| Feature | Admin | Analyst | Viewer |
|---------|-------|---------|--------|
| View Dashboard | Yes | Yes | Yes |
| Browse Jobs | Yes | Yes | Yes |
| Browse Companies | Yes | Yes | Yes |
| View Analytics | Yes | Yes | Yes |
| Trigger Parser | Yes | No | No |
| View Parser History | Yes | Yes | No |
| View Logs | Yes | No | No |
| Configure Settings | Yes | No | No |

### Authentication (Future)

For MVP, no authentication required (internal tool).
Future: Add JWT-based authentication with role management.

---

## 4. Page Structure

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HR.GE Parser Admin                              [User] [Logout]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌─────────────────────────────────────────┐  │
│  │              │  │                                         │  │
│  │  SIDEBAR     │  │           MAIN CONTENT AREA             │  │
│  │              │  │                                         │  │
│  │  Dashboard   │  │                                         │  │
│  │  Jobs        │  │                                         │  │
│  │  Companies   │  │                                         │  │
│  │  Analytics   │  │                                         │  │
│  │  ─────────   │  │                                         │  │
│  │  Parser      │  │                                         │  │
│  │  Settings    │  │                                         │  │
│  │              │  │                                         │  │
│  └──────────────┘  └─────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Route Map

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | System overview |
| `/jobs` | Jobs List | Paginated job browser |
| `/jobs/:id` | Job Detail | Single job view |
| `/companies` | Companies List | Company browser |
| `/companies/:id` | Company Detail | Company profile |
| `/analytics` | Analytics | Charts and reports |
| `/parser` | Parser Control | Status and controls |
| `/parser/history` | Parser History | Run history |
| `/settings` | Settings | Configuration |

---

## 5. Detailed Page Specifications

### 5.1 Dashboard Page (`/`)

**Purpose:** Real-time system health and key metrics at a glance.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                    Last updated: 5m ago│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  15,420  │  │   8,750  │  │   2,340  │  │   1,250  │        │
│  │  Total   │  │  Active  │  │Companies │  │  Remote  │        │
│  │  Jobs    │  │  Jobs    │  │          │  │  Jobs    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │     PARSER STATUS           │  │    QUICK ACTIONS        │  │
│  │  ● Running / ● Idle         │  │  [▶ Run Parser]         │  │
│  │  Next run: 4h 23m           │  │  [↻ Incremental]        │  │
│  │  Last run: 2h ago ✓         │  │  [📊 View Stats]        │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │     JOBS BY LOCATION        │  │    RECENT ACTIVITY      │  │
│  │  [=========] Tbilisi 65%    │  │  • 125 new jobs         │  │
│  │  [====] Batumi 18%          │  │  • 15,200 updated       │  │
│  │  [==] Kutaisi 8%            │  │  • 95 failed            │  │
│  │  [...] Others 9%            │  │  • 2h 15m ago           │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 JOBS OVER TIME (7 days)                 │    │
│  │    ▲                                                    │    │
│  │    │    ╭─╮                       ╭─╮                   │    │
│  │    │ ╭──╯ ╰──╮               ╭────╯ ╰───╮              │    │
│  │    │─╯       ╰───────────────╯          ╰──            │    │
│  │    └────────────────────────────────────────▶          │    │
│  │      Mon  Tue  Wed  Thu  Fri  Sat  Sun                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- `StatCard` - Metric display card
- `ParserStatusCard` - Live status indicator
- `QuickActionsCard` - Action buttons
- `LocationChart` - Horizontal bar chart
- `ActivityFeed` - Recent events list
- `TimeSeriesChart` - Line chart for trends

**API Calls:**
```typescript
GET /api/v1/stats           // Main statistics
GET /api/v1/parser/status   // Parser status
GET /api/v1/stats/by-location?limit=5  // Top locations
```

---

### 5.2 Jobs List Page (`/jobs`)

**Purpose:** Browse, search, and filter all collected jobs.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Jobs                                              [+ Export CSV]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🔍 Search jobs...                          [Search]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Filters: [Location ▼] [Remote ▼] [Salary ▼] [Status ▼] [Clear] │
│                                                                  │
│  Showing 1-20 of 15,420 jobs                    Sort: [Date ▼]  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☐ │ Senior Developer           │ TBC Bank    │ Tbilisi │    │
│  │   │ 3,500 - 5,000 GEL         │ 🏠 Remote   │ 2h ago  │    │
│  ├───┼─────────────────────────────────────────────────────┤    │
│  │ ☐ │ Marketing Manager          │ Wissol      │ Tbilisi │    │
│  │   │ Salary not specified       │             │ 5h ago  │    │
│  ├───┼─────────────────────────────────────────────────────┤    │
│  │ ☐ │ Junior Accountant          │ PSP Group   │ Batumi  │    │
│  │   │ 1,200 - 1,800 GEL         │ 🎓 Student  │ 1d ago  │    │
│  └───┴─────────────────────────────────────────────────────┘    │
│                                                                  │
│  [← Prev]  1  2  3  4  5  ...  771  [Next →]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Full-text search
- Multi-filter support
- Sortable columns
- Pagination
- Bulk selection
- Export to CSV

**Filters:**
| Filter | Options |
|--------|---------|
| Location | Dropdown with top cities |
| Remote | Yes / No / All |
| Salary Range | Min-Max slider |
| Status | Active / Expired / All |
| Company | Autocomplete search |
| Posted | Today / Week / Month / All |

**API Calls:**
```typescript
GET /api/v1/jobs?page=1&per_page=20&search=developer&is_work_from_home=true
```

---

### 5.3 Job Detail Page (`/jobs/:id`)

**Purpose:** View complete job information.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Jobs                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────┐   Senior Full-Stack Developer                       │
│  │  LOGO  │   TBC Bank                                          │
│  └────────┘   Posted: Jan 15, 2026  •  Deadline: Feb 15, 2026   │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ 📍 Tbilisi │  │ 💰 3.5-5K  │  │ 🏠 Remote  │  │ ● Active  │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  Description                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  We are looking for an experienced Full-Stack Developer to      │
│  join our digital banking team. You will work on cutting-edge   │
│  fintech solutions...                                            │
│                                                                  │
│  Requirements                                     Languages      │
│  • 5+ years experience                           • English      │
│  • React, Node.js                                • Georgian     │
│  • PostgreSQL                                                    │
│                                                                  │
│  Benefits                                                        │
│  🏥 Health Insurance  🎯 Bonuses  📚 Training                   │
│                                                                  │
│  Contact                                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Email: hr@tbcbank.ge                                            │
│  Phone: +995 32 227 27 27                                        │
│                                                                  │
│  [🔗 View on HR.GE]  [📋 Copy Link]  [📄 View Raw JSON]         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
GET /api/v1/jobs/{id}
```

---

### 5.4 Companies List Page (`/companies`)

**Purpose:** Browse all companies that have posted jobs.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Companies                                          Total: 2,340│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔍 Search companies...                                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ LOGO │ TBC Bank              │ 156 jobs │ Banking      │    │
│  ├──────┼───────────────────────┼──────────┼──────────────┤    │
│  │ LOGO │ Wissol Group          │ 89 jobs  │ Retail       │    │
│  ├──────┼───────────────────────┼──────────┼──────────────┤    │
│  │ LOGO │ Bank of Georgia       │ 78 jobs  │ Banking      │    │
│  ├──────┼───────────────────────┼──────────┼──────────────┤    │
│  │ LOGO │ Georgian Railway      │ 65 jobs  │ Transport    │    │
│  └──────┴───────────────────────┴──────────┴──────────────┘    │
│                                                                  │
│  [← Prev]  1  2  3  ...  117  [Next →]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
GET /api/v1/companies?page=1&per_page=20&search=bank
```

---

### 5.5 Company Detail Page (`/companies/:id`)

**Purpose:** View company profile and their job listings.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Companies                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                    │
│  │          │   TBC Bank                                         │
│  │   LOGO   │   Banking & Finance                                │
│  │          │   156 Active Jobs                                  │
│  └──────────┘                                                    │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  Active Jobs by This Company                                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Senior Developer        │ 3.5-5K GEL │ Tbilisi │ 2h ago│    │
│  │ Product Manager         │ 4-6K GEL   │ Tbilisi │ 1d ago│    │
│  │ Data Analyst            │ 2.5-3.5K   │ Remote  │ 2d ago│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Load More Jobs...]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
GET /api/v1/companies/{id}
GET /api/v1/companies/{id}/jobs
```

---

### 5.6 Analytics Page (`/analytics`)

**Purpose:** Visual analytics and reports.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Analytics                           Date Range: [Last 30 Days ▼]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SALARY DISTRIBUTION                         │    │
│  │                                                          │    │
│  │    ▓▓▓▓▓                                                │    │
│  │    ▓▓▓▓▓▓▓▓▓                                            │    │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓                                        │    │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                     │    │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                  │    │
│  │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                    │    │
│  │   <1K  1-2K  2-3K  3-4K  4-5K  5K+                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐     │
│  │   JOBS BY LOCATION       │  │   JOBS BY INDUSTRY       │     │
│  │   (Pie Chart)            │  │   (Horizontal Bar)       │     │
│  │                          │  │                          │     │
│  │      ╭────╮              │  │  IT         ████████    │     │
│  │    ╭─╯Tbilisi╰─╮         │  │  Banking    ██████      │     │
│  │   │    65%     │         │  │  Retail     ████        │     │
│  │    ╰─╮Batumi╭─╯          │  │  Healthcare ███         │     │
│  │      ╰──18%─╯            │  │  Other      ██████████  │     │
│  └──────────────────────────┘  └──────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │   SALARY STATISTICS                                      │    │
│  │                                                          │    │
│  │   Average Salary: 2,450 GEL                             │    │
│  │   Median Salary:  2,100 GEL                             │    │
│  │   Min Salary:     500 GEL                               │    │
│  │   Max Salary:     15,000 GEL                            │    │
│  │   Jobs with Salary: 4,200 (27%)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Charts Needed:**
1. Salary Distribution (Histogram)
2. Jobs by Location (Pie Chart)
3. Jobs by Industry (Bar Chart)
4. Jobs Over Time (Line Chart)
5. Remote vs Office (Donut Chart)

**API Calls:**
```typescript
GET /api/v1/stats
GET /api/v1/stats/by-location
GET /api/v1/stats/by-industry
GET /api/v1/stats/salary
```

---

### 5.7 Parser Control Page (`/parser`)

**Purpose:** Monitor and control the parser.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Parser Control                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PARSER STATUS                         │    │
│  │                                                          │    │
│  │     ●  IDLE (waiting for next scheduled run)            │    │
│  │                                                          │    │
│  │     Scheduler: Running                                   │    │
│  │     Interval: Every 6 hours                             │    │
│  │     Next Run: Jan 24, 2026 18:00 (in 3h 45m)           │    │
│  │                                                          │    │
│  │     [▶ Run Full Parse]    [↻ Run Incremental]           │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  LAST RUN SUMMARY                        │    │
│  │                                                          │    │
│  │     Started:  Jan 24, 2026 12:00                        │    │
│  │     Finished: Jan 24, 2026 12:45                        │    │
│  │     Duration: 45 minutes                                 │    │
│  │     Status:   ✓ Completed                               │    │
│  │                                                          │    │
│  │     ┌─────────┬──────────┬─────────┬────────┐          │    │
│  │     │  Found  │  Created │ Updated │ Failed │          │    │
│  │     │ 15,420  │    125   │ 15,200  │   95   │          │    │
│  │     └─────────┴──────────┴─────────┴────────┘          │    │
│  │                                                          │    │
│  │     Success Rate: 99.4%                                  │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [View Full History →]                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time status updates (polling or WebSocket)
- Manual trigger buttons with confirmation
- Last run statistics
- Quick link to history

**API Calls:**
```typescript
GET  /api/v1/parser/status      // Poll every 30s
POST /api/v1/parser/run?run_type=full
POST /api/v1/parser/run?run_type=incremental
```

---

### 5.8 Parser History Page (`/parser/history`)

**Purpose:** View all parser execution history.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Parser History                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ID │ Started        │ Duration │ Status │ Created │ Failed│   │
│  ├────┼────────────────┼──────────┼────────┼─────────┼───────┤   │
│  │ 42 │ Jan 24, 12:00 │ 45m      │ ✓ Done │  125    │  95   │   │
│  │ 41 │ Jan 24, 06:00 │ 42m      │ ✓ Done │   89    │  78   │   │
│  │ 40 │ Jan 24, 00:00 │ 48m      │ ✓ Done │  156    │ 102   │   │
│  │ 39 │ Jan 23, 18:00 │ 15m      │ ✗ Fail │    0    │   0   │   │
│  │ 38 │ Jan 23, 12:00 │ 44m      │ ✓ Done │  134    │  88   │   │
│  └────┴────────────────┴──────────┴────────┴─────────┴───────┘   │
│                                                                  │
│  [← Prev]  1  2  3  4  5  [Next →]                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Run #39 - Error Details:                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Error: Connection timeout to api.p.hr.ge                       │
│  The HR.GE API was unresponsive. Parser will retry on next      │
│  scheduled run.                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
GET /api/v1/parser/history?limit=20
```

---

## 6. UI Components

### Component Library

| Component | Purpose |
|-----------|---------|
| `StatCard` | Display single metric with icon |
| `DataTable` | Sortable, filterable table |
| `SearchInput` | Search with debounce |
| `FilterDropdown` | Multi-select filter |
| `Pagination` | Page navigation |
| `StatusBadge` | Status indicator |
| `Chart` | Wrapper for Recharts |
| `Modal` | Confirmation dialogs |
| `Toast` | Notifications |
| `Skeleton` | Loading states |
| `EmptyState` | No data placeholders |

### Component Examples

**StatCard:**
```tsx
<StatCard
  title="Total Jobs"
  value={15420}
  icon={<BriefcaseIcon />}
  trend={{ value: 5.2, direction: "up" }}
  href="/jobs"
/>
```

**DataTable:**
```tsx
<DataTable
  data={jobs}
  columns={[
    { key: "title", label: "Title", sortable: true },
    { key: "company.name", label: "Company" },
    { key: "salary_from", label: "Salary", format: "currency" },
    { key: "publish_date", label: "Posted", format: "relative" },
  ]}
  pagination={{ page, perPage, total }}
  onPageChange={setPage}
/>
```

---

## 7. API Integration

### API Client Setup

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089',
  timeout: 30000,
});

// Request interceptor for auth (future)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### API Hooks (React Query)

```typescript
// src/hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useJobs(params: JobsParams) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.get('/api/v1/jobs', { params }).then(r => r.data),
    staleTime: 60000, // 1 minute
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/api/v1/jobs/${id}`).then(r => r.data),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/api/v1/stats').then(r => r.data),
    refetchInterval: 60000, // Auto-refresh every minute
  });
}

export function useParserStatus() {
  return useQuery({
    queryKey: ['parser-status'],
    queryFn: () => api.get('/api/v1/parser/status').then(r => r.data),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
```

### Mutations

```typescript
// src/hooks/useParser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useTriggerParser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runType: 'full' | 'incremental') =>
      api.post('/api/v1/parser/run', null, { params: { run_type: runType } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser-status'] });
    },
  });
}
```

---

## 8. Design System

### Color Palette

```css
:root {
  /* Primary */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Success */
  --success-500: #22c55e;
  --success-600: #16a34a;

  /* Warning */
  --warning-500: #f59e0b;
  --warning-600: #d97706;

  /* Error */
  --error-500: #ef4444;
  --error-600: #dc2626;

  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

### Typography

```css
/* Headings */
.h1 { font-size: 2.25rem; font-weight: 700; }
.h2 { font-size: 1.875rem; font-weight: 600; }
.h3 { font-size: 1.5rem; font-weight: 600; }
.h4 { font-size: 1.25rem; font-weight: 500; }

/* Body */
.body-lg { font-size: 1.125rem; }
.body-md { font-size: 1rem; }
.body-sm { font-size: 0.875rem; }
.body-xs { font-size: 0.75rem; }
```

### Spacing Scale

```
4px  - xs
8px  - sm
12px - md
16px - lg
24px - xl
32px - 2xl
48px - 3xl
```

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)

| Task | Priority |
|------|----------|
| Project setup (Vite/Next.js) | High |
| API client configuration | High |
| Layout components (Sidebar, Header) | High |
| Basic routing | High |
| StatCard component | High |

**Deliverable:** Basic app structure with navigation

### Phase 2: Core Pages (Week 2)

| Task | Priority |
|------|----------|
| Dashboard page | High |
| Jobs list page | High |
| Job detail page | High |
| Pagination component | High |
| Search & filters | Medium |

**Deliverable:** Functional jobs browser

### Phase 3: Extended Features (Week 3)

| Task | Priority |
|------|----------|
| Companies pages | Medium |
| Parser control page | High |
| Parser history page | Medium |
| Analytics page | Medium |
| Charts integration | Medium |

**Deliverable:** Complete feature set

### Phase 4: Polish (Week 4)

| Task | Priority |
|------|----------|
| Loading states | Medium |
| Error handling | High |
| Empty states | Medium |
| Responsive design | Medium |
| Performance optimization | Low |
| Testing | Medium |

**Deliverable:** Production-ready dashboard

---

## 10. File Structure

### Recommended Structure

```
hr_ge_parser_frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── jobs/
│   │   │   ├── page.tsx          # Jobs list
│   │   │   └── [id]/page.tsx     # Job detail
│   │   ├── companies/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── parser/
│   │   │   ├── page.tsx          # Parser control
│   │   │   └── history/page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── ParserStatus.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── jobs/
│   │   │   ├── JobsTable.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobFilters.tsx
│   │   │   └── JobDetail.tsx
│   │   ├── companies/
│   │   │   ├── CompanyCard.tsx
│   │   │   └── CompanyDetail.tsx
│   │   ├── analytics/
│   │   │   ├── SalaryChart.tsx
│   │   │   ├── LocationChart.tsx
│   │   │   └── IndustryChart.tsx
│   │   └── parser/
│   │       ├── ParserControls.tsx
│   │       └── RunHistory.tsx
│   ├── hooks/
│   │   ├── useJobs.ts
│   │   ├── useCompanies.ts
│   │   ├── useStats.ts
│   │   └── useParser.ts
│   ├── lib/
│   │   ├── api.ts               # Axios instance
│   │   ├── utils.ts             # Helper functions
│   │   └── constants.ts
│   ├── types/
│   │   ├── job.ts
│   │   ├── company.ts
│   │   └── parser.ts
│   └── styles/
│       └── globals.css
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## Summary

This frontend plan provides:

1. **Complete page specifications** for all 8 main views
2. **Component architecture** with reusable UI elements
3. **API integration patterns** using React Query
4. **Design system** with colors, typography, spacing
5. **Implementation roadmap** in 4 phases
6. **File structure** for organized codebase

The dashboard will enable administrators to:
- Monitor real-time parser status
- Browse and search job data
- View analytics and trends
- Control parser execution
- Track system health

**Estimated Development Time:** 4 weeks for full implementation
**Recommended Stack:** Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS + React Query
