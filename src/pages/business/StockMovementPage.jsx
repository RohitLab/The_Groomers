import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useSheetData, apiPost, invalidateCache } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency, formatDate } from '../../constants/businessTheme'

const { animations } = BUSINESS_THEME

const TABS = [
  { id: 'in', label: '📥 Stock In', color: '#7EC699' },
  { id: 'out', label: '📤 Stock Out', color: '#D4766E' },
  { id: 'adjust', label: '🔧 Adjust', color: '#E8C87A' },
]

const REASONS = {
  in: ['Restock', 'Purchase', 'Return', 'Transfer In', 'Other'],
  out: ['Sale', 'Damaged', 'Expired', 'Transfer Out', 'Sample', 'Other'],
  adjust: ['Inventory Count', 'Correction', 'Loss', 'Other'],
}

export default function StockMovementPage() {
  const [params] = useSearchParams()
  const [activeTab, setActiveTab] = useState(params.get('type') || 'in')
  const { data: productsData, loading } = useSheetData('inventory?action=getProducts')
  const { data: movementsData, refetch: refetchMovements } = useSheetData('inventory?action=getMovements')

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchProduct, setSearchProduct] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [newQty, setNewQty] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  const products = productsData?.data || []
  const movements = (movementsData?.data || []).slice(0, 20)

  // Auto-select product from URL params
  useEffect(() => {
    const pid = params.get('product')
    if (pid && products.length) {
      const p = products.find(pr => pr.product_id === pid)
      if (p) {
        setSelectedProduct(p)
        setSearchProduct(p.name)
      }
    }
  }, [params, products])

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const selectProduct = (p) => {
    setSelectedProduct(p)
    setSearchProduct(p.name)
    setShowDropdown(false)
    if (activeTab === 'adjust') setNewQty(p.current_stock)
  }

  const handleSubmit = async () => {
    if (!selectedProduct) { setError('Select a product first'); return }
    setError('')
    setSaving(true)

    try {
      let result
      if (activeTab === 'in') {
        result = await apiPost('inventory?action=stockIn', {
          product_id: selectedProduct.product_id,
          quantity, reason: reason || 'Restock', notes,
        })
      } else if (activeTab === 'out') {
        result = await apiPost('inventory?action=stockOut', {
          product_id: selectedProduct.product_id,
          quantity, reason: reason || 'Manual', notes,
        })
      } else {
        result = await apiPost('inventory?action=adjustStock', {
          product_id: selectedProduct.product_id,
          new_quantity: newQty, reason: reason || 'Manual Adjustment', notes,
        })
      }

      invalidateCache('inventory?action=getProducts')
      invalidateCache('inventory?action=getMovements')
      setSuccess(result)
      refetchMovements()

      // Reset after 2s
      setTimeout(() => {
        setSuccess(null)
        setQuantity(1)
        setReason('')
        setNotes('')
        setSelectedProduct(null)
        setSearchProduct('')
      }, 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <h1 className="biz-page__title">📊 Stock Movement</h1>
      </div>

      {/* Tabs */}
      <div className="biz-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`biz-tab ${activeTab === tab.id ? 'biz-tab--active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(null) }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div className="biz-tab__indicator" layoutId="stockTab" style={{ background: tab.color }} />
            )}
          </button>
        ))}
      </div>

      <div className="biz-stock-layout">
        {/* Form */}
        <motion.div className="glass-card glass-card--elevated biz-stock-form" key={activeTab} {...animations.slideUp}>
          {/* Product Search */}
          <div className="biz-form__group" style={{ position: 'relative' }}>
            <label className="biz-form__label">Select Product</label>
            <input
              className="glass-input"
              placeholder="Search by name or SKU..."
              value={searchProduct}
              onChange={e => { setSearchProduct(e.target.value); setShowDropdown(true); setSelectedProduct(null) }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && searchProduct && filteredProducts.length > 0 && (
              <div className="biz-dropdown">
                {filteredProducts.slice(0, 8).map(p => (
                  <button key={p.product_id} className="biz-dropdown__item" onClick={() => selectProduct(p)}>
                    <span>{p.name}</span>
                    <span className="biz-dropdown__meta">{p.sku} • {p.current_stock} units</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected product info */}
          {selectedProduct && (
            <motion.div className="biz-stock-selected" {...animations.scaleIn}>
              <div className="biz-stock-selected__name">{selectedProduct.name}</div>
              <div className="biz-stock-selected__stock">
                Current Stock: <strong>{selectedProduct.current_stock}</strong> units
              </div>
            </motion.div>
          )}

          {/* Quantity */}
          {activeTab !== 'adjust' ? (
            <div className="biz-form__group">
              <label className="biz-form__label">Quantity</label>
              <div className="biz-qty-input">
                <button className="biz-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input className="glass-input biz-qty-value" type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                <button className="biz-qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          ) : (
            <div className="biz-form__group">
              <label className="biz-form__label">New Quantity</label>
              <input className="glass-input" type="number" min="0" value={newQty} onChange={e => setNewQty(e.target.value)} />
            </div>
          )}

          {/* Reason */}
          <div className="biz-form__group">
            <label className="biz-form__label">Reason</label>
            <div className="biz-reason-chips">
              {REASONS[activeTab].map(r => (
                <button
                  key={r}
                  className={`filter-chip ${reason === r ? 'filter-chip--active' : ''}`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="biz-form__group">
            <label className="biz-form__label">Notes (optional)</label>
            <input className="glass-input" placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {error && <div className="biz-form__error">⚠️ {error}</div>}

          {success ? (
            <motion.div className="biz-stock-success" {...animations.scaleIn}>
              <span className="biz-stock-success__icon">✅</span>
              <span>New stock level: <strong>{success.new_stock ?? newQty}</strong></span>
            </motion.div>
          ) : (
            <button className="glass-btn glass-btn--primary glass-btn--large glass-btn--full" onClick={handleSubmit} disabled={saving || !selectedProduct}>
              {saving ? <><span className="spinner spinner--sm" /> Processing...</> : `${TABS.find(t => t.id === activeTab)?.label} — Confirm`}
            </button>
          )}
        </motion.div>

        {/* Movement History */}
        <div className="glass-card biz-movement-history">
          <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>📋 Recent Movements</h3>
          {movements.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No movements recorded yet</p>
          ) : (
            <div className="biz-movement-list">
              {movements.map(m => (
                <div
                  key={m.movement_id}
                  className="biz-movement-item"
                  style={{
                    borderLeftColor: m.movement_type === 'IN' ? '#7EC699' : m.movement_type === 'OUT' ? '#D4766E' : '#E8C87A',
                  }}
                >
                  <div className="biz-movement-item__top">
                    <span className="biz-movement-item__type" style={{
                      color: m.movement_type === 'IN' ? '#7EC699' : m.movement_type === 'OUT' ? '#D4766E' : '#E8C87A',
                    }}>
                      {m.movement_type === 'IN' ? '📥' : m.movement_type === 'OUT' ? '📤' : '🔧'} {m.movement_type}
                    </span>
                    <span className="biz-movement-item__qty">{m.quantity} units</span>
                  </div>
                  <div className="biz-movement-item__name">{m.product_name}</div>
                  <div className="biz-movement-item__meta">
                    {m.reason} • {formatDate(m.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
