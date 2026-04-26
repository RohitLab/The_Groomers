import { google } from 'googleapis'
import { getSettings, updateSettings, getAllCustomers } from './_lib/googleSheets.js'

// Extend Vercel function timeout to 60s for bulk sync
export const maxDuration = 60

export default async function handler(req, res) {
  const { action } = req.query

  try {
    // ── GET actions ──────────────────────────────────────────
    if (req.method === 'GET') {
      switch (action) {
        case 'get': {
          const settings = await getSettings()
          return res.json({
            settings,
            contactsConnected: !!process.env.GOOGLE_REFRESH_TOKEN,
          })
        }

        default:
          return res.status(400).json({ error: `Unknown GET action: ${action}` })
      }
    }

    // ── POST actions ─────────────────────────────────────────
    if (req.method === 'POST') {
      switch (action) {
        case 'update': {
          await updateSettings(req.body)
          return res.json({ success: true })
        }

        case 'verify-pin': {
          const { pin } = req.body
          const correctPin = process.env.DASHBOARD_PIN || '1234'
          if (pin === correctPin) {
            return res.json({ success: true })
          }
          return res.status(401).json({ error: 'Invalid PIN' })
        }

        case 'sync-contacts': {
          // Guard: require OAuth token to be set
          if (!process.env.GOOGLE_REFRESH_TOKEN) {
            return res.status(400).json({
              success: false,
              message: 'Please connect Google Contacts first in the section above.',
            })
          }

          const customers = await getAllCustomers()

          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://the-groomers.vercel.app/api/auth/callback'
          )
          oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

          const people = google.people({ version: 'v1', auth: oauth2Client })

          // ── Step 1: Fetch ALL existing contacts phone numbers ─────
          // Paginate through entire contacts list to build de-dup set
          const existingNumbers = new Set()
          let pageToken = null

          do {
            const existing = await people.people.connections.list({
              resourceName: 'people/me',
              pageSize: 1000,
              personFields: 'phoneNumbers',
              ...(pageToken ? { pageToken } : {}),
            })

            const connections = existing.data.connections || []
            connections.forEach(contact => {
              ;(contact.phoneNumbers || []).forEach(p => {
                // Normalize: strip +91, spaces, dashes for comparison
                const clean = p.value.replace(/\+91/g, '').replace(/[\s\-]/g, '').trim()
                existingNumbers.add(clean)
              })
            })

            pageToken = existing.data.nextPageToken || null
          } while (pageToken)

          // ── Step 2: Add only NEW customers ────────────────────────
          let synced = 0
          let skipped = 0
          let failed = 0

          for (const customer of customers) {
            try {
              const cleanPhone = (customer.phone || '')
                .replace(/\+91/g, '')
                .replace(/[\s\-]/g, '')
                .trim()

              // Skip if phone already exists in Google Contacts
              if (existingNumbers.has(cleanPhone)) {
                skipped++
                continue
              }

              await people.people.createContact({
                requestBody: {
                  names: [{
                    givenName: customer.name,
                    displayName: customer.name,
                  }],
                  phoneNumbers: [{
                    value: '+91' + cleanPhone,
                    type: 'mobile',
                  }],
                  ...(customer.email ? {
                    emailAddresses: [{ value: customer.email, type: 'home' }],
                  } : {}),
                  organizations: [{
                    name: 'The Groomers Customer',
                    title: customer.gender || '',
                  }],
                  biographies: [{
                    value: `Tag: ${customer.tag || 'New'} | Gender: ${customer.gender || ''} | Visits: ${customer.visits || 1}`,
                  }],
                },
              })

              synced++
              existingNumbers.add(cleanPhone) // prevent re-adding within same run

              // Throttle: 300ms between requests to stay within Google rate limits
              await new Promise(resolve => setTimeout(resolve, 300))
            } catch (err) {
              console.error('Sync failed for:', customer.name, err.message)
              failed++
            }
          }

          return res.status(200).json({
            success: true,
            total: customers.length,
            synced,
            skipped,
            failed,
            message: `Done! ${synced} new contact${synced !== 1 ? 's' : ''} added, ${skipped} already existed, ${failed} failed.`,
          })
        }

        default:
          return res.status(400).json({ error: `Unknown POST action: ${action}` })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(`Settings API error (${action}):`, err)
    if (action === 'get') {
      return res.json({
        settings: {
          salonName: 'The Grommers',
          cashbackPercent: 5,
          minBill: 100,
          maxCashback: 500,
          instagramUrl: 'https://www.instagram.com/thegroomerss/',
          facebookUrl: 'https://facebook.com/thegrommers',
          googleReviewUrl: 'https://g.page/thegrommers/review',
          whatsappNumber: '',
        },
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}
