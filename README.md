# Jobs.ge Parser - Batumi/Adjara Region

A comprehensive bilingual job listing parser for [jobs.ge](https://jobs.ge) with SQLite storage, deduplication, analytics, and a Grafana-style dashboard.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Command Line Interface](#command-line-interface)
  - [HTTP API Server](#http-api-server)
  - [Batch Scripts](#batch-scripts)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Analytics & Dashboard](#analytics--dashboard)
- [Job Categories](#job-categories)
- [Configuration](#configuration)
- [Data Export](#data-export)
- [Prometheus Integration](#prometheus-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

This parser scrapes job listings from jobs.ge for the Batumi/Adjara region (and other Georgian regions), storing them in a SQLite database with full bilingual support (English and Georgian). It includes:

- **Automatic deduplication** using content hashing
- **Job body extraction** from detail pages
- **Change tracking** with job history
- **Expiration detection** for removed listings
- **Analytics dashboard** with Grafana-style visualizations
- **Prometheus metrics endpoint** for monitoring
- **REST API** for integration with other systems

---

## Features

### Core Features
- **Bilingual Support**: Fetches job titles, descriptions, and dates in both English and Georgian
- **Smart Deduplication**: Uses MD5 content hashing to detect duplicate and updated listings
- **Job Body Extraction**: Parses full job descriptions from detail pages
- **Expiration Tracking**: Automatically marks jobs as expired when they're removed from the site
- **VIP Job Detection**: Separately tracks VIP/premium listings

### Analytics Features
- **16 Job Categories**: Automatic classification based on title and content keywords
- **Time Series Metrics**: Daily snapshots of job market statistics
- **Historical Data**: 30-day trend analysis for all metrics
- **Company Rankings**: Top hiring companies tracking

### Dashboard Features
- **Grafana-Style Interface**: Dark theme with modern visualizations
- **Interactive Charts**: Built with Chart.js
- **Real-time Updates**: Refresh button for live data
- **Multiple Chart Types**: Line, bar, area, doughnut charts
- **Responsive Design**: Works on desktop and mobile

### Integration Features
- **REST API**: Full HTTP API for all operations
- **Prometheus Metrics**: Standard metrics format for monitoring
- **JSON Export**: Export jobs for website integration
- **Scheduled Parsing**: Built-in scheduler for automated runs

---

## Architecture

```
batumi.work/
├── jobs_parser.py      # Core parser and database operations
├── analytics.py        # Job classification and metrics
├── dashboard.py        # Dashboard HTML generator
├── server.py           # HTTP API server
├── data/
│   └── jobs.db         # SQLite database
├── run_*.bat           # Windows batch launchers
└── README.md           # This documentation
```

### Component Overview

| Component | Description |
|-----------|-------------|
| `jobs_parser.py` | Main parser with `JobsGeParser` and `JobsDatabase` classes |
| `analytics.py` | `JobClassifier` and `MetricsDatabase` for analytics |
| `dashboard.py` | Generates static HTML dashboard with Chart.js |
| `server.py` | HTTP server with REST API and dashboard serving |

---

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Dependencies
```bash
pip install requests beautifulsoup4 schedule
```

Or let the batch scripts auto-install dependencies:
```batch
run_parser.bat
```

### Clone/Download
```bash
git clone <repository-url>
cd batumi.work
```

---

## Quick Start

### Option 1: Run Parser Once
```batch
run_parser.bat
```
This will:
1. Install dependencies if needed
2. Fetch all jobs from jobs.ge for Adjara region
3. Store them in the SQLite database
4. Export new jobs to JSON

### Option 2: Start API Server with Dashboard
```batch
run_server.bat
```
Then open: http://localhost:8080/

### Option 3: Generate Static Dashboard
```batch
run_dashboard.bat
```
Opens `dashboard.html` in your browser.

---

## Usage

### Command Line Interface

The main parser (`jobs_parser.py`) supports several command-line arguments:

```bash
# Basic parse (fetch jobs, store in DB, fetch job bodies)
python jobs_parser.py

# Parse specific region
python jobs_parser.py --region tbilisi

# Parse and export new jobs to JSON
python jobs_parser.py --export

# Export all active jobs (full sync)
python jobs_parser.py --export-all

# Show statistics only
python jobs_parser.py --stats

# Skip fetching job bodies (faster)
python jobs_parser.py --no-bodies

# Backfill missing job bodies
python jobs_parser.py --backfill-bodies

# Run on schedule (every N minutes)
python jobs_parser.py --schedule 60 --export
```

#### Available Regions

| Region | ID | Command |
|--------|-----|---------|
| Adjara (Batumi) | 14 | `--region adjara` |
| Tbilisi | 1 | `--region tbilisi` |
| Imereti | 2 | `--region imereti` |
| Kakheti | 3 | `--region kakheti` |
| Kvemo Kartli | 4 | `--region kvemo_kartli` |
| Shida Kartli | 5 | `--region shida_kartli` |
| Samtskhe | 6 | `--region samtskhe` |
| Guria | 7 | `--region guria` |
| Samegrelo | 8 | `--region samegrelo` |
| Racha | 9 | `--region racha` |
| Mtskheta | 10 | `--region mtskheta` |

### HTTP API Server

Start the server:
```bash
python server.py --host 127.0.0.1 --port 8080
```

The server provides:
- **Dashboard UI** at `/` or `/dashboard`
- **REST API** for all operations
- **Prometheus metrics** at `/metrics`

### Batch Scripts

| Script | Purpose |
|--------|---------|
| `run_parser.bat` | Single parse run with export |
| `run_server.bat` | Start HTTP API server |
| `run_dashboard.bat` | Generate and open static dashboard |
| `run_scheduled.bat` | Run parser every 60 minutes |
| `run_stats.bat` | Show job market statistics |
| `run_backfill.bat` | Fetch missing job descriptions |
| `run_export_all.bat` | Export all active jobs to JSON |

---

## API Reference

### Dashboard & Metrics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Grafana-style analytics dashboard |
| `/dashboard` | GET | Same as `/` |
| `/metrics` | GET | Prometheus-format metrics |
| `/health` | GET | Health check endpoint |

### Parser Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/parse?region=adjara` | GET | Run parser for region |
| `/trigger?region=adjara` | GET | Alias for `/parse` |

### Job Data

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/jobs?region=adjara` | GET | Get all active jobs |
| `/jobs/new?region=adjara` | GET | Get unexported jobs only |
| `/stats?region=adjara` | GET | Get job market statistics |

### Export

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/export?region=adjara` | GET | Export new jobs to JSON file |
| `/export/all?region=adjara` | GET | Export all active jobs |

### Analytics API (JSON)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard?days=30` | GET | Complete dashboard data |
| `/api/categories` | GET | Category breakdown |
| `/api/timeseries?metric=X&days=30` | GET | Time series for specific metric |
| `/regions` | GET | List available regions |

### Response Examples

#### GET /jobs
```json
{
  "region": "adjara",
  "count": 301,
  "jobs": [
    {
      "id": "12345",
      "title_en": "Sales Manager - Batumi",
      "title_ge": "გაყიდვების მენეჯერი - ბათუმი",
      "company": "Example Company",
      "location": "Batumi",
      "published_en": "Jan 18, 2026",
      "deadline_en": "Feb 18, 2026",
      "body_en": "Full job description...",
      "body_ge": "სრული აღწერა...",
      "url_en": "https://jobs.ge/en/?view=jobs&id=12345",
      "url_ge": "https://jobs.ge/ge/?view=jobs&id=12345",
      "has_salary": true,
      "is_vip": false,
      "status": "active",
      "first_seen_at": "2026-01-15T10:30:00",
      "last_seen_at": "2026-01-18T14:00:00"
    }
  ]
}
```

#### GET /stats
```json
{
  "total_active": 301,
  "total_historical": 450,
  "with_salary": 90,
  "with_salary_pct": 29.9,
  "vip_count": 1,
  "new_last_24h": 15,
  "new_last_7d": 85,
  "expired_last_24h": 5,
  "top_companies": [
    {"company": "Company A", "count": 12},
    {"company": "Company B", "count": 8}
  ],
  "generated_at": "2026-01-18T14:30:00"
}
```

#### GET /metrics (Prometheus format)
```
# HELP jobs_total_active Total number of active job listings
# TYPE jobs_total_active gauge
jobs_total_active 301
# HELP jobs_with_salary Number of jobs with salary information
# TYPE jobs_with_salary gauge
jobs_with_salary 90
# HELP jobs_by_category Number of jobs per category
# TYPE jobs_by_category gauge
jobs_by_category{category="Sales_Procurement"} 45
jobs_by_category{category="IT_Programming"} 38
```

---

## Database Schema

The SQLite database (`data/jobs.db`) contains the following tables:

### jobs
Main job listings table.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (job ID from jobs.ge) |
| content_hash | TEXT | MD5 hash for change detection |
| title_en | TEXT | English title |
| title_ge | TEXT | Georgian title |
| company | TEXT | Company name |
| location | TEXT | Job location |
| published_en | TEXT | Published date (English) |
| published_ge | TEXT | Published date (Georgian) |
| deadline_en | TEXT | Deadline (English) |
| deadline_ge | TEXT | Deadline (Georgian) |
| body_en | TEXT | Full description (English) |
| body_ge | TEXT | Full description (Georgian) |
| url_en | TEXT | English detail URL |
| url_ge | TEXT | Georgian detail URL |
| has_salary | BOOLEAN | Has salary information |
| is_vip | BOOLEAN | Is VIP/premium listing |
| region | TEXT | Region code |
| first_seen_at | TEXT | First scrape timestamp |
| last_seen_at | TEXT | Last scrape timestamp |
| status | TEXT | 'active' or 'expired' |
| exported | BOOLEAN | Has been exported |
| created_at | TEXT | Record creation time |

### job_history
Change tracking for jobs.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| job_id | TEXT | Foreign key to jobs |
| event_type | TEXT | 'created', 'updated', 'expired', 'reactivated' |
| event_data | TEXT | JSON event details |
| created_at | TEXT | Event timestamp |

### scrape_runs
Log of parser runs.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| started_at | TEXT | Run start time |
| completed_at | TEXT | Run end time |
| region | TEXT | Region code |
| total_found | INTEGER | Total jobs found |
| new_jobs | INTEGER | New jobs added |
| updated_jobs | INTEGER | Jobs updated |
| expired_jobs | INTEGER | Jobs expired |
| status | TEXT | Run status |

### metrics_daily
Time series metrics storage.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| date | TEXT | Date (YYYY-MM-DD) |
| metric_name | TEXT | Metric identifier |
| metric_value | REAL | Metric value |
| labels | TEXT | JSON labels (e.g., {"category": "IT"}) |
| created_at | TEXT | Record creation time |

### job_categories
Category assignments for jobs.

| Column | Type | Description |
|--------|------|-------------|
| job_id | TEXT | Primary key, foreign key to jobs |
| category | TEXT | Category name |
| confidence | REAL | Classification confidence |
| updated_at | TEXT | Last update time |

---

## Analytics & Dashboard

### Dashboard Panels

The Grafana-style dashboard includes:

1. **Stats Cards** (top row)
   - Total Active Jobs
   - New This Week
   - With Salary Info (+ percentage)
   - VIP Listings
   - Active Categories

2. **Total Active Jobs by Category (Cumulative)**
   - Stacked area chart showing all categories over time
   - 7d/14d/30d time range selector
   - Interactive legend

3. **New Jobs Posted Per Day (Daily Posting Rate)**
   - Stacked area time series
   - Shows daily posting volume by category
   - Dynamic Y-axis with +20 headroom

4. **Total Jobs Trend**
   - Bar chart of total active jobs over time
   - Shows min-max range

5. **Jobs with Salary Information**
   - Area chart tracking salary transparency
   - Shows min-max range

6. **Current Category Distribution**
   - Doughnut chart with all categories
   - Color-coded legend

7. **Top Hiring Companies**
   - Horizontal bar chart of top 8 companies
   - Shows job count per company

### Metrics Tracked

| Metric | Description |
|--------|-------------|
| `jobs_total_active` | Total active job listings |
| `jobs_with_salary` | Jobs with salary information |
| `jobs_new_today` | New jobs posted today |
| `jobs_posted_daily` | Daily posting count |
| `jobs_by_category` | Active jobs per category |
| `jobs_posted_by_category` | Daily posts per category |
| `jobs_by_company` | Jobs per company |

---

## Job Categories

The parser automatically classifies jobs into 16 categories based on title and body keyword matching:

| Category | Color | Example Keywords (EN) | Example Keywords (GE) |
|----------|-------|----------------------|----------------------|
| Administration/Management | #FF6B6B | manager, director, executive | მენეჯერი, დირექტორი |
| Sales/Procurement | #4ECDC4 | sales, buyer, retail, cashier | გაყიდვები, კონსულტანტი |
| Finance/Statistics | #45B7D1 | accountant, auditor, bank | ბუღალტერი, ფინანსები |
| PR/Marketing | #96CEB4 | marketing, advertising, SEO | მარკეტინგი, რეკლამა |
| IT/Programming | #9B59B6 | developer, programmer, QA | პროგრამისტი, დეველოპერი |
| Logistics/Transport | #F39C12 | driver, delivery, warehouse | მძღოლი, კურიერი |
| Construction/Repair | #E67E22 | builder, architect, electrician | მშენებლობა, არქიტექტორი |
| Education | #1ABC9C | teacher, instructor, trainer | მასწავლებელი, ტრენერი |
| Medicine/Pharmacy | #E74C3C | doctor, nurse, pharmacist | ექიმი, ფარმაცევტი |
| Food/Hospitality | #D35400 | cook, waiter, hotel | მზარეული, მიმტანი |
| Security/Safety | #34495E | security, guard, officer | დაცვა, უსაფრთხოება |
| Cleaning | #95A5A6 | cleaner, housekeeper | დამლაგებელი |
| Media/Publishing | #8E44AD | journalist, editor, writer | ჟურნალისტი, რედაქტორი |
| Beauty/Fashion | #FF69B4 | stylist, hairdresser, spa | სტილისტი, პარიკმახერი |
| Law | #2C3E50 | lawyer, attorney, notary | იურისტი, ადვოკატი |
| Technical Staff | #7F8C8D | technician, mechanic, operator | ტექნიკოსი, მექანიკოსი |
| Other | #BDC3C7 | (unclassified) | |

### Classification Algorithm

1. Combine title and body text for both languages
2. Search for keyword matches (case-insensitive for English)
3. Score matches: **+3 points** for title match, **+1 point** for body match
4. Assign category with highest score
5. Default to "Other" if no matches

---

## Configuration

### Server Configuration

```bash
python server.py --host 0.0.0.0 --port 8080
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--host` | 127.0.0.1 | Bind address (0.0.0.0 for all interfaces) |
| `--port` | 8080 | Port number |

### Parser Configuration

```bash
python jobs_parser.py --region adjara --schedule 60
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--region` | adjara | Region to parse |
| `--schedule` | none | Run interval in minutes |
| `--no-bodies` | false | Skip fetching job descriptions |

### Database Location

Default: `data/jobs.db`

To change, modify the `db_path` parameter when instantiating classes:
```python
parser = JobsGeParser(region="adjara", db_path="custom/path/jobs.db")
```

---

## Data Export

### Export New Jobs Only
```bash
python jobs_parser.py --export
```

Creates: `data/export_adjara_YYYYMMDD_HHMMSS.json`

### Export All Active Jobs
```bash
python jobs_parser.py --export-all
```

Creates: `data/all_active_adjara_YYYYMMDD_HHMMSS.json`

### Export Format
```json
{
  "exported_at": "2026-01-18T14:30:00.123456",
  "region": "adjara",
  "count": 50,
  "jobs": [
    {
      "id": "12345",
      "title_en": "Job Title",
      "title_ge": "ვაკანსიის სათაური",
      "company": "Company Name",
      "body_en": "Full description...",
      "body_ge": "სრული აღწერა...",
      "has_salary": true,
      "first_seen_at": "2026-01-15T10:00:00",
      ...
    }
  ]
}
```

---

## Prometheus Integration

### Scrape Configuration

Add to your `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'jobs_ge'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 5m
```

### Available Metrics

```
# Gauges
jobs_total_active          - Total active listings
jobs_with_salary           - Jobs with salary info
jobs_vip                   - VIP listings count
jobs_new_today            - Jobs posted today

# Labels
jobs_by_category{category="Sales_Procurement"}
jobs_by_company{company="Company Name"}
```

### Grafana Dashboard

Import the metrics into Grafana and create panels using PromQL:
```promql
# Total jobs over time
jobs_total_active

# Jobs by category
sum by (category) (jobs_by_category)

# Salary transparency rate
jobs_with_salary / jobs_total_active * 100
```

---

## Troubleshooting

### Common Issues

#### "Python is not installed"
Install Python 3.8+ from https://python.org and ensure it's added to PATH.

#### "Module not found" errors
Run dependency installation:
```bash
pip install requests beautifulsoup4 schedule
```

#### "Connection refused" or timeout errors
- Check your internet connection
- jobs.ge may be temporarily unavailable
- Try again after a few minutes

#### "UnicodeEncodeError" on Windows
The batch scripts include `chcp 65001` to set UTF-8 encoding. If issues persist:
```batch
set PYTHONIOENCODING=utf-8
python jobs_parser.py
```

#### Database locked
Stop any other processes using the database:
- Close the dashboard
- Stop the API server
- Wait for scheduled parser to finish

#### No jobs found
- Verify the region exists: `python jobs_parser.py --region tbilisi`
- Check if jobs.ge website structure changed
- Review parser logs for errors

### Debug Mode

For verbose output, modify `jobs_parser.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Reset Database

To start fresh:
```bash
del data\jobs.db
python jobs_parser.py
```

---

## License

This project is for educational and personal use. Please respect jobs.ge's terms of service and implement appropriate rate limiting when scraping.

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## Support

For issues and feature requests, please open an issue on the repository.
