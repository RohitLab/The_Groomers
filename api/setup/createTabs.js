/**
 * One-time setup script: creates all business sheet tabs
 * Run: node api/setup/createTabs.js
 *
 * Requires env vars: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEETS_ID
 * (Loaded automatically from .env in the project root)
 */
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env manually (no dotenv dependency needed) ──────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../../.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
  console.log('✅ Loaded .env\n')
} else {
  console.warn('⚠️  No .env file found at project root — using system env vars\n')
}

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON === 'undefined') {
  console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON is not set in your .env file')
  process.exit(1)
}
if (!process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID === 'your-google-sheets-id') {
  console.error('❌ GOOGLE_SHEETS_ID is not set in your .env file')
  process.exit(1)
}

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID

const TABS = {
  Products: [
    'product_id', 'sku', 'name', 'category', 'description',
    'purchase_price', 'selling_price', 'current_stock',
    'min_stock_alert', 'image_url', 'barcode',
    'is_active', 'created_at', 'updated_at',
  ],
  Stock_Movements: [
    'movement_id', 'product_id', 'product_name',
    'movement_type', 'quantity', 'reason',
    'purchase_price_then', 'selling_price_then',
    'notes', 'date', 'created_at',
  ],
  Sales: [
    'sale_id', 'invoice_number', 'sale_date', 'sale_time',
    'total_amount', 'total_cost', 'gross_profit', 'discount',
    'payment_method', 'customer_phone', 'customer_name',
    'notes', 'created_at',
  ],
  Sale_Items: [
    'item_id', 'sale_id', 'invoice_number', 'product_id',
    'product_name', 'quantity', 'purchase_price',
    'selling_price', 'item_total', 'item_profit',
  ],
  Expenses: [
    'expense_id', 'expense_date', 'category', 'subcategory',
    'amount', 'payment_method', 'description', 'receipt_url',
    'is_recurring', 'recurring_type', 'created_at',
  ],
  Business_Categories: [
    'category_id', 'name', 'type', 'color', 'icon',
  ],
  Business_Settings: [
    'key', 'value', 'updated_at',
  ],
}

const PREFILL = {
  Business_Categories: [
    ['EXP_CAT_1', 'Rent', 'expense', '#FF6B6B', '🏠'],
    ['EXP_CAT_2', 'Utilities', 'expense', '#4ECDC4', '⚡'],
    ['EXP_CAT_3', 'Salaries', 'expense', '#45B7D1', '👥'],
    ['EXP_CAT_4', 'Supplier Payment', 'expense', '#96CEB4', '📦'],
    ['EXP_CAT_5', 'Marketing', 'expense', '#FFEAA7', '📢'],
    ['EXP_CAT_6', 'Shipping', 'expense', '#DDA0DD', '🚚'],
    ['EXP_CAT_7', 'Maintenance', 'expense', '#98D8C8', '🔧'],
    ['EXP_CAT_8', 'Transportation', 'expense', '#F7DC6F', '🚗'],
    ['EXP_CAT_9', 'Taxes', 'expense', '#BB8FCE', '📋'],
    ['EXP_CAT_10', 'Miscellaneous', 'expense', '#AEB6BF', '📌'],
  ],
  Business_Settings: [
    ['business_name', 'My Shop', new Date().toISOString()],
    ['currency_symbol', '₹', new Date().toISOString()],
    ['financial_year_start', 'April', new Date().toISOString()],
    ['tax_rate', '0', new Date().toISOString()],
    ['low_stock_threshold', '10', new Date().toISOString()],
  ],
}

async function run() {
  console.log('🔧 Creating business sheet tabs...\n')

  // Get existing tabs
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties.title',
  })
  const existing = meta.data.sheets.map(s => s.properties.title)
  console.log('Existing tabs:', existing.join(', '))

  // Create missing tabs
  for (const [tabName, headers] of Object.entries(TABS)) {
    if (existing.includes(tabName)) {
      console.log(`  ✓ ${tabName} already exists`)
      continue
    }

    // Add the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    })

    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:${String.fromCharCode(64 + headers.length)}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    })

    console.log(`  ✅ Created ${tabName} with ${headers.length} columns`)

    // Write prefill data if available
    if (PREFILL[tabName]) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: tabName,
        valueInputOption: 'RAW',
        resource: { values: PREFILL[tabName] },
      })
      console.log(`     📝 Pre-filled ${PREFILL[tabName].length} rows`)
    }
  }

  console.log('\n🎉 All business tabs ready!')
}

run().catch(err => {
  console.error('❌ Setup failed:', err.message)
  process.exit(1)
})
