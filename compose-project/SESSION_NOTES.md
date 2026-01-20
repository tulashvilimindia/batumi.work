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

### 1. Category Classification Fix

**Status:** ✅ DEPLOYED AND VERIFIED (January 20, 2026)

**Problem (Resolved):** Jobs were incorrectly categorized. For example, "გაყიდვების კონსულტანტი" (Sales Consultant) was classified as IT instead of Sales. IT jobs like "IT ინჟინერი" were going to "other" category.

**Root Cause:** The `classify_category` function used first-match logic with broad keywords.

**Fixes Applied:**
1. **Two-pass scoring system:**
   - Multi-word phrases checked first (5 points in title, 2 points in body)
   - Single keywords checked second (3 points in title, 1 point in body)
2. **Phrase-first matching:** "გაყიდვების კონსულტანტი" and "Sales Consultant" matched as phrases → sales-marketing
3. **Georgian word stems for IT:** Added "it ინჟინერ", "it მხარდაჭერ", "it ქსელ" to match word variations
4. **Removed generic "კონსულტანტი"** from customer-service to avoid false positives
5. **Added missing categories:** legal, design-creative, media-journalism, agriculture, manufacturing, security, cleaning
6. **Minimum score threshold:** 3 points for confident classification

**Verified Results (January 20, 2026):**
- IT jobs correctly classified:
  - "IT მხარდაჭერის სპეციალისტი" → it-programming ✓
  - "IT ინჟინერი" → it-programming ✓
  - "IT ინჟინერი - Microsoft" → it-programming ✓
  - "IT ქსელის ინჟინერი" → it-programming ✓
- Sales consultants correctly classified → sales-marketing ✓
- Category distribution: IT=5, Sales=53, Finance=53 (reasonable)

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
- **Category Classification Fix - DEPLOYED**
  - Rewrote `classify_category()` in `worker/app/core/utils.py`
  - Added two-pass scoring: multi-word phrases first, then single keywords
  - Added Georgian word stems for IT jobs: "it ინჟინერ", "it მხარდაჭერ", "it ქსელ"
  - Added 7 new categories: legal, design-creative, media-journalism, agriculture, manufacturing, security, cleaning
  - Fixed "Sales Consultant" misclassification (was going to IT, now goes to sales-marketing)
  - Fixed IT jobs going to "other" (now correctly go to it-programming)
  - Deployed to production and verified:
    - Cleared database and re-parsed 300 jobs
    - All 4 IT jobs correctly classified
    - Sales consultants correctly in sales-marketing
  - Files changed:
    - `worker/app/core/utils.py` - Classification algorithm
    - `worker/tests/unit/test_utils.py` - Test cases

### January 19, 2026
- Initial deployment to production server
- All core services running (web, api, db, worker)
- SSL configured via Cloudflare

---

*Deployment completed: January 19, 2026*
