# HR.GE API Research Summary

## Research Completed: 2026-01-24

### Research Team
- **Main Agent** - Primary investigation, endpoint discovery
- **Desktop-Chrome Agent** - ID range testing, announcement/customer exploration
- **Mobile-Chrome Agent** - Multi-tenant discovery, cross-portal validation
- **Mobile-Safari Agent** - Deep JSON structure analysis, field documentation

---

## Key Discoveries

### 1. API Architecture

**Base URL Pattern:**
```
https://api.p.hr.ge/public-portal/tenant/{tenantId}/api/v3/{endpoint}
```

**Multi-Tenant System (6 portals on same API):**
| Tenant | Domain | Focus |
|--------|--------|-------|
| 1 | hr.ge | General jobs |
| 2 | cv.ge | Jobseekers |
| 3 | career.ge | Careers |
| 4 | doctor.ge | Healthcare |
| 5 | chefs.ge | Hospitality |
| 6 | bankers.ge | Finance |

### 2. Working GET Endpoints (6 total)

| Endpoint | Description | Response Size |
|----------|-------------|---------------|
| `/announcement/{id}` | Full job details | ~40KB |
| `/customer/{id}` | Company profile | ~10KB |
| `/seo/sitemap` | All job IDs | ~5MB |
| `/public/configs` | Platform config | ~2KB |
| `/search-field` | Statistics | ~200B |
| `/get-metadata` | SEO + cities | ~1KB |

### 3. POST Endpoints (Need Body - 20+ discovered)

**Announcement Endpoints:**
- `/announcement/list` - Main listing
- `/announcement/search` - Filtered search
- `/announcement/today` - Today's jobs
- `/announcement/latest` - Recent jobs
- `/announcement/featured` - Premium jobs
- `/announcement/homepage` - Homepage widget
- `/announcement/widget` - Embeddable widget
- `/announcement/slider` - Carousel data

**Customer Endpoints:**
- `/customer/list` - Company listing
- `/customer/search` - Company search
- `/customer/featured` - Featured companies

### 4. Data Ranges

**Announcement IDs:**
- Active range: 455000 - 459000+
- Lower IDs (1-454999): Return expired/empty
- Total active: ~2,556 jobs

**Customer IDs:**
- Valid range: 50000 - 59000
- Lower IDs: Return 400 Bad Request

### 5. Platform Statistics (Live Data)

From `/search-field` endpoint:
- **2,556** active job announcements
- **35,508** registered companies
- **129,942** candidate CVs
- **137** jobs posted today

---

## Recommended Parser Strategy

### Option A: Sitemap + Individual Fetch (RECOMMENDED)
1. Fetch `/seo/sitemap` to get all job IDs (~880 jobs)
2. For each ID, fetch `/announcement/{id}`
3. Rate limit: 1 request/second
4. Store responses in database

**Pros:**
- 100% data coverage
- No POST body guessing
- Simple implementation

**Cons:**
- Slower (~15 min for full scrape)
- Higher request count

### Option B: Monitor + Incremental
1. Fetch `/search-field` for counts
2. Compare with previous counts
3. If new jobs, fetch sitemap diff
4. Fetch only new announcement IDs

**Pros:**
- Efficient for monitoring
- Low request volume

### Option C: Crack POST Endpoints (Advanced)
1. Reverse engineer POST body structure
2. Use `/announcement/list` for pagination
3. Much faster bulk fetching

**Requires:** Network traffic analysis to discover exact POST body format

---

## Files Created

| File | Purpose |
|------|---------|
| `200.md` | Successful endpoints documentation |
| `404.md` | Failed endpoints (avoid retry) |
| `manual.md` | User input for manual discoveries |
| `API_RESEARCH_SUMMARY.md` | This summary |

---

## Next Steps

1. **Choose parser approach** from options above
2. **Implement basic parser** using sitemap + individual fetch
3. **Optional:** Analyze browser network traffic to crack POST body
4. **Set up monitoring** using `/search-field` statistics

---

## Technical Notes

- API uses MongoDB ObjectIds for location references
- Responses are JSON wrapped in `{"data": {...}}`
- Images served via CloudFront CDN
- Georgian language (ka) as primary, English as fallback
- Currency: GEL (Georgian Lari)
- Timezone: GMT+4
