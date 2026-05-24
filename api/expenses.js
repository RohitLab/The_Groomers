import db from './_lib/sheetsHelper.js'
import setCors from './_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    switch (action) {

      case 'addExpense': {
        const { expense_date, category, subcategory, amount, payment_method, description, receipt_url, is_recurring, recurring_type } = req.body
        if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' })

        const expense = {
          expense_id: db.generateId('EXP'),
          expense_date: expense_date || new Date().toISOString().split('T')[0],
          category,
          subcategory: subcategory || '',
          amount,
          payment_method: payment_method || 'Cash',
          description: description || '',
          receipt_url: receipt_url || '',
          is_recurring: is_recurring ? 'TRUE' : 'FALSE',
          recurring_type: recurring_type || '',
        }
        await db.appendRow('Expenses', expense)
        return res.json({ success: true, data: expense })
      }

      case 'getExpenses': {
        const { period, category, startDate, endDate } = req.query
        let expenses = await db.getTab('Expenses')

        if (period) {
          const range = db.getDateRange(period)
          expenses = db.filterByDateRange(expenses, 'expense_date', range.start, range.end)
        } else if (startDate && endDate) {
          expenses = db.filterByDateRange(expenses, 'expense_date', new Date(startDate), new Date(endDate))
        }

        if (category) {
          expenses = expenses.filter(e => e.category === category)
        }

        expenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
        const total = db.sumField(expenses, 'amount')
        return res.json({ success: true, data: expenses, total })
      }

      case 'updateExpense': {
        const { expense_id, ...updates } = req.body
        const expenses = await db.getTab('Expenses')
        const expense = expenses.find(e => e.expense_id === expense_id)
        if (!expense) return res.status(404).json({ error: 'Expense not found' })
        await db.updateRow('Expenses', expense._rowIndex, { ...expense, ...updates })
        return res.json({ success: true })
      }

      case 'deleteExpense': {
        const { expense_id } = req.body
        const expenses = await db.getTab('Expenses')
        const expense = expenses.find(e => e.expense_id === expense_id)
        if (!expense) return res.status(404).json({ error: 'Expense not found' })
        // Soft delete by clearing key fields
        await db.updateRow('Expenses', expense._rowIndex, {
          ...expense,
          category: 'DELETED',
          amount: '0',
          description: `[DELETED] ${expense.description}`,
        })
        return res.json({ success: true })
      }

      case 'getExpenseSummary': {
        const { period } = req.query
        let expenses = await db.getTab('Expenses')
        expenses = expenses.filter(e => e.category !== 'DELETED')

        if (period) {
          const range = db.getDateRange(period)
          expenses = db.filterByDateRange(expenses, 'expense_date', range.start, range.end)
        }

        const grouped = db.groupBy(expenses, 'category')
        const byCategory = Object.entries(grouped).map(([cat, rows]) => ({
          category: cat,
          total: db.sumField(rows, 'amount'),
          count: rows.length,
        }))
        byCategory.sort((a, b) => b.total - a.total)

        return res.json({
          success: true,
          data: {
            total: db.sumField(expenses, 'amount'),
            count: expenses.length,
            byCategory,
          },
        })
      }

      case 'getMonthlyTotals': {
        const expenses = await db.getTab('Expenses')
        const filtered = expenses.filter(e => e.category !== 'DELETED')
        const months = []
        const now = new Date()

        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
          const monthExpenses = db.filterByDateRange(filtered, 'expense_date', d, monthEnd)
          months.push({
            month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            year: d.getFullYear(),
            monthNum: d.getMonth() + 1,
            total: db.sumField(monthExpenses, 'amount'),
            count: monthExpenses.length,
          })
        }

        return res.json({ success: true, data: months })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Expenses API error:', error)
    return res.status(500).json({ error: 'Server error', message: error.message })
  }
}
