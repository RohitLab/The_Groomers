// ── Extracted from existing globals.css + glassmorphism.css ──

export const BUSINESS_THEME = {
  // Glass card inline styles (for when CSS classes aren't enough)
  glassCard: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  glassCardElevated: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },

  // Color palette (from globals.css)
  colors: {
    bgPrimary: '#1A1A19',
    bgSecondary: '#242422',
    bgElevated: '#2C2C2A',
    cream: '#F1EFE8',
    taupe: '#888780',
    textPrimary: '#F1EFE8',
    textSecondary: '#888780',
    textMuted: 'rgba(241, 239, 232, 0.4)',
    success: '#7EC699',
    warning: '#E8C87A',
    error: '#D4766E',
    info: '#6AABF7',
    gold: '#F5A623',
  },

  // Framer Motion animation variants (from existing components)
  animations: {
    pageEnter: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    staggerContainer: {
      animate: {
        transition: { staggerChildren: 0.06 },
      },
    },
    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    cardHover: {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
    slideUp: {
      initial: { opacity: 0, y: 40, scale: 0.97 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
    },
  },

  // Expense categories
  expenseCategories: [
    { id: 'Rent', icon: '🏠', color: '#FF6B6B' },
    { id: 'Utilities', icon: '⚡', color: '#4ECDC4' },
    { id: 'Salaries', icon: '👥', color: '#45B7D1' },
    { id: 'Supplier Payment', icon: '📦', color: '#96CEB4' },
    { id: 'Marketing', icon: '📢', color: '#FFEAA7' },
    { id: 'Shipping', icon: '🚚', color: '#DDA0DD' },
    { id: 'Maintenance', icon: '🔧', color: '#98D8C8' },
    { id: 'Transportation', icon: '🚗', color: '#F7DC6F' },
    { id: 'Taxes', icon: '📋', color: '#BB8FCE' },
    { id: 'Miscellaneous', icon: '📌', color: '#AEB6BF' },
  ],

  // Payment methods
  paymentMethods: [
    { id: 'Cash', icon: '💵', label: 'Cash' },
    { id: 'Bank', icon: '🏦', label: 'Bank' },
    { id: 'Card', icon: '💳', label: 'Card' },
    { id: 'UPI', icon: '📱', label: 'UPI' },
  ],
}

export const formatCurrency = (amount, symbol = '₹') => {
  const num = parseFloat(amount) || 0
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}
