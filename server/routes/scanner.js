import { Router } from 'express'
import { lookupByPhone, appendCustomer, updateCustomer, getSettings } from '../services/googleSheets.js'

const router = Router()

// Lookup phone number
router.post('/lookup', async (req, res) => {
  const { phone } = req.body
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: 'Valid 10-digit phone number required' })
  }

  try {
    let result = await lookupByPhone(phone)

    if (result) {
      // Returning customer — increment visit
      const updated = {
        visits: result.customer.visits + 1,
        lastVisit: new Date().toISOString().split('T')[0],
      }
      if (updated.visits >= 5) updated.tag = 'VIP'
      else updated.tag = 'Regular'

      try { await updateCustomer(phone, updated) } catch {}

      res.json({
        found: true,
        customer: {
          ...result.customer,
          ...updated,
        },
      })
    } else {
      res.json({ found: false })
    }
  } catch (err) {
    console.error('Lookup error:', err)
    res.json({ found: false })
  }
})

// Register new customer
router.post('/register', async (req, res) => {
  const { phone, name, email, gender, instagramFollowed, facebookFollowed, googleReviewDone } = req.body
  if (!phone || !name) {
    return res.status(400).json({ error: 'Phone and name are required' })
  }

  const today = new Date().toISOString().split('T')[0]
  const customer = {
    phone,
    name,
    email: email || '',
    gender: gender || '',
    instagramFollowed: !!instagramFollowed,
    facebookFollowed: !!facebookFollowed,
    googleReview: !!googleReviewDone,
    cashbackAmount: 0,
    visits: 1,
    firstVisit: today,
    lastVisit: today,
    tag: 'New',
    billAmount: 0,
    cashbackEarned: 0,
    cashbackPercent: 5,
    totalCashback: 0,
  }

  try {
    const success = await appendCustomer(customer)
    if (success) {
      res.json({ success: true, customer })
    } else {
      res.status(500).json({ error: 'Failed to save customer' })
    }
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Record return visit
router.post('/return-visit', async (req, res) => {
  const { phone, googleReviewDone } = req.body
  try {
    const fields = { lastVisit: new Date().toISOString().split('T')[0] }
    if (googleReviewDone) fields.googleReview = true
    await updateCustomer(phone, fields)
    res.json({ success: true })
  } catch (err) {
    console.error('Return visit error:', err)
    res.status(500).json({ error: 'Return visit update failed' })
  }
})

// Process bill and cashback
router.post('/bill', async (req, res) => {
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
})

export default router
