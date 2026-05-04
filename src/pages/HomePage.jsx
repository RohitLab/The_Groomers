import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import './HomePage.css'

// ── Intersection Observer hook ──────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: 0.15, ...options })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

// ── Animated counter ───────────────────────────────────────
function Counter({ end, suffix = '' }) {
  const [val, setVal] = useState(0)
  const [ref, inView] = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(end / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(timer) }
      else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end])
  return <span ref={ref}>{val}{suffix}</span>
}

// ── WhatsApp helpers ────────────────────────────────────────
const WA_NUM = '919119533325'
function waLink(msg) {
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hideFloat, setHideFloat] = useState(false)
  const contactRef = useRef(null)

  // Navbar shadow on scroll + hide floaters near contact
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (contactRef.current) {
        const rect = contactRef.current.getBoundingClientRect()
        setHideFloat(rect.top < window.innerHeight && rect.bottom > 0)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id) {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Section visibility refs ─────────────────────────────
  const [heroRef, heroIn] = useInView()
  const [trustRef, trustIn] = useInView()
  const [svcRef, svcIn] = useInView()
  const [prodRef, prodIn] = useInView()
  const [qrRef, qrIn] = useInView()
  const [whyRef, whyIn] = useInView()

  const services = [
    { icon: '✂️', name: 'Hair Cut & Style', desc: 'Precision cuts and styling for all hair types', price: '₹200' },
    { icon: '🎨', name: 'Hair Color & Highlights', desc: 'Global color, highlights, balayage & more', price: '₹800' },
    { icon: '💅', name: 'Nail Art & Extensions', desc: 'Gel nails, nail art, extensions & removal', price: '₹400' },
    { icon: '🌸', name: 'Facial & Cleanup', desc: 'Deep cleansing, cleanup & glow treatments', price: '₹500' },
    { icon: '✨', name: 'BB Glow & Hydra Facial', desc: 'Advanced skin treatments for radiant skin', price: '₹2,000' },
    { icon: '👰', name: 'Bridal Package', desc: 'Complete bridal makeup & styling packages', price: '₹8,000' },
    { icon: '🧖‍♀️', name: 'Waxing & Threading', desc: 'Smooth skin with professional waxing', price: '₹100' },
    { icon: '💇', name: 'Hair Extensions', desc: 'Natural looking premium hair extensions', price: '₹5,000' },
    { icon: '💆', name: 'Hair Spa & Treatment', desc: 'Nourishing treatments for healthy hair', price: '₹600' },
  ]

  const products = [
    { icon: '🧼', name: 'Handmade Natural Soap', desc: 'Crafted with natural ingredients. Gentle on skin, free from harsh chemicals. Available in multiple variants.', price: '₹150 per bar' },
    { icon: '🌿', name: 'Hair Growth Oil', desc: 'Specially blended hair oil with natural herbs. Promotes growth and reduces hair fall.', price: '₹299 per bottle' },
    { icon: '💆', name: 'Scalp Treatment Serum', desc: 'Professional grade scalp serum for healthy hair roots.', price: '₹399 per bottle' },
  ]

  const whyCards = [
    { icon: '👩‍💼', title: 'Expert Professionals', desc: 'Trained and experienced stylists who stay updated with latest trends' },
    { icon: '🌿', title: 'Quality Products', desc: 'We use only premium, skin-friendly products for all treatments' },
    { icon: '💰', title: 'Cashback Rewards', desc: 'Earn cashback on every visit. The more you spend, more you save' },
    { icon: '📅', title: 'Easy Booking', desc: 'Book appointments online anytime. No waiting, just walk in on time' },
    { icon: '🏠', title: 'Hygienic Environment', desc: 'Sanitized tools and clean environment for every single customer' },
    { icon: '💬', title: 'Personalized Service', desc: 'We remember your preferences and give personalized recommendations' },
  ]

  return (
    <div className="hp-root">

      {/* ── NAVBAR ── */}
      <nav className={`hp-nav${scrolled ? ' hp-nav--scrolled' : ''}`}>
        <div className="hp-nav__inner">
          <button className="hp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="hp-logo__main">THE GROOMERS</span>
            <span className="hp-logo__sub">Unisex Salon</span>
          </button>

          <ul className={`hp-nav__links${menuOpen ? ' open' : ''}`}>
            {['services','products','about','contact'].map(id => (
              <li key={id}>
                <button onClick={() => scrollTo(id)} className="hp-nav__link">
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              </li>
            ))}
            <li>
              <Link to="/book" className="hp-btn hp-btn--gold hp-btn--sm">
                📅 Book Now
              </Link>
            </li>
          </ul>

          <button className="hp-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="hp-hero">
        <div className="hp-hero__geo" aria-hidden="true">
          {Array.from({length:12}).map((_,i) => (
            <div key={i} className={`hp-geo hp-geo--${i%4}`} style={{
              '--delay': `${i*0.4}s`,
              '--x': `${(i*17+11)%95}%`,
              '--y': `${(i*23+7)%85}%`,
            }}/>
          ))}
        </div>

        <div className="hp-hero__inner" ref={heroRef}>
          <div className={`hp-hero__content fade-up${heroIn?' visible':''}`}>
            <div className="hp-hero__badge">✂️ Nashik's #1 Unisex Salon</div>
            <h1 className="hp-hero__h1">
              Nashik's Premium<br/>
              <span className="hp-gold">Unisex Salon</span><br/>
              Experience
            </h1>
            <p className="hp-hero__sub">
              Where style meets care. Professional hair, nail, skin &amp; bridal
              services with a personal touch. Earn cashback on every visit.
            </p>
            <div className="hp-hero__stars">
              ⭐⭐⭐⭐⭐
              <span> Trusted by <strong>500+</strong> happy customers</span>
            </div>
            <div className="hp-hero__ctas">
              <Link to="/book" className="hp-btn hp-btn--gold hp-btn--lg">📅 Book Appointment</Link>
              <a href="tel:+919119533325" className="hp-btn hp-btn--outline hp-btn--lg">📞 Call Now</a>
            </div>
          </div>

          {/* CSS Salon Illustration */}
          <div className={`hp-hero__art fade-up${heroIn?' visible':''}`} style={{'--delay':'0.3s'}}>
            <div className="hp-salon-art">
              <div className="hp-mirror">
                <div className="hp-mirror__frame">
                  <div className="hp-mirror__glass">
                    <div className="hp-mirror__shine"/>
                    <div className="hp-mirror__reflection">
                      <div className="hp-silhouette"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hp-scissors">✂️</div>
              <div className="hp-comb">💈</div>
              <div className="hp-sparkle hp-sparkle--1">✨</div>
              <div className="hp-sparkle hp-sparkle--2">⭐</div>
              <div className="hp-sparkle hp-sparkle--3">💫</div>
              <div className="hp-flowers">🌸🌸</div>
            </div>
          </div>
        </div>

        <div className="hp-hero__cashback">
          🎁 Earn cashback on every visit — <strong>Scan QR at salon</strong>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section id="about" className="hp-trust" ref={trustRef}>
        <div className={`hp-trust__inner fade-up${trustIn?' visible':''}`}>
          {[
            { icon:'✂️', num:500, suf:'+', label:'Happy Customers' },
            { icon:'⭐', num:5, suf:' Star', label:'Average Rating' },
            { icon:'📅', num:5, suf:'+ Yrs', label:'Experience' },
            { icon:'💆', num:20, suf:'+', label:'Services' },
          ].map((s,i) => (
            <div className="hp-trust__card" key={i}>
              <div className="hp-trust__icon">{s.icon}</div>
              <div className="hp-trust__num">
                <Counter end={s.num} suffix={s.suf}/>
              </div>
              <div className="hp-trust__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="hp-section hp-section--light">
        <div className="hp-container">
          <div className="hp-section__head">
            <h2 className="hp-section__title">Our Services</h2>
            <p className="hp-section__sub">Professional care for every need</p>
          </div>
          <div className="hp-grid hp-grid--3" ref={svcRef}>
            {services.map((s, i) => (
              <div
                key={i}
                className={`hp-card hp-card--service fade-up${svcIn?' visible':''}`}
                style={{'--delay': `${i*0.07}s`}}
              >
                <div className="hp-card__icon">{s.icon}</div>
                <h3 className="hp-card__name">{s.name}</h3>
                <p className="hp-card__desc">{s.desc}</p>
                <div className="hp-card__price">From {s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="hp-section hp-section--warm">
        <div className="hp-container">
          <div className="hp-section__head">
            <h2 className="hp-section__title">Our Handcrafted Products</h2>
            <p className="hp-section__sub">Made with love, natural ingredients</p>
          </div>
          <div className="hp-grid hp-grid--3" ref={prodRef}>
            {products.map((p, i) => (
              <div
                key={i}
                className={`hp-card hp-card--product fade-up${prodIn?' visible':''}`}
                style={{'--delay': `${i*0.1}s`}}
              >
                <div className="hp-card__icon hp-card__icon--lg">{p.icon}</div>
                <h3 className="hp-card__name">{p.name}</h3>
                <p className="hp-card__desc">{p.desc}</p>
                <div className="hp-card__price">{p.price}</div>
                <a
                  href={waLink(`Hi! I'm interested in buying ${p.name} from The Groomers. Please share details.`)}
                  target="_blank" rel="noopener noreferrer"
                  className="hp-btn hp-btn--wa hp-btn--sm"
                >🛒 Order via WhatsApp</a>
              </div>
            ))}
          </div>
          <p className="hp-products__note">
            💬 More products available in salon. WhatsApp us to know about new arrivals!
          </p>
        </div>
      </section>

      {/* ── SCAN & EARN ── */}
      <section id="scan" className="hp-scan" ref={qrRef}>
        <div className="hp-container">
          <div className={`hp-scan__inner fade-up${qrIn?' visible':''}`}>
            <div className="hp-scan__content">
              <div className="hp-scan__badge">🎯 Loyalty Program</div>
              <h2 className="hp-scan__title">Scan. Register. Earn Cashback!</h2>
              <p className="hp-scan__sub">Join our loyalty program</p>
              <ol className="hp-scan__steps">
                {[
                  ['📱','Scan the QR code at salon'],
                  ['✍️','Fill your details (30 seconds)'],
                  ['💰','Get cashback on your bill'],
                  ['🎁','Exclusive offers on WhatsApp & Email'],
                ].map(([icon, text], i) => (
                  <li key={i}><span className="hp-scan__step-icon">{icon}</span>{text}</li>
                ))}
              </ol>
              <ul className="hp-scan__benefits">
                {['Bill-based cashback (% of your bill)','Festival & special offers','Birthday surprises','VIP customer benefits'].map((b,i) => (
                  <li key={i}>✅ {b}</li>
                ))}
              </ul>
            </div>
            <div className="hp-scan__qr-wrap">
              <div className="hp-scan__qr-card">
                <div className="hp-scan__qr-label">📱 Scan with camera</div>
                <div className="hp-qr-frame">
                  <QRCodeSVG
                    value="https://thegroomers.shop/scan"
                    size={180}
                    fgColor="#2c2c2a"
                    bgColor="#ffffff"
                    level="H"
                  />
                </div>
                <div className="hp-scan__qr-url">thegroomers.shop/scan</div>
                <Link to="/scan" className="hp-btn hp-btn--gold hp-btn--sm" style={{marginTop:'0.75rem'}}>
                  Open Scanner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="why" className="hp-section hp-section--white">
        <div className="hp-container">
          <div className="hp-section__head">
            <h2 className="hp-section__title">Why Nashik Loves The Groomers</h2>
          </div>
          <div className="hp-grid hp-grid--3" ref={whyRef}>
            {whyCards.map((w, i) => (
              <div
                key={i}
                className={`hp-card hp-card--why fade-up${whyIn?' visible':''}`}
                style={{'--delay': `${i*0.08}s`}}
              >
                <div className="hp-card__icon hp-card__icon--circle">{w.icon}</div>
                <h3 className="hp-card__name">{w.title}</h3>
                <p className="hp-card__desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="hp-contact" ref={contactRef}>
        <div className="hp-container">
          <div className="hp-contact__inner">
            <div className="hp-contact__info">
              <h2 className="hp-contact__title">Visit Us or Get In Touch</h2>
              <div className="hp-contact__items">
                <div className="hp-contact__item">
                  <span>📍</span>
                  <div>
                    <strong>The Groomers Unisex Salon</strong><br/>
                    Nashik, Maharashtra, India
                  </div>
                </div>
                <div className="hp-contact__item">
                  <span>📞</span>
                  <div>
                    <a href="tel:+919119533325" className="hp-contact__link">+91 91195 33325</a>
                  </div>
                </div>
                <div className="hp-contact__item">
                  <span>📧</span>
                  <div>
                    <a href="mailto:bookings@thegroomers.shop" className="hp-contact__link">bookings@thegroomers.shop</a>
                  </div>
                </div>
                <div className="hp-contact__item">
                  <span>⏰</span>
                  <div>Monday – Sunday: 10:00 AM – 8:00 PM</div>
                </div>
              </div>
              <a
                href={waLink('Hi! I want to know more about The Groomers Salon.')}
                target="_blank" rel="noopener noreferrer"
                className="hp-btn hp-btn--wa hp-btn--lg"
                style={{marginTop:'1.5rem'}}
              >💬 Chat on WhatsApp</a>
              <div className="hp-contact__social">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hp-social-btn" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hp-social-btn" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noopener noreferrer" className="hp-social-btn hp-social-btn--wa" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>

            <div className="hp-contact__cta-card">
              <div className="hp-cta-card">
                <div className="hp-cta-card__emoji">✨</div>
                <h3 className="hp-cta-card__title">Ready for a transformation?</h3>
                <p className="hp-cta-card__sub">Book your appointment now and get confirmed in 2 hours!</p>
                <Link to="/book" className="hp-btn hp-btn--gold hp-btn--lg" style={{width:'100%',justifyContent:'center'}}>
                  📅 Book Appointment Now
                </Link>
                <div className="hp-cta-card__divider">OR</div>
                <Link to="/scan" className="hp-btn hp-btn--outline-dark hp-btn--lg" style={{width:'100%',justifyContent:'center'}}>
                  📱 Scan QR for Cashback
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-container hp-footer__inner">
          <div className="hp-footer__logo">
            <span className="hp-logo__main">THE GROOMERS</span>
            <span className="hp-logo__sub">Unisex Salon</span>
          </div>
          <nav className="hp-footer__links" aria-label="Footer navigation">
            {[['Services','#services'],['Book','/book'],['Scan','/scan'],['Contact','#contact']].map(([label, href]) => (
              href.startsWith('#')
                ? <button key={label} onClick={() => scrollTo(href.slice(1))} className="hp-footer__link">{label}</button>
                : <Link key={label} to={href} className="hp-footer__link">{label}</Link>
            ))}
          </nav>
          <div className="hp-footer__copy">
            <p>© 2025 The Groomers Unisex Salon, Nashik</p>
            <p>Made with ❤️ in Nashik</p>
          </div>
        </div>
      </footer>

      {/* ── FLOATING BUTTONS ── */}
      <a
        href={`https://wa.me/${WA_NUM}`}
        target="_blank" rel="noopener noreferrer"
        className={`hp-float hp-float--wa${hideFloat ? ' hidden' : ''}`}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <Link
        to="/book"
        className={`hp-float hp-float--book${hideFloat ? ' hidden' : ''}`}
        aria-label="Book appointment"
      >
        📅 Book Now
      </Link>

    </div>
  )
}
