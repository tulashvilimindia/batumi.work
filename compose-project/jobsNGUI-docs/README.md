# jobsNGUI Documentation
# Next Generation Job Board Frontend

**Version:** 2.0
**Date:** January 23, 2026
**Status:** Documentation Complete - Ready for Implementation
**Layout:** Table-based (matching current frontend)

---

## Overview

**jobsNGUI** is a modern React-based frontend replacement for the existing vanilla JavaScript public website at batumi.work. This documentation package contains all specifications needed to build the new frontend.

### Goals
- Table-based layout (preserving current jobs.ge-style UI)
- Dark and Light theme support with system detection
- Bilingual (Georgian/English)
- PWA capabilities
- Mobile-first responsive design
- All 52 existing features preserved
- 13 new features added

---

## Documentation Index

### Core Documentation (6 files)

| Document | Description |
|----------|-------------|
| [PRD.md](PRD.md) | Product Requirements Document - Goals, features, timeline |
| [FEATURE_COMPARISON.md](FEATURE_COMPARISON.md) | **52 existing features + 13 new features with full comparison** |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | **Complete color schema (Light + Dark), table layout, components** |
| [FEATURES.md](FEATURES.md) | Detailed feature specifications (20 features) |
| [PAGES.md](PAGES.md) | Page layouts and wireframes |
| [WIREFRAMES.md](WIREFRAMES.md) | Detailed visual wireframes and component specs |
| [USER_FLOWS.md](USER_FLOWS.md) | User journeys and interaction flows |

### Technical Documentation (6 files)

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | **FULL API specification (2000+ lines) - endpoints, types, errors, caching** |
| [API_CONTRACT.md](API_CONTRACT.md) | Backend API integration summary with TypeScript types |
| [TECH_STACK.md](TECH_STACK.md) | Technology recommendations and rationale |
| [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) | Project organization and Docker config |
| [COMPONENTS.md](COMPONENTS.md) | Detailed component library specifications |
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | State architecture and patterns |

### Implementation Documentation (4 files)

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION_SEQUENCE.md](IMPLEMENTATION_SEQUENCE.md) | **90 steps with exact order, API mapping, testing strategy** |
| [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | Development phases and milestones |
| [TESTING_STRATEGY.md](TESTING_STRATEGY.md) | Testing approach, tools, and examples |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | WCAG 2.1 AA compliance guidelines |

**Total: 18 documentation files**

---

## Quick Reference

### Key URLs
| Environment | URL |
|-------------|-----|
| Production (current) | https://batumi.work |
| API Documentation | https://batumi.work/docs |
| Admin Panel | http://38.242.143.10:20001 |

### Container Info
| Property | Value |
|----------|-------|
| Container Name | `jobsNGUI` or `jobboard-web-ng` |
| Internal Port | 80 |
| External Port | 8103 (configurable) |
| Base Image | nginx:alpine |

---

## Feature Summary

### Existing Features (52 total) - All Preserved

| Category | Features |
|----------|----------|
| Job Listing | Table layout, 4 columns, pagination, sorting |
| Job Detail | Full info, formatted body, source link, related jobs |
| Search & Filter | Full-text search, category dropdown, URL state |
| Sharing | Facebook, Telegram, WhatsApp, LinkedIn, Copy Link |
| Visual | VIP highlighting, NEW badge, Salary indicator |
| PWA | Installable, offline support, service worker |
| i18n | Georgian (GE), English (EN) |
| SEO | Meta tags, Open Graph, sitemap, robots.txt |
| Analytics | Page views, job views, search, clicks |

### New Features (13 total)

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | Dark/Light Theme Toggle | P0 | Manual theme switching |
| 2 | System Theme Detection | P0 | Auto-detect OS preference |
| 3 | Region Filter | P1 | Filter by Adjara regions |
| 4 | Salary Filter Toggle | P1 | Show only jobs with salary |
| 5 | Saved Jobs (Local) | P1 | Save jobs to localStorage |
| 6 | Saved Jobs Page | P1 | View all saved jobs |
| 7 | Search History | P1 | Recent searches dropdown |
| 8 | Keyboard Shortcuts | P1 | j/k navigation, / search |
| 9 | Skip Links (A11y) | P1 | Skip to main content |
| 10 | Focus Indicators | P1 | Visible focus outlines |
| 11 | Skeleton Loading | P1 | Loading state animations |
| 12 | Share Event Tracking | P2 | Track share button clicks |
| 13 | Save Event Tracking | P2 | Track save/unsave actions |

---

## Table-Based Layout

The frontend uses a **table-based layout** matching the current jobs.ge-style design:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ განცხადება         │ კომპანია       │ გამოქვეყნდა    │ ბოლო ვადა         │
│ (Job Title)        │ (Company)      │ (Published)    │ (Deadline)        │
│ 45%                │ 25%            │ 15%            │ 15%               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Software Developer │ TechCorp LLC   │ 20 იანვარი     │ 15 თებერვალი      │
│ [NEW] [₾]          │                │                │                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ UI Designer [VIP]  │ DesignHub      │ 19 იანვარი     │ -                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mobile Layout:** Hides date columns (Title 60%, Company 40%)

---

## Color Schema

### Light Theme (Matches Current Frontend)
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#4ECDC4` | Brand, buttons |
| Background | `#f5f5f5` | Page background |
| Surface | `#ffffff` | Table background |
| Text Primary | `#333333` | Main text |
| VIP | `#cc6600` | VIP job titles |
| NEW Badge | `#ff6b6b` | NEW badge |
| Salary | `#28a745` | Salary indicator |

### Dark Theme (New)
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#5EEAD4` | Brand, buttons |
| Background | `#0f172a` | Page background |
| Surface | `#1e293b` | Table background |
| Text Primary | `#f1f5f9` | Main text |
| VIP | `#fb923c` | VIP job titles |
| NEW Badge | `#fb7185` | NEW badge |
| Salary | `#34d399` | Salary indicator |

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State (Server) | TanStack Query 5 |
| State (Client) | Zustand 4 |
| Routing | React Router 6 |
| i18n | i18next |
| Icons | Lucide React |
| Testing | Vitest, Testing Library, Playwright |

---

## API Overview

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full details.

### Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/jobs` | GET | List jobs with filters |
| `/api/v1/jobs/{id}` | GET | Get job details |
| `/api/v1/categories` | GET | List all categories |
| `/api/v1/regions` | GET | List all regions |
| `/api/v1/analytics/track` | POST | Track events |
| `/api/v1/stats` | GET | Get statistics |
| `/api/v1/health` | GET | Health check |

### Key Features
- Pagination (default 30 per page, max 100)
- Full-text search with highlighting
- Category and region filtering
- Salary and VIP filtering
- Rate limiting (100 req/min)
- Caching headers (5 min for jobs, 1 hour for categories)

---

## Implementation Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Foundation (Vite, TypeScript, Tailwind, Theme, i18n) | Week 1 |
| 2 | Core Pages (Job list, Job detail, Search, Filters) | Weeks 2-3 |
| 3 | Features (Sharing, Pagination, PWA, Saved jobs) | Week 4 |
| 4 | Polish (Animations, Error states, A11y, Testing) | Week 5 |
| 5 | Launch (Deployment, Monitoring, Documentation) | Week 6 |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle Size (gzip) | < 200KB |
| WCAG Compliance | AA |
| Browser Support | Last 2 versions |

---

## File Structure

```
jobsNGUI-docs/
├── README.md                    # This index file
├── PRD.md                       # Product requirements
├── FEATURE_COMPARISON.md        # 52 existing + 13 new features
├── DESIGN_SYSTEM.md             # Complete color schema & components
├── FEATURES.md                  # Feature specifications
├── PAGES.md                     # Page layouts
├── WIREFRAMES.md                # Visual wireframes
├── USER_FLOWS.md                # User journeys
├── API_DOCUMENTATION.md         # FULL API specification
├── API_CONTRACT.md              # API summary
├── TECH_STACK.md                # Technology stack
├── FOLDER_STRUCTURE.md          # Project structure
├── COMPONENTS.md                # Component library
├── STATE_MANAGEMENT.md          # State patterns
├── IMPLEMENTATION_ROADMAP.md    # Development phases
├── TESTING_STRATEGY.md          # Testing approach
└── ACCESSIBILITY.md             # WCAG guidelines
```

---

## Related Documentation

- [Main README](../README.md) - Project overview
- [AGENT_ONBOARDING.md](../AGENT_ONBOARDING.md) - Developer onboarding
- [SESSION_NOTES.md](../SESSION_NOTES.md) - Project history

---

## Contact

For questions about this documentation:
- GitHub: https://github.com/tulashvilimindia/batumi.work
- Project: batumi.work

---

*Documentation created by Architecture & UI/UX Team*
*Last updated: January 23, 2026*
