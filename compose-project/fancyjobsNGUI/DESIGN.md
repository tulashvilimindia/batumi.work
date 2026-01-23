# FANCY JOBS - Cyberpunk Neon UI Design System

## Vision
A futuristic, cyberpunk-inspired job board with neon lighting effects, glassmorphism, and immersive animations. Think Blade Runner meets modern web design.

---

## Progress Tracking

### Phase 1: Foundation & Color System
- [x] Create design document
- [x] Define neon color palette (pink, cyan, purple, green, orange, yellow)
- [x] Create CSS variables and theme (themes.css rewritten)
- [x] Implement gradient backgrounds with grid overlay
- [x] Add scan line animation effect

### Phase 2: Core Components
- [x] Glassmorphic header with neon borders & corner accents
- [x] Neon glow Telegram button
- [x] Cyber-styled logo with gradient
- [x] JobTable with glassmorphism & neon borders
- [x] JobRow with hover glow effects
- [x] Neon Badge component with glow
- [x] Cyberpunk Footer with social links

### Phase 3: Advanced Effects
- [ ] Animated aurora/particle background
- [ ] Hover glow effects
- [ ] Neon text shadows
- [ ] Floating elements with parallax

### Phase 4: Page Layouts
- [ ] Cyberpunk header with animated logo
- [ ] Job cards with holographic effect
- [ ] Neon pagination
- [ ] Glowing footer

### Phase 5: Micro-interactions
- [ ] Button ripple effects
- [ ] Card hover animations
- [ ] Loading skeletons with neon pulse
- [ ] Smooth page transitions

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

### Float Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Color System | IN PROGRESS | Setting up CSS variables |
| Background | PENDING | Aurora particle effect |
| Header | PENDING | Neon logo animation |
| Job Cards | PENDING | Glassmorphic with glow |
| Buttons | PENDING | Gradient + glow |
| Search | PENDING | Animated border |
| Pagination | PENDING | Neon style |

---

*Last Updated: Starting implementation...*
