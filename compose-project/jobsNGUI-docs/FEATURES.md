# Feature Specifications
# jobsNGUI - Complete Feature List

**Version:** 1.0
**Date:** January 23, 2026

---

## Feature Index

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| F01 | Job Listing | P0 | Planned |
| F02 | Job Details | P0 | Planned |
| F03 | Search | P0 | Planned |
| F04 | Category Filter | P0 | Planned |
| F05 | Pagination | P0 | Planned |
| F06 | Language Switch | P0 | Planned |
| F07 | Share Jobs | P0 | Planned |
| F08 | Responsive Design | P0 | Planned |
| F09 | Dark/Light Theme | P0 | Planned |
| F10 | PWA Support | P0 | Planned |
| F11 | Region Filter | P1 | Planned |
| F12 | Salary Filter | P1 | Planned |
| F13 | VIP Highlighting | P1 | Planned |
| F14 | NEW Badge | P1 | Planned |
| F15 | Saved Jobs | P1 | Planned |
| F16 | Search History | P1 | Planned |
| F17 | Analytics Tracking | P1 | Planned |
| F18 | SEO Optimization | P0 | Planned |
| F19 | Offline Support | P1 | Planned |
| F20 | Keyboard Navigation | P1 | Planned |

---

## F01: Job Listing

### Description
Main page displaying a searchable, filterable list of active job postings.

### Current Implementation (Existing Frontend)
- Table-based layout with columns: Title, Company, Published, Deadline
- 30 items per page
- URL-based filter state
- Loading spinner during fetch

### New Implementation Requirements

#### Visual Design
- Card-based layout (mobile-first)
- Optional: List view toggle for desktop
- Skeleton loading states
- Empty state with illustration

#### Data Display
| Field | Required | Notes |
|-------|----------|-------|
| Job Title | Yes | Max 2 lines, truncate with ellipsis |
| Company Name | Yes | Single line |
| Location | Yes | City/Region name |
| Published Date | Yes | Relative format ("2 days ago") |
| Deadline | If available | Relative or absolute |
| Salary Indicator | If has_salary | Green badge with icon |
| VIP Badge | If is_vip | Orange highlight |
| NEW Badge | If < 48 hours | Red badge |

#### Interactions
- Click card → Navigate to job details
- Hover card → Subtle lift effect
- Click badge → No action (informational)

#### API Integration
```typescript
GET /api/v1/jobs
Query params:
  - page: number (default: 1)
  - page_size: number (default: 30)
  - status: "active"
  - q: string (search query)
  - category: string (category slug)
  - lid: number (region ID, optional)
  - has_salary: boolean (optional)

Response:
{
  items: Job[],
  total: number,
  pages: number,
  page: number
}
```

#### Acceptance Criteria
- [ ] Jobs display in card format on mobile
- [ ] VIP jobs have distinct visual treatment
- [ ] NEW badge shows for jobs < 48 hours old
- [ ] Salary indicator shows for jobs with salary
- [ ] Loading skeleton appears during fetch
- [ ] Empty state shows when no jobs found
- [ ] Total job count displayed

---

## F02: Job Details

### Description
Dedicated page showing complete information about a single job posting.

### Current Implementation
- Full-width layout
- Metadata section with grid
- Formatted job description
- Share buttons
- Source link

### New Implementation Requirements

#### Visual Design
- Clean, readable layout
- Sticky header with back button
- Metadata in organized sections
- Full-width on mobile, centered on desktop

#### Data Display
| Section | Fields |
|---------|--------|
| Header | Title, Company, Badges (VIP, Salary, Remote) |
| Metadata | Location, Category, Published, Deadline, Salary |
| Description | Full HTML content (sanitized) |
| Source | Original posting link |
| Actions | Share buttons, Save button |

#### Interactions
- Back button → Return to list (preserve filters)
- Share button → Open share menu
- Source link → Open in new tab
- Save button → Toggle saved state

#### API Integration
```typescript
GET /api/v1/jobs/{jobId}

Response:
{
  id: number,
  title_ge: string,
  title_en: string,
  company_name: string,
  location: string,
  category_name_ge: string,
  category_name_en: string,
  body_ge: string,
  body_en: string,
  salary_min: number | null,
  salary_max: number | null,
  is_vip: boolean,
  has_salary: boolean,
  published_at: string,
  deadline: string | null,
  source_url: string,
  source_name: string
}
```

#### Acceptance Criteria
- [ ] All job information displays correctly
- [ ] Description renders HTML safely
- [ ] Back button preserves list state
- [ ] Share buttons work on all devices
- [ ] Page has proper meta tags for SEO/sharing

---

## F03: Search

### Description
Full-text search across job titles and content.

### Current Implementation
- Single input field
- Immediate search on submit
- URL parameter: `?q=`

### New Implementation Requirements

#### Visual Design
- Prominent search bar in header or hero section
- Search icon inside input
- Clear button when has value
- Search suggestions dropdown (future)

#### Behavior
- Debounced input (300ms)
- Minimum 2 characters to search
- URL updates with search term
- Results count shown
- "No results" state with suggestions

#### Keyboard Shortcuts
- `/` - Focus search input
- `Escape` - Clear and blur
- `Enter` - Submit search

#### Acceptance Criteria
- [ ] Search triggers after 300ms of typing
- [ ] Results update without page reload
- [ ] URL reflects search term
- [ ] Clear button resets search
- [ ] Empty results show helpful message

---

## F04: Category Filter

### Description
Filter jobs by category/industry.

### Current Implementation
- Dropdown select element
- "All Categories" default option
- URL parameter: `?category=`

### New Implementation Requirements

#### Visual Design
- Styled dropdown/select component
- Category count badges (optional)
- Mobile: Full-width select
- Desktop: Dropdown with search (optional)

#### Data Source
```typescript
GET /api/v1/categories

Response: Category[]
{
  id: number,
  slug: string,
  name_ge: string,
  name_en: string,
  jobsge_cid: number
}
```

#### Acceptance Criteria
- [ ] All categories display in correct language
- [ ] Selection updates job list
- [ ] URL reflects selected category
- [ ] "All Categories" clears filter
- [ ] Works with other filters (AND logic)

---

## F05: Pagination

### Description
Navigate through pages of job results.

### Current Implementation
- Page numbers with Previous/Next
- 30 items per page
- Shows page range (max 10 visible)
- URL parameter: `?page=`

### New Implementation Requirements

#### Visual Design
- Centered pagination controls
- Previous/Next with icons
- Current page highlighted
- Total pages indicator
- Mobile: Simplified (prev/next only)

#### Behavior
- URL updates on page change
- Scroll to top on page change
- Preserve other filters
- Disable buttons at boundaries

#### Acceptance Criteria
- [ ] Page navigation works correctly
- [ ] URL updates with page number
- [ ] Other filters preserved
- [ ] Mobile shows simplified version
- [ ] Scroll to top on page change

---

## F06: Language Switch

### Description
Toggle between Georgian and English interface.

### Current Implementation
- GE/EN toggle in header
- URL-based: `/ge/` and `/en/`
- Persists in URL structure

### New Implementation Requirements

#### Visual Design
- Toggle button or dropdown
- Current language indicated
- Flag icons optional
- Accessible labels

#### Behavior
- Switch URL structure
- Persist preference in localStorage
- All UI text changes
- Job content uses language-specific fields

#### Translations Required
```typescript
const translations = {
  ge: {
    search: "ძიება",
    allCategories: "ყველა კატეგორია",
    jobs: "ვაკანსია",
    found: "ნაპოვნია",
    noJobs: "ვაკანსიები ვერ მოიძებნა",
    previous: "წინა",
    next: "შემდეგი",
    location: "მდებარეობა",
    category: "კატეგორია",
    published: "გამოქვეყნდა",
    deadline: "ბოლო ვადა",
    salary: "ანაზღაურება",
    source: "წყარო",
    viewOriginal: "ორიგინალის ნახვა",
    share: "გაზიარება",
    new: "ახალი",
    vip: "VIP",
    savedJobs: "შენახული",
    darkMode: "მუქი თემა",
    lightMode: "ნათელი თემა",
    copyLink: "ბმულის კოპირება",
    copied: "კოპირებულია!",
    loading: "იტვირთება...",
    error: "შეცდომა",
    retry: "ხელახლა ცდა"
  },
  en: {
    search: "Search",
    allCategories: "All Categories",
    jobs: "jobs",
    found: "found",
    noJobs: "No jobs found",
    previous: "Previous",
    next: "Next",
    location: "Location",
    category: "Category",
    published: "Published",
    deadline: "Deadline",
    salary: "Salary",
    source: "Source",
    viewOriginal: "View Original",
    share: "Share",
    new: "NEW",
    vip: "VIP",
    savedJobs: "Saved Jobs",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    copyLink: "Copy Link",
    copied: "Copied!",
    loading: "Loading...",
    error: "Error",
    retry: "Retry"
  }
};
```

#### Acceptance Criteria
- [ ] Language toggle visible in header
- [ ] All UI text translates
- [ ] Job content uses correct language field
- [ ] Preference persists across sessions
- [ ] URL reflects current language

---

## F07: Share Jobs

### Description
Share job postings via social media and copy link.

### Current Implementation
- Facebook, Telegram, WhatsApp, LinkedIn, Copy
- Circular icon buttons
- Toast notification on copy

### New Implementation Requirements

#### Share Methods
| Platform | URL Template |
|----------|--------------|
| Facebook | `https://www.facebook.com/sharer/sharer.php?u={url}` |
| Telegram | `https://t.me/share/url?url={url}&text={title}` |
| WhatsApp | `https://wa.me/?text={title}%20{url}` |
| LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url={url}` |
| Copy | Clipboard API |
| Native | navigator.share (mobile) |

#### Visual Design
- Icon buttons with platform colors
- Tooltip labels
- Copy confirmation with checkmark
- Share sheet on mobile (native)

#### Acceptance Criteria
- [ ] All share buttons work correctly
- [ ] Copy shows success feedback
- [ ] Mobile uses native share when available
- [ ] Share URLs include job title and link

---

## F08: Responsive Design

### Description
Fully responsive layout for all device sizes.

### Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640-1024px | 2 columns |
| Desktop | > 1024px | 3 columns, sidebar |

### Mobile Optimizations
- Bottom navigation (optional)
- Swipe gestures (optional)
- Touch-friendly tap targets (44px min)
- Simplified pagination
- Collapsible filters

### Acceptance Criteria
- [ ] No horizontal scroll on any device
- [ ] Touch targets meet minimum size
- [ ] Text readable without zoom
- [ ] Forms usable on mobile keyboard

---

## F09: Dark/Light Theme

### Description
User-selectable color theme with system preference detection.

### Implementation
```typescript
// Theme provider
type Theme = 'light' | 'dark' | 'system';

function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const resolved = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;

    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
```

### Acceptance Criteria
- [ ] Theme toggle in header
- [ ] System preference detection
- [ ] Preference persists
- [ ] No flash on page load
- [ ] All components support both themes

---

## F10: PWA Support

### Description
Progressive Web App capabilities for installability and offline support.

### Manifest Configuration
```json
{
  "name": "Georgia Jobs - ვაკანსიები საქართველოში",
  "short_name": "Georgia Jobs",
  "description": "Find jobs in Georgia",
  "start_url": "/ge/",
  "display": "standalone",
  "theme_color": "#4ECDC4",
  "background_color": "#0F172A",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Features
- Cache static assets
- Cache API responses (categories, regions)
- Offline fallback page
- Background sync (future)
- Push notifications (future)

### Acceptance Criteria
- [ ] App installable on mobile/desktop
- [ ] Offline page shows when disconnected
- [ ] Assets cached for instant load
- [ ] Icon appears correctly

---

## F11: Region Filter

### Description
Filter jobs by geographic region.

### Data Source
```typescript
GET /api/v1/regions

Response: Region[]
{
  id: number,
  slug: string,
  name_ge: string,
  name_en: string,
  jobsge_lid: number
}
```

### Common Regions
| lid | Name (EN) | Name (GE) |
|-----|-----------|-----------|
| 1 | Tbilisi | თბილისი |
| 14 | Adjara | აჭარა |
| 8 | Imereti | იმერეთი |
| 17 | Remote | დისტანციური |

### Acceptance Criteria
- [ ] Region dropdown works correctly
- [ ] Combines with other filters
- [ ] URL reflects selection

---

## F12: Salary Filter

### Description
Toggle to show only jobs with salary information.

### Implementation
- Checkbox or toggle switch
- URL parameter: `?has_salary=true`
- Combines with other filters

### Acceptance Criteria
- [ ] Toggle filters job list
- [ ] State persists in URL
- [ ] Works with other filters

---

## F13: VIP Highlighting

### Description
Visual distinction for premium/VIP job postings.

### Visual Treatment
- Orange/gold accent color
- Border or background highlight
- "VIP" badge
- Optional: Subtle animation

### Acceptance Criteria
- [ ] VIP jobs visually distinct
- [ ] Consistent across list and detail views

---

## F14: NEW Badge

### Description
Indicator for recently posted jobs.

### Logic
```typescript
function isNew(publishedAt: string): boolean {
  const published = new Date(publishedAt);
  const now = new Date();
  const hours = (now - published) / (1000 * 60 * 60);
  return hours < 48;
}
```

### Acceptance Criteria
- [ ] Badge shows for jobs < 48 hours old
- [ ] Badge visible in list view
- [ ] Correct timezone handling

---

## F15: Saved Jobs (Local)

### Description
Bookmark jobs locally for later viewing.

### Implementation
- Save to localStorage
- Heart/bookmark icon
- Saved jobs page/section
- Sync indicator (future)

### Data Structure
```typescript
interface SavedJob {
  id: number;
  title: string;
  company: string;
  savedAt: string;
}

// localStorage key: 'savedJobs'
```

### Acceptance Criteria
- [ ] Save/unsave toggle works
- [ ] Saved state persists
- [ ] Saved jobs viewable in list
- [ ] Remove from saved works

---

## F16: Search History

### Description
Store recent search queries for quick access.

### Implementation
- Store last 10 searches
- Show on search focus
- Click to re-search
- Clear history option

### Data Structure
```typescript
interface SearchHistoryItem {
  query: string;
  timestamp: string;
  resultCount: number;
}

// localStorage key: 'searchHistory'
```

### Acceptance Criteria
- [ ] Recent searches stored
- [ ] Shown on input focus
- [ ] Click executes search
- [ ] Clear history works

---

## F17: Analytics Tracking

### Description
Track user interactions for analytics.

### Events to Track
| Event | Data |
|-------|------|
| page_view | url, title, language |
| job_view | job_id |
| search | query, filters, result_count |
| job_click | job_id, position |
| share | platform, job_id |
| save | job_id |

### Implementation
```typescript
async function trackEvent(event: string, data: object) {
  const payload = {
    event,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: currentLanguage,
    ...data
  };

  navigator.sendBeacon('/api/v1/analytics/track', JSON.stringify(payload));
}
```

### Acceptance Criteria
- [ ] Events tracked correctly
- [ ] Session persists across pages
- [ ] No blocking on navigation

---

## F18: SEO Optimization

### Description
Search engine optimization for discoverability.

### Requirements
- Proper meta tags per page
- Open Graph tags
- Structured data (JSON-LD)
- Semantic HTML
- Sitemap generation

### Meta Tags Template
```html
<title>{jobTitle} - {companyName} | Georgia Jobs</title>
<meta name="description" content="{jobDescription}" />
<meta property="og:title" content="{jobTitle}" />
<meta property="og:description" content="{jobDescription}" />
<meta property="og:url" content="{pageUrl}" />
<meta property="og:type" content="website" />
<link rel="canonical" href="{canonicalUrl}" />
```

### Acceptance Criteria
- [ ] All pages have unique meta tags
- [ ] OG tags work for social sharing
- [ ] Proper heading hierarchy

---

## F19: Offline Support

### Description
Graceful handling of offline state.

### Features
- Detect online/offline status
- Show offline indicator
- Display cached content
- Queue actions for sync

### Acceptance Criteria
- [ ] Offline state detected
- [ ] User notified of offline mode
- [ ] Cached jobs viewable
- [ ] Graceful error handling

---

## F20: Keyboard Navigation

### Description
Full keyboard accessibility.

### Shortcuts
| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Escape` | Close modal/clear |
| `Enter` | Select/confirm |
| `Tab` | Navigate elements |
| `Arrow keys` | Navigate lists |
| `j/k` | Next/prev job (optional) |

### Acceptance Criteria
- [ ] All features accessible via keyboard
- [ ] Focus visible at all times
- [ ] Logical tab order
- [ ] Skip links available

---

*Feature specifications maintained by BA Team*
*Last updated: January 23, 2026*
