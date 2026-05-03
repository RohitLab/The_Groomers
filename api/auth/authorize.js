import { google } from 'googleapis'

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://thegroomers.shop/api/auth/callback'

export default function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/contacts'],
    prompt: 'consent',        // Force consent so refresh_token is always returned
  })

  res.redirect(authUrl)
}
