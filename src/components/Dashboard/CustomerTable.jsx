import { useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'

export default function CustomerTable() {
  const { customers, filter, setFilter, search, setSearch, loading } = useDashboard()
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...customers].sort((a, b) => {
    let va = a[sortField], vb = b[sortField]
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase() }
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const filters = ['all', 'New', 'Regular', 'VIP']

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Customers</h1>
        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{customers.length} total</p>
      </div>

      <div className="customer-filters">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${filter === (f === 'all' ? 'all' : f) ? 'filter-chip--active' : ''}`} onClick={() => setFilter(f === 'all' ? 'all' : f)}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="search-box">
        <span className="search-box__icon">🔍</span>
        <input className="glass-input" placeholder="Search by name, phone, or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}><div className="spinner spinner--large" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="glass-card customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('phone')}>Phone</th>
                <th onClick={() => handleSort('visits')}>Visits {sortField === 'visits' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('tag')}>Tag</th>
                <th onClick={() => handleSort('lastVisit')}>Last Visit</th>
                <th onClick={() => handleSort('totalCashback')}>Cashback</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => (
                <tr key={c.phone}>
                  <td>
                    <span className="customer-table__name">{c.name}</span>
                    {c.gender && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>{c.gender === 'Male' ? '♂' : c.gender === 'Female' ? '♀' : '⚧'}</span>}
                  </td>
                  <td className="customer-table__phone">{c.phone}</td>
                  <td>{c.visits}</td>
                  <td><span className={`glass-badge glass-badge--${(c.tag || 'new').toLowerCase()}`}>{c.tag}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{c.lastVisit || '—'}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 'var(--font-medium)' }}>₹{c.totalCashback || 0}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
