/**
 * LogoBrand — text-only brand mark, no background box.
 *
 * Props:
 *   size     'large' | 'medium'
 *   theme    'dark' | 'light'   controls "THE GROOMERS" text colour
 *            'dark'  → #FFFFFF  (for dark sidebar / dark backgrounds)
 *            'light' → #2c2c2a  (for light scanner page background)
 *            Defaults to 'dark'.
 */
export default function LogoBrand({ size = 'medium', theme = 'dark' }) {
  const isLarge = size === 'large'
  const mainColor = theme === 'light' ? '#2c2c2a' : '#ffffff'

  return (
    <div style={{
      textAlign: 'center',
      display: 'inline-block',
      padding: '4px 0',
      lineHeight: 1.2,
    }}>
      {/* THE GROOMERS */}
      <div style={{
        color: mainColor,
        fontWeight: 800,
        fontSize: isLarge ? '24px' : '16px',
        letterSpacing: '3px',
        fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase',
      }}>
        THE GROOMERS
      </div>

      {/* UNISEX SALON */}
      <div style={{
        color: '#F5A623',
        fontWeight: 400,
        fontSize: isLarge ? '11px' : '9px',
        letterSpacing: '4px',
        fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase',
        marginTop: '4px',
      }}>
        UNISEX SALON
      </div>
    </div>
  )
}
