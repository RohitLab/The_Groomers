import { Router } from 'express'
import { getAllCustomers, lookupByPhone, updateCustomer } from '../services/googleSheets.js'

const router = Router()

// Get all customers with optional tag filter
router.get('/', async (req, res) => {
  const { tag, search } = req.query
  try {
    let customers = await getAllCustomers(tag || null)
    if (!customers) customers = []

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
    res.json({ customers: [] })
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
