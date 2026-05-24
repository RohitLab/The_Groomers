import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSheetData } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency } from '../../constants/businessTheme'

const { animations } = BUSINESS_THEME

export default function InventoryPage() {
  const navigate = useNavigate()
  const { data, loading, refetch } = useSheetData('inventory?action=getProducts')
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const products = data?.data || []

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products
    .filter(p => {
      if (search) {
        const q = search.toLowerCase()
        return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      }
      return true
    })
    .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
    .filter(p => {
      if (stockFilter === 'low') return parseInt(p.current_stock) <= parseInt(p.min_stock_alert || 10)
      if (stockFilter === 'out') return parseInt(p.current_stock) === 0
      if (stockFilter === 'in') return parseInt(p.current_stock) > parseInt(p.min_stock_alert || 10)
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'stock') return parseInt(b.current_stock) - parseInt(a.current_stock)
      if (sortBy === 'price') return parseFloat(b.selling_price) - parseFloat(a.selling_price)
      if (sortBy === 'profit') {
        const profitA = parseFloat(a.selling_price) - parseFloat(a.purchase_price)
        const profitB = parseFloat(b.selling_price) - parseFloat(b.purchase_price)
        return profitB - profitA
      }
      return 0
    })

  const getStockStatus = (p) => {
    const stock = parseInt(p.current_stock) || 0
    const min = parseInt(p.min_stock_alert) || 10
    if (stock === 0) return { label: 'Out of Stock', color: '#D4766E', percent: 0 }
    if (stock <= min) return { label: 'Low Stock', color: '#E8C87A', percent: (stock / min) * 50 }
    return { label: 'In Stock', color: '#7EC699', percent: Math.min(100, (stock / (min * 3)) * 100) }
  }

  const getMargin = (p) => {
    const buy = parseFloat(p.purchase_price) || 0
    const sell = parseFloat(p.selling_price) || 0
    if (buy === 0) return 0
    return Math.round(((sell - buy) / buy) * 100)
  }

  if (loading && !products.length) {
    return (
      <div className="biz-page">
        <div className="biz-page__header">
          <h1 className="biz-page__title">📦 Inventory</h1>
        </div>
        <div className="biz-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card biz-skeleton-card anim-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      {/* Header */}
      <div className="biz-page__header">
        <div>
          <h1 className="biz-page__title">📦 Inventory</h1>
          <p className="biz-page__subtitle">{products.length} products • {products.reduce((s, p) => s + (parseInt(p.current_stock) || 0), 0)} total items</p>
        </div>
        <div className="biz-page__actions">
          <button className="glass-btn" onClick={() => navigate('/business/stock')}>
            📊 Stock Movement
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="biz-filters">
        <div className="biz-search">
          <span className="biz-search__icon">🔍</span>
          <input
            className="glass-input biz-search__input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="biz-filter-row">
          <div className="biz-filter-chips">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${categoryFilter === cat ? 'filter-chip--active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? '🏷️ All' : cat}
              </button>
            ))}
          </div>

          <div className="biz-filter-chips">
            {[
              { id: 'all', label: '📋 All' },
              { id: 'in', label: '✅ In Stock' },
              { id: 'low', label: '⚠️ Low' },
              { id: 'out', label: '❌ Out' },
            ].map(f => (
              <button
                key={f.id}
                className={`filter-chip ${stockFilter === f.id ? 'filter-chip--active' : ''}`}
                onClick={() => setStockFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="biz-view-toggle">
            <select
              className="biz-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="name">Sort: Name</option>
              <option value="stock">Sort: Stock</option>
              <option value="price">Sort: Price</option>
              <option value="profit">Sort: Profit</option>
            </select>
            <button className={`biz-view-btn ${view === 'grid' ? 'biz-view-btn--active' : ''}`} onClick={() => setView('grid')}>⊞</button>
            <button className={`biz-view-btn ${view === 'table' ? 'biz-view-btn--active' : ''}`} onClick={() => setView('table')}>☰</button>
          </div>
        </div>
      </div>

      {/* Product Grid / Table */}
      {filtered.length === 0 ? (
        <motion.div className="biz-empty" {...animations.scaleIn}>
          <span className="biz-empty__icon">📦</span>
          <h3>No products found</h3>
          <p>Add your first product to get started</p>
          <button className="glass-btn glass-btn--primary" onClick={() => navigate('/business/add-product')}>
            + Add Product
          </button>
        </motion.div>
      ) : view === 'grid' ? (
        <motion.div className="biz-product-grid" variants={animations.staggerContainer} initial="initial" animate="animate">
          <AnimatePresence>
            {filtered.map((p, i) => {
              const status = getStockStatus(p)
              const margin = getMargin(p)
              return (
                <motion.div
                  key={p.product_id}
                  className="glass-card glass-card--elevated biz-product-card"
                  variants={animations.staggerItem}
                  layout
                  {...animations.cardHover}
                >
                  <div className="biz-product-card__top">
                    <div>
                      <h3 className="biz-product-card__name">{p.name}</h3>
                      <p className="biz-product-card__sku">{p.sku}</p>
                    </div>
                    <span className="glass-badge" style={{ background: `${status.color}22`, borderColor: `${status.color}44`, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  {p.category && (
                    <span className="biz-product-card__category">{p.category}</span>
                  )}

                  {/* Stock meter */}
                  <div className="biz-stock-meter">
                    <div className="biz-stock-meter__bar">
                      <motion.div
                        className="biz-stock-meter__fill"
                        style={{ background: status.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${status.percent}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="biz-stock-meter__label">{p.current_stock} units</span>
                  </div>

                  {/* Pricing */}
                  <div className="biz-product-card__pricing">
                    <span className="biz-product-card__buy">Buy: {formatCurrency(p.purchase_price)}</span>
                    <span className="biz-product-card__arrow">→</span>
                    <span className="biz-product-card__sell">Sell: {formatCurrency(p.selling_price)}</span>
                    <span
                      className="biz-product-card__margin"
                      style={{ color: margin > 20 ? '#7EC699' : margin > 10 ? '#E8C87A' : '#D4766E' }}
                    >
                      {margin}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="biz-product-card__actions">
                    <button className="glass-btn" onClick={() => navigate(`/business/add-product?edit=${p.product_id}`)}>✏️ Edit</button>
                    <button className="glass-btn glass-btn--success" onClick={() => navigate(`/business/stock?product=${p.product_id}&type=in`)}>📥 In</button>
                    <button className="glass-btn" onClick={() => navigate(`/business/stock?product=${p.product_id}&type=out`)}>📤 Out</button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass-card biz-table-wrapper">
          <table className="biz-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Margin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const status = getStockStatus(p)
                const margin = getMargin(p)
                return (
                  <tr key={p.product_id}>
                    <td className="biz-table__name">{p.name}</td>
                    <td className="biz-table__muted">{p.sku}</td>
                    <td>{p.category}</td>
                    <td>
                      <span style={{ color: status.color, fontWeight: 500 }}>{p.current_stock}</span>
                    </td>
                    <td>{formatCurrency(p.purchase_price)}</td>
                    <td>{formatCurrency(p.selling_price)}</td>
                    <td style={{ color: margin > 20 ? '#7EC699' : margin > 10 ? '#E8C87A' : '#D4766E' }}>{margin}%</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="glass-btn" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => navigate(`/business/add-product?edit=${p.product_id}`)}>✏️</button>
                        <button className="glass-btn" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => navigate(`/business/stock?product=${p.product_id}&type=in`)}>📥</button>
                        <button className="glass-btn" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => navigate(`/business/stock?product=${p.product_id}&type=out`)}>📤</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FAB */}
      <motion.button
        className="biz-fab"
        onClick={() => navigate('/business/add-product')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>
    </motion.div>
  )
}
