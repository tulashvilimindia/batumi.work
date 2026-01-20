# DevOps Guide - Georgia Job Board

This guide covers deployment, operations, monitoring, and maintenance of the Georgia Job Board.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment](#deployment)
3. [Configuration](#configuration)
4. [Container Management](#container-management)
5. [Database Operations](#database-operations)
6. [Backup & Restore](#backup--restore)
7. [Monitoring & Health Checks](#monitoring--health-checks)
8. [Uptime Monitoring Setup](#uptime-monitoring-setup)
9. [Logging](#logging)
10. [Scaling](#scaling)
11. [Troubleshooting](#troubleshooting)
12. [Security](#security)
13. [Progressive Web App (PWA)](#progressive-web-app-pwa)

---

## Architecture Overview

### System Components

```
┌───────────────────────────────────────────────────────────────────┐
│                         Docker Host                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  nginx  │  │   api   │  │   db    │  │ worker  │  │   bot   │ │
│  │  :80    │──│  :8000  │──│  :5432  │──│         │  │         │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│       │            │            │            │            │       │
│       └────────────┴────────────┴────────────┴────────────┘       │
│                              │                                     │
│                         [volumes]                                  │
│                   postgres_data, backups                           │
└───────────────────────────────────────────────────────────────────┘
```

### Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| db | postgres:15-alpine | 5432 | PostgreSQL database |
| api | compose-project-api | 8000 | FastAPI backend |
| web | nginx:alpine | 80 | Static frontend + reverse proxy |
| worker | compose-project-worker | - | Parser worker (scheduled) |
| bot | compose-project-bot | - | Telegram bot (optional) |
| backup | postgres:15-alpine | - | Backup container (optional) |
| admin | compose-project-admin | 9000 | Admin dashboard (direct access) |

### Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| (default) | db, api, web | Basic deployment |
| parser | + worker | With job parsing |
| bot | + bot | With Telegram bot |
| backup | + backup | With scheduled backups |
| full | all | Complete deployment |

---

## Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

### Quick Start

```bash
# Clone repository
git clone https://github.com/tulashvilimindia/batumi.work.git
cd batumi.work/compose-project

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start services
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost/health
```

### Production Deployment

```bash
# Pull latest code
git pull origin main

# Build images
docker-compose build

# Start with parser
docker-compose --profile parser up -d

# Run database migrations
docker-compose exec api alembic upgrade head

# Verify all services healthy
docker-compose ps
curl http://localhost/health/detailed
```

### First-Time Setup

```bash
# 1. Start database
docker-compose up -d db

# 2. Wait for database to be ready
docker-compose logs -f db  # Wait for "ready to accept connections"

# 3. Start API (runs migrations automatically)
docker-compose up -d api

# 4. Start web server
docker-compose up -d web

# 5. (Optional) Start parser worker
docker-compose --profile parser up -d worker

# 6. Verify
curl http://localhost/health/detailed
```

---

## Configuration

### Environment Variables

Create `.env` from `.env.example`:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=jobboard
DB_PORT=5432

# API
ADMIN_API_KEY=your-admin-api-key
SECRET_KEY=your-secret-key-min-32-chars
DEBUG=false
ENVIRONMENT=production
CORS_ORIGINS=["https://your-domain.com"]

# Ports
API_PORT=8000
WEB_PORT=80

# Parser (Phase 2)
PARSER_INTERVAL_MINUTES=60
NOT_SEEN_DAYS_TO_INACTIVE=7
AUTO_APPROVE_PARSED_JOBS=true
ENABLED_SOURCES=jobs.ge,hr.ge
PARSE_REGIONS=batumi,tbilisi
LOG_LEVEL=INFO

# Backup
BACKUP_RETENTION_DAYS=7

# Monitoring (Optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Generating Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate ADMIN_API_KEY
openssl rand -hex 24
```

---

## Container Management

### Common Commands

```bash
# Start all services
docker-compose up -d

# Start with specific profile
docker-compose --profile parser up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart api

# View logs
docker-compose logs -f api
docker-compose logs -f --tail=100 worker

# Execute command in container
docker-compose exec api python -c "print('test')"
docker-compose exec db psql -U postgres jobboard

# Rebuild specific service
docker-compose build api
docker-compose up -d api
```

### Service Health

```bash
# Check all container status
docker-compose ps

# Check specific health
docker inspect --format='{{.State.Health.Status}}' jobboard-api
docker inspect --format='{{.State.Health.Status}}' jobboard-db
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats jobboard-api jobboard-db
```

---

## Database Operations

### Connecting to Database

```bash
# Via docker-compose
docker-compose exec db psql -U postgres jobboard

# Direct connection
psql -h localhost -p 5432 -U postgres jobboard
```

### Common Queries

```sql
-- Job statistics
SELECT parsed_from, status, COUNT(*)
FROM jobs
GROUP BY parsed_from, status;

-- Recent jobs
SELECT title_ge, company_name, created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- Category distribution
SELECT c.name_en, COUNT(j.id) as job_count
FROM categories c
LEFT JOIN jobs j ON j.category_id = c.id
GROUP BY c.id
ORDER BY job_count DESC;
```

### Migrations

```bash
# Run pending migrations
docker-compose exec api alembic upgrade head

# View migration history
docker-compose exec api alembic history

# Create new migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Rollback one migration
docker-compose exec api alembic downgrade -1
```

---

## Backup & Restore

### Automatic Backups

Backups run automatically when using the `backup` profile:

```bash
docker-compose --profile backup up -d
```

**Schedule:**
- Daily at 3:00 AM (7-day retention)
- Weekly on Sundays (4-week retention)

### Manual Backup

```bash
# From host
docker-compose exec db pg_dump -U postgres jobboard | gzip > backups/manual/backup_$(date +%Y%m%d).sql.gz

# Or trigger via API
curl -X POST http://localhost:8000/api/v1/admin/backups/trigger \
  -H "X-API-Key: your-api-key"
```

### Restore from Backup

```bash
# 1. Stop API to prevent writes
docker-compose stop api worker

# 2. Drop and recreate database
docker-compose exec db psql -U postgres -c "DROP DATABASE jobboard;"
docker-compose exec db psql -U postgres -c "CREATE DATABASE jobboard;"

# 3. Restore backup
gunzip -c backups/daily/backup_20260119.sql.gz | \
  docker-compose exec -T db psql -U postgres jobboard

# 4. Restart services
docker-compose up -d api worker
```

### Backup Verification

```bash
# Check backup status via API
curl http://localhost:8000/health/detailed | jq '.checks.backup'

# List backup files
ls -la backups/daily/
ls -la backups/weekly/
```

---

## Monitoring & Health Checks

### Health Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `/health` | No | Basic liveness check |
| `/ready` | No | Readiness (DB connection) |
| `/health/detailed` | No | Full system health |

### Detailed Health Check

```bash
curl http://localhost:8000/health/detailed | jq
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-19T09:03:47.801983",
  "checks": {
    "database": {
      "status": "healthy",
      "job_count": 840
    },
    "backup": {
      "status": "healthy",
      "last_backup": "2026-01-19T09:02:16",
      "age_hours": 0.0,
      "file_count": 1
    },
    "parser": {
      "status": "healthy",
      "last_job_seen": "2026-01-19T08:51:37",
      "age_hours": 0.2
    }
  }
}
```

### Health Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | All systems operational | None |
| `warning` | Minor issues detected | Investigate soon |
| `critical` | Serious problems | Immediate attention |
| `error` | System failure | Emergency response |

### Thresholds

| Check | Warning | Critical |
|-------|---------|----------|
| Backup age | > 48 hours | > 72 hours |
| Parser age | > 4 hours | > 24 hours |
| Database | Connection slow | Connection failed |

---

## Uptime Monitoring Setup

### UptimeRobot (Free)

1. Create account at [uptimerobot.com](https://uptimerobot.com)

2. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Georgia Job Board
   - **URL**: `https://your-domain.com/health`
   - **Monitoring Interval**: 5 minutes

3. Add detailed health monitor:
   - **URL**: `https://your-domain.com/health/detailed`
   - **Keyword exists**: `"status":"healthy"`

4. Configure alerts:
   - Email notifications
   - Slack webhook (optional)
   - SMS (paid plans)

### BetterStack (Better Uptime)

1. Create account at [betterstack.com](https://betterstack.com)

2. Add new monitor:
   ```yaml
   Name: Georgia Job Board - Health
   URL: https://your-domain.com/health/detailed
   Check frequency: 3 minutes
   Request timeout: 30 seconds
   Expected status code: 200
   Check for string: "status":"healthy"
   ```

3. Add incident management:
   - On-call schedules
   - Escalation policies
   - Status page (optional)

### Prometheus + Grafana (Self-hosted)

1. Add to `docker-compose.yml`:
   ```yaml
   prometheus:
     image: prom/prometheus
     volumes:
       - ./prometheus.yml:/etc/prometheus/prometheus.yml
     ports:
       - "9090:9090"

   grafana:
     image: grafana/grafana
     ports:
       - "3000:3000"
     depends_on:
       - prometheus
   ```

2. Configure `prometheus.yml`:
   ```yaml
   scrape_configs:
     - job_name: 'jobboard'
       static_configs:
         - targets: ['api:8000']
       metrics_path: /metrics
   ```

### Alert Rules

Recommended alerts:

| Alert | Condition | Severity |
|-------|-----------|----------|
| Site Down | health check fails 3x | Critical |
| High Response Time | > 5s average | Warning |
| Database Error | health.checks.database.status != healthy | Critical |
| Backup Stale | backup.age_hours > 48 | Warning |
| Parser Stale | parser.age_hours > 24 | Warning |
| Disk Space Low | < 10% free | Warning |

---

## Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker

# With timestamps
docker-compose logs -f --timestamps api

# Last N lines
docker-compose logs --tail=100 api
```

### Log Format

Logs are in JSON format (structlog):
```json
{
  "event": "job_created",
  "job_id": "uuid",
  "timestamp": "2026-01-19T09:00:00Z",
  "level": "info"
}
```

### Log Levels

Set via `LOG_LEVEL` environment variable:
- `DEBUG`: Verbose debugging
- `INFO`: Normal operations (default)
- `WARNING`: Potential issues
- `ERROR`: Errors only

### Log Aggregation (Optional)

For production, consider:
- **Loki + Grafana**: Lightweight, integrates with Prometheus
- **ELK Stack**: Full-featured but resource-heavy
- **CloudWatch**: If using AWS

---

## Scaling

### Horizontal Scaling

The API service can be scaled:

```bash
# Scale API to 3 instances (requires load balancer)
docker-compose up -d --scale api=3
```

Update nginx for load balancing:
```nginx
upstream api {
    server api:8000;
    server api:8001;
    server api:8002;
}
```

### Vertical Scaling

Adjust container resources in `docker-compose.yml`:
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### Database Scaling

For high load:
1. Add read replicas
2. Use connection pooling (PgBouncer)
3. Consider managed PostgreSQL (AWS RDS, etc.)

---

## Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Container won't start | Exit code 1 | Check logs: `docker-compose logs api` |
| Database connection failed | 500 errors | Verify DB is healthy, check credentials |
| Parser not running | No new jobs | Check worker logs, verify schedule |
| Nginx 502 | Bad Gateway | API container down, restart it |
| Out of disk space | Containers fail | Clean old images: `docker system prune` |

### Diagnostic Commands

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs api 2>&1 | grep -i error

# Test database connection
docker-compose exec api python -c "
from app.core.database import engine
print(engine.url)
"

# Check disk space
df -h

# Check memory usage
free -h

# Check Docker resource usage
docker system df
```

### Recovery Procedures

**API Not Responding:**
```bash
docker-compose restart api
docker-compose logs -f api
```

**Database Corrupted:**
```bash
docker-compose down
docker volume rm compose-project_postgres_data
docker-compose up -d db
# Restore from backup (see Backup & Restore section)
```

**Full System Reset:**
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec api alembic upgrade head
# Restore from backup if needed
```

---

## Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Use strong passwords (min 24 chars)
   - Rotate credentials periodically

2. **Network Security**
   - Use HTTPS in production
   - Restrict database port (don't expose 5432)
   - Use firewall rules

3. **Container Security**
   - Run as non-root user (already configured)
   - Keep images updated
   - Scan for vulnerabilities

4. **API Security**
   - Strong API key (min 32 chars)
   - Rate limiting (nginx)
   - CORS restrictions

### Security Checklist

- [ ] Strong POSTGRES_PASSWORD set
- [ ] Strong ADMIN_API_KEY set
- [ ] Strong SECRET_KEY set
- [ ] DEBUG=false in production
- [ ] CORS_ORIGINS restricted
- [ ] HTTPS configured
- [ ] Database port not exposed publicly
- [ ] Regular security updates applied

### SSL/TLS Setup

For production, add SSL via:
1. **Certbot/Let's Encrypt**: Free certificates
2. **Cloudflare**: Free SSL proxy
3. **AWS ALB/ELB**: Managed load balancer

Example nginx SSL config:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}
```

---

## Progressive Web App (PWA)

The frontend is configured as a Progressive Web App for better mobile experience.

### PWA Files

| File | Location | Purpose |
|------|----------|---------|
| `manifest.json` | `/static/manifest.json` | App metadata, icons, theme |
| `sw.js` | `/static/sw.js` | Service worker for caching |
| `offline.html` | `/static/offline.html` | Offline fallback page |

### manifest.json

Defines app properties for "Add to Home Screen":

```json
{
  "name": "ვაკანსიები - Georgia Jobs",
  "short_name": "Jobs",
  "start_url": "/ge/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#4ECDC4"
}
```

### Service Worker Features

- **Cache-first** for static assets (CSS, JS, images)
- **Network-first** for API calls
- **Offline fallback** when network unavailable
- **Automatic cache updates** on new deployments

### Cache Strategy

```javascript
// Static assets - cache first
'/*.css', '/*.js', '/images/*'

// API calls - network first, fallback to cache
'/api/*'

// Pages - network first, fallback to offline.html
'/*.html'
```

### Updating the PWA

When updating static files:

1. Update the `CACHE_VERSION` in `sw.js`
2. Deploy the changes
3. Service worker will automatically update

```javascript
// In sw.js
const CACHE_VERSION = 'v2';  // Increment for updates
```

### Testing PWA

1. **Chrome DevTools**: Application > Service Workers
2. **Lighthouse**: Run PWA audit
3. **Offline test**: Enable "Offline" in DevTools Network tab

---

## Quick Reference

### Useful Commands

```bash
# Status
docker-compose ps
curl localhost/health/detailed

# Logs
docker-compose logs -f api

# Restart
docker-compose restart api

# Update
git pull && docker-compose build && docker-compose up -d

# Backup
docker-compose exec db pg_dump -U postgres jobboard | gzip > backup.sql.gz

# Shell access
docker-compose exec api /bin/sh
docker-compose exec db psql -U postgres jobboard
```

### Important Paths

| Path | Purpose |
|------|---------|
| `./` | Project root |
| `./api/` | FastAPI application |
| `./web/static/` | Frontend files (HTML, CSS, JS, PWA) |
| `./worker/` | Parser worker |
| `./bot/` | Telegram bot |
| `./backups/` | Database backups |
| `./docs/` | Documentation |
| `./.env` | Environment config |

### Ports

| Port | Service | Exposed |
|------|---------|---------|
| 80 | nginx | Yes |
| 8000 | api | Yes |
| 5432 | postgres | Yes (change in prod) |
| 9000 | admin | Yes (UFW protected) |

---

*Last updated: January 2026*
