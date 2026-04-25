const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Scanner
  lookupPhone: (phone) => request('/api/scanner/lookup', { method: 'POST', body: JSON.stringify({ phone }) }),
  registerCustomer: (data) => request('/api/scanner/register', { method: 'POST', body: JSON.stringify(data) }),
  recordReturnVisit: (phone, data) => request('/api/scanner/return-visit', { method: 'POST', body: JSON.stringify({ phone, ...data }) }),
  processBill: (phone, billAmount, isNew) => request('/api/scanner/bill', { method: 'POST', body: JSON.stringify({ phone, billAmount, isNew }) }),

  // Customers
  getCustomers: (filter) => request(`/api/customers${filter ? `?tag=${filter}` : ''}`),
  getCustomer: (phone) => request(`/api/customers/${phone}`),

  // Campaigns
  composeCampaign: (data) => request('/api/campaigns/compose', { method: 'POST', body: JSON.stringify(data) }),
  exportCustomers: (filter) => request('/api/campaigns/export', { method: 'POST', body: JSON.stringify({ filter }) }),

  // Settings
  getSettings: () => request('/api/settings'),
  updateSettings: (data) => request('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  verifyPin: (pin) => request('/api/auth/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
}
