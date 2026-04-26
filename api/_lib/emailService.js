import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return false
  }
  try {
    await resend.emails.send({
      from: 'The Groomers <onboarding@resend.dev>',
      to,
      subject,
      html,
    })
    console.log('Email sent to:', to)
    return true
  } catch (err) {
    console.error('Email failed:', err.message)
    return false
  }
}
