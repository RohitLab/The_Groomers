# Technical Requirements Document (TRD)
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Version:** 1.0  
**Date:** June 2026  
**Status:** Production

---

## 1. Tech Stack Overview

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend Framework | React | ^19.1.0 | Vite project |
| Bundler | Vite | ^8.0.10 | Dev + build tool |
| Routing | React Router DOM | ^7.14.2 | SPA routing |
| Animations | Framer Motion | ^12.38.0 | Page + component animations |
| CSS | Vanilla CSS | — | Custom glassmorphism design system |
| QR Code | qrcode.react | ^4.2.0 | SVG QR generation |
| Confetti | canvas-confetti | ^1.9.4 | Cashback reward animation |
| Backend Runtime | Node.js (Vercel Serverless) | 18.x | Serverless functions |
| AI SDK | @anthropic-ai/sdk | ^0.91.1 | Claude Sonnet campaign generation |
| Google APIs | googleapis | ^171.4.0 | Sheets v4 + People API |
| Email | resend | ^6.12.2 | Transactional email delivery |
| Analytics | @vercel/speed-insights | ^2.0.0 | Core Web Vitals tracking |
| Deployment | Vercel | — | CDN + Serverless |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE (CDN)                       │
│  React SPA (dist/)         Serverless Functions (api/)      │
│  ┌─────────────────┐       ┌──────────────────────────┐    │
│  │  / (HomePage)   │       │  /api/customers           │    │
│  │  /scan          │──────▶│  /api/appointments        │    │
│  │  /book          │       │  /api/campaigns           │    │
│  │  /dashboard     │       │  /api/settings            │    │
│  │  /business/*    │       │  /api/auth/callback       │    │
│  └─────────────────┘       │  /api/health              │    │
│                             └──────────┬─────────────┘    │
└─────────────────────────────────────────│────────────────────┘
                                          │
              ┌───────────────────────────┼────────────────┐
              │                           │                │
     ┌────────▼────────┐      ┌──────────▼──────┐  ┌──────▼──────┐
     │  Google Sheets  │      │  Anthropic API   │  │  Resend API │
     │  (Database)     │      │  (Claude Sonnet) │  │  (Email)    │
     │                 │      └─────────────────┘  └────────────┘
     │  Google People  │
     │  API (Contacts) │
     └─────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Directory Structure
```
src/
├── App.jsx                  # Root router configuration
├── main.jsx                 # React DOM entry point
├── pages/
│   ├── HomePage.jsx         # Public landing page (/)
│   ├── HomePage.css         # Landing page styles
│   ├── ScanPage.jsx         # Customer scanner (/scan)
│   ├── DashboardPage.jsx    # Owner dashboard (/dashboard)
│   ├── BookingPage.jsx      # Online booking (/book)
│   └── business/            # Business owner sub-pages
├── components/
│   ├── Scanner/             # Scanner flow components
│   │   ├── PhoneInput.jsx   # Step 1: Phone number entry
│   │   ├── OnboardingForm.jsx # Step 2: New customer form
│   │   ├── WelcomeBack.jsx  # Step 2b: Returning customer
│   │   ├── BillInput.jsx    # Step 3: Bill amount entry
│   │   └── CashbackReward.jsx # Step 4: Reward display
│   ├── Dashboard/           # Dashboard panel components
│   │   ├── PinGate.jsx      # PIN authentication gate
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── CustomerTable.jsx # Customer list + search
│   │   ├── AnalyticsCards.jsx # KPI metric cards
│   │   ├── CampaignComposer.jsx # AI campaign tool
│   │   ├── SettingsPanel.jsx # Salon settings + QR
│   │   └── AppointmentsTab.jsx # Appointment management
│   ├── business/            # Business profile components
│   └── LogoBrand.jsx        # Shared THE GROOMERS logo
├── context/
│   ├── ScannerContext.jsx   # Scanner state (step, customer data)
│   └── DashboardContext.jsx # Dashboard state (customers, settings)
├── styles/
│   ├── globals.css          # CSS variables, reset, typography
│   ├── glassmorphism.css    # Glass card utilities
│   ├── animations.css       # Keyframe animations
│   ├── dashboard.css        # Dashboard component styles
│   ├── scanner.css          # Scanner component styles
│   ├── appointments.css     # Appointments tab styles
│   └── business.css         # Business page styles
└── utils/                   # Utility functions
```

### 3.2 State Management
- **Scanner State** (`ScannerContext`): Manages multi-step flow state: `step` (phone → onboard/welcome → bill → reward), `phone`, `customerData`, `isReturning`, `cashbackData`.
- **Dashboard State** (`DashboardContext`): Manages `customers[]`, `settings{}`, `loading`, `activeTab`.
- No external state library (Redux, Zustand) — React Context is sufficient for single-owner single-user app.

### 3.3 Routing
```javascript
// App.jsx routes
/           → HomePage      (public landing page)
/scan       → ScanPage      (customer kiosk)
/book       → BookingPage   (online appointment booking)
/dashboard  → DashboardPage (owner panel — PIN protected)
/business/* → Business sub-pages
```

### 3.4 API Communication
- All API calls go to `/api/*` endpoints (proxied via Vercel rewrites in production)
- `vite.config.js` proxies `/api` → `http://localhost:3001` during local development
- All requests use native `fetch` API (no Axios)

---

## 4. Backend Architecture

### 4.1 Serverless Functions (api/)
Each file exports a default `handler(req, res)` function — Vercel Node.js runtime.

```
api/
├── _lib/
│   ├── googleSheets.js      # Core DB layer — all Sheets CRUD operations
│   ├── sheetsHelper.js      # Additional Sheets utilities
│   ├── marketingAgent.js    # Anthropic Claude integration
│   ├── emailService.js      # Resend email helper
│   └── cors.js              # CORS headers helper
├── customers.js             # Customer CRUD + loyalty logic
├── appointments.js          # Booking CRUD + email triggers
├── campaigns.js             # AI campaign generation + email blasts
├── settings.js              # Salon settings + Google Contacts sync
├── businessSettings.js      # Business profile settings
├── expenses.js              # Expense tracking
├── sales.js                 # Sales records
├── pl.js                    # P&L (profit & loss)
├── inventory.js             # Inventory management
├── health.js                # Health check endpoint
└── auth/
    └── callback.js          # Google OAuth2 callback handler
```

### 4.2 Function Timeouts
| Endpoint | Max Duration |
|---|---|
| `/api/campaigns` | 60 seconds (AI generation) |
| `/api/settings` (sync-contacts) | 60 seconds (bulk contacts write) |
| `/api/appointments` | 30 seconds |
| All others | Default (10 seconds) |

### 4.3 Loyalty Engine Logic
```
1. Phone lookup → check Customers sheet → check Appointments sheet
2. If returning customer:
   visits++
   tag = visits >= 5 ? 'VIP' : 'Regular'
   lastVisit = today
3. Bill processing:
   cashback = bill >= minBill ? (bill * cashbackPercent / 100) : 0
   cashback = Math.min(cashback, maxCashback)
   totalCashback += cashback
4. New customer:
   tag = 'New'
   visits = 1
   firstVisit = today
   → append row to Customers sheet
   → saveToGoogleContacts() [non-blocking, fire-and-forget]
```

---

## 5. Database Layer (Google Sheets)

### 5.1 Sheets Structure
The Google Spreadsheet contains 3 named worksheets:

**Customers** — Main CRM sheet  
**Settings** — Key-value config store  
**Appointments** — Booking records

### 5.2 Authentication
- Service Account JSON credentials stored in `GOOGLE_SERVICE_ACCOUNT_JSON` env var
- Scope: `https://www.googleapis.com/auth/spreadsheets`
- Client initialized lazily, cached in module scope

### 5.3 Performance Notes
- `settingsCache` — Settings fetched once per cold start, then cached in memory
- Sheets client instance cached after first init (`sheetsClient` module variable)
- `ensureInitialized()` creates sheets and headers on first run only

---

## 6. External Integrations

### 6.1 Anthropic Claude (AI)
- **SDK:** `@anthropic-ai/sdk`
- **Model:** `claude-sonnet-4-20250514`
- **Use case:** Campaign message generation
- **Prompt:** Structured JSON request → 3 variants (Formal / Casual / Fun)
- **Fallback:** Pre-written template variants if API key missing or request fails

### 6.2 Google Sheets API v4
- **Auth:** Service Account (JSON credentials)
- **Operations:** `values.get`, `values.update`, `values.append`, `spreadsheets.batchUpdate`
- **Range notation:** `SheetName!A:P` (full column range reads)

### 6.3 Google People API v1 (Contacts)
- **Auth:** OAuth2 (user-delegated, refresh token stored in env)
- **OAuth Flow:** `/api/auth/callback` → exchanges code → stores refresh token
- **Operations:** `people.connections.list` (de-dup check), `people.createContact`
- **Rate limit handling:** 300ms throttle between contact creation calls

### 6.4 Resend (Email)
- **Use cases:** Appointment booking confirmation, campaign email blasts
- **Template:** Inline HTML email with brand styling
- **Sender:** Configured via `RESEND_API_KEY`

---

## 7. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DASHBOARD_PIN` | Yes | 4-digit owner dashboard PIN (default: 1234) |
| `GOOGLE_SHEETS_ID` | Yes | Google Spreadsheet ID (from URL) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Yes | Full service account credentials JSON |
| `GOOGLE_CLIENT_ID` | Yes (OAuth) | OAuth2 client ID for Contacts |
| `GOOGLE_CLIENT_SECRET` | Yes (OAuth) | OAuth2 client secret |
| `GOOGLE_REDIRECT_URI` | Yes (OAuth) | OAuth callback URL |
| `GOOGLE_REFRESH_TOKEN` | Auto-set | Stored after owner completes OAuth |
| `ANTHROPIC_API_KEY` | Yes (AI) | Claude API key for campaigns |
| `OPENAI_API_KEY` | Optional | OpenAI fallback for campaigns |
| `RESEND_API_KEY` | Yes (Email) | Resend email service API key |
| `OWNER_EMAIL` | Yes (Email) | Email to receive booking notifications |
| `VITE_SCAN_URL` | Frontend | Public scan URL for QR generation |

---

## 8. Deployment

### 8.1 Vercel Configuration (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)",     "destination": "/index.html" }
  ],
  "headers": [
    { "source": "/assets/(.*)", "Cache-Control": "public, max-age=31536000, immutable" },
    { "source": "/((?!api/).*)", "Cache-Control": "public, max-age=0, must-revalidate" }
  ]
}
```

### 8.2 Build Process
```bash
npm run build   # Vite builds React SPA to /dist
# Vercel auto-detects:
# - Static output: /dist → CDN served
# - /api/* → Serverless functions
```

### 8.3 Local Development
```bash
npm run dev     # Vite dev server :5173 + proxy → :3001
# Note: Local serverless functions not available in this setup.
# API calls proxy to remote or mock responses in dev mode.
```

---

## 9. Security Considerations

| Concern | Mitigation |
|---|---|
| Dashboard access control | 4-digit PIN verified server-side via `/api/settings?action=verify-pin` |
| Service account credentials | Stored as Vercel env var — never exposed to client |
| OAuth refresh token | Stored as Vercel env var — never returned to frontend |
| CORS | Configured per-function via `_lib/cors.js` |
| Input validation | Phone: 10-digit enforced; bill: parseFloat validation |
| API abuse | Vercel rate limiting + function timeout protects against sustained abuse |
| No XSS risk | React's JSX escaping + no `dangerouslySetInnerHTML` in scanner flow |

---

## 10. Performance Optimizations

- **QR Code:** Lazy-loaded with `React.lazy()` — below fold, does not block LCP
- **Static assets:** Immutable cache headers (`max-age=31536000`)
- **Settings cache:** In-memory cache per cold start avoids redundant Sheets reads
- **Google Contacts sync:** Non-blocking fire-and-forget from customer registration
- **Intersection Observer:** Used for all scroll-triggered animations (no scroll event polling)
- **Image assets:** Optimized in `/public` — served directly from Vercel CDN
