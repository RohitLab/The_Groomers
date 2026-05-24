import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSheetData } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency, formatDate } from '../../constants/businessTheme'

const { animations } = BUSINESS_THEME

const REPORTS = [
  { id: 'daily-sales', icon: '📊', title: 'Daily Sales Report', desc: 'Sales summary for any day', color: '#7EC699' },
  { id: 'monthly-pl', icon: '📈', title: 'Monthly P&L', desc: 'Profit & Loss statement', color: '#6AABF7' },
  { id: 'inventory-val', icon: '📦', title: 'Inventory Valuation', desc: 'Current stock value', color: '#E8C87A' },
  { id: 'expense-summary', icon: '💸', title: 'Expense Summary', desc: 'Expenses by category', color: '#D4766E' },
  { id: 'top-products', icon: '🏆', title: 'Product Performance', desc: 'Top selling products', color: '#BB8FCE' },
  { id: 'custom', icon: '📋', title: 'Custom Date Range', desc: 'Any report, any dates', color: '#4ECDC4' },
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState(null)

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <h1 className="biz-page__title">📄 Reports</h1>
        <p className="biz-page__subtitle">Generate and export business reports</p>
      </div>

      {!activeReport ? (
        <motion.div className="biz-report-grid" variants={animations.staggerContainer} initial="initial" animate="animate">
          {REPORTS.map(report => (
            <motion.button
              key={report.id}
              className="glass-card glass-card--elevated biz-report-card"
              variants={animations.staggerItem}
              onClick={() => setActiveReport(report.id)}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="biz-report-card__icon" style={{ background: `${report.color}18`, color: report.color }}>{report.icon}</span>
              <h3 className="biz-report-card__title">{report.title}</h3>
              <p className="biz-report-card__desc">{report.desc}</p>
              <span className="biz-report-card__arrow">→</span>
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <div>
          <button className="glass-btn" onClick={() => setActiveReport(null)} style={{ marginBottom: '1rem' }}>← Back to Reports</button>
          <ReportViewer reportId={activeReport} />
        </div>
      )}
    </motion.div>
  )
}

function ReportViewer({ reportId }) {
  const [period, setPeriod] = useState('month')

  switch (reportId) {
    case 'inventory-val':
      return <InventoryValueReport />
    case 'top-products':
      return <TopProductsReport period={period} setPeriod={setPeriod} />
    case 'expense-summary':
      return <ExpenseSummaryReport period={period} setPeriod={setPeriod} />
    default:
      return <GenericReport reportId={reportId} period={period} setPeriod={setPeriod} />
  }
}

function InventoryValueReport() {
  const { data, loading } = useSheetData('inventory?action=getInventoryValue')
  const val = data?.data || {}

  if (loading) return <div className="spinner spinner--large" style={{ margin: '2rem auto', display: 'block' }} />

  return (
    <motion.div className="glass-card glass-card--elevated" style={{ padding: 'var(--space-6)' }} {...animations.slideUp}>
      <h3 style={{ marginBottom: '1.25rem' }}>📦 Inventory Valuation Report</h3>
      <div className="biz-report-stats">
        <div className="biz-report-stat"><span>Total Products</span><strong>{val.total_products}</strong></div>
        <div className="biz-report-stat"><span>Total Items in Stock</span><strong>{val.total_items}</strong></div>
        <div className="biz-report-stat"><span>Cost Value</span><strong>{formatCurrency(val.cost_value)}</strong></div>
        <div className="biz-report-stat"><span>Retail Value</span><strong>{formatCurrency(val.retail_value)}</strong></div>
        <div className="biz-report-stat"><span>Potential Profit</span><strong style={{ color: '#7EC699' }}>{formatCurrency(val.potential_profit)}</strong></div>
      </div>
    </motion.div>
  )
}

function TopProductsReport({ period, setPeriod }) {
  const { data, loading } = useSheetData(`sales?action=getTopProducts&period=${period}`)
  const products = data?.data || []

  return (
    <motion.div {...animations.slideUp}>
      <div className="biz-filter-chips" style={{ marginBottom: '1rem' }}>
        {['week', 'month', 'year'].map(p => (
          <button key={p} className={`filter-chip ${period === p ? 'filter-chip--active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: '1rem' }}>🏆 Top Products by Revenue</h3>
        {loading ? <div className="spinner" /> : products.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No data</p> : (
          <table className="biz-table">
            <thead>
              <tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Profit</th></tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.product_name}>
                  <td>{i + 1}</td>
                  <td className="biz-table__name">{p.product_name}</td>
                  <td>{p.units_sold}</td>
                  <td>{formatCurrency(p.revenue)}</td>
                  <td style={{ color: '#7EC699' }}>{formatCurrency(p.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}

function ExpenseSummaryReport({ period, setPeriod }) {
  const { data, loading } = useSheetData(`expenses?action=getExpenseSummary&period=${period}`)
  const summary = data?.data || { total: 0, byCategory: [] }

  return (
    <motion.div {...animations.slideUp}>
      <div className="biz-filter-chips" style={{ marginBottom: '1rem' }}>
        {['week', 'month', 'year'].map(p => (
          <button key={p} className={`filter-chip ${period === p ? 'filter-chip--active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: '1rem' }}>💸 Expense Summary — Total: {formatCurrency(summary.total)}</h3>
        {loading ? <div className="spinner" /> : summary.byCategory.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No expenses</p> : (
          <table className="biz-table">
            <thead>
              <tr><th>Category</th><th>Count</th><th>Total</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              {summary.byCategory.map(cat => (
                <tr key={cat.category}>
                  <td className="biz-table__name">{cat.category}</td>
                  <td>{cat.count}</td>
                  <td>{formatCurrency(cat.total)}</td>
                  <td>{summary.total > 0 ? Math.round((cat.total / summary.total) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}

function GenericReport({ reportId, period, setPeriod }) {
  return (
    <motion.div className="glass-card glass-card--elevated" style={{ padding: 'var(--space-8)', textAlign: 'center' }} {...animations.slideUp}>
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📄</span>
      <h3 style={{ marginBottom: '0.5rem' }}>Report: {reportId}</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Use the P&L Report or Sales History pages for detailed daily/monthly reports.
      </p>
    </motion.div>
  )
}
