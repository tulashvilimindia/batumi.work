# Admin Dashboard

The Admin Dashboard is a standalone web-based management interface for batumi.work, accessible directly via port 9000 without going through nginx or Cloudflare.

## Overview

| Setting | Value |
|---------|-------|
| Port | 9000 |
| Binding | 0.0.0.0 (direct access) |
| Authentication | None (UFW protected) |
| URL | `http://SERVER_IP:9000` |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Public Access                             │
├─────────────────────────────────────────────────────────────────┤
│  Internet → Cloudflare → Nginx (8100) → API (8101)              │
│                                    └──→ Static files             │
├─────────────────────────────────────────────────────────────────┤
│                        Admin Access                              │
├─────────────────────────────────────────────────────────────────┤
│  Your IP → :9000 ──→ Admin Dashboard (direct, no proxy)         │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Dashboard Home
- Overview statistics (total jobs, regions, categories)
- System health status
- Recent activity log
- Quick action buttons

### Job Management
- List all jobs with filters
- Create new jobs manually
- Edit existing jobs
- Delete/deactivate jobs
- Bulk operations

### Parser Control
- View parser statistics by region/category
- Trigger manual parse run
- View parser logs
- Configure parser settings

### Analytics
- Job views and clicks
- Search query analytics
- Category distribution charts
- Salary range analysis
- Time-based trends

### Backup Management
- List all backups (daily/weekly/manual)
- Create manual backup
- Download backups
- View backup health status

### Database Browser
- View table structures
- Run read-only queries
- Export query results
- View row counts

### Log Viewer
- Real-time container logs
- Filter by service (api, worker, db)
- Search within logs
- Download log files

## Security Model

The admin dashboard relies on network-level security:

1. **UFW Firewall**: Only allows connections from whitelisted IPs
2. **No Nginx/Cloudflare**: Port 9000 is not proxied, so public traffic cannot reach it
3. **No Authentication**: If you can connect, you're authorized (UFW already verified your IP)

```
┌─────────────────────────────────────────┐
│           Security Layers               │
├─────────────────────────────────────────┤
│  1. UFW Firewall                        │
│     └── Only allows admin IPs           │
│                                         │
│  2. Port 9000 not proxied               │
│     └── Direct connection required      │
│                                         │
│  3. Docker network isolation            │
│     └── Admin container in same network │
└─────────────────────────────────────────┘
```

## Accessing the Dashboard

### From Allowed IP

```bash
# Open in browser
http://38.242.143.10:9000

# Or via curl
curl http://38.242.143.10:9000/api/health
```

### UFW Configuration

Ensure your IP is allowed:

```bash
# On server
sudo ufw allow from YOUR_IP to any port 9000
sudo ufw status
```

## API Endpoints

The admin dashboard exposes these API endpoints:

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Dashboard stats |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs` | Create job |
| PUT | `/api/jobs/{id}` | Update job |
| DELETE | `/api/jobs/{id}` | Delete job |

### Parser
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parser/stats` | Parser statistics |
| POST | `/api/parser/trigger` | Trigger parse |
| GET | `/api/parser/logs` | Parser logs |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Overview stats |
| GET | `/api/analytics/views` | View statistics |
| GET | `/api/analytics/searches` | Search analytics |

### Backups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/backups` | List backups |
| POST | `/api/backups` | Create backup |
| GET | `/api/backups/{name}` | Download backup |

### Database
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/database/tables` | List tables |
| GET | `/api/database/tables/{name}` | Table info |
| POST | `/api/database/query` | Run query (read-only) |

### Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs/{service}` | Get container logs |

## Docker Configuration

### docker-compose.yml

```yaml
admin:
  build:
    context: ./admin
  container_name: jobboard-admin
  restart: unless-stopped
  ports:
    - "0.0.0.0:9000:8000"
  environment:
    - DATABASE_URL=${DATABASE_URL}
  volumes:
    - ./backups:/backups:rw
    - /var/run/docker.sock:/var/run/docker.sock:ro
  depends_on:
    db:
      condition: service_healthy
  networks:
    - default
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BACKUP_DIR` | Backup directory path (default: /backups) |

## File Structure

```
admin/
├── Dockerfile
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── dashboard.py
│   │   ├── jobs.py
│   │   ├── parser.py
│   │   ├── analytics.py
│   │   ├── backups.py
│   │   ├── database.py
│   │   └── logs.py
│   └── static/
│       └── index.html
```

## Troubleshooting

### Cannot Connect to Port 9000

1. Check UFW allows your IP:
   ```bash
   sudo ufw status | grep 9000
   ```

2. Check container is running:
   ```bash
   docker compose ps admin
   ```

3. Check container logs:
   ```bash
   docker compose logs admin
   ```

### Database Connection Failed

1. Check DATABASE_URL in .env
2. Check db container is healthy:
   ```bash
   docker compose ps db
   ```

### Logs Not Loading

1. Check Docker socket is mounted:
   ```bash
   docker compose exec admin ls -la /var/run/docker.sock
   ```

---

*Last updated: January 20, 2026*
