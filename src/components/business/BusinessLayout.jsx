import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { BUSINESS_THEME } from '../../constants/businessTheme'
import { ToastProvider } from './Toast'

import BusinessDashboard from '../../pages/business/BusinessDashboard'
import InventoryPage from '../../pages/business/InventoryPage'
import AddProductPage from '../../pages/business/AddProductPage'
import StockMovementPage from '../../pages/business/StockMovementPage'
import NewSalePage from '../../pages/business/NewSalePage'
import SalesPage from '../../pages/business/SalesPage'
import ExpensesPage from '../../pages/business/ExpensesPage'
import PLReportPage from '../../pages/business/PLReportPage'
import ReportsPage from '../../pages/business/ReportsPage'
import LogoBrand from '../LogoBrand'

const { animations } = BUSINESS_THEME

const NAV_ITEMS = [
  { id: 'dashboard', path: '/business', icon: '📊', label: 'Dashboard', exact: true },
  { id: 'inventory', path: '/business/inventory', icon: '📦', label: 'Inventory' },
  { id: 'new-sale', path: '/business/new-sale', icon: '💰', label: 'New Sale' },
  { id: 'sales', path: '/business/sales', icon: '📋', label: 'Sales History' },
  { id: 'expenses', path: '/business/expenses', icon: '💸', label: 'Expenses' },
  { id: 'pl', path: '/business/pl', icon: '📈', label: 'P&L Report' },
  { id: 'reports', path: '/business/reports', icon: '📄', label: 'Reports' },
]

function PinGate({ onAuth }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleKey = async (digit) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    if (newPin.length === 4) {
      setLoading(true)
      // Try API, fallback to default PIN
      try {
        const res = await fetch('/api/settings?action=verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: newPin }),
        })
        if (res.ok) { onAuth(); setLoading(false); return }
      } catch {}

      if (newPin === '1234') { onAuth(); setLoading(false); return }
      setError('Incorrect PIN')
      setPin('')
      setLoading(false)
    }
  }

  return (
    <div className="pin-gate">
      <div className="glass-card glass-card--elevated pin-gate__card anim-float-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
          <LogoBrand size="medium" />
        </div>
        <h1 className="pin-gate__title">Business Dashboard</h1>
        <p className="pin-gate__desc">Enter your 4-digit PIN</p>

        <div className="pin-dots">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'pin-dot--filled' : ''}`} />
          ))}
        </div>

        {loading && <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />}

        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <button key={d} className="pin-key" onClick={() => handleKey(String(d))} disabled={loading}>{d}</button>
          ))}
          <div />
          <button className="pin-key" onClick={() => handleKey('0')} disabled={loading}>0</button>
          <button className="pin-key pin-key--action" onClick={() => { setPin(p => p.slice(0, -1)); setError('') }} disabled={loading}>⌫</button>
        </div>

        {error && <p className="pin-error anim-fade-up">{error}</p>}
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
          Default PIN: 1234
        </p>
      </div>
    </div>
  )
}

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  return (
    <motion.aside
      className={`biz-sidebar ${collapsed ? 'biz-sidebar--collapsed' : ''}`}
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="biz-sidebar__logo">
        {!collapsed && <LogoBrand size="medium" theme="dark" />}
        <button className="biz-sidebar__collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="biz-sidebar__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar__link ${isActive(item) ? 'sidebar__link--active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      <div className="biz-sidebar__footer">
        <button
          className="sidebar__link"
          onClick={() => navigate('/dashboard')}
          title="CRM Dashboard"
          style={{
            background: 'rgba(106,171,247,0.08)',
            border: '1px solid rgba(106,171,247,0.2)',
            borderRadius: '8px',
            color: '#6AABF7',
            marginBottom: '6px',
          }}
        >
          <span className="sidebar__link-icon">📋</span>
          {!collapsed && 'CRM Dashboard'}
        </button>
        <button className="sidebar__link" onClick={() => navigate('/')} title="Home">
          <span className="sidebar__link-icon">🏠</span>
          {!collapsed && 'Home'}
        </button>
        {!collapsed && <p className="sidebar__version">Business Suite v1.0</p>}
      </div>
    </motion.aside>
  )
}

function MobileBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const mobileItems = NAV_ITEMS.slice(0, 5) // Show 5 for mobile

  return (
    <nav className="biz-mobile-nav">
      {mobileItems.map(item => {
        const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
        return (
          <button
            key={item.id}
            className={`biz-mobile-nav__item ${active ? 'biz-mobile-nav__item--active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function BusinessLayout() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('biz_auth') === 'true'
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const handleAuth = useCallback(() => {
    setAuthenticated(true)
    sessionStorage.setItem('biz_auth', 'true')
    setLastActivity(Date.now())
  }, [])

  // Auto-logout after 30 min inactivity
  useEffect(() => {
    if (!authenticated) return

    const resetTimer = () => setLastActivity(Date.now())
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 30 * 60 * 1000) {
        setAuthenticated(false)
        sessionStorage.removeItem('biz_auth')
      }
    }, 60000)

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearInterval(interval)
    }
  }, [authenticated, lastActivity])

  if (!authenticated) return <PinGate onAuth={handleAuth} />

  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  return (
    <ToastProvider>
      <div className="biz-layout">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className={`biz-main ${sidebarCollapsed ? 'biz-main--expanded' : ''}`}>
          {isDev && (
            <div style={{
              padding: '8px 16px', marginBottom: '16px',
              background: 'rgba(232,200,122,0.10)',
              border: '1px solid rgba(232,200,122,0.25)',
              borderRadius: '8px',
              fontSize: '0.8rem', color: '#E8C87A',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚡ <strong>Dev mode:</strong> UI works, but API data requires Vercel. Empty states are normal — deploy to see live data.
            </div>
          )}
          <AnimatePresence mode="wait">
            <Routes>
              <Route index element={<BusinessDashboard />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="add-product" element={<AddProductPage />} />
              <Route path="stock" element={<StockMovementPage />} />
              <Route path="new-sale" element={<NewSalePage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="pl" element={<PLReportPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/business" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        <MobileBottomNav />
      </div>
    </ToastProvider>
  )
}
