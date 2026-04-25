import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useDashboard } from '../../context/DashboardContext'

export default function SettingsPanel() {
  const { settings, saveSettings } = useDashboard()
  const [local, setLocal] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

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
