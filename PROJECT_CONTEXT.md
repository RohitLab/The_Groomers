# Project Understanding: The Groomers Unisex Salon CRM

This document provides a comprehensive overview of **The Groomers** project, a premium CRM and loyalty system designed for a unisex salon.

---

## 🚀 Tech Stack
- **Frontend**: React (Vite), JavaScript, Vanilla CSS (Custom Glassmorphism Design System), Framer Motion (Animations).
- **Backend**: Vercel Serverless Functions (Node.js), JavaScript.
- **Database**: Google Sheets (used as a lightweight, real-time database via `googleapis`).
- **Integrations**:
  - **Google People API**: Automatic and bulk sync of customers to owner's personal Google Contacts.
  - **AI (Anthropic & OpenAI)**: Integrated into the Campaign Composer to generate marketing messages.
- **Deployment**: Vercel (Hobby/Pro).

---

## 🛠 Project Structure
```text
/
├── api/                  # Vercel Serverless Functions
│   ├── auth/             # OAuth2 flow for Google Contacts
│   ├── _lib/             # Shared backend logic (Google Sheets wrapper)
│   ├── customers.js      # Main customer CRUD and lookup
│   ├── campaigns.js      # AI Campaign generation
│   ├── settings.js       # Salon config & manual contact sync
│   └── health.js         # API health check
├── src/                  # React Frontend
│   ├── components/       # Reusable UI (Scanner, Dashboard, Brand)
│   ├── context/          # State management (Dashboard & Scanner)
│   ├── pages/            # Main entry points (ScanPage, DashboardPage)
│   └── styles/           # Vanilla CSS modules & global theme
├── public/               # Static assets (Favicon, Logo)
└── vercel.json           # Vercel routing and configuration
```

---

## 💎 Core Features

### 1. Customer Scanner Page (`/scan`)
- **Onboarding**: A smooth, animated multi-step form for new customers (Phone → Name → Email → Gender → Socials).
- **Loyalty System**: Automatically tracks visits and calculates cashback based on salon settings.
- **Returning Visits**: Instant lookup by phone number. If 5+ visits, customer is tagged as **VIP**.
- **Reward Display**: Shows earned cashback and visit count with premium animations.

### 2. Owner Dashboard
- **Analytics**: Key metrics (Total Customers, Total Revenue, Total Cashback, New/VIP splits).
- **Customer Management**: Searchable, sortable table of all registered users.
- **AI Campaign Composer**: 
  - Allows the owner to select a customer segment (New, Regular, VIP).
  - Uses AI to generate personalized WhatsApp marketing messages.
  - Exports contact lists formatted for bulk WhatsApp broadcasting.

### 3. Google Contacts Integration
- **OAuth2 Flow**: Owner connects their Google account once via the Dashboard Settings.
- **Automatic Sync**: New customers are saved to the owner's contacts in real-time upon registration.
- **Bulk Sync**: A "Sync All" feature in settings fetches all historical customers from the sheet and pushes them to Google Contacts, with full deduplication logic.

### 4. Branding & Design
- **Glassmorphism**: A modern, dark-themed UI with frosted glass effects, subtle borders, and smooth transitions.
- **LogoBrand**: A unified React component for the "THE GROOMERS / Unisex Salon" mark.

---

## 🔑 Key Environment Variables
| Variable | Description |
|--- |--- |
| `DASHBOARD_PIN` | 4-digit PIN for dashboard access (Default: 1234). |
| `GOOGLE_SHEETS_ID` | ID of the Google Sheet acting as the database. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Credentials for Sheets API. |
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth2 credentials for Google Contacts. |
| `GOOGLE_REFRESH_TOKEN` | Stored owner token to maintain contact sync. |
| `ANTHROPIC_KEY` / `OPENAI_API_KEY` | For the Campaign Composer. |

---

## 📈 Current Status
- Backend migrated from Express to Vercel Serverless.
- Google Contacts integration is fully operational with OAuth2.
- Branding refresh complete (Text-only logo, Montserrat/Inter fonts).
- Deployment ready on `the-groomers.vercel.app`.
