# Product Requirements Document (PRD)
# jobsNGUI - Next Generation Job Board Frontend

**Version:** 1.0
**Date:** January 23, 2026
**Author:** UI/UX & BA Team
**Status:** Planning Phase

---

## 1. Executive Summary

### 1.1 Product Vision
jobsNGUI is a modern, minimal, and performant React-based frontend for the Georgia JobBoard (batumi.work). It replaces the existing vanilla JavaScript frontend with a component-based architecture while maintaining all existing features and adding modern UX enhancements.

### 1.2 Goals
- **Modern Stack**: React 18+, TypeScript, Tailwind CSS
- **Dual Theme**: Dark and Light mode support
- **Performance**: Sub-2-second initial load, instant navigation
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile-First**: Responsive design with touch optimization
- **SEO**: Server-side rendering ready, proper meta tags
- **PWA**: Installable, offline-capable application
- **Bilingual**: Full Georgian and English support

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bounce Rate | < 40% |
| Mobile Usability | 100% |

---

## 2. Target Users

### 2.1 Primary Users
1. **Job Seekers (Georgian)**
   - Age: 18-55
   - Looking for jobs in Georgia
   - Primary language: Georgian
   - Device: 70% mobile, 30% desktop

2. **Job Seekers (International)**
   - Expats, tourists seeking work
   - Primary language: English
   - Device: 60% mobile, 40% desktop

### 2.2 User Personas

**Persona 1: Nino (25, Georgian)**
- Recent university graduate
- Searching for IT jobs in Batumi
- Uses smartphone primarily
- Wants quick access to new jobs
- Values salary transparency

**Persona 2: Alex (35, Expat)**
- English-speaking professional
- Looking for remote or tourism jobs
- Uses laptop and phone equally
- Needs English interface
- Shares jobs with friends

---

## 3. Feature Requirements

### 3.1 Core Features (Must Have - P0)

| ID | Feature | Description |
|----|---------|-------------|
| F01 | Job Listing | Paginated list of active jobs with search and filters |
| F02 | Job Details | Full job information with formatted description |
| F03 | Search | Full-text search across job titles and content |
| F04 | Category Filter | Filter jobs by category |
| F05 | Pagination | Navigate through job pages |
| F06 | Language Switch | Toggle between Georgian and English |
| F07 | Share Jobs | Share via social media and copy link |
| F08 | Responsive Design | Works on all device sizes |
| F09 | Dark/Light Theme | User-selectable theme |
| F10 | PWA Support | Installable, offline-capable |

### 3.2 Enhanced Features (Should Have - P1)

| ID | Feature | Description |
|----|---------|-------------|
| F11 | Region Filter | Filter jobs by region/city |
| F12 | Salary Filter | Show only jobs with salary |
| F13 | VIP Highlight | Visual distinction for VIP jobs |
| F14 | Recent Badge | "NEW" indicator for recent jobs |
| F15 | Saved Jobs | Bookmark jobs locally |
| F16 | Search History | Recent searches stored locally |
| F17 | Infinite Scroll | Option for continuous scrolling |
| F18 | Job Alerts | Subscribe to job notifications |

### 3.3 Nice to Have (P2)

| ID | Feature | Description |
|----|---------|-------------|
| F19 | Advanced Filters | Combine multiple filters |
| F20 | Sort Options | Sort by date, salary, relevance |
| F21 | Map View | Jobs on interactive map |
| F22 | Company Pages | List jobs by company |
| F23 | Similar Jobs | Recommendations on job detail |
| F24 | Email Digest | Weekly job summary emails |

---

## 4. Functional Requirements

### 4.1 Job Listing Page

**Purpose:** Main page displaying searchable, filterable job listings

**Requirements:**
1. Display jobs in a clean list/card format
2. Show: Job title, Company name, Location, Published date, Salary indicator
3. Highlight VIP jobs with distinct styling
4. Show "NEW" badge for jobs < 48 hours old
5. Support pagination (30 items per page default)
6. URL reflects current filters (shareable links)
7. Persist filter state on navigation
8. Show total job count
9. Empty state when no results found
10. Loading skeleton during data fetch

**Acceptance Criteria:**
- [ ] Jobs load within 2 seconds
- [ ] Filters update URL without page reload
- [ ] Pagination is accessible via keyboard
- [ ] Mobile layout shows essential info only
- [ ] VIP jobs are visually distinct

### 4.2 Job Detail Page

**Purpose:** Display complete information about a single job

**Requirements:**
1. Show full job title and company name
2. Display all metadata (location, category, dates, salary)
3. Render formatted job description (supports paragraphs, lists)
4. Show job badges (VIP, Has Salary, Remote)
5. Provide share buttons (Facebook, Telegram, WhatsApp, LinkedIn, Copy)
6. Link to original source
7. Back navigation to job list (preserves filters)
8. SEO-friendly URL structure

**Acceptance Criteria:**
- [ ] Job loads within 1 second
- [ ] Description renders HTML safely
- [ ] Share buttons work on mobile
- [ ] Back button preserves search state
- [ ] Page has proper meta tags

### 4.3 Search & Filtering

**Purpose:** Help users find relevant jobs quickly

**Requirements:**
1. Real-time search input with debouncing (300ms)
2. Category dropdown with all available categories
3. Optional: Region dropdown
4. Optional: Salary toggle
5. Clear filters button
6. Search results update without page reload
7. "No results" message with suggestions

**Acceptance Criteria:**
- [ ] Search triggers after 300ms of inactivity
- [ ] Filters combine with AND logic
- [ ] URL updates reflect all active filters
- [ ] Clearing filters resets to default view

### 4.4 Theme System

**Purpose:** Provide visual comfort for all users

**Requirements:**
1. Light theme (default for first visit)
2. Dark theme option
3. System preference detection
4. User preference persistence (localStorage)
5. Smooth theme transition animation
6. All components support both themes

**Acceptance Criteria:**
- [ ] Theme toggle is accessible
- [ ] Preference persists across sessions
- [ ] No flash of wrong theme on load
- [ ] All text meets contrast requirements

### 4.5 Language/Localization

**Purpose:** Serve both Georgian and English speakers

**Requirements:**
1. All UI text translatable
2. Language switcher in header
3. Preference persistence
4. URL structure: `/ge/` and `/en/`
5. Date formatting per locale
6. RTL support ready (future)

**Supported Languages:**
- Georgian (ge) - Primary
- English (en) - Secondary

**Acceptance Criteria:**
- [ ] All static text is translated
- [ ] Dynamic content uses correct language field
- [ ] Dates format correctly per locale
- [ ] Language preference persists

### 4.6 PWA Features

**Purpose:** Enable app-like experience

**Requirements:**
1. Web app manifest with icons
2. Service worker for caching
3. Offline page fallback
4. Install prompt on supported browsers
5. Push notification support (future)
6. Background sync for saved jobs (future)

**Acceptance Criteria:**
- [ ] App is installable on mobile
- [ ] Offline page shows when disconnected
- [ ] Static assets cached for instant load
- [ ] App icon appears correctly

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Initial load: < 3 seconds on 3G
- Time to Interactive: < 5 seconds
- Bundle size: < 200KB gzipped (main chunk)
- Images: WebP with fallbacks, lazy loading

### 5.2 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Focus management on navigation
- Color contrast ratio: > 4.5:1

### 5.3 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### 5.4 Security
- XSS prevention (sanitize HTML)
- HTTPS only
- No sensitive data in localStorage
- CSP headers configured

### 5.5 SEO
- Server-side rendering (or pre-rendering)
- Proper meta tags per page
- Open Graph tags for sharing
- Structured data (JSON-LD)
- Sitemap generation

---

## 6. Technical Constraints

### 6.1 Must Use
- React 18+
- TypeScript
- Tailwind CSS (for styling)
- React Router (for navigation)

### 6.2 Recommended
- Vite (build tool)
- TanStack Query (data fetching)
- Zustand or Jotai (state management)
- Framer Motion (animations)
- i18next (internationalization)

### 6.3 Avoid
- Heavy component libraries (Material UI, Ant Design)
- Server-side dependencies (keep it static/client-side)
- Complex state management (Redux)

---

## 7. Dependencies

### 7.1 API Dependencies
- GET `/api/v1/jobs` - Job listings
- GET `/api/v1/jobs/{id}` - Job details
- GET `/api/v1/categories` - Category list
- GET `/api/v1/regions` - Region list (optional)
- POST `/api/v1/analytics/track` - Event tracking

### 7.2 External Services
- None required (self-contained)

---

## 8. Deployment

### 8.1 Container
- Name: `jobsNGUI` or `jobboard-web-ng`
- Port: 8080 (internal) → configurable external
- Base image: nginx:alpine
- Build: Multi-stage (Node for build, nginx for serve)

### 8.2 Environment Variables
```env
VITE_API_URL=/api/v1
VITE_ANALYTICS_ENABLED=true
VITE_DEFAULT_LANGUAGE=ge
```

---

## 9. Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Foundation | 1 week | Project setup, routing, theme system |
| Phase 2: Core Pages | 2 weeks | Job list, job detail, search |
| Phase 3: Features | 1 week | Filters, sharing, PWA |
| Phase 4: Polish | 1 week | Animations, accessibility, testing |
| Phase 5: Launch | 1 week | Deployment, monitoring, docs |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API changes | High | Version API endpoints |
| Browser compatibility | Medium | Progressive enhancement |
| Performance issues | High | Bundle analysis, code splitting |
| SEO degradation | High | Pre-rendering, meta tags |

---

## 11. Appendix

### 11.1 Glossary
- **VIP Job**: Premium job listing with enhanced visibility
- **PWA**: Progressive Web App
- **SSR**: Server-Side Rendering
- **i18n**: Internationalization

### 11.2 References
- Current website: https://batumi.work
- API documentation: https://batumi.work/docs
- Design inspiration: Indeed, LinkedIn Jobs, Glassdoor

---

*Document maintained by UI/UX & BA Team*
*Last updated: January 23, 2026*
