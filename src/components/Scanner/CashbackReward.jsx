import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useScanner } from '../../context/ScannerContext'

export default function CashbackReward() {
  const { cashbackAmount, billAmount, reset } = useScanner()

  useEffect(() => {
    // Fire confetti burst
    const end = Date.now() + 1500
    const colors = ['#F1EFE8', '#888780', '#7EC699', '#E8C87A']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        disableForReducedMotion: true,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        disableForReducedMotion: true,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <div className="glass-card glass-card--elevated cashback-reward anim-card-flip">
      <span className="cashback-reward__icon">🎉</span>
      <p className="cashback-reward__amount anim-counter">₹{cashbackAmount.toFixed(0)}</p>
      <p className="cashback-reward__label">cashback earned!</p>
      <p className="cashback-reward__bill">
        On your bill of ₹{parseFloat(billAmount).toLocaleString('en-IN')}
      </p>

      <div className="cashback-reward__notice" style={{ marginBottom: 'var(--space-8)' }}>
        💰 Show this screen to staff at checkout
      </div>

      <button className="glass-btn glass-btn--large glass-btn--full" onClick={reset}>
        Done
      </button>
    </div>
  )
}
