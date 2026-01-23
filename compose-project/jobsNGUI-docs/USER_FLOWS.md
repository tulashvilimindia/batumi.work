# User Flows & Journey Maps
# jobsNGUI - User Experience Documentation

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Primary User Flows

### 1.1 Job Search Flow

**Goal:** User wants to find relevant job opportunities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JOB SEARCH FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Land on │───▶│  Enter   │───▶│  View    │───▶│  Browse  │          │
│  │  Homepage│    │  Search  │    │  Results │    │  Jobs    │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│       │                │                │              │                 │
│       │                │                │              │                 │
│       ▼                ▼                ▼              ▼                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │ See all  │    │ Results  │    │ Apply    │    │ Click    │          │
│  │ jobs     │    │ update   │    │ filters  │    │ job card │          │
│  │ (default)│    │ instantly│    │ (refine) │    │          │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│                                                        │                 │
│                                                        ▼                 │
│                                                  ┌──────────┐           │
│                                                  │  View    │           │
│                                                  │  Job     │           │
│                                                  │  Details │           │
│                                                  └──────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Steps:**
1. User lands on homepage
2. User sees list of active jobs
3. User enters search term (optional)
4. Results update with debounce (300ms)
5. User applies filters (category, region, salary)
6. URL updates to reflect filters
7. User browses filtered results
8. User clicks on job card
9. User views job details

**Success Metrics:**
- Search-to-click rate > 30%
- Average time to first click < 30 seconds
- Filter usage rate > 20%

---

### 1.2 Job Detail Viewing Flow

**Goal:** User wants to learn about a specific job

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         JOB DETAIL FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                           │
│  │  Click   │───▶│  Page    │───▶│  Read    │                           │
│  │  Job Card│    │  Loads   │    │  Details │                           │
│  └──────────┘    └──────────┘    └──────────┘                           │
│                                        │                                 │
│                         ┌──────────────┼──────────────┐                 │
│                         │              │              │                  │
│                         ▼              ▼              ▼                  │
│                   ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│                   │  Share   │  │  Save    │  │  View    │              │
│                   │  Job     │  │  Job     │  │  Original│              │
│                   └──────────┘  └──────────┘  └──────────┘              │
│                         │              │              │                  │
│                         ▼              ▼              ▼                  │
│                   ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│                   │ Select   │  │ Saved to │  │ Opens    │              │
│                   │ Platform │  │ Local    │  │ jobs.ge  │              │
│                   └──────────┘  └──────────┘  └──────────┘              │
│                                                                          │
│                   ┌──────────┐                                           │
│                   │  Go Back │◀── User can return to                    │
│                   │  to List │    list with filters                     │
│                   └──────────┘    preserved                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Steps:**
1. User clicks job card from list
2. Page navigates to job detail
3. Job information loads
4. User reads job description
5. User can:
   - Share via social media
   - Save job locally
   - View original posting
   - Go back to job list

**Success Metrics:**
- Average time on detail page > 30 seconds
- Share rate > 5%
- Save rate > 10%
- Original source click rate > 15%

---

### 1.3 Language Switch Flow

**Goal:** User wants to change interface language

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       LANGUAGE SWITCH FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Click   │───▶│ Language │───▶│  URL     │───▶│   UI     │          │
│  │  GE/EN   │    │ Toggle   │    │ Updates  │    │ Updates  │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│                                        │                                 │
│                                        ▼                                 │
│                                  ┌──────────┐                            │
│                                  │ Pref     │                            │
│                                  │ Saved    │                            │
│                                  │ (localStorage)                        │
│                                  └──────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- `/ge/` → `/en/` (and vice versa)
- All filters preserved
- Preference stored in localStorage
- Job content switches to appropriate language field

---

### 1.4 Theme Toggle Flow

**Goal:** User wants to switch between light and dark mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         THEME TOGGLE FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │ First    │───▶│  Check   │───▶│  Apply   │───▶│  Display │          │
│  │ Visit    │    │  System  │    │  Theme   │    │  UI      │          │
│  └──────────┘    │  Pref    │    └──────────┘    └──────────┘          │
│                  └──────────┘                                            │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                           │
│  │  Click   │───▶│  Toggle  │───▶│  Pref    │                           │
│  │  Moon/   │    │  Theme   │    │  Saved   │                           │
│  │  Sun     │    │          │    │ (local)  │                           │
│  └──────────┘    └──────────┘    └──────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Theme Cascade:**
1. User preference (localStorage) - highest priority
2. System preference (prefers-color-scheme)
3. Default (light)

---

### 1.5 Save Job Flow

**Goal:** User wants to bookmark a job for later

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SAVE JOB FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  View    │───▶│  Click   │───▶│  Job     │───▶│  Toast   │          │
│  │  Job     │    │  Save    │    │  Stored  │    │  Shown   │          │
│  │  Detail  │    │  Button  │    │  (local) │    │  ✓ Saved │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                           │
│  │  Go to   │───▶│  View    │───▶│  Click   │                           │
│  │  Saved   │    │  Saved   │    │  to View │                           │
│  │  Jobs    │    │  List    │    │  Details │                           │
│  └──────────┘    └──────────┘    └──────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Data Stored:**
```typescript
{
  id: number,
  title: string,
  company: string,
  savedAt: ISO timestamp
}
```

---

### 1.6 Share Job Flow

**Goal:** User wants to share a job with others

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SHARE JOB FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐                                           │
│  │  View    │───▶│  Click   │                                           │
│  │  Job     │    │  Share   │                                           │
│  │  Detail  │    │  Area    │                                           │
│  └──────────┘    └──────────┘                                           │
│                       │                                                  │
│       ┌───────────────┼───────────────┬───────────────┐                 │
│       ▼               ▼               ▼               ▼                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│  │ Facebook │   │ Telegram │   │ WhatsApp │   │ Copy Link│             │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘             │
│       │               │               │               │                  │
│       ▼               ▼               ▼               ▼                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│  │ Opens    │   │ Opens    │   │ Opens    │   │ Copied   │             │
│  │ FB Share │   │ TG Share │   │ WA Share │   │ Toast ✓  │             │
│  │ Dialog   │   │ Dialog   │   │ Dialog   │   │          │             │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘             │
│                                                                          │
│  Mobile only:                                                            │
│  ┌──────────┐   ┌──────────┐                                            │
│  │ Native   │──▶│ System   │                                            │
│  │ Share    │   │ Share    │                                            │
│  │ Button   │   │ Sheet    │                                            │
│  └──────────┘   └──────────┘                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey Maps

### 2.1 Job Seeker Journey (Nino - Georgian User)

```
AWARENESS    CONSIDERATION    DECISION    RETENTION
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Finds   │  │ Searches│  │ Reads   │  │ Returns │
│ site via│  │ for IT  │  │ job     │  │ daily   │
│ Telegram│  │ jobs    │  │ details │  │ to check│
└─────────┘  └─────────┘  └─────────┘  └─────────┘
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Touchpoint│ │Touchpoint│ │Touchpoint│ │Touchpoint│
│ Landing │  │ Search + │  │ Detail  │  │ PWA /   │
│ Page    │  │ Filters │  │ Page    │  │ Bookmark│
└─────────┘  └─────────┘  └─────────┘  └─────────┘
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Emotion │  │ Emotion │  │ Emotion │  │ Emotion │
│ Curious │  │ Hopeful │  │ Excited │  │ Loyal   │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Pain Point│ │Pain Point│ │Pain Point│ │Pain Point│
│ Too many │  │ Results │  │ Missing │  │ No new  │
│ sites   │  │ not     │  │ salary  │  │ job     │
│          │  │ relevant│  │ info    │  │ alerts  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Opportunity│ │Opportunity│ │Opportunity│ │Opportunity│
│ Clean,  │  │ Smart   │  │ Show    │  │ PWA     │
│ simple  │  │ filters │  │ salary  │  │ Push    │
│ design  │  │          │  │ when    │  │ notifs  │
│          │  │          │  │ available│ │ (future)│
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### 2.2 Expat User Journey (Alex - English User)

```
AWARENESS    CONSIDERATION    DECISION    RETENTION
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Google  │  │ Switches│  │ Applies │  │ Shares  │
│ search  │  │ to      │  │ filter  │  │ with    │
│"jobs    │  │ English │  │ for     │  │ expat   │
│ georgia"│  │ (EN)    │  │ Batumi  │  │ friends │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Touchpoint│ │Touchpoint│ │Touchpoint│ │Touchpoint│
│ SEO /   │  │ Language│  │ Region  │  │ Share   │
│ Landing │  │ Switch  │  │ Filter  │  │ Buttons │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
    │              │              │            │
    ▼              ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Emotion │  │ Emotion │  │ Emotion │  │ Emotion │
│ Relieved│  │ Comfortable│ │ Focused │  │ Helpful │
│(English │  │(native  │  │(local   │  │(sharing │
│ content)│  │ language)│ │ results)│  │ value)  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## 3. Error & Edge Case Flows

### 3.1 No Results Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│  No      │───▶│  Show    │
│  Searches│    │  Results │    │  Empty   │
│          │    │  Found   │    │  State   │
└──────────┘    └──────────┘    └──────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
               ┌──────────┐   ┌──────────┐   ┌──────────┐
               │ Suggest  │   │ Clear    │   │ Browse   │
               │ Different│   │ Filters  │   │ All      │
               │ Search   │   │ Button   │   │ Jobs     │
               └──────────┘   └──────────┘   └──────────┘
```

**Empty State Content:**
- Friendly illustration
- "No jobs found for '[query]'"
- Suggestions:
  - Try different keywords
  - Clear filters
  - Browse all jobs
- Quick action buttons

### 3.2 Loading Error Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Page    │───▶│  API     │───▶│  Show    │
│  Loads   │    │  Error   │    │  Error   │
│          │    │  (500/   │    │  State   │
│          │    │  timeout)│    │          │
└──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
                               ┌──────────┐
                               │  Retry   │
                               │  Button  │
                               └──────────┘
```

**Error State Content:**
- Error icon
- "Something went wrong"
- Retry button
- Contact support link (optional)

### 3.3 Offline Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│  Network │───▶│  Show    │
│  Navigates    │  Lost    │    │  Offline │
│          │    │          │    │  Page    │
└──────────┘    └──────────┘    └──────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
               ┌──────────┐   ┌──────────┐   ┌──────────┐
               │ Show     │   │ View     │   │ Auto-    │
               │ Offline  │   │ Cached   │   │ retry on │
               │ Banner   │   │ Jobs     │   │ reconnect│
               └──────────┘   └──────────┘   └──────────┘
```

---

## 4. Accessibility Flows

### 4.1 Keyboard Navigation

```
Tab Order:
┌──────────────────────────────────────────────────┐
│  1. Skip to main content (hidden link)           │
│  2. Logo (home link)                             │
│  3. Language toggle                              │
│  4. Theme toggle                                 │
│  5. Search input                                 │
│  6. Category select                              │
│  7. Region select                                │
│  8. Salary toggle                                │
│  9. Search button                                │
│ 10. Job cards (each focusable)                   │
│ 11. Pagination controls                          │
│ 12. Footer links                                 │
└──────────────────────────────────────────────────┘
```

### 4.2 Screen Reader Flow

```
Announcements:
- Page title on navigation
- Results count on search
- Loading state
- Error states
- Toast notifications
```

---

## 5. Analytics Events Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ANALYTICS EVENTS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Homepage Load ─────────▶ page_view { page: 'home' }                    │
│                                                                          │
│  Search Submit ─────────▶ search { query, category, region, results }   │
│                                                                          │
│  Filter Change ─────────▶ filter_change { filter_type, value }          │
│                                                                          │
│  Job Card Click ────────▶ job_click { job_id, position }                │
│                                                                          │
│  Job Detail View ───────▶ job_view { job_id }                           │
│                                                                          │
│  Share Click ───────────▶ share { platform, job_id }                    │
│                                                                          │
│  Save Job ──────────────▶ job_save { job_id }                           │
│                                                                          │
│  Language Switch ───────▶ language_change { from, to }                  │
│                                                                          │
│  Theme Toggle ──────────▶ theme_change { theme }                        │
│                                                                          │
│  Pagination ────────────▶ page_change { page, total_pages }             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*User flows maintained by UX Team*
*Last updated: January 23, 2026*
