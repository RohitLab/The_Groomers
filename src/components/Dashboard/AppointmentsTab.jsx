import { useState, useEffect, useMemo } from 'react'

const STATUS_CONFIG = {
  Pending:   { color: '#F5A623', bg: 'rgba(245,166,35,0.15)',  label: 'Pending'   },
  Confirmed: { color: '#34C759', bg: 'rgba(52,199,89,0.15)',   label: 'Confirmed' },
  Cancelled: { color: '#FF3B30', bg: 'rgba(255,59,48,0.15)',   label: 'Cancelled' },
  Completed: { color: '#8E8E93', bg: 'rgba(142,142,147,0.15)', label: 'Completed' },
}

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'Pending',   label: 'Pending' },
  { id: 'Confirmed', label: 'Confirmed' },
  { id: 'today',     label: 'Today' },
]

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending
  return (
    <span
      className="appt-badge"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

function StatPill({ count, label, accent }) {
  return (
    <div className="appt-stat-pill" style={accent ? { borderColor: accent, color: accent } : {}}>
      <span className="appt-stat-pill__num">{count}</span>
      <span className="appt-stat-pill__label">{label}</span>
    </div>
  )
}

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null) // bookingId being updated

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/appointments?action=list')
      const data = await res.json()
      // Sort by date ascending
      const sorted = (data.appointments || []).sort((a, b) =>
        (a.date || '').localeCompare(b.date || '')
      )
      setAppointments(sorted)
    } catch (err) {
      console.error('Failed to load appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [])

  const updateStatus = async (bookingId, status) => {
    setUpdating(bookingId)
    try {
      await fetch('/api/appointments?action=update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      })
      setAppointments(prev =>
        prev.map(a => a.bookingId === bookingId ? { ...a, status } : a)
      )
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdating(null)
    }
  }

  const today = getTodayStr()

  const filtered = useMemo(() => {
    switch (filter) {
      case 'Pending':   return appointments.filter(a => a.status === 'Pending')
      case 'Confirmed': return appointments.filter(a => a.status === 'Confirmed')
      case 'today':     return appointments.filter(a => a.date === today)
      default:          return appointments
    }
  }, [appointments, filter, today])

  const pendingCount   = appointments.filter(a => a.status === 'Pending').length
  const todayCount     = appointments.filter(a => a.date === today).length
  const totalCount     = appointments.length

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Appointments</h1>
      </div>

      {/* Stats row */}
      <div className="appt-stats">
        <StatPill count={pendingCount} label="Pending" accent="#F5A623" />
        <StatPill count={todayCount}   label="Today"   accent="#007AFF" />
        <StatPill count={totalCount}   label="Total" />
      </div>

      {/* Filter tabs */}
      <div className="appt-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`campaign-option ${filter === f.id ? 'campaign-option--selected' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <button
          className="glass-btn appt-refresh-btn"
          onClick={fetchAppointments}
          disabled={loading}
          title="Refresh"
        >
          {loading ? <span className="spinner" /> : '↺'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="appt-loading">
          <span className="spinner" /> Loading appointments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="appt-empty">
          <p>No appointments found.</p>
          {filter !== 'all' && (
            <button className="glass-btn" onClick={() => setFilter('all')}>Show all</button>
          )}
        </div>
      ) : (
        <div className="appt-table-wrap">
          <table className="appt-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => (
                <tr
                  key={appt.bookingId}
                  className={`appt-row ${appt.date === today ? 'appt-row--today' : ''}`}
                >
                  <td className="appt-id">{appt.bookingId}</td>
                  <td className="appt-name">{appt.name}</td>
                  <td>{appt.phone}</td>
                  <td className="appt-service">{appt.service}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td><StatusBadge status={appt.status} /></td>
                  <td>
                    <div className="appt-actions">
                      {appt.status !== 'Confirmed' && appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                        <button
                          className="appt-action-btn appt-action-btn--confirm"
                          onClick={() => updateStatus(appt.bookingId, 'Confirmed')}
                          disabled={updating === appt.bookingId}
                          title="Confirm"
                        >
                          ✅
                        </button>
                      )}
                      {appt.status === 'Confirmed' && (
                        <button
                          className="appt-action-btn appt-action-btn--complete"
                          onClick={() => updateStatus(appt.bookingId, 'Completed')}
                          disabled={updating === appt.bookingId}
                          title="Mark Complete"
                        >
                          ✔
                        </button>
                      )}
                      {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                        <button
                          className="appt-action-btn appt-action-btn--cancel"
                          onClick={() => updateStatus(appt.bookingId, 'Cancelled')}
                          disabled={updating === appt.bookingId}
                          title="Cancel"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
