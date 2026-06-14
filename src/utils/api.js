// ─── Session helpers ─────────────────────────────────────────────────────────
// PIN is stored in sessionStorage (cleared when browser tab closes).
// An 8-hour expiry is enforced to auto-logout stale sessions.
const SESSION_KEY = 'groomers_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours

export function saveSession(pin) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    pin,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }))
}

export function getSessionPin() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const { pin, expiresAt } = JSON.parse(raw)
    // VULN-022: Auto-expire sessions after 8 hours
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return pin
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

// ─── Base fetch helpers ──────────────────────────────────────────────────────

// Public request — no auth header (scanner, public settings lookup)
async function publicRequest(endpoint, options = {}) {
  const res = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// Protected request — attaches dashboard PIN header automatically
async function dashRequest(endpoint, options = {}) {
  const pin = getSessionPin()
  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      // VULN-003 FIX: Send PIN on every protected dashboard request
      ...(pin ? { 'X-Dashboard-Pin': pin } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ─── API surface ─────────────────────────────────────────────────────────────

export const api = {
  // ── Scanner / Public ─── (no PIN required — customer-facing)
  lookupPhone:       (phone) =>       publicRequest('/api/customers?action=lookup', { method: 'POST', body: JSON.stringify({ phone }) }),
  registerCustomer:  (data) =>        publicRequest('/api/customers?action=add',    { method: 'POST', body: JSON.stringify(data) }),
  recordReturnVisit: (phone, data) => publicRequest('/api/customers?action=return-visit', { method: 'POST', body: JSON.stringify({ phone, ...data }) }),
  processBill:       (phone, billAmount, isNew) => publicRequest('/api/customers?action=bill', { method: 'POST', body: JSON.stringify({ phone, billAmount, isNew }) }),
  getCustomer:       (phone) =>       publicRequest(`/api/customers?action=check&phone=${phone}`),
  getSettings:       () =>            publicRequest('/api/settings?action=get'),

  // ── Auth ───
  verifyPin: (pin) => publicRequest('/api/settings?action=verify-pin', { method: 'POST', body: JSON.stringify({ pin }) }),

  // ── Dashboard (PIN-protected) ───
  getCustomers:    (filter) => dashRequest(`/api/customers?action=list${filter ? `&tag=${filter}` : ''}`),
  updateSettings:  (data)   => dashRequest('/api/settings?action=update', { method: 'POST', body: JSON.stringify(data) }),
  composeCampaign: (data)   => dashRequest('/api/campaigns?action=generate', { method: 'POST', body: JSON.stringify(data) }),
  exportCustomers: (filter) => dashRequest('/api/campaigns?action=export', { method: 'POST', body: JSON.stringify({ filter }) }),

  // ── Sales (PIN-protected) ───
  getSales:       (params) => dashRequest(`/api/sales?action=getSales&${new URLSearchParams(params || {})}`),
  recordSale:     (data)   => dashRequest('/api/sales?action=recordSale', { method: 'POST', body: JSON.stringify(data) }),

  // ── Inventory (PIN-protected) ───
  getProducts:    ()       => dashRequest('/api/inventory?action=getProducts'),
  addProduct:     (data)   => dashRequest('/api/inventory?action=addProduct', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct:  (data)   => dashRequest('/api/inventory?action=updateProduct', { method: 'POST', body: JSON.stringify(data) }),
  stockIn:        (data)   => dashRequest('/api/inventory?action=stockIn', { method: 'POST', body: JSON.stringify(data) }),
  stockOut:       (data)   => dashRequest('/api/inventory?action=stockOut', { method: 'POST', body: JSON.stringify(data) }),

  // ── Expenses (PIN-protected) ───
  getExpenses:    (params) => dashRequest(`/api/expenses?action=getExpenses&${new URLSearchParams(params || {})}`),
  addExpense:     (data)   => dashRequest('/api/expenses?action=addExpense', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense:  (data)   => dashRequest('/api/expenses?action=deleteExpense', { method: 'POST', body: JSON.stringify(data) }),

  // ── P&L (PIN-protected) ───
  getPLSummary:   (params) => dashRequest(`/api/pl?action=getPLSummary&${new URLSearchParams(params || {})}`),
  getDailyPL:     ()       => dashRequest('/api/pl?action=getDailyPL'),
  getMonthlyPL:   ()       => dashRequest('/api/pl?action=getMonthlyPL'),
}
