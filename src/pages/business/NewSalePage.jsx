import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSheetData, apiPost, invalidateCache } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency } from '../../constants/businessTheme'
import confetti from 'canvas-confetti'

const { animations, paymentMethods } = BUSINESS_THEME

export default function NewSalePage() {
  const { data: productsData, loading } = useSheetData('inventory?action=getProducts')
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [discount, setDiscount] = useState('')
  const [discountType, setDiscountType] = useState('flat') // 'flat' or 'percent'
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [error, setError] = useState('')

  const products = productsData?.data || []
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products
    .filter(p => {
      if (search) {
        const q = search.toLowerCase()
        return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      }
      return true
    })
    .filter(p => categoryFilter === 'all' || p.category === categoryFilter)

  const addToCart = (product) => {
    const stock = parseInt(product.current_stock) || 0
    if (stock <= 0) return

    setCart(prev => {
      const existing = prev.find(c => c.product_id === product.product_id)
      if (existing) {
        if (existing.quantity >= stock) return prev
        return prev.map(c => c.product_id === product.product_id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        quantity: 1,
        maxStock: stock,
      }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(c => {
      if (c.product_id !== productId) return c
      const newQty = c.quantity + delta
      if (newQty <= 0) return null
      if (newQty > c.maxStock) return c
      return { ...c, quantity: newQty }
    }).filter(Boolean))
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(c => c.product_id !== productId))
  }

  const subtotal = useMemo(() =>
    cart.reduce((s, c) => s + (c.quantity * parseFloat(c.selling_price || 0)), 0),
    [cart]
  )

  const totalCost = useMemo(() =>
    cart.reduce((s, c) => s + (c.quantity * parseFloat(c.purchase_price || 0)), 0),
    [cart]
  )

  const discountAmount = useMemo(() => {
    const d = parseFloat(discount) || 0
    if (discountType === 'percent') return Math.round(subtotal * d / 100)
    return d
  }, [discount, discountType, subtotal])

  const total = subtotal - discountAmount
  const profit = total - totalCost

  const handleCompleteSale = async () => {
    if (cart.length === 0) { setError('Add items to cart first'); return }
    setError('')
    setSaving(true)

    try {
      const result = await apiPost('sales?action=recordSale', {
        items: cart.map(c => ({
          product_id: c.product_id,
          quantity: c.quantity,
          purchase_price: c.purchase_price,
          selling_price: c.selling_price,
        })),
        payment_method: paymentMethod,
        customer_phone: customerPhone,
        customer_name: customerName,
        discount: discountAmount,
        notes,
      })

      invalidateCache('inventory?action=getProducts')
      invalidateCache('sales?action=getSales')
      setSuccessData(result.data)

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#7EC699', '#E8C87A', '#F1EFE8', '#6AABF7'],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const resetSale = () => {
    setCart([])
    setDiscount('')
    setPaymentMethod('Cash')
    setCustomerPhone('')
    setCustomerName('')
    setNotes('')
    setSuccessData(null)
    setError('')
  }

  // ── Success overlay ──
  if (successData) {
    return (
      <motion.div className="biz-sale-success" {...animations.scaleIn}>
        <div className="biz-sale-success__card glass-card glass-card--elevated">
          <motion.div className="biz-sale-success__icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            ✅
          </motion.div>
          <h2>Sale Complete!</h2>
          <p className="biz-sale-success__invoice">Invoice: {successData.invoiceNumber}</p>
          <div className="biz-sale-success__stats">
            <div>
              <span>Total</span>
              <strong>{formatCurrency(successData.totalAmount)}</strong>
            </div>
            <div>
              <span>Profit</span>
              <strong style={{ color: '#7EC699' }}>{formatCurrency(successData.grossProfit)}</strong>
            </div>
            {successData.discount > 0 && (
              <div>
                <span>Discount</span>
                <strong style={{ color: '#E8C87A' }}>-{formatCurrency(successData.discount)}</strong>
              </div>
            )}
          </div>
          <div className="biz-sale-success__actions">
            <button className="glass-btn glass-btn--primary glass-btn--large" onClick={resetSale}>
              ➕ New Sale
            </button>
            <button className="glass-btn" onClick={() => {
              const msg = `🧾 Invoice: ${successData.invoiceNumber}\n💰 Total: ${formatCurrency(successData.totalAmount)}\n📅 ${new Date().toLocaleDateString('en-IN')}\n\nThank you for your purchase!`
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
            }}>
              📱 WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <h1 className="biz-page__title">💰 New Sale</h1>
      </div>

      <div className="biz-sale-layout">
        {/* Left: Product Browser */}
        <div className="biz-sale-products">
          <div className="biz-search">
            <span className="biz-search__icon">🔍</span>
            <input className="glass-input biz-search__input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="biz-filter-chips" style={{ marginBottom: '1rem' }}>
            {categories.map(cat => (
              <button key={cat} className={`filter-chip ${categoryFilter === cat ? 'filter-chip--active' : ''}`} onClick={() => setCategoryFilter(cat)}>
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="biz-skeleton-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="glass-card biz-skeleton-card anim-shimmer" />)}
            </div>
          ) : (
            <motion.div className="biz-sale-product-grid" variants={animations.staggerContainer} initial="initial" animate="animate">
              {filtered.map(p => {
                const stock = parseInt(p.current_stock) || 0
                const inCart = cart.find(c => c.product_id === p.product_id)
                const isOut = stock <= 0
                return (
                  <motion.button
                    key={p.product_id}
                    className={`glass-card biz-sale-product-card ${isOut ? 'biz-sale-product-card--disabled' : ''} ${inCart ? 'biz-sale-product-card--selected' : ''}`}
                    variants={animations.staggerItem}
                    onClick={() => !isOut && addToCart(p)}
                    whileHover={!isOut ? { scale: 1.03 } : {}}
                    whileTap={!isOut ? { scale: 0.97 } : {}}
                    disabled={isOut}
                  >
                    <div className="biz-sale-product-card__name">{p.name}</div>
                    <div className="biz-sale-product-card__price">{formatCurrency(p.selling_price)}</div>
                    <div className="biz-sale-product-card__stock" style={{ color: isOut ? '#D4766E' : '#888780' }}>
                      {isOut ? 'Out of stock' : `${stock} available`}
                    </div>
                    {inCart && (
                      <motion.div className="biz-sale-product-card__badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {inCart.quantity}
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="glass-card glass-card--elevated biz-cart">
          <h3 className="biz-cart__title">🛒 Cart ({cart.length} items)</h3>

          {cart.length === 0 ? (
            <div className="biz-cart__empty">
              <span>🛒</span>
              <p>Add products to start</p>
            </div>
          ) : (
            <>
              <div className="biz-cart__items">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div
                      key={item.product_id}
                      className="biz-cart-item"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <div className="biz-cart-item__info">
                        <span className="biz-cart-item__name">{item.name}</span>
                        <span className="biz-cart-item__meta">
                          Buy: {formatCurrency(item.purchase_price)} | Profit: {formatCurrency(parseFloat(item.selling_price) - parseFloat(item.purchase_price))}/unit
                        </span>
                      </div>
                      <div className="biz-cart-item__controls">
                        <div className="biz-qty-input biz-qty-input--small">
                          <button className="biz-qty-btn" onClick={() => updateQty(item.product_id, -1)}>−</button>
                          <span className="biz-qty-value">{item.quantity}</span>
                          <button className="biz-qty-btn" onClick={() => updateQty(item.product_id, 1)}>+</button>
                        </div>
                        <span className="biz-cart-item__total">{formatCurrency(item.quantity * parseFloat(item.selling_price))}</span>
                        <button className="biz-cart-item__remove" onClick={() => removeFromCart(item.product_id)}>🗑️</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="glass-divider" />

              {/* Summary */}
              <div className="biz-cart__summary">
                <div className="biz-cart__row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="biz-cart__row biz-cart__discount">
                  <span>Discount</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      className="glass-input"
                      style={{ width: '80px', padding: '6px 10px', fontSize: '0.85rem', textAlign: 'right' }}
                      type="number" min="0" placeholder="0"
                      value={discount} onChange={e => setDiscount(e.target.value)}
                    />
                    <button
                      className={`filter-chip ${discountType === 'flat' ? 'filter-chip--active' : ''}`}
                      onClick={() => setDiscountType('flat')}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >₹</button>
                    <button
                      className={`filter-chip ${discountType === 'percent' ? 'filter-chip--active' : ''}`}
                      onClick={() => setDiscountType('percent')}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >%</button>
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="biz-cart__row" style={{ color: '#E8C87A' }}>
                    <span>Discount Amount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="glass-divider" style={{ margin: '0.75rem 0' }} />

                <div className="biz-cart__row biz-cart__row--total">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <div className="biz-cart__row" style={{ color: '#7EC699' }}>
                  <span>Your Profit</span>
                  <span>{formatCurrency(profit)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginTop: '1rem' }}>
                <label className="biz-form__label">Payment Method</label>
                <div className="biz-payment-pills">
                  {paymentMethods.map(pm => (
                    <motion.button
                      key={pm.id}
                      className={`biz-payment-pill ${paymentMethod === pm.id ? 'biz-payment-pill--active' : ''}`}
                      onClick={() => setPaymentMethod(pm.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pm.icon} {pm.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Customer (optional) */}
              <details className="biz-cart__customer">
                <summary className="biz-form__label" style={{ cursor: 'pointer', marginTop: '1rem' }}>👤 Customer (optional)</summary>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input className="glass-input" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ flex: 1 }} />
                  <input className="glass-input" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ flex: 1 }} />
                </div>
              </details>

              {error && <div className="biz-form__error" style={{ marginTop: '0.75rem' }}>⚠️ {error}</div>}

              <button
                className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
                style={{ marginTop: '1rem' }}
                onClick={handleCompleteSale}
                disabled={saving || cart.length === 0}
              >
                {saving ? <><span className="spinner spinner--sm" /> Processing Sale...</> : `💰 Complete Sale — ${formatCurrency(total)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
