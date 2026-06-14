import db from './_lib/sheetsHelper.js'
import setCors from './_lib/cors.js'
import { requirePin } from './_lib/auth.js'

export default async function handler(req, res) {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  // VULN-003: Business settings require dashboard PIN
  if (!requirePin(req, res)) return

  const { action } = req.query

  try {
    switch (action) {

      case 'getSettings': {
        const rows = await db.getTab('Business_Settings')
        const settings = {}
        rows.forEach(row => {
          settings[row.key] = row.value
        })
        // Defaults
        const defaults = {
          business_name: 'My Shop',
          currency_symbol: '₹',
          financial_year_start: 'April',
          tax_rate: '0',
          low_stock_threshold: '10',
        }
        return res.json({ success: true, data: { ...defaults, ...settings } })
      }

      case 'updateSetting': {
        const { key, value } = req.body
        if (!key) return res.status(400).json({ error: 'Key required' })
        // Only allow known setting keys to prevent arbitrary data injection
        const ALLOWED_KEYS = new Set(['business_name','currency_symbol','financial_year_start','tax_rate','low_stock_threshold'])
        if (!ALLOWED_KEYS.has(key)) {
          return res.status(400).json({ error: 'Unknown setting key' })
        }

        const rows = await db.getTab('Business_Settings')
        const existing = rows.find(r => r.key === key)
        if (existing) {
          await db.updateRow('Business_Settings', existing._rowIndex, {
            key,
            value: String(value),
          })
        } else {
          await db.appendRow('Business_Settings', {
            key,
            value: String(value),
          })
        }
        return res.json({ success: true })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    // VULN-004: Log internally, never expose error details to client
    console.error('BusinessSettings API error:', error)
    return res.status(500).json({ error: 'An internal error occurred. Please try again.' })
  }
}
