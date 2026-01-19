# Administrator Guide - Georgia Job Board

This guide covers all administrative functions for managing the Georgia Job Board.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Authentication](#api-authentication)
3. [Job Management](#job-management)
4. [Category Management](#category-management)
5. [Parser Management](#parser-management)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Backup Management](#backup-management)
8. [API Reference](#api-reference)

---

## Getting Started

### Admin Access

Administration is performed through:
1. **Swagger UI**: `http://your-domain.com/docs`
2. **Direct API calls**: Using curl, Postman, or similar tools
3. **Analytics Dashboard**: `http://your-domain.com/admin/analytics.html`

### Required Credentials

| Credential | Environment Variable | Description |
|------------|---------------------|-------------|
| Admin API Key | `ADMIN_API_KEY` | Required for all admin endpoints |

---

## API Authentication

### Using the API Key

All admin endpoints require the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-admin-api-key" \
     http://localhost:8000/api/v1/admin/jobs
```

### Swagger Authentication

1. Go to `http://your-domain.com/docs`
2. Click "Authorize" button
3. Enter your API key in the `X-API-Key` field
4. Click "Authorize"

---

## Job Management

### Create a Job

**Endpoint**: `POST /api/v1/admin/jobs`

```bash
curl -X POST http://localhost:8000/api/v1/admin/jobs \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title_ge": "პროგრამისტი",
    "title_en": "Programmer",
    "body_ge": "სრული აღწერა ქართულად...",
    "body_en": "Full description in English...",
    "company_name": "TechCorp",
    "category_id": "uuid-of-category",
    "location": "Tbilisi",
    "has_salary": true,
    "salary_min": 3000,
    "salary_max": 5000,
    "salary_currency": "GEL",
    "status": "active"
  }'
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title_ge` | string | Job title in Georgian |
| `body_ge` | string | Job description in Georgian |
| `category_id` | UUID | Category identifier |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title_en` | string | null | English title |
| `body_en` | string | null | English description |
| `company_name` | string | null | Company name |
| `location` | string | null | Location/city |
| `has_salary` | boolean | false | Salary disclosed? |
| `salary_min` | integer | null | Minimum salary |
| `salary_max` | integer | null | Maximum salary |
| `salary_currency` | string | "GEL" | Currency (GEL/USD/EUR) |
| `is_vip` | boolean | false | Premium listing? |
| `deadline_at` | datetime | null | Application deadline |
| `status` | string | "active" | Job status |

### Update a Job

**Endpoint**: `PUT /api/v1/admin/jobs/{id}`

```bash
curl -X PUT http://localhost:8000/api/v1/admin/jobs/uuid-here \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title_ge": "Updated Title",
    "salary_max": 6000
  }'
```

### Change Job Status

**Endpoint**: `PATCH /api/v1/admin/jobs/{id}/status`

```bash
curl -X PATCH http://localhost:8000/api/v1/admin/jobs/uuid-here/status \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

**Available statuses:**
- `active` - Visible on website
- `inactive` - Hidden from website
- `expired` - Past deadline
- `pending_review` - Awaiting approval

### Delete a Job

**Endpoint**: `DELETE /api/v1/admin/jobs/{id}`

```bash
curl -X DELETE http://localhost:8000/api/v1/admin/jobs/uuid-here \
  -H "X-API-Key: your-api-key"
```

---

## Category Management

### List Categories

**Endpoint**: `GET /api/v1/categories`

```bash
curl http://localhost:8000/api/v1/categories
```

### Create Category

**Endpoint**: `POST /api/v1/admin/categories`

```bash
curl -X POST http://localhost:8000/api/v1/admin/categories \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name_ge": "ახალი კატეგორია",
    "name_en": "New Category",
    "slug": "new-category",
    "is_active": true
  }'
```

### Update Category

**Endpoint**: `PUT /api/v1/admin/categories/{id}`

```bash
curl -X PUT http://localhost:8000/api/v1/admin/categories/uuid-here \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Updated Name"
  }'
```

### Current Categories

| Slug | Georgian | English |
|------|----------|---------|
| it-programming | IT და პროგრამირება | IT & Programming |
| sales-marketing | გაყიდვები და მარკეტინგი | Sales & Marketing |
| finance-accounting | ფინანსები და ბუღალტერია | Finance & Accounting |
| medicine-healthcare | მედიცინა და ჯანდაცვა | Medicine & Healthcare |
| education | განათლება | Education |
| tourism-hospitality | ტურიზმი და სტუმართმოყვარეობა | Tourism & Hospitality |
| construction | მშენებლობა | Construction |
| logistics-transport | ლოჯისტიკა და ტრანსპორტი | Logistics & Transport |
| hr-admin | HR და ადმინისტრაცია | HR & Administration |
| customer-service | მომხმარებელთა მომსახურება | Customer Service |
| legal | იურიდიული | Legal |
| design-creative | დიზაინი და კრეატივი | Design & Creative |
| media-journalism | მედია და ჟურნალისტიკა | Media & Journalism |
| agriculture | სოფლის მეურნეობა | Agriculture |
| manufacturing | წარმოება | Manufacturing |
| other | სხვა | Other |

---

## Parser Management

### List Parser Sources

**Endpoint**: `GET /api/v1/admin/parser/sources`

```bash
curl http://localhost:8000/api/v1/admin/parser/sources \
  -H "X-API-Key: your-api-key"
```

### View Parser Runs

**Endpoint**: `GET /api/v1/admin/parser/runs`

```bash
curl http://localhost:8000/api/v1/admin/parser/runs \
  -H "X-API-Key: your-api-key"
```

### Trigger Manual Parse

**Endpoint**: `POST /api/v1/admin/parser/trigger`

```bash
curl -X POST http://localhost:8000/api/v1/admin/parser/trigger \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"source": "jobs.ge"}'
```

### Parser Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PARSER_INTERVAL_MINUTES` | 60 | Time between automatic runs |
| `NOT_SEEN_DAYS_TO_INACTIVE` | 7 | Days before marking job inactive |
| `ENABLED_SOURCES` | jobs.ge,hr.ge | Comma-separated source list |
| `PARSE_REGIONS` | batumi,tbilisi | Regions to parse |

---

## Analytics Dashboard

### Access

URL: `http://your-domain.com/admin/analytics.html`

No authentication required for viewing (data comes from protected API).

### Dashboard Sections

1. **Overview Cards**
   - Total Jobs
   - Active Jobs
   - Jobs with Salary
   - Total Views

2. **Charts**
   - Jobs by Category (pie chart)
   - Jobs by Region (bar chart)
   - Salary Distribution (histogram)

3. **Recent Activity**
   - Latest job views
   - Popular searches

### Analytics API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/admin/analytics/dashboard` | Main dashboard data |
| `GET /api/v1/admin/analytics/jobs` | Job market analytics |
| `GET /api/v1/admin/analytics/views` | View statistics |
| `GET /api/v1/admin/analytics/searches` | Search analytics |

---

## Backup Management

### View Backup Status

**Endpoint**: `GET /api/v1/admin/backups/status`

```bash
curl http://localhost:8000/api/v1/admin/backups/status \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "last_backup": "2026-01-19T09:02:16",
  "last_backup_size_mb": 0.74,
  "backup_count_daily": 1,
  "backup_count_weekly": 0,
  "backup_count_manual": 0,
  "total_size_mb": 0.74,
  "health": "healthy",
  "next_scheduled": "2026-01-20T03:00:00"
}
```

### List Backups

**Endpoint**: `GET /api/v1/admin/backups`

```bash
curl http://localhost:8000/api/v1/admin/backups \
  -H "X-API-Key: your-api-key"
```

### Trigger Manual Backup

**Endpoint**: `POST /api/v1/admin/backups/trigger`

```bash
curl -X POST http://localhost:8000/api/v1/admin/backups/trigger \
  -H "X-API-Key: your-api-key"
```

### Download Backup

**Endpoint**: `GET /api/v1/admin/backups/{filename}`

```bash
curl -O http://localhost:8000/api/v1/admin/backups/jobboard_20260119.sql.gz \
  -H "X-API-Key: your-api-key"
```

---

## API Reference

### Base URL

```
http://your-domain.com/api/v1
```

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs` | List jobs (paginated) |
| GET | `/jobs/{id}` | Get job details |
| GET | `/categories` | List categories |
| GET | `/regions` | List regions |

### Admin Endpoints (require X-API-Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/jobs` | Create job |
| PUT | `/admin/jobs/{id}` | Update job |
| PATCH | `/admin/jobs/{id}/status` | Change status |
| DELETE | `/admin/jobs/{id}` | Delete job |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/{id}` | Update category |
| GET | `/admin/parser/runs` | Parser run history |
| POST | `/admin/parser/trigger` | Trigger parser |
| GET | `/admin/backups` | List backups |
| GET | `/admin/backups/status` | Backup health |
| POST | `/admin/backups/trigger` | Create backup |
| GET | `/admin/analytics/dashboard` | Analytics data |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 20) |
| `status` | string | Filter by status |
| `category` | string | Filter by category slug |
| `region` | string | Filter by region slug |
| `has_salary` | bool | Filter jobs with salary |
| `is_vip` | bool | Filter VIP jobs |
| `q` | string | Search query |

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Error:**
```json
{
  "detail": "Error message here"
}
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid API key | Check X-API-Key header |
| 404 Not Found | Invalid endpoint or ID | Verify URL and UUID |
| 422 Validation Error | Invalid request body | Check required fields |
| 500 Server Error | Internal error | Check API logs |

### Checking Logs

```bash
docker-compose logs -f api
```

### Health Check

```bash
curl http://localhost:8000/health/detailed
```

---

*Last updated: January 2026*
