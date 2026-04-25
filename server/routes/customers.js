import { Router } from 'express'
import { getAllCustomers, lookupByPhone, updateCustomer } from '../services/localStorage.js'

const router = Router()

const DEMO_CUSTOMERS = [
  { phone: '9876543210', name: 'Rahul Sharma', email: 'rahul@email.com', visits: 8, tag: 'VIP', lastVisit: '2026-04-20', firstVisit: '2025-11-15', totalCashback: 450, instagramFollowed: true, facebookFollowed: true, googleReview: true, gender: 'Male', billAmount: 600, cashbackEarned: 30, cashbackPercent: 5 },
  { phone: '9876543211', name: 'Priya Patel', email: 'priya@email.com', visits: 3, tag: 'Regular', lastVisit: '2026-04-18', firstVisit: '2026-01-10', totalCashback: 180, instagramFollowed: true, facebookFollowed: false, googleReview: true, gender: 'Female', billAmount: 800, cashbackEarned: 40, cashbackPercent: 5 },
  { phone: '9876543212', name: 'Amit Kumar', email: 'amit@email.com', visits: 1, tag: 'New', lastVisit: '2026-04-22', firstVisit: '2026-04-22', totalCashback: 30, instagramFollowed: false, facebookFollowed: false, googleReview: false, gender: 'Male', billAmount: 400, cashbackEarned: 20, cashbackPercent: 5 },
  { phone: '9876543213', name: 'Sneha Gupta', email: 'sneha@email.com', visits: 12, tag: 'VIP', lastVisit: '2026-04-24', firstVisit: '2025-06-01', totalCashback: 890, instagramFollowed: true, facebookFollowed: true, googleReview: true, gender: 'Female', billAmount: 1200, cashbackEarned: 60, cashbackPercent: 5 },
  { phone: '9876543214', name: 'Vikram Singh', email: 'vikram@email.com', visits: 2, tag: 'Regular', lastVisit: '2026-03-15', firstVisit: '2026-02-20', totalCashback: 95, instagramFollowed: false, facebookFollowed: false, googleReview: true, gender: 'Male', billAmount: 500, cashbackEarned: 25, cashbackPercent: 5 },
  { phone: '9876543215', name: 'Meera Joshi', email: 'meera@email.com', visits: 6, tag: 'VIP', lastVisit: '2026-04-10', firstVisit: '2025-09-08', totalCashback: 520, instagramFollowed: true, facebookFollowed: true, googleReview: true, gender: 'Female', billAmount: 900, cashbackEarned: 45, cashbackPercent: 5 },
  { phone: '9876543216', name: 'Arjun Reddy', email: 'arjun@email.com', visits: 1, tag: 'New', lastVisit: '2026-04-25', firstVisit: '2026-04-25', totalCashback: 45, instagramFollowed: true, facebookFollowed: false, googleReview: false, gender: 'Male', billAmount: 350, cashbackEarned: 17, cashbackPercent: 5 },
]

// Get all customers with optional tag filter
router.get('/', async (req, res) => {
  const { tag, search } = req.query
  try {
    let customers = await getAllCustomers(tag || null)
    // Use demo data if no Google Sheets configured
    if (!customers || customers.length === 0) {
      customers = tag ? DEMO_CUSTOMERS.filter(c => c.tag === tag) : [...DEMO_CUSTOMERS]
    }
    if (search) {
      const q = search.toLowerCase()
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
    }
    res.json({ customers })
  } catch (err) {
    console.error('Get customers error:', err)
    res.json({ customers: DEMO_CUSTOMERS })
  }
})

// Get single customer by phone
router.get('/:phone', async (req, res) => {
  try {
    const result = await lookupByPhone(req.params.phone)
    if (result) {
      res.json({ customer: result.customer })
    } else {
      res.status(404).json({ error: 'Customer not found' })
    }
  } catch (err) {
    console.error('Get customer error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update customer
router.put('/:phone', async (req, res) => {
  try {
    await updateCustomer(req.params.phone, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Update customer error:', err)
    res.status(500).json({ error: 'Update failed' })
  }
})

export default router
