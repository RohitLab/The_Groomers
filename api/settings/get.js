import { getSettings } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const settings = await getSettings()
    res.json({ settings })
  } catch (err) {
    console.error('Get settings error:', err)
    res.json({
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
}
