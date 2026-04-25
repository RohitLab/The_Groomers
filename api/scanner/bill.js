import { lookupByPhone, updateCustomer, getSettings } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone, billAmount, isNew } = req.body
  if (!phone || !billAmount) {
    return res.status(400).json({ error: 'Phone and bill amount required' })
  }

  try {
    const settings = await getSettings()
    const percent = settings.cashbackPercent || 5
    const minBill = settings.minBill || 100
    const maxCashback = settings.maxCashback || 500

    const bill = parseFloat(billAmount)
    let cashback = 0
    if (bill >= minBill) {
      cashback = (bill * percent) / 100
      if (maxCashback > 0) cashback = Math.min(cashback, maxCashback)
    }

    // Get existing customer data
    const existing = await lookupByPhone(phone)
    const prevTotal = existing?.customer?.totalCashback || 0

    await updateCustomer(phone, {
      billAmount: bill,
      cashbackEarned: cashback,
      cashbackPercent: percent,
      totalCashback: prevTotal + cashback,
      lastVisit: new Date().toISOString().split('T')[0],
    })

    res.json({ success: true, cashback, billAmount: bill, percent })
  } catch (err) {
    console.error('Bill error:', err)
    res.status(500).json({ error: 'Bill processing failed' })
  }
}
