import { updateCustomer } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone, ...fields } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  try {
    await updateCustomer(phone, fields)
    res.json({ success: true })
  } catch (err) {
    console.error('Update customer error:', err)
    res.status(500).json({ error: 'Update failed' })
  }
}
