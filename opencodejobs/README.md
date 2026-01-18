# Batumi.work - Static Job Board

## Overview
A static job board for Batumi and Adjara region, built with vanilla HTML5, CSS, and JavaScript. Optimized for Cloudflare Pages deployment.

## Features
- ✅ Bilingual support (English/Georgian)
- ✅ Mobile-first responsive design
- ✅ Real-time search functionality
- ✅ Filter by category (16 categories)
- ✅ Filter by company
- ✅ Filter by salary (has salary info)
- ✅ Filter by VIP jobs only
- ✅ Sort by newest/oldest/company
- ✅ Job detail modal with full description
- ✅ Blue color scheme
- ✅ SEO optimized (meta tags, sitemap, robots.txt)
- ✅ Fast loading with client-side filtering

## Tech Stack
- HTML5
- CSS3 (CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- No build process required
- No frameworks

## Deployment

### Cloudflare Pages
1. Push this folder to GitHub
2. Connect repository to Cloudflare Pages
3. Build command: (none - static files)
4. Build output directory: `.`
5. Deploy

### Custom Domain
Configure `batumi.work` to point to Cloudflare Pages:
- CNAME `www` → `[your-cloudflare-pages-domain].pages.dev`
- CNAME `@` → `[your-cloudflare-pages-domain].pages.dev`

## File Structure
```
/
├── index.html          # Main HTML page
├── css/
│   └── main.css      # Complete stylesheet
├── js/
│   └── app.js         # JavaScript application logic
├── data/
│   └── *.json        # Job data from parser
├── sitemap.xml        # SEO sitemap
├── robots.txt         # SEO robots file
└── _headers           # HTTP security headers
```

## Data Update
To update job listings:
1. Run the parser: `python jobs_parser.py --export-all`
2. Copy the new JSON file to `data/` folder
3. Update the filename in `js/app.js` (line ~20)
4. Commit and deploy

## Customization

### Colors
Edit CSS variables in `css/main.css`:
```css
:root {
    --primary-blue: #0066CC;
    --light-blue: #E6F0FF;
    --dark-blue: #0D47A1;
}
```

### Categories
Edit categories in `js/app.js` (line ~85):
```javascript
const categories = {
    'IT/Programming': ['developer', 'programmer', ...],
    'Sales/Procurement': ['sales', 'buyer', ...],
    ...
};
```

## Performance
- Static files - no server processing
- Client-side filtering - instant results
- Lazy loading of job cards
- Optimized CSS
- Gzip compression via Cloudflare CDN

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License
Open source - Use freely for your job board projects.
