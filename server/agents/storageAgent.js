import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are the The Grommers Unisex Salon Storage Agent. Your only job is to read from and write to the connected Google Sheet that acts as the customer database. When asked to lookup a phone number, return the full row if found or null if not. When asked to save a new customer, append the row correctly. When asked to update a returning customer, update only the specified fields. Always confirm success or failure of each operation. Never modify data without explicit instruction.`

let client = null

function getClient() {
  if (client) return client
  if (!process.env.ANTHROPIC_API_KEY) return null
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export async function processWithStorage(action, data) {
  const anthropic = getClient()
  if (!anthropic) return { response: `Storage action: ${action}`, parsed: data, error: false }

  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Action: ${action}\nData: ${JSON.stringify(data)}\n\nProcess this storage operation and confirm the result.` }
      ],
    })
    return { response: res.content[0]?.text || '', parsed: data, error: false }
  } catch (err) {
    console.error('Storage agent error:', err.message)
    return { response: err.message, parsed: data, error: true }
  }
}
