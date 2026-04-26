import { getSettings, updateSettings } from './_lib/googleSheets.js'

export default async function handler(req, res) {
  const { action } = req.query

  try {
    // ── GET actions ──────────────────────────────────────────
    if (req.method === 'GET') {
      switch (action) {
        case 'get': {
          const settings = await getSettings()
          return res.json({
            settings,
            contactsConnected: !!process.env.GOOGLE_REFRESH_TOKEN,
          })
        }

        default:
          return res.status(400).json({ error: `Unknown GET action: ${action}` })
      }
    }

    // ── POST actions ─────────────────────────────────────────
    if (req.method === 'POST') {
      switch (action) {
        case 'update': {
          await updateSettings(req.body)
          return res.json({ success: true })
        }

        case 'verify-pin': {
          const { pin } = req.body
          const correctPin = process.env.DASHBOARD_PIN || '1234'
          if (pin === correctPin) {
            return res.json({ success: true })
          }
          return res.status(401).json({ error: 'Invalid PIN' })
        }

        default:
          return res.status(400).json({ error: `Unknown POST action: ${action}` })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(`Settings API error (${action}):`, err)
    if (action === 'get') {
      return res.json({
        settings: {
          salonName: 'The Grommers',
          cashbackPercent: 5,
          minBill: 100,
          maxCashback: 500,
          instagramUrl: 'https://www.instagram.com/thegroomerss/',
          facebookUrl: 'https://facebook.com/thegrommers',
          googleReviewUrl: 'https://g.page/thegrommers/review',
          whatsappNumber: '',
        },
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}
