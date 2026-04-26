import { google } from 'googleapis'

const REDIRECT_URI = 'https://the-groomers.vercel.app/api/auth/callback'

export default async function handler(req, res) {
  const { code, error } = req.query

  if (error) {
    return res.send(`
      <html>
      <body style="font-family:sans-serif;padding:40px;background:#1a1a1a;color:white;text-align:center">
        <h2 style="color:#f44336">❌ Authorization Cancelled</h2>
        <p style="color:#aaa">You cancelled the Google authorization. Close this tab and try again from the Settings page.</p>
      </body>
      </html>
    `)
  }

  if (!code) {
    return res.status(400).send(`
      <html>
      <body style="font-family:sans-serif;padding:40px;background:#1a1a1a;color:white;text-align:center">
        <h2 style="color:#f44336">❌ Missing Authorization Code</h2>
        <p style="color:#aaa">No authorization code received. Please try connecting again from the Settings page.</p>
      </body>
      </html>
    `)
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    )

    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      return res.send(`
        <html>
        <body style="font-family:sans-serif;padding:40px;background:#1a1a1a;color:white;text-align:center">
          <h2 style="color:#FF9800">⚠️ No Refresh Token Received</h2>
          <p style="color:#aaa">Google didn't return a refresh token. This usually means this Google account was already authorized before.</p>
          <p style="color:#aaa">To fix: Go to <a href="https://myaccount.google.com/permissions" target="_blank" style="color:#4CAF50">Google Account Permissions</a>, revoke access for "TheGroomers OAuth", then try connecting again.</p>
        </body>
        </html>
      `)
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Google Contacts Connected — The Grommers</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #0f0f0f;
            color: #f1f1f1;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .card {
            background: #1e1e1e;
            border: 1px solid #333;
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            text-align: center;
          }
          h2 { color: #4CAF50; font-size: 24px; margin-bottom: 12px; }
          p { color: #aaa; margin-bottom: 16px; line-height: 1.6; }
          .token-box {
            background: #111;
            border: 1px solid #444;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
            color: #98FB98;
            text-align: left;
            user-select: all;
          }
          .steps {
            background: #252525;
            border-radius: 10px;
            padding: 20px;
            text-align: left;
            margin-top: 20px;
          }
          .steps p { color: #ddd; margin-bottom: 8px; }
          .steps code {
            background: #333;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            color: #98FB98;
          }
          .copy-btn {
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 24px;
            font-size: 14px;
            cursor: pointer;
            margin-top: 8px;
          }
          .copy-btn:hover { background: #43A047; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>✅ Google Contacts Connected!</h2>
          <p>Your Google account has been authorized. Copy the refresh token below and add it to Vercel.</p>

          <div class="token-box" id="token">${tokens.refresh_token}</div>
          <button class="copy-btn" onclick="
            navigator.clipboard.writeText(document.getElementById('token').innerText);
            this.textContent = '✓ Copied!';
            setTimeout(() => this.textContent = 'Copy Token', 2000);
          ">Copy Token</button>

          <div class="steps">
            <p><strong>Next steps to activate:</strong></p>
            <p>1. Copy the refresh token above</p>
            <p>2. Go to <strong>Vercel → Your Project → Settings → Environment Variables</strong></p>
            <p>3. Add variable: <code>GOOGLE_REFRESH_TOKEN</code> = <em>paste token here</em></p>
            <p>4. Click <strong>Save</strong> then go to <strong>Deployments → Redeploy</strong></p>
            <p>5. New customers will now auto-save to your Google Contacts 🎉</p>
          </div>
        </div>
      </body>
      </html>
    `)
  } catch (err) {
    console.error('OAuth callback error:', err.message)
    res.status(500).send(`
      <html>
      <body style="font-family:sans-serif;padding:40px;background:#1a1a1a;color:white;text-align:center">
        <h2 style="color:#f44336">❌ Authorization Failed</h2>
        <p style="color:#aaa">${err.message}</p>
        <p style="color:#aaa">Please try again from the Settings page.</p>
      </body>
      </html>
    `)
  }
}
