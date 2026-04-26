import {
  lookupByPhone,
  appendCustomer,
  updateCustomer,
  getAllCustomers,
  getSettings,
  saveToGoogleContacts,
} from './_lib/googleSheets.js'

export default async function handler(req, res) {
  const { action } = req.query

  try {
    // ── GET actions ──────────────────────────────────────────
    if (req.method === 'GET') {
      switch (action) {
        case 'check': {
          const { phone } = req.query
          if (!phone) return res.status(400).json({ error: 'Phone is required' })
          const result = await lookupByPhone(phone)
          if (result) return res.json({ customer: result.customer })
          return res.status(404).json({ error: 'Customer not found' })
        }

        case 'list': {
          const { tag, search } = req.query
          let customers = await getAllCustomers(tag || null)
          if (!customers) customers = []
          if (search) {
            const q = search.toLowerCase()
            customers = customers.filter(c =>
              c.name?.toLowerCase().includes(q) ||
              c.phone?.includes(q) ||
              c.email?.toLowerCase().includes(q)
            )
          }
          return res.json({ customers })
        }

        default:
          return res.status(400).json({ error: `Unknown GET action: ${action}` })
      }
    }

    // ── POST actions ─────────────────────────────────────────
    if (req.method === 'POST') {
      switch (action) {
        case 'add': {
          const { phone, name, email, gender, instagramFollowed, facebookFollowed, googleReviewDone } = req.body
          if (!phone || !name) return res.status(400).json({ error: 'Phone and name are required' })

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

          const [success] = await Promise.all([
            appendCustomer(customer),
            saveToGoogleContacts(customer),
          ])
          if (success) return res.json({ success: true, customer })
          return res.status(500).json({ error: 'Failed to save customer' })
        }

        case 'update': {
          const { phone, ...fields } = req.body
          if (!phone) return res.status(400).json({ error: 'Phone number is required' })
          await updateCustomer(phone, fields)
          return res.json({ success: true })
        }

        case 'lookup': {
          const { phone } = req.body
          if (!phone || phone.length !== 10) {
            return res.status(400).json({ error: 'Valid 10-digit phone number required' })
          }

          const result = await lookupByPhone(phone)
          if (result) {
            const updated = {
              visits: result.customer.visits + 1,
              lastVisit: new Date().toISOString().split('T')[0],
            }
            if (updated.visits >= 5) updated.tag = 'VIP'
            else updated.tag = 'Regular'

            try { await updateCustomer(phone, updated) } catch {}

            return res.json({
              found: true,
              customer: { ...result.customer, ...updated },
            })
          }
          return res.json({ found: false })
        }

        case 'bill': {
          const { phone, billAmount, isNew } = req.body
          if (!phone || !billAmount) {
            return res.status(400).json({ error: 'Phone and bill amount required' })
          }

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

          const existing = await lookupByPhone(phone)
          const prevTotal = existing?.customer?.totalCashback || 0

          await updateCustomer(phone, {
            billAmount: bill,
            cashbackEarned: cashback,
            cashbackPercent: percent,
            totalCashback: prevTotal + cashback,
            lastVisit: new Date().toISOString().split('T')[0],
          })

          return res.json({ success: true, cashback, billAmount: bill, percent })
        }

        case 'return-visit': {
          const { phone, googleReviewDone } = req.body
          const fields = { lastVisit: new Date().toISOString().split('T')[0] }
          if (googleReviewDone) fields.googleReview = true
          await updateCustomer(phone, fields)
          return res.json({ success: true })
        }

        default:
          return res.status(400).json({ error: `Unknown POST action: ${action}` })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(`Customer API error (${action}):`, err)
    res.status(500).json({ error: 'Server error' })
  }
}
