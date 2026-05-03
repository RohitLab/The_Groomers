import { useState, useMemo } from 'react'
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
   2-AGENT EMAIL CAMPAIGN WIZARD
   Step 1: Agent 1 writes   →  Step 2: Agent 2 previews  →  Step 3: Send & Report
───────────────────────────────────────────────────────────────── */

const TONES = [
  { id: 'friendly', label: '😊 Friendly' },
  { id: 'formal',   label: '🎩 Formal' },
  { id: 'fun',      label: '🎉 Fun' },
]

const AGENT_AUDIENCE = [
  { id: 'all',      label: '👥 All' },
  { id: 'female',   label: '👩 Female' },
  { id: 'male',     label: '👨 Male' },
  { id: 'VIP',      label: '⭐ VIP' },
  { id: 'inactive', label: '💤 Inactive' },
]

const VARIANT_KEYS = ['friendly', 'formal', 'fun']
const VARIANT_LABELS = { friendly: '😊 Friendly', formal: '🎩 Formal', fun: '🎉 Fun' }

// Step indicator
function AgentStepper({ step }) {
  const steps = [
    { n: 1, icon: '✍️', label: 'Write' },
    { n: 2, icon: '👁',  label: 'Preview' },
    { n: 3, icon: '🚀', label: 'Send' },
  ]
  return (
    <div className="ea-stepper">
      {steps.map((s, i) => (
        <div key={s.n} className="ea-stepper__item">
          <div className={`ea-step ${step === s.n ? 'ea-step--active' : ''} ${step > s.n ? 'ea-step--done' : ''}`}>
            {step > s.n ? '✓' : s.icon}
          </div>
          <span className={`ea-step__label ${step === s.n ? 'ea-step__label--active' : ''}`}>{s.label}</span>
          {i < steps.length - 1 && <div className={`ea-step__line ${step > s.n ? 'ea-step__line--done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

function AgentEmailCampaign() {
  const [step, setStep] = useState(1)

  // Step 1 state
  const [brief,    setBrief]    = useState('')
  const [language, setLanguage] = useState('English')
  const [tone,     setTone]     = useState('friendly')
  const [audience, setAudience] = useState('all')
  const [writing,  setWriting]  = useState(false)
  const [writeErr, setWriteErr] = useState('')

  // Generated content
  const [subject,      setSubject]      = useState('')
  const [previewText,  setPreviewText]  = useState('')
  const [emailBody,    setEmailBody]    = useState('')
  const [variants,     setVariants]     = useState({})
  const [activeVariant, setActiveVariant] = useState('friendly')
  const [bestTime,     setBestTime]     = useState('')
  const [openRate,     setOpenRate]     = useState('')

  // Step 2 state
  const [previewing,   setPreviewing]   = useState(false)
  const [previewErr,   setPreviewErr]   = useState('')
  const [recipients,   setRecipients]   = useState([])
  const [recStats,     setRecStats]     = useState(null)

  // Step 3 state
  const [sending,  setSending]  = useState(false)
  const [sendErr,  setSendErr]  = useState('')
  const [report,   setReport]   = useState(null)

  /* ── Agent 1: Write ── */
  const handleGenerate = async () => {
    if (!brief.trim()) return
    setWriting(true)
    setWriteErr('')
    try {
      const res = await fetch('/api/campaigns?action=agent-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: brief.trim(), language, tone, audience }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)

      setSubject(data.subject || '')
      setPreviewText(data.previewText || '')
      setEmailBody(data.emailBody || '')
      setVariants(data.variants || {})
      setBestTime(data.bestTime || '')
      setOpenRate(data.expectedOpenRate || '')
      setActiveVariant(tone) // default active tab = chosen tone
    } catch (err) {
      setWriteErr(`⚠️ ${err.message || 'Could not reach Gemini API'}`)
    } finally {
      setWriting(false)
    }
  }

  // When variant tab changes, update emailBody to that variant's content
  const handleVariantSwitch = (key) => {
    setActiveVariant(key)
    if (variants[key]) setEmailBody(variants[key])
  }

  /* ── Agent 2: Preview ── */
  const handlePreview = async () => {
    setPreviewing(true)
    setPreviewErr('')
    try {
      const res = await fetch('/api/campaigns?action=agent-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, emailBody, previewText, filter: audience, previewOnly: true }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
      setRecipients(data.recipients || [])
      setRecStats(data.stats || null)
      setStep(2)
    } catch (err) {
      setPreviewErr(`⚠️ ${err.message || 'Could not load recipient list'}`)
    } finally {
      setPreviewing(false)
    }
  }

  /* ── Agent 2: Send ── */
  const handleSend = async () => {
    setSending(true)
    setSendErr('')
    setStep(3)
    try {
      const res = await fetch('/api/campaigns?action=agent-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, emailBody, previewText, filter: audience, previewOnly: false }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
      setReport(data.report)
    } catch (err) {
      setSendErr(`⚠️ ${err.message || 'Failed to send campaign'}`)
    } finally {
      setSending(false)
    }
  }

  const handleReset = () => {
    setStep(1); setBrief(''); setSubject(''); setPreviewText(''); setEmailBody('')
    setVariants({}); setBestTime(''); setOpenRate(''); setReport(null); setSendErr('')
    setWriteErr(''); setPreviewErr(''); setRecipients([]); setRecStats(null)
  }

  const hasContent = subject || emailBody

  /* ── Step 1 ── */
  const renderStep1 = () => (
    <div className="cc-card__body anim-fade-up">
      <div className="cc-field">
        <label className="cc-label">Describe your offer in simple words</label>
        <textarea
          className="glass-input cc-textarea"
          rows={3}
          placeholder="e.g. Monday special, 20% off on all hair services for everyone"
          value={brief}
          onChange={e => setBrief(e.target.value)}
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
            >{lang}</button>
          ))}
        </div>
      </div>

      <div className="cc-field">
        <label className="cc-label">Tone</label>
        <div className="cc-lang-row">
          {TONES.map(t => (
            <button
              key={t.id}
              className={`campaign-option ${tone === t.id ? 'campaign-option--selected' : ''}`}
              onClick={() => setTone(t.id)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="cc-field">
        <label className="cc-label">Audience</label>
        <div className="cc-lang-row">
          {AGENT_AUDIENCE.map(a => (
            <button
              key={a.id}
              className={`campaign-option ${audience === a.id ? 'campaign-option--selected' : ''}`}
              onClick={() => setAudience(a.id)}
            >{a.label}</button>
          ))}
        </div>
      </div>

      <button
        className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
        onClick={handleGenerate}
        disabled={writing || !brief.trim()}
        id="agent-generate-btn"
      >
        {writing
          ? <><span className="spinner" /> Agent 1 writing your campaign... ✍️</>
          : '✨ Generate Campaign with AI'}
      </button>

      {writeErr && <p className="cc-error">{writeErr}</p>}

      {/* ── Generated content ── */}
      {hasContent && (
        <div className="ea-generated anim-fade-up">
          <div className="ea-divider"><span>✅ Campaign Generated</span></div>

          {/* Subject */}
          <div className="cc-field">
            <label className="cc-label">Subject Line</label>
            <input
              className="glass-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject line"
            />
          </div>

          {/* Preview text */}
          <div className="cc-field">
            <label className="cc-label">Preview Text</label>
            <input
              className="glass-input"
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              placeholder="Preview text (shown in inbox)"
            />
          </div>

          {/* Variant tabs */}
          {Object.keys(variants).length > 0 && (
            <div className="ea-variant-tabs">
              {VARIANT_KEYS.map(key => (
                <button
                  key={key}
                  className={`ea-variant-tab ${activeVariant === key ? 'ea-variant-tab--active' : ''}`}
                  onClick={() => handleVariantSwitch(key)}
                >
                  {VARIANT_LABELS[key]}
                </button>
              ))}
            </div>
          )}

          {/* Email body */}
          <div className="cc-field">
            <label className="cc-label">Email Body</label>
            <textarea
              className="glass-input cc-textarea"
              rows={8}
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
            />
            <p className="cc-export-hint">Greeting (Hi [Name] 👋) and footer added automatically. Use *asterisks* for bold.</p>
          </div>

          {/* Tip boxes */}
          {bestTime && (
            <div className="ea-tip-box ea-tip-box--time">
              💡 <strong>Best time to send:</strong> {bestTime}
            </div>
          )}
          {openRate && (
            <div className="ea-tip-box ea-tip-box--rate">
              📊 {openRate}
            </div>
          )}

          {previewErr && <p className="cc-error">{previewErr}</p>}

          <button
            className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
            onClick={handlePreview}
            disabled={previewing || !subject.trim() || !emailBody.trim()}
            id="agent-preview-btn"
          >
            {previewing
              ? <><span className="spinner" /> Loading recipients...</>
              : '👁 Preview & Send →'}
          </button>
        </div>
      )}
    </div>
  )

  /* ── Step 2 ── */
  const renderStep2 = () => (
    <div className="ea-preview-panel anim-fade-up">
      <div className="ea-preview-panel__header">
        <h3 className="ea-preview-panel__title">
          📧 Ready to send to <span className="ea-highlight">{recStats?.valid ?? recipients.length}</span> customers
        </h3>
        {recStats && (
          <div className="ea-summary-bar">
            <span className="ea-summary-bar__item ea-summary-bar__item--ok">✅ {recStats.valid} valid</span>
            {recStats.invalid > 0 && <span className="ea-summary-bar__item ea-summary-bar__item--warn">⚠️ {recStats.invalid} invalid</span>}
            {recStats.duplicates > 0 && <span className="ea-summary-bar__item ea-summary-bar__item--dup">🔄 {recStats.duplicates} duplicates removed</span>}
          </div>
        )}
      </div>

      <div className="ea-recipient-table-wrap">
        <table className="ea-recipient-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Tag</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((r, i) => (
              <tr key={i}>
                <td className="ea-recipient-table__check">✅</td>
                <td>{r.name}</td>
                <td className="ea-recipient-table__email">{r.email}</td>
                <td><span className="ea-tag">{r.tag}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ea-preview-actions">
        <button
          className="glass-btn glass-btn--full"
          onClick={() => setStep(1)}
        >← Back to Edit</button>
        <button
          className="glass-btn glass-btn--primary glass-btn--full"
          onClick={handleSend}
          id="agent-send-btn"
        >🚀 Send Campaign Now</button>
      </div>
    </div>
  )

  /* ── Step 3 ── */
  const renderStep3 = () => (
    <div className="anim-fade-up">
      {sending && !report ? (
        <div className="ea-sending-state">
          <div className="ea-sending-spinner">
            <span className="spinner spinner--large" />
          </div>
          <p className="ea-sending-label">📤 Sending emails to {recStats?.valid} customers…</p>
          <p className="ea-sending-sub">Please keep this window open</p>
        </div>
      ) : sendErr ? (
        <div className="ec-result ec-result--error">
          <p className="ec-result__msg">{sendErr}</p>
          <button className="glass-btn" onClick={() => setStep(2)} style={{ marginTop: '12px' }}>
            ← Back to Preview
          </button>
        </div>
      ) : report ? (
        <div className="ea-report-card glass-card">
          <div className="ea-report-card__header">
            <span className="ea-report-card__icon">📊</span>
            <h3 className="ea-report-card__title">Campaign Report</h3>
          </div>
          <div className="ea-report-card__body">
            <div className="ea-report-stat ea-report-stat--sent">
              <span className="ea-report-stat__icon">✅</span>
              <div>
                <span className="ea-report-stat__label">Sent</span>
                <span className="ea-report-stat__value">{report.sent}</span>
              </div>
            </div>
            <div className="ea-report-stat ea-report-stat--failed">
              <span className="ea-report-stat__icon">❌</span>
              <div>
                <span className="ea-report-stat__label">Failed</span>
                <span className="ea-report-stat__value">{report.failed}</span>
              </div>
            </div>
            <div className="ea-report-stat ea-report-stat--total">
              <span className="ea-report-stat__icon">👥</span>
              <div>
                <span className="ea-report-stat__label">Total</span>
                <span className="ea-report-stat__value">{report.withEmail}</span>
              </div>
            </div>
          </div>
          <div className="ea-report-from">
            <p className="ea-report-from__label">Sent from</p>
            <p className="ea-report-from__addr">bookings@thegroomers.shop</p>
          </div>
          {report.failedEmails?.length > 0 && (
            <p className="ea-report-failed-list">
              Failed: {report.failedEmails.join(', ')}
            </p>
          )}
          <button
            className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
            onClick={handleReset}
            style={{ marginTop: '8px' }}
            id="send-another-btn"
          >
            📬 Send Another Campaign
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header">
        <span className="cc-card__icon">🤖</span>
        <div>
          <h2 className="cc-card__title">AI Email Campaign Agent</h2>
          <p className="cc-card__subtitle">2-agent system: Gemini writes · Resend delivers</p>
        </div>
      </div>

      <AgentStepper step={step} />

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
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
        <div className="cc-layout cc-layout--single cc-layout--wide">
          <AgentEmailCampaign />
        </div>
      )}
    </div>
  )
}
