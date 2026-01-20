# Session Notes - batumi.work

**Last Updated:** January 20, 2026
**Status:** DEPLOYED AND LIVE - Category Classification Fix Ready

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

---

## Server Details

| Setting | Value |
|---------|-------|
| Server IP | 38.242.143.10 |
| SSH Access | `ssh root@38.242.143.10` |
| Project Location | `/opt/batumi-work/compose-project` |
| Nginx Config | `/etc/nginx/sites-available/batumi.work` |

### Port Configuration

| Port | Service | Binding |
|------|---------|---------|
| 8100 | Web (nginx) | 127.0.0.1 |
| 8101 | API (FastAPI) | 127.0.0.1 |
| 5433 | PostgreSQL | 127.0.0.1 (internal) |

### Docker Containers

```
NAME              IMAGE                    STATUS          PORTS
jobboard-api      compose-project-api      Up (healthy)    127.0.0.1:8101->8000/tcp
jobboard-db       postgres:15-alpine       Up (healthy)    127.0.0.1:5433->5432/tcp
jobboard-web      nginx:alpine             Up (healthy)    127.0.0.1:8100->80/tcp
jobboard-worker   compose-project-worker   Up              (parser service)
```

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
  - 20 sample jobs

- **Alembic Version:** Stamped at head (20260119_000003)

---

## Configuration Files Created

### 1. `.env` (Production credentials)
Located at: `/opt/batumi-work/compose-project/.env`
- Secure passwords generated
- Telegram bot token needs to be added

### 2. Port Configuration in `.env`
```bash
API_PORT=127.0.0.1:8101
WEB_PORT=127.0.0.1:8100
DB_PORT=127.0.0.1:5433
```

### 3. Nginx Virtual Host
Located at: `/etc/nginx/sites-available/batumi.work`
- HTTP → HTTPS redirect
- www → non-www redirect
- Proxy to Docker containers
- Self-signed SSL for Cloudflare origin

---

## Service Status

- [x] **Parser Service:** Running (parses jobs.ge every 60 minutes)
- [ ] **Telegram Bot:** Token needs to be added to `.env`
- [ ] **Email Reports:** SMTP credentials not configured

---

## Pending Tasks / Known Issues

### 1. Category Classification Fix (CODE COMPLETE - NEEDS DEPLOYMENT)

**Problem:** Jobs were incorrectly categorized. For example, "გაყიდვების კონსულტანტი" (Sales Consultant) was classified as IT instead of Sales.

**Root Cause:** The `classify_category` function used first-match logic with broad keywords.

**Fixes Applied (January 20, 2026):**
1. **Two-pass scoring system:**
   - Multi-word phrases checked first (5 points in title, 2 points in body)
   - Single keywords checked second (3 points in title, 1 point in body)
2. **Phrase-first matching:** "გაყიდვების კონსულტანტი" and "Sales Consultant" matched as phrases → sales-marketing
3. **Removed generic "კონსულტანტი"** from customer-service to avoid false positives
4. **Added missing categories:** legal, design-creative, media-journalism, agriculture, manufacturing, security, cleaning
5. **Minimum score threshold:** Increased to 3 points for confident classification
6. **Updated tests:** Fixed test expectations (hr-admin instead of administration, "other" instead of None)

**Status:** ✅ Code complete and tested locally, **NEEDS DEPLOYMENT**

**TO DEPLOY, run these commands on server:**
```bash
# SSH to server
ssh root@38.242.143.10

# Go to project
cd /opt/batumi-work/compose-project

# Pull latest code
git pull

# Rebuild worker with new classification logic
docker compose build worker

# Clear existing jobs to re-parse with correct categories
docker compose exec db psql -U jobboard -d jobboard -c 'DELETE FROM channel_message_history; DELETE FROM channel_message_queue; DELETE FROM jobs;'

# Run parser once (takes ~10-15 minutes)
docker compose --profile parser run --rm worker python -m app.main --once
```

**Verify fix after parsing completes:**
```bash
# Check category distribution (IT should have ~10-20 jobs, not 100+)
docker compose exec db psql -U jobboard -d jobboard -c "SELECT c.slug, c.name_ge, COUNT(j.id) FROM categories c LEFT JOIN jobs j ON c.id = j.category_id GROUP BY c.id ORDER BY COUNT(j.id) DESC;"

# Verify sales jobs are correctly categorized
docker compose exec db psql -U jobboard -d jobboard -c "SELECT j.title_ge, c.slug FROM jobs j JOIN categories c ON j.category_id = c.id WHERE j.title_ge LIKE '%გაყიდვ%' LIMIT 10;"

# Check IT category has actual IT jobs
docker compose exec db psql -U jobboard -d jobboard -c "SELECT j.title_ge FROM jobs j JOIN categories c ON j.category_id = c.id WHERE c.slug = 'it-programming' LIMIT 10;"
```

**Expected Results:**
- IT category: ~10-20 actual IT/developer jobs (not 100+)
- Sales-Marketing: ~60-80 jobs
- "გაყიდვების კონსულტანტი" should be in **sales-marketing** (NOT it-programming)
- Unknown jobs should fall into "other" category

### 2. Frontend Table Layout

**Status:** ✅ Completed
- Redesigned to match jobs.ge table layout
- Columns: Position, Company, Published, Deadline
- Company names now extracted correctly

### 3. Parser Company Name Extraction

**Status:** ✅ Completed
- Fixed to skip "ამ ორგანიზაციის ყველა განცხადება" links
- Fixed to skip "ყველა ვაკანსია ერთ გვერდზე" links
- Now extracts actual company names

---

## Common Operations

### View Logs
```bash
ssh root@38.242.143.10
cd /opt/batumi-work/compose-project
docker compose logs -f
docker compose logs -f api
```

### Restart Services
```bash
docker compose restart
```

### Update Application
```bash
cd /opt/batumi-work/compose-project
git pull origin main
docker compose build
docker compose up -d
```

### Start Parser
```bash
docker compose --profile parser up -d
```

### Start Telegram Bot
First add `TELEGRAM_BOT_TOKEN` to `.env`, then:
```bash
docker compose --profile bot up -d
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
- **Status:** All documentation up to date

---

---

## Changelog

### January 20, 2026
- **Category Classification Fix (Major)**
  - Rewrote `classify_category()` in `worker/app/core/utils.py`
  - Added two-pass scoring: multi-word phrases first, then single keywords
  - Added 7 new categories: legal, design-creative, media-journalism, agriculture, manufacturing, security, cleaning
  - Fixed "Sales Consultant" misclassification (was going to IT, now goes to sales-marketing)
  - Updated unit tests in `worker/tests/unit/test_utils.py`
  - Files changed:
    - `worker/app/core/utils.py` - Classification algorithm
    - `worker/tests/unit/test_utils.py` - Test cases

### January 19, 2026
- Initial deployment to production server
- All core services running (web, api, db, worker)
- SSL configured via Cloudflare

---

*Deployment completed: January 19, 2026*
