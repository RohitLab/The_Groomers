import { saveAppointment, getAppointments, updateAppointmentStatus } from './_lib/googleSheets.js'
import { sendEmail } from './_lib/emailService.js'

export const maxDuration = 30

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  // ── BOOK NEW APPOINTMENT ──────────────────────────────────
  if (req.method === 'POST' && action === 'book') {
    const { name, phone, email, service, date, time, notes } = req.body

    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ error: 'Required fields missing' })
    }

    const bookingId = 'TG' + Date.now().toString().slice(-6)
    const bookedAt  = new Date().toISOString()

    await saveAppointment({
      bookingId, name, phone, email: email || '',
      service, date, time,
      notes: notes || '',
      status: 'Pending',
      bookedAt,
    })

    // Owner notification email
    await sendEmail({
      to: process.env.OWNER_EMAIL || 'wearegroomers@gmail.com',
      subject: `🆕 New Appointment — ${name} | ${service}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8f7f5;border-radius:12px">
          <h2 style="color:#2c2c2a;border-bottom:2px solid #F5A623;padding-bottom:12px">New Appointment Request</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;width:140px">Booking ID</td><td style="padding:8px 0;font-weight:600;color:#2c2c2a">${bookingId}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Customer</td><td style="padding:8px 0;font-weight:600;color:#2c2c2a">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Mobile</td><td style="padding:8px 0;font-weight:600;color:#2c2c2a">${phone}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0;color:#2c2c2a">${email || 'Not provided'}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Service</td><td style="padding:8px 0;font-weight:600;color:#F5A623">${service}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Date</td><td style="padding:8px 0;font-weight:600;color:#2c2c2a">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Time</td><td style="padding:8px 0;font-weight:600;color:#2c2c2a">${time}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Notes</td><td style="padding:8px 0;color:#2c2c2a">${notes || 'None'}</td></tr>
          </table>
          <div style="margin-top:20px;padding:12px;background:#2c2c2a;border-radius:8px;text-align:center">
            <a href="https://thegroomers.shop/dashboard" style="color:#F5A623;text-decoration:none;font-weight:600">View in Dashboard →</a>
          </div>
        </div>
      `,
    })

    // Customer confirmation email
    if (email) {
      await sendEmail({
        to: email,
        subject: `✅ Appointment Requested — The Groomers`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8f7f5;border-radius:12px">
            <div style="text-align:center;margin-bottom:24px">
              <h1 style="color:#2c2c2a;font-size:22px;margin:0">THE GROOMERS</h1>
              <p style="color:#F5A623;letter-spacing:3px;font-size:11px;margin:4px 0 0">UNISEX SALON</p>
            </div>
            <h2 style="color:#2c2c2a">Hi ${name}! 👋</h2>
            <p style="color:#555">Your appointment request has been received. We will confirm within 2 hours.</p>
            <div style="background:#2c2c2a;border-radius:10px;padding:20px;margin:20px 0">
              <p style="color:#888;margin:0 0 4px;font-size:12px">SERVICE</p>
              <p style="color:#F5A623;font-weight:700;font-size:18px;margin:0 0 16px">${service}</p>
              <p style="color:#888;margin:0 0 4px;font-size:12px">DATE & TIME</p>
              <p style="color:#fff;font-weight:600;font-size:16px;margin:0 0 16px">${date} at ${time}</p>
              <p style="color:#888;margin:0 0 4px;font-size:12px">BOOKING ID</p>
              <p style="color:#fff;font-size:14px;margin:0">${bookingId}</p>
            </div>
            <p style="color:#555;font-size:13px">📍 The Groomers Unisex Salon, Nashik<br>📱 For queries contact us on WhatsApp</p>
            <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #e0ddd6">
              <p style="color:#888;font-size:11px">Scan our QR for loyalty rewards<br>thegroomers.shop/scan</p>
            </div>
          </div>
        `,
      })
    }

    return res.status(200).json({ success: true, bookingId, message: 'Appointment booked successfully' })
  }

  // ── GET ALL APPOINTMENTS (dashboard) ─────────────────────
  if (req.method === 'GET' && action === 'list') {
    const appointments = await getAppointments()
    return res.status(200).json({ appointments })
  }

  // ── UPDATE STATUS ─────────────────────────────────────────
  if (req.method === 'POST' && action === 'update-status') {
    const { bookingId, status } = req.body
    if (!bookingId || !status) {
      return res.status(400).json({ error: 'bookingId and status required' })
    }
    await updateAppointmentStatus(bookingId, status)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
