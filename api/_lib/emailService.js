import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// RESEND_FROM_EMAIL can be overridden via env var.
// Default is the verified thegroomers.shop domain sender.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'bookings@thegroomers.shop'

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return false
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.warn(
      '[EMAIL] RESEND_FROM_EMAIL env var not set. Using test domain — emails will NOT reach customers. ' +
      'Add a verified domain in Resend dashboard and set RESEND_FROM_EMAIL=bookings@yourdomain.com'
    )
  }

  try {
    const result = await resend.emails.send({
      from: `The Groomers <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log(`[EMAIL] Sent to: ${to} | ID: ${result?.data?.id || 'unknown'}`)
    return true
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err?.message, err?.response?.data || '')
    return false
  }
}
