# Design System
# jobsNGUI - Visual Design Specification

**Version:** 2.0
**Date:** January 23, 2026
**Layout:** Table-based (matching current frontend)

---

## 1. Design Principles

### 1.1 Core Principles
1. **Familiar** - Maintain current table layout users know
2. **Modern** - Clean styling with theme support
3. **Accessible** - High contrast, readable fonts, clear hierarchy
4. **Consistent** - Unified patterns across all pages
5. **Responsive** - Fluid layouts that adapt to any screen

### 1.2 Layout Decision
> **Table-based layout is preserved** from the current frontend. Users are familiar with the jobs.ge-style table layout. The new frontend maintains this pattern while adding theme support.

---

## 2. Complete Color System

### 2.1 Current Frontend Colors (Reference)

These are the exact colors from the existing `main.css`:

```css
/* Current Frontend - main.css */
:root {
    --primary: #4ECDC4;
    --primary-dark: #3ab5ad;
    --secondary: #1a1a2e;
    --bg: #f5f5f5;
    --white: #fff;
    --text: #333;
    --text-light: #666;
    --text-muted: #999;
    --border: #ddd;
    --link: #0066cc;
    --link-hover: #004499;
    --success: #28a745;
    --warning: #ffc107;
    --vip: #cc6600;
    --new-badge: #ff6b6b;
}
```

### 2.2 Light Theme (jobsNGUI)

**Matches current frontend exactly:**

```css
:root, [data-theme="light"] {
    /* ═══════════════════════════════════════════
       PRIMARY BRAND COLORS
       ═══════════════════════════════════════════ */
    --color-primary: #4ECDC4;           /* Turquoise - Main brand */
    --color-primary-hover: #3ab5ad;     /* Darker on hover */
    --color-primary-light: #e6f7f6;     /* Light background tint */

    /* ═══════════════════════════════════════════
       SECONDARY / HEADER / FOOTER
       ═══════════════════════════════════════════ */
    --color-secondary: #1a1a2e;         /* Dark navy - Header/Footer */

    /* ═══════════════════════════════════════════
       BACKGROUND COLORS
       ═══════════════════════════════════════════ */
    --color-background: #f5f5f5;        /* Page background (light gray) */
    --color-surface: #ffffff;           /* Table/Card background (white) */
    --color-surface-hover: #fafafa;     /* Table row hover */
    --color-surface-alt: #f8f8f8;       /* Table header, metadata bg */

    /* ═══════════════════════════════════════════
       TEXT COLORS
       ═══════════════════════════════════════════ */
    --color-text-primary: #333333;      /* Main text (dark gray) */
    --color-text-secondary: #666666;    /* Secondary text */
    --color-text-tertiary: #999999;     /* Muted/caption text */
    --color-text-inverse: #ffffff;      /* Text on dark backgrounds */

    /* ═══════════════════════════════════════════
       BORDER COLORS
       ═══════════════════════════════════════════ */
    --color-border: #dddddd;            /* Main borders */
    --color-border-light: #eeeeee;      /* Table row borders */

    /* ═══════════════════════════════════════════
       LINK COLORS
       ═══════════════════════════════════════════ */
    --color-link: #0066cc;              /* Default link blue */
    --color-link-hover: #004499;        /* Link hover state */

    /* ═══════════════════════════════════════════
       STATUS / SEMANTIC COLORS
       ═══════════════════════════════════════════ */
    --color-success: #28a745;           /* Green - Salary, positive */
    --color-warning: #ffc107;           /* Yellow - VIP badge bg */
    --color-error: #dc3545;             /* Red - Errors */
    --color-info: #17a2b8;              /* Cyan - Info */

    /* ═══════════════════════════════════════════
       JOB-SPECIFIC COLORS
       ═══════════════════════════════════════════ */
    --color-vip: #cc6600;               /* VIP text (orange) */
    --color-vip-bg: #ffc107;            /* VIP badge background */
    --color-new-badge: #ff6b6b;         /* NEW badge (coral red) */
    --color-new-badge-text: #ffffff;    /* NEW badge text */
    --color-salary: #28a745;            /* Salary badge (green) */
    --color-salary-text: #ffffff;       /* Salary badge text */
    --color-remote: #4ECDC4;            /* Remote badge */

    /* ═══════════════════════════════════════════
       SOCIAL PLATFORM COLORS
       ═══════════════════════════════════════════ */
    --color-facebook: #1877f2;
    --color-telegram: #0088cc;
    --color-whatsapp: #25d366;
    --color-linkedin: #0077b5;
    --color-copy: #666666;

    /* ═══════════════════════════════════════════
       TABLE-SPECIFIC COLORS
       ═══════════════════════════════════════════ */
    --color-table-bg: #ffffff;          /* Table background */
    --color-table-header-bg: #f8f8f8;   /* Table header row */
    --color-table-row-hover: #fafafa;   /* Row hover state */
    --color-table-border: #eeeeee;      /* Row separators */
    --color-table-border-outer: #dddddd;/* Table outer border */

    /* ═══════════════════════════════════════════
       SHADOWS
       ═══════════════════════════════════════════ */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### 2.3 Dark Theme (jobsNGUI - New)

```css
[data-theme="dark"] {
    /* ═══════════════════════════════════════════
       PRIMARY BRAND COLORS
       ═══════════════════════════════════════════ */
    --color-primary: #5EEAD4;           /* Lighter turquoise */
    --color-primary-hover: #4ED4BE;     /* Hover state */
    --color-primary-light: rgba(94, 234, 212, 0.1);

    /* ═══════════════════════════════════════════
       SECONDARY / HEADER / FOOTER
       ═══════════════════════════════════════════ */
    --color-secondary: #0f172a;         /* Darker navy */

    /* ═══════════════════════════════════════════
       BACKGROUND COLORS
       ═══════════════════════════════════════════ */
    --color-background: #0f172a;        /* Page background (dark navy) */
    --color-surface: #1e293b;           /* Table/Card background */
    --color-surface-hover: #334155;     /* Table row hover */
    --color-surface-alt: #1e293b;       /* Table header */

    /* ═══════════════════════════════════════════
       TEXT COLORS
       ═══════════════════════════════════════════ */
    --color-text-primary: #f1f5f9;      /* Main text (light) */
    --color-text-secondary: #cbd5e1;    /* Secondary text */
    --color-text-tertiary: #94a3b8;     /* Muted text */
    --color-text-inverse: #0f172a;      /* Text on light backgrounds */

    /* ═══════════════════════════════════════════
       BORDER COLORS
       ═══════════════════════════════════════════ */
    --color-border: #334155;            /* Main borders */
    --color-border-light: #475569;      /* Lighter borders */

    /* ═══════════════════════════════════════════
       LINK COLORS
       ═══════════════════════════════════════════ */
    --color-link: #60a5fa;              /* Light blue */
    --color-link-hover: #93c5fd;        /* Lighter on hover */

    /* ═══════════════════════════════════════════
       STATUS / SEMANTIC COLORS
       ═══════════════════════════════════════════ */
    --color-success: #34d399;           /* Brighter green */
    --color-warning: #fbbf24;           /* Brighter yellow */
    --color-error: #f87171;             /* Brighter red */
    --color-info: #38bdf8;              /* Brighter cyan */

    /* ═══════════════════════════════════════════
       JOB-SPECIFIC COLORS
       ═══════════════════════════════════════════ */
    --color-vip: #fb923c;               /* VIP text (brighter orange) */
    --color-vip-bg: #fbbf24;            /* VIP badge background */
    --color-new-badge: #fb7185;         /* NEW badge (brighter) */
    --color-new-badge-text: #ffffff;    /* NEW badge text */
    --color-salary: #34d399;            /* Salary badge */
    --color-salary-text: #000000;       /* Salary badge text */
    --color-remote: #5EEAD4;            /* Remote badge */

    /* ═══════════════════════════════════════════
       SOCIAL PLATFORM COLORS (unchanged)
       ═══════════════════════════════════════════ */
    --color-facebook: #1877f2;
    --color-telegram: #0088cc;
    --color-whatsapp: #25d366;
    --color-linkedin: #0077b5;
    --color-copy: #94a3b8;

    /* ═══════════════════════════════════════════
       TABLE-SPECIFIC COLORS
       ═══════════════════════════════════════════ */
    --color-table-bg: #1e293b;          /* Table background */
    --color-table-header-bg: #1e293b;   /* Table header */
    --color-table-row-hover: #334155;   /* Row hover */
    --color-table-border: #334155;      /* Row separators */
    --color-table-border-outer: #334155;/* Table outer border */

    /* ═══════════════════════════════════════════
       SHADOWS
       ═══════════════════════════════════════════ */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

### 2.4 Complete Color Reference Table

| Purpose | CSS Variable | Light | Dark |
|---------|--------------|-------|------|
| **Brand** |
| Primary | `--color-primary` | `#4ECDC4` | `#5EEAD4` |
| Primary Hover | `--color-primary-hover` | `#3ab5ad` | `#4ED4BE` |
| **Backgrounds** |
| Page | `--color-background` | `#f5f5f5` | `#0f172a` |
| Surface | `--color-surface` | `#ffffff` | `#1e293b` |
| Surface Hover | `--color-surface-hover` | `#fafafa` | `#334155` |
| Header/Footer | `--color-secondary` | `#1a1a2e` | `#0f172a` |
| **Text** |
| Primary | `--color-text-primary` | `#333333` | `#f1f5f9` |
| Secondary | `--color-text-secondary` | `#666666` | `#cbd5e1` |
| Tertiary | `--color-text-tertiary` | `#999999` | `#94a3b8` |
| **Borders** |
| Default | `--color-border` | `#dddddd` | `#334155` |
| Light | `--color-border-light` | `#eeeeee` | `#475569` |
| **Links** |
| Default | `--color-link` | `#0066cc` | `#60a5fa` |
| Hover | `--color-link-hover` | `#004499` | `#93c5fd` |
| **Status** |
| Success | `--color-success` | `#28a745` | `#34d399` |
| Warning | `--color-warning` | `#ffc107` | `#fbbf24` |
| Error | `--color-error` | `#dc3545` | `#f87171` |
| Info | `--color-info` | `#17a2b8` | `#38bdf8` |
| **Job Badges** |
| VIP Text | `--color-vip` | `#cc6600` | `#fb923c` |
| NEW Badge | `--color-new-badge` | `#ff6b6b` | `#fb7185` |
| Salary | `--color-salary` | `#28a745` | `#34d399` |
| **Social** |
| Facebook | `--color-facebook` | `#1877f2` | `#1877f2` |
| Telegram | `--color-telegram` | `#0088cc` | `#0088cc` |
| WhatsApp | `--color-whatsapp` | `#25d366` | `#25d366` |
| LinkedIn | `--color-linkedin` | `#0077b5` | `#0077b5` |

---

## 3. Typography

### 3.1 Font Families

```css
:root {
  /* Primary font - Georgian support required */
  --font-sans: Arial, 'Noto Sans Georgian', sans-serif;
}
```

**Note:** Using Arial as primary to match current frontend.

### 3.2 Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `text-xs` | 10px | 14px | 400 | Badges (NEW, VIP) |
| `text-sm` | 13px | 18px | 400 | Table cells, labels |
| `text-base` | 14px | 21px | 400 | Body text (default) |
| `text-lg` | 16px | 24px | 500 | Company name in detail |
| `text-xl` | 20px | 28px | 600 | Logo |
| `text-2xl` | 22px | 30px | 700 | Job detail title |

### 3.3 Font Weights

```css
--font-normal: 400;   /* Body text */
--font-medium: 500;   /* Labels */
--font-semibold: 600; /* Headings */
--font-bold: 700;     /* Job title in detail */
```

---

## 4. Table Component (Primary Layout)

### 4.1 Table Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ განცხადება         │ კომპანია       │ გამოქვეყნდა    │ ბოლო ვადა         │
│ (Job Title)        │ (Company)      │ (Published)    │ (Deadline)        │
│ 45%                │ 25%            │ 15%            │ 15%               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Software Developer │ TechCorp LLC   │ 20 იანვარი     │ 15 თებერვალი      │
│ [NEW] [₾]          │                │                │                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ UI Designer [VIP]  │ DesignHub      │ 19 იანვარი     │ -                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Table CSS

```css
/* Table Wrapper */
.jobs-table-wrapper {
    background: var(--color-table-bg);
    border: 1px solid var(--color-table-border-outer);
    border-radius: 4px;
    overflow-x: auto;
}

/* Table */
.jobs-table {
    width: 100%;
    border-collapse: collapse;
}

/* Header */
.jobs-table th {
    background: var(--color-table-header-bg);
    padding: 12px 15px;
    text-align: left;
    font-weight: normal;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border);
    font-size: 13px;
}

/* Cells */
.jobs-table td {
    padding: 12px 15px;
    border-bottom: 1px solid var(--color-table-border);
    vertical-align: top;
}

/* Row Hover */
.jobs-table tr:hover {
    background: var(--color-table-row-hover);
}

/* Column Widths */
.col-title { width: 45%; }
.col-company { width: 25%; }
.col-date { width: 15%; }
.col-deadline { width: 15%; }
```

### 4.3 Table Row Component

```tsx
function JobRow({ job }: { job: Job }) {
  const { language } = useLanguage();
  const title = language === 'en' ? job.title_en : job.title_ge;
  const isNew = isRecent(job.published_at, 2);

  return (
    <tr className="hover:bg-surface-hover">
      <td className="p-3 border-b border-border-light">
        <a
          href={`/${language}/job/${job.id}`}
          className={cn(
            "text-text-primary hover:text-link hover:underline",
            job.is_vip && "text-vip"
          )}
        >
          {title}
        </a>
        <span className="inline-flex gap-1 ml-2">
          {isNew && (
            <span className="px-1 py-0.5 text-[10px] bg-new-badge text-white rounded uppercase">
              NEW
            </span>
          )}
          {job.has_salary && (
            <span className="px-1 py-0.5 text-[10px] bg-salary text-white rounded">
              ₾
            </span>
          )}
        </span>
      </td>
      <td className="p-3 border-b border-border-light text-sm text-text-primary">
        {job.company_name}
      </td>
      <td className="p-3 border-b border-border-light text-sm text-text-secondary hidden md:table-cell">
        {formatDateShort(job.published_at)}
      </td>
      <td className="p-3 border-b border-border-light text-sm text-text-secondary hidden md:table-cell">
        {job.deadline ? formatDateShort(job.deadline) : '-'}
      </td>
    </tr>
  );
}
```

### 4.4 Responsive Table

```css
/* Mobile: Hide date columns */
@media (max-width: 768px) {
    .jobs-table th:nth-child(3),
    .jobs-table td:nth-child(3),
    .jobs-table th:nth-child(4),
    .jobs-table td:nth-child(4) {
        display: none;
    }

    .col-title { width: 60%; }
    .col-company { width: 40%; }
}
```

---

## 5. Badge Components

### 5.1 NEW Badge

```css
.badge-new {
    display: inline-block;
    padding: 1px 4px;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    border-radius: 2px;
    background: var(--color-new-badge);
    color: white;
}
```

### 5.2 VIP Badge

```css
.badge-vip {
    display: inline-block;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    border-radius: 3px;
    background: var(--color-warning);
    color: #000000;
}
```

### 5.3 Salary Badge

```css
.badge-salary {
    display: inline-block;
    padding: 1px 4px;
    font-size: 10px;
    font-weight: 500;
    border-radius: 2px;
    background: var(--color-salary);
    color: white;
}
```

### 5.4 VIP Row Styling

```css
/* VIP job title styling */
.job-title-link.vip {
    color: var(--color-vip);
}

.job-title-link.vip:hover {
    color: var(--color-link);
}
```

---

## 6. Search Section

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Search Input.................]  [Category ▼]  [Search Button]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Search Form CSS

```css
.search-section {
    background: var(--color-surface);
    padding: 15px 0;
    border-bottom: 1px solid var(--color-border);
}

.search-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.search-input {
    flex: 1;
    min-width: 200px;
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 14px;
    background: var(--color-surface);
    color: var(--color-text-primary);
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
}

.search-select {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 14px;
    background: var(--color-surface);
    color: var(--color-text-primary);
    min-width: 180px;
}

.search-btn {
    padding: 8px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.search-btn:hover {
    background: var(--color-primary-hover);
}
```

---

## 7. Header & Footer

### 7.1 Header

```css
.header {
    background: var(--color-secondary);
    padding: 12px 0;
}

.logo {
    font-size: 20px;
    font-weight: bold;
    color: white;
}

.logo:hover {
    color: var(--color-primary);
}

.lang-switch a {
    padding: 4px 8px;
    color: white;
    opacity: 0.7;
    font-size: 12px;
}

.lang-switch a.active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}
```

### 7.2 Footer

```css
.footer {
    background: var(--color-secondary);
    color: white;
    padding: 20px 0;
    margin-top: 30px;
}

.footer-telegram {
    color: var(--color-primary);
}

.footer-telegram:hover {
    color: white;
}
```

---

## 8. Pagination

### 8.1 Pagination CSS

```css
.pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 20px;
    padding: 15px 0;
}

.pagination-link {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    font-size: 13px;
    background: var(--color-surface);
    color: var(--color-text-primary);
}

.pagination-link:hover {
    background: var(--color-surface-hover);
    text-decoration: none;
}

.pagination-link.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.pagination-link.disabled {
    opacity: 0.5;
    pointer-events: none;
}
```

---

## 9. Share Buttons

### 9.1 Share Button CSS

```css
.share-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 15px 0;
    border-top: 1px solid var(--color-border);
}

.share-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: white;
}

.share-btn:hover {
    opacity: 0.85;
}

.share-fb { background: var(--color-facebook); }
.share-tg { background: var(--color-telegram); }
.share-wa { background: var(--color-whatsapp); }
.share-li { background: var(--color-linkedin); }
.share-copy { background: var(--color-copy); }
.share-copy.copied { background: var(--color-success); }
```

---

## 10. Loading & Empty States

### 10.1 Spinner

```css
.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

### 10.2 Empty State

```css
.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--color-text-secondary);
}
```

### 10.3 Skeleton (New in jobsNGUI)

```css
.skeleton {
    background: linear-gradient(
        90deg,
        var(--color-surface-hover) 25%,
        var(--color-surface-alt) 50%,
        var(--color-surface-hover) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

---

## 11. Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        link: 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        vip: 'var(--color-vip)',
        'new-badge': 'var(--color-new-badge)',
        salary: 'var(--color-salary)',
        facebook: 'var(--color-facebook)',
        telegram: 'var(--color-telegram)',
        whatsapp: 'var(--color-whatsapp)',
        linkedin: 'var(--color-linkedin)',
      },
      fontFamily: {
        sans: ['Arial', 'Noto Sans Georgian', 'sans-serif'],
      },
    },
  },
};
```

---

## 12. Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets - hide date columns */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1100px;  /* Container max-width */
```

---

*Design System v2.0 - Table Layout with Full Color Schema*
*Last updated: January 23, 2026*
