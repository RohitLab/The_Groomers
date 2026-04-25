import { useDashboard } from '../../context/DashboardContext'

export default function AnalyticsCards() {
  const { analytics, settings } = useDashboard()

  const metrics = [
    { label: 'Total Customers', value: analytics.total, icon: '👥' },
    { label: 'New This Month', value: analytics.newThisMonth, icon: '🆕', change: '+' + analytics.newThisMonth },
    { label: 'VIP Members', value: analytics.vips, icon: '⭐' },
    { label: 'Avg Visits', value: analytics.avgVisits, icon: '📈' },
    { label: 'Total Cashback Issued', value: `₹${analytics.totalCashback.toLocaleString('en-IN')}`, icon: '💰' },
    { label: 'Cashback Rate', value: `${settings.cashbackPercent}%`, icon: '🎯' },
  ]

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Analytics</h1>
      </div>

      <div className="analytics-grid stagger-children">
        {metrics.map(m => (
          <div key={m.label} className="glass-card glass-card--elevated metric-card tilt-3d">
            <p className="metric-card__label">{m.icon} {m.label}</p>
            <p className="metric-card__value">{m.value}</p>
            {m.change && <p className="metric-card__change">{m.change} this month</p>}
          </div>
        ))}
      </div>

      {/* Quick insights */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-4)' }}>Quick Insights</h3>
        <div className="stagger-children">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            📊 <strong>{analytics.vips}</strong> VIP customers account for your most loyal base
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            🔄 Average customer visits <strong>{analytics.avgVisits}</strong> times
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            💸 ₹{analytics.totalCashback.toLocaleString('en-IN')} total cashback issued at {settings.cashbackPercent}% rate
          </p>
        </div>
      </div>
    </div>
  )
}
