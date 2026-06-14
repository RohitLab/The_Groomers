// VULN-005 FIX: Restrict CORS to known origins only — never wildcard *.
const ALLOWED_ORIGINS = [
  'https://thegroomers.shop',
  'https://the-groomers.vercel.app',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
]

export default function setCors(req, res) {
  const origin = req?.headers?.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Dashboard-Pin')
  res.setHeader('Access-Control-Max-Age', '86400')
}
