import { getSettings } from './_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let sheetsConnected = false
  try {
    await getSettings()
    sheetsConnected = true
  } catch {}

  res.json({
    status: 'ok',
    sheets: sheetsConnected,
    timestamp: new Date().toISOString(),
  })
}
