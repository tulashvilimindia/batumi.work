# React Admin Frontend Implementation Plan

This document details the implementation plan for a new React-based admin frontend for Georgia Job Board, running as a separate container alongside the existing Alpine.js admin.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Module Specifications](#module-specifications)
6. [Implementation Phases](#implementation-phases)
7. [File Structure](#file-structure)
8. [Docker Configuration](#docker-configuration)
9. [Testing Plan](#testing-plan)

---

## Overview

### Goals
- Create a modern React admin frontend with TypeScript
- Run as separate Docker container on port 20001
- Replicate all 7 existing admin modules
- Improve UX with better state management and loading states
- Maintain compatibility with existing admin API

### Existing Admin Modules to Replicate
| Module | Description | Key Features |
|--------|-------------|--------------|
| Dashboard | System overview | Stats cards, health status, quick actions |
| Jobs | Job management | CRUD operations, filtering, status changes |
| Parser | Parser control | View runs, trigger parse, source management |
| Analytics | Data visualization | Charts, filters, export |
| Backups | Backup management | List, create, download, restore |
| Database | DB operations | Table stats, vacuum, query interface |
| Logs | Log viewer | Real-time logs, filtering, search |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  Existing Admin     │    │  New React Admin            │ │
│  │  :80/admin/         │    │  :20001/                     │ │
│  │  (Alpine.js)        │    │  (React + TypeScript)       │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Admin API Service                         │
│                    localhost:9000                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │dashboard │ │  jobs    │ │  parser  │ │analytics │ ...   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                    localhost:5432                            │
└─────────────────────────────────────────────────────────────┘
```

### Port Allocation
| Service | Port | Description |
|---------|------|-------------|
| web (nginx) | 80, 443 | Main website + existing admin |
| api | 8000 | Public API |
| admin | 9000 | Admin API |
| admin-ui | 20001 | **New React admin frontend** |
| db | 5432 | PostgreSQL |

---

## Tech Stack

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool + dev server |

### State & Data
| Technology | Purpose |
|------------|---------|
| TanStack Query (React Query) | Server state, caching, refetching |
| Zustand | Client state (auth, UI preferences) |
| Axios | HTTP client |

### UI Components
| Technology | Purpose |
|------------|---------|
| shadcn/ui | Component library (Radix + Tailwind) |
| Tailwind CSS | Styling |
| Recharts | Charts and graphs |
| Lucide React | Icons |

### Utilities
| Technology | Purpose |
|------------|---------|
| React Router | Client-side routing |
| React Hook Form | Form handling |
| Zod | Schema validation |
| date-fns | Date formatting |

---

## API Endpoints Reference

### Authentication
All admin endpoints require `X-API-Key` header.

### Dashboard Endpoints
```
GET /dashboard                    → System overview stats
GET /health                       → Health check status
```

### Jobs Endpoints
```
GET    /jobs                      → List jobs (paginated)
GET    /jobs/{id}                 → Get job details
POST   /jobs                      → Create job
PUT    /jobs/{id}                 → Update job
DELETE /jobs/{id}                 → Delete job
PATCH  /jobs/{id}/status          → Change job status
GET    /jobs/stats                → Job statistics
```

### Parser Endpoints
```
GET  /parser/sources              → List parser sources
GET  /parser/runs                 → Parser run history
POST /parser/trigger              → Trigger manual parse
GET  /parser/status               → Current parser status
```

### Analytics Endpoints
```
GET /analytics/dashboard          → Basic dashboard data
GET /analytics/dashboard-v2       → Filter-based dashboard (new)
GET /analytics/filters            → Available filter options
GET /analytics/export             → Export as CSV
```

### Backups Endpoints
```
GET    /backups                   → List all backups
GET    /backups/status            → Backup health status
POST   /backups/trigger           → Create new backup
GET    /backups/{filename}        → Download backup file
DELETE /backups/{filename}        → Delete backup
POST   /backups/restore           → Restore from backup
```

### Database Endpoints
```
GET  /database/stats              → Table statistics
GET  /database/tables             → List tables with row counts
POST /database/vacuum             → Run VACUUM ANALYZE
POST /database/query              → Execute read-only query
```

### Logs Endpoints
```
GET /logs                         → Get container logs
GET /logs/services                → Available services
```

---

## Module Specifications

### 1. Dashboard Module

**Components:**
- `StatsCard` - Displays metric with icon, value, change indicator
- `HealthStatus` - Shows service health with color coding
- `QuickActions` - Buttons for common operations
- `RecentActivity` - Latest jobs and parser runs

**Data Requirements:**
```typescript
interface DashboardData {
  totalJobs: number;
  activeJobs: number;
  jobsWithSalary: number;
  totalViews: number;
  parserStatus: 'running' | 'idle' | 'error';
  lastParseTime: string;
  dbHealth: 'healthy' | 'warning' | 'error';
  recentJobs: Job[];
}
```

### 2. Jobs Module

**Components:**
- `JobsTable` - Paginated data table with sorting
- `JobFilters` - Category, region, status, search
- `JobForm` - Create/edit form with validation
- `JobStatusBadge` - Color-coded status indicator
- `BulkActions` - Multi-select operations

**Features:**
- Pagination (20 per page)
- Column sorting
- Full-text search
- Status quick-change
- Bulk status update
- Export to CSV

**Data Requirements:**
```typescript
interface Job {
  id: string;
  external_id: string;
  title_ge: string;
  title_en?: string;
  company_name?: string;
  location?: string;
  category: Category;
  region: Region;
  status: 'active' | 'inactive' | 'expired';
  has_salary: boolean;
  salary_min?: number;
  salary_max?: number;
  is_vip: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}
```

### 3. Parser Module

**Components:**
- `ParserStatus` - Current status with last run info
- `SourceList` - Enabled/disabled sources
- `RunHistory` - Table of parser runs
- `TriggerButton` - Manual parse trigger
- `RunDetails` - Modal with run statistics

**Features:**
- View parser sources
- See run history with stats
- Trigger manual parse
- View errors from failed runs

### 4. Analytics Module

**Components:**
- `FilterBar` - Date range, categories, regions
- `SummaryCards` - Key metrics
- `TimeSeriesChart` - Jobs over time (line)
- `CategoryChart` - Distribution (bar/pie toggle)
- `RegionChart` - Regional breakdown
- `SalaryHistogram` - Salary distribution
- `ExportButton` - CSV download

**Features:**
- Grafana-style dark theme
- Interactive filters
- Multiple chart types
- URL state sync
- CSV export

### 5. Backups Module

**Components:**
- `BackupStatus` - Health and last backup info
- `BackupList` - Table with download/delete actions
- `CreateBackupButton` - Trigger new backup
- `RestoreDialog` - Confirmation modal

**Features:**
- View backup history
- Download backup files
- Create manual backups
- Delete old backups
- Restore from backup (with confirmation)

### 6. Database Module

**Components:**
- `TableStats` - Row counts, sizes
- `VacuumButton` - Run maintenance
- `QueryInterface` - Read-only SQL input
- `ResultsTable` - Query results display

**Features:**
- View table statistics
- Run VACUUM ANALYZE
- Execute read-only queries
- Display query results

### 7. Logs Module

**Components:**
- `ServiceSelector` - Dropdown for container
- `LogViewer` - Scrollable log display
- `LogFilters` - Level, search, date range
- `AutoRefresh` - Toggle for live updates

**Features:**
- View logs by service
- Filter by log level
- Search within logs
- Auto-refresh toggle
- Download logs

---

## Implementation Phases

### Phase 1: Project Setup (Day 1)
1. Create `admin-ui/` directory
2. Initialize Vite + React + TypeScript
3. Install dependencies
4. Configure Tailwind CSS
5. Set up shadcn/ui
6. Create Dockerfile
7. Add nginx.conf
8. Update docker-compose.yml

**Deliverables:**
- Working dev server
- Docker container building
- Basic "Hello World" page

### Phase 2: Core Infrastructure (Day 1-2)
1. Set up React Router
2. Configure TanStack Query
3. Create API client with Axios
4. Implement auth context (API key)
5. Create base layout component
6. Add navigation sidebar

**Deliverables:**
- Routing working
- API client configured
- Layout with navigation

### Phase 3: Dashboard Module (Day 2)
1. Create stats card component
2. Implement health status display
3. Add quick actions
4. Connect to dashboard API

**Deliverables:**
- Functional dashboard page

### Phase 4: Jobs Module (Day 2-3)
1. Create jobs table with pagination
2. Implement filters
3. Build job form
4. Add CRUD operations
5. Implement bulk actions

**Deliverables:**
- Full job management

### Phase 5: Parser Module (Day 3)
1. Display parser status
2. Show source list
3. Implement run history table
4. Add trigger functionality

**Deliverables:**
- Parser control working

### Phase 6: Analytics Module (Day 3-4)
1. Build filter bar
2. Create summary cards
3. Implement charts with Recharts
4. Add export functionality
5. URL state sync

**Deliverables:**
- Full analytics dashboard

### Phase 7: Backups Module (Day 4)
1. Backup status display
2. Backup list table
3. Download functionality
4. Create/delete operations

**Deliverables:**
- Backup management working

### Phase 8: Database Module (Day 4)
1. Table statistics display
2. Vacuum button
3. Query interface

**Deliverables:**
- Database tools working

### Phase 9: Logs Module (Day 5)
1. Service selector
2. Log viewer component
3. Filtering and search
4. Auto-refresh

**Deliverables:**
- Log viewer working

### Phase 10: Polish & Documentation (Day 5)
1. Error boundaries
2. Loading states
3. Empty states
4. Responsive design
5. Update documentation

**Deliverables:**
- Production-ready application

---

## File Structure

```
admin-ui/
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/
│   └── favicon.ico
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    │
    ├── api/
    │   ├── client.ts              # Axios instance
    │   ├── dashboard.ts           # Dashboard API calls
    │   ├── jobs.ts                # Jobs API calls
    │   ├── parser.ts              # Parser API calls
    │   ├── analytics.ts           # Analytics API calls
    │   ├── backups.ts             # Backups API calls
    │   ├── database.ts            # Database API calls
    │   └── logs.ts                # Logs API calls
    │
    ├── components/
    │   ├── ui/                    # shadcn/ui components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   ├── table.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── select.tsx
    │   │   ├── badge.tsx
    │   │   └── ...
    │   │
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   ├── Layout.tsx
    │   │   └── NavLink.tsx
    │   │
    │   ├── dashboard/
    │   │   ├── StatsCard.tsx
    │   │   ├── HealthStatus.tsx
    │   │   └── QuickActions.tsx
    │   │
    │   ├── jobs/
    │   │   ├── JobsTable.tsx
    │   │   ├── JobFilters.tsx
    │   │   ├── JobForm.tsx
    │   │   └── JobStatusBadge.tsx
    │   │
    │   ├── parser/
    │   │   ├── ParserStatus.tsx
    │   │   ├── SourceList.tsx
    │   │   └── RunHistory.tsx
    │   │
    │   ├── analytics/
    │   │   ├── FilterBar.tsx
    │   │   ├── SummaryCards.tsx
    │   │   ├── TimeSeriesChart.tsx
    │   │   ├── CategoryChart.tsx
    │   │   └── SalaryChart.tsx
    │   │
    │   ├── backups/
    │   │   ├── BackupStatus.tsx
    │   │   ├── BackupList.tsx
    │   │   └── RestoreDialog.tsx
    │   │
    │   ├── database/
    │   │   ├── TableStats.tsx
    │   │   └── QueryInterface.tsx
    │   │
    │   └── logs/
    │       ├── LogViewer.tsx
    │       └── ServiceSelector.tsx
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useDashboard.ts
    │   ├── useJobs.ts
    │   ├── useParser.ts
    │   ├── useAnalytics.ts
    │   ├── useBackups.ts
    │   ├── useDatabase.ts
    │   └── useLogs.ts
    │
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── JobsPage.tsx
    │   ├── ParserPage.tsx
    │   ├── AnalyticsPage.tsx
    │   ├── BackupsPage.tsx
    │   ├── DatabasePage.tsx
    │   └── LogsPage.tsx
    │
    ├── store/
    │   └── authStore.ts           # Zustand store
    │
    ├── types/
    │   ├── job.ts
    │   ├── category.ts
    │   ├── region.ts
    │   ├── parser.ts
    │   ├── analytics.ts
    │   ├── backup.ts
    │   └── index.ts
    │
    └── lib/
        ├── utils.ts               # Utility functions
        └── constants.ts           # App constants
```

---

## Docker Configuration

### Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to admin service
    location /api/ {
        proxy_pass http://admin:9000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml Addition
```yaml
  admin-ui:
    build:
      context: ./admin-ui
      dockerfile: Dockerfile
    container_name: jobboard-admin-ui
    ports:
      - "20001:80"
    depends_on:
      - admin
    networks:
      - jobboard-network
    restart: unless-stopped
```

---

## Testing Plan

### Manual Testing Checklist
- [ ] Dashboard loads with correct stats
- [ ] Jobs table paginates correctly
- [ ] Job CRUD operations work
- [ ] Parser trigger executes
- [ ] Analytics charts render
- [ ] Filters update all charts
- [ ] CSV export downloads
- [ ] Backup create/download works
- [ ] Database query executes
- [ ] Logs display correctly

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Testing
- Desktop (1920px)
- Laptop (1366px)
- Tablet (768px)
- Mobile (375px)

---

## Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Project Setup | Complete | Vite + React + TypeScript configured |
| Phase 2: Core Infrastructure | Complete | Routing, API client, auth store, layout |
| Phase 3: Dashboard Module | Complete | Stats cards, health status, quick actions |
| Phase 4: Jobs Module | Complete | Table with pagination, filters, CRUD |
| Phase 5: Parser Module | Complete | Status display, run history, trigger |
| Phase 6: Analytics Module | Complete | Charts with Recharts, filters, export |
| Phase 7: Backups Module | Complete | List, create, download, restore |
| Phase 8: Database Module | Complete | Table stats, vacuum, query interface |
| Phase 9: Logs Module | Complete | Log viewer, filters, auto-refresh |
| Phase 10: Polish & Documentation | Complete | Documentation updated |

---

## Quick Start

```bash
# Build and run the React admin
cd compose-project
docker compose build admin-ui
docker compose up -d admin-ui

# Access at http://localhost:20001
```

---

*Created: January 22, 2026*
*Last Updated: January 22, 2026*
*Implementation Status: COMPLETE*
