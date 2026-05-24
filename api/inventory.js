import db from './_lib/sheetsHelper.js'
import setCors from './_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    switch (action) {

      case 'getProducts': {
        const products = await db.getTab('Products')
        const active = products.filter(p => p.is_active !== 'FALSE')
        return res.json({ success: true, data: active })
      }

      case 'getAllProducts': {
        const products = await db.getTab('Products')
        return res.json({ success: true, data: products })
      }

      case 'addProduct': {
        const body = req.body
        if (!body.name) return res.status(400).json({ error: 'Name required' })
        if (!body.purchase_price) return res.status(400).json({ error: 'Purchase price required' })
        if (!body.selling_price) return res.status(400).json({ error: 'Selling price required' })
        if (parseFloat(body.selling_price) < parseFloat(body.purchase_price)) {
          return res.status(400).json({ error: 'Selling price must be >= purchase price' })
        }

        const product = {
          product_id: db.generateId('PRD'),
          sku: body.sku || `SKU-${Date.now()}`,
          name: body.name,
          category: body.category || 'General',
          description: body.description || '',
          purchase_price: body.purchase_price,
          selling_price: body.selling_price,
          current_stock: body.current_stock || 0,
          min_stock_alert: body.min_stock_alert || 10,
          image_url: body.image_url || '',
          barcode: body.barcode || '',
          is_active: 'TRUE',
        }
        await db.appendRow('Products', product)
        return res.json({ success: true, data: product })
      }

      case 'updateProduct': {
        const { product_id, ...updates } = req.body
        const products = await db.getTab('Products')
        const product = products.find(p => p.product_id === product_id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        await db.updateRow('Products', product._rowIndex, { ...product, ...updates })
        return res.json({ success: true })
      }

      case 'deleteProduct': {
        const { product_id } = req.body
        const products = await db.getTab('Products')
        const product = products.find(p => p.product_id === product_id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        await db.updateRow('Products', product._rowIndex, { ...product, is_active: 'FALSE' })
        return res.json({ success: true })
      }

      case 'stockIn': {
        const { product_id, quantity, reason, notes, date } = req.body
        if (!product_id || !quantity) return res.status(400).json({ error: 'Product and quantity required' })

        const products = await db.getTab('Products')
        const product = products.find(p => p.product_id === product_id)
        if (!product) return res.status(404).json({ error: 'Product not found' })

        const newStock = db.parseInt(product.current_stock) + db.parseInt(quantity)
        await db.updateRow('Products', product._rowIndex, { ...product, current_stock: newStock })
        await db.appendRow('Stock_Movements', {
          movement_id: db.generateId('MOV'),
          product_id,
          product_name: product.name,
          movement_type: 'IN',
          quantity,
          reason: reason || 'Restock',
          purchase_price_then: product.purchase_price,
          selling_price_then: product.selling_price,
          notes: notes || '',
          date: date || new Date().toISOString().split('T')[0],
        })
        return res.json({ success: true, new_stock: newStock })
      }

      case 'stockOut': {
        const { product_id, quantity, reason, notes, date } = req.body
        const products = await db.getTab('Products')
        const product = products.find(p => p.product_id === product_id)
        if (!product) return res.status(404).json({ error: 'Product not found' })

        const currentStock = db.parseInt(product.current_stock)
        const qty = db.parseInt(quantity)
        if (currentStock < qty) {
          return res.status(400).json({ error: `Insufficient stock. Available: ${currentStock}` })
        }

        const newStock = currentStock - qty
        await db.updateRow('Products', product._rowIndex, { ...product, current_stock: newStock })
        await db.appendRow('Stock_Movements', {
          movement_id: db.generateId('MOV'),
          product_id,
          product_name: product.name,
          movement_type: 'OUT',
          quantity: qty,
          reason: reason || 'Manual',
          purchase_price_then: product.purchase_price,
          selling_price_then: product.selling_price,
          notes: notes || '',
          date: date || new Date().toISOString().split('T')[0],
        })
        return res.json({ success: true, new_stock: newStock })
      }

      case 'adjustStock': {
        const { product_id, new_quantity, reason, notes } = req.body
        const products = await db.getTab('Products')
        const product = products.find(p => p.product_id === product_id)
        if (!product) return res.status(404).json({ error: 'Product not found' })

        const diff = db.parseInt(new_quantity) - db.parseInt(product.current_stock)
        await db.updateRow('Products', product._rowIndex, { ...product, current_stock: new_quantity })
        await db.appendRow('Stock_Movements', {
          movement_id: db.generateId('MOV'),
          product_id,
          product_name: product.name,
          movement_type: 'ADJUST',
          quantity: Math.abs(diff),
          reason: reason || 'Manual Adjustment',
          notes: `${product.current_stock} → ${new_quantity}. ${notes || ''}`,
          date: new Date().toISOString().split('T')[0],
        })
        return res.json({ success: true, new_stock: new_quantity })
      }

      case 'getMovements': {
        const { product_id } = req.query
        let movements = await db.getTab('Stock_Movements')
        if (product_id) movements = movements.filter(m => m.product_id === product_id)
        movements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        return res.json({ success: true, data: movements })
      }

      case 'getLowStock': {
        const products = await db.getTab('Products')
        const active = products.filter(p => p.is_active !== 'FALSE')
        const low = active.filter(p =>
          db.parseInt(p.current_stock) <= db.parseInt(p.min_stock_alert || 10)
        ).map(p => ({
          ...p,
          urgency: db.parseInt(p.current_stock) === 0 ? 'out' : 'low',
        }))
        return res.json({ success: true, data: low, count: low.length })
      }

      case 'getInventoryValue': {
        const products = await db.getTab('Products')
        const active = products.filter(p => p.is_active !== 'FALSE')
        const summary = active.reduce((acc, p) => {
          const stock = db.parseInt(p.current_stock)
          const cost = db.parseNumber(p.purchase_price)
          const sell = db.parseNumber(p.selling_price)
          return {
            total_products: acc.total_products + 1,
            total_items: acc.total_items + stock,
            cost_value: acc.cost_value + (cost * stock),
            retail_value: acc.retail_value + (sell * stock),
            potential_profit: acc.potential_profit + ((sell - cost) * stock),
          }
        }, { total_products: 0, total_items: 0, cost_value: 0, retail_value: 0, potential_profit: 0 })
        return res.json({ success: true, data: summary })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Inventory API error:', error)
    return res.status(500).json({ error: 'Server error', message: error.message })
  }
}
