import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSheetData } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency, formatDate, formatTime } from '../../constants/businessTheme'

const { animations, paymentMethods } = BUSINESS_THEME

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
]

export default function SalesPage() {
  const [period, setPeriod] = useState('month')
  const [search, setSearch] = useState('')
  const [payFilter, setPayFilter] = useState('all')
  const [expandedSale, setExpandedSale] = useState(null)

  const { data, loading } = useSheetData(`sales?action=getSales&period=${period}`)
  const sales = data?.data || []
  const totals = data?.totals || { count: 0, revenue: 0, profit: 0 }

  const filtered = sales
    .filter(s => {
      if (search) {
        const q = search.toLowerCase()
        return s.invoice_number?.toLowerCase().includes(q) || s.customer_name?.toLowerCase().includes(q) || s.customer_phone?.includes(q)
      }
      return true
    })
    .filter(s => payFilter === 'all' || s.payment_method === payFilter)

  const margin = totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <h1 className="biz-page__title">📋 Sales History</h1>
      </div>

      {/* Period Selector */}
      <div className="biz-tabs">
        {PERIODS.map(p => (
          <button key={p.id} className={`biz-tab ${period === p.id ? 'biz-tab--active' : ''}`} onClick={() => setPeriod(p.id)}>
            {p.label}
            {period === p.id && <motion.div className="biz-tab__indicator" layoutId="salesPeriod" />}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="biz-stats-bar">
        <div className="biz-stat-chip">
          <span className="biz-stat-chip__icon">🧾</span>
          <span className="biz-stat-chip__value">{totals.count}</span>
          <span className="biz-stat-chip__label">Sales</span>
        </div>
        <div className="biz-stat-chip">
          <span className="biz-stat-chip__icon">💰</span>
          <span className="biz-stat-chip__value">{formatCurrency(totals.revenue)}</span>
          <span className="biz-stat-chip__label">Revenue</span>
        </div>
        <div className="biz-stat-chip" style={{ borderColor: 'rgba(126,198,153,0.3)' }}>
          <span className="biz-stat-chip__icon">📈</span>
          <span className="biz-stat-chip__value" style={{ color: '#7EC699' }}>{formatCurrency(totals.profit)}</span>
          <span className="biz-stat-chip__label">Profit</span>
        </div>
        <div className="biz-stat-chip">
          <span className="biz-stat-chip__icon">📊</span>
          <span className="biz-stat-chip__value">{margin}%</span>
          <span className="biz-stat-chip__label">Margin</span>
        </div>
      </div>

      {/* Filters */}
      <div className="biz-filters" style={{ marginTop: '1rem' }}>
        <div className="biz-search">
          <span className="biz-search__icon">🔍</span>
          <input className="glass-input biz-search__input" placeholder="Search invoice, customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="biz-filter-chips">
          <button className={`filter-chip ${payFilter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setPayFilter('all')}>All</button>
          {paymentMethods.map(pm => (
            <button key={pm.id} className={`filter-chip ${payFilter === pm.id ? 'filter-chip--active' : ''}`} onClick={() => setPayFilter(pm.id)}>
              {pm.icon} {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="biz-skeleton-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card biz-skeleton-row anim-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div className="biz-empty" {...animations.scaleIn}>
          <span className="biz-empty__icon">🧾</span>
          <h3>No sales found</h3>
          <p>Sales will appear here once recorded</p>
        </motion.div>
      ) : (
        <div className="glass-card biz-table-wrapper">
          <table className="biz-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <>
                  <tr key={s.sale_id} className="biz-table__clickable" onClick={() => setExpandedSale(expandedSale === s.sale_id ? null : s.sale_id)}>
                    <td className="biz-table__name">{s.invoice_number}</td>
                    <td>{formatDate(s.sale_date)} {formatTime(s.sale_time)}</td>
                    <td>{s.customer_name || s.customer_phone || '—'}</td>
                    <td>
                      <span className="glass-badge">{paymentMethods.find(p => p.id === s.payment_method)?.icon || '💵'} {s.payment_method}</span>
                    </td>
                    <td>{formatCurrency(s.total_amount)}</td>
                    <td style={{ color: '#7EC699' }}>{formatCurrency(s.gross_profit)}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {expandedSale === s.sale_id ? '▼' : '▶'}
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedSale === s.sale_id && (
                      <motion.tr
                        key={`${s.sale_id}-detail`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan="7" className="biz-sale-detail">
                          <SaleDetail saleId={s.sale_id} />
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}

function SaleDetail({ saleId }) {
  const { data, loading } = useSheetData(`sales?action=getSaleDetail&sale_id=${saleId}`)

  if (loading) return <div className="spinner" style={{ margin: '1rem auto' }} />
  const items = data?.data?.items || []

  return (
    <div className="biz-sale-detail__items">
      <table className="biz-table biz-table--nested">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.item_id}>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.selling_price)}</td>
              <td>{formatCurrency(item.item_total)}</td>
              <td style={{ color: '#7EC699' }}>{formatCurrency(item.item_profit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
