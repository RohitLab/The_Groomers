import { getAllCustomers } from '../_lib/googleSheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { filter } = req.body

  try {
    let customers = await getAllCustomers()

    if (filter && filter !== 'all') {
      switch (filter) {
        case 'VIP':
        case 'Regular':
        case 'New':
          customers = customers.filter(c => c.tag === filter)
          break
        case 'inactive':
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          customers = customers.filter(c => {
            if (!c.lastVisit) return true
            return new Date(c.lastVisit) < thirtyDaysAgo
          })
          break
      }
    }

    const csv = [
      'Phone,Name,Email,Tag,Visits,Last Visit',
      ...customers.map(c =>
        `${c.phone},"${c.name}",${c.email},${c.tag},${c.visits},${c.lastVisit}`
      ),
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv')
    res.send(csv)
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Export failed' })
  }
}
