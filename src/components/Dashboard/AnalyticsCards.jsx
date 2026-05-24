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

      {/* ── Business Suite Card ── */}
      <a
        href="/business"
        style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--space-5)' }}
      >
        <div style={{
          padding: '20px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(126,198,153,0.08) 0%, rgba(106,171,247,0.08) 50%, rgba(232,200,122,0.08) 100%)',
          border: '1px solid rgba(126,198,153,0.25)',
          boxShadow: '0 0 24px rgba(126,198,153,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.border = '1px solid rgba(126,198,153,0.5)'
          e.currentTarget.style.boxShadow = '0 0 32px rgba(126,198,153,0.15)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.border = '1px solid rgba(126,198,153,0.25)'
          e.currentTarget.style.boxShadow = '0 0 24px rgba(126,198,153,0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(126,198,153,0.2), rgba(106,171,247,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0,
            }}>
              🏪
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-cream)', marginBottom: '4px' }}>
                Business Suite
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['📦 Inventory', '💰 Sales', '💸 Expenses', '📈 P&L'].map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '1.25rem', color: '#7EC699', opacity: 0.8,
            transition: 'transform 0.2s ease',
          }}>
            →
          </div>
        </div>
      </a>

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
