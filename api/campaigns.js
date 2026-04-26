import { composeCampaignMessage } from './_lib/marketingAgent.js'
import { getSettings, getAllCustomers } from './_lib/googleSheets.js'

export const maxDuration = 30

export default async function handler(req, res) {
  // CORS headers — allow browser clients
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  // ── POST actions ─────────────────────────────────────────
  if (req.method === 'POST') {
    // ── generate-ai: handled outside try/catch so real errors surface ──
    if (action === 'generate-ai') {
      const { offer, language, aiModel = 'claude-opus' } = req.body
      if (!offer) return res.status(400).json({ error: 'offer is required' })

      const prompt = `You are a WhatsApp marketing expert for The Groomers unisex salon in Nashik India.

Write 3 completely different WhatsApp messages for this offer: "${offer}"
Language: ${language || 'English'}

FORMAL: Start with the main benefit. Professional warm tone. 1-2 emojis. 80-100 words.

FRIENDLY: Like texting a close friend. Indian casual tone. 3-4 emojis. 60-80 words.

FUN: All caps key words. Super energetic. Short punchy sentences. 5+ emojis. 40-60 words.

Every message must:
- Have a completely unique opening line
- Mention specific urgency
- End with: 👉 the-groomers.vercel.app/scan

Reply with ONLY valid JSON, no markdown, no extra text:
{
  "variants": [
    {"style": "Formal", "emoji": "🎩", "text": "..."},
    {"style": "Friendly", "emoji": "😊", "text": "..."},
    {"style": "Fun", "emoji": "🎉", "text": "..."}
  ]
}`

      // ── Claude ────────────────────────────────────────────
      if (aiModel === 'claude-opus') {
        const apiKey = process.env.ANTHROPIC_KEY
        if (!apiKey) {
          return res.status(500).json({ error: 'ANTHROPIC_KEY not configured in environment' })
        }

        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        const claudeData = await claudeRes.json()
        if (claudeData.error) {
          return res.status(500).json({ error: claudeData.error.message || 'Claude API error' })
        }

        const text = claudeData.content[0].text.trim()
        const parsed = JSON.parse(text)
        return res.status(200).json(parsed)
      }

      // ── OpenAI GPT-4o / GPT-4o mini ──────────────────────
      if (aiModel === 'gpt-4o' || aiModel === 'gpt-4o-mini') {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          return res.status(500).json({ error: 'OPENAI_API_KEY not configured in environment' })
        }

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: aiModel,
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        const openaiData = await openaiRes.json()
        if (openaiData.error) {
          return res.status(500).json({ error: openaiData.error.message || 'OpenAI API error' })
        }

        const text = openaiData.choices[0].message.content.trim()
        const parsed = JSON.parse(text)
        return res.status(200).json(parsed)
      }

      return res.status(400).json({ error: `Unknown aiModel: ${aiModel}` })
    }

    // ── Other POST actions ────────────────────────────────
    try {
      switch (action) {
        case 'generate': {
          const { audience, occasion, festival, customTopic } = req.body
          const settings = await getSettings()
          const variants = await composeCampaignMessage({
            audience,
            occasion,
            festival,
            customTopic,
            salonName: settings.salonName || 'The Groomers',
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
    } catch (err) {
      console.error(`Campaign API error (${action}):`, err)
      return res.status(500).json({ error: err.message || 'Server error' })
    }
  }

  // ── GET actions ──────────────────────────────────────────
  if (req.method === 'GET') {
    if (action === 'list') return res.json({ campaigns: [] })
    return res.status(400).json({ error: `Unknown GET action: ${action}` })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

