import { composeCampaignMessage } from './_lib/marketingAgent.js'
import { getSettings, getAllCustomers } from './_lib/googleSheets.js'

export default async function handler(req, res) {
  const { action } = req.query

  try {
    // ── POST actions ─────────────────────────────────────────
    if (req.method === 'POST') {
      switch (action) {
        case 'generate': {
          const { audience, occasion, festival, customTopic } = req.body
          const settings = await getSettings()
          const variants = await composeCampaignMessage({
            audience,
            occasion,
            festival,
            customTopic,
            salonName: settings.salonName || 'The Grommers',
          })
          return res.json({ variants })
        }

        case 'export': {
          const { filter } = req.body
          let customers = await getAllCustomers()

          if (filter && filter !== 'all') {
            switch (filter) {
              case 'VIP':
              case 'Regular':
              case 'New':
                customers = customers.filter(c => c.tag === filter)
                break
              case 'inactive': {
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                customers = customers.filter(c => {
                  if (!c.lastVisit) return true
                  return new Date(c.lastVisit) < thirtyDaysAgo
                })
                break
              }
            }
          }

          const csv = [
            'Phone,Name,Email,Tag,Visits,Last Visit',
            ...customers.map(c =>
              `${c.phone},"${c.name}",${c.email},${c.tag},${c.visits},${c.lastVisit}`
            ),
          ].join('\n')

          res.setHeader('Content-Type', 'text/csv')
          res.setHeader('Content-Disposition', 'attachment; filename=customers.csv')
          return res.send(csv)
        }

        default:
          return res.status(400).json({ error: `Unknown POST action: ${action}` })
      }
    }

    // ── GET actions ──────────────────────────────────────────
    if (req.method === 'GET') {
      switch (action) {
        case 'list': {
          // Placeholder for future campaign history listing
          return res.json({ campaigns: [] })
        }

        default:
          return res.status(400).json({ error: `Unknown GET action: ${action}` })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(`Campaign API error (${action}):`, err)
    res.status(500).json({ error: 'Server error' })
  }
}
