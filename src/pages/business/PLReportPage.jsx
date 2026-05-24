import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSheetData } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency } from '../../constants/businessTheme'

const { animations } = BUSINESS_THEME

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' },
]

function CountUp({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const target = parseFloat(value) || 0
    const start = display
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (target - start) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value])

  return formatCurrency(display)
}

export default function PLReportPage() {
  const [period, setPeriod] = useState('month')
  const { data, loading } = useSheetData(`pl?action=getPLSummary&period=${period}`)
  const { data: dailyData } = useSheetData('pl?action=getDailyPL')
  const { data: monthlyData } = useSheetData('pl?action=getMonthlyPL')

  const pl = data?.data || {}
  const daily = dailyData?.data || []
  const monthly = monthlyData?.data || []

  const handlePrint = () => window.print()

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <div>
          <h1 className="biz-page__title">📈 Profit & Loss</h1>
          <p className="biz-page__subtitle">Financial overview</p>
        </div>
        <button className="glass-btn no-print" onClick={handlePrint}>🖨️ Print</button>
      </div>

      {/* Period Selector */}
      <div className="biz-tabs no-print">
        {PERIODS.map(p => (
          <button key={p.id} className={`biz-tab ${period === p.id ? 'biz-tab--active' : ''}`} onClick={() => setPeriod(p.id)}>
            {p.label}
            {period === p.id && <motion.div className="biz-tab__indicator" layoutId="plPeriod" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="biz-skeleton-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card biz-skeleton-card anim-shimmer" />)}
        </div>
      ) : (
        <>
          {/* P&L Statement Card */}
          <motion.div className="glass-card glass-card--elevated biz-pl-card" {...animations.slideUp}>
            <h3 className="biz-pl-card__title">📊 Profit & Loss Statement</h3>

            <div className="biz-pl-line biz-pl-line--section">
              <span>💰 Revenue</span>
              <span className="biz-pl-line__value"><CountUp value={pl.revenue} /></span>
            </div>
            <div className="biz-pl-line biz-pl-line--sub">
              <span>Cost of Goods Sold (COGS)</span>
              <span>({formatCurrency(pl.cogs)})</span>
            </div>

            <div className="glass-divider" />

            <div className="biz-pl-line biz-pl-line--section">
              <span>📊 Gross Profit</span>
              <span className="biz-pl-line__value" style={{ color: '#7EC699' }}>
                <CountUp value={pl.grossProfit} />
              </span>
            </div>
            <div className="biz-pl-line biz-pl-line--sub">
              <span>Gross Margin</span>
              <span>{pl.grossMargin}%</span>
            </div>

            <div className="glass-divider" />

            <div className="biz-pl-line biz-pl-line--section">
              <span>💸 Operating Expenses</span>
              <span className="biz-pl-line__value" style={{ color: '#D4766E' }}>
                ({formatCurrency(pl.totalExpenses)})
              </span>
            </div>

            <div className="glass-divider" />

            <div className={`biz-pl-line biz-pl-line--total ${(pl.netProfit || 0) >= 0 ? 'biz-pl-line--profit' : 'biz-pl-line--loss'}`}>
              <span>📈 Net Profit</span>
              <span className="biz-pl-line__value">
                <CountUp value={pl.netProfit} />
              </span>
            </div>
            <div className="biz-pl-line biz-pl-line--sub">
              <span>Net Margin</span>
              <span>{pl.netMargin}%</span>
            </div>

            {/* Changes vs prev period */}
            <div className="biz-pl-changes">
              <div className={`biz-pl-change ${(pl.revenueChange || 0) >= 0 ? 'biz-pl-change--up' : 'biz-pl-change--down'}`}>
                <span>{(pl.revenueChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(pl.revenueChange || 0)}%</span>
                <span>Revenue</span>
              </div>
              <div className={`biz-pl-change ${(pl.expenseChange || 0) <= 0 ? 'biz-pl-change--up' : 'biz-pl-change--down'}`}>
                <span>{(pl.expenseChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(pl.expenseChange || 0)}%</span>
                <span>Expenses</span>
              </div>
              <div className={`biz-pl-change ${(pl.profitChange || 0) >= 0 ? 'biz-pl-change--up' : 'biz-pl-change--down'}`}>
                <span>{(pl.profitChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(pl.profitChange || 0)}%</span>
                <span>Profit</span>
              </div>
            </div>
          </motion.div>

          {/* Charts Section - CSS bar charts since recharts not installed yet */}
          <div className="biz-chart-grid">
            {/* Daily Revenue Chart */}
            <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>📊 Daily Revenue (30 days)</h3>
              <div className="biz-bar-chart">
                {daily.slice(-15).map((d, i) => {
                  const maxRev = Math.max(...daily.map(dd => dd.revenue), 1)
                  return (
                    <div key={i} className="biz-bar-chart__col">
                      <motion.div
                        className="biz-bar-chart__bar"
                        style={{ background: 'rgba(126,198,153,0.6)' }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.revenue / maxRev) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.03 }}
                      />
                      <span className="biz-bar-chart__label">{d.label?.split(' ')[1] || ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Monthly Profit Trend */}
            <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>📈 Monthly Profit Trend</h3>
              <div className="biz-bar-chart">
                {monthly.map((m, i) => {
                  const maxProfit = Math.max(...monthly.map(mm => Math.abs(mm.netProfit)), 1)
                  const isPositive = m.netProfit >= 0
                  return (
                    <div key={i} className="biz-bar-chart__col">
                      <motion.div
                        className="biz-bar-chart__bar"
                        style={{ background: isPositive ? 'rgba(126,198,153,0.6)' : 'rgba(212,118,110,0.6)' }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(Math.abs(m.netProfit) / maxProfit) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      />
                      <span className="biz-bar-chart__label">{m.month?.split(' ')[0]?.slice(0, 3) || ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
