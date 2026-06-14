import { useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import LogoBrand from '../LogoBrand'

export default function PinGate() {
  const { verifyPin, isDefaultPin } = useDashboard()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDefaultWarning, setShowDefaultWarning] = useState(false)

  const handleKey = async (digit) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    if (newPin.length === 4) {
      setLoading(true)
      const ok = await verifyPin(newPin)
      if (!ok) {
        setError('Incorrect PIN')
        setPin('')
      } else if (isDefaultPin) {
        setShowDefaultWarning(true)
      }
      setLoading(false)
    }
  }

  const handleDelete = () => {
    setPin(p => p.slice(0, -1))
    setError('')
  }

  return (
    <div className="pin-gate">
      <div className="glass-card glass-card--elevated pin-gate__card anim-float-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
          <LogoBrand size="medium" />
        </div>
        <h1 className="pin-gate__title">Owner Dashboard</h1>
        <p className="pin-gate__desc">Enter your 4-digit PIN to continue</p>

        <div className="pin-dots">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'pin-dot--filled' : ''}`} />
          ))}
        </div>

        {loading && <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />}

        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <button key={d} className="pin-key" onClick={() => handleKey(String(d))} disabled={loading}>{d}</button>
          ))}
          <div /> {/* empty cell */}
          <button className="pin-key" onClick={() => handleKey('0')} disabled={loading}>0</button>
          <button className="pin-key pin-key--action" onClick={handleDelete} disabled={loading}>⌫</button>
        </div>

        {error && <p className="pin-error anim-fade-up">{error}</p>}

        {/* VULN-015: Warn owner if still using default PIN 1234 */}
        {showDefaultWarning && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: '10px 14px',
            background: 'rgba(245,166,35,0.12)',
            border: '1px solid rgba(245,166,35,0.4)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-xs)',
            color: '#F5A623',
            lineHeight: 1.5,
          }}>
            ⚠️ <strong>Security:</strong> You're using the default PIN (1234).<br />
            Change <code>DASHBOARD_PIN</code> in Vercel → Settings → Environment Variables.
          </div>
        )}
      </div>
    </div>
  )
}
