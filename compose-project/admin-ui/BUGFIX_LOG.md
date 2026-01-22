# Admin UI Bugfix Log

## Date: 2026-01-22

### Session Summary

This document tracks all bugs identified and fixed in the React Admin UI.

---

### Issues Fixed

#### 1. Jobs Page 404 Errors (FIXED)
**Symptom:** Jobs page stuck loading, console shows 404 errors for `/api/categories` and `/api/regions`
**Root Cause:**
- Frontend calls `GET /api/categories` and `GET /api/regions`
- These endpoints don't exist in the admin backend (returns 404)
- TanStack Query retries failed requests, blocking the page

**Fix Applied:**
- Modified `src/api/jobs.ts` to fetch categories/regions from `/api/parser/config`
- Added retry limits to prevent infinite retries
- Changed Select component default values from empty string `''` to `'all'`

#### 2. Parser Page Crash - controls undefined (FIXED)
**Symptom:** Parser page crashes with `Cannot read properties of undefined (reading 'can_pause')`
**Root Cause:**
- `/api/parser/progress` endpoint returns jobs WITHOUT `controls` property
- `/api/parser/jobs` endpoint returns jobs WITH `controls` property
- ParserPage.tsx accessed `job.controls.can_pause` without null check

**Fix Applied:**
- Added optional chaining in `src/pages/ParserPage.tsx`:
  - `job.controls.can_pause` → `job.controls?.can_pause`
  - `job.controls.can_resume` → `job.controls?.can_resume`
  - `job.controls.can_stop` → `job.controls?.can_stop`
  - `job.controls.can_restart` → `job.controls?.can_restart`

#### 3. Logs Page Radix UI Select Error (FIXED)
**Symptom:** Logs page fails to render, Select components error
**Root Cause:**
- Radix UI Select components don't accept empty string `''` as value
- Default state was `useState('')`

**Fix Applied:**
- Changed default values from `''` to `'all'`
- Updated filter logic to handle `'all'` value

#### 4. Backups Page - Wrong API Endpoints (FIXED)
**Symptom:** Cannot trigger backup, cannot download backups
**Root Cause:**
- Frontend called `POST /backups/trigger` but backend expected `POST /backups`
- Frontend called `GET /backups/download/{filename}` but backend expected `GET /backups/{type}/{filename}`

**Fix Applied:**
- Fixed `src/api/backups.ts` endpoint URLs
- Added delete and restore endpoints to backend
- Fixed query invalidation keys for proper cache refresh

#### 5. Jobs by Region Analytics Showing "Unknown" (FIXED)
**Symptom:** Analytics dashboard shows "Unknown" for region breakdown
**Root Cause:**
- Analytics query used `region_id` JOIN but jobs have NULL `region_id`
- Region info is stored in `location` text field, not as foreign key

**Fix Applied:**
- Changed analytics query to use LIKE matching on `location` field
- Now correctly shows: Tbilisi: 2324, Kvemo Kartli: 166, etc.

---

### Files Modified

| File | Changes |
|------|---------|
| `src/api/jobs.ts` | Get categories/regions from `/parser/config` |
| `src/api/backups.ts` | Fixed all endpoint URLs (trigger, download, delete) |
| `src/hooks/useJobs.ts` | Added retry limits |
| `src/hooks/useParser.ts` | Added retry limits and error handling |
| `src/hooks/useBackups.ts` | Fixed query invalidation keys |
| `src/pages/JobsPage.tsx` | Changed Select defaults to 'all' |
| `src/pages/LogsPage.tsx` | Changed Select defaults to 'all' |
| `src/pages/ParserPage.tsx` | Added optional chaining for `job.controls?.` |

---

### Testing Checklist

- [x] Jobs page loads and displays data
- [x] Category/region filters work from parser config
- [x] Parser page loads without crashing
- [x] Parser page shows running jobs with controls
- [x] Parser page shows job history table
- [x] Logs page loads and filters work
- [x] Backups page can trigger manual backup
- [x] Backups page can download/delete backups
- [x] Analytics shows correct region breakdown

---

### API Response Differences

**`/api/parser/jobs` response:**
```json
{
  "jobs": [{
    "id": "...",
    "status": "completed",
    "controls": {
      "can_pause": false,
      "can_resume": false,
      "can_stop": false,
      "can_restart": true
    }
  }]
}
```

**`/api/parser/progress` response:**
```json
{
  "running": true,
  "jobs": [{
    "id": "...",
    "status": "running"
    // NOTE: No "controls" property!
  }]
}
```

This difference caused the crash - always use optional chaining when accessing `controls`.
