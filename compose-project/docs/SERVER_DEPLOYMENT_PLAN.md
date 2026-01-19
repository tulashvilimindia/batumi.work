# Server Deployment Plan for batumi.work

**Last Updated:** January 19, 2026
**Server:** 38.242.143.10 (Linux VM)
**Status:** ✅ DEPLOYED AND LIVE

**Live URL:** https://batumi.work

---

## CRITICAL: READ BEFORE PROCEEDING

This is a **SHARED PRODUCTION SERVER** hosting multiple services:
- batumi.zone (WordPress - PRODUCTION)
- dev.batumi.zone (WordPress - DEV/STAGING)
- analytics.batumi.zone (Plausible Analytics)
- admin.batumi.zone, api.batumi.zone (Admin/API services)

**DO NOT modify any existing configurations or services.**

---

## Server Investigation Results (January 19, 2026)

### System Resources

| Resource | Total | Used | Available |
|----------|-------|------|-----------|
| RAM | 7.8 GB | 1.5 GB | 6.2 GB |
| Disk | 145 GB | 6.1 GB | 139 GB |
| CPU | 4 cores | - | Ample |

**Verdict:** Server has plenty of resources for batumi.work

### Ports Currently In Use

| Port | Service | Notes |
|------|---------|-------|
| 22 | SSH | System |
| 53 | DNS | systemd-resolved |
| 80 | Nginx | HTTP (all sites) |
| 443 | Nginx | HTTPS (all sites) |
| 3306 | MariaDB | WordPress database |
| 8000 | Plausible | Analytics (127.0.0.1 only) |
| 8443 | Plausible | Analytics HTTPS (127.0.0.1 only) |

### Ports Reserved for batumi.work

| Port | Service | Purpose |
|------|---------|---------|
| 8100 | nginx (web) | Static frontend |
| 8101 | FastAPI (api) | Backend API |
| 8102 | PostgreSQL (db) | Database (internal only) |

### Running Docker Containers

```
NAMES                             IMAGE                                         STATUS
plausible-plausible-1             ghcr.io/plausible/community-edition:v2.1.4   Up 2 days
plausible-plausible_db-1          postgres:16-alpine                           Up 2 days
plausible-plausible_events_db-1   clickhouse/clickhouse-server:24.3.3.102      Up 2 days
```

### Existing Nginx Sites (DO NOT MODIFY)

```
/etc/nginx/sites-enabled/
├── admin.batumi.zone
├── admin.dev.batumi.zone
├── analytics.batumi.zone
├── api.batumi.zone
├── api.dev.batumi.zone
├── batumi.zone
└── dev.batumi.zone
```

### SSL Certificates (Let's Encrypt)

| Domain | Status | Expiry |
|--------|--------|--------|
| batumi.zone | Valid | April 16, 2026 |
| admin.batumi.zone | Valid | April 16, 2026 |
| api.batumi.zone | Valid | April 16, 2026 |
| dev.batumi.zone | Valid | April 4, 2026 |
| **batumi.work** | **NOT EXISTS** | **Needs creation** |

### Directory Structure

```
/opt/
├── containerd/
├── plausible/           # Plausible Analytics
└── batumi-work/         # <- CREATE THIS (does not exist yet)

/var/www/
├── batumi/              # batumi.zone DEV
├── batumi-prod/         # batumi.zone PROD
├── backups/
├── deploy/
└── html/
```

---

## Deployment Plan

### Overview

```
                    ┌─────────────────────────────────┐
                    │       Cloudflare (CDN/SSL)      │
                    │         batumi.work             │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────┐
│                    Linux VM (38.242.143.10)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Nginx (:80/:443)                       │  │
│  │  batumi.work → proxy_pass 127.0.0.1:8100                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Docker Compose (batumi-work)                 │  │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐              │  │
│  │  │   web   │───▶│   api   │───▶│   db    │              │  │
│  │  │  :8100  │    │  :8101  │    │  :5432  │              │  │
│  │  └─────────┘    └─────────┘    └─────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Deployment

#### Step 1: Create Project Directory

```bash
ssh root@38.242.143.10
mkdir -p /opt/batumi-work
cd /opt/batumi-work
```

#### Step 2: Clone Repository

```bash
git clone https://github.com/tulashvilimindia/batumi.work.git .
cd compose-project
```

#### Step 3: Create Production docker-compose.override.yml

Create `/opt/batumi-work/compose-project/docker-compose.override.yml`:

```yaml
# Production overrides for shared server deployment
# Ports bound to 127.0.0.1 - nginx will proxy

services:
  db:
    ports: []  # Don't expose database externally

  api:
    ports:
      - "127.0.0.1:8101:8000"
    environment:
      - ENVIRONMENT=production
      - DEBUG=false

  web:
    ports:
      - "127.0.0.1:8100:80"
    # Remove 443 - nginx handles SSL

  worker:
    profiles:
      - parser

  bot:
    profiles:
      - bot

  backup:
    profiles:
      - backup
```

#### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env
```

**Production .env:**
```bash
# Database
POSTGRES_USER=jobboard
POSTGRES_PASSWORD=<GENERATE_SECURE_PASSWORD>
POSTGRES_DB=jobboard

# Security
ADMIN_API_KEY=<GENERATE_32_CHAR_KEY>
SECRET_KEY=<GENERATE_64_CHAR_KEY>

# Environment
DEBUG=false
ENVIRONMENT=production

# Parser
PARSER_INTERVAL_MINUTES=60
ENABLED_SOURCES=jobs.ge
PARSE_REGIONS=batumi,tbilisi

# Telegram Bot
TELEGRAM_BOT_TOKEN=<FROM_BOTFATHER>
WEB_URL=https://batumi.work

# Optional: Email Reports
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=
# REPORT_RECIPIENTS=
```

**Generate secure values:**
```bash
# Password
openssl rand -base64 24

# API Key
openssl rand -hex 16

# Secret Key
openssl rand -hex 32
```

#### Step 5: Create Nginx Virtual Host

Create `/etc/nginx/sites-available/batumi.work`:

```nginx
# batumi.work - Georgia JobBoard
# Created: January 2026
# DO NOT MODIFY other virtual hosts!

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name batumi.work www.batumi.work;
    return 301 https://batumi.work$request_uri;
}

# WWW redirect to non-www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.batumi.work;

    ssl_certificate /etc/letsencrypt/live/batumi.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/batumi.work/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 301 https://batumi.work$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name batumi.work;

    ssl_certificate /etc/letsencrypt/live/batumi.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/batumi.work/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API requests
    location /api/ {
        proxy_pass http://127.0.0.1:8101/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8101/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API docs
    location /docs {
        proxy_pass http://127.0.0.1:8101/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8101/openapi.json;
        proxy_set_header Host $host;
    }

    # Static frontend (everything else)
    location / {
        proxy_pass http://127.0.0.1:8100/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # Caching for static assets
        proxy_cache_valid 200 1d;
        proxy_cache_valid 404 1m;
    }

    # Logs
    access_log /var/log/nginx/batumi.work.access.log;
    error_log /var/log/nginx/batumi.work.error.log;
}
```

#### Step 6: Get SSL Certificate

**Option A: Let's Encrypt (if DNS points directly to server)**

```bash
# First, configure DNS to point to server
# Then run:
certbot certonly --nginx -d batumi.work -d www.batumi.work
```

**Option B: Cloudflare Origin Certificate (if using Cloudflare proxy)**

1. In Cloudflare Dashboard → SSL/TLS → Origin Server
2. Create Origin Certificate
3. Save to server:
```bash
mkdir -p /etc/ssl/cloudflare
nano /etc/ssl/cloudflare/batumi.work.pem    # Paste certificate
nano /etc/ssl/cloudflare/batumi.work.key    # Paste private key
chmod 600 /etc/ssl/cloudflare/batumi.work.key
```
4. Update nginx config to use these paths

#### Step 7: Enable Site and Test

```bash
# Enable site
ln -s /etc/nginx/sites-available/batumi.work /etc/nginx/sites-enabled/

# ALWAYS test first!
nginx -t

# Only reload if test passes
systemctl reload nginx
```

#### Step 8: Start Docker Services

```bash
cd /opt/batumi-work/compose-project

# Build and start
docker compose build
docker compose up -d

# Verify
docker compose ps
docker compose logs -f

# Initialize database
docker compose exec api alembic upgrade head
```

#### Step 9: Start Optional Services

```bash
# Parser (job aggregation)
docker compose --profile parser up -d

# Telegram bot
docker compose --profile bot up -d

# Backup service
docker compose --profile backup up -d
```

#### Step 10: Verify Deployment

```bash
# Health check
curl -I https://batumi.work/health

# API
curl https://batumi.work/api/v1/jobs

# Frontend
curl -I https://batumi.work/
```

---

## DNS Configuration

### If Using Cloudflare (Recommended)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | 38.242.143.10 | Proxied |
| A | www | 38.242.143.10 | Proxied |

Cloudflare Settings:
- SSL/TLS: Full (strict)
- Always Use HTTPS: ON
- Minimum TLS: 1.2

### If Direct (No Cloudflare)

| Type | Name | Content | TTL |
|------|------|---------|-----|
| A | @ | 38.242.143.10 | 300 |
| A | www | 38.242.143.10 | 300 |

---

## Troubleshooting

### Container won't start
```bash
docker compose logs api
docker compose down && docker compose up -d
```

### 502 Bad Gateway
```bash
# Check containers
docker compose ps

# Check ports
ss -tlnp | grep 810

# Check logs
docker compose logs -f
```

### SSL Issues
```bash
# Check certificate
certbot certificates

# Test nginx config
nginx -t
```

### Emergency Recovery

If existing sites break:
```bash
# Disable batumi.work
rm /etc/nginx/sites-enabled/batumi.work
nginx -t && systemctl reload nginx

# Verify existing sites work
curl -I https://batumi.zone
```

---

## Maintenance Commands

```bash
# SSH to server
ssh root@38.242.143.10

# Navigate to project
cd /opt/batumi-work/compose-project

# View logs
docker compose logs -f
docker compose logs -f api
docker compose logs -f web

# Restart services
docker compose restart

# Update application
git pull origin main
docker compose build
docker compose up -d

# Database backup
docker compose exec db pg_dump -U jobboard jobboard > backup.sql
```

---

## Deployment Checklist (COMPLETED)

- [x] SSH into server: `ssh root@38.242.143.10`
- [x] Create `/opt/batumi-work` directory
- [x] Clone repository from GitHub
- [x] Configure `.env` with secure values and port settings
- [x] Create nginx virtual host at `/etc/nginx/sites-available/batumi.work`
- [x] Configure DNS (Cloudflare with proxy)
- [x] Generate SSL certificate (self-signed for Cloudflare origin)
- [x] Enable nginx site (symlink)
- [x] Run `nginx -t` - PASSED
- [x] Reload nginx: `systemctl reload nginx`
- [x] Start Docker containers
- [x] Stamp database migrations (tables auto-created)
- [x] Seed initial data (16 categories, 14 regions, 20 jobs)
- [x] Verify https://batumi.work works
- [ ] Start parser service (optional - not started)
- [ ] Start Telegram bot (optional - token needed)

---

## Contact & Resources

- **Repository:** https://github.com/tulashvilimindia/batumi.work
- **Server IP:** 38.242.143.10
- **SSH:** `ssh root@38.242.143.10` (passwordless)

---

*This document prepared for next agent session deployment*
