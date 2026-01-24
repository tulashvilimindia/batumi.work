# HR.GE Parser Frontend - Agent Task Assignments

## Overview

Three AI Coding Agents will work **independently and in parallel** without code conflicts.

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT RESPONSIBILITY MAP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   AGENT 1: Foundation          AGENT 2: Components              │
│   ─────────────────           ────────────────────              │
│   ├── /api/*                  ├── /components/ui/*              │
│   ├── /types/*                ├── /components/layout/*          │
│   ├── /hooks/*                ├── /components/analytics/*       │
│   ├── /utils/*                ├── /components/settings/*        │
│   ├── /contexts/*             └── Dark mode system              │
│   ├── App.tsx                                                   │
│   ├── main.tsx                AGENT 3: Features                 │
│   ├── Docker files            ────────────────────              │
│   └── Config files            ├── /components/dashboard/*       │
│                               ├── /components/jobs/*            │
│                               ├── /components/companies/*       │
│                               ├── /components/parser/*          │
│                               └── /pages/*                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## AGENT 1: Foundation Agent

### Responsibility
Set up project infrastructure, API layer, types, hooks, and core utilities.

### Owned Directories (EXCLUSIVE)
```
frontend/
├── src/
│   ├── api/              # ALL files
│   ├── types/            # ALL files
│   ├── hooks/            # ALL files
│   ├── utils/            # ALL files
│   ├── contexts/         # ALL files
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite types
├── Dockerfile
├── nginx.conf
├── .dockerignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
└── .env.example
```

### Tasks (In Order)

#### Phase 1: Project Setup
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A1-001 | Create package.json with all dependencies | package.json | P0 |
| A1-002 | Configure TypeScript | tsconfig.json | P0 |
| A1-003 | Configure Vite with path aliases | vite.config.ts | P0 |
| A1-004 | Configure Tailwind CSS | tailwind.config.js, postcss.config.js | P0 |
| A1-005 | Create index.css with Tailwind | src/index.css | P0 |
| A1-006 | Create entry point | src/main.tsx | P0 |
| A1-007 | Create Docker configuration | Dockerfile, nginx.conf, .dockerignore | P0 |
| A1-008 | Create environment example | .env.example | P0 |
| A1-009 | Configure ESLint | .eslintrc.cjs | P1 |
| A1-010 | Configure Prettier | .prettierrc | P1 |

#### Phase 1: Core Architecture
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A1-011 | Create API client | src/api/client.ts | P0 |
| A1-012 | Create API endpoints | src/api/endpoints.ts | P0 |
| A1-013 | Create common types | src/types/common.ts | P0 |
| A1-014 | Create job types | src/types/job.ts | P0 |
| A1-015 | Create company types | src/types/company.ts | P0 |
| A1-016 | Create parser types | src/types/parser.ts | P0 |
| A1-017 | Create stats types | src/types/stats.ts | P0 |
| A1-018 | Create types index | src/types/index.ts | P0 |
| A1-019 | Create useJobs hook | src/hooks/useJobs.ts | P0 |
| A1-020 | Create useCompanies hook | src/hooks/useCompanies.ts | P0 |
| A1-021 | Create useStats hook | src/hooks/useStats.ts | P0 |
| A1-022 | Create useParser hook | src/hooks/useParser.ts | P0 |
| A1-023 | Create hooks index | src/hooks/index.ts | P0 |
| A1-024 | Create formatters utility | src/utils/formatters.ts | P0 |
| A1-025 | Create constants | src/utils/constants.ts | P0 |
| A1-026 | Create helpers | src/utils/helpers.ts | P1 |
| A1-027 | Create utils index | src/utils/index.ts | P1 |

#### Phase 1: App Setup
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A1-028 | Create App.tsx with routing | src/App.tsx | P0 |
| A1-029 | Create QueryClient provider | src/main.tsx (update) | P0 |
| A1-030 | Create ThemeContext | src/contexts/ThemeContext.tsx | P1 |

### Completion Criteria
- [ ] `npm install` succeeds
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] Docker build succeeds
- [ ] All types are exported
- [ ] All hooks return typed data
- [ ] API client connects to backend

---

## AGENT 2: Components Agent

### Responsibility
Build all reusable UI components, layout system, and analytics visualizations.

### Owned Directories (EXCLUSIVE)
```
frontend/src/components/
├── ui/                   # ALL files
├── layout/               # ALL files
├── analytics/            # ALL files
└── settings/             # ALL files
```

### Tasks (In Order)

#### Phase 1: Base UI Components
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A2-001 | Create Button component | src/components/ui/Button.tsx | P0 |
| A2-002 | Create Card component | src/components/ui/Card.tsx | P0 |
| A2-003 | Create Badge component | src/components/ui/Badge.tsx | P0 |
| A2-004 | Create Spinner component | src/components/ui/Spinner.tsx | P0 |
| A2-005 | Create Input component | src/components/ui/Input.tsx | P0 |
| A2-006 | Create Select component | src/components/ui/Select.tsx | P0 |
| A2-007 | Create SearchInput component | src/components/ui/SearchInput.tsx | P0 |
| A2-008 | Create Table component | src/components/ui/Table.tsx | P0 |
| A2-009 | Create Pagination component | src/components/ui/Pagination.tsx | P0 |
| A2-010 | Create EmptyState component | src/components/ui/EmptyState.tsx | P0 |
| A2-011 | Create Skeleton component | src/components/ui/Skeleton.tsx | P0 |
| A2-012 | Create Modal component | src/components/ui/Modal.tsx | P1 |
| A2-013 | Create Alert component | src/components/ui/Alert.tsx | P1 |
| A2-014 | Create UI components index | src/components/ui/index.ts | P0 |

#### Phase 1: Layout Components
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A2-015 | Create Sidebar component | src/components/layout/Sidebar.tsx | P0 |
| A2-016 | Create Header component | src/components/layout/Header.tsx | P0 |
| A2-017 | Create Layout component | src/components/layout/Layout.tsx | P0 |
| A2-018 | Create PageHeader component | src/components/layout/PageHeader.tsx | P0 |
| A2-019 | Create layout index | src/components/layout/index.ts | P0 |

#### Phase 2-3: Analytics Components
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A2-020 | Create SalaryDistributionChart | src/components/analytics/SalaryDistributionChart.tsx | P1 |
| A2-021 | Create LocationPieChart | src/components/analytics/LocationPieChart.tsx | P1 |
| A2-022 | Create IndustryBarChart | src/components/analytics/IndustryBarChart.tsx | P1 |
| A2-023 | Create SalaryStatsCard | src/components/analytics/SalaryStatsCard.tsx | P1 |
| A2-024 | Create analytics index | src/components/analytics/index.ts | P1 |

#### Phase 3: Settings Components
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A2-025 | Create ThemeToggle component | src/components/settings/ThemeToggle.tsx | P2 |
| A2-026 | Create ApiInfo component | src/components/settings/ApiInfo.tsx | P2 |
| A2-027 | Create settings index | src/components/settings/index.ts | P2 |

### Completion Criteria
- [ ] All components render without errors
- [ ] All components accept className prop
- [ ] All components are typed
- [ ] All components follow coding standards
- [ ] Layout works with sidebar toggle
- [ ] Charts render with sample data

### Dependencies
- **Requires from Agent 1:** types/common.ts, utils/formatters.ts, tailwind.config.js

### Interface Contract with Agent 3

Agent 2 provides these component interfaces:

```tsx
// Button
<Button variant="primary|secondary|danger" size="sm|md|lg" loading? disabled? onClick?>

// Card
<Card title? subtitle? className?>{children}</Card>

// Badge
<Badge variant="success|warning|error|info|default">{children}</Badge>

// Table
<Table columns={Column[]} data={any[]} loading? emptyMessage?>

// Pagination
<Pagination page total perPage onPageChange>

// Layout
<Layout>{children}</Layout>

// PageHeader
<PageHeader title description? actions?>
```

---

## AGENT 3: Features Agent

### Responsibility
Build all feature-specific components and page compositions.

### Owned Directories (EXCLUSIVE)
```
frontend/src/
├── components/
│   ├── dashboard/        # ALL files
│   ├── jobs/             # ALL files
│   ├── companies/        # ALL files
│   └── parser/           # ALL files
└── pages/                # ALL files
```

### Tasks (In Order)

#### Phase 2: Dashboard Module
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A3-001 | Create StatCard component | src/components/dashboard/StatCard.tsx | P0 |
| A3-002 | Create StatsGrid component | src/components/dashboard/StatsGrid.tsx | P0 |
| A3-003 | Create ParserStatusCard | src/components/dashboard/ParserStatusCard.tsx | P0 |
| A3-004 | Create QuickActions component | src/components/dashboard/QuickActions.tsx | P0 |
| A3-005 | Create LocationChart component | src/components/dashboard/LocationChart.tsx | P0 |
| A3-006 | Create RecentActivity component | src/components/dashboard/RecentActivity.tsx | P1 |
| A3-007 | Create dashboard index | src/components/dashboard/index.ts | P0 |
| A3-008 | Create Dashboard page | src/pages/Dashboard.tsx | P0 |

#### Phase 2-3: Jobs Module
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A3-009 | Create JobsTable component | src/components/jobs/JobsTable.tsx | P0 |
| A3-010 | Create JobRow component | src/components/jobs/JobRow.tsx | P0 |
| A3-011 | Create JobFilters component | src/components/jobs/JobFilters.tsx | P0 |
| A3-012 | Create JobsHeader component | src/components/jobs/JobsHeader.tsx | P0 |
| A3-013 | Create JobDetailView component | src/components/jobs/JobDetailView.tsx | P0 |
| A3-014 | Create JobSalaryBadge component | src/components/jobs/JobSalaryBadge.tsx | P1 |
| A3-015 | Create JobMetadata component | src/components/jobs/JobMetadata.tsx | P1 |
| A3-016 | Create jobs index | src/components/jobs/index.ts | P0 |
| A3-017 | Create Jobs page | src/pages/Jobs.tsx | P0 |
| A3-018 | Create JobDetail page | src/pages/JobDetail.tsx | P0 |

#### Phase 3: Companies Module
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A3-019 | Create CompanyCard component | src/components/companies/CompanyCard.tsx | P1 |
| A3-020 | Create CompanyList component | src/components/companies/CompanyList.tsx | P1 |
| A3-021 | Create CompanyHeader component | src/components/companies/CompanyHeader.tsx | P1 |
| A3-022 | Create CompanyJobs component | src/components/companies/CompanyJobs.tsx | P1 |
| A3-023 | Create companies index | src/components/companies/index.ts | P1 |
| A3-024 | Create Companies page | src/pages/Companies.tsx | P1 |
| A3-025 | Create CompanyDetail page | src/pages/CompanyDetail.tsx | P1 |

#### Phase 3: Parser Module
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A3-026 | Create ParserStatus component | src/components/parser/ParserStatus.tsx | P1 |
| A3-027 | Create ParserControls component | src/components/parser/ParserControls.tsx | P1 |
| A3-028 | Create LastRunSummary component | src/components/parser/LastRunSummary.tsx | P1 |
| A3-029 | Create HistoryTable component | src/components/parser/HistoryTable.tsx | P1 |
| A3-030 | Create RunStatusBadge component | src/components/parser/RunStatusBadge.tsx | P1 |
| A3-031 | Create parser index | src/components/parser/index.ts | P1 |
| A3-032 | Create Parser page | src/pages/Parser.tsx | P1 |
| A3-033 | Create ParserHistory page | src/pages/ParserHistory.tsx | P1 |

#### Phase 3-4: Additional Pages
| Task ID | Task | Files | Priority |
|---------|------|-------|----------|
| A3-034 | Create Analytics page | src/pages/Analytics.tsx | P1 |
| A3-035 | Create Settings page | src/pages/Settings.tsx | P2 |
| A3-036 | Create pages index | src/pages/index.ts | P0 |

### Completion Criteria
- [ ] Dashboard displays live stats
- [ ] Jobs list shows data with pagination
- [ ] Job detail page displays all info
- [ ] Companies list works
- [ ] Parser controls trigger API
- [ ] All pages use Layout component

### Dependencies
- **Requires from Agent 1:** All hooks, all types, App.tsx with routes
- **Requires from Agent 2:** All UI components, Layout component

---

## Parallel Execution Schedule

```
Timeline:
─────────────────────────────────────────────────────────────────

Phase 1 (Foundation):
  Agent 1: [████████████████] Setup + API + Types + Hooks
  Agent 2: [████████████████] UI Components + Layout
  Agent 3: [    waiting...  ]

Phase 2 (Core Features):
  Agent 1: [████] App.tsx routing + Context
  Agent 2: [████████] Complete UI + Start Analytics
  Agent 3: [████████████████] Dashboard + Jobs

Phase 3 (Extended Features):
  Agent 1: [██] Polish + Fixes
  Agent 2: [████████] Analytics + Settings
  Agent 3: [████████████████] Companies + Parser + Pages

Phase 4 (Integration):
  All:     [████████] Testing + Docker + Final polish

─────────────────────────────────────────────────────────────────
```

---

## File Conflict Prevention Rules

### Rule 1: Exclusive Directory Ownership
Each agent owns specific directories. **NEVER** create or modify files outside your owned directories.

### Rule 2: Import Contracts
- Agent 2 & 3 import from Agent 1's files (types, hooks, utils)
- Agent 3 imports from Agent 2's files (ui, layout components)
- Agent 1 & 2 **never** import from Agent 3's files

### Rule 3: Index Files
Each agent creates index.ts files for their directories to re-export.

### Rule 4: No Shared Files
- No two agents modify the same file
- Exception: Only Agent 1 modifies App.tsx (routing)

### Rule 5: Communication via Types
Agents communicate through TypeScript interfaces defined by Agent 1.

---

## Dependency Graph

```
Agent 1 (Foundation)
    │
    ├── types/* ──────────────────┐
    │                              │
    ├── hooks/* ──────────────────┤
    │                              │
    ├── utils/* ──────────────────┤
    │                              ▼
    │                        ┌─────────────┐
    │                        │   Agent 3   │
    │                        │  (Features) │
    │                        └─────────────┘
    │                              ▲
    │                              │
    └── App.tsx (routes) ─────────┘
                                   │
Agent 2 (Components)               │
    │                              │
    ├── ui/* ─────────────────────┤
    │                              │
    └── layout/* ─────────────────┘
```

---

## Communication Protocol

### Handoff Points

1. **Agent 1 → Agent 2 & 3**: After completing types, hooks, utils
   - Signal: Create `src/types/index.ts` with all exports

2. **Agent 2 → Agent 3**: After completing UI and Layout
   - Signal: Create `src/components/ui/index.ts` and `src/components/layout/index.ts`

3. **All Agents → Integration**: After completing all tasks
   - Signal: Update PROGRESS.md with "COMPLETE" status

### Blocking Issues
If an agent is blocked:
1. Document in PROGRESS.md
2. Create placeholder/mock for missing dependency
3. Continue with non-blocked tasks
