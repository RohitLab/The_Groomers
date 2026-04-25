import { useScanner } from '../../context/ScannerContext'

export default function WelcomeBack() {
  const { customer, setStep, settings, formData, setFormData } = useScanner()

  const handleReviewAndContinue = () => {
    window.open(settings.googleReviewUrl, '_blank')
    setFormData(prev => ({ ...prev, googleReviewDone: true }))
  }

  return (
    <div className="glass-card glass-card--elevated welcome-back anim-card-flip">
      <div className="welcome-back__card">
        <span className="welcome-back__emoji">✨</span>
        <h2 className="welcome-back__greeting">Welcome Back, {customer?.name || 'Friend'}!</h2>
        <p className="welcome-back__info">Great to see you again</p>
        <div className="welcome-back__visits">
          🗓️ Visit #{(customer?.visits || 0) + 1} • Last: {customer?.lastVisit || 'N/A'}
        </div>

        {customer?.tag && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <span className={`glass-badge glass-badge--${customer.tag.toLowerCase()}`}>{customer.tag}</span>
          </div>
        )}

        {customer?.totalCashback > 0 && (
          <div className="glass-card--subtle" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>YOUR CASHBACK BALANCE</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-medium)', color: 'var(--color-success)' }}>₹{customer.totalCashback}</p>
          </div>
        )}

        {!customer?.googleReview && (
          <button className={`glass-btn glass-btn--large glass-btn--full ${formData.googleReviewDone ? 'glass-btn--success' : 'glass-btn--primary'}`} onClick={handleReviewAndContinue} style={{ marginBottom: 'var(--space-4)' }}>
            {formData.googleReviewDone ? '✓ Review Done' : '⭐ Leave a Google Review'}
          </button>
        )}

        <button className="glass-btn glass-btn--primary glass-btn--large glass-btn--full" onClick={() => setStep('bill')} style={{ marginTop: 'var(--space-3)' }}>
          Continue to Billing →
        </button>
      </div>
    </div>
  )
}
