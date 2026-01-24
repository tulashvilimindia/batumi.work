# HR.GE Parser System - Management Documentation

**Version:** 1.0.0
**Last Updated:** January 2026
**Document Type:** Technical & Business Documentation for Management

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Business Value](#3-business-value)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Model](#5-data-model)
6. [Parser Operations](#6-parser-operations)
7. [API Capabilities](#7-api-capabilities)
8. [Deployment & Infrastructure](#8-deployment--infrastructure)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Security Considerations](#10-security-considerations)
11. [Cost Analysis](#11-cost-analysis)
12. [Roadmap & Future Enhancements](#12-roadmap--future-enhancements)

---

## 1. Executive Summary

### What is HR.GE Parser?

HR.GE Parser is an **automated job data collection system** that scrapes job listings from HR.GE (Georgia's largest job portal) and stores them in a structured database with a REST API for data access.

### Key Facts

| Metric | Value |
|--------|-------|
| **Data Source** | hr.ge (tenant 1 - all 6 portals share same data) |
| **Update Frequency** | Every 6 hours (automatic) |
| **Data Storage** | PostgreSQL database |
| **Access Method** | REST API (FastAPI) |
| **Deployment** | Docker containers |

### Primary Use Cases

1. **Job Market Analytics** - Analyze salary trends, demand by location/industry
2. **Competitive Intelligence** - Monitor company hiring patterns
3. **Job Board Integration** - Feed data to custom job portals
4. **Research & Reporting** - Generate employment market reports

---

## 2. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HR.GE Parser System                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────────┐    │
│   │   HR.GE     │      │   Parser    │      │   PostgreSQL    │    │
│   │   Website   │─────▶│   Engine    │─────▶│   Database      │    │
│   │   Sitemap   │      │             │      │                 │    │
│   └─────────────┘      └─────────────┘      └────────┬────────┘    │
│                                                       │             │
│                                                       ▼             │
│                                              ┌─────────────────┐    │
│                                              │   REST API      │    │
│                                              │   (FastAPI)     │    │
│                                              └────────┬────────┘    │
│                                                       │             │
└───────────────────────────────────────────────────────┼─────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Consumers     │
                                               │   - Frontend    │
                                               │   - Analytics   │
                                               │   - Reports     │
                                               └─────────────────┘
```

### Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Parser Engine** | Python 3.11 | Scrapes jobs from HR.GE |
| **Database** | PostgreSQL 15 | Stores all job data |
| **REST API** | FastAPI | Provides data access |
| **Scheduler** | APScheduler | Automates parsing every 6 hours |
| **Container Runtime** | Docker | Deployment & isolation |

---

## 3. Business Value

### Data Collected

For each job listing, the system captures:

**Core Information:**
- Job title (Georgian & English)
- Full description (HTML)
- Company name and logo
- Publication and deadline dates

**Compensation:**
- Salary range (from/to)
- Currency (GEL default)
- Bonus indicators

**Work Details:**
- Location(s) / City
- Remote work availability
- Student-friendly positions
- Employment type
- Work schedule

**Contact Information:**
- Email, phone
- Contact person name

**Metadata:**
- Original HR.GE job ID
- Raw JSON response (for future analysis)

### Analytics Capabilities

The API provides built-in analytics:

| Endpoint | Business Use |
|----------|--------------|
| `/api/v1/stats` | Dashboard KPIs |
| `/api/v1/stats/by-location` | Geographic job distribution |
| `/api/v1/stats/by-industry` | Industry hiring trends |
| `/api/v1/stats/salary` | Salary market analysis |

### Sample Statistics Response

```json
{
  "total_jobs": 15420,
  "active_jobs": 8750,
  "expired_jobs": 6670,
  "total_companies": 2340,
  "remote_jobs": 1250,
  "student_jobs": 890,
  "jobs_with_salary": 4200,
  "last_updated": "2026-01-24T10:30:00"
}
```

---

## 4. Technical Architecture

### Parser Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Parser Execution Flow                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. SITEMAP FETCH                                                │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ GET https://hr.ge/sitemaps/sitemap-announcements.xml    │  │
│     │ Extract job IDs from URLs: /job/123456-title            │  │
│     │ Result: List of ~10,000-20,000 job IDs                  │  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  2. BATCH PROCESSING (3 concurrent requests)                     │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ For each job ID:                                        │  │
│     │   GET https://api.p.hr.ge/.../announcements/{id}        │  │
│     │   Rate limit: 1 request/second                          │  │
│     │   Retry: 3 attempts with exponential backoff            │  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  3. DATA TRANSFORMATION                                          │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ Parse JSON response                                     │  │
│     │ Extract: title, salary, location, company, etc.         │  │
│     │ Handle nested objects (addresses, languages)            │  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  4. DATABASE UPSERT                                              │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ Check if job exists (by external_id)                    │  │
│     │ If exists: UPDATE all fields                            │  │
│     │ If new: INSERT new record                               │  │
│     │ Also upsert related Company record                      │  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  5. TRACKING                                                     │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ Record in parser_runs table:                            │  │
│     │   - jobs_found, jobs_created, jobs_updated, jobs_failed │  │
│     │   - start_time, end_time, status                        │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Two Parsing Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Full** | Fetches all jobs from sitemap | Initial load, periodic full sync |
| **Incremental** | Fetches recent jobs from API listing | Quick updates between full syncs |

### Rate Limiting & Reliability

- **Rate Limit:** 1 second between requests (configurable)
- **Concurrent Requests:** 3 simultaneous (configurable)
- **Retry Logic:** 3 attempts with exponential backoff (2s, 4s, 8s)
- **Timeout:** 30 seconds per request

---

## 5. Data Model

### Database Schema

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    companies    │       │      jobs       │       │   industries    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │◄──────│ company_id      │       │ id              │
│ external_id     │       │ id              │       │ external_id     │
│ name            │       │ external_id     │       │ name            │
│ name_en         │       │ title           │       │ name_en         │
│ logo_url        │       │ title_en        │       │ parent_id       │
│ industry_id     │───────│ description     │       └─────────────────┘
│ is_anonymous    │       │ salary_from     │
│ raw_json        │       │ salary_to       │       ┌─────────────────┐
└─────────────────┘       │ publish_date    │       │   locations     │
                          │ deadline_date   │       ├─────────────────┤
                          │ is_work_from_   │       │ id              │
                          │   home          │       │ external_id     │
                          │ addresses[]     │       │ name            │
                          │ languages[]     │       │ type            │
                          │ raw_json        │       │ parent_id       │
                          └─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  parser_runs    │       │ specializations │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ started_at      │       │ external_id     │
│ finished_at     │       │ name            │
│ status          │       │ name_en         │
│ jobs_found      │       └─────────────────┘
│ jobs_created    │
│ jobs_updated    │
│ jobs_failed     │
│ run_type        │
└─────────────────┘
```

### Key Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `external_id` | Integer | Original HR.GE ID (unique identifier) |
| `raw_json` | JSONB | Complete API response for future analysis |
| `addresses` | JSONB Array | List of job locations ["Tbilisi", "Batumi"] |
| `languages` | JSONB Array | Required languages ["English", "Georgian"] |
| `is_expired` | Boolean | Whether job deadline has passed |
| `last_scraped_at` | Timestamp | When job was last fetched |

### Storage Estimates

| Timeframe | Estimated Jobs | Database Size |
|-----------|----------------|---------------|
| Initial Load | ~15,000 | ~500 MB |
| After 1 Month | ~20,000 | ~700 MB |
| After 1 Year | ~50,000+ | ~2 GB |

---

## 6. Parser Operations

### Automatic Scheduling

The parser runs automatically every **6 hours** (configurable via `PARSER_SCHEDULE_HOURS`).

**Schedule:** 00:00, 06:00, 12:00, 18:00 (relative to start time)

### Manual Triggers

**Via API:**
```bash
# Full parse (all jobs from sitemap)
curl -X POST http://localhost:8089/api/v1/parser/run?run_type=full

# Incremental parse (recent jobs only)
curl -X POST http://localhost:8089/api/v1/parser/run?run_type=incremental
```

**Via Command Line:**
```bash
# Inside container
docker-compose exec app python scripts/run_parser.py --type full

# Or incremental
docker-compose exec app python scripts/run_parser.py --type incremental
```

### Monitoring Parser Status

**Check Current Status:**
```bash
curl http://localhost:8089/api/v1/parser/status
```

**Response:**
```json
{
  "scheduler_running": true,
  "next_run_time": "2026-01-24T18:00:00",
  "interval_hours": 6,
  "last_run": {
    "id": 42,
    "started_at": "2026-01-24T12:00:00",
    "finished_at": "2026-01-24T12:45:00",
    "status": "completed",
    "jobs_found": 15420,
    "jobs_created": 125,
    "jobs_updated": 15200,
    "jobs_failed": 95,
    "run_type": "full"
  }
}
```

### Parser Run History

```bash
curl http://localhost:8089/api/v1/parser/history?limit=10
```

---

## 7. API Capabilities

### Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/jobs` | List jobs with filters & pagination |
| **GET** | `/api/v1/jobs/{id}` | Get job by internal ID |
| **GET** | `/api/v1/jobs/external/{id}` | Get job by HR.GE ID |
| **GET** | `/api/v1/jobs/search?q=` | Search jobs by keyword |
| **GET** | `/api/v1/jobs/latest` | Get latest active jobs |
| **GET** | `/api/v1/companies` | List companies |
| **GET** | `/api/v1/companies/{id}` | Get company details |
| **GET** | `/api/v1/companies/{id}/jobs` | Get company's jobs |
| **GET** | `/api/v1/stats` | Platform statistics |
| **GET** | `/api/v1/stats/by-location` | Jobs by city |
| **GET** | `/api/v1/stats/by-industry` | Jobs by industry |
| **GET** | `/api/v1/stats/salary` | Salary statistics |
| **POST** | `/api/v1/parser/run` | Trigger parser |
| **GET** | `/api/v1/parser/status` | Parser status |
| **GET** | `/api/v1/parser/history` | Run history |
| **GET** | `/health` | Health check |
| **GET** | `/ready` | Readiness check |

### Job Listing Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (1-100, default: 20) |
| `search` | string | Search in title/description |
| `company_id` | int | Filter by company |
| `is_expired` | bool | Filter by expiration status |
| `is_work_from_home` | bool | Remote jobs only |
| `is_suitable_for_student` | bool | Student-friendly jobs |
| `salary_min` | int | Minimum salary |
| `salary_max` | int | Maximum salary |
| `location` | string | Filter by city name |
| `sort_by` | string | publish_date, deadline_date, salary_from, created_at |
| `sort_order` | string | asc, desc |

### Example Queries

```bash
# Get remote jobs in Tbilisi with salary > 2000 GEL
curl "http://localhost:8089/api/v1/jobs?is_work_from_home=true&location=Tbilisi&salary_min=2000"

# Search for "developer" jobs
curl "http://localhost:8089/api/v1/jobs/search?q=developer"

# Get latest 20 active jobs
curl "http://localhost:8089/api/v1/jobs/latest?limit=20"
```

### API Documentation

Interactive API documentation available at:
- **Swagger UI:** http://localhost:8089/docs
- **ReDoc:** http://localhost:8089/redoc

---

## 8. Deployment & Infrastructure

### Docker Containers

| Container | Image | Ports | Resources |
|-----------|-------|-------|-----------|
| `hr_ge_postgres` | postgres:15-alpine | 5433:5432 | 512MB RAM min |
| `hr_ge_app` | Custom Python | 8089:8089 | 256MB RAM min |

### Starting the System

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f db
```

### Stopping the System

```bash
# Stop containers (preserve data)
docker-compose stop

# Stop and remove containers (preserve data in volumes)
docker-compose down

# Stop and delete ALL data
docker-compose down -v
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | hrparser | Database username |
| `POSTGRES_PASSWORD` | hrparser_secure_2024 | Database password |
| `POSTGRES_DB` | hr_ge_jobs | Database name |
| `POSTGRES_EXTERNAL_PORT` | 5433 | External DB port |
| `API_PORT` | 8089 | API server port |
| `PARSER_RATE_LIMIT` | 1.0 | Seconds between requests |
| `PARSER_CONCURRENT_REQUESTS` | 3 | Parallel requests |
| `PARSER_SCHEDULE_HOURS` | 6 | Hours between auto-runs |

### Database Access

**Direct Connection:**
```bash
# From host machine
psql -h localhost -p 5433 -U hrparser -d hr_ge_jobs

# Inside container
docker-compose exec db psql -U hrparser -d hr_ge_jobs
```

**Useful Queries:**
```sql
-- Count jobs by status
SELECT is_expired, COUNT(*) FROM jobs GROUP BY is_expired;

-- Top 10 companies by job count
SELECT c.name, COUNT(j.id) as job_count
FROM companies c
JOIN jobs j ON j.company_id = c.id
GROUP BY c.id ORDER BY job_count DESC LIMIT 10;

-- Jobs added today
SELECT COUNT(*) FROM jobs WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 9. Monitoring & Maintenance

### Health Checks

| Endpoint | What It Checks |
|----------|----------------|
| `/health` | Application is running |
| `/ready` | Database connection works |

**Recommended Monitoring:**
```bash
# Check every minute
*/1 * * * * curl -s http://localhost:8089/health | grep -q "healthy" || alert
```

### Log Locations

| Log | Location |
|-----|----------|
| Application logs | `docker-compose logs app` |
| Database logs | `docker-compose logs db` |
| File logs | `./logs/` directory |

### Backup Procedures

**Database Backup:**
```bash
# Create backup
docker-compose exec db pg_dump -U hrparser hr_ge_jobs > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260124.sql | docker-compose exec -T db psql -U hrparser hr_ge_jobs
```

### Maintenance Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Database backup | Daily | pg_dump |
| Container restart | Weekly | docker-compose restart |
| Log rotation | Monthly | Truncate old logs |
| Database vacuum | Monthly | VACUUM ANALYZE |

---

## 10. Security Considerations

### Current Security Measures

- **Database:** Password protected, not exposed to internet
- **API:** CORS enabled for cross-origin requests
- **Containers:** Isolated Docker network

### Recommendations for Production

| Area | Recommendation |
|------|----------------|
| **Database** | Use strong password, limit network access |
| **API** | Add authentication (API keys or JWT) |
| **HTTPS** | Use reverse proxy (nginx) with SSL |
| **Secrets** | Use Docker secrets or vault |
| **Network** | Firewall rules, VPN access only |

### Data Privacy

- Job data is **publicly available** on hr.ge
- Company logos/images are linked, not stored
- Contact information may be hidden per job settings
- Raw JSON stored for audit/analysis purposes

---

## 11. Cost Analysis

### Infrastructure Costs (Self-Hosted)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2 cores |
| RAM | 1 GB | 2 GB |
| Storage | 5 GB | 20 GB |
| **Monthly (VPS)** | ~$5-10 | ~$15-20 |

### Cloud Hosting Options

| Provider | Service | Estimated Monthly Cost |
|----------|---------|----------------------|
| DigitalOcean | Droplet (2GB) | $12 |
| AWS | t3.small | $15 |
| Google Cloud | e2-small | $13 |
| Hetzner | CX21 | $5 |

### Operational Costs

- **HR.GE API:** Free (public API)
- **Bandwidth:** Minimal (~1-2 GB/month)
- **Maintenance:** 1-2 hours/month

---

## 12. Roadmap & Future Enhancements

### Planned Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **High** | Admin Dashboard | Web UI for monitoring |
| **High** | Email Alerts | Notifications for failures |
| **Medium** | Data Export | CSV/Excel export |
| **Medium** | Job Deduplication | Detect duplicate postings |
| **Low** | ML Classification | Auto-categorize jobs |
| **Low** | Salary Prediction | Estimate missing salaries |

### Integration Opportunities

- **Job Board Integration:** Feed data to custom job portals
- **Slack/Telegram Alerts:** New job notifications
- **Business Intelligence:** Connect to Tableau/PowerBI
- **CRM Integration:** Link to recruitment systems

### Scaling Considerations

For higher volumes:
- Switch to Redis for caching
- Add read replicas for database
- Use Celery for distributed task processing
- Implement API rate limiting

---

## Appendix A: Quick Reference

### Start System
```bash
docker-compose up -d
```

### Check Status
```bash
curl http://localhost:8089/health
curl http://localhost:8089/api/v1/parser/status
```

### Trigger Manual Parse
```bash
curl -X POST http://localhost:8089/api/v1/parser/run
```

### View Logs
```bash
docker-compose logs -f app
```

### Database Query
```bash
docker-compose exec db psql -U hrparser -d hr_ge_jobs -c "SELECT COUNT(*) FROM jobs;"
```

---

## Appendix B: Troubleshooting

| Problem | Solution |
|---------|----------|
| Container won't start | Check `docker-compose logs` |
| Database connection failed | Verify DB container is healthy |
| Parser fails | Check HR.GE API is accessible |
| Slow performance | Increase `PARSER_CONCURRENT_REQUESTS` |
| Disk full | Run `docker system prune` |

---

**Document maintained by:** Development Team
**Contact:** [Your Contact Info]
