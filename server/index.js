import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import scannerRoutes from './routes/scanner.js'
import customerRoutes from './routes/customers.js'
import campaignRoutes from './routes/campaigns.js'
import settingsRoutes from './routes/settings.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/scanner', scannerRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/settings', settingsRoutes)

// Auth
app.post('/api/auth/verify', (req, res) => {
  const { pin } = req.body
  const correctPin = process.env.DASHBOARD_PIN || '1234'
  if (pin === correctPin) {
    res.json({ success: true })
  } else {
    res.status(401).json({ error: 'Invalid PIN' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
