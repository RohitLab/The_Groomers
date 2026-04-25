import { useState } from 'react'
import { api } from '../../utils/api'

const AUDIENCES = ['All Customers', 'VIP Only', 'Regular', 'New Customers', 'Inactive (30+ days)']
const OCCASIONS = ['Festival', 'Discount Offer', 'New Service', 'Appointment Reminder', 'Custom']
const FESTIVALS = ['Diwali', 'Holi', 'New Year', 'Eid', 'Christmas', 'Navratri', 'Raksha Bandhan']

export default function CampaignComposer() {
  const [campaignStep, setCampaignStep] = useState('audience')
  const [audience, setAudience] = useState('')
  const [occasion, setOccasion] = useState('')
  const [festival, setFestival] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [editedMessage, setEditedMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCompose = async () => {
    setLoading(true)
    try {
      const res = await api.composeCampaign({
        audience,
        occasion,
        festival: occasion === 'Festival' ? festival : null,
        customTopic: occasion === 'Custom' ? customTopic : null,
      })
      setVariants(res.variants || [])
      setSelectedVariant(0)
      setEditedMessage(res.variants?.[0]?.text || '')
      setCampaignStep('review')
    } catch {
      // Demo variants
      const demo = generateDemoVariants(audience, occasion, festival)
      setVariants(demo)
      setSelectedVariant(0)
      setEditedMessage(demo[0]?.text || '')
      setCampaignStep('review')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedMessage)
  }

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(editedMessage)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  const handleReset = () => {
    setCampaignStep('audience')
    setAudience('')
    setOccasion('')
    setFestival('')
    setCustomTopic('')
    setVariants([])
    setEditedMessage('')
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Campaign Composer</h1>
        {campaignStep !== 'audience' && (
          <button className="glass-btn" onClick={handleReset}>← Start Over</button>
        )}
      </div>

      <div className="campaign-composer">
        {campaignStep === 'audience' && (
          <div className="anim-fade-up">
            <div className="campaign-step">
              <p className="campaign-step__label">Who should receive this message?</p>
              <div className="campaign-options">
                {AUDIENCES.map(a => (
                  <button key={a} className={`campaign-option ${audience === a ? 'campaign-option--selected' : ''}`} onClick={() => setAudience(a)}>{a}</button>
                ))}
              </div>
            </div>
            {audience && (
              <div className="campaign-step anim-fade-up">
                <p className="campaign-step__label">What's the occasion?</p>
                <div className="campaign-options">
                  {OCCASIONS.map(o => (
                    <button key={o} className={`campaign-option ${occasion === o ? 'campaign-option--selected' : ''}`} onClick={() => setOccasion(o)}>{o}</button>
                  ))}
                </div>
              </div>
            )}
            {occasion === 'Festival' && (
              <div className="campaign-step anim-fade-up">
                <p className="campaign-step__label">Which festival?</p>
                <div className="campaign-options">
                  {FESTIVALS.map(f => (
                    <button key={f} className={`campaign-option ${festival === f ? 'campaign-option--selected' : ''}`} onClick={() => setFestival(f)}>{f}</button>
                  ))}
                </div>
              </div>
            )}
            {occasion === 'Custom' && (
              <div className="campaign-step anim-fade-up">
                <p className="campaign-step__label">Describe your campaign</p>
                <textarea className="message-edit-area" placeholder="e.g., 20% off all hair treatments this weekend..." value={customTopic} onChange={e => setCustomTopic(e.target.value)} />
              </div>
            )}
            {audience && occasion && (occasion !== 'Festival' || festival) && (
              <button className="glass-btn glass-btn--primary glass-btn--large" onClick={handleCompose} disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
                {loading ? <><span className="spinner" /> Generating...</> : '✨ Generate Messages'}
              </button>
            )}
          </div>
        )}

        {campaignStep === 'review' && (
          <div className="anim-fade-up">
            <p className="campaign-step__label" style={{ marginBottom: 'var(--space-4)' }}>Choose a message style:</p>
            <div className="message-variants">
              {variants.map((v, i) => (
                <div key={i} className={`glass-card message-variant ${selectedVariant === i ? 'message-variant--selected' : ''}`} onClick={() => { setSelectedVariant(i); setEditedMessage(v.text) }}>
                  <p className="message-variant__style">{v.style}</p>
                  <p className="message-variant__text">{v.text}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <p className="campaign-step__label">Edit your message:</p>
              <textarea className="message-edit-area" value={editedMessage} onChange={e => setEditedMessage(e.target.value)} rows={5} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              <button className="glass-btn glass-btn--primary" onClick={handleCopy}>📋 Copy Message</button>
              <button className="glass-btn glass-btn--success" onClick={handleWhatsApp}>💬 Open WhatsApp</button>
              <button className="glass-btn" onClick={() => { /* CSV export */ }}>📥 Export Phone List</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function generateDemoVariants(audience, occasion, festival) {
  const name = festival || occasion
  return [
    { style: '🎩 Formal', text: `Dear Valued Customer,\n\nWishing you a wonderful ${name}! As a token of our appreciation, enjoy 20% off all services this week at The Grommers.\n\nBook your appointment today!\n📞 Call us or visit our salon.\n\nWarm regards,\nThe Grommers Unisex Salon` },
    { style: '😊 Casual', text: `Hey there! 👋\n\nHappy ${name}! 🎉\n\nWe've got a special treat for you — 20% OFF all services this week!\n\nCome pamper yourself at The Grommers. You deserve it! 💇\n\nSee you soon! ✨` },
    { style: '🎉 Fun', text: `${name} vibes are HERE! 🥳🎊\n\nGuess what? FLAT 20% OFF at The Grommers! 💥\n\nNew look, new you — let's gooo! 💇‍♀️💇‍♂️\n\nBook NOW before slots fill up! 🏃‍♂️💨\n\n#TheGrommers #${name.replace(/\s/g, '')} #SalonLife` },
  ]
}
