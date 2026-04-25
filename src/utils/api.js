async function request(endpoint, options = {}) {
  const res = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Scanner / Customer lookup
  lookupPhone: (phone) => request('/api/customers?action=lookup', { method: 'POST', body: JSON.stringify({ phone }) }),
  registerCustomer: (data) => request('/api/customers?action=add', { method: 'POST', body: JSON.stringify(data) }),
  recordReturnVisit: (phone, data) => request('/api/customers?action=return-visit', { method: 'POST', body: JSON.stringify({ phone, ...data }) }),
  processBill: (phone, billAmount, isNew) => request('/api/customers?action=bill', { method: 'POST', body: JSON.stringify({ phone, billAmount, isNew }) }),

  // Customers
  getCustomers: (filter) => request(`/api/customers?action=list${filter ? `&tag=${filter}` : ''}`),
  getCustomer: (phone) => request(`/api/customers?action=check&phone=${phone}`),

  // Campaigns
  composeCampaign: (data) => request('/api/campaigns?action=generate', { method: 'POST', body: JSON.stringify(data) }),
  exportCustomers: (filter) => request('/api/campaigns?action=export', { method: 'POST', body: JSON.stringify({ filter }) }),

  // Settings
  getSettings: () => request('/api/settings?action=get'),
  updateSettings: (data) => request('/api/settings?action=update', { method: 'POST', body: JSON.stringify(data) }),

  // Auth
  verifyPin: (pin) => request('/api/settings?action=verify-pin', { method: 'POST', body: JSON.stringify({ pin }) }),
}
