import { useState } from 'react'
import { useScanner } from '../../context/ScannerContext'

export default function PhoneInput() {
  const { phone, setPhone, lookupPhone, loading } = useScanner()
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (phone.length === 10) lookupPhone(phone)
  }

  return (
    <div className="phone-section anim-float-in">
      <div className="glass-card glass-card--elevated" style={{ padding: '2.5rem 2rem' }}>
        <p className="phone-section__label">Enter your mobile number to get started</p>
        <form onSubmit={handleSubmit}>
          <div className="phone-input-wrapper">
            <span className="phone-prefix">+91</span>
            <input
              id="phone-input"
              type="tel"
              className="glass-input glass-input--large phone-input"
              placeholder="00000 00000"
              value={phone}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              inputMode="numeric"
              autoComplete="tel"
            />
          </div>
          <button
            id="phone-submit-btn"
            type="submit"
            className="glass-btn glass-btn--primary glass-btn--large glass-btn--full phone-submit"
            disabled={phone.length !== 10 || loading}
          >
            {loading ? <span className="spinner" /> : 'Continue'}
          </button>
        </form>
        {phone.length > 0 && phone.length < 10 && (
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
            {10 - phone.length} digits remaining
          </p>
        )}
      </div>
    </div>
  )
}
