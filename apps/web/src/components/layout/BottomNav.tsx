import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const NAV_ITEMS = [
  { to: '/',        icon: '⊞', label: 'Home'    },
  { to: '/search',  icon: '⌕', label: 'Search'  },
  { to: '/library', icon: '⊟', label: 'Library' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav glass-heavy">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
