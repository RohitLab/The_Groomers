/**
 * LogoBrand — reusable brand logo component
 * Matches the official "THE GROOMERS / Unisex Salon" brand design.
 *
 * Props:
 *   size  'large' | 'medium' | 'small'
 *         large  → Scanner page header
 *         medium → Dashboard sidebar
 *         small  → PinGate / compact contexts
 */
export default function LogoBrand({ size = 'medium' }) {
  const cfg = {
    large:  { wrap: '24px 36px', r: '10px', main: '32px', sub: '14px', mt: '4px' },
    medium: { wrap: '12px 20px', r: '8px',  main: '18px', sub: '9px',  mt: '3px' },
    small:  { wrap: '8px 14px',  r: '6px',  main: '13px', sub: '7px',  mt: '2px' },
  }[size] ?? { wrap: '12px 20px', r: '8px', main: '18px', sub: '9px', mt: '3px' }

  return (
    <div style={{
      background: '#666560',
      padding: cfg.wrap,
      borderRadius: cfg.r,
      textAlign: 'center',
      display: 'inline-block',
      lineHeight: 1.1,
    }}>
      <div style={{
        color: '#FFFFFF',
        fontWeight: 800,
        fontSize: cfg.main,
        letterSpacing: '2px',
        fontFamily: "'Montserrat', 'Inter', sans-serif",
        textTransform: 'uppercase',
      }}>
        THE GROOMERS
      </div>
      <div style={{
        color: '#F5A623',
        fontWeight: 400,
        fontSize: cfg.sub,
        letterSpacing: '1px',
        fontFamily: "'Montserrat', 'Inter', sans-serif",
        marginTop: cfg.mt,
        textTransform: 'none',
      }}>
        Unisex Salon
      </div>
    </div>
  )
}
