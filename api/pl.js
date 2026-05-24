import db from './_lib/sheetsHelper.js'
import setCors from './_lib/cors.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    switch (action) {

      case 'getPLSummary': {
        const { period, startDate, endDate } = req.query
        const [allSales, allExpenses] = await Promise.all([
          db.getTab('Sales'),
          db.getTab('Expenses'),
        ])

        let sales = allSales
        let expenses = allExpenses.filter(e => e.category !== 'DELETED')

        if (period) {
          const range = db.getDateRange(period)
          sales = db.filterByDateRange(sales, 'sale_date', range.start, range.end)
          expenses = db.filterByDateRange(expenses, 'expense_date', range.start, range.end)
        } else if (startDate && endDate) {
          sales = db.filterByDateRange(sales, 'sale_date', new Date(startDate), new Date(endDate))
          expenses = db.filterByDateRange(expenses, 'expense_date', new Date(startDate), new Date(endDate))
        }

        const revenue = db.sumField(sales, 'total_amount')
        const cogs = db.sumField(sales, 'total_cost')
        const grossProfit = revenue - cogs
        const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100) : 0
        const totalExpenses = db.sumField(expenses, 'amount')
        const netProfit = grossProfit - totalExpenses
        const netMargin = revenue > 0 ? ((netProfit / revenue) * 100) : 0

        // Previous period for comparison
        let prevRevenue = 0
        let prevExpenses = 0
        let prevNetProfit = 0
        if (period) {
          const range = db.getDateRange(period)
          const duration = range.end.getTime() - range.start.getTime()
          const prevStart = new Date(range.start.getTime() - duration)
          const prevEnd = range.start
          const prevSales = db.filterByDateRange(allSales, 'sale_date', prevStart, prevEnd)
          const prevExp = db.filterByDateRange(allExpenses.filter(e => e.category !== 'DELETED'), 'expense_date', prevStart, prevEnd)
          prevRevenue = db.sumField(prevSales, 'total_amount')
          prevExpenses = db.sumField(prevExp, 'amount')
          const prevCogs = db.sumField(prevSales, 'total_cost')
          prevNetProfit = (prevRevenue - prevCogs) - prevExpenses
        }

        return res.json({
          success: true,
          data: {
            revenue,
            cogs,
            grossProfit,
            grossMargin: Math.round(grossMargin * 100) / 100,
            totalExpenses,
            netProfit,
            netMargin: Math.round(netMargin * 100) / 100,
            salesCount: sales.length,
            expenseCount: expenses.length,
            prevRevenue,
            prevExpenses,
            prevNetProfit,
            revenueChange: prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0,
            expenseChange: prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0,
            profitChange: prevNetProfit !== 0 ? Math.round(((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100) : 0,
          },
        })
      }

      case 'getDailyPL': {
        const [sales, expenses] = await Promise.all([
          db.getTab('Sales'),
          db.getTab('Expenses'),
        ])
        const filtered = expenses.filter(e => e.category !== 'DELETED')

        const days = []
        const now = new Date()
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
          const dayEnd = new Date(d.getTime() + 86400000)
          const daySales = db.filterByDateRange(sales, 'sale_date', d, dayEnd)
          const dayExpenses = db.filterByDateRange(filtered, 'expense_date', d, dayEnd)
          const revenue = db.sumField(daySales, 'total_amount')
          const expenseTotal = db.sumField(dayExpenses, 'amount')
          const cogs = db.sumField(daySales, 'total_cost')
          days.push({
            date: d.toISOString().split('T')[0],
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue,
            expenses: expenseTotal,
            cogs,
            netProfit: (revenue - cogs) - expenseTotal,
          })
        }

        return res.json({ success: true, data: days })
      }

      case 'getMonthlyPL': {
        const [sales, expenses] = await Promise.all([
          db.getTab('Sales'),
          db.getTab('Expenses'),
        ])
        const filtered = expenses.filter(e => e.category !== 'DELETED')

        const months = []
        const now = new Date()
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
          const mSales = db.filterByDateRange(sales, 'sale_date', d, monthEnd)
          const mExpenses = db.filterByDateRange(filtered, 'expense_date', d, monthEnd)
          const revenue = db.sumField(mSales, 'total_amount')
          const expenseTotal = db.sumField(mExpenses, 'amount')
          const cogs = db.sumField(mSales, 'total_cost')
          months.push({
            month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue,
            expenses: expenseTotal,
            cogs,
            grossProfit: revenue - cogs,
            netProfit: (revenue - cogs) - expenseTotal,
          })
        }

        return res.json({ success: true, data: months })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('P&L API error:', error)
    return res.status(500).json({ error: 'Server error', message: error.message })
  }
}
