import { useState, useMemo, useEffect, useCallback } from 'react'
import { useDashboard } from '../../context/DashboardContext'

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const LANGUAGES = ['English', 'Hindi', 'Hinglish']

const EMAIL_FILTERS = [
  { id: 'all',      label: '👥 All Customers' },
  { id: 'female',   label: '👩 Female' },
  { id: 'male',     label: '👨 Male' },
  { id: 'VIP',      label: '⭐ VIP Only' },
  { id: 'inactive', label: '💤 Inactive (30+ days)' },
]

const WHATSAPP_FILTER_OPTIONS = [
  { id: 'all',        label: 'All' },
  { id: 'male',       label: 'Male' },
  { id: 'female',     label: 'Female' },
  { id: 'VIP',        label: 'VIP' },
  { id: 'Regular',    label: 'Regular' },
  { id: 'New',        label: 'New' },
  { id: 'inactive30', label: 'Last visit > 30 days' },
  { id: 'inactive60', label: 'Last visit > 60 days' },
]

/* ─────────────────────────────────────────────────────────────────
   SERVER HELPERS
───────────────────────────────────────────────────────────────── */
async function callAI(offer, language) {
  const res = await fetch('/api/campaigns?action=generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer, language }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
  if (!data.variants?.length) throw new Error('No variants returned')
  return data.variants
}

async function callAIEmail(offer) {
  const res = await fetch('/api/campaigns?action=generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer, mode: 'email' }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
  return data // { subject, body }
}

/* ─────────────────────────────────────────────────────────────────
   WHATSAPP — MessageCard
───────────────────────────────────────────────────────────────── */
function MessageCard({ variant }) {
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

/* ─────────────────────────────────────────────────────────────────
   WHATSAPP — AI Message Generator
───────────────────────────────────────────────────────────────── */
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
      const result = await callAI(offer.trim(), language)
      setVariants(result)
    } catch (err) {
      setError(`⚠️ ${err.message || 'Could not reach Gemini API'}`)
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
          <p className="cc-card__subtitle">Generate 3 WhatsApp message variants powered by Google Gemini AI ⚡</p>
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
          {loading ? <><span className="spinner" /> Generating with Gemini...</> : '✨ Generate with Gemini'}
        </button>

        {error && <p className="cc-error">{error}</p>}

        {variants.length > 0 && (
          <div className="cc-variants anim-fade-up">
            <p className="cc-variants__label">Choose &amp; copy a message variant:</p>
            {variants.map((v, i) => (
              <MessageCard key={i} variant={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   WHATSAPP — Export Customer Numbers
───────────────────────────────────────────────────────────────── */
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
            {WHATSAPP_FILTER_OPTIONS.map(f => (
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
   EMAIL CAMPAIGN COMPOSER
───────────────────────────────────────────────────────────────── */
function EmailCampaign() {
  const [emailSubject, setEmailSubject]     = useState('')
  const [emailMessage, setEmailMessage]     = useState('')
  const [emailFilter, setEmailFilter]       = useState('all')
  const [emailSending, setEmailSending]     = useState(false)
  const [emailResult, setEmailResult]       = useState(null)
  const [recipientCount, setRecipientCount] = useState(null)
  const [countLoading, setCountLoading]     = useState(false)
  const [aiLoading, setAiLoading]           = useState(false)
  const [aiOffer, setAiOffer]               = useState('')
  const [aiError, setAiError]               = useState('')
  const [showAiPanel, setShowAiPanel]       = useState(false)

  // Fetch recipient count whenever the filter changes
  const fetchCount = useCallback(async (filter) => {
    setCountLoading(true)
    try {
      const res = await fetch('/api/campaigns?action=count-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter }),
      })
      const data = await res.json()
      setRecipientCount(data.count ?? 0)
    } catch {
      setRecipientCount(null)
    } finally {
      setCountLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount(emailFilter)
  }, [emailFilter, fetchCount])

  // AI email generation
  const handleGenerateEmail = async () => {
    if (!aiOffer.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const data = await callAIEmail(aiOffer.trim())
      if (data.subject) setEmailSubject(data.subject)
      if (data.body)    setEmailMessage(data.body)
      setShowAiPanel(false)
      setAiOffer('')
    } catch (err) {
      setAiError(`⚠️ ${err.message || 'Could not reach Gemini API'}`)
    } finally {
      setAiLoading(false)
    }
  }

  // Send campaign
  const handleSendEmailCampaign = async () => {
    if (!emailSubject || !emailMessage) return
    const confirmed = window.confirm(
      `Send email campaign to ${recipientCount ?? '?'} customers with email addresses?\n\nSubject: ${emailSubject}`
    )
    if (!confirmed) return

    setEmailSending(true)
    setEmailResult(null)
    try {
      const res = await fetch('/api/campaigns?action=send-email-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          filter: emailFilter,
          previewText: emailSubject,
        }),
      })
      const data = await res.json()
      setEmailResult(data)
    } catch {
      setEmailResult({ message: '❌ Failed to send. Please try again.' })
    } finally {
      setEmailSending(false)
    }
  }

  const emailMessagePlaceholder = `Write your offer message here...

You can use:
- Emojis 🎉 ✨ 💇‍♀️
- *bold text* with asterisks
- Line breaks for spacing

Example:
We have an amazing offer just for you! 🌟

*20% OFF* on all hair services this weekend only.

Valid: Saturday & Sunday, 10 AM – 7 PM
Slots are limited — book yours now! 🗓️`

  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header">
        <span className="cc-card__icon">📧</span>
        <div>
          <h2 className="cc-card__title">Email Campaign</h2>
          <p className="cc-card__subtitle">Send personalised bulk emails to your customers via Resend</p>
        </div>
      </div>

      <div className="cc-card__body">

        {/* ── AI Panel (collapsible) ── */}
        <div className={`ec-ai-panel glass-card glass-card--subtle ${showAiPanel ? 'ec-ai-panel--open' : ''}`}>
          <button
            className="ec-ai-toggle"
            onClick={() => setShowAiPanel(v => !v)}
          >
            <span>✨ Generate email content with Gemini AI</span>
            <span className="ec-ai-toggle__arrow">{showAiPanel ? '▲' : '▼'}</span>
          </button>

          {showAiPanel && (
            <div className="ec-ai-body anim-fade-up">
              <label className="cc-label">Describe your offer</label>
              <textarea
                className="glass-input cc-textarea"
                rows={2}
                placeholder="e.g. 20% off on all hair services this weekend"
                value={aiOffer}
                onChange={e => setAiOffer(e.target.value)}
              />
              <button
                className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
                onClick={handleGenerateEmail}
                disabled={aiLoading || !aiOffer.trim()}
                id="generate-email-ai-btn"
              >
                {aiLoading ? <><span className="spinner" /> Generating...</> : '✨ Generate Subject & Body'}
              </button>
              {aiError && <p className="cc-error">{aiError}</p>}
            </div>
          )}
        </div>

        {/* ── Subject ── */}
        <div className="cc-field">
          <label className="cc-label" htmlFor="ec-subject">Email Subject</label>
          <input
            id="ec-subject"
            className="glass-input"
            value={emailSubject}
            onChange={e => setEmailSubject(e.target.value)}
            placeholder="e.g. 🎉 Special Weekend Offer from The Groomers!"
          />
        </div>

        {/* ── Message ── */}
        <div className="cc-field">
          <label className="cc-label" htmlFor="ec-message">Message Body</label>
          <textarea
            id="ec-message"
            className="glass-input cc-textarea"
            rows={9}
            value={emailMessage}
            onChange={e => setEmailMessage(e.target.value)}
            placeholder={emailMessagePlaceholder}
          />
          <p className="cc-export-hint" style={{ marginTop: '6px' }}>
            Use <code>*asterisks*</code> for <strong>bold</strong>. Greeting (Hi [Name] 👋) and footer are added automatically.
          </p>
        </div>

        {/* ── Filter chips ── */}
        <div className="cc-field">
          <label className="cc-label">Send To</label>
          <div className="ec-filter-chips">
            {EMAIL_FILTERS.map(f => (
              <button
                key={f.id}
                className={`ec-chip ${emailFilter === f.id ? 'ec-chip--active' : ''}`}
                onClick={() => setEmailFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recipient count ── */}
        <div className="ec-recipient-count glass-card glass-card--subtle">
          {countLoading ? (
            <span className="ec-count-loading"><span className="spinner spinner--sm" /> Counting…</span>
          ) : recipientCount !== null ? (
            <>
              <span className="cc-export-count__number">{recipientCount}</span>
              <span className="cc-export-count__text">
                customer{recipientCount !== 1 ? 's' : ''} with email addresses
              </span>
            </>
          ) : (
            <span className="cc-export-count__text">—</span>
          )}
        </div>

        {/* ── Send button ── */}
        <button
          className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
          onClick={handleSendEmailCampaign}
          disabled={emailSending || !emailSubject.trim() || !emailMessage.trim() || recipientCount === 0}
          id="send-email-campaign-btn"
          style={{ marginTop: '8px' }}
        >
          {emailSending
            ? <><span className="spinner" /> Sending emails…</>
            : `📧 Send Email Campaign`}
        </button>

        {/* ── Result banner ── */}
        {emailResult && (
          <div className={`ec-result anim-fade-up ${emailResult.success ? 'ec-result--success' : 'ec-result--error'}`}>
            <p className="ec-result__msg">{emailResult.message}</p>
            {emailResult.success && (
              <p className="ec-result__detail">
                {emailResult.sent} sent · {emailResult.failed} failed · {emailResult.total} total
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TAB WRAPPER — WhatsApp view
───────────────────────────────────────────────────────────────── */
function WhatsAppTab() {
  return (
    <div className="cc-layout">
      <AIMessageGenerator />
      <ExportCustomerNumbers />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'whatsapp', label: '📱 WhatsApp Message' },
  { id: 'email',    label: '📧 Email Campaign' },
]

export default function CampaignComposer() {
  const [activeTab, setActiveTab] = useState('whatsapp')

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Campaign Composer</h1>
      </div>

      {/* ── Tab bar ── */}
      <div className="cc-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`cc-tab ${activeTab === tab.id ? 'cc-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`campaign-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ── */}
      {activeTab === 'whatsapp' && <WhatsAppTab />}
      {activeTab === 'email'    && (
        <div className="cc-layout cc-layout--single">
          <EmailCampaign />
        </div>
      )}
    </div>
  )
}
