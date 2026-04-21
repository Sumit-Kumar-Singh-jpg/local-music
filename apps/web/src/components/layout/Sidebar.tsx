import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useModalStore } from '../../store/modalStore'
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
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { showPrompt, showAlert } = useModalStore()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<any[]>([])

  useEffect(() => {
    playlistApi.list()
      .then(res => setPlaylists(res.playlists))
      .catch(() => setPlaylists([]))
  }, [])

  const handleCreatePlaylist = () => {
    showPrompt('New Playlist', 'Enter a name for your new playlist:', (name) => {
      if (name) {
        playlistApi.create(name).then(res => {
          setPlaylists(prev => [...prev, res.playlist])
        }).catch(err => showAlert('Error', err.message))
      }
    })
  }


  return (
    <aside className={`sidebar glass-heavy ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ 
      transition: 'var(--transition-slow)',
      boxShadow: 'var(--shadow-lunar-lift)',
      borderRight: 'var(--border-glass)'
    }}>
      {/* Logo & Toggle */}
      <div className="sidebar-header" style={{ padding: '24px 20px' }}>
        {!sidebarCollapsed && (
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sidebar-logo-icon" style={{ 
              width: 32, height: 32, borderRadius: 'var(--radius-sm)', 
              background: 'var(--grad-primary)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontSize: '1.25rem', fontWeight: 800
            }}>♪</div>
            <span className="sidebar-logo-text" style={{ 
              fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em',
              background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Local Music</span>
          </div>
        )}
        <button className="btn-icon toggle-btn" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand' : 'Collapse'} style={{ opacity: 0.6 }}>
          {sidebarCollapsed ? '»' : '«'}
        </button>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            title={sidebarCollapsed ? item.label : ''}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Playlists */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          {!sidebarCollapsed && <span>Your Playlists</span>}
          <button className="btn-icon" title="Create playlist" onClick={handleCreatePlaylist}>＋</button>
        </div>
        <div className="sidebar-playlists">
          {playlists.map((pl, i) => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="sidebar-playlist-item"
              title={sidebarCollapsed ? pl.name : ''}
            >
              <span
                className="sidebar-playlist-dot"
                style={{ background: PLAYLIST_COLORS[i % PLAYLIST_COLORS.length] }}
              />
              {!sidebarCollapsed && <span className="truncate">{pl.name}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {user?.role === 'ADMIN' && (
          <button className="btn-glass sidebar-admin-btn" onClick={() => navigate('/admin')} title={sidebarCollapsed ? 'Admin' : ''}>
            <span>⚙</span> {!sidebarCollapsed && 'Admin Panel'}
          </button>
        )}
        <div className="sidebar-user">
          <img
            src={user?.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={user?.name}
            className="sidebar-user-avatar"
          />
          {!sidebarCollapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name truncate">{user?.name || 'User'}</span>
              {user?.role === 'ADMIN' && <span className="badge badge-admin">Admin</span>}
            </div>
          )}
          {!sidebarCollapsed && <button className="btn-icon" onClick={logout} title="Log out">⏻</button>}
        </div>
      </div>
    </aside>
  )
}
