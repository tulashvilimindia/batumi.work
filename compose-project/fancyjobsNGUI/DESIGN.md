# FANCY JOBS - Cyberpunk Neon UI Design System

## Vision
A futuristic, cyberpunk-inspired job board with neon lighting effects, glassmorphism, and immersive animations. Think Blade Runner meets modern web design.

---

## Progress Tracking

### Phase 1: Foundation & Color System ✅
- [x] Create design document
- [x] Define neon color palette (pink, cyan, purple, green, orange, yellow)
- [x] Create CSS variables and theme (themes.css rewritten)
- [x] Implement gradient backgrounds with grid overlay
- [x] Add scan line animation effect
- [x] Configure Tailwind with neon colors and custom fonts

### Phase 2: Core Components ✅
- [x] Glassmorphic header with neon borders & corner accents
- [x] Neon glow Telegram button
- [x] Cyber-styled logo with gradient
- [x] JobTable with glassmorphism & neon borders
- [x] JobRow with hover glow effects
- [x] Neon Badge component with glow
- [x] Cyberpunk Footer with social links

### Phase 3: UI Components ✅
- [x] SearchInput with animated neon border
- [x] Pagination with neon buttons & gradient active state
- [x] Select dropdown with neon glow effects
- [x] Button variants (neon-cyan, neon-pink, neon-purple)
- [x] SalaryToggle with neon checkbox
- [x] FilterBar with glassmorphic container

### Phase 4: Feedback Components ✅
- [x] Spinner with neon glow animation
- [x] Skeleton with neon shimmer effect
- [x] LoadingState with gradient spinner
- [x] EmptyState with neon icon container
- [x] ErrorState with warning glow effects

### Phase 5: Detail Views ✅
- [x] JobDetail with full cyberpunk styling
- [x] JobMetadata with neon icon colors
- [x] Neon dividers and section styling
- [x] VIP indicator with golden glow

### Phase 6: Polish & Enhancements 🔄
- [ ] Animated aurora/particle background
- [ ] Floating elements with parallax
- [ ] Button ripple effects
- [ ] Smooth page transitions
- [ ] Loading skeletons with neon pulse

---

## Color Palette

### Primary Neon Colors
```
--neon-pink: #FF006E
--neon-cyan: #00F5FF
--neon-purple: #8B5CF6
--neon-green: #39FF14
--neon-orange: #FF6B35
--neon-yellow: #FFE600
```

### Background Colors
```
--bg-dark: #0a0a0f
--bg-darker: #050508
--bg-card: rgba(15, 15, 25, 0.8)
--bg-glass: rgba(255, 255, 255, 0.05)
```

### Gradients
```
--gradient-aurora: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)
--gradient-cyber: linear-gradient(135deg, #00F5FF 0%, #FF006E 50%, #8B5CF6 100%)
--gradient-neon: linear-gradient(90deg, #FF006E, #00F5FF, #39FF14)
```

---

## Typography

### Font Stack
- Headlines: 'Orbitron', 'Rajdhani', sans-serif (futuristic)
- Body: 'Inter', 'Roboto', sans-serif (readable)
- Code/Tech: 'JetBrains Mono', monospace

### Neon Text Effects
```css
.neon-text {
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor;
}
```

---

## Component Styles

### Glassmorphic Card
```css
.glass-card {
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow:
    0 0 20px rgba(0, 245, 255, 0.1),
    inset 0 0 60px rgba(255, 255, 255, 0.02);
}
```

### Neon Border
```css
.neon-border {
  border: 2px solid transparent;
  background: linear-gradient(var(--bg-card), var(--bg-card)) padding-box,
              linear-gradient(135deg, #FF006E, #00F5FF, #8B5CF6) border-box;
}
```

### Glow Button
```css
.glow-button {
  background: linear-gradient(135deg, #FF006E, #8B5CF6);
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
  transition: all 0.3s ease;
}
.glow-button:hover {
  box-shadow: 0 0 40px rgba(255, 0, 110, 0.8);
  transform: translateY(-2px);
}
```

---

## Animations

### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 245, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 245, 255, 0.6); }
}
```

### Neon Flicker
```css
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #FF006E;
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
}
```

### Border Flow
```css
@keyframes border-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Shimmer
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Color System | ✅ DONE | Full neon palette implemented |
| Background | ✅ DONE | Grid overlay + scan lines |
| Header | ✅ DONE | Neon logo, corner accents |
| Footer | ✅ DONE | Social links with glow |
| JobTable | ✅ DONE | Glassmorphic container |
| JobRow | ✅ DONE | Hover effects, VIP glow |
| Badge | ✅ DONE | All neon variants |
| Search | ✅ DONE | Animated border |
| Pagination | ✅ DONE | Neon buttons |
| Select | ✅ DONE | Glowing dropdown |
| Button | ✅ DONE | Neon variants |
| FilterBar | ✅ DONE | Glassmorphic panel |
| SalaryToggle | ✅ DONE | Neon checkbox |
| Spinner | ✅ DONE | Neon glow animation |
| Skeleton | ✅ DONE | Neon shimmer |
| LoadingState | ✅ DONE | Gradient spinner |
| EmptyState | ✅ DONE | Neon icon container |
| ErrorState | ✅ DONE | Warning glow |
| JobDetail | ✅ DONE | Full cyberpunk styling |
| JobMetadata | ✅ DONE | Neon icon colors |

---

## Files Modified

### Core Styles
- `src/styles/themes.css` - Complete cyberpunk theme
- `tailwind.config.js` - Neon colors, fonts, animations

### Layout Components
- `src/components/layout/Header.tsx` - Cyberpunk header
- `src/components/layout/Footer.tsx` - Neon footer

### Job Components
- `src/components/job/JobTable.tsx` - Glassmorphic table
- `src/components/job/JobRow.tsx` - Hover glow effects
- `src/components/job/JobDetail.tsx` - Full detail view
- `src/components/job/JobMetadata.tsx` - Neon metadata grid
- `src/components/job/FilterBar.tsx` - Glassmorphic panel
- `src/components/job/SalaryToggle.tsx` - Neon checkbox

### UI Components
- `src/components/ui/Badge.tsx` - Neon glow variants
- `src/components/ui/Button.tsx` - Neon button variants
- `src/components/ui/Select.tsx` - Glowing dropdown
- `src/components/ui/SearchInput.tsx` - Animated border
- `src/components/ui/Pagination.tsx` - Neon buttons
- `src/components/ui/Spinner.tsx` - Neon spinner
- `src/components/ui/Skeleton.tsx` - Shimmer effect
- `src/components/ui/LoadingState.tsx` - Loading variants
- `src/components/ui/EmptyState.tsx` - Empty display
- `src/components/ui/ErrorState.tsx` - Error display

---

*Last Updated: Phase 5 Complete - All core components styled*
