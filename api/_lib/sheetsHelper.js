import { google } from 'googleapis'

// ── Auth (reuses exact pattern from googleSheets.js) ──────────────────
let sheetsClient = null

function getGoogleAuth() {
  const creds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!creds) return null
  try {
    const parsed = JSON.parse(creds)
    return new google.auth.GoogleAuth({
      credentials: parsed,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  } catch (err) {
    console.error('SheetsHelper auth error:', err.message)
    return null
  }
}

function getClient() {
  if (sheetsClient) return sheetsClient
  const auth = getGoogleAuth()
  if (!auth) return null
  sheetsClient = google.sheets({ version: 'v4', auth })
  return sheetsClient
}

function getSheetId() {
  return process.env.GOOGLE_SHEETS_ID
}

// ── SheetsDB Class ────────────────────────────────────────────────────

// VULN-017: Allowlist of valid tab names — prevents sheet tab injection
const ALLOWED_TABS = new Set([
  'Customers', 'Settings', 'Appointments', 'Expenses', 'Sales',
  'Sale_Items', 'Products', 'Stock_Movements', 'Business_Settings',
])

function assertTab(tabName) {
  if (!ALLOWED_TABS.has(tabName)) {
    throw new Error(`Access denied: unknown sheet tab '${tabName}'`)
  }
}

class SheetsDB {
  // ─── READ ────────────────────────────────────

  async getTab(tabName) {
    assertTab(tabName)  // VULN-017
    const client = getClient()
    if (!client) throw new Error('Sheets client not available')
    try {
      const response = await client.spreadsheets.values.get({
        spreadsheetId: getSheetId(),
        range: tabName,
      })
      const rows = response.data.values || []
      if (rows.length === 0) return []
      const headers = rows[0]
      return rows.slice(1).map((row, index) => {
        const obj = { _rowIndex: index + 2 }
        headers.forEach((header, i) => {
          obj[header] = row[i] || ''
        })
        return obj
      })
    } catch (error) {
      console.error(`Error reading tab ${tabName}:`, error.message)
      throw error
    }
  }

  async getTabFiltered(tabName, filterKey, filterValue) {
    const data = await this.getTab(tabName)
    return data.filter(row => row[filterKey] === String(filterValue))
  }

  async getMultipleTabs(tabNames) {
    const results = await Promise.all(
      tabNames.map(tab => this.getTab(tab).catch(() => []))
    )
    return tabNames.reduce((acc, tab, i) => {
      acc[tab] = results[i]
      return acc
    }, {})
  }

  // ─── WRITE ───────────────────────────────────

  async appendRow(tabName, dataObj) {
    assertTab(tabName)  // VULN-017
    const client = getClient()
    if (!client) throw new Error('Sheets client not available')
    const headers = await this.getHeaders(tabName)
    const row = headers.map(h => {
      if (h === 'created_at' || h === 'updated_at') {
        return new Date().toISOString()
      }
      return dataObj[h] !== undefined ? String(dataObj[h]) : ''
    })
    await client.spreadsheets.values.append({
      spreadsheetId: getSheetId(),
      range: tabName,
      valueInputOption: 'RAW',  // VULN-024: RAW prevents formula injection
      resource: { values: [row] },
    })
    return dataObj
  }

  async updateRow(tabName, rowIndex, dataObj) {
    assertTab(tabName)  // VULN-017
    const client = getClient()
    if (!client) throw new Error('Sheets client not available')
    const headers = await this.getHeaders(tabName)
    const existing = await this.getTab(tabName)
    const currentRow = existing.find(r => r._rowIndex === rowIndex)
    const merged = { ...currentRow, ...dataObj, updated_at: new Date().toISOString() }
    const row = headers.map(h => String(merged[h] || ''))
    await client.spreadsheets.values.update({
      spreadsheetId: getSheetId(),
      range: `${tabName}!A${rowIndex}`,
      valueInputOption: 'RAW',  // VULN-024: RAW prevents formula injection
      resource: { values: [row] },
    })
    return merged
  }

  async batchAppend(tabName, dataArray) {
    assertTab(tabName)  // VULN-017
    const client = getClient()
    if (!client) throw new Error('Sheets client not available')
    const headers = await this.getHeaders(tabName)
    const rows = dataArray.map(dataObj =>
      headers.map(h => {
        if (h === 'created_at') return new Date().toISOString()
        return dataObj[h] !== undefined ? String(dataObj[h]) : ''
      })
    )
    await client.spreadsheets.values.append({
      spreadsheetId: getSheetId(),
      range: tabName,
      valueInputOption: 'RAW',  // VULN-024: RAW prevents formula injection
      resource: { values: rows },
    })
    return dataArray
  }

  // ─── UTILITIES ───────────────────────────────

  async getHeaders(tabName) {
    const client = getClient()
    if (!client) throw new Error('Sheets client not available')
    const response = await client.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${tabName}!1:1`,
    })
    return response.data.values?.[0] || []
  }

  generateId(prefix) {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 9000) + 1000
    return `${prefix}_${timestamp}_${random}`
  }

  async generateInvoiceNumber() {
    try {
      const sales = await this.getTab('Sales')
      const count = String(sales.length + 1).padStart(4, '0')
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      return `INV-${year}${month}-${count}`
    } catch {
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      const random = String(Math.floor(Math.random() * 9000) + 1000)
      return `INV-${year}${month}-${random}`
    }
  }

  parseNumber(value) {
    const num = parseFloat(value)
    return isNaN(num) ? 0 : num
  }

  parseInt(value) {
    const num = parseInt(value, 10)
    return isNaN(num) ? 0 : num
  }

  getDateRange(period) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    switch (period) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000) }
      case 'week': {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return { start: weekStart, end: now }
      }
      case 'month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
      case 'quarter': {
        const qMonth = Math.floor(now.getMonth() / 3) * 3
        return { start: new Date(now.getFullYear(), qMonth, 1), end: now }
      }
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: now }
      default:
        return { start: today, end: now }
    }
  }

  filterByDateRange(data, dateField, startDate, endDate) {
    return data.filter(row => {
      const date = new Date(row[dateField])
      return date >= startDate && date <= endDate
    })
  }

  sumField(data, field) {
    return data.reduce((sum, row) => sum + this.parseNumber(row[field]), 0)
  }

  groupBy(data, field) {
    return data.reduce((groups, row) => {
      const key = row[field] || 'Unknown'
      groups[key] = groups[key] || []
      groups[key].push(row)
      return groups
    }, {})
  }
}

const db = new SheetsDB()
export default db
