# Security Fixes Applied — The Groomers
**Date:** June 2026  
**Status:** All CRITICAL, HIGH, and MEDIUM fixes implemented

---

## Files Changed

| File | Changes Applied |
|---|---|
| `api/_lib/auth.js` | **NEW** — Central security utilities (PIN auth, rate limiter, sanitizer, HTML escape, URL validator, CSV escaper, PII masker) |
| `api/_lib/cors.js` | VULN-005 — Wildcard CORS replaced with origin allowlist |
| `api/_lib/sheetsHelper.js` | VULN-017 tab allowlist + VULN-024 USER_ENTERED→RAW |
| `api/_lib/emailService.js` | VULN-009 — Email masked in production logs |
| `api/auth/callback.js` | VULN-002 — Token hidden; VULN-012 — HTML escaped |
| `api/customers.js` | VULN-004 error hiding + VULN-009 PII masking + VULN-011 phone validation |
| `api/settings.js` | VULN-004 + VULN-006 rate limit + VULN-009 + VULN-015 default PIN warning |
| `api/campaigns.js` | VULN-003 PIN auth + VULN-004 + VULN-005 + VULN-007 prompt injection + VULN-009 + VULN-010 recipient validation + VULN-016 size limit + VULN-020 CSV escape |
| `api/expenses.js` | VULN-003 PIN auth + VULN-004 + VULN-005 + VULN-014 URL validation |
| `api/sales.js` | VULN-003 PIN auth + VULN-004 + VULN-005 |
| `api/inventory.js` | VULN-003 PIN auth + VULN-004 + VULN-005 + VULN-014 URL validation |
| `api/pl.js` | VULN-003 PIN auth + VULN-004 + VULN-005 |
| `api/businessSettings.js` | VULN-003 PIN auth + VULN-004 + VULN-005 + key allowlist |
| `src/utils/api.js` | Session helpers (saveSession/getSessionPin/clearSession) + dashRequest with X-Dashboard-Pin header |
| `src/context/DashboardContext.jsx` | saveSession wired to verifyPin + isDefaultPin state + logout() |
| `src/components/Dashboard/PinGate.jsx` | VULN-015 — Default PIN warning banner + removed "Default PIN: 1234" hint |
| `vercel.json` | VULN-008 — Full security headers (HSTS, CSP, X-Frame, nosniff, Referrer, Permissions) |
| `.env.example` | VULN-001 — Safe placeholders only; VULN-025 — fixed ANTHROPIC_KEY→ANTHROPIC_API_KEY |

---

## ⚠️ MANUAL ACTION REQUIRED (cannot be done in code)

These require actions in external dashboards — the AI cannot do them for you:

### 1. 🔴 Rotate the Anthropic API Key
The key `sk-poe-Va3agcIbnQmn2iyqcqp9jJQNY1H6go5_fHRDzqgc3Vc` was exposed in `.env`.
- Go to **console.anthropic.com → API Keys**
- Delete the old key
- Create a new key
- Update `ANTHROPIC_API_KEY` in Vercel environment variables

### 2. 🔴 Rotate the Google Service Account Key
The private key in `.env` was read during this audit session.
- Go to **GCP Console → IAM → Service Accounts → the-grommers-master-data@united-course-494410-k7**
- Click **Keys** tab → Delete key `73034ed9abb935b456e8a9105c85249a6da6f6b1`
- Create a new JSON key
- Update `GOOGLE_SERVICE_ACCOUNT_JSON` in Vercel with the new JSON

### 3. 🔴 Change the Dashboard PIN
- Go to **Vercel → Project → Settings → Environment Variables**
- Update `DASHBOARD_PIN` to a new 4-digit PIN (not 1234)
- Redeploy

### 4. Verify `.env` was never committed to Git
Run this in your terminal:
```bash
git log --all --full-history -- .env
```
If output is empty → safe. If it shows commits → the secrets were in Git history and need full rotation.

---

## Vulnerability Status After Fixes

| ID | Description | Severity | Status |
|---|---|---|---|
| VULN-001 | Exposed credentials in .env | 🔴 CRITICAL | ⚠️ Manual key rotation required |
| VULN-002 | OAuth token in plain HTML | 🔴 CRITICAL | ✅ Fixed — token hidden |
| VULN-003 | No auth on business APIs | 🔴 CRITICAL | ✅ Fixed — PIN middleware on all routes |
| VULN-004 | error.message leaked to client | 🔴 CRITICAL | ✅ Fixed — generic errors returned |
| VULN-005 | Wildcard CORS | 🟠 HIGH | ✅ Fixed — origin allowlist |
| VULN-006 | No rate limiting on PIN | 🟠 HIGH | ✅ Fixed — 5 attempts / 5 min per IP |
| VULN-007 | AI prompt injection | 🟠 HIGH | ✅ Fixed — inputs sanitized |
| VULN-008 | Missing security headers | 🟠 HIGH | ✅ Fixed — vercel.json headers added |
| VULN-009 | PII in logs | 🟠 HIGH | ✅ Fixed — emails/phones masked |
| VULN-010 | Open email relay via send-to-selected | 🟠 HIGH | ✅ Fixed — validate against customer DB |
| VULN-011 | No phone format validation | 🟡 MEDIUM | ✅ Fixed — regex /^\d{10}$/ |
| VULN-012 | XSS via err.message in HTML | 🟡 MEDIUM | ✅ Fixed — escapeHtml() applied |
| VULN-013 | No CSRF protection | 🟡 MEDIUM | ✅ Mitigated — CORS allowlist blocks cross-origin state change |
| VULN-014 | SSRF via image_url/receipt_url | 🟡 MEDIUM | ✅ Fixed — isSafeUrl() validates |
| VULN-015 | Default PIN 1234 not warned | 🟡 MEDIUM | ✅ Fixed — warning banner in UI |
| VULN-016 | No body size limits | 🟡 MEDIUM | ✅ Fixed — 500 recipient max on send-to-selected |
| VULN-017 | Tab name injection in Sheets | 🟡 MEDIUM | ✅ Fixed — assertTab() allowlist |
| VULN-018 | No lockout after failed PINs | 🟢 LOW | ✅ Fixed — covered by rate limit |
| VULN-019 | Auth state in localStorage | 🟢 LOW | ✅ Fixed — sessionStorage + 8h expiry |
| VULN-020 | CSV injection | 🟢 LOW | ✅ Fixed — escapeCsvField() |
| VULN-021 | Health endpoint info leak | 🟢 LOW | 🔵 Acceptable — no sensitive data |
| VULN-022 | No session expiry | 🟢 LOW | ✅ Fixed — 8-hour auto-logout |
| VULN-023 | No SRI on external fonts | 🔵 INFO | 🔵 Deferred — low risk |
| VULN-024 | USER_ENTERED formula injection | 🔵 INFO | ✅ Fixed — changed to RAW |
| VULN-025 | ANTHROPIC_KEY name mismatch | 🔵 INFO | ✅ Fixed — .env.example updated |
