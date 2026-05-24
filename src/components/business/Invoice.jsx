import { formatCurrency, formatDate } from '../../constants/businessTheme'

export default function Invoice({ sale, items, businessName = 'My Shop' }) {
  if (!sale) return null

  const handlePrint = () => window.print()

  const handleWhatsApp = () => {
    const itemLines = items.map(i => `  ${i.product_name} x${i.quantity} = ${formatCurrency(i.item_total)}`).join('\n')
    const msg = `🧾 *INVOICE ${sale.invoice_number}*\n📅 ${formatDate(sale.sale_date)}\n\n${itemLines}\n\n${parseFloat(sale.discount) > 0 ? `Discount: -${formatCurrency(sale.discount)}\n` : ''}*Total: ${formatCurrency(sale.total_amount)}*\nPayment: ${sale.payment_method}\n\nThank you! — ${businessName}`
    window.open(`https://wa.me/${sale.customer_phone || ''}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="biz-invoice">
      <div className="biz-invoice__header">
        <div>
          <h2 className="biz-invoice__business">{businessName}</h2>
          <p className="biz-invoice__subtitle">Tax Invoice</p>
        </div>
        <div className="biz-invoice__meta">
          <p><strong>Invoice:</strong> {sale.invoice_number}</p>
          <p><strong>Date:</strong> {formatDate(sale.sale_date)}</p>
          {sale.sale_time && <p><strong>Time:</strong> {sale.sale_time}</p>}
        </div>
      </div>

      {(sale.customer_name || sale.customer_phone) && (
        <div className="biz-invoice__customer">
          <p><strong>Bill To:</strong></p>
          {sale.customer_name && <p>{sale.customer_name}</p>}
          {sale.customer_phone && <p>{sale.customer_phone}</p>}
        </div>
      )}

      <table className="biz-invoice__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.item_id}>
              <td>{i + 1}</td>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.selling_price)}</td>
              <td>{formatCurrency(item.item_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="biz-invoice__totals">
        {parseFloat(sale.discount) > 0 && (
          <>
            <div className="biz-invoice__row">
              <span>Subtotal</span>
              <span>{formatCurrency(parseFloat(sale.total_amount) + parseFloat(sale.discount))}</span>
            </div>
            <div className="biz-invoice__row" style={{ color: '#E8C87A' }}>
              <span>Discount</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
          </>
        )}
        <div className="biz-invoice__row biz-invoice__row--total">
          <span>Total</span>
          <span>{formatCurrency(sale.total_amount)}</span>
        </div>
        <div className="biz-invoice__row">
          <span>Payment</span>
          <span>{sale.payment_method}</span>
        </div>
      </div>

      <div className="biz-invoice__actions no-print">
        <button className="glass-btn glass-btn--primary" onClick={handlePrint}>🖨️ Print</button>
        <button className="glass-btn" onClick={handleWhatsApp}>📱 WhatsApp</button>
      </div>
    </div>
  )
}
