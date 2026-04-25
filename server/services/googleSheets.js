import { google } from 'googleapis'

let sheetsClient = null
let settingsCache = null
let initialized = false

const SHEET_NAME = 'Customers'
const SETTINGS_SHEET = 'Settings'
const COLUMNS = ['phone', 'name', 'email', 'instagramFollowed', 'facebookFollowed', 'googleReview', 'cashbackAmount', 'visits', 'firstVisit', 'lastVisit', 'tag', 'billAmount', 'cashbackEarned', 'cashbackPercent', 'totalCashback', 'gender']

function getClient() {
  if (sheetsClient) return sheetsClient
  const creds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!creds) return null

  try {
    const parsed = JSON.parse(creds)
    const auth = new google.auth.GoogleAuth({
      credentials: parsed,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    sheetsClient = google.sheets({ version: 'v4', auth })
    return sheetsClient
  } catch (err) {
    console.error('Google Sheets auth error:', err.message)
    return null
  }
}

// Auto-initialize sheet tabs and headers on first access
async function ensureInitialized() {
  if (initialized) return
  const client = getClient()
  if (!client) return

  try {
    // Get spreadsheet metadata to check existing sheets
    const meta = await client.spreadsheets.get({
      spreadsheetId: getSheetId(),
      fields: 'sheets.properties.title,sheets.properties.sheetId',
    })
    const sheetNames = meta.data.sheets.map(s => s.properties.title)
    const requests = []

    // Rename Sheet1 to Customers if it exists and Customers doesn't
    if (sheetNames.includes('Sheet1') && !sheetNames.includes(SHEET_NAME)) {
      const sheet1 = meta.data.sheets.find(s => s.properties.title === 'Sheet1')
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: sheet1.properties.sheetId, title: SHEET_NAME },
          fields: 'title',
        },
      })
      console.log('Renamed Sheet1 → Customers')
    }

    // Add Settings sheet if missing
    if (!sheetNames.includes(SETTINGS_SHEET) && !sheetNames.includes('Sheet1')) {
      // Only add if we didn't just rename Sheet1
      if (!sheetNames.includes(SHEET_NAME)) {
        requests.push({ addSheet: { properties: { title: SHEET_NAME } } })
      }
    }
    if (!sheetNames.includes(SETTINGS_SHEET)) {
      requests.push({ addSheet: { properties: { title: SETTINGS_SHEET } } })
    }

    if (requests.length > 0) {
      await client.spreadsheets.batchUpdate({
        spreadsheetId: getSheetId(),
        requestBody: { requests },
      })
    }

    // Add header row to Customers if empty
    const cusData = await client.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A1:P1`,
    })
    if (!cusData.data.values || cusData.data.values.length === 0) {
      await client.spreadsheets.values.update({
        spreadsheetId: getSheetId(),
        range: `${SHEET_NAME}!A1:P1`,
        valueInputOption: 'RAW',
        requestBody: { values: [COLUMNS] },
      })
      console.log('Added Customers header row')
    }

    initialized = true
    console.log('Google Sheets initialized successfully')
  } catch (err) {
    console.error('Sheet initialization error:', err.message)
    // Still mark as initialized to avoid retrying every call
    initialized = true
  }
}

function getSheetId() {
  return process.env.GOOGLE_SHEETS_ID
}

function rowToCustomer(row) {
  const obj = {}
  COLUMNS.forEach((col, i) => { obj[col] = row[i] || '' })
  obj.visits = parseInt(obj.visits) || 0
  obj.totalCashback = parseFloat(obj.totalCashback) || 0
  obj.billAmount = parseFloat(obj.billAmount) || 0
  obj.cashbackEarned = parseFloat(obj.cashbackEarned) || 0
  obj.instagramFollowed = obj.instagramFollowed === 'Yes'
  obj.facebookFollowed = obj.facebookFollowed === 'Yes'
  obj.googleReview = obj.googleReview === 'Yes'
  return obj
}

function customerToRow(c) {
  return [
    c.phone, c.name, c.email,
    c.instagramFollowed ? 'Yes' : 'No',
    c.facebookFollowed ? 'Yes' : 'No',
    c.googleReview ? 'Yes' : 'No',
    c.cashbackAmount || 0,
    c.visits || 1,
    c.firstVisit || new Date().toISOString().split('T')[0],
    c.lastVisit || new Date().toISOString().split('T')[0],
    c.tag || 'New',
    c.billAmount || 0,
    c.cashbackEarned || 0,
    c.cashbackPercent || 5,
    c.totalCashback || 0,
    c.gender || '',
  ]
}

export async function lookupByPhone(phone) {
  await ensureInitialized()
  const client = getClient()
  if (!client) return null

  try {
    const res = await client.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A:P`,
    })
    const rows = res.data.values || []
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === phone) {
        return { customer: rowToCustomer(rows[i]), rowIndex: i + 1 }
      }
    }
    return null
  } catch (err) {
    console.error('Lookup error:', err.message)
    return null
  }
}

export async function appendCustomer(data) {
  await ensureInitialized()
  const client = getClient()
  if (!client) return false

  try {
    const row = customerToRow(data)
    await client.spreadsheets.values.append({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A:P`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
    return true
  } catch (err) {
    console.error('Append error:', err.message)
    return false
  }
}

export async function updateCustomer(phone, fields) {
  await ensureInitialized()
  const client = getClient()
  if (!client) return false

  try {
    const result = await lookupByPhone(phone)
    if (!result) return false

    const updated = { ...result.customer, ...fields }
    // Recalculate tag
    if (updated.visits >= 5) updated.tag = 'VIP'
    else if (updated.visits >= 1) updated.tag = 'Regular'

    const row = customerToRow(updated)
    await client.spreadsheets.values.update({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A${result.rowIndex}:P${result.rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
    return true
  } catch (err) {
    console.error('Update error:', err.message)
    return false
  }
}

export async function getAllCustomers(tagFilter) {
  await ensureInitialized()
  const client = getClient()
  if (!client) return []

  try {
    const res = await client.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A:P`,
    })
    const rows = res.data.values || []
    let customers = rows.slice(1).map(rowToCustomer)
    if (tagFilter) customers = customers.filter(c => c.tag === tagFilter)
    return customers
  } catch (err) {
    console.error('GetAll error:', err.message)
    return []
  }
}

export async function getSettings() {
  if (settingsCache) return settingsCache
  await ensureInitialized()
  const client = getClient()
  if (!client) return getDefaultSettings()

  try {
    const res = await client.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${SETTINGS_SHEET}!A:B`,
    })
    const rows = res.data.values || []
    const settings = {}
    rows.forEach(([key, value]) => {
      if (key && value !== undefined) {
        settings[key] = isNaN(value) ? value : Number(value)
      }
    })
    settingsCache = { ...getDefaultSettings(), ...settings }
    return settingsCache
  } catch {
    return getDefaultSettings()
  }
}

export async function updateSettings(newSettings) {
  settingsCache = { ...settingsCache, ...newSettings }
  const client = getClient()
  if (!client) return true

  try {
    const rows = Object.entries(newSettings).map(([k, v]) => [k, String(v)])
    await client.spreadsheets.values.update({
      spreadsheetId: getSheetId(),
      range: `${SETTINGS_SHEET}!A1:B${rows.length}`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    })
    return true
  } catch (err) {
    console.error('Settings update error:', err.message)
    return false
  }
}

function getDefaultSettings() {
  return {
    salonName: 'The Grommers',
    cashbackPercent: 5,
    minBill: 100,
    maxCashback: 500,
    instagramUrl: 'https://instagram.com/thegrommers',
    facebookUrl: 'https://facebook.com/thegrommers',
    googleReviewUrl: 'https://g.page/thegrommers/review',
    whatsappNumber: '',
  }
}
