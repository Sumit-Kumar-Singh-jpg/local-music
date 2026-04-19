import './Dashboard.css'

const STATS = [
  { label: 'Total Users',     value: '12.4M',  change: '+8.2%',  icon: '👥', color: '#A855F7' },
  { label: 'Active Streams',  value: '847K',   change: '+24.1%', icon: '🎵', color: '#EC4899' },
  { label: 'Monthly Revenue', value: '$2.1M',  change: '+12.5%', icon: '💰', color: '#10B981' },
  { label: 'New Tracks',      value: '48,293', change: '+5.7%',  icon: '🎧', color: '#3B82F6' },
]

const RECENT_USERS = [
  { name: 'Sumit Kumar',    email: 'sumit@email.com',   plan: 'premium', status: 'active',  joined: 'Apr 18, 2026' },
  { name: 'Priya Sharma',   email: 'priya@email.com',   plan: 'free',    status: 'active',  joined: 'Apr 17, 2026' },
  { name: 'Rohan Mehta',    email: 'rohan@email.com',   plan: 'premium', status: 'active',  joined: 'Apr 16, 2026' },
  { name: 'Ananya Gupta',   email: 'ananya@email.com',  plan: 'free',    status: 'banned',  joined: 'Apr 15, 2026' },
  { name: 'Arjun Singh',    email: 'arjun@email.com',   plan: 'premium', status: 'active',  joined: 'Apr 14, 2026' },
]

const TOP_TRACKS = [
  { rank: 1, title: 'Blinding Lights', artist: 'The Weeknd', streams: '124.5M', trend: '↑' },
  { rank: 2, title: 'As It Was',        artist: 'Harry Styles', streams: '98.3M', trend: '↑' },
  { rank: 3, title: 'Anti-Hero',        artist: 'Taylor Swift', streams: '87.2M', trend: '→' },
  { rank: 4, title: 'Levitating',       artist: 'Dua Lipa',     streams: '76.1M', trend: '↓' },
  { rank: 5, title: 'Heat Waves',       artist: 'Glass Animals', streams: '68.9M', trend: '↑' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CHART_DATA = [65, 78, 55, 90, 82, 96, 88]

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Welcome back, Super Admin · Last updated just now</p>
      </div>

      {/* Stats Row */}
      <div className="admin-stats-grid">
        {STATS.map(s => (
          <div key={s.label} className="admin-stat-card glass">
            <div className="admin-stat-header">
              <span className="admin-stat-label">{s.label}</span>
              <span className="admin-stat-icon" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-change" style={{ color: s.change.startsWith('+') ? '#10B981' : '#EF4444' }}>
              {s.change} vs last month
            </div>
            <div className="admin-stat-bar">
              <div className="admin-stat-bar-fill" style={{ background: s.color, width: '65%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="admin-charts-row">
        {/* Line Chart */}
        <div className="admin-chart-card glass" style={{ flex: 3 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Listening Activity</h2>
          <div className="admin-bar-chart">
            {CHART_DATA.map((val, i) => (
              <div key={i} className="admin-bar-col">
                <div
                  className="admin-bar"
                  style={{ height: `${val}%`, background: `linear-gradient(to top, #A855F7, #EC4899)` }}
                />
                <span className="admin-bar-label">{DAYS[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
              <span style={{ color: '#A855F7' }}>●</span> Premium Users &nbsp;
              <span style={{ color: '#EC4899' }}>●</span> Free Users
            </span>
          </div>
        </div>

        {/* Donut */}
        <div className="admin-chart-card glass" style={{ flex: 2 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 24 }}>User Distribution</h2>
          <div className="admin-donut">
            <svg viewBox="0 0 120 120" className="admin-donut-svg">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#A855F7" strokeWidth="20"
                strokeDasharray="97 185" strokeDashoffset="0" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#EC4899" strokeWidth="20"
                strokeDasharray="164 185" strokeDashoffset="-97" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#3B82F6" strokeWidth="20"
                strokeDasharray="23 185" strokeDashoffset="-161" transform="rotate(-90 60 60)" />
              <text x="60" y="64" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">12.4M</text>
            </svg>
          </div>
          {[['Premium', '34%', '#A855F7'], ['Free', '58%', '#EC4899'], ['Student', '8%', '#3B82F6']].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                <span style={{ color: c as string }}>●</span> {l}
              </span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="admin-charts-row">
        {/* Users table */}
        <div className="admin-chart-card glass" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700 }}>Recent Users</h2>
            <input className="input-glass" placeholder="Search…" style={{ width: 160, padding: '6px 12px', fontSize: '0.8rem' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['User', 'Plan', 'Status', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_USERS.map(u => (
                <tr key={u.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 0' }}>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{u.email}</div>
                  </td>
                  <td><span className={`badge ${u.plan === 'premium' ? 'badge-premium' : ''}`} style={u.plan === 'free' ? { background: 'rgba(255,255,255,0.08)', color: 'var(--color-on-surface-variant)' } : {}}>{u.plan}</span></td>
                  <td>
                    <span style={{
                      color: u.status === 'active' ? '#10B981' : '#EF4444',
                      fontSize: '0.8rem', fontWeight: 600
                    }}>{u.status === 'active' ? '● Active' : '✕ Banned'}</span>
                  </td>
                  <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.8rem' }}>{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="#" className="section-link" style={{ marginTop: 16, display: 'inline-block' }}>View all users →</a>
        </div>

        {/* Top tracks */}
        <div className="admin-chart-card glass" style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>🔴 Live Top Tracks</h2>
          {TOP_TRACKS.map(t => (
            <div key={t.rank} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: t.rank === 1 ? 'var(--grad-primary)' : 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
              }}>{t.rank}</span>
              <img src={`https://picsum.photos/seed/tt${t.rank}/40/40`} alt={t.title} style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }} className="truncate">{t.title}</div>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem' }}>{t.artist}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t.streams}</div>
                <div style={{ color: t.trend === '↑' ? '#10B981' : t.trend === '↓' ? '#EF4444' : 'var(--color-on-surface-variant)', fontSize: '0.8rem' }}>{t.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
