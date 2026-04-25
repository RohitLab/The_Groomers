import { composeCampaignMessage } from '../_lib/marketingAgent.js'
import { getSettings } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
}
