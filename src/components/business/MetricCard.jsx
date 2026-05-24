import { motion } from 'framer-motion'

export default function MetricCard({ title, value, icon, change, changeType, color, loading, prefix = '', suffix = '' }) {
  if (loading) {
    return (
      <div className="glass-card glass-card--elevated biz-metric-card anim-shimmer">
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ width: '60%', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginTop: '12px' }} />
        <div style={{ width: '80%', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginTop: '8px' }} />
      </div>
    )
  }

  const isPositive = changeType === 'up' || (change > 0)
  const changeColor = isPositive ? '#7EC699' : '#D4766E'

  return (
    <motion.div
      className="glass-card glass-card--elevated biz-metric-card tilt-3d"
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="biz-metric-card__icon" style={color ? { background: `${color}18`, color } : {}}>
        {icon}
      </span>
      <span className="biz-metric-card__label">{title}</span>
      <span className="biz-metric-card__value">
        {prefix}{value}{suffix}
      </span>
      {change !== undefined && change !== null && (
        <span className="biz-metric-card__change" style={{ color: changeColor }}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs prev
        </span>
      )}
    </motion.div>
  )
}
