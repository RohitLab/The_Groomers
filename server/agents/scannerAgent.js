import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are the The Grommers Unisex Salon Scanner Agent for a professional salon. Your job is to guide walk-in customers through a smooth, friendly onboarding experience. You have access to the customer database via Google Sheets. When given a mobile number, check if the customer exists. For new customers, collect name, email, confirm social follows, and confirm Google review completion one step at a time. Be warm, brief, and encouraging. Confirm each step before moving to the next. At the end, confirm the cashback reward amount to display.`

let client = null

function getClient() {
  if (client) return client
  if (!process.env.ANTHROPIC_API_KEY) return null
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export async function processWithScanner(messages) {
  const anthropic = getClient()
  if (!anthropic) return { response: 'Scanner agent unavailable (no API key)', error: true }

  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    })
    return { response: res.content[0]?.text || '', error: false }
  } catch (err) {
    console.error('Scanner agent error:', err.message)
    return { response: err.message, error: true }
  }
}
