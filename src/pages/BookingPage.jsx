import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LogoBrand from '../components/LogoBrand'

const SERVICES = [
  'Hair Cut & Style',
  'Hair Color',
  'Hair Extensions',
  'Facial / Cleanup',
  'Hydra Facial',
  'BB Glow',
  'Nails (Gel/Extension/Art)',
  'Nail Removal',
  'Waxing',
  'Eyebrows & Threading',
  'Bridal Package',
  'Makeup',
  'Other',
]

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
]

function getMinDate() {
  return new Date().toISOString().split('T')[0]
}

function getMaxDate() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

/* ─── Success Screen ─────────────────────────────────────── */
function SuccessScreen({ booking }) {
  return (
    <motion.div
      className="book-success"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Animated checkmark ring */}
      <div className="book-success__ring">
        <motion.div
          className="book-success__check"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
        >
          🎉
        </motion.div>
      </div>

      <motion.h2
        className="book-success__title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        Appointment Requested!
      </motion.h2>

      <motion.p
        className="book-success__sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        We will confirm within 2 hours.
      </motion.p>

      <motion.div
        className="book-success__card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <div className="book-success__row">
          <span className="book-success__label">Booking ID</span>
          <span className="book-success__value book-success__value--id">{booking.bookingId}</span>
        </div>
        <div className="book-success__row">
          <span className="book-success__label">Name</span>
          <span className="book-success__value">{booking.name}</span>
        </div>
        <div className="book-success__row">
          <span className="book-success__label">Service</span>
          <span className="book-success__value book-success__value--accent">{booking.service}</span>
        </div>
        <div className="book-success__row">
          <span className="book-success__label">Date & Time</span>
          <span className="book-success__value">{formatDisplayDate(booking.date)} at {booking.time}</span>
        </div>
      </motion.div>

      <motion.p
        className="book-success__email-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        📧 Check your email for confirmation
      </motion.p>

      <motion.a
        href="/scan"
        className="glass-btn glass-btn--primary book-success__btn"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        ← Back to Home
      </motion.a>
    </motion.div>
  )
}

/* ─── Booking Form ───────────────────────────────────────── */
export default function BookingPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    service: '', otherService: '',
    date: '', time: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [googleFilled, setGoogleFilled] = useState(false)
  const gBtnRef = useRef(null)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  // ── Google Sign-In auto-fill ───────────────────────────────
  const handleGoogleSignIn = (response) => {
    try {
      const base64Url = response.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      setForm(f => ({
        ...f,
        name:  payload.name  || f.name,
        email: payload.email || f.email,
      }))
      setGoogleFilled(true)
    } catch (err) {
      console.error('Google sign-in decode error:', err)
    }
  }

  useEffect(() => {
    // Store callback globally so GSI can reach it across re-renders
    window.__groomersBookingGoogleCb = handleGoogleSignIn

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google?.accounts?.id || !gBtnRef.current) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => window.__groomersBookingGoogleCb(res),
    })
    window.google.accounts.id.renderButton(gBtnRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: gBtnRef.current.offsetWidth || 340,
    })
  }, [])  // run once on mount — GSI loads async, so also guard with optional chaining above

  const effectiveService = form.service === 'Other' ? form.otherService : form.service

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate phone
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!effectiveService.trim()) {
      setError('Please select or describe your service.')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email address so we can send you a confirmation.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/appointments?action=book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service: effectiveService.trim(),
          date: form.date,
          time: form.time,
          notes: form.notes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Booking failed')
      setSuccess({ ...form, service: effectiveService, bookingId: data.bookingId })
    } catch (err) {
      setError(err.message || 'Could not submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="book-page">
      {/* Particle background */}
      <div className="particle-bg">
        {[...Array(8)].map((_, i) => <div key={i} className="particle" />)}
      </div>

      <div className="book-wrap">
        {/* Logo */}
        <motion.div
          className="book-logo"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LogoBrand size="large" theme="dark" />
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <SuccessScreen key="success" booking={success} />
          ) : (
            <motion.div
              key="form"
              className="book-form-card glass-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <div className="book-form-header">
                <h1 className="book-form-header__title">Book an Appointment</h1>
                <p className="book-form-header__sub">
                  Fill in your details and we'll confirm your slot within 2 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="book-form" noValidate>
                {/* Google Sign-In auto-fill */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                  <div style={{ marginBottom: '20px' }}>
                    {googleFilled ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: 'rgba(76,175,80,0.1)',
                          border: '1px solid rgba(76,175,80,0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: '#4CAF50',
                          textAlign: 'center',
                        }}
                      >
                        ✅ Name &amp; email auto-filled from Google!
                      </motion.div>
                    ) : (
                      <div ref={gBtnRef} style={{ display: 'flex', justifyContent: 'center' }} />
                    )}

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      margin: '16px 0 4px', color: '#888', fontSize: '11px',
                    }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                      OR FILL MANUALLY
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                )}

                {/* Name */}
                <div className="book-field">
                  <label className="book-label">Full Name <span className="book-req">*</span></label>
                  <input
                    className="glass-input"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="book-field">
                  <label className="book-label">Mobile Number <span className="book-req">*</span></label>
                  <input
                    className="glass-input"
                    type="tel"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={form.phone}
                    onChange={set('phone')}
                    required
                  />
                </div>

                {/* Email */}
                <div className="book-field">
                  <label className="book-label">Email ID <span className="book-req">*</span></label>
                  <input
                    className="glass-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </div>

                {/* Service */}
                <div className="book-field">
                  <label className="book-label">Service <span className="book-req">*</span></label>
                  <select
                    className="glass-input book-select"
                    value={form.service}
                    onChange={set('service')}
                    required
                  >
                    <option value="">-- Select a service --</option>
                    {SERVICES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {form.service === 'Other' && (
                    <motion.input
                      className="glass-input"
                      style={{ marginTop: '0.5rem' }}
                      type="text"
                      placeholder="Describe your service..."
                      value={form.otherService}
                      onChange={set('otherService')}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      required
                    />
                  )}
                </div>

                {/* Date & Time row */}
                <div className="book-row">
                  <div className="book-field">
                    <label className="book-label">Preferred Date <span className="book-req">*</span></label>
                    <input
                      className="glass-input"
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={form.date}
                      onChange={set('date')}
                      required
                    />
                  </div>
                  <div className="book-field">
                    <label className="book-label">Preferred Time <span className="book-req">*</span></label>
                    <select
                      className="glass-input book-select"
                      value={form.time}
                      onChange={set('time')}
                      required
                    >
                      <option value="">-- Select time --</option>
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="book-field">
                  <label className="book-label">Special Notes <span className="book-opt">(optional)</span></label>
                  <textarea
                    className="glass-input book-textarea"
                    placeholder="Any specific requirements..."
                    rows={3}
                    value={form.notes}
                    onChange={set('notes')}
                  />
                </div>

                {error && (
                  <motion.p
                    className="book-error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ⚠️ {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
                  disabled={loading}
                  id="book-submit-btn"
                >
                  {loading ? <><span className="spinner" /> Submitting...</> : 'Book My Appointment ✨'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="book-footer">
          📍 The Groomers Unisex Salon, Nashik
        </p>
      </div>
    </div>
  )
}
