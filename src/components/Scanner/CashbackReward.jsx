import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useScanner } from '../../context/ScannerContext'

export default function CashbackReward() {
  const { cashbackAmount, billAmount, isReturning, activeCashbackPercent, reset } = useScanner()

  const bill       = parseFloat(billAmount) || 0
  const cashback   = cashbackAmount
  const amountDue  = Math.max(0, bill - cashback)

  useEffect(() => {
    // Fire confetti burst
    const end = Date.now() + 1800
    const colors = ['#F1EFE8', '#888780', '#7EC699', '#E8C87A', '#F5A623']

    const frame = () => {
      confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <div className="glass-card glass-card--elevated cashback-reward anim-card-flip">

      {/* Header */}
      <span className="cashback-reward__icon">🎉</span>
      <p className="cashback-reward__amount anim-counter">₹{cashback.toFixed(0)}</p>
      <p className="cashback-reward__label">cashback earned!</p>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
        {isReturning ? '🔁 Returning customer' : '🆕 New customer'} &nbsp;·&nbsp; {activeCashbackPercent}% off
      </p>

      {/* Bill Breakdown */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: 'var(--space-4) var(--space-5)',
        marginBottom: 'var(--space-5)',
        textAlign: 'left',
      }}>
        {/* Total bill row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Total Bill</span>
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
            ₹{bill.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Cashback discount row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Cashback Discount</span>
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-success)', fontWeight: 600 }}>
            − ₹{cashback.toFixed(0)}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', margin: 'var(--space-3) 0' }} />

        {/* Amount to pay */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)', fontWeight: 700 }}>
            💳 You Pay Now
          </span>
          <span style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #F1EFE8, #F5A623)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ₹{amountDue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Staff notice */}
      <div className="cashback-reward__notice" style={{ marginBottom: 'var(--space-6)' }}>
        💰 Show this screen to staff at checkout
      </div>

      <button className="glass-btn glass-btn--large glass-btn--full" onClick={reset}>
        Done
      </button>
    </div>
  )
}
