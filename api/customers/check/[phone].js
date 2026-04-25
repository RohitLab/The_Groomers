import { lookupByPhone } from '../../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone } = req.query

  try {
    const result = await lookupByPhone(phone)
    if (result) {
      res.json({ customer: result.customer })
    } else {
      res.status(404).json({ error: 'Customer not found' })
    }
  } catch (err) {
    console.error('Get customer error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
