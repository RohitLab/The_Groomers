import { lookupByPhone, updateCustomer } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
}
