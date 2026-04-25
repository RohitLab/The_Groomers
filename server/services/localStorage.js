import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

let settingsCache = null

// Column order (1-indexed in ExcelJS)
const COL = { phone:1, name:2, email:3, gender:4, instagram:5, facebook:6, google:7, visits:8, firstVisit:9, lastVisit:10, tag:11, billAmount:12, cashbackEarned:13, cashbackPercent:14, totalCashback:15 }
const HEADERS = ['Phone','Name','Email','Gender','Instagram','Facebook','GoogleReview','Visits','FirstVisit','LastVisit','Tag','BillAmount','CashbackEarned','CashbackPercent','TotalCashback']

function getFilePath() {
  const folder = process.env.DATA_FOLDER || './data'
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
  return path.join(folder, 'salon_crm.xlsx')
}

async function getWorkbook() {
  const filePath = getFilePath()
  const wb = new ExcelJS.Workbook()

  if (fs.existsSync(filePath)) {
    await wb.xlsx.readFile(filePath)
  }

  // Ensure Customers sheet
  let cs = wb.getWorksheet('Customers')
  if (!cs) {
    cs = wb.addWorksheet('Customers')
    const headerRow = cs.getRow(1)
    HEADERS.forEach((h, i) => { headerRow.getCell(i + 1).value = h })
    headerRow.font = { bold: true, color: { argb: 'FFF1EFE8' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C2C2A' } }
    headerRow.commit()
    // Set column widths
    cs.getColumn(1).width = 15; cs.getColumn(2).width = 20; cs.getColumn(3).width = 25
  }

  // Ensure Settings sheet
  let ss = wb.getWorksheet('Settings')
  if (!ss) {
    ss = wb.addWorksheet('Settings')
    const hr = ss.getRow(1)
    hr.getCell(1).value = 'Key'; hr.getCell(2).value = 'Value'
    hr.font = { bold: true }; hr.commit()
    const defaults = getDefaultSettings()
    let r = 2
    for (const [k, v] of Object.entries(defaults)) {
      const row = ss.getRow(r++)
      row.getCell(1).value = k; row.getCell(2).value = String(v)
      row.commit()
    }
  }

  return wb
}

async function save(wb) {
  await wb.xlsx.writeFile(getFilePath())
}

function cellVal(row, col) {
  const v = row.getCell(col).value
  if (v === null || v === undefined) return ''
  return v
}

function rowToCustomer(row) {
  return {
    phone: String(cellVal(row, COL.phone)),
    name: String(cellVal(row, COL.name)),
    email: String(cellVal(row, COL.email)),
    gender: String(cellVal(row, COL.gender)),
    instagramFollowed: cellVal(row, COL.instagram) === 'Yes',
    facebookFollowed: cellVal(row, COL.facebook) === 'Yes',
    googleReview: cellVal(row, COL.google) === 'Yes',
    visits: Number(cellVal(row, COL.visits)) || 0,
    firstVisit: String(cellVal(row, COL.firstVisit)),
    lastVisit: String(cellVal(row, COL.lastVisit)),
    tag: String(cellVal(row, COL.tag) || 'New'),
    billAmount: Number(cellVal(row, COL.billAmount)) || 0,
    cashbackEarned: Number(cellVal(row, COL.cashbackEarned)) || 0,
    cashbackPercent: Number(cellVal(row, COL.cashbackPercent)) || 5,
    totalCashback: Number(cellVal(row, COL.totalCashback)) || 0,
  }
}

function writeCustomerRow(row, c) {
  row.getCell(COL.phone).value = c.phone
  row.getCell(COL.name).value = c.name
  row.getCell(COL.email).value = c.email || ''
  row.getCell(COL.gender).value = c.gender || ''
  row.getCell(COL.instagram).value = c.instagramFollowed ? 'Yes' : 'No'
  row.getCell(COL.facebook).value = c.facebookFollowed ? 'Yes' : 'No'
  row.getCell(COL.google).value = c.googleReview ? 'Yes' : 'No'
  row.getCell(COL.visits).value = c.visits || 1
  row.getCell(COL.firstVisit).value = c.firstVisit || new Date().toISOString().split('T')[0]
  row.getCell(COL.lastVisit).value = c.lastVisit || new Date().toISOString().split('T')[0]
  row.getCell(COL.tag).value = c.tag || 'New'
  row.getCell(COL.billAmount).value = c.billAmount || 0
  row.getCell(COL.cashbackEarned).value = c.cashbackEarned || 0
  row.getCell(COL.cashbackPercent).value = c.cashbackPercent || 5
  row.getCell(COL.totalCashback).value = c.totalCashback || 0
  row.commit()
}

// ── CRUD ──

export async function lookupByPhone(phone) {
  try {
    const wb = await getWorkbook()
    const sheet = wb.getWorksheet('Customers')
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i)
      if (String(cellVal(row, COL.phone)) === phone) {
        return { customer: rowToCustomer(row), rowIndex: i }
      }
    }
    return null
  } catch (err) {
    console.error('Lookup error:', err.message)
    return null
  }
}

export async function appendCustomer(data) {
  try {
    const wb = await getWorkbook()
    const sheet = wb.getWorksheet('Customers')
    const newRow = sheet.getRow(sheet.rowCount + 1)
    writeCustomerRow(newRow, data)
    await save(wb)
    console.log(`✅ Saved customer: ${data.name} (${data.phone})`)
    return true
  } catch (err) {
    console.error('Append error:', err.message)
    return false
  }
}

export async function updateCustomer(phone, fields) {
  try {
    const wb = await getWorkbook()
    const sheet = wb.getWorksheet('Customers')

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i)
      if (String(cellVal(row, COL.phone)) === phone) {
        const existing = rowToCustomer(row)
        const updated = { ...existing, ...fields }
        if (updated.visits >= 5) updated.tag = 'VIP'
        else if (updated.visits >= 2) updated.tag = 'Regular'
        writeCustomerRow(row, updated)
        await save(wb)
        return true
      }
    }
    return false
  } catch (err) {
    console.error('Update error:', err.message)
    return false
  }
}

export async function getAllCustomers(tagFilter) {
  try {
    const wb = await getWorkbook()
    const sheet = wb.getWorksheet('Customers')
    const customers = []
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i)
      const phone = cellVal(row, COL.phone)
      if (!phone) continue
      const c = rowToCustomer(row)
      if (tagFilter && c.tag !== tagFilter) continue
      customers.push(c)
    }
    return customers
  } catch (err) {
    console.error('GetAll error:', err.message)
    return []
  }
}

export async function getSettings() {
  if (settingsCache) return settingsCache
  try {
    const wb = await getWorkbook()
    const sheet = wb.getWorksheet('Settings')
    const settings = {}
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i)
      const key = String(cellVal(row, 1))
      const val = String(cellVal(row, 2))
      if (key) settings[key] = isNaN(val) ? val : Number(val)
    }
    settingsCache = { ...getDefaultSettings(), ...settings }
    return settingsCache
  } catch {
    return getDefaultSettings()
  }
}

export async function updateSettings(newSettings) {
  settingsCache = { ...settingsCache, ...newSettings }
  try {
    const wb = await getWorkbook()
    const sheet = wb.getWorksheet('Settings')
    // Clear data rows
    while (sheet.rowCount > 1) sheet.spliceRows(2, 1)
    // Write all
    const all = { ...getDefaultSettings(), ...settingsCache }
    let r = 2
    for (const [k, v] of Object.entries(all)) {
      const row = sheet.getRow(r++)
      row.getCell(1).value = k; row.getCell(2).value = String(v)
      row.commit()
    }
    await save(wb)
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
