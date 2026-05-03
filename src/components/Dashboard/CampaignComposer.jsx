import { useState, useMemo, useEffect } from 'react'
import { useDashboard } from '../../context/DashboardContext'

const LANGUAGES = ['English', 'Hindi', 'Hinglish']
const TONES     = [{ id:'friendly', label:'😊 Friendly' }, { id:'formal', label:'🎩 Formal' }, { id:'fun', label:'🎉 Fun' }]
const AGENT_AUDIENCE = [
  { id:'all', label:'👥 All' }, { id:'female', label:'👩 Female' },
  { id:'male', label:'👨 Male' }, { id:'VIP', label:'⭐ VIP' }, { id:'inactive', label:'💤 Inactive' },
]
const WHATSAPP_FILTER_OPTIONS = [
  { id:'all', label:'All' }, { id:'male', label:'Male' }, { id:'female', label:'Female' },
  { id:'VIP', label:'VIP' }, { id:'Regular', label:'Regular' }, { id:'New', label:'New' },
  { id:'inactive30', label:'Last visit > 30 days' }, { id:'inactive60', label:'Last visit > 60 days' },
]
const VARIANT_KEYS   = ['friendly', 'formal', 'fun']
const VARIANT_LABELS = { friendly:'😊 Friendly', formal:'🎩 Formal', fun:'🎉 Fun' }

/* ── WhatsApp helpers ── */
function MessageCard({ variant }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(variant.text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="cc-message-card glass-card">
      <div className="cc-message-card__header">
        <span className="cc-message-card__style">{variant.emoji} {variant.style}</span>
        <button className={`glass-btn ${copied ? 'glass-btn--success' : ''}`} onClick={handleCopy}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
      </div>
      <p className="cc-message-card__text">{variant.text}</p>
    </div>
  )
}

function AIMessageGenerator() {
  const [offer, setOffer]       = useState('')
  const [language, setLanguage] = useState('English')
  const [variants, setVariants] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleGenerate = async () => {
    if (!offer.trim()) return
    setLoading(true); setError(''); setVariants([])
    try {
      const res  = await fetch('/api/campaigns?action=generate-ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ offer, language }) })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
      if (!data.variants?.length) throw new Error('No variants returned')
      setVariants(data.variants)
    } catch (err) { setError(`⚠️ ${err.message}`) } finally { setLoading(false) }
  }

  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header"><span className="cc-card__icon">🤖</span><div><h2 className="cc-card__title">AI Message Generator</h2><p className="cc-card__subtitle">Generate 3 WhatsApp variants powered by Gemini ⚡</p></div></div>
      <div className="cc-card__body">
        <div className="cc-field"><label className="cc-label">Describe your offer</label>
          <textarea className="glass-input cc-textarea" placeholder="e.g. Diwali special, 20% off on all services" value={offer} onChange={e => setOffer(e.target.value)} rows={3} />
        </div>
        <div className="cc-field"><label className="cc-label">Language</label>
          <div className="cc-lang-row">{LANGUAGES.map(l => <button key={l} className={`campaign-option ${language===l?'campaign-option--selected':''}`} onClick={() => setLanguage(l)}>{l}</button>)}</div>
        </div>
        <button className="glass-btn glass-btn--primary glass-btn--large glass-btn--full" onClick={handleGenerate} disabled={loading || !offer.trim()} id="generate-messages-btn">
          {loading ? <><span className="spinner" /> Generating…</> : '✨ Generate with Gemini'}
        </button>
        {error && <p className="cc-error">{error}</p>}
        {variants.length > 0 && <div className="cc-variants anim-fade-up"><p className="cc-variants__label">Choose &amp; copy a variant:</p>{variants.map((v,i) => <MessageCard key={i} variant={v} />)}</div>}
      </div>
    </div>
  )
}

function daysSince(c) { const d = c.lastVisit || c.firstVisit; if (!d) return 999; return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

function ExportCustomerNumbers() {
  const { allCustomers }          = useDashboard()
  const [activeFilter, setFilter] = useState('all')
  const filtered = useMemo(() => {
    if (!allCustomers) return []
    switch (activeFilter) {
      case 'male':       return allCustomers.filter(c => c.gender?.toLowerCase() === 'male')
      case 'female':     return allCustomers.filter(c => c.gender?.toLowerCase() === 'female')
      case 'VIP':        return allCustomers.filter(c => c.tag === 'VIP')
      case 'Regular':    return allCustomers.filter(c => c.tag === 'Regular')
      case 'New':        return allCustomers.filter(c => c.tag === 'New')
      case 'inactive30': return allCustomers.filter(c => daysSince(c) > 30)
      case 'inactive60': return allCustomers.filter(c => daysSince(c) > 60)
      default:           return allCustomers
    }
  }, [allCustomers, activeFilter])

  const handleExport = () => {
    const rows = [['Name','Mobile Number','Tag'], ...filtered.map(c => [(c.name||'').replace(/,/g,' '), c.phone||c.mobile||'', c.tag||''])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type:'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `groomers-campaign-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header"><span className="cc-card__icon">📤</span><div><h2 className="cc-card__title">Export Customer Numbers</h2><p className="cc-card__subtitle">Filter and download CSV for WhatsApp campaigns</p></div></div>
      <div className="cc-card__body">
        <div className="cc-field"><label className="cc-label">Filter customers</label>
          <div className="cc-filter-grid">{WHATSAPP_FILTER_OPTIONS.map(f => <button key={f.id} className={`campaign-option ${activeFilter===f.id?'campaign-option--selected':''}`} onClick={() => setFilter(f.id)}>{f.label}</button>)}</div>
        </div>
        <div className="cc-export-count glass-card glass-card--subtle">
          <span className="cc-export-count__number">{filtered.length}</span><span className="cc-export-count__text">customers selected</span>
        </div>
        <button className="glass-btn glass-btn--success glass-btn--large glass-btn--full" onClick={handleExport} disabled={filtered.length===0} id="export-csv-btn">📥 Export Numbers as CSV</button>
        <p className="cc-export-hint">Downloads as <code>groomers-campaign-[date].csv</code> — Name, Mobile Number, Tag</p>
      </div>
    </div>
  )
}

/* ── Recipient Preview Modal ── */
function RecipientModal({ open, onClose, subject, emailBody, previewText, filter }) {
  const [phase,      setPhase]      = useState('idle')
  const [recipients, setRecipients] = useState([])
  const [stats,      setStats]      = useState(null)
  const [errMsg,     setErrMsg]     = useState('')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(new Set())
  const [report,     setReport]     = useState(null)
  const sentKey = `groomers_sent::${subject}`

  useEffect(() => {
    if (!open) { setPhase('idle'); setSearch(''); setReport(null); return }
    setPhase('loading'); setErrMsg('')
    fetch('/api/campaigns?action=agent-send', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ subject, emailBody, previewText, filter, previewOnly: true }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        const sent     = new Set(JSON.parse(localStorage.getItem(sentKey) || '[]'))
        const enriched = (data.recipients || []).map(r => ({ ...r, alreadySent: sent.has(r.email.toLowerCase()) }))
        setRecipients(enriched); setStats(data.stats)
        setSelected(new Set(enriched.filter(r => !r.alreadySent).map(r => r.email.toLowerCase())))
        setPhase('list')
      })
      .catch(err => { setErrMsg(err.message || 'Failed to load recipients'); setPhase('error') })
  }, [open])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? recipients.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q)) : recipients
  }, [recipients, search])

  const selectedCount = useMemo(
    () => [...selected].filter(e => recipients.some(r => r.email.toLowerCase() === e)).length,
    [selected, recipients]
  )

  const toggleOne = email => {
    const k = email.toLowerCase()
    setSelected(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }
  const toggleAll = () => {
    const eligible = filtered.filter(r => !r.alreadySent).map(r => r.email.toLowerCase())
    const allOn    = eligible.every(e => selected.has(e))
    setSelected(prev => { const n = new Set(prev); allOn ? eligible.forEach(e => n.delete(e)) : eligible.forEach(e => n.add(e)); return n })
  }

  const handleSend = async () => {
    const toSend = recipients.filter(r => selected.has(r.email.toLowerCase()))
    if (!toSend.length) return
    setPhase('sending')
    try {
      const res  = await fetch('/api/campaigns?action=send-to-selected', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ subject, emailBody, previewText, recipients: toSend.map(r => ({ name: r.name, email: r.email })) }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      const existing = new Set(JSON.parse(localStorage.getItem(sentKey) || '[]'))
      toSend.forEach(r => existing.add(r.email.toLowerCase()))
      localStorage.setItem(sentKey, JSON.stringify([...existing]))
      setReport(data.report); setPhase('report')
    } catch (err) { setErrMsg(`⚠️ ${err.message || 'Send failed'}`); setPhase('error') }
  }

  if (!open) return null
  const canClose = phase !== 'sending'

  return (
    <div className="rm-overlay" onClick={e => { if (e.target === e.currentTarget && canClose) onClose() }}>
      <div className="rm-modal anim-fade-up">

        <div className="rm-modal__header">
          <div className="rm-modal__title-row">
            <h3 className="rm-modal__title">👁 Preview Recipients</h3>
            {canClose && <button className="rm-modal__close" onClick={onClose}>✕</button>}
          </div>
          {phase === 'list' && stats && (
            <div className="ea-summary-bar">
              <span className="ea-summary-bar__item ea-summary-bar__item--ok">✅ {stats.valid} valid</span>
              {stats.invalid > 0    && <span className="ea-summary-bar__item ea-summary-bar__item--warn">⚠️ {stats.invalid} no email</span>}
              {stats.duplicates > 0 && <span className="ea-summary-bar__item ea-summary-bar__item--dup">🔄 {stats.duplicates} dupes removed</span>}
            </div>
          )}
        </div>

        <div className="rm-modal__body">
          {phase === 'loading' && (
            <div className="ea-sending-state"><span className="spinner spinner--large" /><p className="ea-sending-label">Loading recipients…</p></div>
          )}
          {phase === 'error' && <div className="cc-error">{errMsg}</div>}

          {phase === 'list' && (
            <>
              <div className="rm-search-wrap">
                <span className="rm-search-icon">🔍</span>
                <input className="glass-input rm-search-input" placeholder="Search name, email or tag…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              <div className="rm-select-all-row">
                <label className="rm-checkbox-label" onClick={toggleAll} style={{cursor:'pointer'}}>
                  <input type="checkbox" className="rm-checkbox" readOnly
                    checked={filtered.filter(r=>!r.alreadySent).length > 0 && filtered.filter(r=>!r.alreadySent).every(r => selected.has(r.email.toLowerCase()))} />
                  <span>Select all eligible</span>
                </label>
                <span className="rm-count-badge">{selectedCount} selected</span>
              </div>

              <div className="rm-list-wrap">
                {filtered.map((r, i) => (
                  <div key={i}
                    className={`rm-row ${r.alreadySent ? 'rm-row--sent' : ''} ${!r.alreadySent && selected.has(r.email.toLowerCase()) ? 'rm-row--selected' : ''}`}
                    onClick={() => !r.alreadySent && toggleOne(r.email)}
                  >
                    <div className="rm-row__check">
                      {r.alreadySent
                        ? <span title="Already sent to this address">📤</span>
                        : <input type="checkbox" className="rm-checkbox" readOnly checked={selected.has(r.email.toLowerCase())} onClick={e => e.stopPropagation()} />}
                    </div>
                    <div className="rm-row__info">
                      <span className="rm-row__name">{r.name}</span>
                      <span className="rm-row__email">{r.email}</span>
                    </div>
                    <div className="rm-row__meta">
                      <span className="ea-tag">{r.tag}</span>
                      {r.alreadySent && <span className="rm-row__already">Already sent</span>}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p style={{textAlign:'center',color:'var(--color-text-muted)',padding:'24px'}}>No recipients match your search.</p>}
              </div>
            </>
          )}

          {phase === 'sending' && (
            <div className="ea-sending-state">
              <span className="spinner spinner--large" />
              <p className="ea-sending-label">📤 Sending to {selectedCount} recipients…</p>
              <p className="ea-sending-sub">Please keep this window open</p>
            </div>
          )}

          {phase === 'report' && report && (
            <div className="rm-report anim-fade-up">
              <div className="rm-report__icon">🎉</div>
              <h3 className="rm-report__title">Campaign Sent!</h3>
              <div className="ea-report-card__body" style={{marginTop:'16px'}}>
                <div className="ea-report-stat ea-report-stat--sent">
                  <span className="ea-report-stat__icon">✅</span>
                  <div><span className="ea-report-stat__label">Sent</span><span className="ea-report-stat__value">{report.sent}</span></div>
                </div>
                <div className="ea-report-stat ea-report-stat--failed">
                  <span className="ea-report-stat__icon">❌</span>
                  <div><span className="ea-report-stat__label">Failed</span><span className="ea-report-stat__value">{report.failed}</span></div>
                </div>
                <div className="ea-report-stat ea-report-stat--total">
                  <span className="ea-report-stat__icon">👥</span>
                  <div><span className="ea-report-stat__label">Total</span><span className="ea-report-stat__value">{report.total}</span></div>
                </div>
              </div>
              {report.failedEmails?.length > 0 && <p className="ea-report-failed-list">Failed: {report.failedEmails.join(', ')}</p>}
            </div>
          )}
        </div>

        {phase === 'list' && (
          <div className="rm-modal__footer">
            <button className="glass-btn" onClick={onClose}>← Back</button>
            <button className="glass-btn glass-btn--primary" disabled={selectedCount === 0} onClick={handleSend} id="modal-send-btn">
              🚀 Send to {selectedCount} Selected
            </button>
          </div>
        )}
        {phase === 'report' && (
          <div className="rm-modal__footer">
            <button className="glass-btn glass-btn--primary glass-btn--full" onClick={onClose} id="modal-done-btn">📬 Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Email Campaign Composer ── */
function AgentEmailCampaign() {
  const [composeMode,   setComposeMode]   = useState('manual')
  const [subject,       setSubject]       = useState('')
  const [previewText,   setPreviewText]   = useState('')
  const [emailBody,     setEmailBody]     = useState('')
  const [audience,      setAudience]      = useState('all')
  const [brief,         setBrief]         = useState('')
  const [language,      setLanguage]      = useState('English')
  const [tone,          setTone]          = useState('friendly')
  const [writing,       setWriting]       = useState(false)
  const [writeErr,      setWriteErr]      = useState('')
  const [variants,      setVariants]      = useState({})
  const [activeVariant, setActiveVariant] = useState('friendly')
  const [bestTime,      setBestTime]      = useState('')
  const [openRate,      setOpenRate]      = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)

  const canPreview = subject.trim().length > 0 && emailBody.trim().length > 0

  const handleGenerate = async () => {
    if (!brief.trim()) return
    setWriting(true); setWriteErr('')
    try {
      const res  = await fetch('/api/campaigns?action=agent-write', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ brief: brief.trim(), language, tone, audience }) })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
      setSubject(data.subject || ''); setPreviewText(data.previewText || '')
      setEmailBody(data.emailBody || ''); setVariants(data.variants || {})
      setBestTime(data.bestTime || ''); setOpenRate(data.expectedOpenRate || '')
      setActiveVariant(tone)
    } catch (err) { setWriteErr(`⚠️ ${err.message}`) } finally { setWriting(false) }
  }

  const handleVariantSwitch = key => { setActiveVariant(key); if (variants[key]) setEmailBody(variants[key]) }

  return (
    <div className="cc-card glass-card">
      <div className="cc-card__header">
        <span className="cc-card__icon">📧</span>
        <div>
          <h2 className="cc-card__title">Email Campaign</h2>
          <p className="cc-card__subtitle">Write manually or generate with AI · Preview recipients · Send</p>
        </div>
      </div>

      <div className="cc-card__body">
        {/* Mode toggle */}
        <div className="ec-mode-toggle">
          <button className={`ec-mode-btn ${composeMode==='manual'?'ec-mode-btn--active':''}`} onClick={() => setComposeMode('manual')}>✏️ Write Manually</button>
          <button className={`ec-mode-btn ${composeMode==='ai'?'ec-mode-btn--active':''}`} onClick={() => setComposeMode('ai')}>🤖 Generate with AI</button>
        </div>

        {/* Audience */}
        <div className="cc-field">
          <label className="cc-label">Audience</label>
          <div className="cc-lang-row">
            {AGENT_AUDIENCE.map(a => <button key={a.id} className={`campaign-option ${audience===a.id?'campaign-option--selected':''}`} onClick={() => setAudience(a.id)}>{a.label}</button>)}
          </div>
        </div>

        {/* Manual fields */}
        {composeMode === 'manual' && (
          <>
            <div className="cc-field">
              <label className="cc-label">Subject Line</label>
              <input className="glass-input" placeholder="e.g. ✂️ 20% off this weekend — The Groomers" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="cc-field">
              <label className="cc-label">Email Body</label>
              <textarea className="glass-input cc-textarea" rows={9}
                placeholder={"Write your email body here…\n\nGreeting (Hi [Name] 👋) and footer are added automatically.\nUse *asterisks* for bold text."}
                value={emailBody} onChange={e => setEmailBody(e.target.value)} />
              <p className="cc-export-hint">Greeting &amp; footer added automatically · Use *asterisks* to bold</p>
            </div>
          </>
        )}

        {/* AI fields */}
        {composeMode === 'ai' && (
          <>
            <div className="cc-field">
              <label className="cc-label">Describe your offer</label>
              <textarea className="glass-input cc-textarea" rows={3} placeholder="e.g. Monday special, 20% off on all hair services for everyone" value={brief} onChange={e => setBrief(e.target.value)} />
            </div>
            <div className="cc-field">
              <label className="cc-label">Language</label>
              <div className="cc-lang-row">{LANGUAGES.map(l => <button key={l} className={`campaign-option ${language===l?'campaign-option--selected':''}`} onClick={() => setLanguage(l)}>{l}</button>)}</div>
            </div>
            <div className="cc-field">
              <label className="cc-label">Tone</label>
              <div className="cc-lang-row">{TONES.map(t => <button key={t.id} className={`campaign-option ${tone===t.id?'campaign-option--selected':''}`} onClick={() => setTone(t.id)}>{t.label}</button>)}</div>
            </div>
            <button className="glass-btn glass-btn--primary glass-btn--large glass-btn--full" onClick={handleGenerate} disabled={writing || !brief.trim()} id="agent-generate-btn">
              {writing ? <><span className="spinner" /> Generating with Gemini…</> : '✨ Generate Campaign with AI'}
            </button>
            {writeErr && <p className="cc-error">{writeErr}</p>}

            {(subject || emailBody) && (
              <div className="ea-generated anim-fade-up">
                <div className="ea-divider"><span>✅ Campaign Generated</span></div>
                <div className="cc-field"><label className="cc-label">Subject Line</label>
                  <input className="glass-input" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="cc-field"><label className="cc-label">Preview Text</label>
                  <input className="glass-input" value={previewText} onChange={e => setPreviewText(e.target.value)} placeholder="Inbox preview text" />
                </div>
                {Object.keys(variants).length > 0 && (
                  <div className="ea-variant-tabs">
                    {VARIANT_KEYS.map(key => <button key={key} className={`ea-variant-tab ${activeVariant===key?'ea-variant-tab--active':''}`} onClick={() => handleVariantSwitch(key)}>{VARIANT_LABELS[key]}</button>)}
                  </div>
                )}
                <div className="cc-field"><label className="cc-label">Email Body</label>
                  <textarea className="glass-input cc-textarea" rows={8} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
                  <p className="cc-export-hint">Greeting &amp; footer added automatically · Use *asterisks* to bold</p>
                </div>
                {bestTime && <div className="ea-tip-box ea-tip-box--time">💡 <strong>Best time:</strong> {bestTime}</div>}
                {openRate && <div className="ea-tip-box ea-tip-box--rate">📊 {openRate}</div>}
              </div>
            )}
          </>
        )}

        {/* Preview Recipients button */}
        <button
          className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
          disabled={!canPreview}
          onClick={() => setModalOpen(true)}
          id="agent-preview-btn"
        >👁 Preview Recipients</button>

        {!canPreview && (
          <p className="cc-export-hint" style={{textAlign:'center'}}>
            {composeMode === 'manual' ? 'Fill in subject and body above.' : 'Generate a campaign above to continue.'}
          </p>
        )}
      </div>

      <RecipientModal open={modalOpen} onClose={() => setModalOpen(false)} subject={subject} emailBody={emailBody} previewText={previewText} filter={audience} />
    </div>
  )
}

/* ── Tabs ── */
function WhatsAppTab() {
  return <div className="cc-layout"><AIMessageGenerator /><ExportCustomerNumbers /></div>
}

const TABS = [{ id:'whatsapp', label:'📱 WhatsApp Message' }, { id:'email', label:'📧 Email Campaign' }]

export default function CampaignComposer() {
  const [activeTab, setActiveTab] = useState('whatsapp')
  return (
    <div>
      <div className="dashboard-header"><h1 className="dashboard-header__title">Campaign Composer</h1></div>
      <div className="cc-tabs">
        {TABS.map(tab => <button key={tab.id} className={`cc-tab ${activeTab===tab.id?'cc-tab--active':''}`} onClick={() => setActiveTab(tab.id)} id={`campaign-tab-${tab.id}`}>{tab.label}</button>)}
      </div>
      {activeTab === 'whatsapp' && <WhatsAppTab />}
      {activeTab === 'email'    && <div className="cc-layout cc-layout--single cc-layout--wide"><AgentEmailCampaign /></div>}
    </div>
  )
}
