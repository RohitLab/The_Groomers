# Backend Schema Document
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Version:** 1.0  
**Date:** June 2026  
**Database:** Google Sheets (Spreadsheet ID: `GOOGLE_SHEETS_ID` env var)

---

## 1. Overview

The application uses **Google Sheets as a lightweight relational database**. The spreadsheet contains 4 worksheets (tabs):

| Sheet Name | Purpose | Approximate Row Limit |
|---|---|---|
| `Customers` | Main CRM — all customer loyalty records | 10,000 rows |
| `Settings` | Key-value config for salon parameters | ~20 rows |
| `Appointments` | Online booking records | 5,000 rows |
| *(Business Sheets)* | Expenses, Sales, P&L, Inventory | varies |

---

## 2. Customers Sheet Schema

**Sheet Name:** `Customers`  
**Range:** `A:P` (16 columns)  
**Header Row:** Row 1  
**Data starts:** Row 2

### Column Definitions

| Column | Header | Type | Required | Description |
|---|---|---|---|---|
| A | `phone` | String (10-digit) | Yes | Primary key — Indian mobile number without +91 |
| B | `name` | String | Yes | Customer full name |
| C | `email` | String | No | Customer email address |
| D | `instagramFollowed` | String ("Yes"/"No") | No | Did customer follow salon on Instagram? |
| E | `facebookFollowed` | String ("Yes"/"No") | No | Did customer follow salon on Facebook? |
| F | `googleReview` | String ("Yes"/"No") | No | Did customer leave a Google review? |
| G | `cashbackAmount` | Number | No | Reserved field (legacy) |
| H | `visits` | Integer | Yes | Total number of salon visits (starts at 1) |
| I | `firstVisit` | Date (YYYY-MM-DD) | Yes | Date of first visit |
| J | `lastVisit` | Date (YYYY-MM-DD) | Yes | Date of most recent visit |
| K | `tag` | Enum ("New"/"Regular"/"VIP") | Yes | Customer segment tag |
| L | `billAmount` | Float | No | Most recent bill amount (INR) |
| M | `cashbackEarned` | Float | No | Cashback from most recent visit (INR) |
| N | `cashbackPercent` | Float | No | Cashback rate applied (%) |
| O | `totalCashback` | Float | No | Cumulative cashback earned across all visits (INR) |
| P | `gender` | String ("Male"/"Female"/"Other"/"") | No | Customer gender |

### Business Rules

```
Tag Assignment:
  visits >= 5  → tag = "VIP"
  visits >= 1  → tag = "Regular"  (set on update only)
  first visit  → tag = "New"

Cashback Calculation:
  if bill < settings.minBill:
    cashback = 0
  else:
    cashback = bill * (settings.cashbackPercent / 100)
    if settings.maxCashback > 0:
      cashback = min(cashback, settings.maxCashback)
  totalCashback += cashback

Phone (Primary Key):
  Stored as 10-digit string (no +91, no spaces)
  Lookup is exact string match on column A
```

### Example Data Row
```
A           B            C                       D    E    F    G  H  I           J           K        L    M   N  O    P
9119533325  Rahul Sharma rahul@example.com       Yes  No   Yes  0  7  2025-01-15  2026-06-10  VIP      850  42  5  315  Male
```

### COLUMNS Array (code reference)
```javascript
const COLUMNS = [
  'phone',             // A
  'name',              // B
  'email',             // C
  'instagramFollowed', // D
  'facebookFollowed',  // E
  'googleReview',      // F
  'cashbackAmount',    // G
  'visits',            // H
  'firstVisit',        // I
  'lastVisit',         // J
  'tag',               // K
  'billAmount',        // L
  'cashbackEarned',    // M
  'cashbackPercent',   // N
  'totalCashback',     // O
  'gender',            // P
]
```

---

## 3. Settings Sheet Schema

**Sheet Name:** `Settings`  
**Range:** `A:B` (2 columns — key/value pairs)  
**No header row**

### Key-Value Store

| Row | Key (Col A) | Value (Col B) | Type | Default |
|---|---|---|---|---|
| 1 | `salonName` | "The Grommers" | String | "The Grommers" |
| 2 | `cashbackPercent` | 5 | Number | 5 |
| 3 | `newCustomerCashbackPercent` | 10 | Number | 10 |
| 4 | `minBill` | 100 | Number | 100 |
| 5 | `maxCashback` | 500 | Number | 500 |
| 6 | `instagramUrl` | "https://instagram.com/..." | String | "" |
| 7 | `facebookUrl` | "https://facebook.com/..." | String | "" |
| 8 | `googleReviewUrl` | "https://g.page/..." | String | "" |
| 9 | `whatsappNumber` | "919119533325" | String | "" |

### Default Settings Object (code reference)
```javascript
function getDefaultSettings() {
  return {
    salonName:                  'The Grommers',
    cashbackPercent:            5,
    newCustomerCashbackPercent: 10,
    minBill:                    100,
    maxCashback:                500,
    instagramUrl:               'https://instagram.com/thegrommers',
    facebookUrl:                'https://facebook.com/thegrommers',
    googleReviewUrl:            'https://g.page/thegrommers/review',
    whatsappNumber:             '',
  }
}
```

### Caching
Settings are cached in module memory (`settingsCache`) after first read per serverless cold start. Cache is invalidated and refreshed on `updateSettings()` calls.

---

## 4. Appointments Sheet Schema

**Sheet Name:** `Appointments`  
**Range:** `A:J` (10 columns)  
**Header Row:** Row 1  
**Data starts:** Row 2

### Column Definitions

| Column | Header | Type | Required | Description |
|---|---|---|---|---|
| A | `BookingID` | String | Yes | Auto-generated: "TG" + last 6 digits of Unix timestamp |
| B | `Name` | String | Yes | Customer full name |
| C | `Phone` | String | Yes | Customer phone number |
| D | `Email` | String | No | Customer email (for confirmation) |
| E | `Service` | String | Yes | Selected service (e.g., "Hair Cut", "Facial") |
| F | `Date` | Date (YYYY-MM-DD) | Yes | Requested appointment date |
| G | `Time` | String (HH:MM) | Yes | Requested appointment time |
| H | `Notes` | String | No | Optional notes from customer |
| I | `Status` | Enum | Yes | "Pending" / "Confirmed" / "Completed" / "Cancelled" |
| J | `BookedAt` | ISO Datetime | Yes | Booking submission timestamp (UTC) |

### Booking ID Format
```
TG + Date.now().toString().slice(-6)
Example: TG839271
```

### Status Lifecycle
```
Pending → Confirmed → Completed
        → Cancelled
```

### APPT_COLUMNS Array (code reference)
```javascript
const APPT_COLUMNS = [
  'BookingID',  // A
  'Name',       // B
  'Phone',      // C
  'Email',      // D
  'Service',    // E
  'Date',       // F
  'Time',       // G
  'Notes',      // H
  'Status',     // I
  'BookedAt',   // J
]
```

---

## 5. API Endpoints & Their Schema Interactions

### 5.1 Customers API (`/api/customers`)

#### `GET ?action=check&phone={10digit}`
**Reads:** Customers!A:P, Appointments!A:J  
**Returns:**
```json
{
  "found": true,
  "isReturning": true,
  "fromAppointment": false,
  "customerData": {
    "phone": "9119533325",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "visits": 8,
    "tag": "VIP",
    "totalCashback": 315,
    "lastVisit": "2026-06-10"
  }
}
```
**Side effects:** Increments `visits`, updates `lastVisit`, updates `tag` — writes to Customers!A:P

---

#### `GET ?action=list&tag={tag}&search={q}`
**Reads:** Customers!A:P  
**Returns:**
```json
{
  "customers": [
    { "phone": "...", "name": "...", "tag": "VIP", "visits": 7, ... }
  ]
}
```

---

#### `POST ?action=add` — New customer registration
**Body:**
```json
{
  "phone": "9119533325",
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "gender": "Female",
  "instagramFollowed": true,
  "facebookFollowed": false,
  "googleReviewDone": false
}
```
**Writes:** Appends row to Customers!A:P  
**Side effect:** Calls `saveToGoogleContacts()` [non-blocking]

---

#### `POST ?action=bill` — Record bill + calculate cashback
**Body:**
```json
{
  "phone": "9119533325",
  "billAmount": 850,
  "isNew": false
}
```
**Reads:** Settings!A:B (for cashback rules)  
**Writes:** Updates row in Customers!A:P  
**Returns:**
```json
{
  "success": true,
  "cashback": 42.5,
  "billAmount": 850,
  "percent": 5
}
```

---

#### `POST ?action=lookup` — Returning customer visit
**Body:** `{ "phone": "9119533325" }`  
**Side effect:** Increments visits, updates lastVisit

---

### 5.2 Appointments API (`/api/appointments`)

#### `POST ?action=book`
**Body:**
```json
{
  "name": "Amit Shah",
  "phone": "9876543210",
  "email": "amit@example.com",
  "service": "Hair Cut",
  "date": "2026-06-20",
  "time": "11:00",
  "notes": "Prefer trim only"
}
```
**Writes:** Appends row to Appointments!A:J  
**Side effects:** Sends owner notification email + customer confirmation email  
**Returns:** `{ "success": true, "bookingId": "TG839271" }`

---

#### `GET ?action=list`
**Reads:** Appointments!A2:J  
**Returns:** `{ "appointments": [...] }`

---

#### `POST ?action=update-status`
**Body:** `{ "bookingId": "TG839271", "status": "Confirmed" }`  
**Writes:** Updates column I (Status) in Appointments sheet

---

### 5.3 Settings API (`/api/settings`)

#### `GET ?action=get`
**Reads:** Settings!A:B  
**Returns:** `{ "settings": {...}, "contactsConnected": true/false }`

#### `POST ?action=update`
**Body:** `{ "cashbackPercent": 7, "minBill": 150, ... }`  
**Writes:** Updates Settings!A1:B{n}

#### `POST ?action=verify-pin`
**Body:** `{ "pin": "1234" }`  
**Reads:** `process.env.DASHBOARD_PIN`  
**Returns:** `{ "success": true }` or `401`

#### `POST ?action=sync-contacts`
**Reads:** Customers!A:P (all customers)  
**Writes:** Google People API (contacts creation)  
**Returns:** `{ "synced": 45, "skipped": 12, "failed": 0, "total": 57 }`

---

### 5.4 Campaigns API (`/api/campaigns`)

#### `POST ?action=generate`
**Body:**
```json
{
  "audience": "VIP",
  "occasion": "festival",
  "festival": "Diwali",
  "salonName": "The Grommers"
}
```
**Reads:** Anthropic API (Claude Sonnet)  
**Returns:**
```json
{
  "variants": [
    { "style": "Formal", "text": "Dear..." },
    { "style": "Casual", "text": "Hey..." },
    { "style": "Fun", "text": "Diwali vibes..." }
  ]
}
```

#### `POST ?action=send-email-campaign`
**Body:**
```json
{
  "message": "Campaign message text",
  "filter": "VIP",
  "previewText": "Diwali special offer"
}
```
**Reads:** Customers!A:P (filtered by segment + has email)  
**Writes:** Resend API (sends individualized emails)  
**Returns:** `{ "sent": 23, "skipped": 15, "failed": 0 }`

---

## 6. Data Relationships

```
Customers (phone PK) ←── findInAppointments() ───→ Appointments (Phone FK)
                                                    (soft relationship, no enforced FK)

Customers ←── cashbackPercent ───→ Settings (cashbackPercent key)
             minBill                         (minBill)
             maxCashback                     (maxCashback)
```

---

## 7. Google People API — Contact Schema

When a customer is synced to Google Contacts, the following structure is created:

```json
{
  "names": [
    {
      "givenName": "Rahul Sharma",
      "displayName": "Rahul Sharma"
    }
  ],
  "phoneNumbers": [
    {
      "value": "+919119533325",
      "type": "mobile"
    }
  ],
  "emailAddresses": [
    {
      "value": "rahul@example.com",
      "type": "home"
    }
  ],
  "organizations": [
    {
      "name": "The Grommers Customer",
      "title": "Male"
    }
  ],
  "biographies": [
    {
      "value": "Salon Customer\nTag: VIP\nGender: Male\nVisits: 7\nJoined: 2025-01-15"
    }
  ]
}
```

**Deduplication:** Before creating contacts, existing phone numbers are fetched and stored in a `Set`. Contacts with matching phones are skipped.

---

## 8. Environment Variables (Schema Impact)

| Variable | Where Used | Impact if Missing |
|---|---|---|
| `GOOGLE_SHEETS_ID` | All Sheets operations | App goes into demo/fallback mode |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | All Sheets operations | App goes into demo/fallback mode |
| `GOOGLE_CLIENT_ID` | OAuth2, Contacts sync | Contacts integration disabled |
| `GOOGLE_CLIENT_SECRET` | OAuth2, Contacts sync | Contacts integration disabled |
| `GOOGLE_REFRESH_TOKEN` | Auto-sync, Bulk sync | Contacts integration disabled |
| `DASHBOARD_PIN` | PIN verification | Defaults to "1234" |
| `ANTHROPIC_API_KEY` | Campaign generation | Falls back to templates |
| `RESEND_API_KEY` | Email sending | Email feature disabled |
| `OWNER_EMAIL` | Booking notifications | Defaults to wearegroomers@gmail.com |
