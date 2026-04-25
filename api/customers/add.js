import { appendCustomer } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
}
