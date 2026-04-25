import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('customers')
  const [customers, setCustomers] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    salonName: 'The Grommers',
    cashbackPercent: 5,
    minBill: 100,
    maxCashback: 500,
    instagramUrl: 'https://www.instagram.com/thegroomerss/',
    facebookUrl: 'https://facebook.com/thegrommers',
    googleReviewUrl: 'https://g.page/thegrommers/review',
    whatsappNumber: '',
    scanUrl: '',
  })

  const verifyPin = useCallback(async (pin) => {
    try {
      await api.verifyPin(pin)
      setAuthenticated(true)
      return true
    } catch {
      // Demo mode: accept 1234
      if (pin === '1234') { setAuthenticated(true); return true }
      return false
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getCustomers(filter === 'all' ? '' : filter)
      setCustomers(res.customers || [])
    } catch {
      // Demo data
      setCustomers(getDemoCustomers())
    } finally {
      setLoading(false)
    }
  }, [filter])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.getSettings()
      setSettings(s => ({ ...s, ...res.settings }))
    } catch {
      // Use defaults
    }
  }, [])

  const saveSettings = useCallback(async (newSettings) => {
    setSettings(s => ({ ...s, ...newSettings }))
    try {
      await api.updateSettings(newSettings)
    } catch {
      // Saved locally in demo mode
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchCustomers()
      fetchSettings()
    }
  }, [authenticated, fetchCustomers, fetchSettings])

  const filteredCustomers = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q)
  })

  const analytics = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      if (!c.firstVisit) return false
      const d = new Date(c.firstVisit)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
    vips: customers.filter(c => c.tag === 'VIP').length,
    avgVisits: customers.length ? (customers.reduce((s, c) => s + (c.visits || 0), 0) / customers.length).toFixed(1) : '0',
    totalCashback: customers.reduce((s, c) => s + (c.totalCashback || 0), 0),
  }

  return (
    <DashboardContext.Provider value={{
      authenticated, verifyPin, activeTab, setActiveTab,
      customers: filteredCustomers, allCustomers: customers,
      filter, setFilter, search, setSearch, loading,
      settings, saveSettings, analytics, fetchCustomers,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => useContext(DashboardContext)

function getDemoCustomers() {
  return [
    { phone: '9876543210', name: 'Rahul Sharma', email: 'rahul@email.com', visits: 8, tag: 'VIP', lastVisit: '2026-04-20', firstVisit: '2025-11-15', totalCashback: 450, instagramFollowed: true, facebookFollowed: true, googleReview: true, gender: 'Male' },
    { phone: '9876543211', name: 'Priya Patel', email: 'priya@email.com', visits: 3, tag: 'Regular', lastVisit: '2026-04-18', firstVisit: '2026-01-10', totalCashback: 180, instagramFollowed: true, facebookFollowed: false, googleReview: true, gender: 'Female' },
    { phone: '9876543212', name: 'Amit Kumar', email: 'amit@email.com', visits: 1, tag: 'New', lastVisit: '2026-04-22', firstVisit: '2026-04-22', totalCashback: 30, instagramFollowed: false, facebookFollowed: false, googleReview: false, gender: 'Male' },
    { phone: '9876543213', name: 'Sneha Gupta', email: 'sneha@email.com', visits: 12, tag: 'VIP', lastVisit: '2026-04-24', firstVisit: '2025-06-01', totalCashback: 890, instagramFollowed: true, facebookFollowed: true, googleReview: true, gender: 'Female' },
    { phone: '9876543214', name: 'Vikram Singh', email: 'vikram@email.com', visits: 2, tag: 'Regular', lastVisit: '2026-03-15', firstVisit: '2026-02-20', totalCashback: 95, instagramFollowed: false, facebookFollowed: false, googleReview: true, gender: 'Male' },
    { phone: '9876543215', name: 'Meera Joshi', email: 'meera@email.com', visits: 6, tag: 'VIP', lastVisit: '2026-04-10', firstVisit: '2025-09-08', totalCashback: 520, instagramFollowed: true, facebookFollowed: true, googleReview: true, gender: 'Female' },
    { phone: '9876543216', name: 'Arjun Reddy', email: 'arjun@email.com', visits: 1, tag: 'New', lastVisit: '2026-04-25', firstVisit: '2026-04-25', totalCashback: 45, instagramFollowed: true, facebookFollowed: false, googleReview: false, gender: 'Male' },
  ]
}
