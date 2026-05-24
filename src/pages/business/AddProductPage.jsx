import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiPost, useSheetData, invalidateCache } from '../../hooks/useSheetData'
import { BUSINESS_THEME, formatCurrency } from '../../constants/businessTheme'
import confetti from 'canvas-confetti'

const { animations } = BUSINESS_THEME

export default function AddProductPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('edit')
  const isEdit = !!editId

  const { data: productsData } = useSheetData('inventory?action=getAllProducts', { enabled: isEdit })

  const [form, setForm] = useState({
    name: '', sku: '', category: 'General', description: '',
    purchase_price: '', selling_price: '', current_stock: '0',
    min_stock_alert: '10', image_url: '', barcode: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  // Pre-fill for edit mode
  useEffect(() => {
    if (isEdit && productsData?.data) {
      const product = productsData.data.find(p => p.product_id === editId)
      if (product) {
        setForm({
          name: product.name || '',
          sku: product.sku || '',
          category: product.category || 'General',
          description: product.description || '',
          purchase_price: product.purchase_price || '',
          selling_price: product.selling_price || '',
          current_stock: product.current_stock || '0',
          min_stock_alert: product.min_stock_alert || '10',
          image_url: product.image_url || '',
          barcode: product.barcode || '',
        })
      }
    }
  }, [isEdit, editId, productsData])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const generateSKU = () => {
    const prefix = form.category.slice(0, 3).toUpperCase()
    const random = Math.floor(Math.random() * 9000) + 1000
    update('sku', `${prefix}-${random}`)
  }

  const profit = parseFloat(form.selling_price || 0) - parseFloat(form.purchase_price || 0)
  const margin = parseFloat(form.purchase_price) > 0
    ? Math.round((profit / parseFloat(form.purchase_price)) * 100)
    : 0
  const marginColor = margin > 20 ? '#7EC699' : margin > 10 ? '#E8C87A' : '#D4766E'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.purchase_price || !form.selling_price) {
      setError('Please fill in name, purchase price, and selling price')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }

    if (parseFloat(form.selling_price) < parseFloat(form.purchase_price)) {
      setError('Selling price must be ≥ purchase price')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await apiPost('inventory?action=updateProduct', { product_id: editId, ...form })
      } else {
        await apiPost('inventory?action=addProduct', form)
      }
      invalidateCache('inventory?action=getProducts')
      invalidateCache('inventory?action=getAllProducts')

      // Confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7EC699', '#E8C87A', '#F1EFE8'],
      })

      setTimeout(() => navigate('/business/inventory'), 800)
    } catch (err) {
      setError(err.message)
      setShake(true)
      setTimeout(() => setShake(false), 600)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div className="biz-page" {...animations.pageEnter}>
      <div className="biz-page__header">
        <div>
          <h1 className="biz-page__title">{isEdit ? '✏️ Edit Product' : '➕ Add Product'}</h1>
          <p className="biz-page__subtitle">{isEdit ? 'Update product details' : 'Add a new product to inventory'}</p>
        </div>
        <button className="glass-btn" onClick={() => navigate('/business/inventory')}>← Back</button>
      </div>

      <div className="biz-form-layout">
        {/* Form */}
        <motion.form
          className={`glass-card glass-card--elevated biz-form ${shake ? 'biz-form--shake' : ''}`}
          onSubmit={handleSubmit}
          {...animations.slideUp}
        >
          <div className="biz-form__group">
            <label className="biz-form__label">Product Name *</label>
            <input className="glass-input" placeholder="e.g. Premium Hair Oil" value={form.name} onChange={e => update('name', e.target.value)} />
          </div>

          <div className="biz-form__row">
            <div className="biz-form__group biz-form__group--flex">
              <label className="biz-form__label">SKU</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="glass-input" placeholder="Auto or manual" value={form.sku} onChange={e => update('sku', e.target.value)} style={{ flex: 1 }} />
                <motion.button type="button" className="glass-btn" onClick={generateSKU} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  ✨ Generate
                </motion.button>
              </div>
            </div>
            <div className="biz-form__group">
              <label className="biz-form__label">Category</label>
              <input className="glass-input" placeholder="e.g. Hair Care" value={form.category} onChange={e => update('category', e.target.value)} />
            </div>
          </div>

          <div className="biz-form__group">
            <label className="biz-form__label">Description</label>
            <textarea className="glass-input biz-textarea" placeholder="Product description..." value={form.description} onChange={e => update('description', e.target.value)} />
          </div>

          <div className="biz-form__row">
            <div className="biz-form__group">
              <label className="biz-form__label">Purchase Price (₹) *</label>
              <input className="glass-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.purchase_price} onChange={e => update('purchase_price', e.target.value)} />
            </div>
            <div className="biz-form__group">
              <label className="biz-form__label">Selling Price (₹) *</label>
              <input className="glass-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.selling_price} onChange={e => update('selling_price', e.target.value)} />
            </div>
          </div>

          <div className="biz-form__row">
            <div className="biz-form__group">
              <label className="biz-form__label">Initial Stock</label>
              <input className="glass-input" type="number" min="0" value={form.current_stock} onChange={e => update('current_stock', e.target.value)} />
            </div>
            <div className="biz-form__group">
              <label className="biz-form__label">Low Stock Alert</label>
              <input className="glass-input" type="number" min="0" value={form.min_stock_alert} onChange={e => update('min_stock_alert', e.target.value)} />
            </div>
          </div>

          <div className="biz-form__group">
            <label className="biz-form__label">Barcode (optional)</label>
            <input className="glass-input" placeholder="EAN/UPC barcode" value={form.barcode} onChange={e => update('barcode', e.target.value)} />
          </div>

          {error && (
            <motion.div className="biz-form__error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              {error.includes('dev mode') || error.includes('deploy') || error.includes('empty') ? (
                <>⚡ <strong>Dev mode:</strong> APIs only work on Vercel. The UI is working correctly — deploy to see live data.</>
              ) : (
                <>⚠️ {error}</>
              )}
            </motion.div>
          )}

          <button className="glass-btn glass-btn--primary glass-btn--large glass-btn--full" type="submit" disabled={saving}>
            {saving ? <><span className="spinner spinner--sm" /> Saving...</> : isEdit ? '💾 Update Product' : '✅ Add Product'}
          </button>
        </motion.form>

        {/* Live Profit Preview */}
        <motion.div className="glass-card glass-card--elevated biz-profit-preview" {...animations.slideUp}>
          <h3 className="biz-profit-preview__title">💰 Profit Preview</h3>
          <div className="biz-profit-preview__row">
            <span>Buy Price</span>
            <span>{formatCurrency(form.purchase_price || 0)}</span>
          </div>
          <div className="biz-profit-preview__arrow">↓</div>
          <div className="biz-profit-preview__row">
            <span>Sell Price</span>
            <span>{formatCurrency(form.selling_price || 0)}</span>
          </div>
          <div className="glass-divider" />
          <div className="biz-profit-preview__row biz-profit-preview__row--profit">
            <span>Profit per Unit</span>
            <span style={{ color: marginColor, fontSize: '1.5rem', fontWeight: 500 }}>
              {formatCurrency(profit)}
            </span>
          </div>
          <div className="biz-profit-preview__margin" style={{ background: `${marginColor}18`, borderColor: `${marginColor}44`, color: marginColor }}>
            {margin}% margin
          </div>
          {form.current_stock > 0 && (
            <div className="biz-profit-preview__total">
              Total potential: {formatCurrency(profit * parseInt(form.current_stock))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
