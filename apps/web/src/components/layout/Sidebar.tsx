import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/',        icon: '⊞', label: 'Home'    },
  { to: '/search',  icon: '⌕', label: 'Search'  },
  { to: '/library', icon: '⊟', label: 'Library' },
]

const PLAYLISTS = [
  { id: 'pl1', name: 'Chill Vibes 🎶',   color: '#A855F7' },
  { id: 'pl2', name: 'Late Night Drive', color: '#EC4899' },
  { id: 'pl3', name: 'Workout Hits 🔥',  color: '#3B82F6' },
  { id: 'pl4', name: 'Study Focus',      color: '#10B981' },
  { id: 'pl5', name: 'Liked Songs',      color: '#F59E0B' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside className="sidebar glass-low">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">♪</span>
        <span className="sidebar-logo-text gradient-text">Local Music</span>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Playlists */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>Your Playlists</span>
          <button className="btn-icon" title="Create playlist">＋</button>
        </div>
        <div className="sidebar-playlists">
          {PLAYLISTS.map(pl => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="sidebar-playlist-item"
            >
              <span
                className="sidebar-playlist-dot"
                style={{ background: pl.color }}
              />
              <span className="truncate">{pl.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {user?.role === 'admin' && (
          <button className="btn-glass sidebar-admin-btn" onClick={() => navigate('/admin')}>
            <span>⚙</span> Admin Panel
          </button>
        )}
        <div className="sidebar-user">
          <img
            src={user?.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={user?.name}
            className="sidebar-user-avatar"
          />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name truncate">{user?.name}</span>
            {user?.role === 'admin' && <span className="badge badge-admin">Admin</span>}
          </div>
          <button className="btn-icon" onClick={logout} title="Log out">⏻</button>
        </div>
      </div>
    </aside>
  )
}
