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
      const { offer, language } = req.body
      if (!offer) return res.status(400).json({ error: 'offer is required' })

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
      }

      const prompt = `You are a WhatsApp marketing expert 
for The Groomers, a premium unisex salon in Nashik, India.

Write 3 completely different WhatsApp broadcast messages 
for this offer: "${offer}"
Language: ${language || 'English'}

FORMAL: Professional and warm. Start directly with 
the offer benefit. 1-2 emojis. 80-100 words.

FRIENDLY: Like texting a close friend. Indian casual 
tone. Natural Hinglish if language is Hinglish. 
3-4 emojis. 60-80 words.

FUN: Super energetic. Bold. Short punchy sentences. 
ALL CAPS for key words. 5+ emojis. 40-60 words.

Every message must:
- Have completely unique opening line
- Include urgency (this weekend / limited slots / today only)
- Mention The Groomers Nashik naturally
- End with: 👉 the-groomers.vercel.app/scan

Reply with ONLY this exact JSON, no markdown, 
no extra text, no backticks:
{
  "variants": [
    {"style": "Formal", "emoji": "🎩", "text": "..."},
    {"style": "Friendly", "emoji": "😊", "text": "..."},
    {"style": "Fun", "emoji": "🎉", "text": "..."}
  ]
}`

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 1000
            }
          })
        }
      )

      const geminiData = await geminiRes.json()

      if (geminiData.error) {
        return res.status(500).json({ error: geminiData.error.message || 'Gemini API error' })
      }

      let text = geminiData.candidates[0].content.parts[0].text.trim()

      // Clean any markdown backticks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim()

      const parsed = JSON.parse(text)
      return res.status(200).json(parsed)
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

