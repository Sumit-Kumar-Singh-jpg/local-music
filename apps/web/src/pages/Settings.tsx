import { useAuthStore } from '../store/authStore'

const SETTINGS_SECTIONS = ['Account', 'Playback', 'Audio Quality', 'Downloads', 'Appearance', 'Notifications', 'Privacy']

export default function Settings() {
  const { user } = useAuthStore()

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 32 }}>
      {/* Left nav */}
      <div className="glass-low" style={{ width: 200, borderRadius: 'var(--radius-xl)', padding: '16px 8px', flexShrink: 0, height: 'fit-content' }}>
        {SETTINGS_SECTIONS.map((s, i) => (
          <button key={s} className={`sidebar-link${i === 0 ? ' active' : ''}`} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', padding: '10px 12px', borderRadius: 'var(--radius-md)', color: i === 0 ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500, display: 'block' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Account Settings</h1>

        {/* Profile card */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <img src={user?.avatar} alt={user?.name} style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid', borderColor: 'var(--color-primary)' }} />
            <button className="btn-glass btn" style={{ fontSize: '0.875rem', padding: '8px 16px' }}>Change Photo</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>Display Name</label>
              <input className="input-glass" defaultValue={user?.name} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>Email</label>
              <input className="input-glass" defaultValue={user?.email} readOnly style={{ opacity: 0.6 }} />
            </div>
          </div>
          <button className="btn-primary btn" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>Save Changes</button>
        </div>

        {/* Subscription */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Subscription</h2>
            {user?.plan === 'free'
              ? <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-on-surface-variant)' }}>FREE</span>
              : <span className="badge badge-premium">Premium</span>
            }
          </div>
          {['🎵 HiFi Lossless Audio', '📥 Offline Downloads', '📢 Ad-Free Experience', '🎧 Unlimited Skips', '📱 Multiple Devices'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-primary)' }}>✓</span> {f}
            </div>
          ))}
          {user?.plan === 'free' && (
            <button className="btn-primary btn" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 8 }}>
              ✨ Upgrade to Premium — $9.99/mo
            </button>
          )}
        </div>

        {/* Appearance */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 16 }}>Appearance</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(color => (
              <div key={color} style={{
                width: 36, height: 36, borderRadius: '50%', background: color, cursor: 'pointer',
                border: color === '#A855F7' ? '3px solid white' : '3px solid transparent',
                transition: 'var(--transition)',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
