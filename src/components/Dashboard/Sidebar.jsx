import { useDashboard } from '../../context/DashboardContext'
import LogoBrand from '../LogoBrand'

const NAV_ITEMS = [
  { id: 'customers',    icon: '👥', label: 'Customers' },
  { id: 'appointments', icon: '📅', label: 'Appointments' },
  { id: 'campaigns',   icon: '📢', label: 'Campaigns' },
  { id: 'analytics',   icon: '📊', label: 'Analytics' },
  { id: 'settings',    icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab } = useDashboard()

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar__logo">
        <LogoBrand size="medium" theme="dark" />
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar__link ${activeTab === item.id ? 'sidebar__link--active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__version">The Grommers CRM v1.0</p>
      </div>
    </aside>
  )
}
