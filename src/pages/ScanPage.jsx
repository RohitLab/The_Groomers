import { motion } from 'framer-motion'
import { ScannerProvider, useScanner } from '../context/ScannerContext'
import PhoneInput from '../components/Scanner/PhoneInput'
import OnboardingForm from '../components/Scanner/OnboardingForm'
import WelcomeBack from '../components/Scanner/WelcomeBack'
import BillInput from '../components/Scanner/BillInput'
import CashbackReward from '../components/Scanner/CashbackReward'

function ScanContent() {
  const { step } = useScanner()

  const renderStep = () => {
    switch (step) {
      case 'phone': return <PhoneInput key="phone" />
      case 'name': case 'email': case 'social': case 'review':
        return <OnboardingForm key="onboarding" />
      case 'welcomeBack': return <WelcomeBack key="welcome" />
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
      <img
        src="/logo.svg"
        alt="The Groomers Unisex Salon"
        className="scan-page__logo anim-fade-up"
        style={{ width: '260px', height: 'auto', marginBottom: 'var(--space-4)' }}
      />

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
