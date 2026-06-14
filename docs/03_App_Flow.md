# App Flow Document
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Version:** 1.0  
**Date:** June 2026

---

## 1. Application Map

```
https://thegroomers.shop/
│
├── /                     → Public Landing Page (HomePage)
├── /scan                 → Customer Loyalty Scanner (ScanPage)
├── /book                 → Online Appointment Booking (BookingPage)
└── /dashboard            → Owner Dashboard (DashboardPage — PIN protected)
    ├── Tab: Customers    → CustomerTable + Analytics
    ├── Tab: Campaigns    → CampaignComposer (AI)
    ├── Tab: Appointments → AppointmentsTab
    └── Tab: Settings     → SettingsPanel + QR + Google Contacts
```

---

## 2. Customer Scanner Flow (`/scan`)

### 2.1 Step-by-Step Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    STEP 1: PhoneInput                        │
│                                                              │
│  Customer types 10-digit Indian mobile number (+91 prefix)  │
│  ┌───────────────────────────────────────┐                  │
│  │  +91  [_ _ _ _ _ _ _ _ _ _]  →        │                  │
│  └───────────────────────────────────────┘                  │
│            ↓ API: GET /api/customers?action=check           │
└──────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   found=false              found=true
        │                       │
        ↓                       ↓
┌───────────────┐       ┌───────────────────────────────────┐
│ STEP 2A:      │       │ STEP 2B: WelcomeBack              │
│ OnboardingForm│       │                                   │
│               │       │  3D card flip animation           │
│ Name          │       │  • Customer name + photo avatar   │
│ Email         │       │  • Visit count badge              │
│ Gender        │       │  • VIP badge (if visits >= 5)     │
│ Instagram ✓   │       │  • Cashback balance               │
│ Facebook ✓    │       │  • "Google Review Done?" toggle   │
│ Google Rev ✓  │       └─────────────────┬─────────────────┘
│               │                         │
│ POST /api/    │                Continue ↓
│ customers     │
│ ?action=add   │
└───────┬───────┘
        │
        ↓
┌───────────────────────────────────────────────────────────────┐
│                    STEP 3: BillInput                          │
│                                                               │
│  Staff enters bill amount for the session                     │
│  ┌─────────────────────────────────┐                         │
│  │  Bill Amount: ₹ [_____]         │                         │
│  │  Cashback Preview: ₹25 (5%)     │                         │
│  └─────────────────────────────────┘                         │
│             ↓ POST /api/customers?action=bill                 │
└───────────────────────────────────────────────────────────────┘
        │
        ↓
┌──────────────────────────────────────────────────────────────┐
│                 STEP 4: CashbackReward                       │
│                                                              │
│  🎉 Confetti burst animation                                 │
│  ┌─────────────────────────────────────────┐               │
│  │   ✅ ₹25 Cashback Earned!               │               │
│  │   Total Balance: ₹275                   │               │
│  │   Show this screen to staff 👆          │               │
│  └─────────────────────────────────────────┘               │
│  [New Scan] button → resets to Step 1                       │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Scanner API Sequence

```
Client                              Vercel API                    Google Sheets
  │                                      │                              │
  │── GET /customers?action=check ──────▶│                              │
  │        &phone=9119533325             │── lookupByPhone() ──────────▶│
  │                                      │◀─ found/not found ───────────│
  │                                      │── findInAppointments() ─────▶│
  │◀── { found, isReturning, data } ─────│◀─ appointment data ──────────│
  │                                      │                              │
  │ [IF NEW CUSTOMER]                    │                              │
  │── POST /customers?action=add ───────▶│                              │
  │        {name,phone,email,...}        │── appendCustomer() ─────────▶│
  │                                      │── saveToGoogleContacts() [async]
  │◀── { success, customer } ────────────│                              │
  │                                      │                              │
  │── POST /customers?action=bill ──────▶│                              │
  │        {phone, billAmount}           │── getSettings() ────────────▶│
  │                                      │── updateCustomer() ─────────▶│
  │◀── { cashback, billAmount, percent }─│                              │
```

---

## 3. Owner Dashboard Flow (`/dashboard`)

### 3.1 Authentication Gate
```
Navigate to /dashboard
       ↓
┌──────────────────────────────┐
│       PinGate                │
│  ● ● ● ●  (4-dot indicator) │
│  [1][2][3]                   │
│  [4][5][6]                   │
│  [7][8][9]                   │
│      [0]                     │
└──────────┬───────────────────┘
           ↓ POST /api/settings?action=verify-pin
    ┌──────┴──────┐
  Correct       Wrong
    ↓              ↓
Dashboard      Shake animation
loads          + error message
```

### 3.2 Dashboard Tab Navigation
```
Dashboard (authenticated)
│
├── [Customers Tab] ─── default view
│   ├── AnalyticsCards (top row KPIs)
│   │   ├── Total Customers
│   │   ├── Total Revenue
│   │   ├── Total Cashback Issued
│   │   ├── New Customers
│   │   ├── VIP Customers
│   │   └── Avg Visits per Customer
│   │
│   ├── Search bar (real-time filter by name/phone/email)
│   ├── Filter chips: [All] [New] [Regular] [VIP]
│   │   └── GET /api/customers?action=list&tag=VIP
│   │
│   └── CustomerTable
│       └── Columns: Name, Phone, Email, Gender, Visits, Tag, Cashback, Last Visit
│
├── [Campaigns Tab]
│   ├── Audience selector: All / New / Regular / VIP / Female / Male / Inactive
│   ├── Occasion selector: Festival / Promotion / Special / Custom
│   ├── Festival picker (if Festival selected)
│   ├── Custom topic input (if Custom selected)
│   │
│   ├── [Generate] → POST /api/campaigns?action=generate
│   │               → AI returns 3 variants
│   │
│   ├── Variant cards (Formal / Casual / Fun)
│   │   ├── [Copy for WhatsApp] → copies message to clipboard
│   │   └── [Send Email] → POST /api/campaigns?action=send-email-campaign
│   │                    → Sends personalized email to each customer with email
│   │
│   └── Contact list export
│       └── [Download CSV] → filtered customer phones
│
├── [Appointments Tab]
│   ├── Appointment list (from GET /api/appointments?action=list)
│   ├── Booking ID, Name, Phone, Service, Date, Time, Status
│   └── Status dropdown: Pending / Confirmed / Completed / Cancelled
│       └── POST /api/appointments?action=update-status
│
└── [Settings Tab]
    ├── Salon Configuration
    │   ├── Salon Name
    │   ├── Cashback % (returning customers)
    │   ├── New Customer Cashback % (bonus rate)
    │   ├── Minimum Bill Amount
    │   ├── Maximum Cashback Cap
    │   ├── Instagram URL
    │   ├── Facebook URL
    │   └── Google Review URL
    │   └── [Save] → POST /api/settings?action=update
    │
    ├── QR Code Section
    │   ├── QRCodeSVG pointing to /scan URL
    │   └── [Download QR] → saves PNG for printing
    │
    └── Google Contacts Integration
        ├── Connection status indicator
        ├── [Connect Google] → initiates OAuth2 flow
        └── [Sync All Contacts] → POST /api/settings?action=sync-contacts
            → fetches all customers → deduplicates → creates contacts
```

---

## 4. Online Booking Flow (`/book`)

```
Customer opens thegroomers.shop/book
             ↓
┌───────────────────────────────────────┐
│         BookingPage                   │
│                                       │
│  Full Name: [_________________]       │
│  Phone:     [+91 _____________]       │
│  Email:     [_________________]       │
│  Service:   [v Hair Cut         ]     │
│  Date:      [📅 Date picker]          │
│  Time:      [🕐 Time picker]          │
│  Notes:     [_________________]       │
│                                       │
│         [Book Appointment]            │
└───────────────────────────────────────┘
             ↓ POST /api/appointments?action=book
             ↓
┌──────────────────────────────────────┐
│  Success Screen                      │
│                                      │
│  ✅ Appointment Requested!           │
│  Booking ID: TG839271                │
│  We'll confirm within 2 hours        │
│                                      │
│  [Back to Home]                      │
└──────────────────────────────────────┘
             ↓ (parallel)
┌─────────────────┐    ┌────────────────────────┐
│ Owner Email     │    │ Customer Email          │
│ New Appointment │    │ Booking Confirmation    │
│ notification    │    │ with booking details    │
└─────────────────┘    └────────────────────────┘
```

---

## 5. Public Landing Page Flow (`/`)

```
User lands on thegroomers.shop
        ↓
┌───────────────────────────────────────┐
│  Hero Section                         │
│  "THE GROOMERS — Premium Unisex Salon"│
│  [Book Appointment] [Learn More]      │
└───────────────────────────────────────┘
        ↓ (scroll)
┌───────────────────────────────────────┐
│  Trust Bar: 5★ Google | 8+ Years      │
└───────────────────────────────────────┘
        ↓ (scroll)
┌───────────────────────────────────────┐
│  Services Section                     │
│  Hair | Skin | Grooming | Bridal      │
│  [Book for This Service]              │
└───────────────────────────────────────┘
        ↓ (scroll)
┌───────────────────────────────────────┐
│  Stats Counter                        │
│  8+ Years | 500+ Customers | 20+ Svcs │
└───────────────────────────────────────┘
        ↓ (scroll)
┌───────────────────────────────────────┐
│  Loyalty Program Section              │
│  "Scan our QR to earn cashback"       │
│  [QR Code shown]                      │
└───────────────────────────────────────┘
        ↓ (scroll)
┌───────────────────────────────────────┐
│  Contact Section                      │
│  Address | Hours | WhatsApp button    │
└───────────────────────────────────────┘

Floating Elements (always visible):
- WhatsApp FAB (bottom right)
- Sticky navbar (after scroll)
```

---

## 6. Google OAuth2 Flow (Contacts Setup)

```
Owner clicks [Connect Google] in Settings
        ↓
Browser redirects to Google OAuth consent screen
(scopes: contacts.readwrite)
        ↓
Owner approves permissions
        ↓
Google redirects to:
  /api/auth/callback?code=AUTH_CODE
        ↓
Backend exchanges code for tokens
(GOOGLE_REFRESH_TOKEN saved to Vercel env)
        ↓
Contacts integration is now LIVE
- All new customers auto-sync on registration
- Bulk sync available via [Sync All] button
```

---

## 7. Error States & Edge Cases

| Scenario | Handling |
|---|---|
| Google Sheets unreachable | Demo mode — returns sample data, does not fail |
| Phone not found, not in Appointments either | Shows new customer onboarding form |
| Bill below minimum (< ₹100) | Cashback = ₹0, still recorded as visit |
| Claude API down | Falls back to pre-written campaign templates |
| Email send fails | Logs error, does not block booking confirmation |
| Google Contacts sync fails | Non-blocking — logs error, customer still registered |
| Invalid PIN (3 attempts) | UI shows error + shake, no lockout in v1 |
| Duplicate phone (add action) | Sheets appends duplicate — no dedup on add, dedup on lookup |
