import { getAllCustomers } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
}
