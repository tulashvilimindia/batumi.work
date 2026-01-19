# Georgia Job Posting Website — Features + Tech Stack + Progress Tracker (Phase 1 + Phase 2)

---

## 0) Project Setup Instructions

### 0.1 Directory Structure
**IMPORTANT:** This entire project must be built in a dedicated directory:
```
compose-project/
├── docker-compose.yml
├── .env.example
├── README.md
├── api/                  # FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── web/                  # Static frontend
│   ├── Dockerfile
│   └── static/
├── worker/               # Phase 2: Parser worker
│   ├── Dockerfile
│   └── ...
└── migrations/           # Alembic migrations
```

All development, configuration, and deployment happens within this `compose-project/` directory.

### 0.2 Test Data / Seed Data
**Use existing parsed data as seed/test data:**
- The jobs.ge parser in the parent directory (`../jobs_parser.py`) has already collected **300+ real jobs** from across Georgia
- Data is stored in `../data/jobs.db` (SQLite) and exported to `../data/daily/*.json`
- **Seed script must:**
  - Read from `../data/daily/master_index.json` (or the SQLite database)
  - Transform and insert jobs into PostgreSQL
  - Map existing categories to the new category system
  - Preserve bilingual content (title_en, title_ge, body_en, body_ge)
- This provides realistic test data with proper Georgian/English content

### 0.3 Integration with Existing Parser
- The existing `jobs_parser.py` can be adapted as **Adapter A** for Phase 2
- It already implements: job fetching, body extraction, deduplication, content hashing
- Reuse the category classification from `analytics.py` (16 categories with keywords)

---

## 1) Product Summary
Build a lightweight, SEO-first job postings website for **all of Georgia** with:
- **Georgian (GE) as default**, English (EN) as secondary
- Backend: **FastAPI** with **Swagger/OpenAPI**
- Database: **PostgreSQL**
- Frontend: **Plain HTML5 + vanilla JavaScript** (no React), very fast and SEO optimized
- Delivery: **docker-compose project in a separate directory**
- Phase 1: manual/admin-managed jobs
- Phase 2: automated parsers that ingest jobs from external job websites

---

## 2) Phase 1 — Features (MVP, Manual-first)

### 2.1 Public Website (Visitor Features)
#### Language and SEO
- Default language: **Georgian**
- Language toggle: **GE / EN**
- Persist selected language in:
  - URL prefix (`/ge/` and `/en/`) preferred
  - also store in localStorage as fallback
- SEO requirements:
  - Server-rendered HTML is preferred, but since frontend is static HTML, do:
    - Pre-rendered templates per language where possible
    - Include correct `<html lang="ka">` for GE and `<html lang="en">` for EN
    - Set canonical URLs (`<link rel="canonical">`)
    - Add `<link rel="alternate" hreflang="ka">` and `<link rel="alternate" hreflang="en">`
    - Unique `<title>` and `<meta name="description">` per page
    - OpenGraph tags for sharing (title/description/url)
  - Sitemap + Robots:
    - `/sitemap.xml` must exist (Phase 1: for static pages + optionally latest jobs)
    - `/robots.txt` must exist

#### Job List Page (Home)
- Display job cards with:
  - Localized title (GE/EN, fallback to GE)
  - Company
  - Location + Region
  - Category
  - Published date (if present)
  - Deadline date (if present)
  - Badges:
    - VIP badge when `is_vip=true`
    - Salary badge when `has_salary=true`
- Filters (all filter actions must update URL query params for SEO/shareability):
  - Search input `q` (default search in title/company)
  - Category (single-select)
  - Region (single-select or text input)
  - Has salary (toggle)
  - VIP only (toggle)
  - Status (default: active; user does not need to see inactive by default)
- Sorting:
  - Default: newest first
  - Optional in Phase 1: deadline soonest
- Pagination:
  - server-side paging via API
  - show page numbers and next/prev
  - URL reflects `page` and `page_size`

#### Job Detail Page
- Shows:
  - Localized title + full localized body (fallback to GE if EN missing)
  - Company / Location / Region / Category
  - Published date + Deadline date
  - Badges VIP/SALARY
  - Source info (always visible):
    - **Parsed from** (domain or `manual`)
    - **Exact source URL** clickable
- Shareability:
  - Copy link button (optional)
  - OG tags must represent the job

#### Performance / UX
- Must load fast on mobile:
  - Lighthouse-friendly: minimal JS, no heavy frameworks
  - Use vanilla JS, avoid big libraries
  - CSS: minimal, critical CSS inline or small CSS file
- Accessibility:
  - semantic HTML, correct heading order
  - keyboard-friendly filters and links

---

### 2.2 Admin Features (Phase 1)
Admin can be API-only (no admin UI). Swagger is used as the admin console.

#### Admin Security
- All admin endpoints protected by:
  - Header: `X-API-Key: <ADMIN_API_KEY>`
- Swagger should expose endpoints but require API key to execute.

#### Admin Job Management
- Create new job
- Update existing job
- Change job status:
  - active / inactive
- Minimum admin fields required to create job:
  - title_ge, body_ge, company
  - category
  - status default active
  - parsed_from default `manual`
  - source_url optional but strongly recommended

#### Admin Category Management
- Create category (code + GE name required, EN name optional)
- Update category names
- Disable category (is_active=false) without deleting

#### Seed Data
- Provide demo categories (at least 10)
- Provide demo jobs (at least 20) with mixed GE-only and GE+EN content

---

## 3) Phase 2 — Features (Parser + Automation)

### 3.1 Parser Framework (Multi-source)
- Support multiple sources via adapters (one adapter per website)
- Each adapter must:
  - discover job links (list pages)
  - fetch job details page(s)
  - extract the standardized fields
  - provide `parsed_from` (source key/domain)
  - provide `external_id` when available
  - provide exact `source_url` for each job

### 3.2 Idempotency and Updates
- Re-parsing must not create duplicates:
  - Upsert key: `(parsed_from, external_id)` (primary)
  - If external_id not stable, use `content_hash` strategy (secondary)
- If content changes, update job record and refresh `last_seen_at`
- Keep `first_seen_at` and `last_seen_at` (Phase 2 fields)

### 3.3 Job Lifecycle Rule
- Config: `NOT_SEEN_DAYS_TO_INACTIVE`
- If a job is not seen for X days by parser:
  - set status to `inactive` or `expired` (choose one; default inactive for simplicity)

### 3.4 Parser Runs Monitoring
- Store parser run history:
  - started_at, finished_at, success/failure, counts, error sample
- Admin endpoints:
  - list parser runs
  - manually trigger parser run per source

### 3.5 Scheduling
- Worker runs parsers on schedule:
  - config: `PARSER_INTERVAL_MINUTES`
- Keep it simple:
  - worker container + internal interval loop OR cron-like schedule

---

## 4) Technical Stack (Required)

### 4.1 Delivery and Structure
- Must be a **docker-compose project in its own directory**:
  - Example: `jobboard-compose/`
- Must include:
  - `docker-compose.yml`
  - `.env.example`
  - `README.md`

### 4.2 Backend
- **FastAPI** (Python)
- Swagger/OpenAPI enabled:
  - `/docs` and `/openapi.json`
- Admin API key protection
- Recommended:
  - Alembic migrations
  - Pydantic schemas
  - Structured logging (JSON logs)

#### 4.2.1 API Versioning Strategy

**URL Prefix Versioning (Required)**
```
/api/v1/jobs          # Current version
/api/v1/categories
/api/v1/companies
/api/v2/jobs          # Future version (when needed)
```

**Implementation in FastAPI:**
```python
from fastapi import APIRouter, FastAPI

app = FastAPI(title="JobBoard API", version="1.0.0")

# Version 1 router
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
v1_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
v1_router.include_router(companies_router, prefix="/companies", tags=["Companies"])

app.include_router(v1_router)

# Admin routes (also versioned)
admin_router = APIRouter(prefix="/api/v1/admin", dependencies=[Depends(verify_api_key)])
app.include_router(admin_router)
```

**API Versioning Rules:**
- All public endpoints must be under `/api/v1/`
- Admin endpoints under `/api/v1/admin/`
- Breaking changes require new version (`/api/v2/`)
- Non-breaking additions can stay in current version
- Deprecate old versions with 6-month notice
- Include `X-API-Version` header in responses

**Endpoint Structure:**
```
Public API (v1):
  GET    /api/v1/jobs                    # List jobs (paginated)
  GET    /api/v1/jobs/{id}               # Get job detail
  GET    /api/v1/jobs/search             # Full-text search
  GET    /api/v1/categories              # List categories
  GET    /api/v1/categories/{slug}/jobs  # Jobs by category
  GET    /api/v1/companies               # List companies
  GET    /api/v1/companies/{slug}        # Company detail + jobs
  GET    /api/v1/regions                 # List regions (hierarchical)

Admin API (v1):
  POST   /api/v1/admin/jobs              # Create job
  PUT    /api/v1/admin/jobs/{id}         # Update job
  PATCH  /api/v1/admin/jobs/{id}/status  # Change status
  DELETE /api/v1/admin/jobs/{id}         # Soft delete
  POST   /api/v1/admin/jobs/import       # Bulk import
  GET    /api/v1/admin/jobs/export       # Bulk export

  POST   /api/v1/admin/categories        # Create category
  PUT    /api/v1/admin/categories/{id}   # Update category

  GET    /api/v1/admin/parser/runs       # Parser run history
  POST   /api/v1/admin/parser/trigger    # Manual trigger

System:
  GET    /health                         # Health check (no version)
  GET    /ready                          # Readiness check
  GET    /metrics                        # Prometheus metrics
```

**Query Parameters Standard:**
```
Pagination:
  ?page=1&page_size=20              # Offset pagination (default)
  ?cursor=abc123&limit=20           # Cursor pagination (for large sets)

Filtering:
  ?status=active
  ?category=it-programming
  ?region=batumi
  ?has_salary=true
  ?employment_type=full_time
  ?q=developer                      # Search query

Sorting:
  ?sort=-published_at               # Descending (newest first)
  ?sort=company_name,published_at   # Multiple fields

Field Selection:
  ?fields=id,title,company,salary   # Sparse fieldsets

Embedding:
  ?include=category,company         # Include related objects
```

### 4.3 Database
- **PostgreSQL**
- Volume for persistence
- Indexes on common filters (status/category/region)

#### 4.3.1 Extended Database Schema

**Jobs Table (Extended)**
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    title_ge VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    body_ge TEXT NOT NULL,
    body_en TEXT,

    -- Company (foreign key)
    company_id UUID REFERENCES companies(id),
    company_name VARCHAR(255),  -- denormalized for quick display

    -- Location
    location VARCHAR(255),
    region_id UUID REFERENCES regions(id),
    remote_type VARCHAR(20) DEFAULT 'onsite',  -- onsite, remote, hybrid

    -- Category
    category_id UUID REFERENCES categories(id) NOT NULL,

    -- Employment details
    employment_type VARCHAR(20) DEFAULT 'full_time',  -- full_time, part_time, contract, internship, freelance
    experience_level VARCHAR(20),  -- entry, mid, senior, executive, any

    -- Salary (expanded from boolean)
    has_salary BOOLEAN DEFAULT false,
    salary_min INTEGER,           -- in GEL (Georgian Lari)
    salary_max INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'GEL',  -- GEL, USD, EUR
    salary_period VARCHAR(20) DEFAULT 'monthly',  -- hourly, daily, monthly, yearly

    -- Dates
    published_at TIMESTAMP,
    deadline_at TIMESTAMP,

    -- Status & flags
    status VARCHAR(20) DEFAULT 'active',  -- active, inactive, expired, pending_review
    is_vip BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,

    -- Source tracking
    parsed_from VARCHAR(100) DEFAULT 'manual',  -- manual, jobs.ge, hr.ge, etc.
    external_id VARCHAR(255),
    source_url TEXT,
    content_hash VARCHAR(64),

    -- Timestamps
    first_seen_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Unique constraint for deduplication
    UNIQUE(parsed_from, external_id)
);

-- Indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_region ON jobs(region_id);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_salary ON jobs(has_salary) WHERE has_salary = true;
CREATE INDEX idx_jobs_published ON jobs(published_at DESC);
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('simple', title_ge || ' ' || COALESCE(title_en, '') || ' ' || COALESCE(company_name, '')));
```

**Companies Table (New)**
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name_ge VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE,

    -- Details
    description_ge TEXT,
    description_en TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(500),

    -- Contact
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,

    -- Social
    facebook_url VARCHAR(500),
    linkedin_url VARCHAR(500),

    -- Stats (denormalized for performance)
    active_jobs_count INTEGER DEFAULT 0,
    total_jobs_count INTEGER DEFAULT 0,

    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name_ge, name_en);
CREATE INDEX idx_companies_slug ON companies(slug);
```

**Regions Table (New)**
```sql
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Hierarchy
    parent_id UUID REFERENCES regions(id),
    level INTEGER NOT NULL,  -- 1=country, 2=region, 3=city

    -- Names
    name_ge VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) UNIQUE,

    -- Geo (optional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Status
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed Georgian regions
INSERT INTO regions (level, name_ge, name_en, slug) VALUES
(1, 'საქართველო', 'Georgia', 'georgia'),
(2, 'აჭარა', 'Adjara', 'adjara'),
(2, 'თბილისი', 'Tbilisi', 'tbilisi'),
(2, 'იმერეთი', 'Imereti', 'imereti'),
(3, 'ბათუმი', 'Batumi', 'batumi'),
(3, 'ქუთაისი', 'Kutaisi', 'kutaisi');
```

**Job Views Table (Analytics)**
```sql
CREATE TABLE job_views (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

    -- View info
    viewed_at TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(64),
    user_agent TEXT,
    ip_hash VARCHAR(64),  -- hashed for privacy
    referrer VARCHAR(500),

    -- Location (from IP)
    country_code VARCHAR(2),
    city VARCHAR(100)
);

CREATE INDEX idx_job_views_job ON job_views(job_id);
CREATE INDEX idx_job_views_date ON job_views(viewed_at);

-- Materialized view for daily stats
CREATE MATERIALIZED VIEW job_views_daily AS
SELECT
    job_id,
    DATE(viewed_at) as view_date,
    COUNT(*) as view_count,
    COUNT(DISTINCT session_id) as unique_views
FROM job_views
GROUP BY job_id, DATE(viewed_at);
```

**Search Logs Table (For Autocomplete & Analytics)**
```sql
CREATE TABLE search_logs (
    id BIGSERIAL PRIMARY KEY,

    query VARCHAR(255) NOT NULL,
    query_normalized VARCHAR(255),  -- lowercase, trimmed

    -- Filters used
    category_id UUID,
    region_id UUID,
    filters_json JSONB,

    -- Results
    results_count INTEGER,

    -- Context
    language VARCHAR(2),  -- ge, en
    session_id VARCHAR(64),
    searched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_logs_query ON search_logs(query_normalized);
CREATE INDEX idx_search_logs_date ON search_logs(searched_at);
```

### 4.4 Frontend (SEO-first)
- **Static HTML files** served by a lightweight server (choose one):
  - Nginx container (recommended)
  - or simple backend static file hosting if desired
- Tech:
  - HTML5 + CSS + Vanilla JS
- Requirements:
  - very small JS bundle
  - no heavy frameworks
  - URL routing strategy:
    - Prefer real pages: `/ge/index.html`, `/en/index.html`, `/ge/job.html?id=<uuid>`
    - If using nicer paths, use Nginx rewrite rules

#### 4.4.1 Progressive Web App (PWA) Support

**Web App Manifest (`manifest.json`)**
```json
{
  "name": "ვაკანსიები - Georgia Jobs",
  "short_name": "Jobs",
  "description": "სამუშაო ადგილები საქართველოში",
  "start_url": "/ge/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#4ECDC4",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "ახალი ვაკანსიები",
      "short_name": "New Jobs",
      "url": "/ge/?sort=-published_at",
      "icons": [{ "src": "/icons/new-job.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["business", "productivity"]
}
```

**Service Worker (`sw.js`)**
```javascript
const CACHE_NAME = 'jobboard-v1';
const STATIC_ASSETS = [
  '/',
  '/ge/index.html',
  '/en/index.html',
  '/css/main.css',
  '/js/app.js',
  '/icons/icon-192.png',
  '/offline.html'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip API calls (always network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/offline.html');
        });
      })
  );
});

// Background sync for saved jobs (when online again)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-saved-jobs') {
    event.waitUntil(syncSavedJobs());
  }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
    data: { url: data.url }
  });
});
```

**PWA Features:**
- **Offline support**: View cached job listings when offline
- **Add to Home Screen**: Install as app on mobile devices
- **Fast loading**: Service worker caches static assets
- **Background sync**: Sync saved jobs when connection restored
- **Push notifications**: (Future) Alert for new jobs in saved searches

**Implementation Checklist:**
- [ ] Create `manifest.json` with app metadata
- [ ] Generate app icons (192x192, 512x512)
- [ ] Create `sw.js` service worker
- [ ] Register service worker in main JS
- [ ] Add `<link rel="manifest">` to HTML
- [ ] Create `offline.html` fallback page
- [ ] Test "Add to Home Screen" on Android/iOS
- [ ] Implement cache invalidation strategy

### 4.5 Phase 2 Worker
- Separate container `worker`
- Runs parser on interval
- Writes to same Postgres

---

## 5) Feature Checklist (MVP-level)

### Phase 1 — Must Have
- [x] Home/job list page (GE default)
- [x] Job detail page
- [x] Filters: q/category/region/has_salary/is_vip
- [x] Pagination
- [x] Language switch GE/EN with fallback to GE
- [x] SEO tags: title/description/canonical/hreflang
- [x] robots.txt + sitemap.xml
- [x] FastAPI public endpoints for list + detail
- [x] Admin endpoints for jobs + categories
- [x] Swagger usable for admin actions
- [x] docker-compose up starts db+api+web
- [x] Seed data

### Phase 2 — Must Have
- [x] Parser framework + adapter interface
- [x] At least 2 adapters (jobs.ge done, hr.ge done)
- [x] Worker scheduling
- [x] parser runs monitoring
- [x] Upsert/idempotency rules
- [x] Not-seen rule updates status

---

## 6) Progress Tracking (WBS + Tracker)

### 6.1 Status Legend
- ✅ Done
- 🟦 In Progress
- ⬜ Not Started
- ⛔ Blocked

### 6.2 Phase 1 — WBS
**P1-01 Requirements & UX**
- P1-01.1 Finalize feature list + acceptance criteria
- P1-01.2 Decide URL structure for SEO (`/ge/` and `/en/`)
- P1-01.3 Define SEO tags template rules (list/detail)

**P1-02 Backend Setup**
- P1-02.1 Create FastAPI project skeleton
- P1-02.2 Add Swagger and API key auth for admin endpoints
- P1-02.3 Public endpoints: health, categories, jobs list, job detail
- P1-02.4 Admin endpoints: category CRUD, job CRUD, status change

**P1-03 Database**
- P1-03.1 Postgres schema + migrations
- P1-03.2 Indexes for filters + pagination
- P1-03.3 Seed categories and jobs

**P1-04 Frontend (HTML5 + JS)**
- P1-04.1 Static layout + CSS
- P1-04.2 Language toggle + URL handling
- P1-04.3 List page: fetch + render + filters
- P1-04.4 Detail page: fetch + render + SEO meta injection
- P1-04.5 Sitemap + robots (static base + optional API-driven)

**P1-05 Docker & Delivery**
- P1-05.1 docker-compose with db+api+web
- P1-05.2 env example + README
- P1-05.3 Smoke test run

**P1-06 QA**
- P1-06.1 API test checklist
- P1-06.2 UI test checklist (mobile/desktop)
- P1-06.3 Lighthouse pass target (basic)

### 6.3 Phase 2 — WBS
**P2-01 Parser Core**
- P2-01.1 Adapter interface + shared utilities (http, retries, parsing helpers)
- P2-01.2 Runner/orchestrator
- P2-01.3 Content normalization + hashing

**P2-02 Observability**
- P2-02.1 parser_runs storage + admin endpoints
- P2-02.2 Basic run logs and error sampling

**P2-03 Adapters**
- P2-03.1 Adapter A (source TBD)
- P2-03.2 Adapter B (source TBD)
- P2-03.3 Category/region mapping rules per source

**P2-04 Worker**
- P2-04.1 Worker container
- P2-04.2 Scheduling (interval)
- P2-04.3 Not-seen deactivation rule

**P2-05 QA**
- P2-05.1 Idempotency tests
- P2-05.2 Failure mode tests (partial outages)
- P2-05.3 Load test with larger dataset

---

## 7) Progress Tracker Tables

### 7.1 Phase 1 Tracker
| ID | Area | Task | Owner | Status | Start | Due | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| P1-01.1 | Req/UX | Finalize features + DoD | | ✅ | | | | |
| P1-01.2 | Req/UX | Decide SEO URL structure | | ✅ | | | P1-01.1 | /ge/ and /en/ prefix |
| P1-01.3 | Req/UX | Define SEO tags rules | | ✅ | | | P1-01.2 | hreflang, canonical, OG |
| P1-02.1 | Backend | FastAPI skeleton | | ✅ | | | | |
| P1-02.2 | Backend | Admin API key security | | ✅ | | | P1-02.1 | X-API-Key header |
| P1-02.3 | Backend | Public APIs (jobs+categories) | | ✅ | | | P1-02.1 | |
| P1-02.4 | Backend | Admin APIs (jobs+categories) | | ✅ | | | P1-02.2 | |
| P1-03.1 | DB | Schema + migrations | | ✅ | | | | Alembic setup |
| P1-03.2 | DB | Indexes for filters | | ✅ | | | P1-03.1 | |
| P1-03.3 | DB | Seed data | | ✅ | | | P1-03.1 | 16 categories, 14 regions, 20 jobs |
| P1-04.1 | Frontend | HTML layout + CSS | | ✅ | | | P1-01.2 | |
| P1-04.2 | Frontend | Language toggle + routing | | ✅ | | | P1-04.1 | |
| P1-04.3 | Frontend | List page render + filters | | ✅ | | | P1-02.3 | |
| P1-04.4 | Frontend | Detail page + SEO meta | | ✅ | | | P1-02.3 | |
| P1-04.5 | Frontend | robots.txt + sitemap.xml | | ✅ | | | P1-01.3 | |
| P1-05.1 | Delivery | docker-compose db+api+web | | ✅ | | | P1-02.1,P1-03.1,P1-04.1 | |
| P1-05.2 | Delivery | .env.example + README | | ✅ | | | P1-05.1 | |
| P1-05.3 | Delivery | Smoke test run | | ✅ | | | P1-05.1 | All containers healthy, API + frontend working |
| P1-06.1 | QA | API checks | | ✅ | | | P1-05.3 | All endpoints tested, Swagger works |
| P1-06.2 | QA | UI checks | | ✅ | | | P1-05.3 | SEO elements, static assets verified |
| P1-06.3 | QA | Basic Lighthouse target | | ✅ | | | P1-04.3,P1-04.4 | CSS:3KB JS:5.7KB Total:<15KB, <15ms response |

### 7.2 Phase 2 Tracker
| ID | Area | Task | Owner | Status | Start | Due | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| P2-01.1 | Parser | Adapter interface + utilities | | ✅ | | | Phase 1 complete | BaseAdapter, HTTPClient, JobData |
| P2-01.2 | Parser | Runner/orchestrator | | ✅ | | | P2-01.1 | ParserRunner with async upsert |
| P2-01.3 | Parser | Normalization + hashing | | ✅ | | | P2-01.1 | SHA-256 hashing, text normalization |
| P2-02.1 | Obs | parser_runs + admin endpoints | | ✅ | | | P2-01.2 | Model, migration, admin API |
| P2-02.2 | Obs | Logging + error sampling | | ✅ | | | P2-02.1 | structlog JSON logging |
| P2-03.1 | Adapters | Adapter A | | ✅ | | | P2-01.2 | Source: jobs.ge |
| P2-03.2 | Adapters | Adapter B | | ✅ | | | P2-01.2 | Source: hr.ge |
| P2-03.3 | Adapters | Mapping rules per source | | ✅ | | | P2-03.1 | Category classification |
| P2-04.1 | Worker | Worker container | | ✅ | | | P2-01.2 | Dockerfile + docker-compose |
| P2-04.2 | Worker | Scheduler interval | | ✅ | | | P2-04.1 | APScheduler integration |
| P2-04.3 | Worker | Not-seen rule | | ✅ | | | P2-04.2 | deactivate_not_seen() implemented |
| P2-05.1 | QA | Idempotency tests | | ✅ | | | P2-03.2 | Tests created |
| P2-05.2 | QA | Failure mode tests | | ✅ | | | P2-03.2 | Tests created |
| P2-05.3 | QA | Dataset load test | | ✅ | | | P2-05.1 | Tests created |

---

## 8) Technical Stack Summary (Short)
- **Postgres** (db)
- **FastAPI** (api) with **Swagger** (`/docs`)
- **Static HTML5 + CSS + Vanilla JS** (web), SEO-first, lightweight
- **docker-compose** in separate directory (db+api+web; Phase 2 adds worker)
- Admin security: `X-API-Key` header for admin endpoints

---

## 9) SEO & Analytics Features

### 9.1 JSON-LD Structured Data
- Implement **JobPosting schema** on job detail pages:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "...",
    "description": "...",
    "datePosted": "...",
    "validThrough": "...",
    "employmentType": "FULL_TIME",
    "hiringOrganization": { "@type": "Organization", "name": "..." },
    "jobLocation": { "@type": "Place", "address": "..." }
  }
  ```
- Benefits: Rich snippets in Google search results (salary, company logo, etc.)

### 9.2 Analytics Integration
- **Option A: Google Analytics 4** (free, powerful)
  - Track page views, events, conversions
  - Set up goals: job detail views, apply clicks
- **Option B: Plausible Analytics** (privacy-focused, paid)
  - GDPR compliant, no cookies
  - Simpler dashboard
- **Custom events to track:**
  - Job view
  - Filter usage (category, region, salary)
  - Language switch
  - External link clicks (source URLs)
  - Search queries

### 9.3 Breadcrumb Navigation
- Implement breadcrumbs on all pages:
  - Home > Category > Job Title
  - Home > Region > Job Title
- Add **BreadcrumbList** JSON-LD schema
- Improves UX and SEO

### 9.4 Dynamic Sitemap
- Generate sitemap.xml dynamically from API:
  - `/sitemap.xml` - index sitemap
  - `/sitemap-jobs.xml` - all active jobs (paginated if >50k)
  - `/sitemap-categories.xml` - category pages
- Include `lastmod`, `changefreq`, `priority`
- Auto-update when jobs change

### 9.5 Social Sharing Optimization
- OpenGraph tags (Facebook, LinkedIn):
  - `og:title`, `og:description`, `og:image`, `og:url`
- Twitter Cards:
  - `twitter:card`, `twitter:title`, `twitter:description`
- Generate **job preview images** (optional):
  - Auto-generate OG images with job title/company/salary

---

## 10) Admin & Operations Features

### 10.1 Simple Admin Dashboard (HTML)
- Lightweight admin page at `/admin/` (protected by API key cookie)
- Features:
  - Job list with status filters
  - Quick status toggle (active/inactive)
  - Parser run history view
  - System health overview
- Tech: Plain HTML + fetch() to admin API

### 10.2 Job Approval Workflow
- New parser jobs get status `pending_review` (optional)
- Admin reviews and approves/rejects
- Config: `AUTO_APPROVE_PARSED_JOBS=true/false`

### 10.3 Bulk Operations
- **Import:**
  - POST `/admin/jobs/import` with JSON array
  - CSV import endpoint
- **Export:**
  - GET `/admin/jobs/export?format=json|csv`
  - Filter by date range, status, source

### 10.4 Health & Monitoring Endpoints
- `GET /health` - basic health (returns 200 if alive)
- `GET /ready` - readiness (DB connected, etc.)
- `GET /metrics` - Prometheus format metrics:
  ```
  jobs_total{status="active"} 301
  jobs_total{status="inactive"} 45
  parser_runs_total{source="jobs.ge",status="success"} 150
  parser_runs_total{source="jobs.ge",status="failed"} 3
  api_requests_total{endpoint="/jobs",method="GET"} 10000
  api_latency_seconds{endpoint="/jobs",quantile="0.95"} 0.12
  ```

### 10.5 Alerting Rules (for external monitoring)
- Job count drops >20% in 24h → alert
- Parser fails 3 times in a row → alert
- API error rate >5% → alert
- Response time p95 >500ms → alert

---

## 11) Parser Enhancements (Phase 2+)

### 11.1 Proxy Rotation
- Configure proxy pool for parsing:
  ```yaml
  PARSER_PROXIES:
    - http://proxy1:8080
    - http://proxy2:8080
    - socks5://proxy3:1080
  ```
- Rotate on each request or on failure
- Support for proxy authentication

### 11.2 Headless Browser Support
- Some sites require JavaScript rendering
- Use **Playwright** or **Selenium** for JS-heavy sites:
  ```python
  class HeadlessAdapter(BaseAdapter):
      async def fetch(self, url):
          async with async_playwright() as p:
              browser = await p.chromium.launch()
              page = await browser.new_page()
              await page.goto(url)
              return await page.content()
  ```
- Config per adapter: `USE_HEADLESS=true/false`

### 11.3 Parser Priority Queue
- Assign priority to sources:
  - Priority 1: jobs.ge (main source)
  - Priority 2: hr.ge
  - Priority 3: other sources
- Higher priority sources parsed first
- Separate intervals per priority

### 11.4 Webhook Notifications
- Notify external systems on events:
  ```yaml
  WEBHOOKS:
    - url: https://example.com/webhook
      events: [new_job, job_expired, parser_failed]
      secret: "hmac-secret"
  ```
- Payload includes job data + event type
- HMAC signature for verification

### 11.5 Duplicate Detection (Fuzzy Matching)
- Beyond exact hash matching:
  - **Title similarity** (Levenshtein distance >90%)
  - **Company + location match**
  - **Body similarity** (TF-IDF or simhash)
- Flag potential duplicates for review
- Config: `FUZZY_DUPLICATE_THRESHOLD=0.85`

### 11.6 Source Quality Scoring
- Track per-source metrics:
  - Success rate
  - Average jobs per run
  - Duplicate rate
  - Data quality (missing fields %)
- Dashboard for source health

---

## 12) DevOps & Deployment

### 12.1 Multi-stage Docker Builds
```dockerfile
# Build stage
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# Production stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/*
COPY ./app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```
- Smaller final images (~100MB vs ~500MB)
- Faster deployments

### 12.2 GitHub Actions CI/CD
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          ssh ${{ secrets.SERVER }} 'cd /app && git pull && docker-compose up -d --build'
```

### 12.3 Database Backups
- Automated daily backups:
  ```yaml
  # In docker-compose.yml
  backup:
    image: postgres:15
    volumes:
      - ./backups:/backups
    command: >
      sh -c "while true; do
        pg_dump -h db -U postgres jobboard > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql
        find /backups -mtime +7 -delete
        sleep 86400
      done"
  ```
- Keep 7 days of backups
- Optional: upload to S3/GCS

### 12.4 Log Aggregation
- **Option A: Loki + Grafana** (lightweight)
  - Add Loki driver to docker-compose
  - Query logs in Grafana
- **Option B: ELK Stack** (powerful but heavy)
  - Elasticsearch + Logstash + Kibana
- Structured JSON logging in FastAPI:
  ```python
  import structlog
  logger = structlog.get_logger()
  logger.info("job_created", job_id=job.id, source="manual")
  ```

### 12.5 Uptime Monitoring
- Use external service:
  - **UptimeRobot** (free tier)
  - **Better Uptime**
  - **Pingdom**
- Monitor:
  - `/health` endpoint
  - Homepage load time
  - API response time
- Alert via: Email, Slack, Telegram

### 12.6 Environment Management
```
.env.example          # Template with all vars
.env.development      # Local dev settings
.env.staging          # Staging environment
.env.production       # Production (not in git!)
```
- Use **Docker secrets** for sensitive data in production
- Validate env vars on startup

### 12.7 Rollback Strategy
- Keep last 3 Docker image versions tagged
- Quick rollback command:
  ```bash
  docker-compose down
  docker tag jobboard-api:latest jobboard-api:rollback
  docker pull jobboard-api:previous
  docker-compose up -d
  ```
- Database migrations must be reversible

---

## 13) Phase 2 Tracker (Updated with New Features)

| ID | Area | Task | Status | Notes |
|---|---|---|---|---|
| P2-06.1 | Parser | Proxy rotation support | ⬜ | |
| P2-06.2 | Parser | Headless browser adapter | ⬜ | Playwright |
| P2-06.3 | Parser | Priority queue | ⬜ | |
| P2-06.4 | Parser | Webhook notifications | ⬜ | |
| P2-06.5 | Parser | Fuzzy duplicate detection | ⬜ | |
| P2-07.1 | Admin | Simple HTML dashboard | ⬜ | |
| P2-07.2 | Admin | Bulk import/export | ⬜ | |
| P2-07.3 | Admin | Prometheus metrics | ⬜ | |
| P2-08.1 | SEO | JSON-LD JobPosting schema | ⬜ | |
| P2-08.2 | SEO | Dynamic sitemap | ⬜ | |
| P2-08.3 | SEO | Analytics integration | ⬜ | GA4 or Plausible |
| P2-09.1 | DevOps | Multi-stage Docker builds | ⬜ | |
| P2-09.2 | DevOps | GitHub Actions CI/CD | ⬜ | |
| P2-09.3 | DevOps | Database backup automation | ⬜ | |
| P2-09.4 | DevOps | Log aggregation (Loki) | ⬜ | |
| P2-09.5 | DevOps | Uptime monitoring | ✅ | |

---

## 14) Testing Strategy

### 14.1 Testing Pyramid

```
                    ┌─────────────┐
                    │    E2E      │  ← Few, slow, expensive
                    │  (Playwright)│
                    ├─────────────┤
                    │ Integration │  ← Medium amount
                    │   (API)     │
               ┌────┴─────────────┴────┐
               │      Unit Tests       │  ← Many, fast, cheap
               │       (Pytest)        │
               └───────────────────────┘
```

### 14.2 Unit Tests (Backend)

**Framework:** Pytest + pytest-asyncio

**Test Structure:**
```
api/tests/
├── conftest.py              # Fixtures
├── unit/
│   ├── test_models.py       # Pydantic models
│   ├── test_services.py     # Business logic
│   ├── test_utils.py        # Utility functions
│   └── test_parsers.py      # Parser adapters
├── integration/
│   ├── test_api_jobs.py     # Job endpoints
│   ├── test_api_categories.py
│   ├── test_api_admin.py
│   └── test_database.py     # DB operations
└── e2e/
    └── test_flows.py        # Full user flows
```

**Example Unit Test:**
```python
# test_services.py
import pytest
from app.services.job_service import JobService

class TestJobService:
    def test_search_jobs_by_keyword(self, db_session):
        service = JobService(db_session)
        results = service.search("developer", language="en")

        assert len(results) > 0
        assert all("developer" in j.title_en.lower() for j in results)

    def test_filter_by_salary(self, db_session):
        service = JobService(db_session)
        results = service.list_jobs(has_salary=True)

        assert all(j.has_salary for j in results)

    def test_pagination(self, db_session):
        service = JobService(db_session)
        page1 = service.list_jobs(page=1, page_size=10)
        page2 = service.list_jobs(page=2, page_size=10)

        assert len(page1.items) == 10
        assert page1.items[0].id != page2.items[0].id
```

**Coverage Target:** Minimum **80%** for core services

### 14.3 Integration Tests (API)

**Framework:** Pytest + httpx (async client)

**Example API Test:**
```python
# test_api_jobs.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
class TestJobsAPI:
    async def test_list_jobs(self, client: AsyncClient):
        response = await client.get("/api/v1/jobs")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data

    async def test_filter_by_category(self, client: AsyncClient):
        response = await client.get("/api/v1/jobs?category=it-programming")

        assert response.status_code == 200
        data = response.json()
        for job in data["items"]:
            assert job["category"]["slug"] == "it-programming"

    async def test_job_detail(self, client: AsyncClient, sample_job):
        response = await client.get(f"/api/v1/jobs/{sample_job.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_job.id)
        assert "title_ge" in data
        assert "body_ge" in data

    async def test_job_not_found(self, client: AsyncClient):
        response = await client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000")

        assert response.status_code == 404

    async def test_admin_requires_api_key(self, client: AsyncClient):
        response = await client.post("/api/v1/admin/jobs", json={})

        assert response.status_code == 401
```

### 14.4 End-to-End Tests (Frontend)

**Framework:** Playwright

**Example E2E Test:**
```javascript
// tests/e2e/job-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Search', () => {
  test('can search for jobs by keyword', async ({ page }) => {
    await page.goto('/ge/');

    // Enter search query
    await page.fill('[data-testid="search-input"]', 'პროგრამისტი');
    await page.click('[data-testid="search-button"]');

    // Verify results
    await expect(page.locator('.job-card')).toHaveCount({ minimum: 1 });
    await expect(page.url()).toContain('q=');
  });

  test('can filter by category', async ({ page }) => {
    await page.goto('/ge/');

    await page.selectOption('[data-testid="category-filter"]', 'it-programming');

    await expect(page.locator('.job-card')).toHaveCount({ minimum: 1 });
    await expect(page.url()).toContain('category=it-programming');
  });

  test('can view job detail', async ({ page }) => {
    await page.goto('/ge/');

    await page.click('.job-card:first-child');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.job-body')).toBeVisible();
  });

  test('can switch language', async ({ page }) => {
    await page.goto('/ge/');

    await page.click('[data-testid="lang-switch-en"]');

    await expect(page.url()).toContain('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
```

### 14.5 Parser Tests

```python
# test_parsers.py
import pytest
from app.parsers.jobs_ge import JobsGeAdapter

class TestJobsGeAdapter:
    @pytest.fixture
    def adapter(self):
        return JobsGeAdapter()

    def test_parse_job_list(self, adapter, mock_html_list):
        jobs = adapter.parse_list_page(mock_html_list)

        assert len(jobs) > 0
        assert all(j.external_id for j in jobs)
        assert all(j.title_ge for j in jobs)

    def test_parse_job_detail(self, adapter, mock_html_detail):
        job = adapter.parse_detail_page(mock_html_detail)

        assert job.body_ge
        assert job.company_name

    def test_idempotency(self, adapter, db_session):
        # Parse same job twice
        job1 = adapter.fetch_and_store("12345")
        job2 = adapter.fetch_and_store("12345")

        # Should not create duplicate
        assert job1.id == job2.id

    def test_content_hash_update(self, adapter, db_session):
        job1 = adapter.fetch_and_store("12345")
        original_hash = job1.content_hash

        # Simulate content change
        adapter.mock_content_change("12345", "new body")
        job2 = adapter.fetch_and_store("12345")

        assert job2.content_hash != original_hash
        assert job2.last_seen_at > job1.last_seen_at
```

### 14.6 Load Testing

**Framework:** Locust or k6

**Example Locust Test:**
```python
# locustfile.py
from locust import HttpUser, task, between

class JobBoardUser(HttpUser):
    wait_time = between(1, 3)

    @task(10)
    def browse_jobs(self):
        self.client.get("/api/v1/jobs?page=1&page_size=20")

    @task(5)
    def search_jobs(self):
        self.client.get("/api/v1/jobs?q=developer")

    @task(3)
    def view_job_detail(self):
        # Get a random job ID first
        response = self.client.get("/api/v1/jobs?page_size=1")
        if response.ok:
            job_id = response.json()["items"][0]["id"]
            self.client.get(f"/api/v1/jobs/{job_id}")

    @task(1)
    def filter_by_category(self):
        self.client.get("/api/v1/jobs?category=it-programming&has_salary=true")
```

**Load Test Targets:**
- 100 concurrent users
- < 200ms p95 response time
- 0% error rate
- Run for 10 minutes

### 14.7 CI Test Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r api/requirements-dev.txt
      - name: Run unit tests
        run: pytest api/tests/unit -v --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - name: Run integration tests
        run: |
          docker-compose -f docker-compose.test.yml up -d
          pytest api/tests/integration -v
          docker-compose -f docker-compose.test.yml down

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Start application
        run: docker-compose up -d
      - name: Run E2E tests
        run: npx playwright test
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 15) Social Sharing & Telegram Bot

### 15.1 Social Share Buttons

**Implementation (Vanilla JS):**
```javascript
// share.js
const ShareButtons = {
  facebook: (url, title) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      'facebook-share',
      'width=580,height=400'
    );
  },

  telegram: (url, title) => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      'telegram-share',
      'width=580,height=400'
    );
  },

  whatsapp: (url, title) => {
    const text = `${title}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      'whatsapp-share'
    );
  },

  linkedin: (url, title) => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      'linkedin-share',
      'width=580,height=400'
    );
  },

  copyLink: async (url) => {
    await navigator.clipboard.writeText(url);
    // Show toast notification
    showToast('ლინკი დაკოპირდა!');
  }
};
```

**HTML Share Bar:**
```html
<div class="share-buttons" data-url="{{job_url}}" data-title="{{job_title}}">
  <button onclick="ShareButtons.facebook(this.parentElement.dataset.url)"
          class="share-btn share-fb" aria-label="Share on Facebook">
    <svg><!-- FB icon --></svg>
  </button>
  <button onclick="ShareButtons.telegram(this.parentElement.dataset.url, this.parentElement.dataset.title)"
          class="share-btn share-tg" aria-label="Share on Telegram">
    <svg><!-- Telegram icon --></svg>
  </button>
  <button onclick="ShareButtons.whatsapp(this.parentElement.dataset.url, this.parentElement.dataset.title)"
          class="share-btn share-wa" aria-label="Share on WhatsApp">
    <svg><!-- WhatsApp icon --></svg>
  </button>
  <button onclick="ShareButtons.copyLink(this.parentElement.dataset.url)"
          class="share-btn share-copy" aria-label="Copy link">
    <svg><!-- Copy icon --></svg>
  </button>
</div>
```

### 15.2 Telegram Bot Integration

**Bot Features:**
- `/start` - Welcome message + language selection
- `/search <keyword>` - Search jobs
- `/subscribe <category>` - Subscribe to new jobs in category
- `/unsubscribe` - Manage subscriptions
- `/latest` - Show 5 latest jobs
- Daily digest of new jobs to subscribers

**Bot Implementation (Python + python-telegram-bot):**
```python
# bot/main.py
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler
import httpx

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_URL = os.getenv("API_URL", "http://api:8000")

async def start(update: Update, context):
    keyboard = [
        [InlineKeyboardButton("🇬🇪 ქართული", callback_data="lang_ge")],
        [InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "გამარჯობა! 👋\nაირჩიეთ ენა / Choose language:",
        reply_markup=reply_markup
    )

async def search(update: Update, context):
    query = " ".join(context.args) if context.args else ""
    if not query:
        await update.message.reply_text("გთხოვთ მიუთითოთ საძიებო სიტყვა\nUsage: /search პროგრამისტი")
        return

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_URL}/api/v1/jobs", params={"q": query, "page_size": 5})
        data = response.json()

    if not data["items"]:
        await update.message.reply_text("ვაკანსიები ვერ მოიძებნა 😔")
        return

    message = f"🔍 ნაპოვნია {data['total']} ვაკანსია:\n\n"
    for job in data["items"]:
        message += f"💼 *{job['title_ge']}*\n"
        message += f"🏢 {job.get('company_name', 'N/A')}\n"
        if job.get('has_salary'):
            message += f"💰 ხელფასი მითითებულია\n"
        message += f"🔗 [ნახვა]({job['url']})\n\n"

    await update.message.reply_text(message, parse_mode="Markdown")

async def subscribe(update: Update, context):
    user_id = update.effective_user.id
    category = context.args[0] if context.args else None

    if not category:
        # Show category keyboard
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_URL}/api/v1/categories")
            categories = response.json()

        keyboard = [[InlineKeyboardButton(c["name_ge"], callback_data=f"sub_{c['slug']}")]
                    for c in categories[:10]]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await update.message.reply_text("აირჩიეთ კატეგორია:", reply_markup=reply_markup)
        return

    # Save subscription to database
    # ...
    await update.message.reply_text(f"✅ გამოწერილია: {category}")

async def send_daily_digest():
    """Send daily new jobs to subscribers (called by scheduler)"""
    # Get subscribers and their categories
    # Fetch new jobs from last 24h
    # Send personalized messages
    pass

def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("search", search))
    app.add_handler(CommandHandler("subscribe", subscribe))
    app.add_handler(CommandHandler("latest", latest))
    app.add_handler(CallbackQueryHandler(button_callback))

    app.run_polling()

if __name__ == "__main__":
    main()
```

**Docker Compose Service:**
```yaml
# In docker-compose.yml
telegram-bot:
  build: ./bot
  environment:
    - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    - API_URL=http://api:8000
  depends_on:
    - api
  restart: unless-stopped
```

### 15.3 Database Schema for Subscriptions

```sql
CREATE TABLE telegram_users (
    id BIGINT PRIMARY KEY,  -- Telegram user ID
    username VARCHAR(255),
    language VARCHAR(2) DEFAULT 'ge',
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE telegram_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES telegram_users(id),
    category_id UUID REFERENCES categories(id),
    region_id UUID REFERENCES regions(id),
    keyword VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, category_id, region_id, keyword)
);

CREATE TABLE telegram_notifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES telegram_users(id),
    job_id UUID REFERENCES jobs(id),
    sent_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)  -- Don't send same job twice
);
```

---

## 16) Performance Targets

### 16.1 Web Vitals Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse |
| **FID** (First Input Delay) | < 100ms | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| **TTFB** (Time to First Byte) | < 200ms | WebPageTest |
| **FCP** (First Contentful Paint) | < 1.8s | Lighthouse |
| **TTI** (Time to Interactive) | < 3.5s | Lighthouse |

### 16.2 API Performance Targets

| Endpoint | p50 | p95 | p99 | Max |
|----------|-----|-----|-----|-----|
| `GET /jobs` (list) | 30ms | 100ms | 200ms | 500ms |
| `GET /jobs/{id}` | 20ms | 50ms | 100ms | 200ms |
| `GET /jobs/search` | 50ms | 150ms | 300ms | 500ms |
| `POST /admin/jobs` | 50ms | 100ms | 200ms | 500ms |
| `GET /categories` | 10ms | 30ms | 50ms | 100ms |

### 16.3 Database Performance

| Query Type | Target | Notes |
|------------|--------|-------|
| Simple SELECT by ID | < 5ms | Index on PK |
| List with filters | < 50ms | Composite indexes |
| Full-text search | < 100ms | GIN index |
| Aggregations | < 200ms | Use materialized views |
| Write operations | < 50ms | Batch when possible |

### 16.4 Infrastructure Targets

| Metric | Target |
|--------|--------|
| Uptime | 99.9% (8.76h downtime/year) |
| Error rate | < 0.1% |
| Concurrent users | 500+ |
| Requests per second | 100+ |
| Database connections | Pool of 20 |

### 16.5 Bundle Size Targets

| Asset | Target | Current |
|-------|--------|---------|
| HTML (gzipped) | < 15KB | - |
| CSS (gzipped) | < 20KB | - |
| JS (gzipped) | < 30KB | - |
| Total page weight | < 100KB | - |
| Images (per image) | < 100KB | Use WebP |

### 16.6 Lighthouse Score Targets

| Category | Target |
|----------|--------|
| Performance | > 90 |
| Accessibility | > 95 |
| Best Practices | > 95 |
| SEO | > 95 |
| PWA | > 90 |

### 16.7 Monitoring Implementation

**FastAPI Middleware for Metrics:**
```python
# middleware/metrics.py
import time
from prometheus_client import Histogram, Counter

REQUEST_LATENCY = Histogram(
    'api_request_latency_seconds',
    'API request latency',
    ['method', 'endpoint', 'status']
)

REQUEST_COUNT = Counter(
    'api_request_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    latency = time.time() - start_time
    endpoint = request.url.path

    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=endpoint,
        status=response.status_code
    ).observe(latency)

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=endpoint,
        status=response.status_code
    ).inc()

    return response
```

---

## 17) Error Tracking & Monitoring

### 17.1 Sentry Integration

**Installation:**
```bash
pip install sentry-sdk[fastapi]
```

**FastAPI Configuration:**
```python
# main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT", "development"),
    traces_sample_rate=0.1,  # 10% of transactions
    profiles_sample_rate=0.1,
    integrations=[
        FastApiIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
    ],
    # Filter out health checks
    before_send=lambda event, hint: None if "/health" in event.get("request", {}).get("url", "") else event,
)

# Set user context
@app.middleware("http")
async def sentry_user_context(request: Request, call_next):
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("api_version", "v1")
        if request.headers.get("X-API-Key"):
            scope.set_user({"id": "admin"})

    return await call_next(request)
```

**Custom Error Capturing:**
```python
# In parser code
try:
    jobs = adapter.fetch_jobs()
except ParseError as e:
    sentry_sdk.capture_exception(e)
    sentry_sdk.capture_message(
        f"Parser failed for {adapter.source}",
        level="error",
        extras={
            "source": adapter.source,
            "url": adapter.current_url,
            "response_code": e.response_code
        }
    )
    raise
```

### 17.2 Frontend Error Tracking

**Sentry Browser SDK:**
```javascript
// In main.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: window.ENV || "production",

  // Capture 100% of errors, 10% of transactions
  tracesSampleRate: 0.1,

  // Filter out common non-errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection",
  ],

  beforeSend(event) {
    // Don't send errors from bots
    if (navigator.userAgent.includes("bot")) {
      return null;
    }
    return event;
  }
});

// Capture unhandled errors
window.addEventListener("error", (event) => {
  Sentry.captureException(event.error);
});

// Capture unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  Sentry.captureException(event.reason);
});
```

### 17.3 Structured Logging

**Python (structlog):**
```python
# logging_config.py
import structlog
import logging

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage
logger.info("job_created", job_id=job.id, source="manual", category=job.category.slug)
logger.error("parser_failed", source="jobs.ge", error=str(e), url=url)
```

**Log Output (JSON):**
```json
{
  "timestamp": "2026-01-18T23:45:00.000Z",
  "level": "info",
  "event": "job_created",
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "source": "manual",
  "category": "it-programming",
  "logger": "app.services.job_service"
}
```

### 17.4 Alert Rules

**Sentry Alert Rules:**
```yaml
# .sentry/alerts.yml
alerts:
  - name: "High Error Rate"
    conditions:
      - type: event_frequency
        interval: 1h
        value: 100
    actions:
      - type: slack
        channel: "#alerts"
      - type: email
        targetType: team

  - name: "Parser Failure"
    conditions:
      - type: event_attribute
        attribute: tags.source
        match: "starts_with"
        value: "parser"
    actions:
      - type: slack
        channel: "#parser-alerts"

  - name: "Critical Error"
    conditions:
      - type: event_attribute
        attribute: level
        match: "equals"
        value: "fatal"
    actions:
      - type: pagerduty
        service: "jobboard"
```

### 17.5 Health Dashboard

**Grafana Dashboard Panels:**
1. **Error Rate** - Errors/minute over time
2. **Response Time** - p50, p95, p99 latency
3. **Request Volume** - Requests/second
4. **Active Jobs** - Total count over time
5. **Parser Status** - Success/fail per source
6. **Database Connections** - Pool usage

**Environment Variables:**
```bash
# .env
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
LOG_LEVEL=INFO
LOG_FORMAT=json
```

---

## 18) Database Backup System

### 18.1 Backup Strategy Overview

**Goal:** Full PostgreSQL dumps stored outside Docker volumes on host filesystem for disaster recovery and data portability.

```
compose-project/
├── backups/                    # Host-mounted backup directory
│   ├── daily/                  # Daily automated backups
│   │   ├── jobboard_2026-01-19_030000.sql.gz
│   │   ├── jobboard_2026-01-18_030000.sql.gz
│   │   └── ...
│   ├── weekly/                 # Weekly full backups (kept 4 weeks)
│   │   └── jobboard_week_03_2026.sql.gz
│   ├── manual/                 # On-demand backups
│   │   └── jobboard_before_migration_2026-01-19.sql.gz
│   └── latest.sql.gz           # Symlink to most recent backup
```

### 18.2 Backup Container Service

**docker-compose.yml addition:**
```yaml
services:
  # ... existing services ...

  backup:
    image: postgres:15-alpine
    container_name: jobboard-backup
    profiles:
      - backup
      - full
    environment:
      - PGHOST=db
      - PGUSER=${POSTGRES_USER:-postgres}
      - PGPASSWORD=${POSTGRES_PASSWORD:-postgres}
      - PGDATABASE=${POSTGRES_DB:-jobboard}
      - BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
      - BACKUP_SCHEDULE=${BACKUP_SCHEDULE:-0 3 * * *}
    volumes:
      - ./backups:/backups:rw
      - ./scripts/backup.sh:/backup.sh:ro
    entrypoint: ["/bin/sh", "-c"]
    command: ["crond -f -d 8"]
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "test", "-f", "/backups/latest.sql.gz"]
      interval: 1h
      timeout: 10s
      retries: 1
```

### 18.3 Backup Script

**scripts/backup.sh:**
```bash
#!/bin/sh
set -e

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="/backups/daily/jobboard_${TIMESTAMP}.sql.gz"
LATEST_LINK="/backups/latest.sql.gz"

echo "[$(date)] Starting backup..."

# Create directories if not exist
mkdir -p /backups/daily /backups/weekly /backups/manual

# Full database dump with compression
pg_dump -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --verbose \
  2>/backups/backup.log | gzip > "$BACKUP_FILE"

# Verify backup
if [ -s "$BACKUP_FILE" ]; then
  echo "[$(date)] Backup completed: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

  # Update latest symlink
  ln -sf "$BACKUP_FILE" "$LATEST_LINK"

  # Weekly backup (every Sunday)
  if [ "$(date +%u)" = "7" ]; then
    WEEK_NUM=$(date +%V)
    YEAR=$(date +%Y)
    cp "$BACKUP_FILE" "/backups/weekly/jobboard_week_${WEEK_NUM}_${YEAR}.sql.gz"
    echo "[$(date)] Weekly backup created"
  fi

  # Cleanup old daily backups
  find /backups/daily -name "*.sql.gz" -mtime +${BACKUP_RETENTION_DAYS:-7} -delete
  echo "[$(date)] Cleaned up backups older than ${BACKUP_RETENTION_DAYS:-7} days"

  # Cleanup old weekly backups (keep 4 weeks)
  find /backups/weekly -name "*.sql.gz" -mtime +28 -delete

else
  echo "[$(date)] ERROR: Backup failed or empty!"
  exit 1
fi
```

### 18.4 Manual Backup Commands

```bash
# Create immediate backup
docker-compose exec backup sh -c "TIMESTAMP=manual_$(date +%Y%m%d_%H%M%S) && \
  pg_dump -h db -U postgres jobboard | gzip > /backups/manual/jobboard_\$TIMESTAMP.sql.gz"

# Backup specific tables only
docker-compose exec backup sh -c "pg_dump -h db -U postgres -t jobs -t categories jobboard | \
  gzip > /backups/manual/jobs_categories_$(date +%Y%m%d).sql.gz"

# List all backups with sizes
docker-compose exec backup sh -c "ls -lah /backups/daily/ /backups/weekly/ /backups/manual/"

# Verify backup integrity
docker-compose exec backup sh -c "gunzip -t /backups/latest.sql.gz && echo 'Backup valid'"
```

### 18.5 Restore Procedures

```bash
# Restore from latest backup
docker-compose exec -T db psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS jobboard;"
docker-compose exec -T db psql -U postgres -d postgres -c "CREATE DATABASE jobboard;"
gunzip -c ./backups/latest.sql.gz | docker-compose exec -T db psql -U postgres -d jobboard

# Restore from specific backup
gunzip -c ./backups/daily/jobboard_2026-01-19_030000.sql.gz | \
  docker-compose exec -T db psql -U postgres -d jobboard

# Restore to new database for testing
docker-compose exec -T db psql -U postgres -c "CREATE DATABASE jobboard_restore;"
gunzip -c ./backups/latest.sql.gz | docker-compose exec -T db psql -U postgres -d jobboard_restore
```

### 18.6 Backup Monitoring & Alerts

**Admin API endpoints:**
```
GET /api/v1/admin/backups              # List recent backups
GET /api/v1/admin/backups/status       # Backup health status
POST /api/v1/admin/backups/trigger     # Trigger manual backup
GET /api/v1/admin/backups/{filename}   # Download backup file
```

**Backup status response:**
```json
{
  "last_backup": "2026-01-19T03:00:00Z",
  "last_backup_size_mb": 12.5,
  "backup_count_daily": 7,
  "backup_count_weekly": 4,
  "total_size_mb": 145.2,
  "health": "healthy",
  "next_scheduled": "2026-01-20T03:00:00Z"
}
```

### 18.7 Environment Variables

```bash
# .env additions
BACKUP_RETENTION_DAYS=7           # Keep daily backups for 7 days
BACKUP_SCHEDULE="0 3 * * *"       # Daily at 3 AM
BACKUP_COMPRESSION=gzip           # gzip or none
BACKUP_NOTIFY_EMAIL=admin@example.com
BACKUP_NOTIFY_ON_FAILURE=true
```

---

## 19) Job Posting Analytics & Dashboards

### 19.1 Analytics Overview

**Goal:** Comprehensive insights into job market trends, user behavior, and platform performance.

**Analytics Categories:**
1. **Job Market Analytics** - Trends, categories, salaries, regions
2. **User Behavior Analytics** - Views, searches, engagement
3. **Parser Performance Analytics** - Source quality, success rates
4. **Platform Health Analytics** - API performance, errors, uptime

### 19.2 Database Schema for Analytics

**Job Views Table (tracking):**
```sql
CREATE TABLE job_views (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),

    -- Session tracking
    session_id VARCHAR(64),
    user_agent TEXT,
    ip_hash VARCHAR(64),        -- SHA-256 hashed for privacy

    -- Source tracking
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Device info
    device_type VARCHAR(20),    -- mobile, tablet, desktop
    browser VARCHAR(50),
    os VARCHAR(50),

    -- Location (from IP geolocation)
    country_code VARCHAR(2),
    city VARCHAR(100),

    -- Language
    language VARCHAR(2)         -- ge, en
);

CREATE INDEX idx_job_views_job ON job_views(job_id);
CREATE INDEX idx_job_views_date ON job_views(viewed_at);
CREATE INDEX idx_job_views_session ON job_views(session_id);
```

**Search Analytics Table:**
```sql
CREATE TABLE search_analytics (
    id BIGSERIAL PRIMARY KEY,
    searched_at TIMESTAMP DEFAULT NOW(),

    -- Query info
    query VARCHAR(255),
    query_normalized VARCHAR(255),  -- lowercase, trimmed

    -- Filters used
    category_id UUID REFERENCES categories(id),
    region_id UUID REFERENCES regions(id),
    has_salary_filter BOOLEAN,
    is_vip_filter BOOLEAN,

    -- Results
    results_count INTEGER,
    results_shown INTEGER,

    -- User action
    clicked_job_id UUID,           -- If user clicked a result
    time_to_click_ms INTEGER,      -- Time from search to click

    -- Session
    session_id VARCHAR(64),
    language VARCHAR(2)
);

CREATE INDEX idx_search_date ON search_analytics(searched_at);
CREATE INDEX idx_search_query ON search_analytics(query_normalized);
```

**Daily Aggregates (Materialized Views):**
```sql
-- Job statistics by day
CREATE MATERIALIZED VIEW mv_daily_job_stats AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as jobs_created,
    COUNT(*) FILTER (WHERE status = 'active') as jobs_active,
    COUNT(*) FILTER (WHERE has_salary = true) as jobs_with_salary,
    COUNT(DISTINCT category_id) as categories_with_jobs,
    COUNT(DISTINCT company_name) as unique_companies,
    AVG(salary_min) FILTER (WHERE salary_min IS NOT NULL) as avg_salary_min,
    AVG(salary_max) FILTER (WHERE salary_max IS NOT NULL) as avg_salary_max
FROM jobs
GROUP BY DATE(created_at);

-- Views by day
CREATE MATERIALIZED VIEW mv_daily_views AS
SELECT
    DATE(viewed_at) as date,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_visitors,
    COUNT(DISTINCT job_id) as jobs_viewed,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views
FROM job_views
GROUP BY DATE(viewed_at);

-- Category popularity
CREATE MATERIALIZED VIEW mv_category_stats AS
SELECT
    c.id as category_id,
    c.name_ge,
    c.slug,
    COUNT(DISTINCT j.id) as job_count,
    COUNT(DISTINCT jv.id) as view_count,
    ROUND(AVG(j.salary_min)) as avg_salary_min,
    ROUND(AVG(j.salary_max)) as avg_salary_max
FROM categories c
LEFT JOIN jobs j ON j.category_id = c.id AND j.status = 'active'
LEFT JOIN job_views jv ON jv.job_id = j.id
GROUP BY c.id, c.name_ge, c.slug;

-- Search trends
CREATE MATERIALIZED VIEW mv_search_trends AS
SELECT
    DATE(searched_at) as date,
    query_normalized,
    COUNT(*) as search_count,
    AVG(results_count) as avg_results,
    COUNT(*) FILTER (WHERE clicked_job_id IS NOT NULL) as searches_with_click,
    ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_job_id IS NOT NULL) / COUNT(*), 2) as click_rate
FROM search_analytics
WHERE searched_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(searched_at), query_normalized
HAVING COUNT(*) > 5;

-- Refresh materialized views (scheduled daily)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_job_stats;
```

### 19.3 Analytics API Endpoints

```
Analytics API (Admin):
  GET /api/v1/admin/analytics/dashboard           # Main dashboard data
  GET /api/v1/admin/analytics/jobs                # Job market analytics
  GET /api/v1/admin/analytics/views               # View/traffic analytics
  GET /api/v1/admin/analytics/searches            # Search analytics
  GET /api/v1/admin/analytics/categories          # Category performance
  GET /api/v1/admin/analytics/regions             # Regional analytics
  GET /api/v1/admin/analytics/sources             # Parser source analytics
  GET /api/v1/admin/analytics/trends              # Trend analysis
  GET /api/v1/admin/analytics/export              # Export data (CSV/JSON)

Query Parameters:
  ?from=2026-01-01&to=2026-01-19                  # Date range
  ?granularity=day|week|month                     # Aggregation level
  ?category=it-programming                        # Filter by category
  ?region=tbilisi                                 # Filter by region
```

### 19.4 Dashboard Data Models

**Main Dashboard Response:**
```json
{
  "period": {
    "from": "2026-01-12",
    "to": "2026-01-19"
  },
  "summary": {
    "total_jobs": 1250,
    "active_jobs": 890,
    "new_jobs_period": 145,
    "total_views": 15420,
    "unique_visitors": 4230,
    "searches": 8900,
    "avg_jobs_per_day": 20.7
  },
  "trends": {
    "jobs_change_pct": 12.5,
    "views_change_pct": 8.3,
    "searches_change_pct": -2.1
  },
  "top_categories": [
    {"slug": "it-programming", "name": "IT & Programming", "jobs": 234, "views": 4500},
    {"slug": "sales", "name": "Sales", "jobs": 189, "views": 2100}
  ],
  "top_regions": [
    {"slug": "tbilisi", "name": "Tbilisi", "jobs": 780, "pct": 62.4},
    {"slug": "batumi", "name": "Batumi", "jobs": 120, "pct": 9.6}
  ],
  "salary_insights": {
    "jobs_with_salary_pct": 35.2,
    "avg_salary_min": 1800,
    "avg_salary_max": 3200,
    "currency": "GEL"
  },
  "parser_health": {
    "sources": [
      {"name": "jobs.ge", "status": "healthy", "last_run": "2026-01-19T14:00:00Z", "jobs_today": 45},
      {"name": "hr.ge", "status": "pending", "last_run": null, "jobs_today": 0}
    ],
    "success_rate_24h": 98.5
  }
}
```

**Job Market Analytics Response:**
```json
{
  "period": {"from": "2026-01-01", "to": "2026-01-19"},
  "job_flow": {
    "created": [{"date": "2026-01-19", "count": 23}, ...],
    "expired": [{"date": "2026-01-19", "count": 12}, ...],
    "net_change": [{"date": "2026-01-19", "count": 11}, ...]
  },
  "by_category": [
    {
      "category": "IT & Programming",
      "total": 234,
      "new_period": 45,
      "avg_salary": {"min": 2500, "max": 4500},
      "salary_coverage_pct": 48.2,
      "top_companies": ["TBC Bank", "Bank of Georgia", "Magti"]
    }
  ],
  "by_employment_type": {
    "full_time": 720,
    "part_time": 89,
    "contract": 56,
    "internship": 25
  },
  "salary_distribution": {
    "ranges": [
      {"range": "0-1000", "count": 120},
      {"range": "1000-2000", "count": 180},
      {"range": "2000-3000", "count": 95},
      {"range": "3000-5000", "count": 45},
      {"range": "5000+", "count": 20}
    ],
    "currency": "GEL"
  },
  "companies_ranking": [
    {"name": "TBC Bank", "active_jobs": 24, "total_views": 1200},
    {"name": "Bank of Georgia", "active_jobs": 18, "total_views": 980}
  ]
}
```

### 19.5 Analytics Dashboard UI

**Admin Dashboard Page (`/admin/analytics.html`):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>JobBoard Analytics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .dashboard { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        .stat-trend { font-size: 0.9em; }
        .trend-up { color: #27ae60; }
        .trend-down { color: #e74c3c; }
        .chart-container { grid-column: span 2; }
        .full-width { grid-column: span 4; }
    </style>
</head>
<body>
    <div class="dashboard">
        <!-- Summary Cards -->
        <div class="stat-card">
            <div class="stat-value" id="total-jobs">--</div>
            <div class="stat-label">Total Active Jobs</div>
            <div class="stat-trend" id="jobs-trend"></div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="total-views">--</div>
            <div class="stat-label">Views (7 days)</div>
            <div class="stat-trend" id="views-trend"></div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="unique-visitors">--</div>
            <div class="stat-label">Unique Visitors</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="searches">--</div>
            <div class="stat-label">Searches</div>
        </div>

        <!-- Charts -->
        <div class="stat-card chart-container">
            <h3>Jobs Created vs Views</h3>
            <canvas id="jobs-views-chart"></canvas>
        </div>
        <div class="stat-card chart-container">
            <h3>Top Categories</h3>
            <canvas id="categories-chart"></canvas>
        </div>
        <div class="stat-card chart-container">
            <h3>Regional Distribution</h3>
            <canvas id="regions-chart"></canvas>
        </div>
        <div class="stat-card chart-container">
            <h3>Salary Distribution</h3>
            <canvas id="salary-chart"></canvas>
        </div>

        <!-- Tables -->
        <div class="stat-card full-width">
            <h3>Top Search Queries</h3>
            <table id="search-table">
                <thead><tr><th>Query</th><th>Count</th><th>Avg Results</th><th>Click Rate</th></tr></thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="stat-card full-width">
            <h3>Parser Sources Status</h3>
            <table id="sources-table">
                <thead><tr><th>Source</th><th>Status</th><th>Last Run</th><th>Jobs Today</th><th>Success Rate</th></tr></thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

    <script>
        const API_KEY = localStorage.getItem('admin_api_key');
        const headers = { 'X-API-Key': API_KEY };

        async function loadDashboard() {
            const response = await fetch('/api/v1/admin/analytics/dashboard', { headers });
            const data = await response.json();

            // Update stat cards
            document.getElementById('total-jobs').textContent = data.summary.active_jobs.toLocaleString();
            document.getElementById('total-views').textContent = data.summary.total_views.toLocaleString();
            document.getElementById('unique-visitors').textContent = data.summary.unique_visitors.toLocaleString();
            document.getElementById('searches').textContent = data.summary.searches.toLocaleString();

            // Update trends
            updateTrend('jobs-trend', data.trends.jobs_change_pct);
            updateTrend('views-trend', data.trends.views_change_pct);

            // Render charts
            renderCategoriesChart(data.top_categories);
            renderRegionsChart(data.top_regions);
        }

        function updateTrend(elementId, pct) {
            const el = document.getElementById(elementId);
            const arrow = pct >= 0 ? '↑' : '↓';
            const cls = pct >= 0 ? 'trend-up' : 'trend-down';
            el.innerHTML = `<span class="${cls}">${arrow} ${Math.abs(pct).toFixed(1)}%</span> vs last period`;
        }

        loadDashboard();
    </script>
</body>
</html>
```

### 19.6 Real-time Analytics Tracking

**Frontend tracking snippet (add to all pages):**
```javascript
// analytics.js - Lightweight tracking
const Analytics = {
    sessionId: localStorage.getItem('session_id') || (() => {
        const id = crypto.randomUUID();
        localStorage.setItem('session_id', id);
        return id;
    })(),

    track(event, data = {}) {
        const payload = {
            event,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer,
            language: document.documentElement.lang,
            ...data
        };

        // Use sendBeacon for reliability
        navigator.sendBeacon('/api/v1/analytics/track', JSON.stringify(payload));
    },

    trackJobView(jobId) {
        this.track('job_view', { job_id: jobId });
    },

    trackSearch(query, filters, resultsCount) {
        this.track('search', { query, filters, results_count: resultsCount });
    },

    trackJobClick(jobId, position) {
        this.track('job_click', { job_id: jobId, position });
    }
};

// Auto-track page views
Analytics.track('page_view');
```

### 19.7 Scheduled Analytics Jobs

**Worker tasks for analytics:**
```python
# worker/app/tasks/analytics.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

async def refresh_materialized_views():
    """Refresh all analytics materialized views."""
    views = [
        'mv_daily_job_stats',
        'mv_daily_views',
        'mv_category_stats',
        'mv_search_trends'
    ]
    async with get_db_session() as session:
        for view in views:
            await session.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view}")
        await session.commit()
    logger.info("analytics_views_refreshed", views=views)

async def generate_daily_report():
    """Generate and store daily analytics report."""
    async with get_db_session() as session:
        # Aggregate yesterday's data
        report = await compile_daily_report(session)

        # Store in reports table
        await session.execute(
            "INSERT INTO analytics_reports (date, report_type, data) VALUES ($1, $2, $3)",
            [date.today() - timedelta(days=1), 'daily', json.dumps(report)]
        )
        await session.commit()

    logger.info("daily_report_generated", date=str(date.today() - timedelta(days=1)))

async def cleanup_old_analytics():
    """Remove analytics data older than retention period."""
    retention_days = int(os.getenv('ANALYTICS_RETENTION_DAYS', 90))
    cutoff = datetime.now() - timedelta(days=retention_days)

    async with get_db_session() as session:
        # Delete old job views
        result = await session.execute(
            "DELETE FROM job_views WHERE viewed_at < $1", [cutoff]
        )
        views_deleted = result.rowcount

        # Delete old search analytics
        result = await session.execute(
            "DELETE FROM search_analytics WHERE searched_at < $1", [cutoff]
        )
        searches_deleted = result.rowcount

        await session.commit()

    logger.info("analytics_cleanup", views_deleted=views_deleted, searches_deleted=searches_deleted)

# Schedule tasks
scheduler = AsyncIOScheduler()
scheduler.add_job(refresh_materialized_views, 'cron', hour=4, minute=0)   # Daily 4 AM
scheduler.add_job(generate_daily_report, 'cron', hour=5, minute=0)        # Daily 5 AM
scheduler.add_job(cleanup_old_analytics, 'cron', day_of_week='sun', hour=3)  # Weekly Sunday 3 AM
```

### 19.8 Analytics Environment Variables

```bash
# .env additions
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90
ANALYTICS_TRACK_IP=false              # Privacy: don't store raw IPs
ANALYTICS_GEOIP_ENABLED=true          # Enable IP geolocation
ANALYTICS_REPORTS_EMAIL=admin@example.com
ANALYTICS_DAILY_REPORT_TIME=05:00
```

### 19.9 Key Insights & Reports

**Automated Insights:**
- Top growing categories (week over week)
- Declining categories alert
- Salary trend by category
- Popular search queries with no results (content gap)
- Parser source quality degradation
- Regional job distribution changes
- Peak traffic hours

**Weekly Report Email:**
```
Subject: JobBoard Weekly Report - Week 3, 2026

SUMMARY
- Active jobs: 890 (+12% vs last week)
- Total views: 45,200 (+8%)
- Unique visitors: 12,400 (+5%)
- New jobs posted: 145

TOP CATEGORIES
1. IT & Programming - 234 jobs (26%)
2. Sales & Marketing - 189 jobs (21%)
3. Finance - 145 jobs (16%)

INSIGHTS
⚠️ "accountant" searches have 0 results - consider adding Finance category
📈 Batumi region jobs increased 34% this week
💰 Average salary in IT increased to 3,200 GEL (+8%)

PARSER STATUS
✅ jobs.ge: 145 jobs imported, 98% success rate
⏳ hr.ge: Not configured
```

---

## Session Notes (for continuity)

### Last Session: 2026-01-19 (Session 4 - Production Stability & Documentation)

---

### WHAT WAS COMPLETED THIS SESSION (Session 4)

**Production Stability Tasks (3 completed):**

| Task | Description | Status |
|------|-------------|--------|
| P3-01.8 | Backup health check endpoint | ✅ |
| P2-09.5 | Uptime monitoring setup | ✅ |
| P2-11.1 | Lighthouse score > 90 | ✅ |

**1. Health Check Endpoint (`/health/detailed`)**
- Added comprehensive health check at `/health/detailed`
- Checks: database connection, backup status, parser health
- Returns JSON with status (healthy/warning/critical) for each component
- Fixed analytics.py import error (`from app.core.database import Base`)
- Added backups volume mount to API container

**2. Uptime Monitoring Documentation**
- UptimeRobot setup instructions (free tier)
- BetterStack setup with incident management
- Prometheus + Grafana self-hosted option
- Alert rule recommendations with thresholds

**3. Lighthouse Performance Optimizations**
- Added `defer` attribute to all scripts
- Added `meta theme-color` for mobile browsers
- Added `preconnect` + `dns-prefetch` hints for API
- Added `preload` hint for critical CSS
- Created SVG favicon (`/favicon.svg`)
- Updated all 5 HTML files (ge/en index + job + admin analytics)

**4. Comprehensive Documentation Created**
```
compose-project/docs/
├── USER_GUIDE.md      (~220 lines) - End-user guide
├── ADMIN_GUIDE.md     (~440 lines) - Admin API reference
└── DEVOPS_GUIDE.md    (~750 lines) - Deployment & operations
```

**Commits:**
- `2ece9d9` - Add comprehensive documentation (user, admin, devops guides)
- `b57e5c7` - P2-11.1: Add Lighthouse performance optimizations

---

### REMAINING LOW PRIORITY TASKS (5 total)

| Group | Tasks | Description |
|-------|-------|-------------|
| Social Features | P2-10.1-4 | Telegram bot |
| Monitoring | P3-02.13 | Weekly email reports |

---

### Previous Session: 2026-01-19 (Session 3 - Parser Production Run)

---

### PARSER STATUS: FULLY OPERATIONAL ✅

**jobs.ge Parser - Production Run Complete**
- **309 jobs** successfully parsed and stored
- **0 errors** during parsing
- Parser correctly discovers all jobs from homepage
- Detail pages parsed with bilingual support (GE + EN)
- Salary extraction working (normalized to GEL/USD/EUR)
- Category classification working (16 categories)

**Database Status (as of 2026-01-19):**
| Source | Active | Inactive | Total |
|--------|--------|----------|-------|
| jobs.ge | 309 | 0 | 309 |
| manual | 20 | 1 | 21 |
| **Total** | **329** | **1** | **330** |

**Parser Fixes Applied:**
1. Fixed homepage URL (jobs.ge shows all jobs on homepage, no pagination)
2. Added worker models package (Job, Category) for database operations
3. Implemented category_id lookup from slug
4. Fixed currency normalization (ლარი → GEL, $ → USD, € → EUR)
5. Added error recovery with rollback for batch processing

**Commits:**
- `25354f3` - Fix jobs.ge parser with correct HTML selectors
- `5ed4f24` - Add worker models package and fix parser URL
- `1392ebe` - Fix category lookup and currency normalization

---

### Previous Session: 2026-01-19 (Session 2)

---

### WHAT WAS COMPLETED THIS SESSION

**Phase 3 - Database Backup System ✅**
- backups/ directory structure (daily, weekly, manual)
- backup.sh script with gzip compression
- Backup container in docker-compose with cron scheduling
- Weekly backup rotation (Sundays)
- Retention cleanup (7 days daily, 28 days weekly)
- Admin API endpoints for backup management
- Restore documentation and restore.sh script

**Phase 3 - Job Posting Analytics ✅**
- job_views and search_analytics tables
- Materialized views for daily stats (mv_daily_job_stats, mv_daily_views, etc.)
- Analytics API endpoints (dashboard, jobs, views, searches)
- Frontend tracking (analytics.js)
- Admin dashboard UI with Chart.js visualizations
- Scheduled view refresh (every 4 hours)
- Daily summary generation and data retention cleanup

**Phase 2 - Parser Extensions ✅**
- hr.ge adapter (second parser source)
- GitHub Actions CI/CD pipeline
- CI test pipeline

**Monitoring & Infrastructure ✅**
- Sentry integration for error monitoring
- Dependabot configuration for security updates

---

### PROJECT STATUS: UP AND RUNNING ✅

The compose-project is fully operational and production-ready.

**To start the application:**
```bash
cd compose-project

# Start core services (db + api + web)
docker-compose up -d

# Start with parser worker
docker-compose --profile parser up -d

# Verify all containers are healthy
docker-compose ps
```

**Access Points:**
- Website (Georgian): http://localhost/ge/
- Website (English): http://localhost/en/
- Admin Dashboard: http://localhost/admin/analytics.html
- API Documentation: http://localhost/docs
- Health Check: http://localhost/health

---

### COMPLETED FEATURES

**Phase 1 - MVP COMPLETE ✅**
- FastAPI backend with PostgreSQL + Alembic migrations
- Static HTML5 frontend with bilingual support (GE/EN)
- Docker Compose deployment (db + api + web containers)
- SEO optimized (hreflang, canonical, OG tags, sitemap, robots.txt)
- Admin API with X-API-Key authentication
- Demo data: 16 categories, 14 regions, 20 jobs
- All QA tests passed (CSS: 3KB, JS: 5.7KB, <15ms response)

**Phase 2 - Parser Framework COMPLETE ✅**
- BaseAdapter interface + HTTPClient + utilities
- ParserRunner orchestrator with async upsert
- Content normalization + SHA-256 hashing for deduplication
- jobs.ge adapter (fully implemented)
- Worker container with APScheduler scheduling
- Parser runs storage + admin monitoring endpoints
- Not-seen deactivation rule (jobs not seen → inactive)
- QA test suite (idempotency, failure modes, load tests)

---

### WHAT WAS ADDED THIS SESSION

1. **Database Backup System (Section 18)**
   - Full specification for host-mounted backups outside Docker
   - Backup container service with cron scheduling
   - Daily (7-day retention) and weekly (4-week retention) backups
   - Restore procedures documented
   - Admin API endpoints for backup management

2. **Job Posting Analytics & Dashboards (Section 19)**
   - job_views and search_analytics tables schema
   - Materialized views for daily aggregates
   - Analytics API endpoints specification
   - Dashboard UI with Chart.js visualizations
   - Frontend tracking snippet (analytics.js)
   - Scheduled jobs for view refresh and reports

3. **Updated Progress Tracker (Section 20)**
   - Reorganized with priority levels (HIGH/MEDIUM/LOW)
   - 43 pending tasks categorized by phase

---

### NEXT PRIORITIES (for next session)

**HIGH PRIORITY - Sprint 1:**
```
P3-01.1-4: Database Backup Core
  - Create backups/ directory
  - Implement backup.sh script
  - Add backup container to docker-compose
  - Configure cron scheduling

P3-02.1-5,8: Analytics Core
  - Create job_views table + migration
  - Create search_analytics table + migration
  - Create materialized views
  - Implement analytics API endpoints
  - Add frontend tracking JS
```

**MEDIUM PRIORITY - Sprint 2:**
- P2-03.2: hr.ge adapter (second parser source)
- P3-02.9-10: Analytics dashboard UI
- P2-09.2: GitHub Actions CI/CD

---

### ADMIN API REFERENCE

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/jobs` | POST | Create job |
| `/api/v1/admin/jobs/{id}` | PUT | Update job |
| `/api/v1/admin/jobs/{id}/status` | PATCH | Change status |
| `/api/v1/admin/categories` | POST | Create category |
| `/api/v1/admin/parser/runs` | GET | Parser run history |
| `/api/v1/admin/parser/trigger` | POST | Trigger parser |
| `/api/v1/admin/parser/sources` | GET | List sources |

**Header required:** `X-API-Key: <ADMIN_API_KEY>`

---

### FILE STRUCTURE

```
compose-project/
├── docker-compose.yml      # Main orchestration
├── .env.example            # Environment template
├── api/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── migrations/         # Alembic migrations
│   └── tests/              # QA test suite
├── web/                    # Nginx + static frontend
│   └── static/
│       ├── ge/             # Georgian pages
│       ├── en/             # English pages
│       ├── css/
│       └── js/
└── worker/                 # Parser worker
    └── app/
        ├── core/           # BaseAdapter, runner, utils
        └── parsers/        # jobs.ge adapter
```

---

### ENVIRONMENT VARIABLES

Key variables in `.env`:
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=jobboard
ADMIN_API_KEY=<secure-api-key>
PARSER_INTERVAL_MINUTES=60
ENABLED_SOURCES=jobs.ge
NOT_SEEN_DAYS_TO_INACTIVE=7
```

---

**Working Directory:** `C:\Users\MindiaTulashvili\OneDrive\Desktop\batumi.work`

**Git Status:** 13 commits ahead of origin/main (not pushed)

---

## 20) Updated Progress Tracker (All Features)

### 20.1 Phase 3 - Database Backup System (HIGH PRIORITY)

| ID | Area | Task | Status | Priority | Notes |
|---|---|---|---|---|---|
| P3-01.1 | Backup | Create backups directory structure | ✅ | HIGH | daily/, weekly/, manual/ |
| P3-01.2 | Backup | Backup shell script (backup.sh) | ✅ | HIGH | Section 18.3 |
| P3-01.3 | Backup | Backup container in docker-compose | ✅ | HIGH | Section 18.2 |
| P3-01.4 | Backup | Cron scheduling (daily 3AM) | ✅ | HIGH | |
| P3-01.5 | Backup | Weekly backup rotation | ✅ | MEDIUM | Keep 4 weeks |
| P3-01.6 | Backup | Retention cleanup (7 days daily) | ✅ | MEDIUM | |
| P3-01.7 | Backup | Admin API endpoints for backups | ✅ | MEDIUM | Section 18.6 |
| P3-01.8 | Backup | Backup status monitoring | ✅ | LOW | /health/detailed endpoint |
| P3-01.9 | Backup | Restore documentation | ✅ | MEDIUM | Section 18.5 |

### 20.2 Phase 3 - Job Posting Analytics (HIGH PRIORITY)

| ID | Area | Task | Status | Priority | Notes |
|---|---|---|---|---|---|
| P3-02.1 | Analytics | job_views table + indexes | ✅ | HIGH | Section 19.2 |
| P3-02.2 | Analytics | search_analytics table | ✅ | HIGH | Section 19.2 |
| P3-02.3 | Analytics | Materialized views (daily stats) | ✅ | HIGH | mv_daily_job_stats, mv_daily_views |
| P3-02.4 | Analytics | Analytics API endpoints | ✅ | HIGH | Section 19.3 |
| P3-02.5 | Analytics | Main dashboard endpoint | ✅ | HIGH | /admin/analytics/dashboard |
| P3-02.6 | Analytics | Job market analytics endpoint | ✅ | MEDIUM | /admin/analytics/jobs |
| P3-02.7 | Analytics | Search analytics endpoint | ✅ | MEDIUM | /admin/analytics/searches |
| P3-02.8 | Analytics | Frontend tracking (analytics.js) | ✅ | HIGH | Section 19.6 |
| P3-02.9 | Analytics | Analytics dashboard UI | ✅ | MEDIUM | Section 19.5 |
| P3-02.10 | Analytics | Chart.js visualizations | ✅ | MEDIUM | Categories, regions, salary |
| P3-02.11 | Analytics | Scheduled view refresh | ✅ | MEDIUM | Section 19.7 |
| P3-02.12 | Analytics | Daily report generation | ✅ | LOW | generate_daily_summary() |
| P3-02.13 | Analytics | Weekly email reports | ⬜ | LOW | Section 19.9 |
| P3-02.14 | Analytics | Data retention cleanup | ✅ | LOW | cleanup_old_analytics() |

### 20.3 Phase 1 Extended Tracker (LOW PRIORITY)

| ID | Area | Task | Status | Priority | Notes |
|---|---|---|---|---|---|
| P1-03.4 | DB | Extended schema (salary, employment_type) | ✅ | LOW | Section 4.3.1 (in initial schema) |
| P1-03.5 | DB | Companies table | ✅ | LOW | Implemented in initial schema |
| P1-03.6 | DB | Regions table with hierarchy | ✅ | LOW | Implemented in initial schema |
| P1-04.6 | Frontend | PWA manifest.json | ✅ | LOW | Section 4.4.1 |
| P1-04.7 | Frontend | Service worker | ✅ | LOW | sw.js with caching |
| P1-04.8 | Frontend | Offline page | ✅ | LOW | offline.html |
| P1-04.9 | Frontend | Social share buttons | ✅ | LOW | share.js (FB, TG, WA, LI, Copy) |
| P1-07.1 | Monitoring | Sentry integration | ✅ | MEDIUM | Section 17.1 |
| P1-07.2 | Monitoring | Structured logging | ✅ | LOW | JSON logs + request ID |

### 20.4 Phase 2 Extended Tracker (LOW PRIORITY)

| ID | Area | Task | Status | Priority | Notes |
|---|---|---|---|---|---|
| P2-03.2 | Adapters | hr.ge adapter | ✅ | MEDIUM | Second parser source |
| P2-10.1 | Social | Telegram bot setup | ⬜ | LOW | Section 15.2 |
| P2-10.2 | Social | Bot commands (/search, /latest) | ⬜ | LOW | |
| P2-10.3 | Social | Subscription system | ⬜ | LOW | |
| P2-10.4 | Social | Daily digest notifications | ⬜ | LOW | |
| P2-11.1 | Performance | Lighthouse > 90 | ✅ | LOW | Section 16.6 |
| P2-12.1 | QA | Parser tests | ✅ | LOW | Unit tests for adapters + utils |
| P2-12.2 | QA | CI test pipeline | ✅ | MEDIUM | Section 14.7 |

### 20.5 DevOps & Infrastructure (MEDIUM PRIORITY)

| ID | Area | Task | Status | Priority | Notes |
|---|---|---|---|---|---|
| P2-09.1 | DevOps | Multi-stage Docker builds | ✅ | LOW | Already implemented |
| P2-09.2 | DevOps | GitHub Actions CI/CD | ✅ | MEDIUM | Section 12.2 |
| P2-09.5 | DevOps | Uptime monitoring | ✅ | LOW | Section 12.5 |
