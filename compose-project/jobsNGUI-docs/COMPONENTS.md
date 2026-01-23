# Component Library
# jobsNGUI - Detailed Component Specifications

**Version:** 1.0
**Date:** January 23, 2026

---

## 1. Overview

This document provides detailed specifications for all React components in the jobsNGUI application, including props, variants, states, and usage examples.

---

## 2. Base UI Components

### 2.1 Button

**Location:** `src/components/ui/Button.tsx`

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}
```

**Variants:**

| Variant | Use Case | Style |
|---------|----------|-------|
| `primary` | Main CTAs | Filled primary color |
| `secondary` | Secondary actions | Filled surface color |
| `ghost` | Subtle actions | Transparent, text only |
| `outline` | Alternative CTAs | Border only |
| `danger` | Destructive actions | Red fill/border |

**Sizes:**

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 32px | 12px 16px | 14px |
| `md` | 40px | 16px 24px | 16px |
| `lg` | 48px | 20px 32px | 18px |

**States:**
- Default
- Hover (scale 1.02, brightness +10%)
- Active (scale 0.98)
- Disabled (opacity 0.5, cursor not-allowed)
- Loading (spinner + disabled state)

**Example:**
```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<Search size={18} />}
  onClick={handleSearch}
>
  {t('search')}
</Button>
```

---

### 2.2 Input

**Location:** `src/components/ui/Input.tsx`

```typescript
interface InputProps {
  type?: 'text' | 'search' | 'email' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  'aria-label'?: string;
}
```

**States:**
- Default (border-color: border)
- Focus (border-color: primary, ring)
- Error (border-color: error)
- Disabled (opacity 0.5)

**Example:**
```tsx
<Input
  type="search"
  value={query}
  onChange={setQuery}
  placeholder={t('searchPlaceholder')}
  leftIcon={<Search size={18} />}
  clearable
  onClear={() => setQuery('')}
  aria-label={t('searchJobs')}
/>
```

---

### 2.3 Select

**Location:** `src/components/ui/Select.tsx`

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}
```

**Dropdown Behavior:**
- Opens on click or Enter/Space
- Closes on selection, Escape, or outside click
- Keyboard navigation with arrow keys
- Type-ahead search support

**Example:**
```tsx
<Select
  options={categories}
  value={selectedCategory}
  onChange={setCategory}
  placeholder={t('allCategories')}
  aria-label={t('selectCategory')}
/>
```

---

### 2.4 Badge

**Location:** `src/components/ui/Badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'vip';
  size?: 'sm' | 'md';
  className?: string;
}
```

**Variants:**

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| `default` | surface | text-secondary | General tags |
| `success` | success/10 | success | Salary shown |
| `warning` | warning/10 | warning | Deadline soon |
| `error` | error/10 | error | Expired |
| `info` | info/10 | info | Remote work |
| `vip` | primary/10 | primary | VIP jobs |

**Example:**
```tsx
<Badge variant="success" size="sm">
  <DollarSign size={12} />
  {formatSalary(job.salary_min, job.salary_max)}
</Badge>
```

---

### 2.5 Card

**Location:** `src/components/ui/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  as?: 'div' | 'article' | 'section';
}
```

**Variants:**

| Variant | Style |
|---------|-------|
| `default` | bg-surface, subtle border |
| `elevated` | bg-surface, shadow-md |
| `outlined` | transparent, prominent border |

**Example:**
```tsx
<Card variant="elevated" hoverable clickable onClick={() => navigate(`/job/${id}`)}>
  <JobCardContent job={job} />
</Card>
```

---

### 2.6 Skeleton

**Location:** `src/components/ui/Skeleton.tsx`

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;  // For text variant
  className?: string;
}
```

**Animation:** Shimmer effect using CSS gradient animation.

**Example:**
```tsx
// Job card skeleton
<Skeleton variant="text" lines={2} />
<Skeleton variant="rectangular" height={20} width="60%" />
<Skeleton variant="text" width="40%" />
```

---

### 2.7 Spinner

**Location:** `src/components/ui/Spinner.tsx`

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'inherit';
  className?: string;
}
```

**Sizes:**

| Size | Diameter |
|------|----------|
| `sm` | 16px |
| `md` | 24px |
| `lg` | 40px |

---

### 2.8 Toast

**Location:** `src/components/ui/Toast.tsx`

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;  // ms, default 4000
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Toast context hook
function useToast(): {
  show: (props: ToastProps) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}
```

**Position:** Bottom-center, stacked upward.

**Example:**
```tsx
const { show, success } = useToast();

// Usage
success(t('linkCopied'));

// Or with action
show({
  message: t('jobSaved'),
  type: 'success',
  action: {
    label: t('viewSaved'),
    onClick: () => navigate('/saved'),
  },
});
```

---

## 3. Layout Components

### 3.1 Layout

**Location:** `src/components/layout/Layout.tsx`

```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**Structure:**
```tsx
<div className="min-h-screen flex flex-col bg-background">
  <Header />
  <main className="flex-1">
    {children}
  </main>
  <Footer />
</div>
```

---

### 3.2 Header

**Location:** `src/components/layout/Header.tsx`

```typescript
interface HeaderProps {
  // No props - uses context for theme/language
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                    [Theme Toggle] [Language Switch] │
└─────────────────────────────────────────────────────────────┘
```

**Responsive:**
- Desktop: Full width, all elements visible
- Mobile: Logo centered, controls in hamburger menu (optional)

---

### 3.3 Footer

**Location:** `src/components/layout/Footer.tsx`

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  © 2026 batumi.work · [Privacy] · [Terms] · v1.0.0          │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.4 Container

**Location:** `src/components/layout/Container.tsx`

```typescript
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}
```

**Sizes:**

| Size | Max Width |
|------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px (default) |
| `full` | 100% |

---

## 4. Job Components

### 4.1 JobCard

**Location:** `src/components/job/JobCard.tsx`

```typescript
interface JobCardProps {
  job: Job;
  variant?: 'default' | 'compact';
  showSaveButton?: boolean;
  onSave?: (jobId: number) => void;
  isSaved?: boolean;
  index?: number;  // For analytics
}
```

**Variants:**

**Default (List View):**
```
┌─────────────────────────────────────────────────────────────┐
│  [Title]                                         [Save] ♡   │
│  [Company] · [Location] · [Category]                        │
│  ┌──────┐ ┌──────┐ ┌────────┐                              │
│  │ VIP  │ │Remote│ │₾2000-3K│                              │
│  └──────┘ └──────┘ └────────┘                              │
│  Posted 2 hours ago · Deadline: Feb 15                      │
└─────────────────────────────────────────────────────────────┘
```

**Compact (Saved Jobs):**
```
┌─────────────────────────────────────────────────────────────┐
│  [Title]                                [Company] [Remove]  │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 JobList

**Location:** `src/components/job/JobList.tsx`

```typescript
interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  emptyMessage?: string;
  onJobClick?: (job: Job, index: number) => void;
}
```

**Behavior:**
- Renders list of JobCard components
- Shows skeletons when loading (6 items)
- Shows EmptyState when no jobs

---

### 4.3 JobDetail

**Location:** `src/components/job/JobDetail.tsx`

```typescript
interface JobDetailProps {
  job: JobDetail;
  onShare?: (platform: string) => void;
  onSave?: () => void;
  isSaved?: boolean;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Back Button]                                              │
├─────────────────────────────────────────────────────────────┤
│  [Title]                                                    │
│  [Company] · [Location]                                     │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌────────┐                              │
│  │ VIP  │ │Remote│ │₾2000-3K│                              │
│  └──────┘ └──────┘ └────────┘                              │
├─────────────────────────────────────────────────────────────┤
│  [Job Description HTML]                                     │
├─────────────────────────────────────────────────────────────┤
│  Posted: Jan 20, 2026                                       │
│  Deadline: Feb 15, 2026                                     │
│  Source: jobs.ge                                            │
├─────────────────────────────────────────────────────────────┤
│  [Apply Button]        [Share] [Save]                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.4 JobBadges

**Location:** `src/components/job/JobBadges.tsx`

```typescript
interface JobBadgesProps {
  job: Job;
  size?: 'sm' | 'md';
}
```

Renders conditional badges:
- VIP badge (if `is_vip`)
- Remote badge (if `is_remote`)
- Salary badge (if `has_salary`)

---

### 4.5 JobMetadata

**Location:** `src/components/job/JobMetadata.tsx`

```typescript
interface JobMetadataProps {
  job: Job;
  showDeadline?: boolean;
  showSource?: boolean;
}
```

Renders:
- Company name
- Location with icon
- Category
- Published date (relative)
- Deadline (if provided)

---

### 4.6 JobDescription

**Location:** `src/components/job/JobDescription.tsx`

```typescript
interface JobDescriptionProps {
  html: string;
  language: 'ge' | 'en';
}
```

**Behavior:**
- Sanitizes HTML using DOMPurify or similar
- Applies typography styles
- Handles Georgian text properly

---

## 5. Search Components

### 5.1 SearchBar

**Location:** `src/components/search/SearchBar.tsx`

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```

**Behavior:**
- Debounced input (300ms)
- Enter key triggers search
- Clear button when has value
- Search icon

---

### 5.2 CategoryFilter

**Location:** `src/components/search/CategoryFilter.tsx`

```typescript
interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onChange: (slug: string) => void;
  isLoading?: boolean;
}
```

**Display:**
- Dropdown on mobile
- Horizontal scroll chips on desktop (optional)

---

### 5.3 RegionFilter

**Location:** `src/components/search/RegionFilter.tsx`

```typescript
interface RegionFilterProps {
  regions: Region[];
  selected: string;
  onChange: (slug: string) => void;
  isLoading?: boolean;
}
```

---

### 5.4 SalaryToggle

**Location:** `src/components/search/SalaryToggle.tsx`

```typescript
interface SalaryToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}
```

**Style:** Toggle switch or checkbox with label.

---

### 5.5 FilterBar

**Location:** `src/components/search/FilterBar.tsx`

```typescript
interface FilterBarProps {
  filters: JobFilters;
  onChange: (filters: Partial<JobFilters>) => void;
  categories: Category[];
  regions: Region[];
  isLoading?: boolean;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Search Input                              ]  [Search Btn] │
├─────────────────────────────────────────────────────────────┤
│  [Category ▼]  [Region ▼]  [☐ Show Salary Only]            │
└─────────────────────────────────────────────────────────────┘
```

**Active Filters Display:**
```
┌─────────────────────────────────────────────────────────────┐
│  Active: [IT ×] [Adjara ×] [Salary ×]           [Clear All] │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Share Components

### 6.1 ShareButtons

**Location:** `src/components/share/ShareButtons.tsx`

```typescript
interface ShareButtonsProps {
  url: string;
  title: string;
  onShare?: (platform: string) => void;
}
```

**Platforms:**
- Facebook
- Telegram
- WhatsApp
- LinkedIn
- Copy Link

---

### 6.2 CopyLinkButton

**Location:** `src/components/share/CopyLinkButton.tsx`

```typescript
interface CopyLinkButtonProps {
  url: string;
  onCopy?: () => void;
}
```

**Behavior:**
- Shows "Copy" initially
- Changes to "Copied!" with checkmark for 2s after click
- Uses Clipboard API

---

## 7. Common Components

### 7.1 Pagination

**Location:** `src/components/common/Pagination.tsx`

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingsCount?: number;  // Pages to show around current
}
```

**Structure:**
```
[ < ]  [1] [2] ... [5] [6] [7] ... [42]  [ > ]
           current ────┘
```

**Behavior:**
- Shows first, last, and surrounding pages
- Ellipsis for gaps
- Disabled state at boundaries

---

### 7.2 LanguageSwitch

**Location:** `src/components/common/LanguageSwitch.tsx`

```typescript
interface LanguageSwitchProps {
  // No props - uses i18n context
}
```

**Display:** Toggle between "GE" and "EN".

**Behavior:**
- Updates URL path (/:lang/...)
- Persists preference to localStorage
- Updates document lang attribute

---

### 7.3 ThemeToggle

**Location:** `src/components/common/ThemeToggle.tsx`

```typescript
interface ThemeToggleProps {
  // No props - uses theme store
}
```

**States:**
- Light (Sun icon)
- Dark (Moon icon)
- System (Monitor icon) - optional

---

### 7.4 EmptyState

**Location:** `src/components/common/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

### 7.5 ErrorState

**Location:** `src/components/common/ErrorState.tsx`

```typescript
interface ErrorStateProps {
  error?: Error;
  title?: string;
  description?: string;
  retry?: () => void;
}
```

---

### 7.6 LoadingState

**Location:** `src/components/common/LoadingState.tsx`

```typescript
interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}
```

---

## 8. Component Composition Examples

### 8.1 Job Listing Page

```tsx
function HomePage() {
  const { filters, setFilters } = useFilters();
  const { data: categories } = useCategories();
  const { data: regions } = useRegions();
  const { data, isLoading, error } = useJobs(filters);

  return (
    <Container>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        regions={regions}
      />

      {error && <ErrorState error={error} retry={refetch} />}

      {!error && (
        <>
          <JobList
            jobs={data?.items ?? []}
            isLoading={isLoading}
          />

          {data && data.pages > 1 && (
            <Pagination
              currentPage={filters.page ?? 1}
              totalPages={data.pages}
              onPageChange={(page) => setFilters({ page })}
            />
          )}
        </>
      )}
    </Container>
  );
}
```

### 8.2 Job Detail Page

```tsx
function JobDetailPage() {
  const { id } = useParams();
  const { data: job, isLoading, error } = useJob(Number(id));
  const { isSaved, toggleSave } = useSavedJobs();
  const { t } = useTranslation();

  if (isLoading) return <LoadingState />;
  if (error || !job) return <ErrorState title={t('jobNotFound')} />;

  return (
    <Container size="lg">
      <JobDetail
        job={job}
        isSaved={isSaved(job.id)}
        onSave={() => toggleSave(job.id)}
      />
    </Container>
  );
}
```

---

## 9. Component Testing Guidelines

### Unit Tests

Each component should have tests for:
1. Renders correctly with required props
2. Handles all variants
3. Handles all states (loading, error, empty)
4. Fires callbacks correctly
5. Keyboard accessibility

### Example Test

```tsx
describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('shows loading spinner', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('calls onClick handler', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

---

*Component library specification by UI/UX Team*
*Last updated: January 23, 2026*
