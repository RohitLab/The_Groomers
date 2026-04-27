import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SpeedInsights } from "@vercel/speed-insights/react"
import './styles/globals.css'
import './styles/glassmorphism.css'
import './styles/animations.css'
import './styles/scanner.css'
import './styles/dashboard.css'
import './styles/appointments.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>
)
