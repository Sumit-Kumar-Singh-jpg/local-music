import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { userApi } from '../lib/api'
import { useSyncStore } from '../store/syncStore'
import DeviceSync from '../components/ui/DeviceSync'

const SETTINGS_SECTIONS = ['Account', 'Devices & Sync', 'Playback', 'Appearance']

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore()
  const { connectedDevices, isSyncEnabled, myDeviceName } = useSyncStore()
  const [activeSection, setActiveSection] = useState('Account')
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [accentColor, setAccentColor] = useState('#A855F7')
  const [showDeviceSync, setShowDeviceSync] = useState(false)
  const totalDevices = 1 + connectedDevices.length

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await userApi.updateProfile({ displayName })
      updateUser({
        name: res.user.profile?.displayName || displayName,
      })
      setSaveMsg('Saved successfully!')
    } catch (err: any) {
      setSaveMsg(err.message || 'Failed to save')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleColorChange = (color: string) => {
    setAccentColor(color)
    document.documentElement.style.setProperty('--color-primary', color)
    localStorage.setItem('accent-color', color)
  }

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
        <div style={{ borderTop: '1px solid var(--glass-border)', margin: '12px 0' }} />
        <button
          onClick={logout}
          style={{
            width: '100%', border: 'none', background: 'transparent', textAlign: 'left',
            cursor: 'pointer', padding: '10px 12px', borderRadius: 'var(--radius-md)',
            color: '#EF4444', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500, display: 'block',
          }}
        >
          Log Out
        </button>
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
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={user?.name}
                  style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid', borderColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{user?.name}</div>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>@{user?.username}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>Display Name</label>
                  <input className="input-glass" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>Email</label>
                  <input className="input-glass" defaultValue={user?.email} readOnly style={{ opacity: 0.6 }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn-primary btn" style={{ padding: '10px 24px' }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveMsg && <span style={{ fontSize: '0.85rem', color: saveMsg.includes('success') ? '#10B981' : '#EF4444' }}>{saveMsg}</span>}
              </div>
            </div>

            {/* Subscription */}
            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Subscription</h2>
                <span className={`badge ${user?.billingTier === 'patron' ? 'badge-premium' : ''}`}
                  style={user?.billingTier !== 'patron' ? { background: 'rgba(255,255,255,0.1)', color: 'var(--color-on-surface-variant)' } : {}}>
                  {user?.billingTier === 'patron' ? 'Premium' : 'Free'}
                </span>
              </div>
              {['🎵 HiFi Lossless Audio', '📥 Offline Downloads', '📢 Ad-Free Experience', '🎧 Unlimited Skips', '📱 Multiple Devices'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--color-primary)' }}>✓</span> {f}
                </div>
              ))}
              {user?.billingTier !== 'patron' && (
                <button className="btn-primary btn" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 8 }}>
                  ✨ Upgrade to Premium — Coming Soon
                </button>
              )}
            </div>
          </>
        )}

        {/* NEW FEATURE: Devices & Sync from incoming */}
        {activeSection === 'Devices & Sync' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>This Device</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#A855F7', boxShadow: '0 0 8px rgba(168,85,247,0.6)', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>🌐 {myDeviceName}</span>
                <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--color-primary)', fontSize: '0.65rem' }}>CURRENT</span>
              </div>
            </div>

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

        {activeSection === 'Playback' && (
          <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 16 }}>Playback Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Audio Quality</span>
                <select className="input-glass" style={{ width: 160, padding: '6px 12px' }}>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Lossless</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Crossfade</span>
                <span className="text-secondary">Coming Soon</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Gapless Playback</span>
                <span className="text-secondary">Coming Soon</span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'Appearance' && (
          <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 16 }}>Accent Color</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                <div key={color} onClick={() => handleColorChange(color)} style={{
                  width: 36, height: 36, borderRadius: '50%', background: color, cursor: 'pointer',
                  border: color === accentColor ? '3px solid white' : '3px solid transparent',
                  transition: 'var(--transition)',
                }} />
              ))}
            </div>
            <p className="text-secondary" style={{ marginTop: 12, fontSize: '0.85rem' }}>Changes the primary accent color across the app</p>
          </div>
        )}
      </div>

      {showDeviceSync && <DeviceSync onClose={() => setShowDeviceSync(false)} />}
    </div>
  )
}
