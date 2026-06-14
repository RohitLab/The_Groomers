// ─────────────────────────────────────────────────────────────────────────────
// api/_lib/auth.js — Central Security Utilities
// All security primitives used across the API live here.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. PIN Authentication Middleware ────────────────────────────────────────
// Usage: if (!requirePin(req, res)) return
// Reads PIN from X-Dashboard-Pin header (preferred) or query param (fallback).
// Returns true if PIN matches, false + sends 401 if it doesn't.
export function requirePin(req, res) {
  const pin =
    req.headers['x-dashboard-pin'] ||
    req.query?.pin

  const correctPin = process.env.DASHBOARD_PIN || '1234'

  if (!pin || pin !== correctPin) {
    res.status(401).json({ error: 'Unauthorized — dashboard PIN required' })
    return false
  }
  return true
}

// ── 2. In-Memory Rate Limiter ────────────────────────────────────────────────
// Uses global map (resets on cold start — acceptable for Vercel serverless).
// Usage: if (!rateLimit(`pin:${ip}`, 5, 300_000)) return res.status(429)...
export function rateLimit(key, maxRequests = 10, windowMs = 60_000) {
  if (!global._rateLimitMap) global._rateLimitMap = new Map()
  const map = global._rateLimitMap
  const now = Date.now()
  const rec = map.get(key) || { count: 0, resetAt: now + windowMs }

  if (now > rec.resetAt) {
    rec.count = 0
    rec.resetAt = now + windowMs
  }

  rec.count++
  map.set(key, rec)
  return rec.count <= maxRequests
}

// ── 3. AI Prompt Input Sanitizer ─────────────────────────────────────────────
// Strips characters and phrases that could be used for prompt injection.
// Usage: const safeInput = sanitizePromptInput(req.body.offer)
export function sanitizePromptInput(str, maxLength = 500) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[<>`]/g, '')                          // strip HTML/template chars
    .replace(/ignore\s{0,10}previous/gi, '')        // common injection phrase
    .replace(/system\s{0,10}prompt/gi, '')          // prompt override attempt
    .replace(/\[INST\]|\[\/INST\]/g, '')            // LLM control tokens
    .replace(/<<SYS>>|<\/SYS>/g, '')               // Llama control tokens
    .replace(/\bforget\s+everything\b/gi, '')       // reset instruction
    .slice(0, maxLength)
    .trim()
}

// ── 4. HTML Escape ───────────────────────────────────────────────────────────
// Use before inserting any dynamic value into HTML strings (server-rendered).
// Usage: `<p>${escapeHtml(err.message)}</p>`
export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── 5. Safe URL Validator ────────────────────────────────────────────────────
// Ensures a URL is https and not pointing at internal/private network ranges.
// Prevents SSRF if URLs are ever fetched server-side.
// Usage: if (!isSafeUrl(body.image_url)) return res.status(400)...
export function isSafeUrl(url) {
  if (!url) return true // empty/undefined is fine — field is optional
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    // Block localhost, link-local, RFC1918 private ranges
    if (
      host === 'localhost' ||
      host.endsWith('.local') ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^0\.0\.0\.0/.test(host) ||
      host === '::1'
    ) return false
    return true
  } catch {
    return false // invalid URL
  }
}

// ── 6. CSV Field Escaper ─────────────────────────────────────────────────────
// Prevents CSV injection (=, +, -, @ trigger formula execution in Excel/Sheets).
// Usage: row.map(escapeCsvField).join(',')
export function escapeCsvField(value) {
  const str = String(value ?? '')
  // Prefix any cell that starts with a formula character
  const safe = str.replace(/^[=+\-@\t\r\n]/g, "'$&")
  // Wrap in double-quotes and escape internal quotes
  return `"${safe.replace(/"/g, '""')}"`
}

// ── 7. Client IP Extractor ───────────────────────────────────────────────────
// Vercel forwards real IP in X-Forwarded-For header.
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// ── 8. PII Masking for Logs ──────────────────────────────────────────────────
// Never log raw customer data to Vercel's production log stream.
export function maskEmail(email) {
  if (!email || !email.includes('@')) return '[invalid-email]'
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}***@${domain}`
}

export function maskPhone(phone) {
  const p = String(phone || '')
  if (p.length < 4) return '****'
  return `${p.slice(0, 2)}****${p.slice(-2)}`
}
