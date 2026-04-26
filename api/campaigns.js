import { composeCampaignMessage } from './_lib/marketingAgent.js'
import { getSettings, getAllCustomers } from './_lib/googleSheets.js'

export default async function handler(req, res) {
  // CORS headers — allow browser clients
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

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

        case 'generate-ai': {
          // Server-side Claude call — avoids browser CORS restrictions
          const { offer, language } = req.body
          if (!offer) return res.status(400).json({ error: 'offer is required' })

          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) {
            // Return demo variants so the UI never breaks
            return res.json({ variants: getAIDemoVariants(offer) })
          }

          const systemPrompt =
            'You are an expert WhatsApp marketing copywriter for The Groomers, a premium unisex salon in Nashik.\n' +
            'Write 3 highly attractive, emotional, and action-driving WhatsApp broadcast messages.\n\n' +
            'Rules:\n' +
            '- Use power words that create urgency and excitement\n' +
            '- Add relevant emojis throughout naturally\n' +
            '- Include a clear call to action\n' +
            '- Make it feel personal and warm, not corporate\n' +
            '- For Hindi/Hinglish use natural conversational tone\n' +
            "- Add offer expiry urgency like 'This weekend only' or 'Limited slots available'\n" +
            '- End with: 👉 +91 9119533325\n\n' +
            'Label exactly as: FORMAL, FRIENDLY, FUN\n' +
            'Each message max 120 words.\n\n' +
            'Return ONLY a valid JSON array, no markdown:\n' +
            '[{"style":"Formal","emoji":"🎩","text":"..."},{"style":"Friendly","emoji":"😊","text":"..."},{"style":"Fun","emoji":"🎉","text":"..."}]'

          const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-opus-4-5',
              max_tokens: 1000,
              system: systemPrompt,
              messages: [
                {
                  role: 'user',
                  content: `Offer: ${offer}\nLanguage: ${language || 'English'}\n\nGenerate 3 WhatsApp message variants (Formal, Friendly, Fun).`,
                },
              ],
            }),
          })

          if (!claudeRes.ok) {
            const errText = await claudeRes.text()
            console.error('Claude API error:', claudeRes.status, errText)
            return res.status(502).json({ error: 'Claude API error', variants: getAIDemoVariants(offer) })
          }

          const claudeData = await claudeRes.json()
          const raw = claudeData.content?.[0]?.text || ''
          try {
            const clean = raw.replace(/```json|```/g, '').trim()
            const variants = JSON.parse(clean)
            return res.json({ variants })
          } catch {
            console.error('Failed to parse Claude response:', raw)
            return res.json({ variants: getAIDemoVariants(offer) })
          }
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

function getAIDemoVariants(offer) {
  return [
    {
      style: 'Formal', emoji: '🎩',
      text: `Dear Valued Guest,\n\nWe're pleased to announce an exclusive offer at The Groomers — ${offer}.\n\nKindly book your appointment at your earliest convenience.\n\n🌐 the-groomers.vercel.app/scan\n\nWarm regards,\nThe Groomers Unisex Salon`,
    },
    {
      style: 'Friendly', emoji: '😊',
      text: `Hey! 👋 Great news from The Groomers! ✨\n\n${offer} 🎁\n\nWe'd love to see you — come in and let us pamper you!\n\n💇 Book your slot: the-groomers.vercel.app/scan\n\nSee you soon! 😊`,
    },
    {
      style: 'Fun', emoji: '🎉',
      text: `🚨 BIG DEAL ALERT 🚨\n\n${offer} 💥💥\n\nDon't miss out — slots are going fast! 🏃‍♂️💨\n\n👉 the-groomers.vercel.app/scan\n\n#TheGroomers #GlowUp #SalonLife`,
    },
  ]
}
