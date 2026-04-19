import { useEffect, useState } from 'react'
import { adminApi } from '../../lib/api'
import './Dashboard.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getStats().catch(() => ({ stats: null })),
      adminApi.getUsers(10).catch(() => ({ users: [] })),
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.stats)
      setUsers(usersRes.users)
      setLoading(false)
    })
  }, [])

  const filteredUsers = searchQuery
    ? users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users

  const STAT_CARDS = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#A855F7' },
    { label: 'Total Tracks', value: stats.totalTracks, icon: '🎵', color: '#EC4899' },
    { label: 'Total Artists', value: stats.totalArtists, icon: '🎤', color: '#10B981' },
    { label: 'Total Plays', value: stats.totalPlays, icon: '▶', color: '#3B82F6' },
  ] : []

  return (
    <div className="admin-dashboard fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
          Real-time data from your database · {loading ? 'Loading...' : 'Updated just now'}
        </p>
      </div>

      {/* Stats Row */}
      {STAT_CARDS.length > 0 && (
        <div className="admin-stats-grid">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="admin-stat-card glass">
              <div className="admin-stat-header">
                <span className="admin-stat-label">{s.label}</span>
                <span className="admin-stat-icon" style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="admin-stat-value">{s.value?.toLocaleString() || '0'}</div>
              <div className="admin-stat-bar">
                <div className="admin-stat-bar-fill" style={{ background: s.color, width: `${Math.min((s.value / 10) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="admin-charts-row" style={{ marginTop: 24 }}>
        <div className="admin-chart-card glass" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700 }}>All Users</h2>
            <input
              className="input-glass"
              placeholder="Search…"
              style={{ width: 200, padding: '6px 12px', fontSize: '0.8rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-secondary">Loading users...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {['User', 'Role', 'Plan', 'Joined'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : ''}`}
                        style={u.role !== 'ADMIN' ? { background: 'rgba(255,255,255,0.08)', color: 'var(--color-on-surface-variant)' } : {}}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.billingTier === 'PATRON' ? 'badge-premium' : ''}`}
                        style={u.billingTier !== 'PATRON' ? { background: 'rgba(255,255,255,0.08)', color: 'var(--color-on-surface-variant)' } : {}}>
                        {u.billingTier === 'PATRON' ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filteredUsers.length === 0 && !loading && (
            <p className="text-secondary" style={{ textAlign: 'center', padding: 20 }}>No users found</p>
          )}
        </div>
      </div>
    </div>
  )
}
