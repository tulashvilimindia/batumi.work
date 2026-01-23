# Accessibility Guidelines
# jobsNGUI - WCAG 2.1 AA Compliance

**Version:** 1.0
**Date:** January 23, 2026
**Standard:** WCAG 2.1 Level AA

---

## 1. Overview

The jobsNGUI application must be accessible to all users, including those using:
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast modes
- Screen magnification
- Mobile assistive technologies

---

## 2. Perceivable

### 2.1 Text Alternatives (1.1.1)

**Requirements:**
- All non-text content must have text alternatives
- Icons with meaning must have aria-labels
- Decorative icons must be hidden from screen readers

**Implementation:**

```tsx
// Good: Icon with meaning
<button aria-label={t('save')}>
  <Heart aria-hidden="true" />
</button>

// Good: Icon with visible text
<button>
  <Search aria-hidden="true" />
  <span>{t('search')}</span>
</button>

// Good: Decorative icon
<span className="company-icon" aria-hidden="true">
  <Building />
</span>
<span>{job.company_name}</span>
```

---

### 2.2 Color Contrast (1.4.3)

**Minimum Ratios:**

| Element | Normal Text | Large Text |
|---------|-------------|------------|
| Text on background | 4.5:1 | 3:1 |
| UI components | 3:1 | 3:1 |

**Color Contrast Matrix (Light Theme):**

| Combination | Ratio | Pass |
|-------------|-------|------|
| text-primary (#111827) on background (#F9FAFB) | 15.8:1 | Yes |
| text-secondary (#4B5563) on background (#F9FAFB) | 7.5:1 | Yes |
| text-tertiary (#9CA3AF) on background (#F9FAFB) | 3.0:1 | AA Large only |
| primary (#3B82F6) on background (#F9FAFB) | 4.6:1 | Yes |

**Color Contrast Matrix (Dark Theme):**

| Combination | Ratio | Pass |
|-------------|-------|------|
| text-primary (#F9FAFB) on background (#111827) | 15.8:1 | Yes |
| text-secondary (#D1D5DB) on background (#111827) | 11.0:1 | Yes |
| text-tertiary (#6B7280) on background (#111827) | 4.6:1 | Yes |
| primary (#60A5FA) on background (#111827) | 8.1:1 | Yes |

**Never rely on color alone:**
```tsx
// Bad: Color only indicates status
<span className="text-green-500">Active</span>

// Good: Color + icon/text
<span className="text-green-500">
  <CheckCircle aria-hidden="true" />
  <span>Active</span>
</span>
```

---

### 2.3 Resize Text (1.4.4)

**Requirements:**
- Text must be resizable to 200% without loss of content
- Use relative units (rem, em) not fixed pixels

**Implementation:**
```css
/* Good: Relative units */
.text-body {
  font-size: 1rem;      /* 16px base */
  line-height: 1.5;
}

/* Avoid: Fixed pixels */
.text-body {
  font-size: 16px;      /* Won't scale */
}
```

---

### 2.4 Text Spacing (1.4.12)

**Requirements:**
Content must remain visible when user overrides:
- Line height to 1.5x font size
- Paragraph spacing to 2x font size
- Letter spacing to 0.12x font size
- Word spacing to 0.16x font size

**Implementation:**
```css
/* Allow text spacing adjustments */
.job-description {
  overflow: visible;
  /* Don't set fixed heights on text containers */
}
```

---

## 3. Operable

### 3.1 Keyboard Navigation (2.1.1)

**All interactive elements must be keyboard accessible:**

| Element | Enter | Space | Escape | Arrows |
|---------|-------|-------|--------|--------|
| Button | Activate | Activate | - | - |
| Link | Activate | - | - | - |
| Select | Open | Open | Close | Navigate |
| Modal | - | - | Close | - |
| Tab | Activate | - | - | Navigate |

**Focus Order (2.4.3):**
1. Skip link (first focusable)
2. Header controls (theme, language)
3. Main content (search, filters)
4. Job list items
5. Pagination
6. Footer

**Skip Link Implementation:**
```tsx
// In Layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  {t('skipToMain')}
</a>

// Main content
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

---

### 3.2 Focus Visible (2.4.7)

**All focusable elements must have visible focus indicator:**

```css
/* Global focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Suppress focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

**Custom Focus Rings:**
```tsx
// Tailwind example
<button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
```

---

### 3.3 Focus Trap (2.4.11)

**Modals must trap focus:**

```tsx
// Using a focus trap hook
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus within modal
  useFocusTrap(modalRef, isOpen);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

---

### 3.4 Timing (2.2.1)

**No time limits on user actions.**
- Toast notifications auto-dismiss but are not critical
- No session timeouts that lose user data

---

### 3.5 No Keyboard Traps (2.1.2)

**Users must be able to navigate away from any component:**
- Dropdowns close on Escape
- Modals close on Escape
- Focus returns to trigger element after close

---

## 4. Understandable

### 4.1 Language (3.1.1, 3.1.2)

**Document Language:**
```tsx
// In App.tsx or Layout
useEffect(() => {
  document.documentElement.lang = language; // 'ka' or 'en'
}, [language]);
```

**Language of Parts:**
```tsx
// For mixed-language content
<span lang="en">Software Developer</span>
<span lang="ka">პროგრამისტი</span>
```

**Language Codes:**
- Georgian: `ka` (ISO 639-1)
- English: `en`

---

### 4.2 Predictable Navigation (3.2.3)

**Consistent navigation across pages:**
- Header always at top with same structure
- Footer always at bottom
- Main content area consistent

**No unexpected context changes:**
```tsx
// Bad: Auto-submitting on change
<Select onChange={handleSubmit} />

// Good: Requires explicit action
<Select onChange={setCategory} />
<Button onClick={handleSubmit}>{t('apply')}</Button>
```

---

### 4.3 Error Identification (3.3.1)

**Errors must be clearly identified:**

```tsx
<Input
  value={query}
  onChange={setQuery}
  error={error}
  aria-invalid={!!error}
  aria-describedby={error ? 'search-error' : undefined}
/>
{error && (
  <span id="search-error" role="alert" className="text-error">
    {error}
  </span>
)}
```

---

### 4.4 Labels (3.3.2)

**All inputs must have labels:**

```tsx
// Visible label
<label htmlFor="search-input">{t('search')}</label>
<input id="search-input" type="search" />

// Hidden but accessible label
<input
  type="search"
  aria-label={t('searchJobs')}
  placeholder={t('searchPlaceholder')}
/>
```

---

## 5. Robust

### 5.1 Parsing (4.1.1)

**Valid HTML:**
- No duplicate IDs
- Proper nesting of elements
- Closed tags

**Validation:** Run HTML validator in CI/CD.

---

### 5.2 Name, Role, Value (4.1.2)

**ARIA Attributes:**

```tsx
// Job card as article
<article
  role="article"
  aria-labelledby={`job-title-${job.id}`}
>
  <h3 id={`job-title-${job.id}`}>{job.title}</h3>
</article>

// Save button with state
<button
  aria-pressed={isSaved}
  aria-label={isSaved ? t('unsaveJob') : t('saveJob')}
>
  <Heart fill={isSaved ? 'currentColor' : 'none'} />
</button>

// Loading state
<div
  role="status"
  aria-live="polite"
  aria-busy={isLoading}
>
  {isLoading ? <Spinner /> : content}
</div>
```

---

## 6. Component-Specific Guidelines

### 6.1 Job List

```tsx
<section aria-label={t('jobListings')}>
  <h2 className="sr-only">{t('jobListings')}</h2>

  {/* Results announcement */}
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {t('showingResults', { count: jobs.length, total })}
  </div>

  <ul role="list">
    {jobs.map((job) => (
      <li key={job.id}>
        <JobCard job={job} />
      </li>
    ))}
  </ul>
</section>
```

---

### 6.2 Pagination

```tsx
<nav aria-label={t('pagination')}>
  <ul role="list" className="flex">
    <li>
      <button
        aria-label={t('previousPage')}
        aria-disabled={currentPage === 1}
        disabled={currentPage === 1}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
    </li>

    {pages.map((page) => (
      <li key={page}>
        <button
          aria-label={t('goToPage', { page })}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      </li>
    ))}

    <li>
      <button
        aria-label={t('nextPage')}
        aria-disabled={currentPage === totalPages}
        disabled={currentPage === totalPages}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </li>
  </ul>
</nav>
```

---

### 6.3 Search Form

```tsx
<form
  role="search"
  aria-label={t('searchJobs')}
  onSubmit={handleSearch}
>
  <label htmlFor="job-search" className="sr-only">
    {t('searchLabel')}
  </label>
  <input
    id="job-search"
    type="search"
    placeholder={t('searchPlaceholder')}
    aria-describedby="search-hint"
  />
  <span id="search-hint" className="sr-only">
    {t('searchHint')}
  </span>
  <button type="submit" aria-label={t('submitSearch')}>
    <Search aria-hidden="true" />
  </button>
</form>
```

---

### 6.4 Filter Dropdowns

```tsx
<div>
  <label id="category-label">{t('category')}</label>
  <select
    aria-labelledby="category-label"
    value={selected}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">{t('allCategories')}</option>
    {categories.map((cat) => (
      <option key={cat.slug} value={cat.slug}>
        {cat.name} ({cat.job_count})
      </option>
    ))}
  </select>
</div>
```

---

### 6.5 Theme Toggle

```tsx
<button
  aria-label={t('toggleTheme')}
  aria-pressed={theme === 'dark'}
  onClick={toggleTheme}
>
  {theme === 'dark' ? (
    <Sun aria-hidden="true" />
  ) : (
    <Moon aria-hidden="true" />
  )}
</button>
```

---

### 6.6 Language Switch

```tsx
<div role="radiogroup" aria-label={t('selectLanguage')}>
  <button
    role="radio"
    aria-checked={language === 'ge'}
    onClick={() => setLanguage('ge')}
  >
    GE
  </button>
  <button
    role="radio"
    aria-checked={language === 'en'}
    onClick={() => setLanguage('en')}
  >
    EN
  </button>
</div>
```

---

## 7. Announcements & Live Regions

### 7.1 Search Results

```tsx
// Announce search results
<div aria-live="polite" className="sr-only">
  {isLoading
    ? t('searching')
    : t('foundJobs', { count: total })
  }
</div>
```

---

### 7.2 Save Confirmation

```tsx
const { success } = useToast();

const handleSave = () => {
  toggleSave(job.id);
  success(isSaved ? t('jobRemoved') : t('jobSaved'));
  // Toast component uses role="status" aria-live="polite"
};
```

---

### 7.3 Error Messages

```tsx
// Error announcements
<div role="alert" aria-live="assertive">
  {error && t('errorLoading')}
</div>
```

---

## 8. Testing Checklist

### Manual Testing

- [ ] Navigate entire page using only keyboard (Tab, Enter, Space, Escape, Arrows)
- [ ] Test with NVDA/VoiceOver screen reader
- [ ] Verify focus is never lost
- [ ] Check all images have alt text or are hidden
- [ ] Verify color contrast in both themes
- [ ] Test with 200% browser zoom
- [ ] Test with reduced motion preference
- [ ] Verify language announcements

### Automated Testing

```bash
# axe-core integration
npm install -D @axe-core/react

# ESLint accessibility plugin
npm install -D eslint-plugin-jsx-a11y
```

**.eslintrc:**
```json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ]
}
```

**Component Test:**
```tsx
import { axe } from 'jest-axe';

test('JobCard has no accessibility violations', async () => {
  const { container } = render(<JobCard job={mockJob} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 9. Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**In Tailwind:**
```tsx
<div className="transition-transform motion-reduce:transition-none">
```

---

## 10. Georgian Language Considerations

### Text Direction
Georgian uses left-to-right (LTR), same as English.

### Font Support
```css
font-family: 'Noto Sans Georgian', 'Inter', system-ui, sans-serif;
```

### Character Encoding
```html
<meta charset="UTF-8">
```

### Line Height
Georgian text may require slightly more line-height due to character complexity:
```css
.georgian-text {
  line-height: 1.6;
}
```

---

## 11. Mobile Accessibility

### Touch Targets (WCAG 2.5.5)
Minimum touch target: 44x44 pixels

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### Orientation (WCAG 1.3.4)
Support both portrait and landscape orientations.

### Input Purposes (WCAG 1.3.5)
Use appropriate autocomplete attributes:
```tsx
<input
  type="search"
  autoComplete="off"  // or specific values
  inputMode="search"
/>
```

---

*Accessibility guidelines maintained by UI/UX Team*
*Last updated: January 23, 2026*
