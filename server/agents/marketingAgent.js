import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are the The Grommers Unisex Salon Marketing Agent for a salon owner. You have read access to the full customer database in Google Sheets. Help the owner by:
1. Filtering and segmenting customers based on visit count, tags, or last visit date
2. Writing compelling WhatsApp/SMS campaign messages for Indian festivals, discounts, and service promotions in Hindi, English, or Hinglish as preferred
3. Generating analytics summaries from the customer data
4. Suggesting the best time and audience for each campaign
Always be practical, concise, and results-focused.`

let client = null

function getClient() {
  if (client) return client
  if (!process.env.ANTHROPIC_API_KEY) return null
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export async function composeCampaignMessage({ audience, occasion, festival, customTopic, salonName }) {
  const anthropic = getClient()

  const prompt = `Generate 3 WhatsApp campaign message variants for a salon called "${salonName || 'The Grommers'}".

Target audience: ${audience}
Occasion: ${occasion}${festival ? ` - ${festival}` : ''}${customTopic ? `\nTopic: ${customTopic}` : ''}

Return EXACTLY this JSON format, no other text:
[
  {"style": "Formal", "text": "message here"},
  {"style": "Casual", "text": "message here"},
  {"style": "Fun", "text": "message here"}
]

Make messages appropriate for Indian audience. Include emojis. Keep each under 500 characters. Include a call-to-action.`

  if (!anthropic) {
    return getFallbackVariants(audience, occasion, festival, salonName)
  }

  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0]?.text || ''
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const variants = JSON.parse(jsonMatch[0])
      return variants
    }
    return getFallbackVariants(audience, occasion, festival, salonName)
  } catch (err) {
    console.error('Marketing agent error:', err.message)
    return getFallbackVariants(audience, occasion, festival, salonName)
  }
}

function getFallbackVariants(audience, occasion, festival, salonName) {
  const name = festival || occasion || 'Special Offer'
  const salon = salonName || 'The Grommers'
  return [
    { style: 'Formal', text: `Dear Valued Customer,\n\nWishing you a wonderful ${name}! As a token of our appreciation, enjoy 20% off all services this week at ${salon}.\n\nBook your appointment today!\n📞 Call us or visit our salon.\n\nWarm regards,\n${salon} Unisex Salon` },
    { style: 'Casual', text: `Hey there! 👋\n\nHappy ${name}! 🎉\n\nWe've got a special treat — 20% OFF all services this week at ${salon}!\n\nCome pamper yourself. You deserve it! 💇\n\nSee you soon! ✨` },
    { style: 'Fun', text: `${name} vibes are HERE! 🥳🎊\n\nFLAT 20% OFF at ${salon}! 💥\n\nNew look, new you — let's gooo! 💇‍♀️💇‍♂️\n\nBook NOW before slots fill up! 🏃‍♂️💨\n\n#${salon.replace(/\s/g, '')} #GlowUp` },
  ]
}
