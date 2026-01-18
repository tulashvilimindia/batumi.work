# Batumi.work - Job Board Development Plan

## Project Overview
**Site Name**: batumi.work
**Type**: Static website (Cloudflare Pages)
**Domain**: batumi.work
**Purpose**: Job listings aggregator for Batumi/Adjara region
**Data Source**: Exported JSON files from jobs.ge parser
**Stack**: HTML5, CSS, Vanilla JavaScript

---

## Work Breakdown Structure (WBS)

### Phase 1: Planning & Architecture ✅
- [x] 1.1 Define project requirements
- [x] 1.2 Create development plan (this document)
- [x] 1.3 Set up folder structure
- [x] 1.4 Copy data source files

### Phase 2: Data Preparation
- [x] 2.1 Create job category classification system (16 categories)
- [x] 2.2 Build job filtering and sorting logic
- [x] 2.3 Implement bilingual content handling (EN/GE)
- [x] 2.4 Create company index for filtering
- [x] 2.5 Optimize JSON data structure for frontend

### Phase 3: UI/UX Design
- [x] 3.1 Design header/navigation (mobile-first)
- [x] 3.2 Design hero section with search
- [x] 3.3 Design job card component
- [x] 3.4 Design job detail modal/page
- [x] 3.5 Design filter sidebar (desktop) / drawer (mobile)
- [x] 3.6 Design footer
- [x] 3.7 Create blue color scheme palette
- [x] 3.8 Design typography system

### Phase 4: Core HTML Structure
- [x] 4.1 Create index.html (main page)
- [x] 4.2 Build semantic HTML5 structure
- [x] 4.3 Add meta tags for SEO
- [x] 4.4 Add Open Graph tags
- [ ] 4.5 Add Cloudflare Pages configuration

### Phase 5: Styling (CSS)
- [x] 5.1 Create CSS variables for blue theme
- [x] 5.2 Reset and base styles
- [x] 5.3 Mobile-first responsive breakpoints
- [x] 5.4 Header/navigation styles
- [x] 5.5 Hero section styles
- [x] 5.6 Job card styles (grid layout)
- [x] 5.7 Job detail modal styles
- [x] 5.8 Filter panel styles
- [x] 5.9 Footer styles
- [x] 5.10 Loading and empty states

### Phase 6: JavaScript Functionality
- [x] 6.1 Load and parse JSON data
- [x] 6.2 Render job cards dynamically
- [x] 6.3 Implement search functionality
- [x] 6.4 Implement company filter
- [x] 6.5 Implement category filter
- [x] 6.6 Implement job detail view
- [x] 6.7 Implement bilingual toggle (EN/GE)
- [ ] 6.8 Implement URL state management
- [x] 6.9 Add loading indicators
- [x] 6.10 Add "apply" external link handling

### Phase 7: Performance & Optimization
- [ ] 7.1 Lazy load job cards
- [ ] 7.2 Implement virtual scrolling for large lists
- [ ] 7.3 Minify CSS and JS
- [ ] 7.4 Add image optimization
- [ ] 7.5 Implement service worker (optional)
- [ ] 7.6 Add meta description tags

### Phase 8: SEO & Analytics
- [ ] 8.1 Add structured data (JSON-LD)
- [ ] 8.2 Create sitemap.xml
- [ ] 8.3 Create robots.txt
- [ ] 8.4 Add Google Analytics (optional)
- [ ] 8.5 Add favicon

### Phase 9: Testing
- [ ] 9.1 Test on mobile devices
- [ ] 9.2 Test on tablet devices
- [ ] 9.3 Test on desktop browsers
- [ ] 9.4 Test all filter combinations
- [ ] 9.5 Test bilingual switching
- [ ] 9.6 Test with slow connection
- [ ] 9.7 Accessibility audit (WCAG AA)

### Phase 10: Deployment
- [ ] 10.1 Set up Cloudflare Pages project
- [ ] 10.2 Configure custom domain (batumi.work)
- [ ] 10.3 Set up automatic deployments
- [ ] 10.4 Test production deployment
- [ ] 10.5 Set up error monitoring

---

## Features Specification

### Core Features
1. **Job Listings Display**
   - Grid of job cards
   - Show job title (EN/GE)
   - Show company name
   - Show salary indicator
   - Show VIP badge if applicable
   - Show deadline
   - Show "new" badge for recent jobs

2. **Search Functionality**
   - Real-time search by title
   - Case-insensitive matching
   - Support both languages

3. **Filtering**
   - Filter by company (dropdown with autocomplete)
   - Filter by category (checkboxes)
   - Filter by salary (has salary info)
   - Filter by VIP jobs only
   - Clear all filters button

4. **Sorting**
   - Sort by: Newest first (default)
   - Sort by: Oldest first
   - Sort by: Company name
   - Sort by: Category

5. **Job Details**
   - Modal overlay with full description
   - Show bilingual content
   - Apply button linking to jobs.ge
   - Share functionality
   - Close button

6. **Bilingual Support**
   - Language toggle (EN/GE)
   - Persistent language preference
   - Auto-detect browser language

### UI/UX Design - Blue Theme

**Color Palette:**
```
Primary Blue:    #0066CC (brand)
Light Blue:      #E6F0FF (backgrounds)
Medium Blue:     #1A73E8 (accent)
Dark Blue:       #0D47A1 (text)
Border Blue:     #B3D4FC (borders)
Hover Blue:      #1976D2
Success:         #00C853
Warning:         #FFA000
Error:           #FF5252
Background:      #FFFFFF
Surface:         #F5F9FF
Text:           #212B36
Text Secondary:  #6B7280
```

**Typography:**
- Font family: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- Headings: 600-700 weight
- Body: 400 weight
- Responsive font sizes (16px-18px)

**Components:**
1. **Header**
   - Logo (batumi.work)
   - Language toggle (EN/GE)
   - Mobile menu button

2. **Hero Section**
   - Title: "Find Your Job in Batumi"
   - Subtitle: "Discover opportunities in Adjara region"
   - Search bar with icon

3. **Job Card**
   - Card layout with hover effect
   - Company logo placeholder
   - Job title (bold)
   - Company name (secondary)
   - Badges: VIP, New, Salary
   - Deadline (small, gray)
   - "View Details" button

4. **Filter Panel**
   - Sidebar on desktop
   - Bottom sheet on mobile
   - Categories list with checkboxes
   - Company dropdown
   - Sort dropdown
   - Apply/Reset buttons

5. **Job Detail Modal**
   - Full-screen on mobile
   - Centered modal on desktop
   - Close button
   - Back button
   - Content area with scrolling
   - Apply button (fixed at bottom)

---

## File Structure

```
opencodejobs/
├── index.html              # Main page
├── css/
│   ├── main.css          # Main stylesheet
│   └── variables.css     # CSS variables
├── js/
│   ├── app.js           # Main application logic
│   ├── filters.js       # Filter logic
│   └── render.js       # Rendering functions
├── data/
│   ├── jobs.json        # Processed job data
│   ├── categories.json  # Category definitions
│   └── companies.json   # Company index
├── assets/
│   ├── favicon.ico
│   └── logo.svg
├── _headers            # Cloudflare Pages headers
├── _redirects          # Cloudflare Pages redirects
└── opencode.md         # This file
```

---

## Development Status

### Current Phase: Phase 6 - JavaScript Functionality
**Last Updated**: 2026-01-18 22:20
**Next Milestone**: Complete Phase 8 (SEO & Analytics)

### Progress Tracking
- Completed: 20 tasks
- In Progress: 5 tasks
- Pending: 36 tasks
- Progress: 33%

---

## Notes & Decisions

### Design Decisions
1. Mobile-first approach for better UX on mobile devices
2. Blue color scheme matches Georgian flag colors
3. Vanilla JS to minimize dependencies and build time
4. Static JSON data for fast load times
5. Modal for job details to keep users on listing page

### Technical Decisions
1. No build process - pure static files
2. No frameworks - vanilla HTML/CSS/JS
3. Client-side filtering (faster for user, works offline)
4. Cloudflare Pages for free hosting and CDN
5. No backend required - fully static

### Future Enhancements (Out of Scope)
- User accounts and saved jobs
- Job alerts via email
- Company profiles
- Application tracking
- Resume upload
- Employer portal
- Job posting form

---

## Deployment Checklist

### Cloudflare Pages Setup
- [ ] Connect Git repository
- [ ] Set build command: `npm run build` (if needed)
- [ ] Set build output directory: `.`
- [ ] Configure custom domain: batumi.work
- [ ] Enable automatic HTTPS
- [ ] Set up environment variables (if needed)
- [ ] Configure preview deployments

### DNS Configuration
- [ ] Add A record for @ pointing to Cloudflare
- [ ] Add CNAME for www pointing to @
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate

---

## Quick Links

- Cloudflare Pages: https://pages.cloudflare.com
- Data Source: ../data/
- Parser: ../jobs_parser.py
- Live Site: https://batumi.work (when deployed)

