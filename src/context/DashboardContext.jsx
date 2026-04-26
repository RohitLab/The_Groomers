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
    newCustomerCashbackPercent: 10,
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
      console.error('Failed to fetch customers')
      setCustomers([])
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



