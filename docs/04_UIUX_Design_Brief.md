# UI/UX Design Brief
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Version:** 1.0  
**Date:** June 2026

---

## 1. Design Philosophy

The Groomers UI is built on three pillars:

1. **Premium Glassmorphism** — Dark-themed, frosted-glass cards that feel luxurious and modern
2. **Micro-animation First** — Every interaction is animated: transitions, reveals, confetti, flips
3. **Effortless Flow** — The scanner flow must be completable by any customer in under 60 seconds with zero instruction

---

## 2. Brand Identity

### 2.1 Typography
| Use | Font | Weight | Notes |
|---|---|---|---|
| Logo / Brand name | Montserrat | 800 ExtraBold | Letter-spacing: 3px, ALL CAPS |
| Tagline | Montserrat | 400 | Letter-spacing: 4px, ALL CAPS |
| Headings (H1–H2) | Inter | 700–800 | |
| Body text | Inter | 400 | |
| Labels / UI | Inter | 500–600 | |
| Numbers / Stats | Montserrat | 700 | Monospaced feel |

### 2.2 Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#1a1a18` | Main background |
| `--bg-secondary` | `#2c2c2a` | Card backgrounds |
| `--accent-gold` | `#F5A623` | Primary CTA, highlights, logo accent |
| `--accent-gold-dark` | `#d4891a` | Hover states for gold |
| `--text-primary` | `#ffffff` | Headings on dark |
| `--text-secondary` | `#a0a09a` | Subtitles, labels |
| `--glass-bg` | `rgba(255,255,255,0.05)` | Glass card fill |
| `--glass-border` | `rgba(255,255,255,0.1)` | Glass card border |
| `--glass-blur` | `20px` | Backdrop blur |
| `--success` | `#22c55e` | Cashback earned, success states |
| `--error` | `#ef4444` | Validation errors |
| `--vip-gradient` | `#F5A623 → #d4891a` | VIP badge, premium elements |
| `--text-light` | `#f1efe8` | Light cream for email templates |

### 2.3 Logo Treatment
```
THE GROOMERS
  UNISEX SALON
```
- "THE GROOMERS" — Montserrat ExtraBold, white, letter-spacing 3px
- "UNISEX SALON" — Montserrat Regular, gold (#F5A623), letter-spacing 4px
- No icon/logomark — pure text-based brand identity

---

## 3. Design System

### 3.1 Glassmorphism Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 3.2 Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #F5A623, #d4891a);
  color: white;
  border-radius: 12px;
  padding: 14px 32px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(245, 166, 35, 0.4);
}
```

### 3.3 Input Fields
```css
.glass-input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  padding: 14px 16px;
}
.glass-input:focus {
  border-color: #F5A623;
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.15);
}
```

### 3.4 Tag / Badge System
| Tag | Color | Background |
|---|---|---|
| New | #22c55e (green) | rgba(34,197,94,0.15) |
| Regular | #3b82f6 (blue) | rgba(59,130,246,0.15) |
| VIP | #F5A623 (gold) | rgba(245,166,35,0.15) |
| Pending | #f59e0b | rgba(245,158,11,0.15) |
| Confirmed | #22c55e | rgba(34,197,94,0.15) |
| Cancelled | #ef4444 | rgba(239,68,68,0.15) |

---

## 4. Page-by-Page Design Specs

### 4.1 Home Page (`/`)
- **Background:** Dark (`#1a1a18`) with animated particle/geometric background elements
- **Hero:** Full viewport height, centered text with fade-in animation
  - Tagline animated word-by-word
  - Two CTAs: [Book Appointment] (gold) + [Our Services] (ghost/outline)
- **Navbar:** Transparent → blurred glass on scroll; hamburger on mobile
- **Sections:** Each section animates in on scroll (Intersection Observer, `translateY + opacity`)
- **Floating WhatsApp button:** Fixed bottom-right, gold, circle, hides when contact section is in view
- **Services grid:** 2×2 or 4-column card layout with hover lift effect
- **QR section:** Centered QR code with glass card, scan instruction copy

### 4.2 Scanner Page (`/scan`)
- **Background:** Dark gradient + animated floating particles
- **Layout:** Single centered card (max-width: 420px) — optimized for one-hand mobile use
- **Step indicator:** Dots or progress indicator at top
- **Transitions:** Framer Motion `AnimatePresence` — slide left/right between steps
- **PhoneInput:**
  - Large phone number input with +91 prefix chip
  - Number pad friendly (input type="tel")
  - Gold submit button
- **OnboardingForm:**
  - Multi-field stacked form
  - Toggle switches for Instagram/Facebook/Google review (green when active)
  - Progress preserved if back button used
- **WelcomeBack:**
  - 3D card flip animation (CSS perspective transform)
  - Front: logo/loading → Back: customer profile card
  - Gold VIP badge if visits >= 5
  - Cashback balance prominently displayed
- **BillInput:**
  - Large numeric input for bill amount
  - Real-time preview: "You'll earn ₹X cashback"
  - Gold Calculate button
- **CashbackReward:**
  - Full-card confetti explosion (canvas-confetti)
  - Green success icon + earned amount (large)
  - Total balance shown
  - "Show to staff" instruction
  - [Done / New Scan] button

### 4.3 Dashboard Page (`/dashboard`)
- **Layout:** Fixed sidebar (left, 240px) + main content area
- **Sidebar:** Glass background, logo at top, icon+label nav items, active indicator (gold left border)
- **Mobile:** Sidebar collapses to bottom tab bar or hamburger
- **PinGate:**
  - Full-screen overlay
  - 4-dot PIN indicator at top
  - Numeric keypad grid (3×4)
  - Backspace key
  - Shake animation on wrong PIN
- **CustomerTable:**
  - Filter chips row (pill shaped): All / New / Regular / VIP
  - Search bar with glass styling
  - Table with alternating row backgrounds
  - Tag badges colored per type (see tag system above)
  - Sort indicators on column headers
- **AnalyticsCards:**
  - 3-column grid (responsive 2-col on tablet, 1-col on mobile)
  - Each card: icon + metric value (large) + label (small) + subtle trend indicator
  - Gold accent color on primary metrics
- **CampaignComposer:**
  - Two-panel: left (inputs) + right (generated variants)
  - Dropdown selectors styled with glass
  - [Generate] button — loading spinner while AI processes
  - Variant cards: Formal / Casual / Fun tabs
  - [Copy] + [Send Email] buttons per variant
- **SettingsPanel:**
  - Form sections with labeled groups
  - Inline number inputs for percentages and amounts
  - Toggle switches for boolean settings
  - [Save Settings] button (gold)
  - QR code section: large QR + [Download] button
  - Contacts section: connection status dot (green/red) + action button

### 4.4 Booking Page (`/book`)
- **Layout:** Full page form, centered (max-width: 560px)
- **Background:** Same dark gradient as home page
- **Form card:** Glass card with generous padding
- **Service selector:** Custom styled dropdown with service list
- **Date/Time:** Native date and time inputs styled to match design system
- **Submit button:** Full-width gold button
- **Success state:** Animated checkmark + booking ID display

---

## 5. Animation Inventory

| Animation | Component | Trigger | Duration |
|---|---|---|---|
| Particle float | HomePage hero | Page load | Continuous |
| Word fade-in | Hero headline | Page load | 0.8s stagger |
| Section slide-up | All sections | Scroll into view | 0.6s ease-out |
| Counter count-up | Stats section | Scroll into view | 1.5s linear |
| Scanner step slide | All scanner steps | Step change | 0.35s ease |
| 3D card flip | WelcomeBack | Customer found | 0.6s |
| Confetti burst | CashbackReward | Step loads | 1s |
| PIN shake | PinGate | Wrong PIN | 0.4s |
| Cashback pulse | CashbackReward amount | Confetti | 0.5s |
| Tab underline | Dashboard tabs | Tab change | 0.2s |
| Filter chip active | CustomerTable | Click | 0.15s |
| Card hover lift | Service cards | Hover | 0.2s |
| Button press | All buttons | Click | 0.1s scale |
| Input focus glow | All inputs | Focus | 0.2s |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Changes |
|---|---|---|
| Mobile | < 640px | Scanner: full-width card; Dashboard: bottom tabs; Sidebar: hidden |
| Tablet | 640–1024px | Analytics: 2-col grid; Sidebar: icons only |
| Desktop | > 1024px | Full layout with sidebar and multi-column grids |

---

## 7. Accessibility Notes

- All interactive elements have clear focus states (gold ring)
- Color alone never conveys meaning (tags use both color + text label)
- Scanner page uses large touch targets (min 48×48px) for kiosk use
- PIN keypad buttons are large and well-spaced for all thumb sizes
- Confetti is CSS/canvas only — does not affect keyboard navigation

---

## 8. Email Template Design

- **Background:** `#f1efe8` (warm cream) — stands out in inbox dark mode
- **Card:** White (`#ffffff`), `border-radius: 16px`, `box-shadow`
- **Header:** Dark (`#2c2c2a`) with "THE GROOMERS / UNISEX SALON" centered
- **Accent:** Gold `#F5A623` for service name, highlights
- **Body font:** Inter / Arial fallback
- **CTA button:** Dark background with gold text
- **Footer:** Minimal — salon location, QR mention
