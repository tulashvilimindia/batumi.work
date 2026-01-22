# Admin UI Bugfix Log

## Date: 2026-01-22

### Issues Identified

#### 1. Jobs Page Not Loading (CRITICAL)
**Symptom:** Jobs page stuck loading, console shows 404 errors
**Root Cause:**
- Frontend calls `GET /api/categories` and `GET /api/regions`
- These endpoints don't exist in the admin backend (returns 404)
- TanStack Query retries failed requests, blocking the page

**Fix:**
- Use `/api/parser/config` endpoint which contains both regions and categories
- Add `retry: false` to prevent infinite retries on 404
- Make categories/regions queries non-blocking (page works without them)

#### 2. Parser Page Not Rendering (CRITICAL)
**Symptom:** All API calls return 200 but page shows nothing
**Root Cause:**
- Data format mismatch or rendering condition issue
- Need to verify data structure matches component expectations

**Fix:**
- Add defensive checks for undefined data
- Add loading and error states
- Verify data structure from API matches TypeScript types

#### 3. General Error Handling Missing
**Symptom:** Failed API calls cause pages to hang
**Root Cause:**
- No global error handling for API failures
- TanStack Query default retry behavior causes delays

**Fix:**
- Configure TanStack Query with sensible defaults
- Add error boundary components
- Show user-friendly error messages instead of blank pages

---

### Files Modified

1. `src/api/jobs.ts` - Get categories/regions from parser config
2. `src/hooks/useJobs.ts` - Add error handling, retry:false for categories
3. `src/pages/JobsPage.tsx` - Handle missing categories gracefully
4. `src/pages/ParserPage.tsx` - Add defensive data checks
5. `src/lib/queryClient.ts` - Configure default error handling
6. `src/components/ui/error-alert.tsx` - New error display component

---

### Testing Checklist

- [ ] Jobs page loads without categories endpoint
- [ ] Jobs table displays data
- [ ] Category filter works (or shows "No categories" gracefully)
- [ ] Parser page loads and shows regions
- [ ] Parser page shows job history table
- [ ] All other pages still work (Dashboard, Analytics, Backups, Logs, Database)
