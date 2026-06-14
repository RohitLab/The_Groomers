# Product Requirements Document (PRD)
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Version:** 1.0  
**Date:** June 2026  
**Status:** Production  
**Live URL:** https://thegroomers.shop

---

## 1. Executive Summary

**The Groomers** is a full-stack CRM and digital loyalty platform purpose-built for a premium unisex salon in Nashik, India. It replaces manual paper-based loyalty cards with a smart, phone-number-driven system that rewards returning customers, helps the owner market intelligently using AI, and manages online bookings — all from a single unified platform.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| No digital record of customers or visits | Zero repeat marketing capability |
| Manual cashback tracking is error-prone | Revenue leakage and trust issues |
| No online booking system | Lost customers who prefer to book ahead |
| Owner has no analytics | Cannot identify VIP or inactive customers |
| No automated marketing | Zero engagement between visits |

---

## 3. Goals & Objectives

### Business Goals
- Increase repeat visit rate by digitizing customer loyalty
- Build an owned customer database (phone + email + gender)
- Enable targeted marketing via WhatsApp and Email
- Offer online appointment booking to capture mobile-first customers

### Product Goals
- Onboard a new customer in under 60 seconds at the salon counter
- Identify returning customers instantly by phone number
- Automate cashback calculation and tracking
- Allow the owner to run AI-generated campaigns without writing copy

---

## 4. Target Users

### Primary — Salon Customers
- **Profile:** Walk-in customers of The Groomers Unisex Salon, Nashik
- **Device:** Any smartphone (customer-facing kiosk page)
- **Goals:** Quick check-in, earn cashback, book appointments online

### Secondary — Salon Owner
- **Profile:** Single business owner managing all operations
- **Device:** Desktop / Tablet
- **Goals:** View analytics, manage customers, launch marketing campaigns, manage appointments

---

## 5. Core Features

### 5.1 Customer Scanner (`/scan`) — Public Kiosk
| Feature | Description | Priority |
|---|---|---|
| Phone lookup | Customer enters 10-digit Indian mobile number | P0 |
| New customer onboarding | Multi-step form: Phone → Name → Email → Gender → Socials | P0 |
| Returning customer recognition | Instant lookup + visit count increment | P0 |
| Cashback calculation | Auto-compute cashback based on bill amount and salon settings | P0 |
| Cashback reward display | Animated reward screen with confetti and balance display | P1 |
| VIP auto-tagging | Automatic promotion to VIP after 5+ visits | P0 |
| Social follow tracking | Tracks Instagram, Facebook follows and Google review completion | P1 |
| Appointment pre-fill | Pulls name/email from Appointments sheet if already booked | P1 |

### 5.2 Owner Dashboard (`/dashboard`) — Private Panel
| Feature | Description | Priority |
|---|---|---|
| PIN gate authentication | 4-digit PIN required to access dashboard | P0 |
| Customer table | Searchable, sortable list of all registered customers | P0 |
| Filter chips | Filter by All / New / Regular / VIP | P0 |
| Analytics cards | Total customers, revenue, cashback issued, VIP count, avg visits | P0 |
| AI Campaign Composer | Generate WhatsApp/Email marketing variants using AI | P1 |
| Email campaign sending | Send personalized emails to filtered customer segments | P1 |
| Contact export | Export customer contact lists for WhatsApp bulk broadcasting | P1 |
| Settings panel | Configure cashback %, min bill, social links, salon name | P0 |
| QR code generator | Generate printable /scan QR for counter placement | P0 |
| Google Contacts sync | OAuth2 — auto-sync new customers to owner's Google Contacts | P1 |
| Appointments tab | View and manage all booked appointments with status updates | P1 |

### 5.3 Public Landing Page (`/`)
| Feature | Description | Priority |
|---|---|---|
| Hero section | Full-screen animated hero with salon name and CTA | P1 |
| Services section | Visual showcase of hair, skin, and grooming services | P1 |
| Booking CTA | Deep link to /book appointment page | P1 |
| Stats counter | Animated statistics (years, happy customers, services) | P2 |
| Contact / WhatsApp | Direct WhatsApp chat link to salon number | P1 |
| Scan QR section | Highlight loyalty program with QR code | P1 |

### 5.4 Online Booking (`/book`)
| Feature | Description | Priority |
|---|---|---|
| Booking form | Name, phone, email, service, date, time picker, notes | P0 |
| Booking ID generation | Auto-generate unique booking ID (TG + timestamp) | P0 |
| Owner notification email | Instant email to salon owner on new booking | P0 |
| Customer confirmation email | Branded confirmation email to customer | P0 |
| Dashboard integration | All bookings visible in Appointments tab | P0 |
| Status management | Owner can mark bookings as Confirmed / Completed / Cancelled | P1 |

---

## 6. User Flows

### 6.1 New Customer Scan Flow
```
Customer arrives at salon counter
→ Picks up counter tablet/phone
→ Navigates to /scan
→ Enters 10-digit phone number
→ System: Not found → Shows onboarding form
→ Customer fills: Name → Email → Gender → Social follows
→ Submit → Data saved to Google Sheets + Google Contacts
→ Bill entry screen → Enter bill amount
→ System calculates cashback
→ Cashback reward screen (confetti animation)
→ Customer shows screen to staff
```

### 6.2 Returning Customer Flow
```
Customer enters phone number at /scan
→ System: Found → Welcome Back card (3D flip animation)
→ Shows: Name, visit count, VIP badge (if applicable), cashback balance
→ Bill entry screen
→ Cashback earned + total balance displayed
→ Done
```

### 6.3 Owner Campaign Flow
```
Owner logs in with PIN
→ Goes to Campaigns tab
→ Selects audience (All / New / Regular / VIP / Female / Male / Inactive)
→ Selects occasion (Festival / Promotion / Special Offer / Custom)
→ Clicks "Generate"
→ AI produces 3 variants (Formal / Casual / Fun)
→ Owner picks variant
→ Copies for WhatsApp OR clicks "Send Email Campaign"
→ Emails sent to filtered customer segment
```

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load (LCP) | < 2 seconds on 4G |
| Scanner flow completion | < 60 seconds for new customer |
| API response time | < 1 second for all endpoints |
| Uptime | 99.9% (Vercel Hobby/Pro SLA) |
| Mobile responsiveness | 100% — scanner page is customer-facing on mobile |
| Browser support | Last 2 versions of Chrome, Safari, Edge |
| Accessibility | WCAG 2.1 AA for public pages |

---

## 8. Constraints & Assumptions

- **Database:** Google Sheets is used as the database (no traditional RDBMS). Suitable for < 10,000 customers.
- **Payments:** No payment processing is in scope. Cashback is tracked as a loyalty credit, not real money transfer.
- **Single tenant:** Platform serves one salon only; no multi-tenant architecture.
- **Authentication:** Simple PIN-based auth for dashboard (no JWT, no sessions). Suitable for single-owner use.
- **WhatsApp:** Campaign message export is manual (copy-paste into WhatsApp Business). No official WhatsApp API integration.
- **AI:** Claude Sonnet powers campaign generation. Falls back to pre-written templates if API is unavailable.
- **Deployment:** Vercel Serverless only. No Docker, no traditional server.

---

## 9. Success Metrics

| Metric | Target (3 months) |
|---|---|
| Customers registered | 500+ |
| Daily scans | 20+ per day |
| Repeat visit rate | 40%+ of customers return within 30 days |
| Campaigns sent | 4+ per month |
| Dashboard daily active | Owner visits daily |
| Booking requests | 50+ per month via /book |

---

## 10. Out of Scope (v1.0)

- Online payment processing
- Staff management / multi-user access
- Multi-branch support
- Native mobile app (iOS / Android)
- WhatsApp Business API official integration
- Inventory management
- POS integration
