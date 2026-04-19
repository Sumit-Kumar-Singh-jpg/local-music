import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSyncStore } from '../store/syncStore'
import DeviceSync from '../components/ui/DeviceSync'

const SETTINGS_SECTIONS = ['Account', 'Devices & Sync', 'Playback', 'Audio Quality', 'Downloads', 'Appearance', 'Notifications', 'Privacy']

export default function Settings() {
  const { user } = useAuthStore()
  const { connectedDevices, isSyncEnabled, myDeviceName } = useSyncStore()
  const [activeSection, setActiveSection] = useState('Account')
  const [showDeviceSync, setShowDeviceSync] = useState(false)
  const totalDevices = 1 + connectedDevices.length

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 32 }}>
      {/* Left nav */}
      <div className="glass-low" style={{ width: 210, borderRadius: 'var(--radius-xl)', padding: '16px 8px', flexShrink: 0, height: 'fit-content' }}>
        {SETTINGS_SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              width: '100%', border: 'none', background: 'transparent', textAlign: 'left',
              cursor: 'pointer', padding: '10px 12px', borderRadius: 'var(--radius-md)',
              color: s === activeSection ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: s === activeSection ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: 8,
              background: s === activeSection ? 'rgba(168,85,247,0.1)' : 'transparent',
              marginBottom: 2,
            }}
          >
            {s === 'Devices & Sync' && <span>📱</span>}
            {s}
            {s === 'Devices & Sync' && totalDevices > 1 && (
              <span style={{
                marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700,
                background: 'var(--grad-primary)', borderRadius: 'var(--radius-full)',
                padding: '1px 7px', color: '#fff',
              }}>{totalDevices}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
          {activeSection}
        </h1>

        {activeSection === 'Account' && (
          <>
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
          </>
        )}

        {activeSection === 'Devices & Sync' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Overview card */}
            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 6 }}>Connected Devices</h2>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
                  {totalDevices} device{totalDevices !== 1 ? 's' : ''} · Sync is{' '}
                  <span style={{ color: isSyncEnabled ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                    {isSyncEnabled ? 'On' : 'Off'}
                  </span>
                </p>
              </div>
              <button className="btn-primary btn" style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={() => setShowDeviceSync(true)}>
                📱 Manage Devices
              </button>
            </div>

            {/* This device */}
            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>This Device</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#A855F7', boxShadow: '0 0 8px rgba(168,85,247,0.6)', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>🌐 {myDeviceName}</span>
                <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--color-primary)', fontSize: '0.65rem' }}>CURRENT</span>
              </div>
            </div>

            {/* Other devices */}
            {connectedDevices.length > 0 && (
              <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Other Devices</h2>
                {connectedDevices.map(d => (
                  <div key={d.deviceId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.9rem' }}>🌐 {d.deviceName}</span>
                    {d.currentTrack && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
                        {d.currentTrack.isPlaying ? '▶' : '⏸'} {d.currentTrack.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Coming soon: mobile sync */}
            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24, background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.05))' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>📱 Mobile App Sync</h2>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Cross-device sync between web and Android/iOS app coming soon.<br />
                Powered by WebSocket for real-time playback handoff.
              </p>
              <div className="badge" style={{ marginTop: 12, background: 'rgba(168,85,247,0.15)', color: 'var(--color-primary)' }}>Coming Soon</div>
            </div>
          </div>
        )}

        {activeSection === 'Appearance' && (
          <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 16 }}>Accent Color</h2>
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
        )}

        {!['Account', 'Devices & Sync', 'Appearance'].includes(activeSection) && (
          <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '2.5rem' }}>🚧</span>
            <p style={{ fontWeight: 700 }}>{activeSection} settings coming soon</p>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>This section is under development</p>
          </div>
        )}
      </div>

      {showDeviceSync && <DeviceSync onClose={() => setShowDeviceSync(false)} />}
    </div>
  )
}
