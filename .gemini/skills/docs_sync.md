# Skill: Auto-Sync Project Documentation + Security Enforcement
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Skill ID:** `docs-sync`
**Location:** `d:\Antigravity\The_Groomers\.gemini\skills\docs_sync.md`
**Applies to:** All work done in `d:\Antigravity\The_Groomers\`

---

## PURPOSE

This skill governs **three behaviors** for every interaction in this project:

1. **IF the user describes or requests a code/feature change** → Make the change AND update the relevant `docs/` files to reflect it.
2. **IF the user does NOT describe a change** → Read and follow the existing `docs/` files as the single source of truth before doing any work.
3. **ALWAYS, for every new file or code written** → Run the Security Checklist (RULE 6) before finalising any code.

---

## RULE 1 — FOLLOW DOCS WHEN NO CHANGE IS MENTIONED

When the user asks you to build, fix, add, or explain something **without specifying a change to the architecture or design**, you MUST:

1. Read the relevant document(s) from `docs/` FIRST
2. Use those documents as the source of truth for:
   - Color palette, typography, and design tokens → [04_UIUX_Design_Brief.md](file:///d:/Antigravity/The_Groomers/docs/04_UIUX_Design_Brief.md)
   - API endpoint shapes and business logic → [05_Backend_Schema.md](file:///d:/Antigravity/The_Groomers/docs/05_Backend_Schema.md)
   - Feature scope and priorities → [01_PRD.md](file:///d:/Antigravity/The_Groomers/docs/01_PRD.md)
   - Tech stack, folder structure, state management → [02_TRD.md](file:///d:/Antigravity/The_Groomers/docs/02_TRD.md)
   - User flows and screen logic → [03_App_Flow.md](file:///d:/Antigravity/The_Groomers/docs/03_App_Flow.md)
   - Implementation order and phase plan → [06_Implementation_Plan_IDE_Prompt.md](file:///d:/Antigravity/The_Groomers/docs/06_Implementation_Plan_IDE_Prompt.md)
3. Do NOT deviate from these docs without user approval

---

## RULE 2 — UPDATE DOCS WHEN A CHANGE IS MADE

When the user requests or you make ANY of the following changes, you MUST update the corresponding docs:

### Change → Document Mapping

| Change Type | Files to Update |
|---|---|
| New feature added | `01_PRD.md` (add to feature table) + `03_App_Flow.md` (add flow) |
| Feature removed or scope changed | `01_PRD.md` (update/move to Out of Scope) |
| New API endpoint created | `02_TRD.md` (add to backend section) + `05_Backend_Schema.md` (full spec) + `06_Implementation_Plan_IDE_Prompt.md` |
| API endpoint modified (fields, logic, response shape) | `05_Backend_Schema.md` (update request/response) + `06_Implementation_Plan_IDE_Prompt.md` |
| New Google Sheet column added | `05_Backend_Schema.md` (update column table + COLUMNS array) + `06_Implementation_Plan_IDE_Prompt.md` |
| New Sheet tab added | `05_Backend_Schema.md` (add full schema section) + `02_TRD.md` |
| New React page/route added | `02_TRD.md` (routing section) + `03_App_Flow.md` (add page flow) + `06_Implementation_Plan_IDE_Prompt.md` |
| New React component created | `02_TRD.md` (directory structure) + `06_Implementation_Plan_IDE_Prompt.md` |
| New npm package added | `02_TRD.md` (tech stack table) + `06_Implementation_Plan_IDE_Prompt.md` (tech stack block) |
| Design token changed (color, font, spacing) | `04_UIUX_Design_Brief.md` (update palette / typography table) + `06_Implementation_Plan_IDE_Prompt.md` |
| New animation added | `04_UIUX_Design_Brief.md` (add to animation inventory) |
| New environment variable added | `02_TRD.md` (env vars table) + `05_Backend_Schema.md` (env vars table) + `06_Implementation_Plan_IDE_Prompt.md` |
| Business logic changed (cashback %, VIP threshold, tag rules) | `01_PRD.md` (if user-facing) + `05_Backend_Schema.md` (business rules section) + `06_Implementation_Plan_IDE_Prompt.md` |
| New integration added (new external API/service) | `02_TRD.md` (integrations section) + `05_Backend_Schema.md` + `06_Implementation_Plan_IDE_Prompt.md` |
| Deployment config changed (vercel.json, hosting) | `02_TRD.md` (deployment section) + `06_Implementation_Plan_IDE_Prompt.md` |
| New user flow or screen added | `03_App_Flow.md` (add full flow diagram) + `01_PRD.md` (feature table) |
| Success metric or goal changed | `01_PRD.md` (success metrics section) |
| Security fix applied | `07_Security_Audit.md` (update status) + `08_Security_Fixes_Applied.md` |

---

## RULE 3 — HOW TO UPDATE DOCS

When updating a document after a change:

1. **Be surgical** — only update the sections that are affected. Do not rewrite entire documents.
2. **Keep the same format** — maintain tables, code blocks, ASCII diagrams, and section headings consistent with the existing style.
3. **Update `06_Implementation_Plan_IDE_Prompt.md` last** — this is the master IDE prompt and must always be the final document updated (it aggregates everything).
4. **Add a version note** — at the top of each updated file, increment the version or add a "Last Updated" line if the change is significant.
5. **Never remove historical context** — move deprecated items to an "Archived / Out of Scope" section rather than deleting.

---

## RULE 4 — DOCUMENT REGISTRY

| File | Role | When to Read |
|---|---|---|
| [01_PRD.md](file:///d:/Antigravity/The_Groomers/docs/01_PRD.md) | What to build + why | Before adding/removing features |
| [02_TRD.md](file:///d:/Antigravity/The_Groomers/docs/02_TRD.md) | How it's built technically | Before creating files, adding packages, or changing architecture |
| [03_App_Flow.md](file:///d:/Antigravity/The_Groomers/docs/03_App_Flow.md) | How users move through the app | Before building any page or multi-step flow |
| [04_UIUX_Design_Brief.md](file:///d:/Antigravity/The_Groomers/docs/04_UIUX_Design_Brief.md) | Design system + visual rules | Before writing any CSS or UI component |
| [05_Backend_Schema.md](file:///d:/Antigravity/The_Groomers/docs/05_Backend_Schema.md) | Data model + API contracts | Before writing any API handler or touching Google Sheets |
| [06_Implementation_Plan_IDE_Prompt.md](file:///d:/Antigravity/The_Groomers/docs/06_Implementation_Plan_IDE_Prompt.md) | Master build prompt for any IDE | Always keep in sync — this is the rebuild reference |
| [07_Security_Audit.md](file:///d:/Antigravity/The_Groomers/docs/07_Security_Audit.md) | Full vulnerability findings | Reference when writing any new API or auth code |
| [08_Security_Fixes_Applied.md](file:///d:/Antigravity/The_Groomers/docs/08_Security_Fixes_Applied.md) | Applied fixes + open items | Check before deploying any new endpoint |

---

## RULE 5 — CONFIRMATION PROTOCOL

After making a change AND updating docs, always end your response with:

```
📄 Docs Updated:
  ✅ 05_Backend_Schema.md — Added `serviceCategory` column to Customers sheet
  ✅ 02_TRD.md — Added `serviceCategory` to COLUMNS array reference
  ✅ 06_Implementation_Plan_IDE_Prompt.md — Updated schema block

🔒 Security Check:
  ✅ CORS — setCors(req, res) from _lib/cors.js
  ✅ Auth — requirePin() applied (dashboard route)
  ✅ Inputs — validated before use
  ✅ Errors — generic message returned to client
  ✅ Logs — no PII logged
  ✅ Function count — still at or below 12
```

If you followed docs without making changes, end with:

```
📋 Following Docs:
  • Design from 04_UIUX_Design_Brief.md (glassmorphism system, gold #F5A623)
  • API shape from 05_Backend_Schema.md (POST /api/customers?action=add)

🔒 Security: No new API/auth code written — checklist not applicable
```

---

## RULE 6 — SECURITY-FIRST CODE ⚠️

**Every single piece of new code written for this project MUST pass this checklist before being finalised.**

The security baseline is documented in:
- [07_Security_Audit.md](file:///d:/Antigravity/The_Groomers/docs/07_Security_Audit.md) — original findings
- [08_Security_Fixes_Applied.md](file:///d:/Antigravity/The_Groomers/docs/08_Security_Fixes_Applied.md) — fixes applied
- [api/_lib/auth.js](file:///d:/Antigravity/The_Groomers/api/_lib/auth.js) — all security utilities

---

### 6A — Every New API Handler (`/api/*.js`)

| # | Check | Implementation |
|---|---|---|
| 1 | **CORS — origin allowlist** | `import setCors from './_lib/cors.js'` → call `setCors(req, res)` at top. **NEVER** `Access-Control-Allow-Origin: *` |
| 2 | **PIN auth on dashboard routes** | `import { requirePin } from './_lib/auth.js'` → `if (!requirePin(req, res)) return` |
| 3 | **Public vs protected split** | Scanner/booking routes: no PIN. Owner/dashboard routes: always PIN |
| 4 | **Input validation** | Validate all `req.query` and `req.body`. Use strict patterns (`/^\d{10}$/` for phone). Reject unknowns with 400 |
| 5 | **No error.message to client** | `catch (err) { console.error(...); return res.status(500).json({ error: 'An internal error occurred. Please try again.' }) }` |
| 6 | **No PII in logs** | Use `maskEmail(email)` and `maskPhone(phone)` from `_lib/auth.js` — never log raw customer data |
| 7 | **AI prompt sanitization** | All user inputs into Gemini/Anthropic prompts must pass through `sanitizePromptInput(str)` |
| 8 | **URL validation** | Any `image_url`, `receipt_url`, or external link must pass `isSafeUrl(url)` before storing |
| 9 | **Rate limiting** | PIN endpoint: `rateLimit(key, 5, 300_000)`. AI/email endpoints: `rateLimit(key, 10, 60_000)` |
| 10 | **CSV escaping** | All exported CSV fields wrapped with `escapeCsvField(value)` |
| 11 | **Vercel 12-function limit** | Count `.js` files in `/api` (exclude `_lib/` and `setup/`). Must stay ≤ 12. If adding would exceed 12 → consolidate or ask user first |
| 12 | **No secrets in code** | All keys/tokens via `process.env.X`. Never hardcoded |
| 13 | **Sheet tab allowlist** | Only use tab names in `ALLOWED_TABS` in `_lib/sheetsHelper.js`. Add new tabs to the set when creating new sheets |
| 14 | **RAW writes to Sheets** | `valueInputOption: 'RAW'` — never `'USER_ENTERED'` (prevents formula injection) |

---

### 6B — Every New React Component or Page

| # | Check | Implementation |
|---|---|---|
| 1 | **Protected calls use `dashRequest`** | Any call that reads/writes owner data uses `dashRequest()` from `src/utils/api.js` — auto-sends PIN header |
| 2 | **Public calls use `publicRequest`** | Customer-facing scanner routes use `publicRequest()` — no PIN attached |
| 3 | **No raw input in `dangerouslySetInnerHTML`** | Never use with user-supplied data. Sanitize first if unavoidable |
| 4 | **No secrets in frontend** | Never put API keys, PINs, or tokens in `.jsx`/`.js` frontend files. Only `VITE_` env vars are safe |
| 5 | **Session check before dashboard render** | Verify `getSessionPin()` returns non-null before rendering any owner screen |

---

### 6C — New Environment Variables

| # | Check | Implementation |
|---|---|---|
| 1 | **Placeholder in `.env.example` only** | Real value → Vercel env vars + local `.env`. Never commit real values |
| 2 | **Update docs** | Add to `02_TRD.md` + `05_Backend_Schema.md` + `06_Implementation_Plan_IDE_Prompt.md` |
| 3 | **Consistent naming** | Exact name used in `process.env.X` must match what's in Vercel + `.env.example` (the `ANTHROPIC_KEY` vs `ANTHROPIC_API_KEY` bug happened here) |

---

### 6D — New External API Integrations (Gemini, Resend, Twilio, etc.)

| # | Check | Implementation |
|---|---|---|
| 1 | **Keys server-side only** | Never in frontend or `VITE_` vars |
| 2 | **Sanitize inputs before sending** | All user data going to external APIs must be validated first |
| 3 | **Handle third-party errors gracefully** | Catch and return generic client error — never bubble raw third-party errors |
| 4 | **Rate limit trigger endpoint** | Any endpoint calling a paid API (AI, email, SMS) must have rate limiting |

---

### QUICK REFERENCE — Boilerplate for Every New `/api/*.js`

```javascript
import setCors from './_lib/cors.js'
import { requirePin, maskEmail, maskPhone } from './_lib/auth.js'

export default async function handler(req, res) {
  setCors(req, res)                                  // Rule 6A #1
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!requirePin(req, res)) return                  // Rule 6A #2 (dashboard routes only)

  const { action } = req.query

  try {
    // validate inputs here                          // Rule 6A #4
    // ... your logic

  } catch (err) {
    console.error('Handler error:', err)             // Rule 6A #5
    return res.status(500).json({ error: 'An internal error occurred. Please try again.' })
  }
}
```

---

## EXAMPLES

### Example A — No change mentioned
> User: "Add a new component that shows the customer's cashback history"

→ Read `04_UIUX_Design_Brief.md` for glassmorphism card style
→ Read `05_Backend_Schema.md` for available fields (totalCashback, cashbackEarned, visits)
→ Build with `dashRequest()` for data fetch (Rule 6B #1)
→ Verify no secrets in frontend, no PII logged (Rule 6B #4, #5)
→ Update `02_TRD.md` + `03_App_Flow.md` if flow changes

### Example B — Explicit change requested
> User: "Change the VIP threshold from 5 visits to 8 visits"

→ Update `googleSheets.js` (visits >= 8 → VIP)
→ Update `05_Backend_Schema.md` Business Rules + `06_Implementation_Plan_IDE_Prompt.md`

### Example C — New feature
> User: "Add SMS notification when a customer earns VIP status"

→ Read `01_PRD.md` — SMS not in scope, treat as new feature
→ Rate limit the trigger endpoint (Rule 6D #4)
→ Keys in env vars only (Rule 6D #1)
→ Update `01_PRD.md` + `02_TRD.md` + `05_Backend_Schema.md` + `06_...`

### Example D — New API file
> User: "Create /api/notifications.js"

→ Check function count first — must be ≤ 12 (Rule 6A #11)
→ Start with boilerplate above (CORS + requirePin + try/catch)
→ Validate all inputs, mask PII in logs
→ Update `02_TRD.md` + `05_Backend_Schema.md` + `06_...`

### Example E — New env variable
> User: "Add Twilio SMS"

→ Add `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` to `.env.example` with placeholder only (Rule 6C #1)
→ Tell user to set real values in Vercel env vars
→ Rate limit the SMS-triggering endpoint (Rule 6D #4)
→ Update `02_TRD.md` + `05_Backend_Schema.md` + `06_...`
