import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'

// ── Lazy-load everything except HomePage (LCP-critical) ──────
const ScanPage       = lazy(() => import('./pages/ScanPage'))
const DashboardPage  = lazy(() => import('./pages/DashboardPage'))
const BookingPage    = lazy(() => import('./pages/BookingPage'))
const BusinessLayout = lazy(() => import('./components/business/BusinessLayout'))

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-primary)',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTopColor: 'rgba(241,239,232,0.6)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={
            <Suspense fallback={<PageLoader />}><ScanPage /></Suspense>
          } />
          <Route path="/dashboard" element={
            <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
          } />
          <Route path="/book" element={
            <Suspense fallback={<PageLoader />}><BookingPage /></Suspense>
          } />
          <Route path="/business/*" element={
            <Suspense fallback={<PageLoader />}><BusinessLayout /></Suspense>
          } />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
