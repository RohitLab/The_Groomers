import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScanner } from '../../context/ScannerContext'

// Steps shown for new (walk-in) customers
const STEPS = ['name', 'email', 'social', 'review']
// Appointment customers skip name + email — start at social
const APPT_STEPS = ['social', 'review']

export default function OnboardingForm() {
  const { step, setStep, formData, setFormData, settings, submitRegistration, loading, isFromAppointment } = useScanner()

  const activeSteps = isFromAppointment ? APPT_STEPS : STEPS
  const currentIdx = activeSteps.indexOf(step)

  // Email validation state
  const [emailError, setEmailError] = useState('')

  // Google Sign-In state
  const [googleFilled, setGoogleFilled] = useState(false)
  const gBtnRef = useRef(null)

  const handleNext = async () => {
    // Validate email before proceeding
    if (step === 'email') {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setEmailError('Email is required to receive your cashback confirmation')
        return
      }
      setEmailError('')
    }

    const nextIdx = currentIdx + 1
    if (nextIdx < activeSteps.length) {
      setStep(activeSteps[nextIdx])
    } else {
      await submitRegistration()
      setStep('bill')
    }
  }

  const handleBack = () => {
    if (currentIdx > 0) setStep(activeSteps[currentIdx - 1])
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 'name':   return formData.name.trim().length >= 2
      case 'email':  return !emailError  // real check is in handleNext
      case 'social': return true
      case 'review': return true
      default: return true
    }
  }

  // ── Google Sign-In ────────────────────────────────────────────────
  const handleGoogleSignIn = (response) => {
    try {
      const base64Url = response.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))

      setFormData(prev => ({
        ...prev,
        name:  payload.name  || prev.name,
        email: payload.email || prev.email,
      }))
      setGoogleFilled(true)
      setEmailError('')
    } catch (err) {
      console.error('Google sign-in decode error:', err)
    }
  }

  // Expose callback globally so GSI data-callback can find it
  useEffect(() => {
    window.__groomersGoogleCb = handleGoogleSignIn
  })

  // Render the Google button when on the 'name' step
  useEffect(() => {
    if (step !== 'name') return
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google?.accounts?.id) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => window.__groomersGoogleCb(response),
    })

    if (gBtnRef.current) {
      window.google.accounts.id.renderButton(gBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: gBtnRef.current.offsetWidth || 320,
      })
    }
  }, [step])

  return (
    <div className="glass-card glass-card--elevated onboarding anim-float-in">
      {/* Progress dots */}
      <div className="scan-progress">
        <div className="scan-progress__steps">
          {activeSteps.map((s, i) => (
            <div key={s} className={`scan-progress__dot ${i < currentIdx ? 'scan-progress__dot--completed' : ''} ${i === currentIdx ? 'scan-progress__dot--active' : ''}`} />
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${((currentIdx + 1) / activeSteps.length) * 100}%` }} />
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {/* ── NAME + GENDER step ── */}
        {step === 'name' && (
          <>
            <h2 className="onboarding__step-title">What's your name?</h2>
            <p className="onboarding__step-desc">So we can greet you personally</p>

            {/* Google Sign-In button */}
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginBottom: '8px' }}>
                  Auto-fill your details
                </p>

                {googleFilled ? (
                  <div style={{
                    background: 'rgba(76,175,80,0.1)',
                    border: '1px solid rgba(76,175,80,0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#4CAF50',
                    marginBottom: '12px',
                    textAlign: 'center',
                  }}>
                    ✅ Details auto-filled from Google!
                  </div>
                ) : (
                  <div ref={gBtnRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }} />
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  margin: '4px 0 12px', color: '#888', fontSize: '11px',
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  OR FILL MANUALLY
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            )}

            <div className="onboarding__field">
              <label htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                className="glass-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                autoFocus
              />
            </div>
            <div className="onboarding__field">
              <label>Gender</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} className={`glass-btn ${formData.gender === g ? 'glass-btn--primary' : ''}`} onClick={() => updateField('gender', g)} type="button">{g}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── EMAIL step (now required) ── */}
        {step === 'email' && (
          <>
            <h2 className="onboarding__step-title">Your email address</h2>
            <p className="onboarding__step-desc">For exclusive offers &amp; cashback confirmation</p>
            <div className="onboarding__field">
              <label htmlFor="email-input">Email ID <span style={{ color: 'var(--color-accent, #fbbf24)' }}>*</span></label>
              <input
                id="email-input"
                className="glass-input"
                type="email"
                placeholder="your@email.com (required)"
                value={formData.email}
                onChange={e => {
                  updateField('email', e.target.value)
                  if (emailError) setEmailError('')
                }}
                autoFocus
                style={emailError ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } : {}}
              />
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}
                >
                  ⚠ {emailError}
                </motion.p>
              )}
            </div>
          </>
        )}

        {/* ── SOCIAL step ── */}
        {step === 'social' && (
          <>
            <h2 className="onboarding__step-title">Stay connected</h2>
            <p className="onboarding__step-desc">Follow us for tips, offers &amp; updates</p>
            <div className="social-buttons">
              <button className={`glass-btn social-btn ${formData.instagramFollowed ? 'social-btn--followed' : ''}`} onClick={() => { window.open(settings.instagramUrl, '_blank'); updateField('instagramFollowed', true) }}>
                <span className="social-btn__icon">📸</span>
                <span className="social-btn__text">Follow on Instagram</span>
                <span className="social-btn__status">{formData.instagramFollowed ? '✓ Followed' : 'Tap to follow'}</span>
              </button>
              <button className={`glass-btn social-btn ${formData.facebookFollowed ? 'social-btn--followed' : ''}`} onClick={() => { window.open(settings.facebookUrl, '_blank'); updateField('facebookFollowed', true) }}>
                <span className="social-btn__icon">👍</span>
                <span className="social-btn__text">Follow on Facebook</span>
                <span className="social-btn__status">{formData.facebookFollowed ? '✓ Followed' : 'Tap to follow'}</span>
              </button>
            </div>
          </>
        )}

        {/* ── REVIEW step ── */}
        {step === 'review' && (
          <>
            <h2 className="onboarding__step-title">Leave a review</h2>
            <p className="onboarding__step-desc">Your feedback means the world to us ✨</p>
            <button
              className={`glass-btn glass-btn--large glass-btn--full ${formData.googleReviewDone ? 'glass-btn--success' : 'glass-btn--primary'}`}
              onClick={() => { window.open(settings.googleReviewUrl, '_blank'); updateField('googleReviewDone', true) }}
              style={{ marginBottom: 'var(--space-4)' }}
            >
              {formData.googleReviewDone ? '✓ Review Submitted' : '⭐ Leave a Google Review'}
            </button>
            {!formData.googleReviewDone && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Tap to open Google Maps, then come back
              </p>
            )}
          </>
        )}
      </motion.div>

      <div className="onboarding__actions">
        {currentIdx > 0 && <button className="glass-btn" onClick={handleBack}>Back</button>}
        <button className="glass-btn glass-btn--primary" onClick={handleNext} disabled={!canProceed() || loading}>
          {loading ? <span className="spinner" /> : currentIdx === activeSteps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}
