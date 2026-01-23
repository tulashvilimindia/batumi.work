# Implementation Roadmap
# jobsNGUI - Development Phases & Milestones

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Overview

This document outlines the implementation phases for the jobsNGUI React frontend, from project setup to production deployment. Each phase includes specific deliverables, dependencies, and acceptance criteria.

---

## 2. Phase Summary

| Phase | Name | Focus | Key Deliverables |
|-------|------|-------|------------------|
| 0 | Project Setup | Infrastructure | Vite, TypeScript, tooling |
| 1 | Foundation | Core structure | Routing, layout, themes |
| 2 | Components | UI library | Base components, design system |
| 3 | Features | Business logic | Jobs, search, filters |
| 4 | Enhancement | UX polish | i18n, PWA, analytics |
| 5 | Testing | Quality | Unit tests, E2E, accessibility |
| 6 | Deployment | Production | Docker, CI/CD, monitoring |

---

## 3. Phase 0: Project Setup

### 3.1 Objectives
- Initialize React + TypeScript + Vite project
- Configure development tooling
- Set up version control integration

### 3.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 0.1 | Create Vite + React + TypeScript project | High | - |
| 0.2 | Configure TypeScript (tsconfig.json) | High | 0.1 |
| 0.3 | Set up path aliases (@/) | High | 0.2 |
| 0.4 | Install and configure Tailwind CSS | High | 0.1 |
| 0.5 | Configure PostCSS + Autoprefixer | High | 0.4 |
| 0.6 | Set up ESLint + Prettier | High | 0.1 |
| 0.7 | Configure Husky + lint-staged | Medium | 0.6 |
| 0.8 | Create folder structure | High | 0.1 |
| 0.9 | Set up environment variables | Medium | 0.1 |
| 0.10 | Add .gitignore entries | Low | 0.1 |

### 3.3 Deliverables

```
jobsNGUI/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
└── .env.example
```

### 3.4 Acceptance Criteria
- [ ] `npm run dev` starts dev server successfully
- [ ] `npm run build` produces production build
- [ ] `npm run lint` runs without errors
- [ ] Path aliases resolve correctly (@/...)
- [ ] Tailwind classes work in components

---

## 4. Phase 1: Foundation

### 4.1 Objectives
- Implement application shell
- Set up routing structure
- Create theme system

### 4.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 1.1 | Install React Router DOM | High | Phase 0 |
| 1.2 | Create route configuration | High | 1.1 |
| 1.3 | Implement Layout component | High | 1.2 |
| 1.4 | Create Header component (basic) | High | 1.3 |
| 1.5 | Create Footer component | Medium | 1.3 |
| 1.6 | Define CSS custom properties (themes) | High | Phase 0 |
| 1.7 | Create theme store (Zustand) | High | 1.6 |
| 1.8 | Implement ThemeToggle component | High | 1.7 |
| 1.9 | Add system theme detection | Medium | 1.7 |
| 1.10 | Create Container component | Medium | 1.3 |
| 1.11 | Set up 404 page | Low | 1.2 |

### 4.3 Deliverables

```
src/
├── App.tsx (with RouterProvider)
├── components/
│   └── layout/
│       ├── Layout.tsx
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Container.tsx
│       └── index.ts
├── pages/
│   ├── HomePage.tsx (placeholder)
│   ├── NotFoundPage.tsx
│   └── index.ts
├── stores/
│   └── themeStore.ts
├── styles/
│   └── themes.css
└── constants/
    └── routes.ts
```

### 4.4 Acceptance Criteria
- [ ] Routes navigate correctly (/, /job/:id, /saved)
- [ ] Layout wraps all pages
- [ ] Theme toggle switches light/dark
- [ ] Theme persists in localStorage
- [ ] System preference detected on first load

---

## 5. Phase 2: Component Library

### 5.1 Objectives
- Build reusable UI components
- Implement design system tokens
- Ensure accessibility from start

### 5.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 2.1 | Create utility function (cn) | High | Phase 0 |
| 2.2 | Implement Button component | High | 2.1 |
| 2.3 | Implement Input component | High | 2.1 |
| 2.4 | Implement Select component | High | 2.1 |
| 2.5 | Implement Badge component | Medium | 2.1 |
| 2.6 | Implement Card component | Medium | 2.1 |
| 2.7 | Implement Skeleton component | Medium | 2.1 |
| 2.8 | Implement Spinner component | Medium | 2.1 |
| 2.9 | Create Toast system | Medium | 2.1 |
| 2.10 | Add EmptyState component | Medium | 2.1 |
| 2.11 | Add ErrorState component | Medium | 2.1 |
| 2.12 | Add LoadingState component | Medium | 2.1 |

### 5.3 Deliverables

```
src/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Skeleton.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   └── index.ts
└── common/
    ├── EmptyState.tsx
    ├── ErrorState.tsx
    ├── LoadingState.tsx
    └── index.ts
```

### 5.4 Acceptance Criteria
- [ ] All components support dark/light themes
- [ ] Button has all variants (primary, secondary, ghost, outline, danger)
- [ ] Input has focus states and error state
- [ ] Select dropdown works with keyboard
- [ ] Skeleton shows shimmer animation
- [ ] Toast appears and auto-dismisses
- [ ] All components are keyboard accessible

---

## 6. Phase 3: Core Features

### 6.1 Objectives
- Implement API integration
- Build job listing functionality
- Create search and filter system

### 6.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 3.1 | Install TanStack Query | High | Phase 1 |
| 3.2 | Create API client (fetch wrapper) | High | 3.1 |
| 3.3 | Implement jobs API functions | High | 3.2 |
| 3.4 | Create useJobs hook | High | 3.3 |
| 3.5 | Create useJob hook | High | 3.3 |
| 3.6 | Implement categories API | High | 3.2 |
| 3.7 | Implement regions API | High | 3.2 |
| 3.8 | Create useFilters hook (URL state) | High | Phase 1 |
| 3.9 | Build JobCard component | High | 3.4 |
| 3.10 | Build JobList component | High | 3.9 |
| 3.11 | Build JobDetail component | High | 3.5 |
| 3.12 | Create SearchBar component | High | 3.8 |
| 3.13 | Create CategoryFilter component | High | 3.6, 3.8 |
| 3.14 | Create RegionFilter component | High | 3.7, 3.8 |
| 3.15 | Create SalaryToggle component | Medium | 3.8 |
| 3.16 | Build FilterBar (combines filters) | High | 3.12-3.15 |
| 3.17 | Implement Pagination component | High | 3.8 |
| 3.18 | Build HomePage with all features | High | 3.10, 3.16, 3.17 |
| 3.19 | Build JobDetailPage | High | 3.11 |
| 3.20 | Implement saved jobs store | Medium | Phase 1 |
| 3.21 | Build SavedJobsPage | Medium | 3.20 |
| 3.22 | Create JobBadges component | Medium | 3.9 |
| 3.23 | Create JobMetadata component | Medium | 3.9 |
| 3.24 | Implement HTML sanitization | High | 3.11 |

### 6.3 Deliverables

```
src/
├── api/
│   ├── client.ts
│   ├── jobs.ts
│   ├── categories.ts
│   ├── regions.ts
│   └── types.ts
├── hooks/
│   ├── useJobs.ts
│   ├── useJob.ts
│   ├── useCategories.ts
│   ├── useRegions.ts
│   ├── useFilters.ts
│   ├── useSavedJobs.ts
│   ├── useDebounce.ts
│   └── index.ts
├── components/
│   ├── job/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobDetail.tsx
│   │   ├── JobBadges.tsx
│   │   ├── JobMetadata.tsx
│   │   └── index.ts
│   └── search/
│       ├── SearchBar.tsx
│       ├── CategoryFilter.tsx
│       ├── RegionFilter.tsx
│       ├── SalaryToggle.tsx
│       ├── FilterBar.tsx
│       └── index.ts
├── pages/
│   ├── HomePage.tsx
│   ├── JobDetailPage.tsx
│   └── SavedJobsPage.tsx
├── stores/
│   └── savedJobsStore.ts
├── lib/
│   ├── utils.ts
│   ├── sanitize.ts
│   └── date.ts
└── types/
    ├── job.ts
    ├── category.ts
    ├── region.ts
    └── index.ts
```

### 6.4 Acceptance Criteria
- [ ] Jobs load from API and display
- [ ] Search filters jobs by query
- [ ] Category filter works
- [ ] Region filter works
- [ ] Salary toggle filters jobs with salary
- [ ] Pagination navigates pages
- [ ] URL reflects current filters
- [ ] Browser back/forward works
- [ ] Job detail page shows full description
- [ ] Saved jobs persist in localStorage
- [ ] Empty states show when no results
- [ ] Loading skeletons show during fetch
- [ ] Error states show on API failure

---

## 7. Phase 4: Enhancements

### 7.1 Objectives
- Add internationalization
- Implement PWA features
- Add analytics tracking
- Build share functionality

### 7.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 4.1 | Install i18next + react-i18next | High | Phase 1 |
| 4.2 | Create i18n configuration | High | 4.1 |
| 4.3 | Create Georgian translations | High | 4.2 |
| 4.4 | Create English translations | High | 4.2 |
| 4.5 | Implement LanguageSwitch component | High | 4.2 |
| 4.6 | Update routing for language prefix | High | 4.2 |
| 4.7 | Add language persistence | Medium | 4.5 |
| 4.8 | Create ShareButtons component | Medium | Phase 3 |
| 4.9 | Create CopyLinkButton component | Medium | 4.8 |
| 4.10 | Implement analytics API | Medium | Phase 3 |
| 4.11 | Create session ID management | Medium | 4.10 |
| 4.12 | Track page views | Medium | 4.10, 4.11 |
| 4.13 | Track job views | Medium | 4.10, 4.11 |
| 4.14 | Track search events | Low | 4.10, 4.11 |
| 4.15 | Create PWA manifest | Medium | Phase 0 |
| 4.16 | Implement service worker | Medium | 4.15 |
| 4.17 | Add offline fallback page | Low | 4.16 |
| 4.18 | Create PWA icons | Low | 4.15 |
| 4.19 | Add meta tags for SEO | Medium | 4.2 |

### 7.3 Deliverables

```
src/
├── i18n/
│   ├── config.ts
│   ├── locales/
│   │   ├── ge.json
│   │   └── en.json
│   └── index.ts
├── components/
│   ├── common/
│   │   └── LanguageSwitch.tsx
│   └── share/
│       ├── ShareButtons.tsx
│       ├── CopyLinkButton.tsx
│       └── index.ts
├── api/
│   └── analytics.ts
├── lib/
│   └── session.ts
├── pages/
│   └── OfflinePage.tsx
public/
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

### 7.4 Acceptance Criteria
- [ ] Language switch changes UI text
- [ ] Language persists across sessions
- [ ] URL includes language prefix (/:lang/)
- [ ] Share buttons open respective platforms
- [ ] Copy link shows confirmation
- [ ] Analytics events fire correctly
- [ ] PWA is installable
- [ ] Offline page shows when no connection
- [ ] Meta tags update per page

---

## 8. Phase 5: Testing & Quality

### 8.1 Objectives
- Write unit tests for critical components
- Add accessibility tests
- Implement E2E tests for key flows
- Ensure code quality

### 8.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 5.1 | Install Vitest + Testing Library | High | Phase 0 |
| 5.2 | Configure test environment | High | 5.1 |
| 5.3 | Install MSW for API mocking | High | 5.1 |
| 5.4 | Create mock handlers | High | 5.3 |
| 5.5 | Write Button component tests | High | 5.2 |
| 5.6 | Write Input component tests | High | 5.2 |
| 5.7 | Write JobCard tests | High | 5.2 |
| 5.8 | Write JobList tests | High | 5.2 |
| 5.9 | Write useJobs hook tests | High | 5.4 |
| 5.10 | Write useFilters hook tests | High | 5.2 |
| 5.11 | Install jest-axe for a11y tests | Medium | 5.1 |
| 5.12 | Add accessibility tests | Medium | 5.11 |
| 5.13 | Install Playwright | Low | Phase 4 |
| 5.14 | Write E2E: Job listing flow | Low | 5.13 |
| 5.15 | Write E2E: Search flow | Low | 5.13 |
| 5.16 | Write E2E: Job detail flow | Low | 5.13 |
| 5.17 | Set up coverage reporting | Medium | 5.1 |
| 5.18 | Configure CI test pipeline | Medium | 5.17 |

### 8.3 Deliverables

```
jobsNGUI/
├── src/
│   └── __tests__/
│       ├── setup.ts
│       ├── mocks/
│       │   └── handlers.ts
│       ├── components/
│       │   ├── Button.test.tsx
│       │   ├── Input.test.tsx
│       │   ├── JobCard.test.tsx
│       │   └── JobList.test.tsx
│       └── hooks/
│           ├── useJobs.test.ts
│           └── useFilters.test.ts
├── e2e/
│   ├── job-listing.spec.ts
│   ├── search.spec.ts
│   └── job-detail.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

### 8.4 Acceptance Criteria
- [ ] `npm test` runs all unit tests
- [ ] Test coverage > 70% for components
- [ ] All accessibility tests pass
- [ ] E2E tests pass on CI
- [ ] No ESLint errors
- [ ] No TypeScript errors

---

## 9. Phase 6: Deployment

### 9.1 Objectives
- Create production Docker image
- Integrate with docker-compose
- Set up CI/CD pipeline
- Configure monitoring

### 9.2 Tasks

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| 6.1 | Create Dockerfile | High | Phase 4 |
| 6.2 | Create nginx.conf | High | 6.1 |
| 6.3 | Optimize production build | High | 6.1 |
| 6.4 | Add to docker-compose.yml | High | 6.1 |
| 6.5 | Configure API proxy | High | 6.2 |
| 6.6 | Set up health check | Medium | 6.1 |
| 6.7 | Create staging environment | Medium | 6.4 |
| 6.8 | Configure production environment | High | 6.7 |
| 6.9 | Set up GitHub Actions CI | Medium | Phase 5 |
| 6.10 | Add build + test workflow | Medium | 6.9 |
| 6.11 | Add deployment workflow | Medium | 6.9, 6.8 |
| 6.12 | Configure caching headers | Low | 6.2 |
| 6.13 | Add gzip/brotli compression | Low | 6.2 |
| 6.14 | Set up error monitoring (optional) | Low | 6.8 |
| 6.15 | Performance audit (Lighthouse) | Medium | 6.8 |
| 6.16 | Create runbook documentation | Low | 6.8 |

### 9.3 Deliverables

```
jobsNGUI/
├── Dockerfile
├── nginx.conf
├── .dockerignore
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml

compose-project/
└── docker-compose.yml (updated)
```

### 9.4 Acceptance Criteria
- [ ] Docker image builds successfully
- [ ] Container starts and serves app
- [ ] API proxy routes correctly
- [ ] Health check endpoint responds
- [ ] CI pipeline passes
- [ ] Staging deployment works
- [ ] Production deployment works
- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB gzipped

---

## 10. Milestone Summary

| Milestone | Phases | Key Outcome |
|-----------|--------|-------------|
| M1: Foundation | 0, 1 | Project setup, routing, themes |
| M2: MVP | 2, 3 | Working job board with search |
| M3: Complete | 4 | i18n, PWA, analytics, share |
| M4: Production | 5, 6 | Tested, deployed, monitored |

---

## 11. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API contract changes | High | Low | Version API, maintain contract docs |
| Performance issues | Medium | Medium | Bundle analysis, lazy loading |
| Browser compatibility | Low | Low | Use supported features, polyfills |
| Accessibility gaps | Medium | Medium | Test with screen readers early |
| Translation issues | Low | Medium | Native speaker review |

---

## 12. Definition of Done

A feature is considered complete when:

1. **Code**
   - [ ] TypeScript compiles without errors
   - [ ] ESLint passes with no warnings
   - [ ] Code follows project conventions

2. **Testing**
   - [ ] Unit tests written and passing
   - [ ] Accessibility audit passes
   - [ ] Manual QA completed

3. **Documentation**
   - [ ] Component props documented
   - [ ] README updated if needed

4. **Review**
   - [ ] Code review approved
   - [ ] Design review passed

5. **Deployment**
   - [ ] Works in staging environment
   - [ ] No console errors

---

## 13. Development Guidelines

### Git Workflow
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

### PR Requirements
- Descriptive title
- Link to task/issue
- Screenshots for UI changes
- Passing CI checks

---

*Implementation roadmap maintained by Engineering Team*
*Last updated: January 23, 2026*
