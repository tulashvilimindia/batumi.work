# HR.GE Parser Admin Dashboard - Work Breakdown Structure (WBS)

## Project Code: HRGE-FE
## Version: 1.0.0
## Created: January 2026

---

## WBS Hierarchy

```
1.0 HR.GE Parser Frontend
├── 1.1 Project Setup & Infrastructure
│   ├── 1.1.1 Initialize Project
│   │   ├── 1.1.1.1 Create Vite + React + TypeScript project
│   │   ├── 1.1.1.2 Configure TypeScript (tsconfig.json)
│   │   ├── 1.1.1.3 Configure Vite (vite.config.ts)
│   │   └── 1.1.1.4 Set up path aliases (@/)
│   ├── 1.1.2 Install Dependencies
│   │   ├── 1.1.2.1 Core: react, react-dom, react-router-dom
│   │   ├── 1.1.2.2 Styling: tailwindcss, postcss, autoprefixer
│   │   ├── 1.1.2.3 Data: @tanstack/react-query, axios
│   │   ├── 1.1.2.4 Charts: recharts
│   │   ├── 1.1.2.5 Icons: lucide-react
│   │   └── 1.1.2.6 Dev: @types/*, eslint, prettier
│   ├── 1.1.3 Configure Styling
│   │   ├── 1.1.3.1 Create tailwind.config.js
│   │   ├── 1.1.3.2 Create postcss.config.js
│   │   ├── 1.1.3.3 Set up index.css with Tailwind directives
│   │   └── 1.1.3.4 Define color palette and design tokens
│   ├── 1.1.4 Docker Setup
│   │   ├── 1.1.4.1 Create Dockerfile (multi-stage build)
│   │   ├── 1.1.4.2 Create nginx.conf
│   │   ├── 1.1.4.3 Create .dockerignore
│   │   └── 1.1.4.4 Update docker-compose.yml (add frontend service)
│   └── 1.1.5 Code Quality Setup
│       ├── 1.1.5.1 Configure ESLint
│       ├── 1.1.5.2 Configure Prettier
│       └── 1.1.5.3 Create .editorconfig
│
├── 1.2 Core Architecture
│   ├── 1.2.1 API Layer
│   │   ├── 1.2.1.1 Create api/client.ts (Axios instance)
│   │   ├── 1.2.1.2 Create api/endpoints.ts (API functions)
│   │   └── 1.2.1.3 Set up environment variables
│   ├── 1.2.2 Type Definitions
│   │   ├── 1.2.2.1 Create types/job.ts
│   │   ├── 1.2.2.2 Create types/company.ts
│   │   ├── 1.2.2.3 Create types/parser.ts
│   │   ├── 1.2.2.4 Create types/stats.ts
│   │   └── 1.2.2.5 Create types/common.ts
│   ├── 1.2.3 React Query Hooks
│   │   ├── 1.2.3.1 Create hooks/useJobs.ts
│   │   ├── 1.2.3.2 Create hooks/useCompanies.ts
│   │   ├── 1.2.3.3 Create hooks/useStats.ts
│   │   ├── 1.2.3.4 Create hooks/useParser.ts
│   │   └── 1.2.3.5 Set up QueryClient provider
│   └── 1.2.4 Routing
│       ├── 1.2.4.1 Create router configuration
│       ├── 1.2.4.2 Set up route constants
│       └── 1.2.4.3 Implement lazy loading
│
├── 1.3 UI Components Library
│   ├── 1.3.1 Base Components
│   │   ├── 1.3.1.1 Create components/ui/Button.tsx
│   │   ├── 1.3.1.2 Create components/ui/Card.tsx
│   │   ├── 1.3.1.3 Create components/ui/Badge.tsx
│   │   ├── 1.3.1.4 Create components/ui/Spinner.tsx
│   │   └── 1.3.1.5 Create components/ui/index.ts (exports)
│   ├── 1.3.2 Form Components
│   │   ├── 1.3.2.1 Create components/ui/Input.tsx
│   │   ├── 1.3.2.2 Create components/ui/Select.tsx
│   │   ├── 1.3.2.3 Create components/ui/Checkbox.tsx
│   │   └── 1.3.2.4 Create components/ui/SearchInput.tsx
│   ├── 1.3.3 Data Display Components
│   │   ├── 1.3.3.1 Create components/ui/Table.tsx
│   │   ├── 1.3.3.2 Create components/ui/Pagination.tsx
│   │   ├── 1.3.3.3 Create components/ui/EmptyState.tsx
│   │   └── 1.3.3.4 Create components/ui/Skeleton.tsx
│   └── 1.3.4 Feedback Components
│       ├── 1.3.4.1 Create components/ui/Modal.tsx
│       ├── 1.3.4.2 Create components/ui/Toast.tsx
│       └── 1.3.4.3 Create components/ui/Alert.tsx
│
├── 1.4 Layout System
│   ├── 1.4.1 Main Layout
│   │   ├── 1.4.1.1 Create components/layout/Layout.tsx
│   │   ├── 1.4.1.2 Create components/layout/Sidebar.tsx
│   │   ├── 1.4.1.3 Create components/layout/Header.tsx
│   │   └── 1.4.1.4 Create components/layout/PageHeader.tsx
│   └── 1.4.2 Layout Utilities
│       ├── 1.4.2.1 Create responsive sidebar toggle
│       ├── 1.4.2.2 Implement dark mode context
│       └── 1.4.2.3 Create breadcrumb component
│
├── 1.5 Dashboard Page
│   ├── 1.5.1 Stats Section
│   │   ├── 1.5.1.1 Create components/dashboard/StatCard.tsx
│   │   ├── 1.5.1.2 Create components/dashboard/StatsGrid.tsx
│   │   └── 1.5.1.3 Integrate with useStats hook
│   ├── 1.5.2 Parser Status Section
│   │   ├── 1.5.2.1 Create components/dashboard/ParserStatusCard.tsx
│   │   ├── 1.5.2.2 Add status indicator (running/idle)
│   │   └── 1.5.2.3 Display next run countdown
│   ├── 1.5.3 Quick Actions Section
│   │   ├── 1.5.3.1 Create components/dashboard/QuickActions.tsx
│   │   ├── 1.5.3.2 Implement trigger parser buttons
│   │   └── 1.5.3.3 Add confirmation dialogs
│   ├── 1.5.4 Charts Section
│   │   ├── 1.5.4.1 Create components/dashboard/LocationChart.tsx
│   │   ├── 1.5.4.2 Create components/dashboard/RecentActivity.tsx
│   │   └── 1.5.4.3 Integrate with stats API
│   └── 1.5.5 Dashboard Page Assembly
│       ├── 1.5.5.1 Create pages/Dashboard.tsx
│       ├── 1.5.5.2 Implement auto-refresh (60s)
│       └── 1.5.5.3 Add loading states
│
├── 1.6 Jobs Module
│   ├── 1.6.1 Jobs List Components
│   │   ├── 1.6.1.1 Create components/jobs/JobsTable.tsx
│   │   ├── 1.6.1.2 Create components/jobs/JobRow.tsx
│   │   ├── 1.6.1.3 Create components/jobs/JobFilters.tsx
│   │   └── 1.6.1.4 Create components/jobs/JobsHeader.tsx
│   ├── 1.6.2 Job Detail Components
│   │   ├── 1.6.2.1 Create components/jobs/JobDetailView.tsx
│   │   ├── 1.6.2.2 Create components/jobs/JobSalaryBadge.tsx
│   │   ├── 1.6.2.3 Create components/jobs/JobMetadata.tsx
│   │   └── 1.6.2.4 Create components/jobs/JobDescription.tsx
│   ├── 1.6.3 Jobs Pages
│   │   ├── 1.6.3.1 Create pages/Jobs.tsx
│   │   ├── 1.6.3.2 Create pages/JobDetail.tsx
│   │   └── 1.6.3.3 Implement URL query params for filters
│   └── 1.6.4 Jobs Features
│       ├── 1.6.4.1 Implement search functionality
│       ├── 1.6.4.2 Implement filter logic
│       ├── 1.6.4.3 Implement sorting
│       └── 1.6.4.4 Implement CSV export
│
├── 1.7 Companies Module
│   ├── 1.7.1 Companies List Components
│   │   ├── 1.7.1.1 Create components/companies/CompanyCard.tsx
│   │   ├── 1.7.1.2 Create components/companies/CompanyList.tsx
│   │   └── 1.7.1.3 Create components/companies/CompanySearch.tsx
│   ├── 1.7.2 Company Detail Components
│   │   ├── 1.7.2.1 Create components/companies/CompanyHeader.tsx
│   │   ├── 1.7.2.2 Create components/companies/CompanyJobs.tsx
│   │   └── 1.7.2.3 Create components/companies/CompanyStats.tsx
│   └── 1.7.3 Companies Pages
│       ├── 1.7.3.1 Create pages/Companies.tsx
│       └── 1.7.3.2 Create pages/CompanyDetail.tsx
│
├── 1.8 Analytics Module
│   ├── 1.8.1 Chart Components
│   │   ├── 1.8.1.1 Create components/analytics/SalaryDistributionChart.tsx
│   │   ├── 1.8.1.2 Create components/analytics/LocationPieChart.tsx
│   │   ├── 1.8.1.3 Create components/analytics/IndustryBarChart.tsx
│   │   └── 1.8.1.4 Create components/analytics/SalaryStatsCard.tsx
│   └── 1.8.2 Analytics Page
│       ├── 1.8.2.1 Create pages/Analytics.tsx
│       └── 1.8.2.2 Implement chart data formatting
│
├── 1.9 Parser Module
│   ├── 1.9.1 Parser Control Components
│   │   ├── 1.9.1.1 Create components/parser/ParserStatus.tsx
│   │   ├── 1.9.1.2 Create components/parser/ParserControls.tsx
│   │   ├── 1.9.1.3 Create components/parser/LastRunSummary.tsx
│   │   └── 1.9.1.4 Create components/parser/ScheduleInfo.tsx
│   ├── 1.9.2 Parser History Components
│   │   ├── 1.9.2.1 Create components/parser/HistoryTable.tsx
│   │   ├── 1.9.2.2 Create components/parser/RunStatusBadge.tsx
│   │   └── 1.9.2.3 Create components/parser/ErrorDetails.tsx
│   └── 1.9.3 Parser Pages
│       ├── 1.9.3.1 Create pages/Parser.tsx
│       └── 1.9.3.2 Create pages/ParserHistory.tsx
│
├── 1.10 Settings Module
│   ├── 1.10.1 Settings Components
│   │   ├── 1.10.1.1 Create components/settings/ThemeToggle.tsx
│   │   ├── 1.10.1.2 Create components/settings/ApiInfo.tsx
│   │   └── 1.10.1.3 Create components/settings/RefreshSettings.tsx
│   └── 1.10.2 Settings Page
│       └── 1.10.2.1 Create pages/Settings.tsx
│
└── 1.11 Integration & Polish
    ├── 1.11.1 Error Handling
    │   ├── 1.11.1.1 Create error boundary component
    │   ├── 1.11.1.2 Create API error handler
    │   └── 1.11.1.3 Add toast notifications
    ├── 1.11.2 Loading States
    │   ├── 1.11.2.1 Add skeleton loaders to all pages
    │   └── 1.11.2.2 Add loading indicators to actions
    ├── 1.11.3 Responsive Design
    │   ├── 1.11.3.1 Mobile sidebar behavior
    │   ├── 1.11.3.2 Responsive tables
    │   └── 1.11.3.3 Touch-friendly interactions
    └── 1.11.4 Final Testing
        ├── 1.11.4.1 Test all API integrations
        ├── 1.11.4.2 Test Docker build
        └── 1.11.4.3 Cross-browser testing
```

---

## WBS Dictionary

### 1.1 Project Setup & Infrastructure
**Owner:** Agent 1 (Foundation Agent)
**Duration:** Phase 1
**Dependencies:** None
**Deliverables:** Working project skeleton, Docker configuration, code quality tools

### 1.2 Core Architecture
**Owner:** Agent 1 (Foundation Agent)
**Duration:** Phase 1
**Dependencies:** 1.1
**Deliverables:** API client, types, hooks, routing

### 1.3 UI Components Library
**Owner:** Agent 2 (Components Agent)
**Duration:** Phase 1-2
**Dependencies:** 1.1.3 (Styling)
**Deliverables:** Reusable UI component library

### 1.4 Layout System
**Owner:** Agent 2 (Components Agent)
**Duration:** Phase 1
**Dependencies:** 1.3.1 (Base Components)
**Deliverables:** Main layout with sidebar and header

### 1.5 Dashboard Page
**Owner:** Agent 3 (Features Agent)
**Duration:** Phase 2
**Dependencies:** 1.2, 1.3, 1.4
**Deliverables:** Complete dashboard page

### 1.6 Jobs Module
**Owner:** Agent 3 (Features Agent)
**Duration:** Phase 2-3
**Dependencies:** 1.2, 1.3, 1.4
**Deliverables:** Jobs list and detail pages

### 1.7 Companies Module
**Owner:** Agent 3 (Features Agent)
**Duration:** Phase 3
**Dependencies:** 1.2, 1.3, 1.4
**Deliverables:** Companies list and detail pages

### 1.8 Analytics Module
**Owner:** Agent 2 (Components Agent)
**Duration:** Phase 3
**Dependencies:** 1.2, 1.3
**Deliverables:** Analytics page with charts

### 1.9 Parser Module
**Owner:** Agent 3 (Features Agent)
**Duration:** Phase 3
**Dependencies:** 1.2, 1.3, 1.4
**Deliverables:** Parser control and history pages

### 1.10 Settings Module
**Owner:** Agent 2 (Components Agent)
**Duration:** Phase 4
**Dependencies:** 1.4
**Deliverables:** Settings page

### 1.11 Integration & Polish
**Owner:** All Agents
**Duration:** Phase 4
**Dependencies:** All
**Deliverables:** Production-ready application

---

## Task Count Summary

| WBS Level | Count |
|-----------|-------|
| Level 1 (Project) | 1 |
| Level 2 (Modules) | 11 |
| Level 3 (Features) | 42 |
| Level 4 (Tasks) | 98 |
| **Total Tasks** | **98** |

---

## Critical Path

```
1.1.1 → 1.1.2 → 1.1.3 → 1.2.1 → 1.2.2 → 1.2.3 → 1.5.1 → 1.5.5 → 1.11.4
```

The critical path goes through:
1. Project initialization
2. Dependencies installation
3. Styling setup
4. API layer
5. Type definitions
6. React Query hooks
7. Dashboard stats
8. Dashboard assembly
9. Final testing
