export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pin } = req.body
  const correctPin = process.env.DASHBOARD_PIN || '1234'

  if (pin === correctPin) {
    res.json({ success: true })
  } else {
    res.status(401).json({ error: 'Invalid PIN' })
  }
}
