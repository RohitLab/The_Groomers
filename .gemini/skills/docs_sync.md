# Skill: Auto-Sync Project Documentation
## The Groomers — Unisex Salon CRM & Loyalty Platform

**Skill ID:** `docs-sync`  
**Location:** `d:\Antigravity\The_Groomers\.gemini\skills\docs_sync.md`  
**Applies to:** All work done in `d:\Antigravity\The_Groomers\`

---

## PURPOSE

This skill governs two behaviors for every interaction in this project:

1. **IF the user describes or requests a code/feature change** → Make the change AND update the relevant `docs/` files to reflect it.
2. **IF the user does NOT describe a change** → Read and follow the existing `docs/` files as the single source of truth before doing any work.

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

The `docs/` folder contains these canonical documents:

| File | Role | When to Read |
|---|---|---|
| [01_PRD.md](file:///d:/Antigravity/The_Groomers/docs/01_PRD.md) | What to build + why | Before adding/removing features |
| [02_TRD.md](file:///d:/Antigravity/The_Groomers/docs/02_TRD.md) | How it's built technically | Before creating files, adding packages, or changing architecture |
| [03_App_Flow.md](file:///d:/Antigravity/The_Groomers/docs/03_App_Flow.md) | How users move through the app | Before building any page or multi-step flow |
| [04_UIUX_Design_Brief.md](file:///d:/Antigravity/The_Groomers/docs/04_UIUX_Design_Brief.md) | Design system + visual rules | Before writing any CSS or UI component |
| [05_Backend_Schema.md](file:///d:/Antigravity/The_Groomers/docs/05_Backend_Schema.md) | Data model + API contracts | Before writing any API handler or touching Google Sheets |
| [06_Implementation_Plan_IDE_Prompt.md](file:///d:/Antigravity/The_Groomers/docs/06_Implementation_Plan_IDE_Prompt.md) | Master build prompt for any IDE | Always keep in sync — this is the rebuild reference |

---

## RULE 5 — CONFIRMATION PROTOCOL

After making a change AND updating docs, always end your response with a **Docs Updated** summary like this:

```
📄 Docs Updated:
  ✅ 05_Backend_Schema.md — Added `serviceCategory` column to Customers sheet
  ✅ 02_TRD.md — Added `serviceCategory` to COLUMNS array reference
  ✅ 06_Implementation_Plan_IDE_Prompt.md — Updated schema block
```

If you followed docs without making changes, end with:

```
📋 Following Docs:
  • Design from 04_UIUX_Design_Brief.md (glassmorphism system, gold #F5A623)
  • API shape from 05_Backend_Schema.md (POST /api/customers?action=add)
```

---

## EXAMPLES

### Example A — No change mentioned
> User: "Add a new component that shows the customer's cashback history"

→ Read `04_UIUX_Design_Brief.md` for glassmorphism card style  
→ Read `05_Backend_Schema.md` for available customer fields (totalCashback, cashbackEarned, visits)  
→ Read `02_TRD.md` to see where to place the new component  
→ Build the component using existing patterns  
→ Update `02_TRD.md` (new component listed) + `03_App_Flow.md` (if it changes a flow)  

### Example B — Explicit change requested
> User: "Change the VIP threshold from 5 visits to 8 visits"

→ Update the code: `googleSheets.js` (visits >= 8 → VIP logic)  
→ Update docs:
  - `05_Backend_Schema.md` → Business Rules section: `visits >= 8 → tag = "VIP"`
  - `06_Implementation_Plan_IDE_Prompt.md` → LOYALTY RULES block

### Example C — New feature
> User: "Add an SMS notification when a customer earns VIP status"

→ Read `01_PRD.md` to check if SMS was in scope (it wasn't)  
→ Treat as a new feature: implement + update all relevant docs  
→ `01_PRD.md` → add to Dashboard features table  
→ `02_TRD.md` → add SMS service to integrations  
→ `05_Backend_Schema.md` → add trigger logic  
→ `06_Implementation_Plan_IDE_Prompt.md` → update KEY BUSINESS LOGIC block  
