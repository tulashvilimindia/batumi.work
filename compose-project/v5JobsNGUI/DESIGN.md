# აჭარული სამუშაოები V5 - Enhanced Folk Edition

## Vision
Building upon the warm Adjarian folk foundation of v4, v5 introduces 10 powerful features designed by a product expert with 100+ product experience. Focus on engagement, discoverability, and mobile-first UX while preserving the cultural essence.

---

## V5 New Features

### Feature 1: Smart Search Autocomplete
Real-time search suggestions as user types, showing:
- Recent searches (localStorage)
- Popular job titles
- Company name matches
- Category suggestions

### Feature 2: Similar Jobs Recommendation
"Jobs Like This" section on job detail page:
- Same category jobs
- Similar salary range
- Same region
- Recent postings first

### Feature 3: Recently Viewed Jobs
Track last 10 viewed jobs:
- localStorage persistence
- Quick access from header
- Clear history option

### Feature 4: Telegram Job Alerts
Deep link integration for job alerts:
- "Get alerts for similar jobs" button
- Link to @batumi_work_bot
- Pre-filled category/region filters

### Feature 5: Salary Insights
Visual salary information:
- Salary range badge (if available)
- "With Salary" filter enhancement
- Salary indicator on job cards

### Feature 6: Quick Apply
Streamlined application flow:
- Direct link to source
- "Apply" button prominence
- Copy job link feature

### Feature 7: Swipe-to-Save (Mobile)
Touch gestures for mobile:
- Swipe right to save
- Swipe left to dismiss
- Visual feedback on swipe

### Feature 8: Company Mini-Profiles
Company information display:
- Company name prominence
- Job count by company (if available)
- Link to all jobs from company

### Feature 9: Job Freshness Indicator
Enhanced "new job" indicators:
- "Just Posted" (< 2h)
- "Today" (< 24h)
- "New" (< 48h)
- FOMO: "X people viewed"

### Feature 10: Dark Mode with Folk Theme
Night-friendly color scheme:
- Deep walnut backgrounds
- Warm gold accents
- Preserved folk aesthetic
- System preference detection

---

## Color Palette (Inherited from V4)

### Primary Folk Colors
```
--folk-red: #8B2635          /* Traditional costume red - Acharuli dance */
--folk-red-light: #A83C4B    /* Lighter accent red */
--folk-red-dark: #6B1D29     /* Deep burgundy */
--folk-brown: #6B4423        /* Wooden architecture */
--folk-cream: #F5E6D3        /* Natural fabric/wool */
--folk-green: #2D5A3D        /* Mountain forests */
--folk-gold: #D4A574         /* Warmth and hospitality */
--folk-walnut: #3D2914       /* Dark wood, traditional furniture */
--folk-terracotta: #C4785A   /* Clay pottery */
--folk-honey: #E8B86D        /* Adjarian honey */
```

### Dark Mode Colors (NEW)
```
--dark-bg: #1A1410           /* Deep walnut night */
--dark-card: #2D2218         /* Card background */
--dark-text: #F5E6D3         /* Cream text on dark */
--dark-gold: #E8B86D         /* Warm gold accent */
--dark-border: #4A3728       /* Subtle borders */
```

---

## Progress Tracking

### Phase 1: Infrastructure Setup
- [x] Copy from v4 base
- [x] Configure for /v5 path
- [x] Update docker-compose
- [x] Update nginx config
- [x] Implement dark mode theme

### Phase 2: Quick Wins
- [x] Recently Viewed Jobs store
- [x] Recently Viewed Jobs UI
- [x] Enhanced freshness indicators
- [x] Dark mode CSS variables

### Phase 3: Search Enhancement
- [x] Smart Search Autocomplete
- [x] Recent searches storage
- [x] Search suggestions UI

### Phase 4: Job Detail Enhancements
- [x] Similar Jobs section
- [x] Quick Apply button
- [x] Telegram alerts link
- [ ] Salary insights display

### Phase 5: Mobile Experience
- [ ] Swipe gestures (react-swipeable)
- [ ] Touch feedback
- [x] Mobile-optimized views

### Phase 6: Company Features
- [ ] Company mini-profiles
- [ ] Jobs by company filter

---

## Implementation Notes

### localStorage Keys
```
v5-recent-views: Job[]     // Last 10 viewed jobs
v5-recent-searches: string[] // Last 5 searches
v5-theme: 'light' | 'dark' | 'system'
v5-saved-jobs: string[]    // Job IDs (existing)
```

### API Endpoints Used
- GET /api/v1/jobs - Job listing with filters
- GET /api/v1/jobs/:id - Job detail
- GET /api/v1/categories - Category list
- GET /api/v1/regions - Region list

---

## Design Philosophy (V5 Enhanced)

1. **Engagement First** - Keep users exploring with recommendations
2. **Mobile Native** - Touch gestures, not just responsive
3. **Return Visitors** - Recently viewed, search history
4. **Action Oriented** - Clear CTAs, easy apply
5. **Cultural Warmth** - Preserve Adjarian soul even in dark mode

---

*V5 Enhanced Folk Edition - Built on V4 Foundation*
