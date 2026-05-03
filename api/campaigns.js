import { composeCampaignMessage } from './_lib/marketingAgent.js'
import { getSettings, getAllCustomers } from './_lib/googleSheets.js'
import { sendEmail } from './_lib/emailService.js'

export const maxDuration = 60

// ─────────────────────────────────────────────────────────────────
// Helper — apply the audience filter used by both count-emails
// and send-email-campaign
// ─────────────────────────────────────────────────────────────────
function applyFilter(customers, filter) {
  if (!filter || filter === 'all') return customers
  switch (filter) {
    case 'female':
      return customers.filter(c => c.gender?.toLowerCase() === 'female')
    case 'male':
      return customers.filter(c => c.gender?.toLowerCase() === 'male')
    case 'VIP':
      return customers.filter(c => c.tag === 'VIP')
    case 'inactive': {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return customers.filter(c => {
        if (!c.lastVisit) return true
        return new Date(c.lastVisit) < thirtyDaysAgo
      })
    }
    default:
      return customers
  }
}

// ─────────────────────────────────────────────────────────────────
// HTML email template
// ─────────────────────────────────────────────────────────────────
function generateEmailHTML({ customerName, message, previewText }) {
  const formattedMessage = message
    .replace(/\n/g, '<br>')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${previewText}</title>
</head>
<body style="margin:0;padding:0;background:#f1efe8;font-family:Inter,Arial,sans-serif">

  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#f1efe8">
    ${previewText}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe8;padding:32px 16px">
    <tr><td align="center">

      <!-- Email Card -->
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;overflow:hidden;
               box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:#2c2c2a;padding:28px 32px;text-align:center">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:3px">
              THE GROOMERS
            </p>
            <p style="margin:6px 0 0;color:#F5A623;font-size:10px;letter-spacing:4px">
              UNISEX SALON
            </p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0">
            <p style="margin:0;font-size:18px;font-weight:600;color:#2c2c2a">
              Hi ${customerName}! 👋
            </p>
          </td>
        </tr>

        <!-- Message Body -->
        <tr>
          <td style="padding:16px 32px 24px">
            <p style="margin:0;font-size:15px;line-height:1.7;color:#444441">
              ${formattedMessage}
            </p>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:0 32px 28px;text-align:center">
            <a href="https://thegroomers.shop/book"
              style="display:inline-block;background:#2c2c2a;color:#ffffff;
                     text-decoration:none;padding:14px 32px;border-radius:8px;
                     font-size:14px;font-weight:600;letter-spacing:0.5px">
              Book Appointment →
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 32px">
            <div style="height:1px;background:#f1efe8"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;text-align:center">
            <p style="margin:0;font-size:12px;color:#888780;line-height:1.6">
              📍 The Groomers Unisex Salon, Nashik<br>
              Scan QR for cashback rewards<br>
              <a href="https://thegroomers.shop/scan"
                style="color:#F5A623;text-decoration:none">
                thegroomers.shop/scan
              </a>
            </p>
          </td>
        </tr>

      </table>
      <!-- End Card -->

    </td></tr>
  </table>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────
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
      const { offer, language, mode } = req.body
      if (!offer) return res.status(400).json({ error: 'offer is required' })

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
      }

      // ── Email generation mode ──────────────────────────────
      if (mode === 'email') {
        const prompt = `You are an email marketing expert for The Groomers, a premium unisex salon in Nashik, India.

Generate a promotional email for this offer: "${offer}"

Requirements:
- Subject line: catchy, max 60 chars, include an emoji
- Body: professional yet warm, 80-120 words
- Use *asterisks* around key phrases to bold them
- Include urgency (limited slots / this weekend / today only)
- Mention The Groomers Nashik naturally
- End with a call to action to book at thegroomers.shop/book
- Do NOT include salutation (Hi [Name]) or footer — those are added automatically

Reply with ONLY this exact JSON, no markdown, no backticks:
{
  "subject": "...",
  "body": "..."
}`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 600 }
            })
          }
        )

        const geminiData = await geminiRes.json()
        if (geminiData.error) {
          return res.status(500).json({ error: geminiData.error.message || 'Gemini API error' })
        }

        let text = geminiData.candidates[0].content.parts[0].text.trim()
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(text)
        return res.status(200).json(parsed)
      }

      // ── WhatsApp generation mode (original) ───────────────
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

        // ── count-emails: return how many have emails for a filter ──
        case 'count-emails': {
          const { filter } = req.body
          let customers = await getAllCustomers()
          customers = applyFilter(customers, filter)
          const count = customers.filter(c => c.email && c.email.includes('@')).length
          return res.status(200).json({ count })
        }

        // ── send-email-campaign: blast personalised emails ──────────
        case 'send-email-campaign': {
          const { subject, message, filter, previewText } = req.body

          if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message are required' })
          }

          let customers = await getAllCustomers()
          customers = applyFilter(customers, filter)

          const withEmail = customers.filter(c => c.email && c.email.includes('@'))

          if (withEmail.length === 0) {
            return res.status(400).json({ error: 'No customers with email addresses found for this filter' })
          }

          let sent = 0
          let failed = 0

          for (const customer of withEmail) {
            const html = generateEmailHTML({
              customerName: customer.name || 'Valued Customer',
              message,
              previewText: previewText || subject,
            })

            const ok = await sendEmail({
              to: customer.email,
              subject,
              html,
            })

            if (ok) {
              sent++
            } else {
              failed++
            }

            // 200ms throttle between sends
            await new Promise(r => setTimeout(r, 200))
          }

          return res.status(200).json({
            success: true,
            total: withEmail.length,
            sent,
            failed,
            message: `✅ ${sent} email${sent !== 1 ? 's' : ''} sent successfully${failed > 0 ? ` (${failed} failed)` : ''}!`,
          })
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
