# Implementation Plan — Production-Ready IDE Prompt
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Version:** 1.0  
**Date:** June 2026  
**Purpose:** Production-ready prompt to feed into any AI IDE (Cursor, Windsurf, GitHub Copilot, Claude Dev) to rebuild or extend this project from scratch.

---

## MASTER PROMPT — Feed this to your IDE

> Copy everything below the line and paste it as your system prompt or first message in your AI IDE.

---

---

## FULL IDE PROMPT (Copy Below)

```
You are an expert full-stack developer. Build "The Groomers" — a production-ready 
Salon CRM & Loyalty Platform for a unisex salon in Nashik, India.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend:
- React 19 + Vite (initialized with: npx create-vite@latest ./ --template react)
- React Router DOM v7 for SPA routing
- Framer Motion for page transitions and micro-animations
- Vanilla CSS with custom glassmorphism design system (NO Tailwind)
- qrcode.react for QR code generation
- canvas-confetti for cashback reward animation

Backend:
- Vercel Serverless Functions (Node.js 18, ES Modules)
- Files in /api/*.js — each exports a default handler(req, res) function
- No Express — pure Vercel serverless

Database:
- Google Sheets API v4 via googleapis package
- Service Account authentication (JSON credentials from env var)
- 3 sheets: Customers, Settings, Appointments

AI:
- @anthropic-ai/sdk (Claude Sonnet) for AI campaign generation

Email:
- resend package for transactional emails

Integrations:
- Google People API v1 (OAuth2) for automatic contact sync

Deployment:
- Vercel (Hobby or Pro)
- vercel.json with rewrites: /api/* → serverless, /* → /index.html

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Theme: Premium dark glassmorphism
Primary background: #1a1a18
Secondary background: #2c2c2a
Accent/CTA: #F5A623 (gold) → hover: #d4891a
Text: #ffffff primary, #a0a09a secondary
Glass card: rgba(255,255,255,0.05) bg + blur(20px) + 1px rgba(255,255,255,0.1) border
Success: #22c55e | Error: #ef4444

Typography:
- Montserrat ExtraBold (800) for logo: "THE GROOMERS" — letter-spacing: 3px
- Montserrat Regular for tagline: "UNISEX SALON" — letter-spacing: 4px, color: #F5A623
- Inter for all UI, body, labels

Design rules:
- Every card uses glassmorphism with backdrop-filter: blur(20px)
- Every button has hover lift (translateY(-2px)) + gold box-shadow on hover
- Every section animates on scroll using Intersection Observer
- All inputs: rgba(255,255,255,0.08) background, focus: gold border + ring
- Tags: color-coded chips (New=green, Regular=blue, VIP=gold)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/
├── api/
│   ├── _lib/
│   │   ├── googleSheets.js     ← Core DB layer
│   │   ├── marketingAgent.js   ← Claude AI integration
│   │   ├── emailService.js     ← Resend email helper
│   │   └── cors.js             ← CORS headers
│   ├── auth/
│   │   └── callback.js         ← Google OAuth2 callback
│   ├── customers.js            ← Customer CRUD + loyalty
│   ├── appointments.js         ← Booking system
│   ├── campaigns.js            ← AI campaigns + email blast
│   ├── settings.js             ← Config + contacts sync
│   └── health.js               ← Health check
├── src/
│   ├── App.jsx                 ← Router
│   ├── main.jsx                ← Entry point
│   ├── pages/
│   │   ├── HomePage.jsx        ← Public landing (/)
│   │   ├── ScanPage.jsx        ← Customer scanner (/scan)
│   │   ├── BookingPage.jsx     ← Appointment booking (/book)
│   │   └── DashboardPage.jsx   ← Owner panel (/dashboard)
│   ├── components/
│   │   ├── Scanner/
│   │   │   ├── PhoneInput.jsx
│   │   │   ├── OnboardingForm.jsx
│   │   │   ├── WelcomeBack.jsx
│   │   │   ├── BillInput.jsx
│   │   │   └── CashbackReward.jsx
│   │   ├── Dashboard/
│   │   │   ├── PinGate.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CustomerTable.jsx
│   │   │   ├── AnalyticsCards.jsx
│   │   │   ├── CampaignComposer.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   └── AppointmentsTab.jsx
│   │   └── LogoBrand.jsx
│   ├── context/
│   │   ├── ScannerContext.jsx
│   │   └── DashboardContext.jsx
│   └── styles/
│       ├── globals.css
│       ├── glassmorphism.css
│       ├── animations.css
│       ├── scanner.css
│       ├── dashboard.css
│       └── appointments.css
├── public/
├── index.html
├── vite.config.js
├── vercel.json
└── package.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE SCHEMA (Google Sheets)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHEET 1: "Customers" — Columns A through P (Row 1 = headers):
  A: phone (string, 10-digit, PRIMARY KEY)
  B: name (string)
  C: email (string)
  D: instagramFollowed ("Yes"/"No")
  E: facebookFollowed ("Yes"/"No")
  F: googleReview ("Yes"/"No")
  G: cashbackAmount (number, legacy)
  H: visits (integer)
  I: firstVisit (YYYY-MM-DD)
  J: lastVisit (YYYY-MM-DD)
  K: tag ("New"/"Regular"/"VIP")
  L: billAmount (float)
  M: cashbackEarned (float)
  N: cashbackPercent (float)
  O: totalCashback (float)
  P: gender (string)

SHEET 2: "Settings" — Columns A:B (key-value, no header):
  salonName, cashbackPercent (default:5), newCustomerCashbackPercent (default:10),
  minBill (default:100), maxCashback (default:500),
  instagramUrl, facebookUrl, googleReviewUrl, whatsappNumber

SHEET 3: "Appointments" — Columns A through J (Row 1 = headers):
  A: BookingID (string, "TG" + timestamp-6digits)
  B: Name, C: Phone, D: Email, E: Service
  F: Date (YYYY-MM-DD), G: Time (HH:MM)
  H: Notes, I: Status (Pending/Confirmed/Completed/Cancelled)
  J: BookedAt (ISO datetime)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/api/customers
  GET  ?action=check&phone=9119533325
       → Looks up phone in Customers then Appointments
       → If returning: increments visits, updates tag
       → Returns: { found, isReturning, fromAppointment, customerData }
  
  GET  ?action=list&tag=VIP&search=rahul
       → Returns filtered customer list
  
  POST ?action=add    body: { phone, name, email, gender, instagramFollowed, facebookFollowed, googleReviewDone }
       → Creates new customer, syncs to Google Contacts (non-blocking)
  
  POST ?action=bill   body: { phone, billAmount }
       → Reads cashback rules from Settings, calculates cashback
       → Updates customer record
       → Returns: { cashback, billAmount, percent }
  
  POST ?action=lookup body: { phone }
       → Returns customer + increments visits
  
  POST ?action=return-visit body: { phone, googleReviewDone }
       → Updates lastVisit

/api/appointments
  POST ?action=book   body: { name, phone, email, service, date, time, notes }
       → Saves to Appointments sheet
       → Sends email to owner (OWNER_EMAIL env) and customer
       → Returns: { success, bookingId }
  
  GET  ?action=list   → Returns all appointments
  
  POST ?action=update-status  body: { bookingId, status }

/api/campaigns
  POST ?action=generate
       body: { audience, occasion, festival, customTopic, salonName }
       → Calls Claude Sonnet, returns 3 variants (Formal/Casual/Fun)
       → Falls back to templates if AI unavailable
  
  POST ?action=count-emails  body: { filter }
       → Returns count of customers with email for the filter
  
  POST ?action=send-email-campaign
       body: { message, filter, previewText }
       → Sends HTML email to filtered customer segment via Resend
       → Returns: { sent, skipped, failed }

/api/settings
  GET  ?action=get     → Returns settings + contactsConnected boolean
  POST ?action=update  body: { ...settingsFields }
  POST ?action=verify-pin  body: { pin }  → validates against DASHBOARD_PIN env
  POST ?action=sync-contacts
       → Fetches all customers, deduplicates against Google Contacts,
         creates new contacts at 300ms throttle

/api/auth/callback
  GET  ?code=OAUTH_CODE
       → Exchanges code for refresh token, stores in env or returns for manual setup

/api/health
  GET → { status: "ok" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY BUSINESS LOGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOYALTY RULES:
  - Tag = "New" on first visit (visits=1)
  - Tag = "Regular" when visits >= 2
  - Tag = "VIP" when visits >= 5 (auto-upgraded, never downgraded)
  - VIP badge shown on WelcomeBack screen
  
CASHBACK CALCULATION:
  if billAmount < settings.minBill → cashback = 0
  else:
    cashback = billAmount * (settings.cashbackPercent / 100)
    if settings.maxCashback > 0:
      cashback = Math.min(cashback, settings.maxCashback)
  customer.totalCashback += cashback

CUSTOMER CHECK PRIORITY:
  1. Check Customers sheet by exact phone match
  2. If not found, check Appointments sheet (pre-booked customer)
  3. If found in Appointments: auto-create CRM record from booking data
  4. If neither: show new customer onboarding form

GOOGLE CONTACTS SYNC:
  - Triggered automatically (non-blocking) on every new customer registration
  - Manual "Sync All" via dashboard fetches ALL customers + deduplicates
  - Dedup: load all existing contact phone numbers into a Set, skip if exists
  - Rate limit: 300ms delay between each contact creation call

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLES (required in Vercel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DASHBOARD_PIN=1234
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...full JSON...}
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=https://yourdomain.vercel.app/api/auth/callback
GOOGLE_REFRESH_TOKEN=  (auto-populated after OAuth flow)
ANTHROPIC_API_KEY=sk-ant-xxx
RESEND_API_KEY=re_xxx
OWNER_EMAIL=owner@salon.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCANNER FLOW (ScanPage + components)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

State machine (managed by ScannerContext):
  steps: 'phone' → 'onboarding' (new) OR 'welcome' (returning) → 'bill' → 'reward'

PhoneInput:
  - Large text input with +91 prefix
  - On submit: GET /api/customers?action=check&phone={phone}
  - If found=true + isReturning=true → goto 'welcome'
  - If found=true + fromAppointment=true → goto 'onboarding' (pre-filled)
  - If found=false → goto 'onboarding' (empty form)

OnboardingForm:
  - Fields: name, email, gender (radio), Instagram (toggle), Facebook (toggle), Google Review (toggle)
  - On submit: POST /api/customers?action=add
  - Then → goto 'bill'

WelcomeBack:
  - 3D CSS card flip animation (use CSS transform: rotateY)
  - Shows: customer.name, customer.visits, customer.tag, customer.totalCashback
  - Gold VIP badge if tag === 'VIP'
  - Toggle for "Did you leave a Google review today?"
  - [Continue] → goto 'bill'

BillInput:
  - Numeric input for bill amount
  - Real-time preview: "You'll earn ₹{bill * 0.05}" (use settings.cashbackPercent)
  - On submit: POST /api/customers?action=bill
  - Then → goto 'reward'

CashbackReward:
  - On mount: trigger canvas-confetti burst
  - Show: cashbackEarned amount (large, gold)
  - Show: totalCashback (running balance)
  - "Show this screen to staff" instruction text
  - [New Scan] button → reset ScannerContext → goto 'phone'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DASHBOARD FLOW (DashboardPage + components)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PinGate:
  - 4-dot indicator + numeric keypad (0-9 + backspace)
  - POST /api/settings?action=verify-pin {pin}
  - On success: localStorage.setItem('groomers_auth', '1') → show dashboard
  - On fail: shake animation, clear input, show error message

Sidebar (desktop):
  - Logo at top
  - Nav items: Customers, Campaigns, Appointments, Settings
  - Active item: gold left border indicator

CustomerTable:
  - On mount: GET /api/customers?action=list → load all customers
  - Filter chips: All / New / Regular / VIP → re-fetch with &tag= param
  - Search: client-side filter on name/phone/email
  - Table columns: Name, Phone, Visits, Tag (badge), Cashback, Last Visit

AnalyticsCards:
  - Compute from customers array (client-side):
    - Total Customers: customers.length
    - Total Cashback: sum(totalCashback)
    - New: filter(tag=New).length
    - VIP: filter(tag=VIP).length
    - Avg Visits: sum(visits) / customers.length
    - Inactive: filter(lastVisit < 30 days ago).length

CampaignComposer:
  - Dropdowns: audience (All/New/Regular/VIP/Female/Male/Inactive), occasion, festival/custom
  - [Generate] → POST /api/campaigns?action=generate → show 3 variant cards
  - Each variant: [Copy] button + [Send Email Campaign] button
  - [Send Email]: POST /api/campaigns?action=send-email-campaign
  - Show: sent count, loading state, success/error feedback

SettingsPanel:
  - Load: GET /api/settings?action=get
  - Form fields: salonName, cashbackPercent, newCustomerCashbackPercent, minBill, maxCashback
  - Social URLs: instagramUrl, facebookUrl, googleReviewUrl
  - [Save Settings]: POST /api/settings?action=update
  - QR Code: <QRCodeSVG value={`${window.location.origin}/scan`} size={200} />
  - [Download QR]: convert SVG to PNG via canvas, trigger download
  - Google Contacts: show status, [Connect] → OAuth redirect, [Sync All] → POST sync-contacts

AppointmentsTab:
  - Load: GET /api/appointments?action=list
  - Table: BookingID, Name, Phone, Service, Date, Time, Status (dropdown)
  - Status change: POST /api/appointments?action=update-status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATIONS TO IMPLEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Scanner step transitions: Framer Motion AnimatePresence with x: ±50 + opacity slide
2. WelcomeBack card: CSS perspective-based rotateY(180deg) flip on component mount
3. CashbackReward: canvas-confetti with spread:70, origin:{y:0.6} on mount
4. Home sections: Intersection Observer → CSS class toggle → translateY(0) + opacity(1)
5. Stats counter: requestAnimationFrame count-up animation when in viewport
6. PIN shake: CSS @keyframes shake on wrong PIN attempt
7. Dashboard analytics: staggered fade-in for metric cards on load
8. Button hover: all CTA buttons → transform: translateY(-2px) + box-shadow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
vercel.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/((?!api/).*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
vite.config.js (dev proxy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOOGLESHEETS.JS — CORE FUNCTIONS TO IMPLEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lookupByPhone(phone)          → { customer, rowIndex } | null
appendCustomer(data)          → boolean
updateCustomer(phone, fields) → boolean (fetches row, merges, writes back)
getAllCustomers(tagFilter?)   → Customer[]
getSettings()                 → Settings (with in-memory cache)
updateSettings(newSettings)  → boolean
saveToGoogleContacts(customer) → boolean (non-blocking safe)
saveAppointment(data)          → boolean
getAppointments()              → Appointment[]
findInAppointments(phone)      → { name, phone, email, service } | null
updateAppointmentStatus(bookingId, status) → boolean

Auth: Use google.auth.GoogleAuth with service account credentials from env var.
Parse GOOGLE_SERVICE_ACCOUNT_JSON with JSON.parse().
Lazy-init sheetsClient — create once, reuse across invocations.
Call ensureInitialized() on first use — creates Customers/Settings/Appointments sheets
and writes header rows if they don't exist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MARKETING AGENT — AI CAMPAIGN GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: claude-sonnet-4-20250514
SDK: @anthropic-ai/sdk
System prompt: "You are the The Groomers Unisex Salon Marketing Agent..."

Prompt structure:
  "Generate 3 WhatsApp campaign message variants for a salon called {salonName}.
   Target audience: {audience}
   Occasion: {occasion} - {festival}
   Return EXACTLY this JSON format:
   [
     {"style": "Formal", "text": "..."},
     {"style": "Casual", "text": "..."},
     {"style": "Fun", "text": "..."}
   ]
   Make messages appropriate for Indian audience. Include emojis.
   Keep each under 500 characters. Include a call-to-action."

Parse response with: text.match(/\[[\s\S]*\]/) then JSON.parse()
Always have fallback templates for offline/error cases.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMAIL TEMPLATE (for campaigns and booking confirmations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design:
- Background: #f1efe8 (warm cream)
- Email card: white, border-radius: 16px, box-shadow
- Header: dark #2c2c2a background, "THE GROOMERS" in white + "UNISEX SALON" in gold
- Body: Inter font, warm typography
- CTA button: dark background with gold text or border
- Footer: location, QR mention

For campaign emails:
- Personalize: replace {customerName} in message
- Convert **bold** markdown to <strong> tags
- Convert \n to <br> tags
- Send one email per customer using Resend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOYMENT CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Create Google Spreadsheet → copy Sheet ID from URL
2. Create Google Cloud Project → enable Sheets API + People API
3. Create Service Account → download JSON credentials
4. Share spreadsheet with service account email (Editor access)
5. Create OAuth2 credentials (Web Application type)
   → Add redirect URI: https://yourdomain.vercel.app/api/auth/callback
6. Set up Resend account → verify sending domain
7. Set all env vars in Vercel dashboard
8. Deploy to Vercel: `vercel --prod`
9. Visit /dashboard → complete Google OAuth to enable Contacts sync
10. Print QR code from Settings tab → place at salon counter
```

---

## Implementation Phases

### Phase 1 — Foundation (Day 1-2)
- [ ] Initialize Vite + React project
- [ ] Set up vercel.json, vite.config.js, package.json
- [ ] Create CSS design system (globals, glassmorphism, animations)
- [ ] Build LogoBrand component
- [ ] Set up React Router with all routes

### Phase 2 — Database Layer (Day 2-3)
- [ ] Implement api/_lib/googleSheets.js (all functions)
- [ ] Implement api/health.js
- [ ] Test Sheets connection + auto-initialization

### Phase 3 — Scanner Flow (Day 3-4)
- [ ] ScannerContext state machine
- [ ] PhoneInput component + API integration
- [ ] OnboardingForm component
- [ ] WelcomeBack component (3D flip)
- [ ] BillInput component
- [ ] CashbackReward component (confetti)
- [ ] ScanPage assembly

### Phase 4 — Dashboard (Day 4-6)
- [ ] PinGate component + authentication
- [ ] Sidebar navigation
- [ ] CustomerTable + search + filter
- [ ] AnalyticsCards (computed metrics)
- [ ] SettingsPanel (form + QR + contacts)
- [ ] DashboardContext + API integration
- [ ] DashboardPage assembly

### Phase 5 — Campaigns & Appointments (Day 6-8)
- [ ] api/_lib/marketingAgent.js (Claude integration)
- [ ] api/campaigns.js (generate + email blast)
- [ ] api/_lib/emailService.js (Resend)
- [ ] CampaignComposer component
- [ ] api/appointments.js
- [ ] AppointmentsTab component
- [ ] BookingPage + /book route

### Phase 6 — Landing Page (Day 8-9)
- [ ] HomePage.jsx (hero, services, stats, QR section, contact)
- [ ] HomePage.css (all animations + responsive)
- [ ] WhatsApp floating button

### Phase 7 — Google Contacts OAuth (Day 9-10)
- [ ] api/auth/callback.js OAuth handler
- [ ] api/settings.js sync-contacts action
- [ ] Settings panel OAuth connect flow

### Phase 8 — Polish & Deploy (Day 10-11)
- [ ] Mobile responsiveness audit
- [ ] Performance audit (Lighthouse)
- [ ] Set all env vars in Vercel
- [ ] Deploy + smoke test all flows
- [ ] Print and place QR code

---

## Notes for IDE

- Always use `export const maxDuration = 60` in serverless functions that may run longer than 10 seconds
- Never block the customer registration response waiting for Google Contacts sync — use fire-and-forget pattern
- Settings must always have a fallback (`getDefaultSettings()`) so the app never crashes if Sheets is unreachable
- The scanner page is customer-facing — must work flawlessly on any mobile browser with no errors shown to customers
- Dashboard PIN is checked server-side only — client-side PIN state is stored in localStorage for UX, not security
