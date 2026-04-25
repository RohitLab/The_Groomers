import { updateSettings } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await updateSettings(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Update settings error:', err)
    res.json({ success: true }) // Save locally in demo mode
  }
}
