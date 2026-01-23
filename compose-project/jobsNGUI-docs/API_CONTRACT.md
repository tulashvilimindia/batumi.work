# API Contract
# jobsNGUI - Backend API Integration

**Version:** 1.0
**Date:** January 23, 2026
**Base URL:** `/api/v1`

---

## 1. Overview

The jobsNGUI frontend communicates with the existing FastAPI backend through a RESTful API. This document defines all endpoints, request/response formats, and integration patterns.

---

## 2. Authentication

### Public Endpoints
All endpoints used by the public frontend are **unauthenticated**. No API key required.

### CORS
- Origin: Configured to accept frontend domain
- Methods: GET, POST
- Headers: Content-Type

---

## 3. Endpoints

### 3.1 List Jobs

**GET** `/api/v1/jobs`

Retrieves a paginated list of active job postings.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `page_size` | integer | No | 30 | Items per page (max: 100) |
| `status` | string | No | "active" | Job status filter |
| `q` | string | No | - | Search query (title, content) |
| `category` | string | No | - | Category slug filter |
| `lid` | integer | No | - | Region/location ID (jobs.ge lid) |
| `cid` | integer | No | - | Category ID (jobs.ge cid) |
| `has_salary` | boolean | No | - | Filter jobs with salary |
| `sort` | string | No | "-published_at" | Sort field (prefix `-` for desc) |

#### Response

```typescript
interface JobListResponse {
  items: Job[];
  total: number;
  pages: number;
  page: number;
  page_size: number;
}

interface Job {
  id: number;
  title_ge: string;
  title_en: string;
  company_name: string;
  location: string;
  category_slug: string;
  category_name_ge: string;
  category_name_en: string;
  region_slug: string;
  region_name_ge: string;
  region_name_en: string;
  salary_min: number | null;
  salary_max: number | null;
  has_salary: boolean;
  is_vip: boolean;
  is_remote: boolean;
  published_at: string; // ISO 8601
  deadline: string | null; // ISO 8601
  source_name: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}
```

#### Example Request
```bash
GET /api/v1/jobs?q=developer&category=it-programming&page=1&page_size=30
```

#### Example Response
```json
{
  "items": [
    {
      "id": 12345,
      "title_ge": "პროგრამისტი",
      "title_en": "Software Developer",
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
      "has_salary": true,
      "is_vip": false,
      "is_remote": false,
      "published_at": "2026-01-20T10:00:00Z",
      "deadline": "2026-02-15T23:59:59Z",
      "source_name": "jobs.ge",
      "source_url": "https://jobs.ge/job/12345",
      "created_at": "2026-01-20T10:05:00Z",
      "updated_at": "2026-01-20T10:05:00Z"
    }
  ],
  "total": 1234,
  "pages": 42,
  "page": 1,
  "page_size": 30
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid query parameters |
| 500 | Internal server error |

---

### 3.2 Get Job Details

**GET** `/api/v1/jobs/{id}`

Retrieves complete details for a single job posting.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

#### Response

```typescript
interface JobDetail extends Job {
  body_ge: string;  // Full description in Georgian (HTML)
  body_en: string;  // Full description in English (HTML)
  external_id: string; // Original source ID
  views_count: number;
}
```

#### Example Request
```bash
GET /api/v1/jobs/12345
```

#### Example Response
```json
{
  "id": 12345,
  "title_ge": "პროგრამისტი",
  "title_en": "Software Developer",
  "company_name": "TechCorp LLC",
  "location": "Batumi",
  "body_ge": "<p>ვეძებთ გამოცდილ პროგრამისტს...</p>",
  "body_en": "<p>We are looking for an experienced developer...</p>",
  "category_slug": "it-programming",
  "category_name_ge": "IT / პროგრამირება",
  "category_name_en": "IT / Programming",
  "region_slug": "adjara",
  "region_name_ge": "აჭარა",
  "region_name_en": "Adjara",
  "salary_min": 2000,
  "salary_max": 3500,
  "has_salary": true,
  "is_vip": false,
  "is_remote": false,
  "published_at": "2026-01-20T10:00:00Z",
  "deadline": "2026-02-15T23:59:59Z",
  "source_name": "jobs.ge",
  "source_url": "https://jobs.ge/job/12345",
  "external_id": "12345",
  "views_count": 150,
  "created_at": "2026-01-20T10:05:00Z",
  "updated_at": "2026-01-20T10:05:00Z"
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 404 | Job not found |
| 500 | Internal server error |

---

### 3.3 List Categories

**GET** `/api/v1/categories`

Retrieves all available job categories.

#### Response

```typescript
interface Category {
  id: number;
  slug: string;
  name_ge: string;
  name_en: string;
  jobsge_cid: number; // jobs.ge category ID
  job_count?: number; // Optional: active jobs count
}

type CategoriesResponse = Category[];
```

#### Example Response
```json
[
  {
    "id": 1,
    "slug": "administration",
    "name_ge": "ადმინისტრაცია",
    "name_en": "Administration",
    "jobsge_cid": 1,
    "job_count": 45
  },
  {
    "id": 6,
    "slug": "it-programming",
    "name_ge": "IT / პროგრამირება",
    "name_en": "IT / Programming",
    "jobsge_cid": 6,
    "job_count": 128
  }
]
```

---

### 3.4 List Regions

**GET** `/api/v1/regions`

Retrieves all available regions/locations.

#### Response

```typescript
interface Region {
  id: number;
  slug: string;
  name_ge: string;
  name_en: string;
  jobsge_lid: number; // jobs.ge location ID
  job_count?: number;
}

type RegionsResponse = Region[];
```

#### Example Response
```json
[
  {
    "id": 1,
    "slug": "tbilisi",
    "name_ge": "თბილისი",
    "name_en": "Tbilisi",
    "jobsge_lid": 1,
    "job_count": 856
  },
  {
    "id": 14,
    "slug": "adjara",
    "name_ge": "აჭარა",
    "name_en": "Adjara",
    "jobsge_lid": 14,
    "job_count": 234
  },
  {
    "id": 17,
    "slug": "remote",
    "name_ge": "დისტანციური",
    "name_en": "Remote",
    "jobsge_lid": 17,
    "job_count": 112
  }
]
```

---

### 3.5 Track Analytics Event

**POST** `/api/v1/analytics/track`

Sends user interaction events for analytics.

#### Request Body

```typescript
interface AnalyticsEvent {
  event: string;           // Event type
  session_id: string;      // Client-generated session ID
  timestamp: string;       // ISO 8601 timestamp
  language: string;        // 'ge' or 'en'
  referrer?: string;       // Document referrer
  data?: Record<string, any>; // Event-specific data
}
```

#### Event Types

| Event | Data Fields |
|-------|-------------|
| `page_view` | `url`, `title` |
| `job_view` | `job_id` |
| `search` | `query`, `category`, `region`, `results_count` |
| `job_click` | `job_id`, `position` |
| `share` | `platform`, `job_id` |
| `save` | `job_id` |

#### Example Request
```bash
POST /api/v1/analytics/track
Content-Type: application/json

{
  "event": "job_view",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-01-23T15:30:00Z",
  "language": "ge",
  "referrer": "https://google.com",
  "data": {
    "job_id": 12345
  }
}
```

#### Response
```json
{
  "status": "ok"
}
```

---

### 3.6 Get Statistics (Optional)

**GET** `/api/v1/stats`

Retrieves public statistics about job postings.

#### Response

```typescript
interface Stats {
  total_jobs: number;
  active_jobs: number;
  jobs_by_category: Record<string, number>;
  jobs_by_region: Record<string, number>;
  jobs_with_salary: number;
  last_updated: string;
}
```

---

## 4. Common Data Types

### 4.1 Date/Time
All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

### 4.2 Pagination
- `page`: 1-indexed page number
- `page_size`: Items per page (default: 30, max: 100)
- `total`: Total number of items
- `pages`: Total number of pages

### 4.3 Language Fields
Bilingual fields follow the pattern:
- `*_ge`: Georgian text
- `*_en`: English text

Frontend should use appropriate field based on current language.

---

## 5. Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  detail: string;
  code?: string;
  field?: string; // For validation errors
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 6. Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## 7. Caching Strategy

### Client-Side Caching

| Endpoint | Cache Duration | Strategy |
|----------|----------------|----------|
| `/categories` | 1 hour | staleWhileRevalidate |
| `/regions` | 1 hour | staleWhileRevalidate |
| `/jobs` | 5 minutes | staleWhileRevalidate |
| `/jobs/{id}` | 5 minutes | staleWhileRevalidate |

### Implementation (TanStack Query)

```typescript
// Categories - long cache
useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  staleTime: 60 * 60 * 1000, // 1 hour
  cacheTime: 24 * 60 * 60 * 1000, // 24 hours
});

// Jobs list - shorter cache
useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => fetchJobs(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

---

## 8. TypeScript Types

```typescript
// types/api.ts

export interface Job {
  id: number;
  title_ge: string;
  title_en: string;
  company_name: string;
  location: string;
  category_slug: string;
  category_name_ge: string;
  category_name_en: string;
  region_slug: string;
  region_name_ge: string;
  region_name_en: string;
  salary_min: number | null;
  salary_max: number | null;
  has_salary: boolean;
  is_vip: boolean;
  is_remote: boolean;
  published_at: string;
  deadline: string | null;
  source_name: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

export interface JobDetail extends Job {
  body_ge: string;
  body_en: string;
  external_id: string;
  views_count: number;
}

export interface JobListResponse {
  items: Job[];
  total: number;
  pages: number;
  page: number;
  page_size: number;
}

export interface Category {
  id: number;
  slug: string;
  name_ge: string;
  name_en: string;
  jobsge_cid: number;
  job_count?: number;
}

export interface Region {
  id: number;
  slug: string;
  name_ge: string;
  name_en: string;
  jobsge_lid: number;
  job_count?: number;
}

export interface JobFilters {
  q?: string;
  category?: string;
  region?: string;
  lid?: number;
  cid?: number;
  has_salary?: boolean;
  page?: number;
  page_size?: number;
  sort?: string;
}
```

---

## 9. API Client Implementation

```typescript
// api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

export const api = {
  jobs: {
    list: (filters: JobFilters) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      return fetchApi<JobListResponse>(`/jobs?${params}`);
    },
    get: (id: number) => fetchApi<JobDetail>(`/jobs/${id}`),
  },
  categories: {
    list: () => fetchApi<Category[]>('/categories'),
  },
  regions: {
    list: () => fetchApi<Region[]>('/regions'),
  },
  analytics: {
    track: (event: AnalyticsEvent) =>
      navigator.sendBeacon(
        `${API_BASE_URL}/analytics/track`,
        JSON.stringify(event)
      ),
  },
};
```

---

*API contract maintained by Backend & Frontend Teams*
*Last updated: January 23, 2026*
