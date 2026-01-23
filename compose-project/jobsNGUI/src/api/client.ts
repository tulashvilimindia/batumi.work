/**
 * API Client Wrapper
 * Provides typed fetch functions for API communication
 */

// Base URL from environment or default to production
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://batumi.work/api/v1';

/**
 * Custom API Error class with status code and details
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public detail?: string,
    public code?: string
  ) {
    super(detail || statusText);
    this.name = 'ApiError';
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let detail: string | undefined;
    let code: string | undefined;

    try {
      const body = await response.json();
      detail = body.detail || body.message;
      code = body.code;
    } catch {
      detail = response.statusText;
    }

    return new ApiError(response.status, response.statusText, detail, code);
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Generic fetch wrapper with error handling and type safety
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
  }
): Promise<T> {
  const { params, ...fetchOptions } = options || {};
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...fetchOptions?.headers,
    },
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * GET request helper
 */
export function get<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'GET', params });
}

/**
 * POST request helper
 */
export function post<T>(
  endpoint: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    params,
  });
}
