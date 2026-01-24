/**
 * Service Worker for Batumi Jobs PWA
 * Handles caching and offline functionality
 */

const CACHE_NAME = 'batumi-jobs-v1';
const API_CACHE_NAME = 'batumi-jobs-api-v1';

// Assets to cache on install (excluding redirecting URLs)
const STATIC_ASSETS = [
  '/ge/',
  '/en/',
  '/manifest.json',
  '/favicon.svg',
];

// API endpoints to cache
const CACHEABLE_API_PATTERNS = [
  /\/api\/v1\/categories/,
  /\/api\/v1\/regions/,
];

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60, // 1 week
  api: 60 * 60, // 1 hour
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('SW: Failed to cache some assets:', error);
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => {
            console.log('SW: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except API)
  if (url.origin !== self.location.origin && !url.pathname.includes('/api/')) {
    return;
  }

  // Handle API requests
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with stale-while-revalidate strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Check if this is a cacheable API endpoint
  const isCacheable = CACHEABLE_API_PATTERNS.some((pattern) =>
    pattern.test(url.pathname)
  );

  if (!isCacheable) {
    // Network only for non-cacheable endpoints
    return fetch(request);
  }

  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Start network request
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        // Clone and cache the response
        const responseToCache = response.clone();
        cache.put(request, responseToCache);
      }
      return response;
    })
    .catch((error) => {
      console.warn('SW: Network request failed:', error);
      return null;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    // Revalidate in background
    fetchPromise;
    return cachedResponse;
  }

  // Wait for network if no cache
  const networkResponse = await fetchPromise;

  if (networkResponse) {
    return networkResponse;
  }

  // Return offline fallback
  return new Response(
    JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle static requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Use redirect: 'follow' to handle server redirects properly
    const networkResponse = await fetch(request, { redirect: 'follow' });

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('SW: Static request failed:', error);

    // For navigation requests, return the cached app shell
    if (request.mode === 'navigate') {
      const fallback = await cache.match('/ge/');
      if (fallback) {
        return fallback;
      }
    }

    // Return offline page
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Offline - Batumi Jobs</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
              color: #333;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { color: #4ECDC4; }
            p { color: #666; margin: 1rem 0; }
            button {
              background: #4ECDC4;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #3dbdb5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

/**
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

console.log('SW: Service worker loaded');
