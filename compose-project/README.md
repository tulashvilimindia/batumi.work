# Georgia JobBoard

A lightweight, SEO-first job posting website for Georgia with bilingual support (Georgian/English).

## Features

- **Bilingual Support**: Georgian (default) and English
- **SEO Optimized**: Proper meta tags, hreflang, sitemap, robots.txt
- **Lightweight Frontend**: Plain HTML5 + CSS + Vanilla JavaScript
- **FastAPI Backend**: Modern async Python with Swagger/OpenAPI docs
- **PostgreSQL Database**: Full-featured relational database
- **Docker Compose**: Easy deployment with a single command

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### 1. Clone and Configure

```bash
# Clone the repository
cd compose-project

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# IMPORTANT: Change ADMIN_API_KEY and SECRET_KEY for production!
```

### 2. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec api alembic upgrade head

# Seed demo data
docker-compose exec api python -m app.seed
```

### 4. Access the Application

- **Website**: http://localhost (Georgian) or http://localhost/en/ (English)
- **API Docs**: http://localhost/docs (Swagger UI)
- **API Health**: http://localhost/health

## Architecture

```
compose-project/
├── api/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── routers/       # API endpoints
│   │   ├── main.py        # Application entry point
│   │   └── seed.py        # Database seeder
│   ├── migrations/        # Alembic migrations
│   ├── Dockerfile
│   └── requirements.txt
├── web/                    # Static Frontend
│   ├── static/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # JavaScript
│   │   ├── ge/            # Georgian pages
│   │   └── en/            # English pages
│   └── nginx.conf         # Nginx configuration
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Public API (v1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List jobs (paginated, with filters) |
| GET | `/api/v1/jobs/{id}` | Get job details |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/{slug}` | Get category |
| GET | `/api/v1/regions` | List regions |
| GET | `/api/v1/regions/{slug}` | Get region |

### Admin API (requires X-API-Key header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/jobs` | Create job |
| PUT | `/api/v1/admin/jobs/{id}` | Update job |
| PATCH | `/api/v1/admin/jobs/{id}/status` | Change job status |
| DELETE | `/api/v1/admin/jobs/{id}` | Delete job (soft) |
| POST | `/api/v1/admin/categories` | Create category |
| PUT | `/api/v1/admin/categories/{id}` | Update category |

### Query Parameters

```
# Pagination
?page=1&page_size=20

# Filtering
?q=developer              # Search in title/company
?category=it-programming  # Filter by category slug
?region=batumi           # Filter by region slug
?has_salary=true         # Jobs with salary info
?is_vip=true             # VIP jobs only
?status=active           # Job status

# Sorting
?sort=-published_at      # Newest first (default)
?sort=deadline_at        # By deadline
```

## Admin Usage

Use the Swagger UI at `/docs` for admin operations. Include the API key in the `X-API-Key` header.

### Creating a Job (curl example)

```bash
curl -X POST http://localhost/api/v1/admin/jobs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-admin-api-key" \
  -d '{
    "title_ge": "პროგრამისტი",
    "title_en": "Programmer",
    "body_ge": "ვაკანსიის აღწერა...",
    "body_en": "Job description...",
    "company_name": "Company",
    "category_id": "uuid-of-category",
    "status": "active"
  }'
```

## Development

### Running Locally (without Docker)

```bash
# Backend
cd api
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/jobboard"
uvicorn app.main:app --reload

# Frontend (serve static files)
cd web/static
python -m http.server 8080
```

### Running Tests

```bash
# Unit tests
docker-compose exec api pytest tests/unit -v

# Integration tests
docker-compose exec api pytest tests/integration -v
```

### Database Migrations

```bash
# Create new migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec api alembic upgrade head

# Rollback
docker-compose exec api alembic downgrade -1
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| POSTGRES_USER | Database user | postgres |
| POSTGRES_PASSWORD | Database password | postgres |
| POSTGRES_DB | Database name | jobboard |
| ADMIN_API_KEY | Admin API key | change-me-in-production |
| SECRET_KEY | Secret key for tokens | change-me-in-production |
| DEBUG | Debug mode | false |
| ENVIRONMENT | Environment name | production |

## Production Deployment

1. Update `.env` with secure credentials
2. Configure SSL/TLS (use nginx reverse proxy)
3. Set up database backups
4. Configure monitoring (health checks)
5. Enable rate limiting

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
