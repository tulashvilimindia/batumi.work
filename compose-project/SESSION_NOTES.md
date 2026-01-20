# Session Notes - batumi.work

**Last Updated:** January 20, 2026
**Status:** LIVE - All Regions Parsing with jobs.ge Filter Model

---

## Deployment Status

**LIVE URL:** https://batumi.work

| Service | Status | URL |
|---------|--------|-----|
| Website (Georgian) | ✅ Live | https://batumi.work/ge/ |
| Website (English) | ✅ Live | https://batumi.work/en/ |
| API | ✅ Live | https://batumi.work/api/v1/ |
| API Docs | ✅ Live | https://batumi.work/docs |
| Health Check | ✅ Live | https://batumi.work/health |
| Parser Stats | ✅ Live | https://batumi.work/api/v1/stats |
| Admin Dashboard | ✅ Live | http://38.242.143.10:9000 (direct) |

---

## Server Details

| Setting | Value |
|---------|-------|
| Server IP | 38.242.143.10 |
| SSH Access | `ssh root@38.242.143.10` |
| Project Location | `/opt/batumi-work/compose-project` |
| Nginx Config | `/etc/nginx/sites-available/batumi.work` |

### Port Configuration

| Port | Service | Binding | Access |
|------|---------|---------|--------|
| 8100 | Web (nginx) | 127.0.0.1 | Via Cloudflare |
| 8101 | API (FastAPI) | 127.0.0.1 | Via nginx |
| 5433 | PostgreSQL | 127.0.0.1 | Internal only |
| 9000 | Admin Dashboard | 0.0.0.0 | Direct (UFW protected) |

### Docker Containers

```
NAME              IMAGE                    STATUS          PORTS
jobboard-api      compose-project-api      Up (healthy)    127.0.0.1:8101->8000/tcp
jobboard-db       postgres:15-alpine       Up (healthy)    127.0.0.1:5433->5432/tcp
jobboard-web      nginx:alpine             Up (healthy)    127.0.0.1:8100->80/tcp
jobboard-worker   compose-project-worker   Up              (parser service)
jobboard-admin    compose-project-admin    Up (healthy)    0.0.0.0:9000->8000/tcp
```

---

## API Filter System (jobs.ge Compatible)

The API now uses the same filter model as jobs.ge, supporting both slug-based and ID-based filtering:

### Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `cid` | int | jobs.ge category ID | `cid=6` (IT/Programming) |
| `lid` | int | jobs.ge location/region ID | `lid=14` (Adjara) |
| `category` | string | Our category slug | `category=it-programming` |
| `region` | string | Our region slug | `region=adjara` |
| `location` | string | Location text search (ILIKE) | `location=ბათუმი` |

### Example API Calls

```bash
# Get IT jobs in Adjara (using jobs.ge IDs)
curl "https://batumi.work/api/v1/jobs?cid=6&lid=14"

# Get all jobs in Adjara
curl "https://batumi.work/api/v1/jobs?lid=14"

# Get parser statistics
curl "https://batumi.work/api/v1/stats"
```

### Jobs.ge Category IDs (cid)

| cid | Category | Our Slug |
|-----|----------|----------|
| 1 | ადმინისტრაცია (Administration) | hr-admin |
| 2 | გაყიდვები (Sales) | sales-marketing |
| 3 | ფინანსები (Finance) | finance-accounting |
| 4 | PR/მარკეტინგი (Marketing) | sales-marketing |
| 5 | ლოგისტიკა (Logistics) | logistics-transport |
| 6 | IT/პროგრამირება (IT) | it-programming |
| 7 | სამართალი (Law) | legal |
| 8 | მედიცინა (Medicine) | medicine-healthcare |
| 9 | სხვა (Other) | other |
| 10 | კვება (Food) | tourism-hospitality |
| 11 | მშენებლობა (Construction) | construction |
| 12 | განათლება (Education) | education |
| 13 | მედია (Media) | design-creative |
| 14 | სილამაზე (Beauty) | design-creative |
| 16 | დასუფთავება (Cleaning) | other |
| 17 | დაცვა (Security) | hr-admin |
| 18 | ტექნიკური (Technical) | manufacturing |

### Jobs.ge Region IDs (lid)

| lid | Region | Our Slug |
|-----|--------|----------|
| 14 | აჭარის ა/რ (Adjara) | adjara |
| 1 | თბილისი (Tbilisi) | tbilisi |
| 8 | იმერეთი (Imereti) | imereti |
| 3 | კახეთი (Kakheti) | kakheti |
| 5 | ქვემო ქართლი (Kvemo Kartli) | kvemo-kartli |
| 6 | შიდა ქართლი (Shida Kartli) | shida-kartli |
| 9 | გურია (Guria) | guria |
| 7 | სამცხე-ჯავახეთი (Samtskhe-Javakheti) | samtskhe-javakheti |
| 4 | მცხეთა-მთიანეთი (Mtskheta-Mtianeti) | mtskheta-mtianeti |
| 13 | სამეგრელო (Samegrelo) | samegrelo |
| 12 | რაჭა-ლეჩხუმი (Racha-Lechkhumi) | racha-lechkhumi |
| 17 | დისტანციური (Remote) | remote |

---

## SSL Configuration

- **Public SSL:** Cloudflare (automatic)
- **Origin SSL:** Self-signed certificate
- **Certificate Location:** `/etc/ssl/certs/batumi.work.crt`
- **Key Location:** `/etc/ssl/private/batumi.work.key`

Cloudflare handles public-facing SSL. Origin uses self-signed cert for encrypted connection between Cloudflare and server.

---

## Database

- **Seeded Data:**
  - 16 categories
  - 14 regions
  - 300+ jobs (from all regions parser)

- **Alembic Version:** Stamped at head (20260119_000003)

---

## Configuration Files

### 1. `.env` (Production)
Located at: `/opt/batumi-work/compose-project/.env`

Key settings:
```bash
PARSE_REGIONS=all          # Parse all Georgian regions
PARSER_INTERVAL_MINUTES=60 # Run every hour
API_PORT=127.0.0.1:8101
WEB_PORT=127.0.0.1:8100
DB_PORT=127.0.0.1:5433
```

### 2. Frontend Configuration
File: `web/static/js/app.js`
```javascript
const ADJARA_LID = 14;  // jobs.ge region ID for Adjara
// Uses lid=14 filter for Adjara region jobs
```

### 3. Nginx Virtual Host
Located at: `/etc/nginx/sites-available/batumi.work`

---

## Service Status

- [x] **Parser Service:** Running (parses ALL regions, ALL categories every 60 minutes)
- [x] **Stats Endpoint:** `/api/v1/stats` shows real-time parser progress
- [ ] **Telegram Bot:** Token needs to be added to `.env`
- [ ] **Email Reports:** SMTP credentials not configured

---

## Completed Tasks

### January 20, 2026 (Latest Session)

#### 1. API Re-engineering for jobs.ge Compatibility ✅
- Added `cid` (category ID) and `lid` (location ID) query parameters
- Updated `JobSearchParams` schema with jobs.ge filter fields
- Updated `JobListItem` and `JobResponse` to include `jobsge_cid` and `jobsge_lid`
- API now mirrors jobs.ge filtering exactly

**Files changed:**
- `api/app/routers/jobs.py` - Added cid/lid parameters
- `api/app/schemas/job.py` - Added cid/lid to schemas
- `api/app/services/job_service.py` - Added cid/lid filtering logic

#### 2. Parser Stats Endpoint ✅
- Created `/api/v1/stats` endpoint for monitoring parser progress
- Shows job counts by region (lid) and category (cid)
- Useful for verifying parser is working across all regions

**File created:**
- `api/app/routers/stats.py`

#### 3. All Regions Parsing ✅
- Changed `PARSE_REGIONS=adjara` to `PARSE_REGIONS=all`
- Parser now iterates through all 12 regions × 17 categories
- Each region/category combination fetched from jobs.ge

#### 4. Frontend Location Filter Fix ✅
- **Problem:** Website showed 0 jobs despite 300+ in database
- **Cause:** Frontend used `location=აჭარა` but jobs had `location=აჭარის ა/რ`
- **Fix:** Changed frontend to use `lid=14` (jobs.ge region ID) instead of text search
- Added cache-busting `?v=2` to script URLs to bypass Cloudflare cache

**Files changed:**
- `web/static/js/app.js` - Changed `LOCATION_FILTER` to `ADJARA_LID = 14`
- `web/static/ge/index.html` - Updated script reference
- `web/static/en/index.html` - Updated script reference
- `web/static/ge/job.html` - Updated script reference
- `web/static/en/job.html` - Updated script reference

#### 5. Category Classification Fix ✅ (Earlier)
- Rewrote `classify_category()` with two-pass scoring system
- Added Georgian word stems for IT jobs
- Fixed Sales Consultant misclassification

---

## Common Operations

### View Parser Stats
```bash
curl https://batumi.work/api/v1/stats
```

### View Logs
```bash
ssh root@38.242.143.10
cd /opt/batumi-work/compose-project
docker compose logs -f worker  # Parser logs
docker compose logs -f api     # API logs
```

### Restart Services
```bash
docker compose restart
docker compose restart api
docker compose restart worker
```

### Update Application
```bash
cd /opt/batumi-work/compose-project
git pull origin main
docker compose build
docker compose up -d
```

### Start All Services
```bash
docker compose --profile parser up -d
```

### Check Job Distribution
```bash
docker exec jobboard-db psql -U jobboard -d jobboard -c \
  "SELECT jobsge_cid, COUNT(*) FROM jobs GROUP BY jobsge_cid ORDER BY COUNT(*) DESC;"
```

---

## DNS Configuration (Cloudflare)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | (Cloudflare) | Proxied |
| A | www | (Cloudflare) | Proxied |

DNS is managed through Cloudflare with proxy enabled.

---

## Repository

- **GitHub:** https://github.com/tulashvilimindia/batumi.work
- **Branch:** main
- **Status:** All documentation updated

---

## Changelog

### January 20, 2026 (Session 2)
- **Frontend Fix - DEPLOYED**
  - Fixed 0 jobs showing on website
  - Changed from `location=აჭარა` text search to `lid=14` region ID filter
  - Added cache-busting to bypass Cloudflare CDN cache

- **API jobs.ge Compatibility - DEPLOYED**
  - Added `cid` and `lid` query parameters to `/api/v1/jobs`
  - Response now includes `jobsge_cid` and `jobsge_lid` fields
  - Full parity with jobs.ge filtering model

- **Stats Endpoint - DEPLOYED**
  - New `/api/v1/stats` endpoint
  - Shows real-time parser progress
  - Job counts by region and category

- **All Regions Parsing - DEPLOYED**
  - Changed from Adjara-only to all regions
  - Parser now covers 12 regions × 17 categories

### January 20, 2026 (Session 1)
- **Category Classification Fix - DEPLOYED**
  - Rewrote `classify_category()` in `worker/app/core/utils.py`
  - Two-pass scoring: multi-word phrases first, then single keywords
  - Added Georgian word stems for IT jobs
  - Verified: IT jobs correctly classified, sales consultants in sales-marketing

### January 19, 2026
- Initial deployment to production server
- All core services running (web, api, db, worker)
- SSL configured via Cloudflare

---

*Deployment completed: January 19, 2026*
*Last session: January 20, 2026*
