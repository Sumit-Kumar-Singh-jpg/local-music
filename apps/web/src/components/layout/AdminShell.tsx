import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './AdminShell.css'

const ADMIN_NAV = [
  { to: '/admin',          icon: '⊞', label: 'Dashboard'       },
  { to: '/admin/users',    icon: '👥', label: 'Users'           },
  { to: '/admin/content',  icon: '🎵', label: 'Content'         },
  { to: '/admin/tasks',    icon: '⚡', label: 'Ingestion Progres'},
  { to: '/admin/analytics',icon: '📊', label: 'Analytics'       },
  { to: '/admin/revenue',  icon: '💰', label: 'Revenue'         },
  { to: '/admin/reports',  icon: '📋', label: 'Reports'         },
  { to: '/admin/moderate', icon: '🛡', label: 'Moderation'      },
  { to: '/admin/settings', icon: '⚙', label: 'Settings'        },
]

export default function AdminShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar glass-low">
        <div className="admin-logo">
          <span className="admin-logo-icon">♪</span>
          <div>
            <div className="admin-logo-text gradient-text">Local Music</div>
            <span className="badge badge-admin" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          {ADMIN_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="btn-glass" style={{ width: '100%', fontSize: '0.85rem', marginBottom: 8 }}
            onClick={() => navigate('/')}>
            ← Back to App
          </button>
          <div className="admin-user">
            <img
              src={user?.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="admin-user-avatar"
            />
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name}</span>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{user?.email}</span>
            </div>
            <button className="btn-icon" onClick={logout} title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      <main className="admin-main fade-in">
        <Outlet />
      </main>
    </div>
  )
}
