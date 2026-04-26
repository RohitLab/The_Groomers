import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useDashboard } from '../../context/DashboardContext'

const API = import.meta.env.VITE_API_URL || ''

export default function SettingsPanel() {
  const { settings, saveSettings } = useDashboard()
  const [local, setLocal] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [contactsConnected, setContactsConnected] = useState(null) // null = loading

  const update = (field, value) => {
    setLocal(s => ({ ...s, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const scanUrl = local.scanUrl || `${window.location.origin}/scan`

  // Fetch contactsConnected status from the server
  useEffect(() => {
    fetch(`${API}/api/settings?action=get`)
      .then(r => r.json())
      .then(data => setContactsConnected(!!data.contactsConnected))
      .catch(() => setContactsConnected(false))
  }, [])

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Settings</h1>
        <button className={`glass-btn ${saved ? 'glass-btn--success' : 'glass-btn--primary'}`} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-grid">
        {/* Salon Info */}
        <div className="glass-card settings-section">
          <h3 className="settings-section__title">Salon Information</h3>
          <div className="settings-field">
            <label>Salon Name</label>
            <input className="glass-input" value={local.salonName} onChange={e => update('salonName', e.target.value)} />
          </div>
          <div className="settings-field">
            <label>WhatsApp Business Number</label>
            <input className="glass-input" value={local.whatsappNumber} onChange={e => update('whatsappNumber', e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="settings-field">
            <label>Google Review URL</label>
            <input className="glass-input" value={local.googleReviewUrl} onChange={e => update('googleReviewUrl', e.target.value)} />
          </div>
        </div>

        {/* Cashback Config */}
        <div className="glass-card settings-section">
          <h3 className="settings-section__title">Cashback Configuration</h3>
          <div className="settings-field">
            <label>Cashback Percentage</label>
            <div className="settings-slider">
              <input type="range" min="1" max="20" value={local.cashbackPercent} onChange={e => update('cashbackPercent', Number(e.target.value))} />
              <span className="settings-slider__value">{local.cashbackPercent}%</span>
            </div>
          </div>
          <div className="settings-field">
            <label>Minimum Bill Amount (₹)</label>
            <input className="glass-input" type="number" value={local.minBill} onChange={e => update('minBill', Number(e.target.value))} />
          </div>
          <div className="settings-field">
            <label>Maximum Cashback Cap (₹)</label>
            <input className="glass-input" type="number" value={local.maxCashback} onChange={e => update('maxCashback', Number(e.target.value))} placeholder="Leave 0 for no cap" />
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card settings-section">
          <h3 className="settings-section__title">Social Links</h3>
          <div className="settings-field">
            <label>Instagram URL</label>
            <input className="glass-input" value={local.instagramUrl} onChange={e => update('instagramUrl', e.target.value)} />
          </div>
          <div className="settings-field">
            <label>Facebook URL</label>
            <input className="glass-input" value={local.facebookUrl} onChange={e => update('facebookUrl', e.target.value)} />
          </div>
        </div>

        {/* Google Contacts Integration */}
        <div className="glass-card settings-section">
          <h3 className="settings-section__title">📱 Google Contacts Integration</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '16px', lineHeight: 1.6 }}>
            Connect once — every new customer registered via the scanner automatically saves to your Google Contacts and syncs to your Android phone. Perfect for WhatsApp broadcasts.
          </p>

          <div style={{ marginBottom: '16px' }}>
            {contactsConnected === null ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
              }}>
                ⏳ Checking status…
              </span>
            ) : contactsConnected ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '20px',
                background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)',
                color: '#81C784', fontSize: 'var(--font-size-sm)', fontWeight: 500,
              }}>
                ✅ Connected — new customers sync automatically
              </span>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '20px',
                background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.35)',
                color: '#FFB74D', fontSize: 'var(--font-size-sm)', fontWeight: 500,
              }}>
                ⚠️ Not connected yet
              </span>
            )}
          </div>

          <button
            id="connect-google-contacts-btn"
            onClick={() => window.open('/api/auth/authorize', '_blank')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              background: contactsConnected
                ? 'rgba(76,175,80,0.15)'
                : 'linear-gradient(135deg, #4285F4, #34A853)',
              border: contactsConnected ? '1px solid rgba(76,175,80,0.4)' : 'none',
              color: 'white', fontWeight: 600, fontSize: 'var(--font-size-sm)',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            🔗 {contactsConnected ? 'Reconnect Google Account' : 'Connect Google Contacts'}
          </button>

          {!contactsConnected && (
            <p style={{
              marginTop: '12px', fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)', lineHeight: 1.6,
            }}>
              After connecting: copy the refresh token shown → add to Vercel as{' '}
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>
                GOOGLE_REFRESH_TOKEN
              </code>{' '}
              → Redeploy.
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className="glass-card settings-section">
          <h3 className="settings-section__title">Scanner QR Code</h3>
          <div className="settings-field">
            <label>Scanner Page URL</label>
            <input className="glass-input" value={local.scanUrl || scanUrl} onChange={e => update('scanUrl', e.target.value)} placeholder={scanUrl} />
          </div>
          <div className="qr-display">
            <QRCodeSVG value={scanUrl} size={180} bgColor="transparent" fgColor="#F1EFE8" level="M" />
            <p className="qr-display__url">{scanUrl}</p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Print this QR code and place at salon counter</p>
          </div>
        </div>
      </div>
    </div>
  )
}
