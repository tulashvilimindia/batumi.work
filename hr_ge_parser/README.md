# HR.GE Parser

Production-grade job scraping system for hr.ge with Docker-based development, PostgreSQL database, and FastAPI REST API.

## Features

- Automatic job scraping from hr.ge every 6 hours
- RESTful API for accessing job data
- PostgreSQL database with full job details
- Docker-based deployment
- Sitemap-based job discovery
- Rate-limited API client with retry logic

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)

### Running with Docker

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Run parser manually
docker-compose exec app python scripts/run_parser.py

# Stop services
docker-compose down
```

### Access Points

- **API**: http://localhost:8089
- **API Docs**: http://localhost:8089/docs
- **Database**: localhost:5433 (external port)

## API Endpoints

### Jobs
- `GET /api/v1/jobs` - List jobs (paginated, filterable)
- `GET /api/v1/jobs/{id}` - Get job by ID
- `GET /api/v1/jobs/search?q=keyword` - Search jobs
- `GET /api/v1/jobs/latest` - Latest jobs

### Companies
- `GET /api/v1/companies` - List companies
- `GET /api/v1/companies/{id}` - Get company
- `GET /api/v1/companies/{id}/jobs` - Company's jobs

### Statistics
- `GET /api/v1/stats` - Platform statistics
- `GET /api/v1/stats/by-location` - Jobs by city
- `GET /api/v1/stats/salary` - Salary statistics

### Parser Control
- `POST /api/v1/parser/run` - Trigger manual run
- `GET /api/v1/parser/status` - Current status
- `GET /api/v1/parser/history` - Run history

### Health
- `GET /health` - Health check
- `GET /ready` - Readiness check

## Configuration

Environment variables (see `.env.example`):

```env
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=hrparser
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=hr_ge_jobs
API_PORT=8089
PARSER_SCHEDULE_HOURS=6
```

## Development

### Local Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
python scripts/init_db.py

# Run application
uvicorn app.main:app --reload --port 8089
```

### Running Tests

```bash
pip install pytest pytest-asyncio
pytest tests/ -v
```

## Project Structure

```
hr_ge_parser/
├── docker-compose.yml
├── Dockerfile
├── .env
├── requirements.txt
├── alembic/                    # Database migrations
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Settings
│   ├── database.py             # DB connection
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── api/                    # REST endpoints
│   ├── parser/                 # Scraping logic
│   └── utils/                  # Helpers
├── scripts/
│   ├── init_db.py              # Initialize database
│   └── run_parser.py           # Manual parser trigger
├── docs/
│   ├── MANAGEMENT_DOCUMENTATION.md  # Full system documentation
│   └── FRONTEND_PLAN.md             # Admin dashboard plan
└── tests/
```

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Management Documentation](docs/MANAGEMENT_DOCUMENTATION.md)** - Complete technical and business documentation including:
  - System architecture and data flow
  - Database schema and data model
  - API capabilities and usage examples
  - Deployment and infrastructure guide
  - Monitoring and maintenance procedures
  - Cost analysis and security considerations

- **[Frontend Plan](docs/FRONTEND_PLAN.md)** - Admin dashboard specification including:
  - Page layouts and wireframes
  - Component specifications
  - API integration patterns
  - Design system (colors, typography, spacing)
  - Implementation roadmap (4 phases)
  - Recommended tech stack (React/Next.js + TypeScript + shadcn/ui)

## License

MIT
