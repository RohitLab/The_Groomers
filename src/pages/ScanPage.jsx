import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScannerProvider, useScanner } from '../context/ScannerContext'
import PhoneInput from '../components/Scanner/PhoneInput'
import OnboardingForm from '../components/Scanner/OnboardingForm'
import WelcomeBack from '../components/Scanner/WelcomeBack'
import BillInput from '../components/Scanner/BillInput'
import CashbackReward from '../components/Scanner/CashbackReward'
import LogoBrand from '../components/LogoBrand'

function AppointmentWelcome() {
  const { customer, setStep } = useScanner()

  // Auto-advance to social follow step after 2.5 s
  useEffect(() => {
    const t = setTimeout(() => setStep('social'), 2500)
    return () => clearTimeout(t)
  }, [setStep])

  return (
    <motion.div
      className="glass-card glass-card--elevated anim-float-in"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: '2.5rem 2rem', textAlign: 'center' }}
    >
      {/* Animated checkmark ring */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(251,191,36,0.05))',
          border: '2px solid rgba(251,191,36,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 1.25rem',
        }}
      >
        ✨
      </motion.div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
        Welcome back, {customer?.name?.split(' ')[0] || 'there'}!
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        We have your details from your<br />
        appointment booking ✨
      </p>

      {/* Progress dots for auto-advance */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(251,191,36,0.4)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function ScanContent() {
  const { step } = useScanner()

  const renderStep = () => {
    switch (step) {
      case 'phone': return <PhoneInput key="phone" />
      case 'name': case 'email': case 'social': case 'review':
        return <OnboardingForm key="onboarding" />
      case 'welcomeBack': return <WelcomeBack key="welcome" />
      case 'appointmentWelcome': return <AppointmentWelcome key="appt-welcome" />
      case 'bill': return <BillInput key="bill" />
      case 'cashback': return <CashbackReward key="cashback" />
      default: return <PhoneInput key="phone" />
    }
  }

  return (
    <motion.div className="scan-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Floating particles */}
      <div className="particle-bg">
        {[...Array(8)].map((_, i) => <div key={i} className="particle" />)}
      </div>

      {/* Brand logo */}
      <div className="anim-fade-up" style={{ marginBottom: 'var(--space-6)' }}>
        <LogoBrand size="large" theme="dark" />
      </div>

      {/* Main content */}
      <div className="scan-container">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderStep()}
        </motion.div>
      </div>

      {/* Book appointment footer link */}
      <motion.div
        className="scan-book-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>Want to book in advance?&nbsp;
          <a href="/book" className="scan-book-link">→ Book Appointment</a>
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function ScanPage() {
  return (
    <ScannerProvider>
      <ScanContent />
    </ScannerProvider>
  )
}
