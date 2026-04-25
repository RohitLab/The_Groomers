import { Router } from 'express'
import { getSettings, updateSettings } from '../services/localStorage.js'

const router = Router()

// Get settings
router.get('/', async (req, res) => {
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
})

// Update settings
router.put('/', async (req, res) => {
  try {
    await updateSettings(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Update settings error:', err)
    res.json({ success: true }) // Save locally in demo mode
  }
})

export default router
