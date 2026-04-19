import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ApiStatus from '../ui/ApiStatus'
import './TopBar.css'

export default function TopBar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className="topbar glass-heavy">
      <div className="topbar-nav">
        <button className="btn-icon" onClick={() => navigate(-1)} title="Back">‹</button>
        <button className="btn-icon" onClick={() => navigate(+1)} title="Forward">›</button>
      </div>

      <div className="topbar-search">
        <span className="topbar-search-icon">⌕</span>
        <input
          className="topbar-search-input"
          placeholder="What do you want to listen to?"
          onFocus={() => navigate('/search')}
          readOnly
        />
      </div>

      <div className="topbar-right">
        <ApiStatus />
        {user?.plan === 'free' && (
          <Link to="/settings" className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.8125rem' }}>
            Upgrade
          </Link>
        )}
        <Link to="/settings">
          <img
            src={user?.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={user?.name}
            className="topbar-avatar"
            title={user?.name}
          />
        </Link>
      </div>
    </header>
  )
}
