import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSheetData, apiPost, invalidateCache } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency, formatDate } from '../../constants/businessTheme'

const { animations, expenseCategories, paymentMethods } = BUSINESS_THEME

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'add', label: '➕ Add Expense' },
  { id: 'history', label: '📋 History' },
]

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <h1 className="biz-page__title">💸 Expenses</h1>
      </div>

      <div className="biz-tabs">
        {TABS.map(tab => (
          <button key={tab.id} className={`biz-tab ${activeTab === tab.id ? 'biz-tab--active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {activeTab === tab.id && <motion.div className="biz-tab__indicator" layoutId="expTab" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && <OverviewTab key="overview" />}
        {activeTab === 'add' && <AddExpenseTab key="add" onSuccess={() => setActiveTab('history')} />}
        {activeTab === 'history' && <HistoryTab key="history" />}
      </AnimatePresence>
    </motion.div>
  )
}

function OverviewTab() {
  const { data: monthData } = useSheetData('expenses?action=getExpenseSummary&period=month')
  const { data: yearData } = useSheetData('expenses?action=getExpenseSummary&period=year')
  const { data: todayData } = useSheetData('expenses?action=getExpenseSummary&period=today')

  const monthSummary = monthData?.data || { total: 0, count: 0, byCategory: [] }
  const yearSummary = yearData?.data || { total: 0, count: 0, byCategory: [] }
  const todaySummary = todayData?.data || { total: 0, count: 0 }
  const topCategory = monthSummary.byCategory[0]

  return (
    <motion.div {...animations.pageEnter}>
      {/* Summary Cards */}
      <div className="biz-metric-grid">
        <div className="glass-card glass-card--elevated biz-metric-card">
          <span className="biz-metric-card__icon">📅</span>
          <span className="biz-metric-card__label">This Month</span>
          <span className="biz-metric-card__value">{formatCurrency(monthSummary.total)}</span>
          <span className="biz-metric-card__sub">{monthSummary.count} expenses</span>
        </div>
        <div className="glass-card glass-card--elevated biz-metric-card">
          <span className="biz-metric-card__icon">📆</span>
          <span className="biz-metric-card__label">This Year</span>
          <span className="biz-metric-card__value">{formatCurrency(yearSummary.total)}</span>
          <span className="biz-metric-card__sub">{yearSummary.count} expenses</span>
        </div>
        <div className="glass-card glass-card--elevated biz-metric-card">
          <span className="biz-metric-card__icon">📍</span>
          <span className="biz-metric-card__label">Today</span>
          <span className="biz-metric-card__value">{formatCurrency(todaySummary.total)}</span>
        </div>
        <div className="glass-card glass-card--elevated biz-metric-card">
          <span className="biz-metric-card__icon">🏆</span>
          <span className="biz-metric-card__label">Top Category</span>
          <span className="biz-metric-card__value">{topCategory?.category || '—'}</span>
          <span className="biz-metric-card__sub">{topCategory ? formatCurrency(topCategory.total) : ''}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.25rem' }}>📊 Monthly Breakdown by Category</h3>
        {monthSummary.byCategory.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No expenses this month</p>
        ) : (
          <div className="biz-category-bars">
            {monthSummary.byCategory.map(cat => {
              const catInfo = expenseCategories.find(c => c.id === cat.category) || { icon: '📌', color: '#AEB6BF' }
              const percent = monthSummary.total > 0 ? Math.round((cat.total / monthSummary.total) * 100) : 0
              return (
                <div key={cat.category} className="biz-category-bar">
                  <div className="biz-category-bar__header">
                    <span>{catInfo.icon} {cat.category}</span>
                    <span>{formatCurrency(cat.total)} ({percent}%)</span>
                  </div>
                  <div className="biz-category-bar__track">
                    <motion.div
                      className="biz-category-bar__fill"
                      style={{ background: catInfo.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function AddExpenseTab({ onSuccess }) {
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: '', amount: '', payment_method: 'Cash',
    description: '', is_recurring: false, recurring_type: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    if (!form.category || !form.amount) { setError('Select category and enter amount'); return }
    setError('')
    setSaving(true)
    try {
      await apiPost('expenses?action=addExpense', form)
      invalidateCache('expenses?action=getExpenses')
      invalidateCache('expenses?action=getExpenseSummary')
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div {...animations.slideUp}>
      <div className="glass-card glass-card--elevated" style={{ padding: 'var(--space-6)', maxWidth: '640px' }}>
        <div className="biz-form__group">
          <label className="biz-form__label">Date</label>
          <input className="glass-input" type="date" value={form.expense_date} onChange={e => update('expense_date', e.target.value)} />
        </div>

        <div className="biz-form__group">
          <label className="biz-form__label">Category</label>
          <div className="biz-category-grid">
            {expenseCategories.map(cat => (
              <motion.button
                key={cat.id}
                className={`biz-category-btn ${form.category === cat.id ? 'biz-category-btn--active' : ''}`}
                style={{
                  '--cat-color': cat.color,
                  borderColor: form.category === cat.id ? cat.color : 'rgba(255,255,255,0.08)',
                  background: form.category === cat.id ? `${cat.color}18` : 'rgba(255,255,255,0.04)',
                }}
                onClick={() => update('category', cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="biz-category-btn__icon">{cat.icon}</span>
                <span className="biz-category-btn__label">{cat.id}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="biz-form__group">
          <label className="biz-form__label">Amount (₹)</label>
          <input className="glass-input glass-input--large" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => update('amount', e.target.value)} />
        </div>

        <div className="biz-form__group">
          <label className="biz-form__label">Payment Method</label>
          <div className="biz-payment-pills">
            {paymentMethods.map(pm => (
              <button key={pm.id} className={`biz-payment-pill ${form.payment_method === pm.id ? 'biz-payment-pill--active' : ''}`} onClick={() => update('payment_method', pm.id)}>
                {pm.icon} {pm.label}
              </button>
            ))}
          </div>
        </div>

        <div className="biz-form__group">
          <label className="biz-form__label">Description (optional)</label>
          <input className="glass-input" placeholder="What was this for?" value={form.description} onChange={e => update('description', e.target.value)} />
        </div>

        <div className="biz-form__group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_recurring} onChange={e => update('is_recurring', e.target.checked)} style={{ accentColor: '#F5A623' }} />
            🔁 Recurring expense
          </label>
          {form.is_recurring && (
            <select className="biz-sort-select" value={form.recurring_type} onChange={e => update('recurring_type', e.target.value)}>
              <option value="">Frequency</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}
        </div>

        {error && <div className="biz-form__error">⚠️ {error}</div>}

        <button className="glass-btn glass-btn--primary glass-btn--large glass-btn--full" onClick={handleSubmit} disabled={saving}>
          {saving ? <><span className="spinner spinner--sm" /> Saving...</> : '💸 Add Expense'}
        </button>
      </div>
    </motion.div>
  )
}

function HistoryTab() {
  const [period, setPeriod] = useState('month')
  const [catFilter, setCatFilter] = useState('all')
  const { data, loading } = useSheetData(`expenses?action=getExpenses&period=${period}${catFilter !== 'all' ? `&category=${catFilter}` : ''}`)
  const expenses = data?.data || []
  const total = data?.total || 0

  const handleExportCSV = () => {
    const headers = ['Date,Category,Amount,Payment,Description']
    const rows = expenses.map(e => `${e.expense_date},${e.category},${e.amount},${e.payment_method},"${e.description}"`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses_${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div {...animations.pageEnter}>
      <div className="biz-filters">
        <div className="biz-filter-chips">
          {['month', 'week', 'year'].map(p => (
            <button key={p} className={`filter-chip ${period === p ? 'filter-chip--active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'month' ? 'Month' : p === 'week' ? 'Week' : 'Year'}
            </button>
          ))}
        </div>
        <div className="biz-filter-chips">
          <button className={`filter-chip ${catFilter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setCatFilter('all')}>All</button>
          {expenseCategories.slice(0, 5).map(cat => (
            <button key={cat.id} className={`filter-chip ${catFilter === cat.id ? 'filter-chip--active' : ''}`} onClick={() => setCatFilter(cat.id)}>
              {cat.icon} {cat.id}
            </button>
          ))}
        </div>
        <button className="glass-btn" onClick={handleExportCSV}>📥 Export CSV</button>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Total: <strong style={{ color: 'var(--color-cream)' }}>{formatCurrency(total)}</strong> ({expenses.length} entries)
      </p>

      {loading ? (
        <div className="biz-skeleton-grid">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card biz-skeleton-row anim-shimmer" />)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="biz-empty">
          <span className="biz-empty__icon">💸</span>
          <h3>No expenses found</h3>
        </div>
      ) : (
        <div className="biz-expense-list">
          {expenses.filter(e => e.category !== 'DELETED').map(e => {
            const catInfo = expenseCategories.find(c => c.id === e.category) || { icon: '📌', color: '#AEB6BF' }
            return (
              <motion.div key={e.expense_id} className="glass-card biz-expense-item" variants={animations.staggerItem}>
                <div className="biz-expense-item__icon" style={{ background: `${catInfo.color}22`, color: catInfo.color }}>
                  {catInfo.icon}
                </div>
                <div className="biz-expense-item__info">
                  <span className="biz-expense-item__category">{e.category}</span>
                  <span className="biz-expense-item__desc">{e.description || '—'}</span>
                  <span className="biz-expense-item__date">{formatDate(e.expense_date)} • {e.payment_method}</span>
                </div>
                <div className="biz-expense-item__amount">
                  {formatCurrency(e.amount)}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
