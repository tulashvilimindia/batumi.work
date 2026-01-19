# Georgia JobBoard

A lightweight, SEO-first job posting website for Georgia with bilingual support (Georgian/English).

**Live**: [batumi.work](https://batumi.work)

## Features

- **Bilingual Support**: Georgian (default) and English
- **SEO Optimized**: Meta tags, hreflang, sitemap, robots.txt
- **PWA Ready**: Installable app with offline support
- **Job Parser**: Automatic job aggregation from jobs.ge
- **Telegram Bot**: Job search and subscription notifications
- **Analytics Dashboard**: Job views, searches, and market insights
- **Automated Backups**: Daily PostgreSQL backups with retention

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   FastAPI   │────▶│  PostgreSQL │
│   (web)     │     │   (api)     │     │    (db)     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Worker    │     │  Telegram   │     │   Backup    │
│  (parser)   │     │    Bot      │     │  (cron)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### 1. Clone and Configure

```bash
cd compose-project

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# IMPORTANT: Change ADMIN_API_KEY and SECRET_KEY for production!
```

### 2. Start Services

```bash
# Start core services (web, api, db)
docker-compose up -d

# Start with parser (job aggregation)
docker-compose --profile parser up -d

# Start with Telegram bot
docker-compose --profile bot up -d

# Start everything
docker-compose --profile full up -d
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec api alembic upgrade head

# Seed demo data (optional)
docker-compose exec api python -m app.seed
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Website (Georgian) | http://localhost/ |
| Website (English) | http://localhost/en/ |
| API Documentation | http://localhost/docs |
| Health Check | http://localhost/health |
| Analytics Dashboard | http://localhost/admin/analytics.html |

## Services

### Core Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| web | jobboard-web | 80 | Nginx static frontend |
| api | jobboard-api | 8000 | FastAPI backend |
| db | jobboard-db | 5432 | PostgreSQL database |

### Optional Services (Profiles)

| Profile | Services | Description |
|---------|----------|-------------|
| parser | + worker | Job aggregation from external sources |
| bot | + bot | Telegram bot for notifications |
| backup | + backup | Automated database backups |
| full | all | All services |

## Configuration

### Environment Variables

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jobboard

# Security (CHANGE IN PRODUCTION!)
ADMIN_API_KEY=change-me-in-production
SECRET_KEY=change-me-in-production-secret

# Parser
PARSER_INTERVAL_MINUTES=60
ENABLED_SOURCES=jobs.ge
PARSE_REGIONS=batumi,tbilisi

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
WEB_URL=https://batumi.work

# Email Reports (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
REPORT_RECIPIENTS=admin@example.com
```

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List jobs (paginated, filtered) |
| GET | `/api/v1/jobs/{id}` | Get job details |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/regions` | List regions |

### Query Parameters

```bash
# Pagination
?page=1&page_size=20

# Filtering
?q=developer              # Search in title/company
?category=it-programming  # Filter by category
?region=batumi            # Filter by region
?has_salary=true          # Jobs with salary

# Sorting
?sort_by=created_at&sort_order=desc
```

### Admin Endpoints (requires X-API-Key header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/jobs` | Create job |
| PUT | `/api/v1/admin/jobs/{id}` | Update job |
| DELETE | `/api/v1/admin/jobs/{id}` | Delete job |
| GET | `/api/v1/admin/analytics/dashboard` | Analytics data |
| GET | `/api/v1/admin/backups` | List backups |

## Telegram Bot

The bot provides job search and notification features via Telegram.

### Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Add token to `.env`: `TELEGRAM_BOT_TOKEN=your-token`
3. Start the bot: `docker-compose --profile bot up -d`

### Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome + language selection |
| `/search <keyword>` | Search jobs |
| `/latest` | Show 5 newest jobs |
| `/subscribe` | Subscribe to job categories |
| `/unsubscribe` | Manage subscriptions |
| `/help` | Show available commands |

### Features

- Bilingual support (Georgian/English)
- Category subscriptions
- Daily digest at 9 AM for subscribers

## PWA Features

The website is a Progressive Web App with:

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Cached pages work without internet
- **Fast Loading**: Static assets cached by service worker

### manifest.json

Located at `/static/manifest.json` with app metadata, icons, and theme colors.

### Service Worker

`/static/sw.js` handles:
- Cache-first for static assets (CSS, JS, images)
- Network-first for API calls
- Offline fallback page

## Analytics

### Dashboard

Access at `/admin/analytics.html` (requires API key).

**Metrics tracked:**
- Job views by posting
- Search queries and frequencies
- Category/region distribution
- Salary range analysis

### Scheduled Reports

- **Daily summary**: `generate_daily_summary()`
- **Weekly report**: `generate_weekly_report()` with optional email

## Backup & Restore

### Automatic Backups

```bash
# Start backup service
docker-compose --profile backup up -d

# Backups stored in ./backups/
# - daily/ - Last 7 days
# - weekly/ - Last 4 weeks
```

### Manual Operations

```bash
# Create backup
docker-compose exec backup /backup.sh

# Restore from backup
docker-compose exec -T db psql -U postgres jobboard < backups/daily/backup_2024-01-15.sql
```

See [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) for detailed procedures.

## Development

### Running Tests

```bash
# API tests
docker-compose exec api pytest tests/ -v

# Parser tests
docker-compose exec worker pytest tests/ -v
```

### Database Migrations

```bash
# Create migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec api alembic upgrade head

# Rollback
docker-compose exec api alembic downgrade -1
```

### Project Structure

```
compose-project/
├── api/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/          # Config, database, logging
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API endpoints
│   │   └── services/      # Business logic
│   └── migrations/        # Alembic migrations
├── web/                    # Static Frontend
│   └── static/
│       ├── css/           # Stylesheets
│       ├── js/            # JavaScript (app.js, share.js, analytics.js)
│       ├── ge/            # Georgian pages
│       ├── en/            # English pages
│       ├── manifest.json  # PWA manifest
│       ├── sw.js          # Service worker
│       └── offline.html   # Offline fallback
├── worker/                 # Job Parser
│   ├── app/
│   │   ├── adapters/      # Site-specific parsers
│   │   └── tasks/         # Scheduled tasks
│   └── tests/             # Parser tests
├── bot/                    # Telegram Bot
│   └── app/
│       ├── main.py        # Bot handlers
│       └── database.py    # Subscription storage
├── docs/                   # Documentation
├── backups/               # Database backups
└── docker-compose.yml
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [Admin Guide](docs/ADMIN_GUIDE.md) - Administration and API usage
- [DevOps Guide](docs/DEVOPS_GUIDE.md) - Deployment and operations
- [Backup & Restore](docs/BACKUP_RESTORE.md) - Database backup procedures

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
