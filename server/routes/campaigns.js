import { Router } from 'express'
import { composeCampaignMessage } from '../agents/marketingAgent.js'
import { getAllCustomers, getSettings } from '../services/localStorage.js'

const router = Router()

// Compose campaign messages using AI
router.post('/compose', async (req, res) => {
  const { audience, occasion, festival, customTopic } = req.body

  try {
    const settings = await getSettings()
    const variants = await composeCampaignMessage({
      audience,
      occasion,
      festival,
      customTopic,
      salonName: settings.salonName || 'The Grommers',
    })
    res.json({ variants })
  } catch (err) {
    console.error('Campaign compose error:', err)
    res.status(500).json({ error: 'Failed to compose campaign' })
  }
})

// Export filtered customer phone list
router.post('/export', async (req, res) => {
  const { filter } = req.body

  try {
    let customers = await getAllCustomers()

    if (filter && filter !== 'all') {
      switch (filter) {
        case 'VIP':
        case 'Regular':
        case 'New':
          customers = customers.filter(c => c.tag === filter)
          break
        case 'inactive':
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          customers = customers.filter(c => {
            if (!c.lastVisit) return true
            return new Date(c.lastVisit) < thirtyDaysAgo
          })
          break
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
    res.send(csv)
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Export failed' })
  }
})

export default router
