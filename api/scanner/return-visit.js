import { updateCustomer } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
}
