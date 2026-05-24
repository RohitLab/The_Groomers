import db from './_lib/sheetsHelper.js'
import setCors from './_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    switch (action) {

      case 'recordSale': {
        const { items, payment_method, customer_phone, customer_name, discount, notes } = req.body

        if (!items || items.length === 0) {
          return res.status(400).json({ error: 'No items in sale' })
        }

        // Validate stock for all items first
        const products = await db.getTab('Products')
        for (const item of items) {
          const product = products.find(p => p.product_id === item.product_id)
          if (!product) return res.status(400).json({ error: `Product not found: ${item.product_id}` })
          if (db.parseInt(product.current_stock) < item.quantity) {
            return res.status(400).json({
              error: `Insufficient stock for ${product.name}. Available: ${product.current_stock}`,
            })
          }
        }

        // Calculate totals
        let totalAmount = 0
        let totalCost = 0
        items.forEach(item => {
          totalAmount += item.quantity * db.parseNumber(item.selling_price)
          totalCost += item.quantity * db.parseNumber(item.purchase_price)
        })
        const discountAmount = db.parseNumber(discount) || 0
        const finalAmount = totalAmount - discountAmount
        const grossProfit = finalAmount - totalCost

        const saleId = db.generateId('SAL')
        const invoiceNumber = await db.generateInvoiceNumber()
        const now = new Date()

        // Write sale header
        await db.appendRow('Sales', {
          sale_id: saleId,
          invoice_number: invoiceNumber,
          sale_date: now.toISOString().split('T')[0],
          sale_time: now.toTimeString().split(' ')[0],
          total_amount: finalAmount,
          total_cost: totalCost,
          gross_profit: grossProfit,
          discount: discountAmount,
          payment_method: payment_method || 'Cash',
          customer_phone: customer_phone || '',
          customer_name: customer_name || '',
          notes: notes || '',
        })

        // Write sale items + update stock
        for (const item of items) {
          const product = products.find(p => p.product_id === item.product_id)
          await db.appendRow('Sale_Items', {
            item_id: db.generateId('ITM'),
            sale_id: saleId,
            invoice_number: invoiceNumber,
            product_id: item.product_id,
            product_name: product.name,
            quantity: item.quantity,
            purchase_price: item.purchase_price || product.purchase_price,
            selling_price: item.selling_price || product.selling_price,
            item_total: item.quantity * db.parseNumber(item.selling_price || product.selling_price),
            item_profit: item.quantity * (db.parseNumber(item.selling_price || product.selling_price) - db.parseNumber(item.purchase_price || product.purchase_price)),
          })

          // Update stock
          const newStock = db.parseInt(product.current_stock) - item.quantity
          await db.updateRow('Products', product._rowIndex, { ...product, current_stock: newStock })

          // Record stock movement
          await db.appendRow('Stock_Movements', {
            movement_id: db.generateId('MOV'),
            product_id: item.product_id,
            product_name: product.name,
            movement_type: 'OUT',
            quantity: item.quantity,
            reason: 'Sale',
            purchase_price_then: product.purchase_price,
            selling_price_then: product.selling_price,
            notes: `Invoice: ${invoiceNumber}`,
            date: now.toISOString().split('T')[0],
          })
        }

        return res.json({
          success: true,
          data: { saleId, invoiceNumber, totalAmount: finalAmount, grossProfit, discount: discountAmount },
        })
      }

      case 'getSales': {
        const { startDate, endDate, period, customer_phone } = req.query
        let sales = await db.getTab('Sales')

        if (period) {
          const range = db.getDateRange(period)
          sales = db.filterByDateRange(sales, 'sale_date', range.start, range.end)
        } else if (startDate && endDate) {
          sales = db.filterByDateRange(sales, 'sale_date', new Date(startDate), new Date(endDate))
        }

        if (customer_phone) {
          sales = sales.filter(s => s.customer_phone === customer_phone)
        }

        sales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        const totals = {
          count: sales.length,
          revenue: db.sumField(sales, 'total_amount'),
          profit: db.sumField(sales, 'gross_profit'),
          cost: db.sumField(sales, 'total_cost'),
        }
        return res.json({ success: true, data: sales, totals })
      }

      case 'getSaleDetail': {
        const { sale_id } = req.query
        const [sales, items] = await Promise.all([
          db.getTab('Sales'),
          db.getTabFiltered('Sale_Items', 'sale_id', sale_id),
        ])
        const sale = sales.find(s => s.sale_id === sale_id)
        if (!sale) return res.status(404).json({ error: 'Sale not found' })
        return res.json({ success: true, data: { ...sale, items } })
      }

      case 'getTopProducts': {
        const { period } = req.query
        let items = await db.getTab('Sale_Items')

        if (period) {
          const sales = await db.getTab('Sales')
          const range = db.getDateRange(period)
          const filteredSales = db.filterByDateRange(sales, 'sale_date', range.start, range.end)
          const saleIds = new Set(filteredSales.map(s => s.sale_id))
          items = items.filter(i => saleIds.has(i.sale_id))
        }

        const grouped = db.groupBy(items, 'product_name')
        const products = Object.entries(grouped).map(([name, rows]) => ({
          product_name: name,
          units_sold: rows.reduce((s, r) => s + db.parseInt(r.quantity), 0),
          revenue: db.sumField(rows, 'item_total'),
          profit: db.sumField(rows, 'item_profit'),
        }))
        products.sort((a, b) => b.revenue - a.revenue)
        return res.json({ success: true, data: products.slice(0, 10) })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Sales API error:', error)
    return res.status(500).json({ error: 'Server error', message: error.message })
  }
}
