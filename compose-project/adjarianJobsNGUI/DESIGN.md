# აჭარული სამუშაოები - Adjarian Folk UI Design System

## Vision
A warm, welcoming job board inspired by Adjarian folk culture, traditional patterns, and the hospitality of Batumi and Adjara region. Features traditional color palette, folk motifs, and ambient Georgian music that auto-plays to create an immersive cultural experience.

---

## Cultural Inspiration

### Adjarian Heritage
- **Gandagana Dance** - Cheerful, playful folk dance from Adjara
- **Khorumi** - Traditional war dance showing courage and bravery
- **Acharuli** - Bright dance with red costumes and playful flirtation
- **Adjarian Khachapuri** - The iconic boat-shaped cheese bread with egg
- **Chokha** - Traditional costume with distinctive regional patterns
- **Black Sea Coast** - Maritime influences from beautiful Batumi
- **Mountain Villages** - Folk traditions preserved through generations
- **Hospitality** - "სტუმარი ღვთისგან მოვლინებულია" (A guest is sent by God)

### Musical Heritage
- Georgian polyphonic singing (UNESCO Intangible Heritage)
- Chonguri and Panduri (string instruments)
- Salamuri (wind instrument)
- Chiponi (Adjarian bagpipe)
- Krimanchuli singing style with high laryngeal register

---

## Progress Tracking

### Phase 1: Foundation & Color System ✅
- [x] Create design document
- [x] Define folk color palette
- [x] Create CSS variables and theme
- [x] Implement warm gradient backgrounds
- [x] Add traditional pattern overlays
- [x] Configure Tailwind with folk colors

### Phase 2: Music Player ✅
- [x] Create MusicPlayer component
- [x] Add autoplay functionality
- [x] Implement volume control
- [x] Style with folk elements
- [x] Add local storage preference

### Phase 3: Core Components ✅
- [x] Warm header with folk patterns
- [x] Traditional styled logo
- [x] JobTable with wood-grain effects
- [x] JobRow with warm hover effects
- [x] Folk Badge variants
- [x] Footer with cultural elements

### Phase 4: UI Components ✅
- [x] Search with traditional styling
- [x] Pagination with folk buttons
- [x] Select with warm dropdown
- [x] Buttons with embroidery-style
- [x] Toggle switches with folk colors

### Phase 5: Pages & Polish ✅
- [x] HomePage with cultural welcome
- [x] 404 page with folk humor
- [x] Saved jobs with bookmark styling
- [x] Loading states with folk animations

---

## Color Palette

### Primary Folk Colors
```
--folk-red: #8B2635          /* Traditional costume red - Acharuli dance */
--folk-red-light: #A83C4B    /* Lighter accent red */
--folk-red-dark: #6B1D29     /* Deep burgundy */
--folk-brown: #6B4423        /* Wooden architecture */
--folk-cream: #F5E6D3        /* Natural fabric/wool */
--folk-green: #2D5A3D        /* Mountain forests */
--folk-gold: #D4A574         /* Warmth and hospitality */
--folk-walnut: #3D2914       /* Dark wood, traditional furniture */
--folk-terracotta: #C4785A   /* Clay pottery */
--folk-honey: #E8B86D        /* Adjarian honey */
```

### Background Colors
```
--bg-warm: #FDF8F3           /* Warm off-white, like sunlight */
--bg-cream: #F5E6D3          /* Cream paper, aged parchment */
--bg-card: #FFFAF5           /* Card background, clean warmth */
--bg-wood: #4A3728           /* Dark wood panels */
--bg-pattern: #FAF0E4        /* Pattern overlay base */
```

### Accent Colors (Nature-inspired)
```
--sea-blue: #2E6B8A          /* Black Sea waters */
--mountain-mist: #8FA4A9     /* Caucasus mountain mist */
--sunset-orange: #E07B4C     /* Batumi sunset */
--vine-green: #4A7C4E        /* Grape vines */
--sky-light: #B8D4E3         /* Adjarian sky */
```

---

## Typography

### Font Stack
```css
/* Georgian-friendly fonts */
--font-heading: 'Playfair Display', 'Noto Serif Georgian', Georgia, serif;
--font-body: 'Source Sans Pro', 'Noto Sans Georgian', -apple-system, sans-serif;
--font-decorative: 'Cormorant Garamond', serif;
```

### Folk Text Styling
```css
.folk-heading {
  font-family: var(--font-heading);
  color: var(--folk-walnut);
  text-shadow: 1px 1px 2px rgba(61, 41, 20, 0.1);
  letter-spacing: 0.02em;
}

.folk-body {
  font-family: var(--font-body);
  color: var(--folk-brown);
  line-height: 1.7;
}
```

---

## Design Elements

### Traditional Patterns
- Geometric embroidery motifs (cross-stitch style)
- Wave patterns (Black Sea inspiration)
- Mountain silhouettes (Caucasus range)
- Grape vine decorations (wine culture)
- Traditional carpet/rug patterns
- Sun motifs (warmth and hospitality)

### Card Styling
```css
.folk-card {
  background: var(--bg-card);
  border: 2px solid var(--folk-brown);
  border-radius: 8px;
  box-shadow:
    4px 4px 0 var(--folk-brown),
    inset 0 0 20px rgba(245, 230, 211, 0.5);
  transition: all 0.2s ease;
}

.folk-card:hover {
  transform: translate(-2px, -2px);
  box-shadow:
    6px 6px 0 var(--folk-brown),
    inset 0 0 30px rgba(245, 230, 211, 0.7);
}
```

### Button Styling
```css
.folk-button {
  background: linear-gradient(135deg, var(--folk-red), var(--folk-red-light));
  border: 2px solid var(--folk-walnut);
  border-radius: 6px;
  box-shadow: 3px 3px 0 var(--folk-walnut);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.folk-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--folk-walnut);
}

.folk-button:active {
  transform: translate(0, 0);
  box-shadow: 2px 2px 0 var(--folk-walnut);
}
```

---

## Music Player Design

### Features
- Floating player in bottom-right corner
- Autoplay traditional Georgian/Adjarian music
- Volume control with mute toggle
- Minimized/expanded states
- Track info display
- Respects user preference (localStorage)
- Graceful handling of autoplay restrictions

### Visual Style
```css
.music-player {
  background: linear-gradient(135deg, var(--folk-walnut), var(--bg-wood));
  border: 3px solid var(--folk-gold);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(61, 41, 20, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}
```

### Music Sources
- Georgian State Folk Song and Dance Ensemble
- Traditional Adjarian folk songs
- Polyphonic choir recordings

---

## Animations

### Warm Pulse
```css
@keyframes warm-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(212, 165, 116, 0.3);
  }
  50% {
    box-shadow: 0 0 35px rgba(212, 165, 116, 0.5);
  }
}
```

### Folk Shimmer
```css
@keyframes folk-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.folk-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-cream) 0%,
    var(--folk-gold) 50%,
    var(--bg-cream) 100%
  );
  background-size: 200% 100%;
  animation: folk-shimmer 2s ease-in-out infinite;
}
```

### Gentle Float
```css
@keyframes gentle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Color System | ✅ | Folk palette implemented |
| Music Player | ✅ | Autoplay with consent prompt |
| Header | ✅ | Folk patterns, Georgian text |
| Footer | ✅ | Cultural proverb, warm styling |
| Layout | ✅ | Warm background, corner decorations |
| JobTable | ✅ | Wood-grain effects, corner accents |
| JobRow | ✅ | Warm hover effects |
| Badge | ✅ | Folk color variants |
| Button | ✅ | Embroidery-style with shadows |
| Search | ✅ | Traditional warm styling |
| Select | ✅ | Warm dropdown styling |
| Pagination | ✅ | Folk buttons with hover |
| Spinner | ✅ | Traditional colors |
| Skeleton | ✅ | Warm shimmer effect |
| FilterBar | ✅ | Carpet-style corners |
| Pages | ✅ | HomePage, NotFoundPage styled |

---

## Cultural Notes

### გამარჯობა! (Hello!)
The Adjarian greeting sets the tone for the entire experience. The UI should feel like entering a traditional Adjarian home - warm, welcoming, and filled with the aroma of fresh khachapuri and the sounds of folk music.

### Design Philosophy
1. **Warmth over coldness** - Earthy tones, soft shadows
2. **Tradition over trend** - Classic patterns, timeless aesthetics
3. **Hospitality over efficiency** - Inviting interactions, pleasant surprises
4. **Nature over artificial** - Organic shapes, natural textures

### აჭარა გელოდებათ!
*(Adjara awaits you!)*

---

*Last Updated: All Phases Complete - v4 Adjarian Folk Edition*
