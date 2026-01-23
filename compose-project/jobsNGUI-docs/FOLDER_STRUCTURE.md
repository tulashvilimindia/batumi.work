# Project Structure
# jobsNGUI - Folder Organization

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Root Structure

```
compose-project/
├── jobsNGUI/                    # New React frontend
│   ├── src/                     # Source code
│   ├── public/                  # Static assets
│   ├── dist/                    # Build output (gitignored)
│   ├── node_modules/            # Dependencies (gitignored)
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md
│
├── api/                         # Existing FastAPI backend
├── admin/                       # Existing admin backend
├── admin-ui/                    # Existing React admin
├── web/                         # Existing static frontend (legacy)
├── worker/                      # Job parser
├── bot/                         # Telegram bot
├── sender/                      # Channel sender
├── docker-compose.yml
└── ...
```

---

## 2. Source Code Structure

```
jobsNGUI/src/
│
├── main.tsx                     # Application entry point
├── App.tsx                      # Root component with providers
├── index.css                    # Global styles & Tailwind imports
├── vite-env.d.ts               # Vite type declarations
│
├── api/                         # API layer
│   ├── client.ts               # Base fetch wrapper
│   ├── jobs.ts                 # Job-related API calls
│   ├── categories.ts           # Category API calls
│   ├── regions.ts              # Region API calls
│   ├── analytics.ts            # Analytics tracking
│   └── types.ts                # API response types
│
├── components/                  # Reusable UI components
│   ├── ui/                     # Base UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts            # Barrel export
│   │
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Container.tsx
│   │   └── index.ts
│   │
│   ├── job/                    # Job-specific components
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobDetail.tsx
│   │   ├── JobBadges.tsx
│   │   ├── JobMetadata.tsx
│   │   ├── JobDescription.tsx
│   │   └── index.ts
│   │
│   ├── search/                 # Search & filter components
│   │   ├── SearchBar.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── RegionFilter.tsx
│   │   ├── SalaryToggle.tsx
│   │   ├── FilterBar.tsx
│   │   └── index.ts
│   │
│   ├── share/                  # Share functionality
│   │   ├── ShareButtons.tsx
│   │   ├── CopyLinkButton.tsx
│   │   └── index.ts
│   │
│   └── common/                 # Other shared components
│       ├── Pagination.tsx
│       ├── LanguageSwitch.tsx
│       ├── ThemeToggle.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── LoadingState.tsx
│       └── index.ts
│
├── pages/                       # Page components (routes)
│   ├── HomePage.tsx            # Job listing page
│   ├── JobDetailPage.tsx       # Single job page
│   ├── SavedJobsPage.tsx       # Saved jobs page
│   ├── NotFoundPage.tsx        # 404 page
│   ├── OfflinePage.tsx         # Offline fallback
│   └── index.ts
│
├── hooks/                       # Custom React hooks
│   ├── useJobs.ts              # Job data fetching
│   ├── useJob.ts               # Single job fetching
│   ├── useCategories.ts        # Categories data
│   ├── useRegions.ts           # Regions data
│   ├── useFilters.ts           # URL filter state
│   ├── useTheme.ts             # Theme management
│   ├── useLanguage.ts          # Language management
│   ├── useSavedJobs.ts         # Local saved jobs
│   ├── useOnline.ts            # Online status
│   ├── useDebounce.ts          # Debounce utility
│   └── index.ts
│
├── stores/                      # Zustand stores
│   ├── themeStore.ts           # Theme state
│   ├── savedJobsStore.ts       # Saved jobs state
│   └── index.ts
│
├── i18n/                        # Internationalization
│   ├── config.ts               # i18next configuration
│   ├── locales/
│   │   ├── ge.json             # Georgian translations
│   │   └── en.json             # English translations
│   └── index.ts
│
├── lib/                         # Utility functions
│   ├── utils.ts                # General utilities (cn, etc.)
│   ├── date.ts                 # Date formatting
│   ├── currency.ts             # Salary formatting
│   ├── sanitize.ts             # HTML sanitization
│   ├── session.ts              # Session ID management
│   └── index.ts
│
├── types/                       # TypeScript types
│   ├── job.ts                  # Job-related types
│   ├── category.ts             # Category types
│   ├── region.ts               # Region types
│   └── index.ts
│
├── constants/                   # Application constants
│   ├── routes.ts               # Route paths
│   ├── api.ts                  # API endpoints
│   ├── config.ts               # App configuration
│   └── index.ts
│
└── styles/                      # Additional styles
    ├── themes.css              # Theme CSS variables
    └── fonts.css               # Font imports
```

---

## 3. Public Assets

```
jobsNGUI/public/
│
├── favicon.svg                  # Site favicon
├── favicon.ico                  # Fallback favicon
├── manifest.json               # PWA manifest
├── robots.txt                  # SEO robots file
├── sw.js                       # Service worker (if not using workbox)
│
├── icons/                       # PWA icons
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
│
└── images/                      # Static images
    ├── logo.svg
    ├── empty-state.svg
    └── offline.svg
```

---

## 4. Configuration Files

### 4.1 package.json

```json
{
  "name": "jobs-ngui",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
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
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "postcss": "^8.4.0",
    "prettier": "^3.2.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### 4.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4.3 vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

### 4.4 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Georgian', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

---

## 5. Docker Configuration

### 5.1 Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 5.2 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5.3 docker-compose.yml addition

```yaml
# Add to existing docker-compose.yml
services:
  jobs-ngui:
    build:
      context: ./jobsNGUI
      dockerfile: Dockerfile
    container_name: jobboard-web-ng
    restart: unless-stopped
    ports:
      - "8103:80"  # Or desired port
    depends_on:
      api:
        condition: service_healthy
    networks:
      - jobboard-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 6. Import Conventions

### 6.1 Barrel Exports

Each feature folder has an `index.ts` for clean imports:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { Badge } from './Badge';
// ...
```

### 6.2 Import Order

```typescript
// 1. React/external libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules (with alias)
import { Button, Input } from '@/components/ui';
import { useFilters } from '@/hooks';
import { api } from '@/api';

// 3. Types
import type { Job } from '@/types';

// 4. Styles (if any)
import './styles.css';
```

---

## 7. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `JobCard.tsx` |
| Hooks | camelCase with `use` prefix | `useJobs.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `Job.ts` |
| Constants | camelCase/UPPER_SNAKE | `routes.ts`, `API_URL` |
| Stores | camelCase with `Store` suffix | `themeStore.ts` |

---

*Folder structure maintained by Engineering Team*
*Last updated: January 23, 2026*
