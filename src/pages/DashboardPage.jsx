import { motion } from 'framer-motion'
import { DashboardProvider, useDashboard } from '../context/DashboardContext'
import PinGate from '../components/Dashboard/PinGate'
import Sidebar from '../components/Dashboard/Sidebar'
import CustomerTable from '../components/Dashboard/CustomerTable'
import CampaignComposer from '../components/Dashboard/CampaignComposer'
import AnalyticsCards from '../components/Dashboard/AnalyticsCards'
import SettingsPanel from '../components/Dashboard/SettingsPanel'

function DashboardContent() {
  const { authenticated, activeTab } = useDashboard()

  if (!authenticated) return <PinGate />

  const renderTab = () => {
    switch (activeTab) {
      case 'customers': return <CustomerTable />
      case 'campaigns': return <CampaignComposer />
      case 'analytics': return <AnalyticsCards />
      case 'settings': return <SettingsPanel />
      default: return <CustomerTable />
    }
  }

  return (
    <motion.div className="dashboard-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Sidebar />
      <main className="dashboard-main">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {renderTab()}
        </motion.div>
      </main>
      {/* Mobile bottom nav */}
      <MobileNav />
    </motion.div>
  )
}

function MobileNav() {
  const { activeTab, setActiveTab } = useDashboard()
  const tabs = [
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'campaigns', icon: '📢', label: 'Campaigns' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]
  return (
    <nav className="mobile-nav">
      {tabs.map(t => (
        <button key={t.id} className={`mobile-nav__item ${activeTab === t.id ? 'mobile-nav__item--active' : ''}`} onClick={() => setActiveTab(t.id)}>
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
