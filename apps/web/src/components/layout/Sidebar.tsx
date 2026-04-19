import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { playlistApi } from '../../lib/api'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/',        icon: '⊞', label: 'Home'    },
  { to: '/search',  icon: '⌕', label: 'Search'  },
  { to: '/library', icon: '⊟', label: 'Library' },
]

const PLAYLIST_COLORS = ['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<any[]>([])

  useEffect(() => {
    playlistApi.list()
      .then(res => setPlaylists(res.playlists))
      .catch(() => setPlaylists([]))
  }, [])

  const handleCreatePlaylist = () => {
    const name = prompt('Enter playlist name:')
    if (name) {
      playlistApi.create(name).then(res => {
        setPlaylists(prev => [...prev, res.playlist])
      }).catch(console.error)
    }
  }

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
          <button className="btn-icon" title="Create playlist" onClick={handleCreatePlaylist}>＋</button>
        </div>
        <div className="sidebar-playlists">
          {playlists.map((pl, i) => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="sidebar-playlist-item"
            >
              <span
                className="sidebar-playlist-dot"
                style={{ background: PLAYLIST_COLORS[i % PLAYLIST_COLORS.length] }}
              />
              <span className="truncate">{pl.name}</span>
            </NavLink>
          ))}
          {playlists.length === 0 && (
            <div className="text-secondary" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>No playlists yet</div>
          )}
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
            <span className="sidebar-user-name truncate">{user?.name || 'User'}</span>
            {user?.role === 'admin' && <span className="badge badge-admin">Admin</span>}
          </div>
          <button className="btn-icon" onClick={logout} title="Log out">⏻</button>
        </div>
      </div>
    </aside>
  )
}
