import { useState, useMemo } from 'react'
import { useDashboard } from '../../context/DashboardContext'

/* ─────────────────────────────────────────────────────────────────
   FEATURE 1 — AI MESSAGE GENERATOR
───────────────────────────────────────────────────────────────── */
const LANGUAGES = ['English', 'Hindi', 'Hinglish']

// Server-side proxy — avoids browser CORS restrictions with Anthropic API
async function callClaude(offer, language) {
  const res = await fetch('/api/campaigns?action=generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer, language }),
  })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  const data = await res.json()
  if (!data.variants?.length) throw new Error('No variants returned')
  return data.variants
}


function demoVariants(offer) {
  return [
    {
      style: 'Formal', emoji: '🎩',
      text: `Dear Valued Guest,\n\nWe're delighted to present an exclusive offer at The Groomers — ${offer}.\n\nWe warmly invite you to experience our world-class grooming services.\n\n📍 Book your appointment today!\n🌐 the-groomers.vercel.app/scan\n\nWarm regards,\nThe Groomers Unisex Salon`,
    },
    {
      style: 'Friendly', emoji: '😊',
      text: `Hey! 👋\n\nGreat news from The Groomers! ✨\n${offer} 🎁\n\nWe'd love to pamper you — come on in!\n\n💇 Book your slot today.\n🔗 the-groomers.vercel.app/scan\n\nSee you soon! 😊`,
    },
    {
      style: 'Fun', emoji: '🎉',
      text: `🚨 BIG OFFER ALERT 🚨\n\n${offer} 💥💥\n\nYou NEED this, trust us! 💇‍♀️💇‍♂️✨\n\nDon't sleep on it — slots are flying! 🏃‍♂️💨\n\n👉 the-groomers.vercel.app/scan\n\n#TheGroomers #GlowUp #SalonLife`,
    },
  ]
}

function MessageCard({ variant, index }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(variant.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cc-message-card glass-card">
      <div className="cc-message-card__header">
        <span className="cc-message-card__style">
          {variant.emoji} {variant.style}
        </span>
        <button
          className={`glass-btn ${copied ? 'glass-btn--success' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <p className="cc-message-card__text">{variant.text}</p>
    </div>
  )
}

function AIMessageGenerator() {
  const [offer, setOffer] = useState('')
  const [language, setLanguage] = useState('English')
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!offer.trim()) return
    setLoading(true)
    setError('')
    setVariants([])
    try {
      const result = await callClaude(offer.trim(), language)
      setVariants(result)
    } catch (err) {
      setError('⚠️ Could not reach AI — showing demo messages.')
      console.error(err)
      setVariants(demoVariants(offer.trim()))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header">
        <span className="cc-card__icon">🤖</span>
        <div>
          <h2 className="cc-card__title">AI Message Generator</h2>
          <p className="cc-card__subtitle">Generate 3 WhatsApp message variants with Claude AI</p>
        </div>
      </div>

      <div className="cc-card__body">
        <div className="cc-field">
          <label className="cc-label">Describe your offer</label>
          <textarea
            className="glass-input message-edit-area cc-textarea"
            placeholder="e.g. Diwali special, 20% off on all services, this weekend only, for all customers"
            value={offer}
            onChange={e => setOffer(e.target.value)}
            rows={3}
          />
        </div>

        <div className="cc-field">
          <label className="cc-label">Language</label>
          <div className="cc-lang-row">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                className={`campaign-option ${language === lang ? 'campaign-option--selected' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button
          className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
          onClick={handleGenerate}
          disabled={loading || !offer.trim()}
          id="generate-messages-btn"
        >
          {loading ? <><span className="spinner" /> Generating...</> : '✨ Generate Messages'}
        </button>

        {error && <p className="cc-error">{error}</p>}

        {variants.length > 0 && (
          <div className="cc-variants anim-fade-up">
            <p className="cc-variants__label">Choose &amp; copy a message variant:</p>
            {variants.map((v, i) => (
              <MessageCard key={i} variant={v} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   FEATURE 2 — EXPORT CUSTOMER NUMBERS
───────────────────────────────────────────────────────────────── */
const FILTER_OPTIONS = [
  { id: 'all',     label: 'All' },
  { id: 'male',    label: 'Male' },
  { id: 'female',  label: 'Female' },
  { id: 'VIP',     label: 'VIP' },
  { id: 'Regular', label: 'Regular' },
  { id: 'New',     label: 'New' },
  { id: 'inactive30', label: 'Last visit > 30 days' },
  { id: 'inactive60', label: 'Last visit > 60 days' },
]

function daysSinceLastVisit(customer) {
  const last = customer.lastVisit || customer.firstVisit
  if (!last) return 999
  return Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24))
}

function ExportCustomerNumbers() {
  const { allCustomers } = useDashboard()
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    if (!allCustomers) return []
    switch (activeFilter) {
      case 'male':       return allCustomers.filter(c => c.gender?.toLowerCase() === 'male')
      case 'female':     return allCustomers.filter(c => c.gender?.toLowerCase() === 'female')
      case 'VIP':        return allCustomers.filter(c => c.tag === 'VIP')
      case 'Regular':    return allCustomers.filter(c => c.tag === 'Regular')
      case 'New':        return allCustomers.filter(c => c.tag === 'New')
      case 'inactive30': return allCustomers.filter(c => daysSinceLastVisit(c) > 30)
      case 'inactive60': return allCustomers.filter(c => daysSinceLastVisit(c) > 60)
      default:           return allCustomers
    }
  }, [allCustomers, activeFilter])

  const handleExport = () => {
    const rows = [['Name', 'Mobile Number', 'Tag']]
    filtered.forEach(c => {
      rows.push([
        (c.name || '').replace(/,/g, ' '),
        (c.phone || c.mobile || ''),
        (c.tag || ''),
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `groomers-campaign-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header">
        <span className="cc-card__icon">📤</span>
        <div>
          <h2 className="cc-card__title">Export Customer Numbers</h2>
          <p className="cc-card__subtitle">Filter and download a CSV for WhatsApp campaigns</p>
        </div>
      </div>

      <div className="cc-card__body">
        <div className="cc-field">
          <label className="cc-label">Filter customers</label>
          <div className="cc-filter-grid">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.id}
                className={`campaign-option ${activeFilter === f.id ? 'campaign-option--selected' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cc-export-count glass-card glass-card--subtle">
          <span className="cc-export-count__number">{filtered.length}</span>
          <span className="cc-export-count__text">customers selected</span>
        </div>

        <button
          className="glass-btn glass-btn--success glass-btn--large glass-btn--full"
          onClick={handleExport}
          disabled={filtered.length === 0}
          id="export-csv-btn"
        >
          📥 Export Numbers as CSV
        </button>

        <p className="cc-export-hint">
          Downloads as <code>groomers-campaign-[date].csv</code> with columns: Name, Mobile Number, Tag
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────── */
export default function CampaignComposer() {
  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Campaign Composer</h1>
      </div>

      <div className="cc-layout">
        <AIMessageGenerator />
        <ExportCustomerNumbers />
      </div>
    </div>
  )
}
