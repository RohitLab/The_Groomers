import { motion } from 'framer-motion'
import { useScanner } from '../../context/ScannerContext'

const STEPS = ['name', 'email', 'social', 'review']
const STEP_LABELS = { name: 'Your Name', email: 'Email Address', social: 'Follow Us', review: 'Google Review' }

export default function OnboardingForm() {
  const { step, setStep, formData, setFormData, settings, submitRegistration, loading } = useScanner()
  const currentIdx = STEPS.indexOf(step)

  const handleNext = async () => {
    const nextIdx = currentIdx + 1
    if (nextIdx < STEPS.length) {
      setStep(STEPS[nextIdx])
    } else {
      await submitRegistration()
      setStep('bill')
    }
  }

  const handleBack = () => {
    if (currentIdx > 0) setStep(STEPS[currentIdx - 1])
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 'name': return formData.name.trim().length >= 2
      case 'email': return !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      case 'social': return true
      case 'review': return true
      default: return true
    }
  }

  return (
    <div className="glass-card glass-card--elevated onboarding anim-float-in">
      {/* Progress dots */}
      <div className="scan-progress">
        <div className="scan-progress__steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`scan-progress__dot ${i < currentIdx ? 'scan-progress__dot--completed' : ''} ${i === currentIdx ? 'scan-progress__dot--active' : ''}`} />
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {step === 'name' && (
          <>
            <h2 className="onboarding__step-title">What's your name?</h2>
            <p className="onboarding__step-desc">So we can greet you personally</p>
            <div className="onboarding__field">
              <label htmlFor="name-input">Full Name</label>
              <input id="name-input" className="glass-input" placeholder="Enter your full name" value={formData.name} onChange={e => updateField('name', e.target.value)} autoFocus />
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

        {step === 'email' && (
          <>
            <h2 className="onboarding__step-title">Your email address</h2>
            <p className="onboarding__step-desc">For exclusive offers and updates (optional)</p>
            <div className="onboarding__field">
              <label htmlFor="email-input">Email ID</label>
              <input id="email-input" className="glass-input" type="email" placeholder="you@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} autoFocus />
            </div>
          </>
        )}

        {step === 'social' && (
          <>
            <h2 className="onboarding__step-title">Stay connected</h2>
            <p className="onboarding__step-desc">Follow us for tips, offers & updates</p>
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

        {step === 'review' && (
          <>
            <h2 className="onboarding__step-title">Leave a review</h2>
            <p className="onboarding__step-desc">Your feedback means the world to us ✨</p>
            <button className={`glass-btn glass-btn--large glass-btn--full ${formData.googleReviewDone ? 'glass-btn--success' : 'glass-btn--primary'}`} onClick={() => { window.open(settings.googleReviewUrl, '_blank'); updateField('googleReviewDone', true) }} style={{ marginBottom: 'var(--space-4)' }}>
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
          {loading ? <span className="spinner" /> : currentIdx === STEPS.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}
