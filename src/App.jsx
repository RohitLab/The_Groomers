import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ScanPage from './pages/ScanPage'
import DashboardPage from './pages/DashboardPage'
import BookingPage from './pages/BookingPage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/book" element={<BookingPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
