import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSheetData } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency } from '../../constants/businessTheme'
import MetricCard from '../../components/business/MetricCard'

const { animations } = BUSINESS_THEME

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
]

export default function BusinessDashboard() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')

  const { data: plData, loading: plLoading } = useSheetData(`pl?action=getPLSummary&period=${period}`)
  const { data: lowStockData } = useSheetData('inventory?action=getLowStock')
  const { data: invValueData } = useSheetData('inventory?action=getInventoryValue')
  const { data: recentSalesData } = useSheetData(`sales?action=getSales&period=week`)
  const { data: topProductsData } = useSheetData(`sales?action=getTopProducts&period=${period}`)
  const { data: dailyData } = useSheetData('pl?action=getDailyPL')
  const { data: expSummaryData } = useSheetData(`expenses?action=getExpenseSummary&period=${period}`)

  const pl = plData?.data || {}
  const lowStock = lowStockData?.data || []
  const invValue = invValueData?.data || {}
  const recentSales = (recentSalesData?.data || []).slice(0, 5)
  const topProducts = (topProductsData?.data || []).slice(0, 5)
  const daily = dailyData?.data || []
  const expCategories = expSummaryData?.data?.byCategory || []

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <div>
          <h1 className="biz-page__title">📊 Business Dashboard</h1>
          <p className="biz-page__subtitle">Overview of your business performance</p>
        </div>
      </div>

      {/* Period Toggle */}
      <div className="biz-period-toggle">
        {PERIODS.map(p => (
          <button
            key={p.id}
            className={`biz-period-btn ${period === p.id ? 'biz-period-btn--active' : ''}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
            {period === p.id && (
              <motion.div className="biz-period-btn__indicator" layoutId="dashPeriod" />
            )}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <motion.div
        className="biz-metric-grid"
        variants={animations.staggerContainer}
        initial="initial"
        animate="animate"
      >
        <MetricCard
          icon="💰"
          title="Revenue"
          value={formatCurrency(pl.revenue || 0)}
          change={pl.revenueChange}
          color="#7EC699"
          loading={plLoading}
        />
        <MetricCard
          icon="💸"
          title="Expenses"
          value={formatCurrency(pl.totalExpenses || 0)}
          change={pl.expenseChange}
          changeType={pl.expenseChange <= 0 ? 'up' : 'down'}
          color="#D4766E"
          loading={plLoading}
        />
        <MetricCard
          icon="📈"
          title="Net Profit"
          value={formatCurrency(pl.netProfit || 0)}
          change={pl.profitChange}
          suffix={` (${pl.netMargin || 0}%)`}
          color={pl.netProfit >= 0 ? '#7EC699' : '#D4766E'}
          loading={plLoading}
        />
        <MetricCard
          icon="📦"
          title="Inventory Value"
          value={formatCurrency(invValue.retail_value || 0)}
          suffix={lowStock.length > 0 ? ` • ${lowStock.length} ⚠️` : ''}
          color="#E8C87A"
          loading={plLoading}
        />
      </motion.div>

      {/* Charts Row */}
      <div className="biz-chart-grid">
        {/* Revenue Bar Chart */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            📊 Revenue (Last 15 days)
          </h3>
          <div className="biz-bar-chart">
            {daily.slice(-15).map((d, i) => {
              const maxRev = Math.max(...daily.map(dd => dd.revenue || 0), 1)
              return (
                <div key={i} className="biz-bar-chart__col" title={`${d.label}: ${formatCurrency(d.revenue)}`}>
                  <motion.div
                    className="biz-bar-chart__bar"
                    style={{ background: 'linear-gradient(to top, rgba(126,198,153,0.3), rgba(126,198,153,0.7))' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.revenue / maxRev) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                  <span className="biz-bar-chart__label">{d.label?.split(' ')[1] || ''}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Expense Donut (simplified as bars) */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            💸 Expenses by Category
          </h3>
          {expCategories.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No expenses this period</p>
          ) : (
            <div className="biz-category-bars">
              {expCategories.slice(0, 6).map(cat => {
                const catInfo = BUSINESS_THEME.expenseCategories.find(c => c.id === cat.category) || { icon: '📌', color: '#AEB6BF' }
                const maxTotal = Math.max(...expCategories.map(c => c.total), 1)
                return (
                  <div key={cat.category} className="biz-category-bar biz-category-bar--compact">
                    <div className="biz-category-bar__header">
                      <span style={{ fontSize: '0.8rem' }}>{catInfo.icon} {cat.category}</span>
                      <span style={{ fontSize: '0.8rem' }}>{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="biz-category-bar__track">
                      <motion.div
                        className="biz-category-bar__fill"
                        style={{ background: catInfo.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.total / maxTotal) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Products + Recent Sales + Low Stock */}
      <div className="biz-dashboard-bottom">
        {/* Top Products */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            🏆 Top Products
          </h3>
          {topProducts.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No sales data yet</p>
          ) : (
            <div className="biz-top-products">
              {topProducts.map((p, i) => (
                <div key={p.product_name} className="biz-top-product">
                  <span className="biz-top-product__rank">#{i + 1}</span>
                  <span className="biz-top-product__name">{p.product_name}</span>
                  <span className="biz-top-product__value">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>🧾 Recent Sales</h3>
            <button className="glass-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => navigate('/business/sales')}>View All</button>
          </div>
          {recentSales.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No recent sales</p>
          ) : (
            <div className="biz-recent-sales">
              {recentSales.map(s => (
                <div key={s.sale_id} className="biz-recent-sale">
                  <div>
                    <span className="biz-recent-sale__invoice">{s.invoice_number}</span>
                    <span className="biz-recent-sale__date">{s.sale_date}</span>
                  </div>
                  <span className="biz-recent-sale__amount">{formatCurrency(s.total_amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            ⚠️ Low Stock Alerts ({lowStock.length})
          </h3>
          {lowStock.length === 0 ? (
            <p style={{ color: '#7EC699', fontSize: '0.85rem' }}>✅ All stock levels healthy</p>
          ) : (
            <div className="biz-low-stock-list">
              {lowStock.slice(0, 6).map(p => (
                <div key={p.product_id} className="biz-low-stock-item">
                  <div>
                    <span className="biz-low-stock-item__name">{p.name}</span>
                    <span className="biz-low-stock-item__qty" style={{ color: p.urgency === 'out' ? '#D4766E' : '#E8C87A' }}>
                      {p.current_stock} left
                    </span>
                  </div>
                  <button
                    className="glass-btn"
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    onClick={() => navigate(`/business/stock?product=${p.product_id}&type=in`)}
                  >
                    📥 Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action FABs */}
      <div className="biz-quick-actions no-print">
        <motion.button
          className="biz-quick-action biz-quick-action--sale"
          onClick={() => navigate('/business/new-sale')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="New Sale"
        >
          💰
        </motion.button>
        <motion.button
          className="biz-quick-action biz-quick-action--expense"
          onClick={() => navigate('/business/expenses')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Add Expense"
        >
          💸
        </motion.button>
        <motion.button
          className="biz-quick-action biz-quick-action--stock"
          onClick={() => navigate('/business/stock')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Stock In"
        >
          📥
        </motion.button>
      </div>
    </motion.div>
  )
}
