# API Documentation
# jobsNGUI - Complete Backend API Specification

**Version:** 2.0.0
**Date:** January 23, 2026
**Authors:** Architecture Team
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Authentication & Security](#3-authentication--security)
4. [Request Format](#4-request-format)
5. [Response Format](#5-response-format)
6. [Endpoints](#6-endpoints)
7. [Data Models](#7-data-models)
8. [Error Handling](#8-error-handling)
9. [Pagination](#9-pagination)
10. [Filtering & Sorting](#10-filtering--sorting)
11. [Rate Limiting](#11-rate-limiting)
12. [Caching](#12-caching)
13. [Localization](#13-localization)
14. [Analytics API](#14-analytics-api)
15. [WebSocket Events](#15-websocket-events)
16. [API Client SDK](#16-api-client-sdk)
17. [Testing](#17-testing)
18. [OpenAPI Specification](#18-openapi-specification)
19. [Changelog](#19-changelog)

---

## 1. Overview

### 1.1 Purpose

The jobsNGUI API provides RESTful access to job listings aggregated from multiple Georgian job portals, primarily jobs.ge. The API serves the React frontend application with job data, categories, regions, and analytics capabilities.

### 1.2 Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://batumi.work/api/v1` |
| Staging | `https://staging.batumi.work/api/v1` |
| Development | `http://localhost:8000/api/v1` |
| Docker Local | `http://localhost:8102/api/v1` |

### 1.3 API Versioning

- Version is included in URL path: `/api/v1/`
- Current version: `v1`
- Deprecated versions receive 6 months support
- Version header (optional): `X-API-Version: 1`

### 1.4 Content Type

All requests and responses use JSON:
```
Content-Type: application/json
Accept: application/json
```

### 1.5 Character Encoding

- All text uses UTF-8 encoding
- Georgian text (ქართული) fully supported
- Emoji support in job descriptions

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  jobsNGUI React App (Port 8103)                                             │
│  ├── TanStack Query (Server State)                                          │
│  ├── Zustand (Client State)                                                 │
│  └── React Router (URL State)                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Nginx Reverse Proxy                                                        │
│  ├── SSL Termination                                                        │
│  ├── Rate Limiting                                                          │
│  ├── CORS Headers                                                           │
│  └── Gzip Compression                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  FastAPI Application (Port 8000)                                            │
│  ├── Pydantic Models (Validation)                                           │
│  ├── SQLAlchemy ORM (Database)                                              │
│  ├── Alembic (Migrations)                                                   │
│  └── APScheduler (Job Sync)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                                        │
│  ├── jobs (Main table)                                                      │
│  ├── categories                                                             │
│  ├── regions                                                                │
│  ├── analytics_events                                                       │
│  └── Full-text search indexes                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
Client Request
     │
     ▼
┌─────────────┐
│   Nginx     │──── Rate Limit Check ──── 429 Too Many Requests
│  Gateway    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   FastAPI   │──── Validation Error ──── 422 Unprocessable Entity
│  Validation │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Route     │──── Not Found ──── 404 Not Found
│   Handler   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │──── Query Error ──── 500 Internal Error
│   Query     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Response   │──── 200 OK + JSON
│ Serializer  │
└─────────────┘
```

---

## 3. Authentication & Security

### 3.1 Public Endpoints

All job listing endpoints are **publicly accessible** without authentication:

| Endpoint | Auth Required |
|----------|---------------|
| `GET /jobs` | No |
| `GET /jobs/{id}` | No |
| `GET /categories` | No |
| `GET /regions` | No |
| `POST /analytics/track` | No |
| `GET /health` | No |

### 3.2 CORS Configuration

```python
# FastAPI CORS settings
CORS_ORIGINS = [
    "https://batumi.work",
    "https://www.batumi.work",
    "http://localhost:5173",    # Vite dev
    "http://localhost:8103",    # Docker
]

CORS_METHODS = ["GET", "POST", "OPTIONS"]
CORS_HEADERS = ["Content-Type", "Accept", "X-Request-ID"]
CORS_MAX_AGE = 86400  # 24 hours
```

### 3.3 Security Headers

Response headers set by API:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### 3.4 Request ID Tracking

Every request receives a unique ID for tracing:

```http
# Request (optional)
X-Request-ID: client-generated-uuid

# Response (always)
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## 4. Request Format

### 4.1 HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Retrieve resources |
| `POST` | Create resources / Send data |
| `HEAD` | Check resource existence |
| `OPTIONS` | CORS preflight |

### 4.2 Query Parameters

```
GET /api/v1/jobs?q=developer&category=it-programming&page=1&page_size=30
```

**Rules:**
- Use snake_case for parameter names
- Multiple values: `category=it&category=marketing` or `category=it,marketing`
- Boolean: `has_salary=true` or `has_salary=1`
- Empty string treated as "not provided"

### 4.3 Path Parameters

```
GET /api/v1/jobs/{id}
```

**Rules:**
- Numeric IDs are integers: `/jobs/12345`
- Slugs are lowercase alphanumeric with hyphens: `/categories/it-programming`

### 4.4 Request Body (POST)

```http
POST /api/v1/analytics/track
Content-Type: application/json

{
    "event": "job_view",
    "data": {
        "job_id": 12345
    }
}
```

### 4.5 Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (POST) | Must be `application/json` |
| `Accept` | No | Default: `application/json` |
| `Accept-Language` | No | `ge`, `en` (affects error messages) |
| `X-Request-ID` | No | Client-generated trace ID |
| `User-Agent` | No | Client identification |

---

## 5. Response Format

### 5.1 Success Response Structure

**Single Resource:**
```json
{
    "id": 12345,
    "title_ge": "პროგრამისტი",
    "title_en": "Software Developer",
    "company_name": "TechCorp LLC",
    ...
}
```

**Collection Resource:**
```json
{
    "items": [...],
    "total": 1234,
    "page": 1,
    "page_size": 30,
    "pages": 42
}
```

### 5.2 Response Headers

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Response-Time: 45ms
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706025600
Cache-Control: public, max-age=300
ETag: "abc123"
```

### 5.3 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, POST |
| `201` | Created | Resource created |
| `204` | No Content | Successful DELETE |
| `304` | Not Modified | Cached response valid |
| `400` | Bad Request | Invalid query params |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Maintenance mode |

---

## 6. Endpoints

### 6.1 Jobs Endpoints

---

#### 6.1.1 List Jobs

Retrieves a paginated, filtered list of active job postings.

**Endpoint:**
```http
GET /api/v1/jobs
```

**Query Parameters:**

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `page` | integer | No | `1` | min: 1 | Page number (1-indexed) |
| `page_size` | integer | No | `30` | min: 1, max: 100 | Items per page |
| `status` | string | No | `active` | enum: active, expired, all | Job status filter |
| `q` | string | No | - | max: 200 chars | Full-text search query |
| `category` | string | No | - | slug format | Category slug filter |
| `cid` | integer | No | - | jobs.ge ID | Category ID (jobs.ge) |
| `region` | string | No | - | slug format | Region slug filter |
| `lid` | integer | No | - | jobs.ge ID | Location ID (jobs.ge) |
| `has_salary` | boolean | No | - | true/false | Filter jobs with salary |
| `is_vip` | boolean | No | - | true/false | Filter VIP jobs only |
| `is_remote` | boolean | No | - | true/false | Filter remote jobs |
| `published_after` | string | No | - | ISO 8601 date | Jobs published after date |
| `published_before` | string | No | - | ISO 8601 date | Jobs published before date |
| `deadline_after` | string | No | - | ISO 8601 date | Deadline after date |
| `sort` | string | No | `-published_at` | see below | Sort field |

**Sort Options:**

| Value | Description |
|-------|-------------|
| `published_at` | Oldest first |
| `-published_at` | Newest first (default) |
| `deadline` | Earliest deadline first |
| `-deadline` | Latest deadline first |
| `title_ge` | Alphabetical (Georgian) |
| `title_en` | Alphabetical (English) |

**Request Example:**
```bash
curl -X GET "https://batumi.work/api/v1/jobs?q=developer&category=it-programming&lid=14&page=1&page_size=30&has_salary=true" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "items": [
        {
            "id": 12345,
            "title_ge": "სენიორ პროგრამისტი",
            "title_en": "Senior Software Developer",
            "company_name": "TechCorp LLC",
            "location": "Batumi",
            "category_slug": "it-programming",
            "category_name_ge": "IT / პროგრამირება",
            "category_name_en": "IT / Programming",
            "region_slug": "adjara",
            "region_name_ge": "აჭარა",
            "region_name_en": "Adjara",
            "salary_min": 2000,
            "salary_max": 3500,
            "salary_currency": "GEL",
            "has_salary": true,
            "is_vip": false,
            "is_remote": false,
            "published_at": "2026-01-20T10:00:00Z",
            "deadline": "2026-02-15T23:59:59Z",
            "source_name": "jobs.ge",
            "source_url": "https://jobs.ge/en/?view=jobs&id=12345",
            "external_id": "12345",
            "created_at": "2026-01-20T10:05:00Z",
            "updated_at": "2026-01-20T10:05:00Z"
        }
    ],
    "total": 1234,
    "page": 1,
    "page_size": 30,
    "pages": 42,
    "filters_applied": {
        "q": "developer",
        "category": "it-programming",
        "lid": 14,
        "has_salary": true
    }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `INVALID_PAGE` | Page must be a positive integer |
| 400 | `INVALID_PAGE_SIZE` | Page size must be between 1 and 100 |
| 400 | `INVALID_CATEGORY` | Category slug not found |
| 400 | `INVALID_REGION` | Region slug not found |
| 400 | `INVALID_DATE_FORMAT` | Date must be ISO 8601 format |

---

#### 6.1.2 Get Job Details

Retrieves complete details for a single job posting.

**Endpoint:**
```http
GET /api/v1/jobs/{id}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Job ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `increment_views` | boolean | No | `true` | Increment view counter |

**Request Example:**
```bash
curl -X GET "https://batumi.work/api/v1/jobs/12345" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "id": 12345,
    "title_ge": "სენიორ პროგრამისტი",
    "title_en": "Senior Software Developer",
    "company_name": "TechCorp LLC",
    "company_logo_url": null,
    "location": "Batumi",
    "body_ge": "<p>კომპანია TechCorp ეძებს გამოცდილ პროგრამისტს...</p><h3>მოთხოვნები:</h3><ul><li>5+ წლის გამოცდილება</li><li>JavaScript/TypeScript</li><li>React, Node.js</li></ul><h3>ჩვენ გთავაზობთ:</h3><ul><li>კონკურენტუნარიან ხელფასს</li><li>დისტანციური მუშაობის შესაძლებლობას</li></ul>",
    "body_en": "<p>TechCorp is looking for an experienced developer...</p><h3>Requirements:</h3><ul><li>5+ years experience</li><li>JavaScript/TypeScript</li><li>React, Node.js</li></ul><h3>We offer:</h3><ul><li>Competitive salary</li><li>Remote work options</li></ul>",
    "category_id": 6,
    "category_slug": "it-programming",
    "category_name_ge": "IT / პროგრამირება",
    "category_name_en": "IT / Programming",
    "region_id": 14,
    "region_slug": "adjara",
    "region_name_ge": "აჭარა",
    "region_name_en": "Adjara",
    "salary_min": 2000,
    "salary_max": 3500,
    "salary_currency": "GEL",
    "salary_period": "monthly",
    "has_salary": true,
    "is_vip": false,
    "is_remote": false,
    "employment_type": "full-time",
    "experience_level": "senior",
    "published_at": "2026-01-20T10:00:00Z",
    "deadline": "2026-02-15T23:59:59Z",
    "source_name": "jobs.ge",
    "source_url": "https://jobs.ge/en/?view=jobs&id=12345",
    "external_id": "12345",
    "views_count": 234,
    "shares_count": 12,
    "saves_count": 45,
    "contact_email": null,
    "contact_phone": null,
    "apply_url": "https://jobs.ge/en/?view=jobs&id=12345",
    "created_at": "2026-01-20T10:05:00Z",
    "updated_at": "2026-01-22T14:30:00Z",
    "related_jobs": [
        {
            "id": 12346,
            "title_ge": "Junior პროგრამისტი",
            "title_en": "Junior Developer",
            "company_name": "StartupXYZ"
        },
        {
            "id": 12347,
            "title_ge": "Frontend დეველოპერი",
            "title_en": "Frontend Developer",
            "company_name": "DesignHub"
        }
    ]
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 404 | `JOB_NOT_FOUND` | Job with id {id} not found |
| 410 | `JOB_EXPIRED` | Job posting has expired |

---

#### 6.1.3 Search Jobs (Full-Text)

Advanced full-text search with highlighting.

**Endpoint:**
```http
GET /api/v1/jobs/search
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (min 2 chars) |
| `fields` | string | No | `title,body` | Fields to search |
| `highlight` | boolean | No | `false` | Return highlighted matches |
| `fuzzy` | boolean | No | `true` | Enable fuzzy matching |

**Request Example:**
```bash
curl -X GET "https://batumi.work/api/v1/jobs/search?q=react%20developer&highlight=true" \
  -H "Accept: application/json"
```

**Response with Highlighting:**
```json
{
    "items": [
        {
            "id": 12345,
            "title_ge": "სენიორ პროგრამისტი",
            "title_en": "Senior Software <mark>Developer</mark>",
            "company_name": "TechCorp LLC",
            "highlights": {
                "body_en": "...experience with <mark>React</mark> and modern JavaScript..."
            },
            "relevance_score": 0.95
        }
    ],
    "total": 45,
    "query": "react developer",
    "search_time_ms": 12
}
```

---

### 6.2 Categories Endpoints

---

#### 6.2.1 List All Categories

**Endpoint:**
```http
GET /api/v1/categories
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `include_count` | boolean | No | `true` | Include job counts |
| `only_active` | boolean | No | `true` | Only categories with jobs |

**Request Example:**
```bash
curl -X GET "https://batumi.work/api/v1/categories" \
  -H "Accept: application/json"
```

**Response:**
```json
[
    {
        "id": 1,
        "slug": "administration",
        "name_ge": "ადმინისტრაცია / მენეჯმენტი",
        "name_en": "Administration / Management",
        "jobsge_cid": 1,
        "icon": "briefcase",
        "color": "#4A90D9",
        "job_count": 45,
        "order": 1
    },
    {
        "id": 2,
        "slug": "banking-finance",
        "name_ge": "ბანკი / ფინანსები / დაზღვევა",
        "name_en": "Banking / Finance / Insurance",
        "jobsge_cid": 2,
        "icon": "dollar-sign",
        "color": "#28A745",
        "job_count": 32,
        "order": 2
    },
    {
        "id": 6,
        "slug": "it-programming",
        "name_ge": "IT / პროგრამირება",
        "name_en": "IT / Programming",
        "jobsge_cid": 6,
        "icon": "code",
        "color": "#4ECDC4",
        "job_count": 128,
        "order": 6
    }
]
```

---

#### 6.2.2 Get Category by Slug

**Endpoint:**
```http
GET /api/v1/categories/{slug}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Category slug |

**Response:**
```json
{
    "id": 6,
    "slug": "it-programming",
    "name_ge": "IT / პროგრამირება",
    "name_en": "IT / Programming",
    "description_ge": "პროგრამული უზრუნველყოფა, IT ინფრასტრუქტურა, ვებ დეველოპმენტი",
    "description_en": "Software development, IT infrastructure, web development",
    "jobsge_cid": 6,
    "icon": "code",
    "color": "#4ECDC4",
    "job_count": 128,
    "subcategories": [
        {
            "id": 61,
            "slug": "web-development",
            "name_ge": "ვებ დეველოპმენტი",
            "name_en": "Web Development",
            "job_count": 45
        },
        {
            "id": 62,
            "slug": "mobile-development",
            "name_ge": "მობილური აპლიკაციები",
            "name_en": "Mobile Development",
            "job_count": 23
        }
    ]
}
```

---

### 6.3 Regions Endpoints

---

#### 6.3.1 List All Regions

**Endpoint:**
```http
GET /api/v1/regions
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `include_count` | boolean | No | `true` | Include job counts |
| `only_active` | boolean | No | `true` | Only regions with jobs |

**Request Example:**
```bash
curl -X GET "https://batumi.work/api/v1/regions" \
  -H "Accept: application/json"
```

**Response:**
```json
[
    {
        "id": 1,
        "slug": "tbilisi",
        "name_ge": "თბილისი",
        "name_en": "Tbilisi",
        "jobsge_lid": 1,
        "country": "Georgia",
        "job_count": 856,
        "is_capital": true,
        "order": 1
    },
    {
        "id": 14,
        "slug": "adjara",
        "name_ge": "აჭარა",
        "name_en": "Adjara",
        "jobsge_lid": 14,
        "country": "Georgia",
        "job_count": 234,
        "is_capital": false,
        "order": 2,
        "cities": [
            {
                "name_ge": "ბათუმი",
                "name_en": "Batumi"
            },
            {
                "name_ge": "ქობულეთი",
                "name_en": "Kobuleti"
            }
        ]
    },
    {
        "id": 17,
        "slug": "remote",
        "name_ge": "დისტანციური",
        "name_en": "Remote",
        "jobsge_lid": 17,
        "country": null,
        "job_count": 112,
        "is_remote": true,
        "order": 99
    }
]
```

---

#### 6.3.2 Get Region by Slug

**Endpoint:**
```http
GET /api/v1/regions/{slug}
```

**Response:**
```json
{
    "id": 14,
    "slug": "adjara",
    "name_ge": "აჭარა",
    "name_en": "Adjara",
    "description_ge": "აჭარის ავტონომიური რესპუბლიკა, საქართველოს დასავლეთი რეგიონი",
    "description_en": "Adjara Autonomous Republic, western region of Georgia",
    "jobsge_lid": 14,
    "country": "Georgia",
    "job_count": 234,
    "coordinates": {
        "lat": 41.6168,
        "lng": 41.6367
    }
}
```

---

### 6.4 Statistics Endpoints

---

#### 6.4.1 Get Public Statistics

**Endpoint:**
```http
GET /api/v1/stats
```

**Response:**
```json
{
    "total_jobs": 5432,
    "active_jobs": 1234,
    "jobs_added_today": 45,
    "jobs_added_this_week": 234,
    "jobs_by_category": {
        "it-programming": 128,
        "administration": 95,
        "sales-marketing": 87,
        "tourism-hospitality": 76
    },
    "jobs_by_region": {
        "adjara": 234,
        "tbilisi": 856,
        "remote": 112
    },
    "jobs_with_salary": 456,
    "jobs_with_salary_percent": 37.0,
    "average_salary": {
        "min": 1200,
        "max": 2800,
        "currency": "GEL"
    },
    "vip_jobs": 23,
    "remote_jobs": 112,
    "top_companies": [
        {
            "name": "TechCorp LLC",
            "job_count": 12
        },
        {
            "name": "Bank of Georgia",
            "job_count": 8
        }
    ],
    "last_updated": "2026-01-23T15:30:00Z"
}
```

---

### 6.5 Health Endpoints

---

#### 6.5.1 Health Check

**Endpoint:**
```http
GET /api/v1/health
```

**Response:**
```json
{
    "status": "healthy",
    "version": "1.2.3",
    "timestamp": "2026-01-23T15:30:00Z",
    "uptime_seconds": 86400,
    "checks": {
        "database": {
            "status": "healthy",
            "latency_ms": 5
        },
        "cache": {
            "status": "healthy",
            "latency_ms": 1
        }
    }
}
```

---

#### 6.5.2 Readiness Check

**Endpoint:**
```http
GET /api/v1/ready
```

**Response (200 OK):**
```json
{
    "ready": true
}
```

**Response (503 Service Unavailable):**
```json
{
    "ready": false,
    "reason": "Database connection failed"
}
```

---

## 7. Data Models

### 7.1 TypeScript Interfaces

```typescript
// ═══════════════════════════════════════════════════════════════
// JOB MODELS
// ═══════════════════════════════════════════════════════════════

/**
 * Job listing in list view (compact)
 */
export interface Job {
    /** Unique identifier */
    id: number;

    /** Job title in Georgian */
    title_ge: string;

    /** Job title in English */
    title_en: string;

    /** Company name */
    company_name: string;

    /** Location text (city/region name) */
    location: string;

    /** Category URL slug */
    category_slug: string;

    /** Category name in Georgian */
    category_name_ge: string;

    /** Category name in English */
    category_name_en: string;

    /** Region URL slug */
    region_slug: string;

    /** Region name in Georgian */
    region_name_ge: string;

    /** Region name in English */
    region_name_en: string;

    /** Minimum salary (null if not specified) */
    salary_min: number | null;

    /** Maximum salary (null if not specified) */
    salary_max: number | null;

    /** Salary currency (GEL, USD, EUR) */
    salary_currency: 'GEL' | 'USD' | 'EUR' | null;

    /** Whether job has salary information */
    has_salary: boolean;

    /** VIP/featured job status */
    is_vip: boolean;

    /** Remote work available */
    is_remote: boolean;

    /** Publication date (ISO 8601) */
    published_at: string;

    /** Application deadline (ISO 8601, null if no deadline) */
    deadline: string | null;

    /** Source site name (e.g., "jobs.ge") */
    source_name: string;

    /** URL to original job posting */
    source_url: string;

    /** External ID from source */
    external_id: string;

    /** Record creation timestamp */
    created_at: string;

    /** Record update timestamp */
    updated_at: string;
}

/**
 * Full job details (for detail page)
 */
export interface JobDetail extends Job {
    /** Full description in Georgian (HTML) */
    body_ge: string;

    /** Full description in English (HTML) */
    body_en: string;

    /** Category ID */
    category_id: number;

    /** Region ID */
    region_id: number;

    /** Salary period */
    salary_period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null;

    /** Employment type */
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | null;

    /** Experience level required */
    experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | null;

    /** View count */
    views_count: number;

    /** Share count */
    shares_count: number;

    /** Save/bookmark count */
    saves_count: number;

    /** Company logo URL */
    company_logo_url: string | null;

    /** Contact email (if provided) */
    contact_email: string | null;

    /** Contact phone (if provided) */
    contact_phone: string | null;

    /** Apply URL (may differ from source_url) */
    apply_url: string;

    /** Related job suggestions */
    related_jobs: JobRelated[];
}

/**
 * Related job (minimal data)
 */
export interface JobRelated {
    id: number;
    title_ge: string;
    title_en: string;
    company_name: string;
}

// ═══════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    /** Array of items */
    items: T[];

    /** Total number of items matching query */
    total: number;

    /** Current page number (1-indexed) */
    page: number;

    /** Items per page */
    page_size: number;

    /** Total number of pages */
    pages: number;

    /** Applied filters (for debugging) */
    filters_applied?: Record<string, any>;
}

/**
 * Job list response
 */
export type JobListResponse = PaginatedResponse<Job>;

// ═══════════════════════════════════════════════════════════════
// CATEGORY & REGION
// ═══════════════════════════════════════════════════════════════

/**
 * Job category
 */
export interface Category {
    /** Unique identifier */
    id: number;

    /** URL-safe slug */
    slug: string;

    /** Georgian name */
    name_ge: string;

    /** English name */
    name_en: string;

    /** jobs.ge category ID */
    jobsge_cid: number;

    /** Icon name (Lucide icon) */
    icon: string;

    /** Theme color (hex) */
    color: string;

    /** Active job count */
    job_count?: number;

    /** Display order */
    order: number;
}

/**
 * Category with full details
 */
export interface CategoryDetail extends Category {
    /** Georgian description */
    description_ge: string;

    /** English description */
    description_en: string;

    /** Subcategories */
    subcategories: CategorySubcategory[];
}

/**
 * Subcategory
 */
export interface CategorySubcategory {
    id: number;
    slug: string;
    name_ge: string;
    name_en: string;
    job_count: number;
}

/**
 * Region/location
 */
export interface Region {
    /** Unique identifier */
    id: number;

    /** URL-safe slug */
    slug: string;

    /** Georgian name */
    name_ge: string;

    /** English name */
    name_en: string;

    /** jobs.ge location ID */
    jobsge_lid: number;

    /** Country name */
    country: string | null;

    /** Active job count */
    job_count?: number;

    /** Is capital city */
    is_capital?: boolean;

    /** Is remote option */
    is_remote?: boolean;

    /** Display order */
    order: number;
}

// ═══════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════

/**
 * Job list filters
 */
export interface JobFilters {
    /** Full-text search query */
    q?: string;

    /** Category slug */
    category?: string;

    /** Category ID (jobs.ge) */
    cid?: number;

    /** Region slug */
    region?: string;

    /** Location ID (jobs.ge) */
    lid?: number;

    /** Has salary information */
    has_salary?: boolean;

    /** VIP jobs only */
    is_vip?: boolean;

    /** Remote jobs only */
    is_remote?: boolean;

    /** Published after date */
    published_after?: string;

    /** Published before date */
    published_before?: string;

    /** Page number */
    page?: number;

    /** Page size */
    page_size?: number;

    /** Sort field */
    sort?: string;
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

/**
 * Analytics event types
 */
export type AnalyticsEventType =
    | 'page_view'
    | 'job_view'
    | 'job_click'
    | 'search'
    | 'filter_change'
    | 'share'
    | 'save'
    | 'unsave'
    | 'apply_click'
    | 'pagination'
    | 'theme_change'
    | 'language_change';

/**
 * Analytics event payload
 */
export interface AnalyticsEvent {
    /** Event type */
    event: AnalyticsEventType;

    /** Client-generated session ID */
    session_id: string;

    /** Event timestamp (ISO 8601) */
    timestamp: string;

    /** Current language */
    language: 'ge' | 'en';

    /** Current URL path */
    url: string;

    /** Document referrer */
    referrer?: string;

    /** User agent string */
    user_agent?: string;

    /** Event-specific data */
    data?: AnalyticsEventData;
}

/**
 * Event-specific data union
 */
export type AnalyticsEventData =
    | PageViewData
    | JobViewData
    | JobClickData
    | SearchData
    | FilterChangeData
    | ShareData
    | SaveData
    | ApplyClickData
    | PaginationData
    | ThemeChangeData
    | LanguageChangeData;

export interface PageViewData {
    title: string;
}

export interface JobViewData {
    job_id: number;
    category?: string;
    is_vip?: boolean;
}

export interface JobClickData {
    job_id: number;
    position: number;
    page: number;
}

export interface SearchData {
    query: string;
    category?: string;
    region?: string;
    has_salary?: boolean;
    results_count: number;
}

export interface FilterChangeData {
    filter_name: string;
    filter_value: string | boolean | number;
    previous_value?: string | boolean | number;
}

export interface ShareData {
    job_id: number;
    platform: 'facebook' | 'telegram' | 'whatsapp' | 'linkedin' | 'copy' | 'native';
    success: boolean;
}

export interface SaveData {
    job_id: number;
    action: 'save' | 'unsave';
    saved_count: number;
}

export interface ApplyClickData {
    job_id: number;
    apply_url: string;
}

export interface PaginationData {
    from_page: number;
    to_page: number;
    total_pages: number;
}

export interface ThemeChangeData {
    from_theme: 'light' | 'dark' | 'system';
    to_theme: 'light' | 'dark' | 'system';
}

export interface LanguageChangeData {
    from_language: 'ge' | 'en';
    to_language: 'ge' | 'en';
}

// ═══════════════════════════════════════════════════════════════
// ERROR
// ═══════════════════════════════════════════════════════════════

/**
 * API error response
 */
export interface ApiError {
    /** HTTP status code */
    status: number;

    /** Error code (machine-readable) */
    code: string;

    /** Error message (human-readable) */
    message: string;

    /** Detailed error description */
    detail?: string;

    /** Field-specific errors (validation) */
    errors?: FieldError[];

    /** Request ID for support */
    request_id: string;

    /** Timestamp */
    timestamp: string;
}

/**
 * Field validation error
 */
export interface FieldError {
    /** Field name */
    field: string;

    /** Error message */
    message: string;

    /** Error code */
    code: string;
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

/**
 * Public statistics
 */
export interface Stats {
    total_jobs: number;
    active_jobs: number;
    jobs_added_today: number;
    jobs_added_this_week: number;
    jobs_by_category: Record<string, number>;
    jobs_by_region: Record<string, number>;
    jobs_with_salary: number;
    jobs_with_salary_percent: number;
    average_salary: {
        min: number;
        max: number;
        currency: string;
    };
    vip_jobs: number;
    remote_jobs: number;
    top_companies: Array<{
        name: string;
        job_count: number;
    }>;
    last_updated: string;
}
```

### 7.2 Database Schema

```sql
-- ═══════════════════════════════════════════════════════════════
-- JOBS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE jobs (
    id              SERIAL PRIMARY KEY,
    external_id     VARCHAR(100) NOT NULL,
    source_name     VARCHAR(50) NOT NULL DEFAULT 'jobs.ge',
    source_url      TEXT NOT NULL,

    -- Bilingual content
    title_ge        VARCHAR(500) NOT NULL,
    title_en        VARCHAR(500),
    body_ge         TEXT,
    body_en         TEXT,

    -- Company info
    company_name    VARCHAR(300),
    company_logo_url TEXT,

    -- Location
    location        VARCHAR(200),
    region_id       INTEGER REFERENCES regions(id),

    -- Category
    category_id     INTEGER REFERENCES categories(id),

    -- Salary
    salary_min      INTEGER,
    salary_max      INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'GEL',
    salary_period   VARCHAR(20),
    has_salary      BOOLEAN DEFAULT FALSE,

    -- Flags
    is_vip          BOOLEAN DEFAULT FALSE,
    is_remote       BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,

    -- Employment
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),

    -- Dates
    published_at    TIMESTAMP WITH TIME ZONE,
    deadline        TIMESTAMP WITH TIME ZONE,
    expires_at      TIMESTAMP WITH TIME ZONE,

    -- Contact
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(50),
    apply_url       TEXT,

    -- Metrics
    views_count     INTEGER DEFAULT 0,
    shares_count    INTEGER DEFAULT 0,
    saves_count     INTEGER DEFAULT 0,

    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(external_id, source_name)
);

-- Indexes
CREATE INDEX idx_jobs_published_at ON jobs(published_at DESC);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_region_id ON jobs(region_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_is_vip ON jobs(is_vip) WHERE is_vip = TRUE;
CREATE INDEX idx_jobs_has_salary ON jobs(has_salary) WHERE has_salary = TRUE;

-- Full-text search
CREATE INDEX idx_jobs_search_ge ON jobs USING GIN(
    to_tsvector('simple', coalesce(title_ge, '') || ' ' || coalesce(body_ge, ''))
);
CREATE INDEX idx_jobs_search_en ON jobs USING GIN(
    to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(body_en, ''))
);

-- ═══════════════════════════════════════════════════════════════
-- CATEGORIES TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    name_ge         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    description_ge  TEXT,
    description_en  TEXT,
    jobsge_cid      INTEGER UNIQUE,
    icon            VARCHAR(50),
    color           VARCHAR(7),
    parent_id       INTEGER REFERENCES categories(id),
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- REGIONS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE regions (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    name_ge         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    description_ge  TEXT,
    description_en  TEXT,
    jobsge_lid      INTEGER UNIQUE,
    country         VARCHAR(100),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    is_capital      BOOLEAN DEFAULT FALSE,
    is_remote       BOOLEAN DEFAULT FALSE,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ANALYTICS EVENTS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE analytics_events (
    id              SERIAL PRIMARY KEY,
    event_type      VARCHAR(50) NOT NULL,
    session_id      VARCHAR(100),
    language        VARCHAR(2),
    url             TEXT,
    referrer        TEXT,
    user_agent      TEXT,
    ip_address      INET,
    country_code    VARCHAR(2),
    event_data      JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partition by month for analytics
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
```

---

## 8. Error Handling

### 8.1 Error Response Format

All errors follow a consistent structure:

```json
{
    "status": 404,
    "code": "JOB_NOT_FOUND",
    "message": "Job not found",
    "detail": "Job with id 99999 does not exist or has been removed",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-23T15:30:00Z"
}
```

### 8.2 Error Codes Reference

| Code | Status | Message | Description |
|------|--------|---------|-------------|
| **General** |
| `INTERNAL_ERROR` | 500 | Internal server error | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | Maintenance or overload |
| `REQUEST_TIMEOUT` | 408 | Request timeout | Request took too long |
| **Validation** |
| `VALIDATION_ERROR` | 422 | Validation failed | Request body/params invalid |
| `INVALID_PARAM` | 400 | Invalid parameter | Query param format wrong |
| `MISSING_PARAM` | 400 | Missing required parameter | Required param not provided |
| `INVALID_JSON` | 400 | Invalid JSON body | Malformed request body |
| **Resources** |
| `JOB_NOT_FOUND` | 404 | Job not found | Job ID doesn't exist |
| `JOB_EXPIRED` | 410 | Job has expired | Job posting is no longer active |
| `CATEGORY_NOT_FOUND` | 404 | Category not found | Category slug invalid |
| `REGION_NOT_FOUND` | 404 | Region not found | Region slug invalid |
| **Rate Limiting** |
| `RATE_LIMITED` | 429 | Too many requests | Rate limit exceeded |

### 8.3 Validation Error Format

```json
{
    "status": 422,
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": [
        {
            "field": "page",
            "message": "Page must be a positive integer",
            "code": "invalid_type"
        },
        {
            "field": "page_size",
            "message": "Page size must be between 1 and 100",
            "code": "out_of_range"
        }
    ],
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-23T15:30:00Z"
}
```

### 8.4 Client-Side Error Handling

```typescript
// api/errors.ts

export class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string,
        public detail?: string,
        public errors?: FieldError[],
        public requestId?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static fromResponse(response: any): ApiError {
        return new ApiError(
            response.status,
            response.code,
            response.message,
            response.detail,
            response.errors,
            response.request_id
        );
    }

    isNotFound(): boolean {
        return this.status === 404;
    }

    isValidationError(): boolean {
        return this.status === 422;
    }

    isRateLimited(): boolean {
        return this.status === 429;
    }

    isServerError(): boolean {
        return this.status >= 500;
    }
}

// Usage in API client
async function fetchApi<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
    }

    return response.json();
}
```

---

## 9. Pagination

### 9.1 Pagination Parameters

| Parameter | Type | Default | Min | Max | Description |
|-----------|------|---------|-----|-----|-------------|
| `page` | integer | 1 | 1 | - | Page number (1-indexed) |
| `page_size` | integer | 30 | 1 | 100 | Items per page |

### 9.2 Pagination Response

```json
{
    "items": [...],
    "total": 1234,
    "page": 1,
    "page_size": 30,
    "pages": 42
}
```

### 9.3 Pagination Logic

```typescript
// Calculate pagination
const total = 1234;
const page = 1;
const page_size = 30;
const pages = Math.ceil(total / page_size); // 42

// SQL query
const offset = (page - 1) * page_size; // 0
const limit = page_size; // 30

// SELECT * FROM jobs LIMIT 30 OFFSET 0;
```

### 9.4 Pagination UI Helper

```typescript
interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startItem: number;
    endItem: number;
    totalItems: number;
}

function getPaginationInfo(response: PaginatedResponse<any>): PaginationInfo {
    const { page, pages, page_size, total } = response;
    return {
        currentPage: page,
        totalPages: pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
        startItem: (page - 1) * page_size + 1,
        endItem: Math.min(page * page_size, total),
        totalItems: total,
    };
}

// Generate page numbers for UI
function getPageNumbers(current: number, total: number, maxVisible = 5): (number | '...')[] {
    if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(total, current + half);

    if (current <= half) {
        end = maxVisible;
    }
    if (current > total - half) {
        start = total - maxVisible + 1;
    }

    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < total) {
        if (end < total - 1) pages.push('...');
        pages.push(total);
    }

    return pages;
}
```

---

## 10. Filtering & Sorting

### 10.1 Filter Parameters

| Filter | Type | Example | Description |
|--------|------|---------|-------------|
| `q` | string | `q=developer` | Full-text search |
| `category` | string | `category=it-programming` | Category slug |
| `cid` | integer | `cid=6` | Category ID (jobs.ge) |
| `region` | string | `region=adjara` | Region slug |
| `lid` | integer | `lid=14` | Location ID (jobs.ge) |
| `has_salary` | boolean | `has_salary=true` | Has salary info |
| `is_vip` | boolean | `is_vip=true` | VIP jobs only |
| `is_remote` | boolean | `is_remote=true` | Remote jobs only |
| `published_after` | date | `published_after=2026-01-01` | Published after |
| `published_before` | date | `published_before=2026-01-31` | Published before |
| `deadline_after` | date | `deadline_after=2026-02-01` | Deadline after |

### 10.2 Sort Parameter

| Value | Description |
|-------|-------------|
| `-published_at` | Newest first (default) |
| `published_at` | Oldest first |
| `-deadline` | Latest deadline first |
| `deadline` | Earliest deadline first |
| `title_ge` | Alphabetical Georgian |
| `title_en` | Alphabetical English |
| `-salary_min` | Highest salary first |
| `salary_min` | Lowest salary first |

### 10.3 Filter Combination Example

```
GET /api/v1/jobs?
    q=developer&
    category=it-programming&
    lid=14&
    has_salary=true&
    is_remote=false&
    published_after=2026-01-01&
    sort=-published_at&
    page=1&
    page_size=30
```

### 10.4 Building Query String

```typescript
function buildJobsQuery(filters: JobFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });

    return params.toString();
}

// Usage
const query = buildJobsQuery({
    q: 'developer',
    category: 'it-programming',
    lid: 14,
    has_salary: true,
    page: 1,
    page_size: 30,
});
// "q=developer&category=it-programming&lid=14&has_salary=true&page=1&page_size=30"
```

---

## 11. Rate Limiting

### 11.1 Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `GET /jobs` | 100 | 1 minute | IP |
| `GET /jobs/{id}` | 200 | 1 minute | IP |
| `GET /categories` | 60 | 1 minute | IP |
| `GET /regions` | 60 | 1 minute | IP |
| `POST /analytics/track` | 300 | 1 minute | IP |
| `GET /stats` | 30 | 1 minute | IP |

### 11.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706025600
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |

### 11.3 Rate Limit Error

```json
{
    "status": 429,
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "detail": "Rate limit exceeded. Please wait 45 seconds before retrying.",
    "retry_after": 45,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-23T15:30:00Z"
}
```

### 11.4 Client-Side Rate Limit Handling

```typescript
async function fetchWithRetry<T>(
    url: string,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url);

            if (response.status === 429) {
                const retryAfter = parseInt(
                    response.headers.get('Retry-After') || '60'
                );
                await sleep(retryAfter * 1000);
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            await sleep(baseDelay * Math.pow(2, attempt));
        }
    }
    throw new Error('Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 12. Caching

### 12.1 Cache Headers

```http
# Cacheable response
Cache-Control: public, max-age=300
ETag: "abc123def456"
Last-Modified: Wed, 23 Jan 2026 15:30:00 GMT

# Non-cacheable response
Cache-Control: no-store, no-cache, must-revalidate
```

### 12.2 Cache Duration by Endpoint

| Endpoint | Cache-Control | staleTime (React Query) |
|----------|--------------|-------------------------|
| `GET /categories` | `max-age=3600` | 1 hour |
| `GET /regions` | `max-age=3600` | 1 hour |
| `GET /jobs` | `max-age=300` | 5 minutes |
| `GET /jobs/{id}` | `max-age=300` | 5 minutes |
| `GET /stats` | `max-age=600` | 10 minutes |
| `POST /analytics/*` | `no-store` | No cache |

### 12.3 Conditional Requests

**ETag-based:**
```http
# First request
GET /api/v1/jobs
Response: ETag: "abc123"

# Subsequent request
GET /api/v1/jobs
If-None-Match: "abc123"
Response: 304 Not Modified (if unchanged)
```

**Last-Modified-based:**
```http
# First request
GET /api/v1/jobs
Response: Last-Modified: Wed, 23 Jan 2026 15:30:00 GMT

# Subsequent request
GET /api/v1/jobs
If-Modified-Since: Wed, 23 Jan 2026 15:30:00 GMT
Response: 304 Not Modified (if unchanged)
```

### 12.4 TanStack Query Configuration

```typescript
// queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Global defaults
            staleTime: 5 * 60 * 1000,      // 5 minutes
            gcTime: 30 * 60 * 1000,         // 30 minutes (formerly cacheTime)
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnMount: true,
        },
    },
});

// Query-specific configurations
export const queryConfigs = {
    categories: {
        queryKey: ['categories'],
        staleTime: 60 * 60 * 1000,         // 1 hour
        gcTime: 24 * 60 * 60 * 1000,        // 24 hours
    },
    regions: {
        queryKey: ['regions'],
        staleTime: 60 * 60 * 1000,         // 1 hour
        gcTime: 24 * 60 * 60 * 1000,        // 24 hours
    },
    jobs: (filters: JobFilters) => ({
        queryKey: ['jobs', filters],
        staleTime: 5 * 60 * 1000,          // 5 minutes
        gcTime: 30 * 60 * 1000,             // 30 minutes
    }),
    jobDetail: (id: number) => ({
        queryKey: ['job', id],
        staleTime: 5 * 60 * 1000,          // 5 minutes
        gcTime: 60 * 60 * 1000,             // 1 hour
    }),
    stats: {
        queryKey: ['stats'],
        staleTime: 10 * 60 * 1000,         // 10 minutes
        gcTime: 60 * 60 * 1000,             // 1 hour
    },
};
```

---

## 13. Localization

### 13.1 Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `ge` | Georgian | ქართული |
| `en` | English | English |

### 13.2 Bilingual Fields

All content fields have language-specific versions:

| Field | Georgian | English |
|-------|----------|---------|
| Title | `title_ge` | `title_en` |
| Body | `body_ge` | `body_en` |
| Category | `name_ge` | `name_en` |
| Region | `name_ge` | `name_en` |

### 13.3 Language Resolution

```typescript
// Get localized text
function getLocalizedText<T extends { [key: string]: string }>(
    item: T,
    field: string,
    language: 'ge' | 'en'
): string {
    const langField = `${field}_${language}`;
    const fallbackField = `${field}_ge`;

    return (item as any)[langField] || (item as any)[fallbackField] || '';
}

// Usage
const title = getLocalizedText(job, 'title', 'en');
// Returns title_en if exists, otherwise title_ge
```

### 13.4 Localized Error Messages

**Request:**
```http
GET /api/v1/jobs/99999
Accept-Language: ge
```

**Response:**
```json
{
    "status": 404,
    "code": "JOB_NOT_FOUND",
    "message": "ვაკანსია ვერ მოიძებნა",
    "detail": "ვაკანსია ID 99999 არ არსებობს"
}
```

**Request:**
```http
GET /api/v1/jobs/99999
Accept-Language: en
```

**Response:**
```json
{
    "status": 404,
    "code": "JOB_NOT_FOUND",
    "message": "Job not found",
    "detail": "Job with id 99999 does not exist"
}
```

---

## 14. Analytics API

### 14.1 Track Event Endpoint

**Endpoint:**
```http
POST /api/v1/analytics/track
```

**Request Body:**
```json
{
    "event": "job_view",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-23T15:30:00Z",
    "language": "ge",
    "url": "/ge/job/12345",
    "referrer": "https://google.com",
    "data": {
        "job_id": 12345,
        "category": "it-programming",
        "is_vip": false
    }
}
```

**Response:**
```json
{
    "status": "ok",
    "event_id": "evt_abc123"
}
```

### 14.2 Event Types

| Event | Required Data | Description |
|-------|---------------|-------------|
| `page_view` | `title` | Page was viewed |
| `job_view` | `job_id` | Job detail page viewed |
| `job_click` | `job_id`, `position`, `page` | Job clicked in list |
| `search` | `query`, `results_count` | Search performed |
| `filter_change` | `filter_name`, `filter_value` | Filter changed |
| `share` | `job_id`, `platform`, `success` | Job shared |
| `save` | `job_id`, `action` | Job saved/unsaved |
| `apply_click` | `job_id`, `apply_url` | Apply button clicked |
| `pagination` | `from_page`, `to_page` | Page changed |
| `theme_change` | `from_theme`, `to_theme` | Theme toggled |
| `language_change` | `from_language`, `to_language` | Language switched |

### 14.3 Batch Events

**Endpoint:**
```http
POST /api/v1/analytics/batch
```

**Request:**
```json
{
    "events": [
        {
            "event": "page_view",
            "session_id": "abc123",
            "timestamp": "2026-01-23T15:30:00Z",
            "data": { "title": "Jobs List" }
        },
        {
            "event": "job_click",
            "session_id": "abc123",
            "timestamp": "2026-01-23T15:30:05Z",
            "data": { "job_id": 12345, "position": 3, "page": 1 }
        }
    ]
}
```

### 14.4 Analytics Client Implementation

```typescript
// analytics/client.ts

class AnalyticsClient {
    private sessionId: string;
    private language: 'ge' | 'en';
    private queue: AnalyticsEvent[] = [];
    private flushInterval: number = 5000;
    private maxQueueSize: number = 10;

    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.language = this.detectLanguage();
        this.startFlushInterval();
    }

    private getOrCreateSessionId(): string {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    private detectLanguage(): 'ge' | 'en' {
        return window.location.pathname.startsWith('/en') ? 'en' : 'ge';
    }

    track(event: AnalyticsEventType, data?: Record<string, any>): void {
        const analyticsEvent: AnalyticsEvent = {
            event,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            language: this.language,
            url: window.location.pathname + window.location.search,
            referrer: document.referrer || undefined,
            data,
        };

        this.queue.push(analyticsEvent);

        if (this.queue.length >= this.maxQueueSize) {
            this.flush();
        }
    }

    private async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        const events = [...this.queue];
        this.queue = [];

        try {
            // Use sendBeacon for reliability
            const success = navigator.sendBeacon(
                '/api/v1/analytics/batch',
                JSON.stringify({ events })
            );

            if (!success) {
                // Fallback to fetch
                await fetch('/api/v1/analytics/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events }),
                    keepalive: true,
                });
            }
        } catch (error) {
            // Re-queue events on failure
            this.queue = [...events, ...this.queue];
            console.error('Analytics flush failed:', error);
        }
    }

    private startFlushInterval(): void {
        setInterval(() => this.flush(), this.flushInterval);

        // Flush on page unload
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flush();
            }
        });
    }
}

export const analytics = new AnalyticsClient();

// Usage
analytics.track('page_view', { title: document.title });
analytics.track('job_view', { job_id: 12345 });
analytics.track('share', { job_id: 12345, platform: 'facebook', success: true });
```

---

## 15. WebSocket Events

### 15.1 Connection

```typescript
// WebSocket is optional - for real-time job updates
const ws = new WebSocket('wss://batumi.work/api/v1/ws');

ws.onopen = () => {
    console.log('WebSocket connected');
    // Subscribe to updates
    ws.send(JSON.stringify({
        type: 'subscribe',
        channels: ['new_jobs', 'job_updates']
    }));
};
```

### 15.2 Event Types

| Event | Payload | Description |
|-------|---------|-------------|
| `new_job` | Job object | New job posted |
| `job_updated` | Job object | Job was updated |
| `job_expired` | `{ id: number }` | Job expired |
| `stats_updated` | Stats object | Statistics changed |

### 15.3 Message Format

```json
{
    "type": "new_job",
    "timestamp": "2026-01-23T15:30:00Z",
    "data": {
        "id": 12345,
        "title_ge": "პროგრამისტი",
        "title_en": "Developer",
        "company_name": "TechCorp"
    }
}
```

---

## 16. API Client SDK

### 16.1 Complete API Client

```typescript
// api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT
// ═══════════════════════════════════════════════════════════════

interface RequestOptions extends RequestInit {
    params?: Record<string, any>;
    timeout?: number;
}

async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { params, timeout = 30000, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...fetchOptions.headers,
            },
        });

        clearTimeout(timeoutId);

        // Handle errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw ApiError.fromResponse({
                status: response.status,
                ...errorData,
            });
        }

        // Handle empty responses
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new ApiError(408, 'TIMEOUT', 'Request timeout');
        }

        throw new ApiError(0, 'NETWORK_ERROR', 'Network error');
    }
}

// ═══════════════════════════════════════════════════════════════
// API METHODS
// ═══════════════════════════════════════════════════════════════

export const api = {
    // ─────────────────────────────────────────────────────────────
    // Jobs
    // ─────────────────────────────────────────────────────────────
    jobs: {
        /**
         * Get paginated list of jobs
         */
        list(filters: JobFilters = {}): Promise<JobListResponse> {
            return request<JobListResponse>('/jobs', { params: filters });
        },

        /**
         * Get single job by ID
         */
        get(id: number, incrementViews = true): Promise<JobDetail> {
            return request<JobDetail>(`/jobs/${id}`, {
                params: { increment_views: incrementViews },
            });
        },

        /**
         * Search jobs with highlighting
         */
        search(query: string, options: Partial<JobFilters> = {}): Promise<JobListResponse> {
            return request<JobListResponse>('/jobs/search', {
                params: { q: query, ...options },
            });
        },
    },

    // ─────────────────────────────────────────────────────────────
    // Categories
    // ─────────────────────────────────────────────────────────────
    categories: {
        /**
         * Get all categories
         */
        list(includeCount = true): Promise<Category[]> {
            return request<Category[]>('/categories', {
                params: { include_count: includeCount },
            });
        },

        /**
         * Get category by slug
         */
        get(slug: string): Promise<CategoryDetail> {
            return request<CategoryDetail>(`/categories/${slug}`);
        },
    },

    // ─────────────────────────────────────────────────────────────
    // Regions
    // ─────────────────────────────────────────────────────────────
    regions: {
        /**
         * Get all regions
         */
        list(includeCount = true): Promise<Region[]> {
            return request<Region[]>('/regions', {
                params: { include_count: includeCount },
            });
        },

        /**
         * Get region by slug
         */
        get(slug: string): Promise<Region> {
            return request<Region>(`/regions/${slug}`);
        },
    },

    // ─────────────────────────────────────────────────────────────
    // Statistics
    // ─────────────────────────────────────────────────────────────
    stats: {
        /**
         * Get public statistics
         */
        get(): Promise<Stats> {
            return request<Stats>('/stats');
        },
    },

    // ─────────────────────────────────────────────────────────────
    // Analytics
    // ─────────────────────────────────────────────────────────────
    analytics: {
        /**
         * Track single event
         */
        track(event: AnalyticsEvent): boolean {
            return navigator.sendBeacon(
                `${API_BASE_URL}/analytics/track`,
                JSON.stringify(event)
            );
        },

        /**
         * Track batch of events
         */
        trackBatch(events: AnalyticsEvent[]): boolean {
            return navigator.sendBeacon(
                `${API_BASE_URL}/analytics/batch`,
                JSON.stringify({ events })
            );
        },
    },

    // ─────────────────────────────────────────────────────────────
    // Health
    // ─────────────────────────────────────────────────────────────
    health: {
        /**
         * Check API health
         */
        check(): Promise<{ status: string; version: string }> {
            return request('/health');
        },

        /**
         * Check if API is ready
         */
        ready(): Promise<{ ready: boolean }> {
            return request('/ready');
        },
    },
};

// ═══════════════════════════════════════════════════════════════
// REACT QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

export const queryKeys = {
    jobs: {
        all: ['jobs'] as const,
        list: (filters: JobFilters) => ['jobs', 'list', filters] as const,
        detail: (id: number) => ['jobs', 'detail', id] as const,
        search: (query: string) => ['jobs', 'search', query] as const,
    },
    categories: {
        all: ['categories'] as const,
        list: () => ['categories', 'list'] as const,
        detail: (slug: string) => ['categories', 'detail', slug] as const,
    },
    regions: {
        all: ['regions'] as const,
        list: () => ['regions', 'list'] as const,
        detail: (slug: string) => ['regions', 'detail', slug] as const,
    },
    stats: ['stats'] as const,
};
```

### 16.2 React Query Hooks

```typescript
// hooks/useJobs.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api, queryKeys } from '../api/client';

export function useJobs(filters: JobFilters) {
    return useQuery({
        queryKey: queryKeys.jobs.list(filters),
        queryFn: () => api.jobs.list(filters),
        staleTime: 5 * 60 * 1000,
    });
}

export function useJobDetail(id: number) {
    return useQuery({
        queryKey: queryKeys.jobs.detail(id),
        queryFn: () => api.jobs.get(id),
        staleTime: 5 * 60 * 1000,
        enabled: !!id,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories.list(),
        queryFn: () => api.categories.list(),
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useRegions() {
    return useQuery({
        queryKey: queryKeys.regions.list(),
        queryFn: () => api.regions.list(),
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useStats() {
    return useQuery({
        queryKey: queryKeys.stats,
        queryFn: () => api.stats.get(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Infinite scroll for jobs
export function useInfiniteJobs(filters: Omit<JobFilters, 'page'>) {
    return useInfiniteQuery({
        queryKey: ['jobs', 'infinite', filters],
        queryFn: ({ pageParam = 1 }) =>
            api.jobs.list({ ...filters, page: pageParam }),
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
        staleTime: 5 * 60 * 1000,
    });
}
```

---

## 17. Testing

### 17.1 API Test Examples

```typescript
// __tests__/api/jobs.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { api } from '../../api/client';

const server = setupServer();

beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Jobs API', () => {
    describe('list', () => {
        it('fetches jobs with filters', async () => {
            const mockResponse = {
                items: [{ id: 1, title_ge: 'Test', title_en: 'Test' }],
                total: 1,
                page: 1,
                page_size: 30,
                pages: 1,
            };

            server.use(
                http.get('/api/v1/jobs', () => {
                    return HttpResponse.json(mockResponse);
                })
            );

            const result = await api.jobs.list({ q: 'developer' });

            expect(result.items).toHaveLength(1);
            expect(result.total).toBe(1);
        });

        it('handles 404 errors', async () => {
            server.use(
                http.get('/api/v1/jobs/99999', () => {
                    return HttpResponse.json(
                        { code: 'JOB_NOT_FOUND', message: 'Job not found' },
                        { status: 404 }
                    );
                })
            );

            await expect(api.jobs.get(99999)).rejects.toThrow('Job not found');
        });

        it('handles rate limiting', async () => {
            server.use(
                http.get('/api/v1/jobs', () => {
                    return HttpResponse.json(
                        { code: 'RATE_LIMITED', message: 'Too many requests' },
                        {
                            status: 429,
                            headers: { 'Retry-After': '60' }
                        }
                    );
                })
            );

            await expect(api.jobs.list()).rejects.toMatchObject({
                status: 429,
                code: 'RATE_LIMITED',
            });
        });
    });
});
```

### 17.2 Mock Server Setup

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
    // Jobs list
    http.get('/api/v1/jobs', ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('page_size') || '30');

        return HttpResponse.json({
            items: generateMockJobs(pageSize),
            total: 100,
            page,
            page_size: pageSize,
            pages: Math.ceil(100 / pageSize),
        });
    }),

    // Job detail
    http.get('/api/v1/jobs/:id', ({ params }) => {
        const { id } = params;

        if (id === '99999') {
            return HttpResponse.json(
                { code: 'JOB_NOT_FOUND', message: 'Job not found' },
                { status: 404 }
            );
        }

        return HttpResponse.json(generateMockJobDetail(Number(id)));
    }),

    // Categories
    http.get('/api/v1/categories', () => {
        return HttpResponse.json(mockCategories);
    }),

    // Regions
    http.get('/api/v1/regions', () => {
        return HttpResponse.json(mockRegions);
    }),

    // Analytics
    http.post('/api/v1/analytics/track', () => {
        return HttpResponse.json({ status: 'ok' });
    }),
];

// Mock data generators
function generateMockJobs(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title_ge: `ვაკანსია ${i + 1}`,
        title_en: `Job ${i + 1}`,
        company_name: `Company ${i + 1}`,
        location: 'Batumi',
        category_slug: 'it-programming',
        category_name_ge: 'IT / პროგრამირება',
        category_name_en: 'IT / Programming',
        region_slug: 'adjara',
        region_name_ge: 'აჭარა',
        region_name_en: 'Adjara',
        salary_min: 1000 + i * 100,
        salary_max: 2000 + i * 100,
        has_salary: i % 2 === 0,
        is_vip: i % 10 === 0,
        is_remote: i % 5 === 0,
        published_at: new Date().toISOString(),
        deadline: null,
        source_name: 'jobs.ge',
        source_url: `https://jobs.ge/job/${i + 1}`,
        external_id: String(i + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));
}
```

---

## 18. OpenAPI Specification

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: jobsNGUI API
  description: Job listings API for batumi.work
  version: 1.0.0
  contact:
    email: api@batumi.work
  license:
    name: MIT

servers:
  - url: https://batumi.work/api/v1
    description: Production
  - url: https://staging.batumi.work/api/v1
    description: Staging
  - url: http://localhost:8000/api/v1
    description: Development

paths:
  /jobs:
    get:
      summary: List jobs
      operationId: listJobs
      tags: [Jobs]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: page_size
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 30
        - name: q
          in: query
          schema:
            type: string
            maxLength: 200
        - name: category
          in: query
          schema:
            type: string
        - name: lid
          in: query
          schema:
            type: integer
        - name: has_salary
          in: query
          schema:
            type: boolean
        - name: sort
          in: query
          schema:
            type: string
            enum: [published_at, -published_at, deadline, -deadline]
            default: -published_at
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '429':
          $ref: '#/components/responses/RateLimited'

  /jobs/{id}:
    get:
      summary: Get job details
      operationId: getJob
      tags: [Jobs]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobDetail'
        '404':
          $ref: '#/components/responses/NotFound'

  /categories:
    get:
      summary: List categories
      operationId: listCategories
      tags: [Categories]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Category'

  /regions:
    get:
      summary: List regions
      operationId: listRegions
      tags: [Regions]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Region'

  /analytics/track:
    post:
      summary: Track analytics event
      operationId: trackEvent
      tags: [Analytics]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AnalyticsEvent'
      responses:
        '200':
          description: Event tracked
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok

components:
  schemas:
    Job:
      type: object
      required: [id, title_ge, company_name, published_at]
      properties:
        id:
          type: integer
        title_ge:
          type: string
        title_en:
          type: string
        company_name:
          type: string
        location:
          type: string
        category_slug:
          type: string
        region_slug:
          type: string
        salary_min:
          type: integer
          nullable: true
        salary_max:
          type: integer
          nullable: true
        has_salary:
          type: boolean
        is_vip:
          type: boolean
        is_remote:
          type: boolean
        published_at:
          type: string
          format: date-time
        deadline:
          type: string
          format: date-time
          nullable: true

    JobDetail:
      allOf:
        - $ref: '#/components/schemas/Job'
        - type: object
          properties:
            body_ge:
              type: string
            body_en:
              type: string
            views_count:
              type: integer

    JobListResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Job'
        total:
          type: integer
        page:
          type: integer
        page_size:
          type: integer
        pages:
          type: integer

    Category:
      type: object
      properties:
        id:
          type: integer
        slug:
          type: string
        name_ge:
          type: string
        name_en:
          type: string
        jobsge_cid:
          type: integer
        job_count:
          type: integer

    Region:
      type: object
      properties:
        id:
          type: integer
        slug:
          type: string
        name_ge:
          type: string
        name_en:
          type: string
        jobsge_lid:
          type: integer
        job_count:
          type: integer

    AnalyticsEvent:
      type: object
      required: [event, session_id, timestamp]
      properties:
        event:
          type: string
        session_id:
          type: string
        timestamp:
          type: string
          format: date-time
        language:
          type: string
          enum: [ge, en]
        data:
          type: object

    ApiError:
      type: object
      properties:
        status:
          type: integer
        code:
          type: string
        message:
          type: string
        detail:
          type: string
        request_id:
          type: string

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
    RateLimited:
      description: Rate limit exceeded
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
        X-RateLimit-Remaining:
          schema:
            type: integer
        X-RateLimit-Reset:
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
```

---

## 19. Changelog

### Version 1.0.0 (January 23, 2026)

**Initial Release**

- Jobs list endpoint with filtering and pagination
- Job detail endpoint
- Categories endpoint
- Regions endpoint
- Analytics tracking endpoint
- Health check endpoints
- Rate limiting
- Caching headers
- Error handling
- Bilingual support (Georgian/English)

---

*API Documentation maintained by Architecture Team*
*Last updated: January 23, 2026*
