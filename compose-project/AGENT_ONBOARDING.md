# Agent Onboarding Guide - batumi.work

**Last Updated:** January 23, 2026
**Project:** Georgian Job Board (batumi.work)
**Code Quality:** SonarQube A Rating (Security & Maintainability)

---

## Quick Start Checklist

1. Read this file completely
2. Read `SESSION_NOTES.md` for detailed history
3. Read `admin-ui/BUGFIX_LOG.md` for recent bug fixes
4. Test SSH access: `ssh root@38.242.143.10`
5. Verify services: `docker ps`

---

## Project Overview

**batumi.work** is a job aggregator website that:
- Parses jobs from jobs.ge (Georgian job portal)
- Displays jobs filtered by region (originally Adjara/Batumi, now all regions)
- Provides bilingual interface (Georgian/English)
- Has a React-based admin panel for management

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION STACK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ React Admin UI  │     │  Public Website │                    │
│  │  Port 20001     │     │  batumi.work    │                    │
│  │  (No auth)      │     │  via Cloudflare │                    │
│  └────────┬────────┘     └────────┬────────┘                    │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │  Admin Service  │     │   API Service   │                    │
│  │  Port 9000      │     │   Port 8101     │                    │
│  │  FastAPI        │     │   FastAPI       │                    │
│  └────────┬────────┘     └────────┬────────┘                    │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       ▼                                          │
│              ┌─────────────────┐                                 │
│              │   PostgreSQL    │                                 │
│              │   Port 5433     │                                 │
│              └─────────────────┘                                 │
│                       ▲                                          │
│                       │                                          │
│              ┌─────────────────┐                                 │
│              │  Worker/Parser  │                                 │
│              │  (Background)   │                                 │
│              └─────────────────┘                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Server Access

| Item | Value |
|------|-------|
| **Server IP** | 38.242.143.10 |
| **SSH Command** | `ssh root@38.242.143.10` |
| **Project Path** | `/opt/batumi-work/compose-project` |
| **GitHub Repo** | https://github.com/tulashvilimindia/batumi.work |

---

## Docker Containers

```bash
# List all containers
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| jobboard-admin-ui | compose-project-admin-ui | 20001→80 | React Admin Panel |
| jobboard-admin | compose-project-admin | 9000→8000 | Admin API (FastAPI) |
| jobboard-api | compose-project-api | 8101→8000 | Public API (FastAPI) |
| jobboard-web | nginx:alpine | 8100→80 | Public Website |
| jobboard-worker | compose-project-worker | - | Parser Service |
| jobboard-db | postgres:15-alpine | 5433→5432 | PostgreSQL Database |

---

## Key URLs

| URL | Purpose |
|-----|---------|
| https://batumi.work | Production website |
| https://batumi.work/ge/ | Georgian version |
| https://batumi.work/en/ | English version |
| https://batumi.work/api/v1/jobs | Public API |
| https://batumi.work/docs | API documentation |
| http://38.242.143.10:20001 | React Admin Panel |
| http://38.242.143.10:9000 | Admin API (direct) |

---

## Common Operations

### View Logs
```bash
ssh root@38.242.143.10

# Admin UI logs
docker logs jobboard-admin-ui -f --tail 100

# Admin API logs
docker logs jobboard-admin -f --tail 100

# Parser/Worker logs
docker logs jobboard-worker -f --tail 100

# Public API logs
docker logs jobboard-api -f --tail 100
```

### Rebuild & Deploy Admin UI
```bash
ssh root@38.242.143.10
cd /opt/batumi-work/compose-project

# Pull latest code
git pull origin main

# Rebuild (use --no-cache if changes don't appear)
docker compose build admin-ui
# OR force rebuild:
docker compose build --no-cache admin-ui

# Deploy
docker compose up -d admin-ui

# Verify
docker ps --filter name=admin-ui
```

### Rebuild All Services
```bash
cd /opt/batumi-work/compose-project
docker compose build
docker compose up -d
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it jobboard-db psql -U jobboard -d jobboard

# Common queries
SELECT COUNT(*) FROM jobs;
SELECT status, COUNT(*) FROM jobs GROUP BY status;
SELECT jobsge_lid, COUNT(*) FROM jobs GROUP BY jobsge_lid;
```

### Sync Code (Local → Server)
```bash
# From local machine
cd C:\Users\MindiaTulashvili\OneDrive\Desktop\batumi.work
git add -A
git commit -m "Your message"
git push origin main

# On server
ssh root@38.242.143.10
cd /opt/batumi-work/compose-project
git pull origin main
docker compose build admin-ui
docker compose up -d admin-ui
```

---

## Directory Structure

```
batumi.work/
├── compose-project/
│   ├── docker-compose.yml      # Main compose file
│   ├── docker-compose.override.yml
│   ├── .env                    # Environment variables
│   ├── SESSION_NOTES.md        # Project history & details
│   ├── AGENT_ONBOARDING.md     # This file
│   │
│   ├── admin-ui/               # React Admin Panel
│   │   ├── src/
│   │   │   ├── api/            # API client functions
│   │   │   ├── hooks/          # TanStack Query hooks
│   │   │   ├── pages/          # Page components
│   │   │   └── components/     # UI components
│   │   ├── nginx.conf          # Proxy config
│   │   ├── Dockerfile
│   │   └── BUGFIX_LOG.md       # Bug fixes documentation
│   │
│   ├── admin/                  # Admin API (FastAPI)
│   │   └── app/
│   │       ├── routers/        # API endpoints
│   │       └── main.py
│   │
│   ├── api/                    # Public API (FastAPI)
│   │   └── app/
│   │       ├── routers/
│   │       ├── schemas/
│   │       └── services/
│   │
│   ├── worker/                 # Parser Service
│   │   └── app/
│   │       ├── core/           # Parser logic
│   │       ├── parsers/        # Site-specific parsers
│   │       └── models/
│   │
│   └── web/                    # Public Website (static)
│       └── static/
│           ├── ge/             # Georgian pages
│           ├── en/             # English pages
│           └── js/             # Frontend JS
```

---

## React Admin UI Details

### Technology Stack
- **Framework:** React 18 + TypeScript + Vite
- **State Management:** TanStack Query (React Query)
- **UI Components:** Radix UI + Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router

### API Client Configuration
```typescript
// admin-ui/src/api/client.ts
const API_BASE_URL = '/api'  // Proxied by nginx to admin:8000
```

### Nginx Proxy (admin-ui)
```nginx
# /api/ requests are proxied to admin service
location /api/ {
    proxy_pass http://admin:8000/api/;
}
```

### Known Issues & Fixes

1. **Radix UI Select with empty string**
   - Problem: `value=""` causes errors
   - Fix: Use `value="all"` instead

2. **Optional chaining for API responses**
   - Problem: Some endpoints return objects without all properties
   - Fix: Always use `obj?.property` for optional fields

3. **Categories/Regions endpoints**
   - Problem: `/api/categories` and `/api/regions` don't exist
   - Fix: Use `/api/parser/config` which contains both

See `admin-ui/BUGFIX_LOG.md` for detailed bug documentation.

---

## API Endpoints Reference

### Admin API (port 9000)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/dashboard` | GET | Dashboard stats |
| `/api/jobs` | GET | List jobs with filters |
| `/api/jobs/{id}` | GET | Get single job |
| `/api/parser/config` | GET | Parser config (regions, categories) |
| `/api/parser/jobs` | GET | Parse job history |
| `/api/parser/progress` | GET | Current parser progress |
| `/api/parser/stats` | GET | Parser statistics |
| `/api/parser/trigger` | POST | Trigger parser manually |
| `/api/backups` | GET | List backups |
| `/api/backups` | POST | Create backup |
| `/api/backups/status` | GET | Backup system status |
| `/api/logs/{service}` | GET | Get container logs |
| `/api/analytics/dashboard` | GET | Analytics data |

### Public API (port 8101)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/jobs` | GET | List jobs (public) |
| `/api/v1/jobs/{id}` | GET | Get job details |
| `/api/v1/stats` | GET | Public statistics |
| `/health` | GET | Health check |

---

## Database Schema

### Key Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| jobs | Job listings | id, title_ge, title_en, company_name, location, status, jobsge_cid, jobsge_lid |
| categories | Job categories | id, name_ge, name_en, slug, jobsge_cid |
| regions | Geographic regions | id, name_ge, name_en, slug, jobsge_lid |
| parse_jobs | Parser run history | id, status, progress, timing |
| parse_job_items | Individual parsed items | id, parse_job_id, external_id, status |

### Jobs.ge ID Mappings

Categories (cid):
- 1: Administration, 2: Sales, 3: Finance, 4: Marketing
- 5: Logistics, 6: IT, 7: Law, 8: Medicine
- 9: Other, 10: Food, 11: Construction, 12: Education

Regions (lid):
- 1: Tbilisi, 14: Adjara, 8: Imereti, 3: Kakheti
- 5: Kvemo Kartli, 6: Shida Kartli, 17: Remote

---

## Troubleshooting

### Admin UI shows blank page
1. Check browser console for errors
2. Check nginx logs: `docker logs jobboard-admin-ui`
3. Check API is responding: `curl http://localhost:9000/api/health`

### API returns 404
1. Verify endpoint exists in backend
2. Check nginx proxy configuration
3. Verify container is running: `docker ps`

### Parser not running
1. Check worker logs: `docker logs jobboard-worker -f`
2. Verify database connection
3. Check parser config: `curl http://localhost:9000/api/parser/config`

### Code changes not appearing
1. Force rebuild: `docker compose build --no-cache <service>`
2. Clear browser cache (Ctrl+Shift+R)
3. Verify git is synced: `git log --oneline -3`

---

## Environment Variables

Located at `/opt/batumi-work/compose-project/.env`:

```bash
# Database
POSTGRES_USER=jobboard
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=jobboard

# Parser
PARSE_REGIONS=all
PARSER_INTERVAL_MINUTES=60

# Ports (internal binding)
API_PORT=127.0.0.1:8101
WEB_PORT=127.0.0.1:8100
DB_PORT=127.0.0.1:5433
```

---

## Code Quality (SonarQube)

The project maintains high code quality standards verified by SonarQube:

| Metric | Value | Rating |
|--------|-------|--------|
| **Security** | 0 vulnerabilities | A |
| **Reliability** | 0 bugs* | A |
| **Maintainability** | 163 code smells | A |
| **Technical Debt** | ~21 hours | A |
| **Duplications** | 1.2% | - |

*One false positive exists for Table component (compositional pattern)

### Key Modernizations (Jan 23, 2026)
- `datetime.utcnow()` → `datetime.now(timezone.utc)` (Python 3.12+)
- `pytz` → `zoneinfo` (Python 3.9+ standard library)
- Async subprocess calls in backup operations
- WCAG-compliant table accessibility
- ReDoS-safe regex patterns

---

## Recent Session History

### January 23, 2026 (Current)
- **SonarQube Code Quality Remediation**
  - Fixed all BLOCKER and CRITICAL vulnerabilities
  - Modernized datetime handling across 17+ files
  - Fixed async/await patterns in backup operations
  - Added proper ARIA roles for accessibility
  - Fixed ReDoS regex vulnerabilities
- Deployed all fixes to production

### January 22, 2026
- Fixed Parser page crash (optional chaining for `controls`)
- Fixed Jobs page 404 errors (categories from parser/config)
- Fixed Logs page Select errors (empty string → 'all')
- Fixed Backups API endpoint mismatches
- Fixed Analytics region breakdown query
- Updated all documentation for agent handoff

### January 21, 2026
- Added E2E test suite (77 tests)
- Enhanced Parser UI with job controls
- Fixed job sorting to match jobs.ge order

### January 20, 2026
- Added jobs.ge compatible filters (cid, lid)
- Fixed frontend showing 0 jobs
- Enabled all-region parsing

---

## Contact & Resources

- **GitHub:** https://github.com/tulashvilimindia/batumi.work
- **Production:** https://batumi.work
- **Server:** 38.242.143.10

---

*Document created for agent knowledge transfer - January 22, 2026*
