# Technology Stack
# jobsNGUI - Technical Recommendations

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Core Technologies

### 1.1 Framework & Language

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |

**Why React 18:**
- Concurrent rendering for better UX
- Suspense for data fetching
- Automatic batching
- Large ecosystem

**Why TypeScript:**
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

**Why Vite:**
- Fast dev server (< 500ms HMR)
- Optimized production builds
- Native ESM support
- Simple configuration

---

## 2. Styling

### 2.1 Primary: Tailwind CSS

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.x | Utility-first CSS |
| **PostCSS** | 8.x | CSS processing |
| **Autoprefixer** | 10.x | Vendor prefixes |

**Why Tailwind:**
- No CSS bloat (purges unused styles)
- Consistent design tokens
- Dark mode built-in
- Responsive utilities
- Small bundle size (~10KB gzipped)

### 2.2 CSS-in-JS (Optional)

For dynamic styles, consider:
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. State Management

### 3.1 Server State: TanStack Query

| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack Query** | 5.x | Server state management |

**Why TanStack Query:**
- Automatic caching
- Background refetching
- Optimistic updates
- DevTools
- SSR support

```typescript
// Example usage
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => api.jobs.list(filters),
});
```

### 3.2 Client State: Zustand (Lightweight)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 4.x | Client state (minimal) |

**Why Zustand:**
- Tiny bundle (~1KB)
- Simple API
- No boilerplate
- TypeScript support

```typescript
// Example: Theme store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: ThemeStore['theme']) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);
```

### 3.3 URL State: React Router + Search Params

For filter/pagination state, use URL search params:

```typescript
import { useSearchParams } from 'react-router-dom';

function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    page: Number(searchParams.get('page')) || 1,
  };

  const setFilters = (newFilters: Partial<typeof filters>) => {
    setSearchParams((params) => {
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
        else params.delete(key);
      });
      return params;
    });
  };

  return { filters, setFilters };
}
```

---

## 4. Routing

### 4.1 React Router

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Router** | 6.x | Client-side routing |

**Route Structure:**
```typescript
const routes = [
  {
    path: '/:lang',
    element: <Layout />,
    children: [
      { index: true, element: <JobListPage /> },
      { path: 'job/:id', element: <JobDetailPage /> },
      { path: 'saved', element: <SavedJobsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/', element: <Navigate to="/ge" replace /> },
];
```

---

## 5. Internationalization

### 5.1 i18next

| Technology | Version | Purpose |
|------------|---------|---------|
| **i18next** | 23.x | i18n framework |
| **react-i18next** | 14.x | React bindings |

**Why i18next:**
- Industry standard
- Pluralization support
- Interpolation
- Language detection
- Namespace support

```typescript
// Usage
import { useTranslation } from 'react-i18next';

function SearchButton() {
  const { t } = useTranslation();
  return <button>{t('search')}</button>;
}
```

---

## 6. HTTP Client

### 6.1 Native Fetch + Custom Wrapper

No external HTTP library needed. Use native `fetch` with a typed wrapper:

```typescript
// api/client.ts
async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/v1${endpoint}`);
  if (!response.ok) throw new ApiError(response);
  return response.json();
}
```

**Why not Axios:**
- Native fetch is sufficient
- Smaller bundle
- No external dependency
- TanStack Query handles retries

---

## 7. Animation

### 7.1 Framer Motion (Optional)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Framer Motion** | 11.x | Animations |

**Use for:**
- Page transitions
- Component enter/exit
- Gesture interactions
- Layout animations

```typescript
// Page transition
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
>
  {children}
</motion.div>
```

### 7.2 Alternative: CSS Transitions

For simpler animations, Tailwind's built-in transitions suffice:

```tsx
<div className="transition-all duration-200 hover:scale-105">
```

---

## 8. Icons

### 8.1 Lucide React

| Technology | Version | Purpose |
|------------|---------|---------|
| **Lucide React** | 0.x | Icon library |

**Why Lucide:**
- Tree-shakeable (only imports used icons)
- Consistent design
- ~1KB per icon
- TypeScript support

```typescript
import { Search, MapPin, Calendar } from 'lucide-react';

<Search size={20} className="text-gray-500" />
```

---

## 9. Form Handling

### 9.1 React Hook Form (If Needed)

For complex forms (future features like job alerts):

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.x | Form state |
| **Zod** | 3.x | Validation |

For current simple search/filter forms, controlled inputs are sufficient.

---

## 10. Testing

### 10.1 Unit & Integration Tests

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 1.x | Test runner |
| **Testing Library** | 14.x | Component testing |
| **MSW** | 2.x | API mocking |

### 10.2 E2E Tests (Optional)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Playwright** | 1.x | E2E testing |

---

## 11. Developer Experience

### 11.1 Linting & Formatting

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 8.x | Code linting |
| **Prettier** | 3.x | Code formatting |
| **TypeScript ESLint** | 7.x | TS-specific rules |

### 11.2 Git Hooks

| Technology | Version | Purpose |
|------------|---------|---------|
| **Husky** | 9.x | Git hooks |
| **lint-staged** | 15.x | Staged file linting |

---

## 12. Build & Deployment

### 12.1 Production Build

```bash
npm run build
# Output: dist/
```

### 12.2 Docker

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 12.3 Environment Variables

```bash
# .env.production
VITE_API_URL=/api/v1
VITE_ANALYTICS_ENABLED=true
VITE_DEFAULT_LANG=ge
```

---

## 13. Package Summary

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.20.0",
    "zustand": "^4.5.0",
    "i18next": "^23.8.0",
    "react-i18next": "^14.0.0",
    "lucide-react": "^0.330.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### Optional Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",  // If animations needed
    "react-helmet-async": "^2.0.0"  // If SEO meta tags needed
  },
  "devDependencies": {
    "vitest": "^1.2.0",  // Testing
    "@testing-library/react": "^14.1.0",
    "msw": "^2.1.0"
  }
}
```

---

## 14. Bundle Size Budget

| Chunk | Max Size (gzipped) |
|-------|-------------------|
| Main bundle | < 100KB |
| Vendor chunk | < 100KB |
| Total initial | < 200KB |

### Size Optimization Strategies

1. **Code splitting** - Dynamic imports for routes
2. **Tree shaking** - Only import used functions
3. **Minification** - Vite handles this
4. **Compression** - nginx gzip/brotli

---

## 15. Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |

---

*Tech stack recommendations by Engineering Team*
*Last updated: January 23, 2026*
