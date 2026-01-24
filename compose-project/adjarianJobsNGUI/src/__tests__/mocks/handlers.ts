/**
 * MSW Request Handlers
 * Mock API handlers for testing
 */

import { http, HttpResponse } from 'msw';
import { mockJobs, mockCategories, mockRegions, mockJobDetail } from './data';

export const handlers = [
  // Jobs list
  http.get('*/api/v1/jobs', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const region = url.searchParams.get('region');
    const hasSalary = url.searchParams.get('has_salary');
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 30;

    let filteredJobs = [...mockJobs];

    // Apply search filter
    if (q) {
      const searchLower = q.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title_en.toLowerCase().includes(searchLower) ||
          job.title_ge.includes(q) ||
          job.company_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category) {
      filteredJobs = filteredJobs.filter((job) => job.category_slug === category);
    }

    // Apply region filter
    if (region) {
      filteredJobs = filteredJobs.filter((job) => job.region_slug === region);
    }

    // Apply salary filter
    if (hasSalary === 'true') {
      filteredJobs = filteredJobs.filter((job) => job.has_salary);
    }

    // Calculate pagination
    const total = filteredJobs.length;
    const pages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filteredJobs.slice(start, start + pageSize);

    return HttpResponse.json({
      items,
      total,
      pages,
      page,
      page_size: pageSize,
    });
  }),

  // Single job
  http.get('*/api/v1/jobs/:id', ({ params }) => {
    const id = Number(params.id);
    const job = mockJobDetail[id];

    if (!job) {
      return HttpResponse.json(
        {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(job);
  }),

  // Categories
  http.get('*/api/v1/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // Regions
  http.get('*/api/v1/regions', () => {
    return HttpResponse.json(mockRegions);
  }),

  // Analytics tracking (always succeeds)
  http.post('*/api/v1/analytics/track', async ({ request }) => {
    // Optionally log the request body for debugging
    // const body = await request.json();
    // console.log('Analytics event:', body);
    return HttpResponse.json({ status: 'ok' });
  }),
];
